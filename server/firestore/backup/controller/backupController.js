const admin = require('firebase-admin');
const { format } = require('../utils/utils');
const db = admin.firestore();

exports.runBackup = async () => {
  try {
    console.log('Starting backup...');

    const collections = await db.listCollections();
    const backupData = {};

    for (const collection of collections) {
      if (['backups', 'backupLogs', 'backupSettings'].includes(collection.id)) continue;

      const snapshot = await collection.get();
      backupData[collection.id] = snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data(),
      }));
    }

    const timestamp = format(new Date());
    const backupRef = db.collection('backups').doc(timestamp);

    const existingActive = await db.collection('backups').where('status', '==', 'active').get();
    if (!existingActive.empty) {
      const batch = db.batch();
      existingActive.forEach(doc => {
        batch.update(doc.ref, { status: 'expired' });
      });
      await batch.commit();
      console.log(`Expired ${existingActive.size} previous backup(s).`);
    }

    await backupRef.set({
      data: backupData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active',
    });

    await db.collection('backupLogs').add({
      time: admin.firestore.FieldValue.serverTimestamp(),
      status: 'success',
      backupId: timestamp,
    });

    console.log('✅ Backup completed successfully:', timestamp);
    return { success: true, timestamp };
  } catch (error) {
    console.error('❌ Error creating backup:', error);

    try {
      await db.collection('backupLogs').add({
        time: admin.firestore.FieldValue.serverTimestamp(),
        status: 'failed',
        error: error.message,
      });
    } catch (logErr) {
      console.error('Failed to log backup failure:', logErr);
    }

    return { success: false, error: error.message || 'Unknown error' };
  }
};

// HTTP handler
exports.backupData = async (req, res) => {
  const result = await exports.runBackup();
  if (result.success) {
    return res.status(200).json({
      message: 'Backup created successfully',
      timestamp: result.timestamp,
    });
  } else {
    return res.status(500).json({
      error: result.error || 'Failed to create backup',
    });
  }
};

exports.getBackupLogs = async (req, res) => {
  try {
    const logsSnapshot = await db
      .collection('backupLogs')
      .orderBy('time', 'desc')
      .limit(10)
      .get();

    const logs = logsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        time: data.time?.toDate ? data.time.toDate() : new Date(data.time),
        status: data.status,
        backupId: data.backupId || null,
        error: data.error || null,
      };
    });

    res.status(200).json(logs);
  } catch (error) {
    console.error('Error getting backup logs:', error);
    res.status(500).json({ error: 'Failed to get backup logs' });
  }
};

exports.getBackupSchedule = async (req, res) => {
  try {
    const scheduleDoc = await db.collection('backupSettings').doc('schedule').get();
    const scheduleData = scheduleDoc.exists ? scheduleDoc.data() : null;

    if (scheduleData) {
      res.status(200).json({
        schedule: scheduleData.schedule,
        nextBackup: scheduleData.nextBackup || null,
      });
    } else {
      res.status(200).json({ schedule: 'none', nextBackup: null });
    }
  } catch (error) {
    console.error('Error getting backup schedule:', error);
    res.status(500).json({ error: 'Failed to get backup schedule' });
  }
};

exports.setBackupSchedule = async (req, res) => {
  const { schedule } = req.body;
  const validSchedules = ['none', '3hours', '12hours', 'daily', 'weekly'];
  if (!validSchedules.includes(schedule)) {
    return res.status(400).json({ error: 'Invalid schedule value' });
  }

  try {
    let nextBackup = null;
    if (schedule !== 'none') {
      const now = new Date();
      switch (schedule) {
        case '3hours': now.setHours(now.getHours() + 3); break;
        case '12hours': now.setHours(now.getHours() + 12); break;
        case 'daily': now.setDate(now.getDate() + 1); break;
        case 'weekly': now.setDate(now.getDate() + 7); break;
      }
      nextBackup = now.toISOString();
    }

    await db.collection('backupSettings').doc('schedule').set({ schedule, nextBackup });
    res.status(200).json({
      message: 'Backup schedule updated successfully',
      schedule,
      nextBackup,
    });
  } catch (error) {
    console.error('Error setting backup schedule:', error);
    res.status(500).json({ error: 'Failed to set backup schedule' });
  }
};
