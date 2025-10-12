const admin = require('firebase-admin');
const db = admin.firestore();

// Function to restore data from a backup
exports.restoreBackup = async (req, res) => {
    console.log('🔄 Restore request received...');
    let backupData = req.body?.backupData || null;
    const backupId = req.body?.backupId || null;

    try {
        if (!backupData) {
            let backupQuery;

            if (backupId) {
                console.log(`📂 Looking for specific backup ID: ${backupId}`);
                const doc = await db.collection('backups').doc(backupId).get();
                if (!doc.exists) {
                    console.warn('⚠️ Requested backup not found.');
                    return res.status(404).send('Requested backup not found');
                }
                backupData = doc.data().data;
            } else {
                console.log('🕐 No backup ID provided — fetching latest active backup...');
                let active = await db.collection('backups').where('status', '==', 'active').orderBy('createdAt', 'desc').limit(1).get();

                if (active.empty) {
                    console.log('No active backup found, trying latest by createdAt...');
                    active = await db.collection('backups').orderBy('createdAt', 'desc').limit(1).get();
                }

                if (active.empty) {
                    console.warn('⚠️ No backups available in Firestore.');
                    return res.status(404).send('No backups available to restore');
                }

                const latestDoc = active.docs[0];
                backupData = latestDoc.data().data;
                console.log(`✅ Using backup ID: ${latestDoc.id}`);
            }
        }

        if (!backupData || typeof backupData !== 'object') {
            console.error('❌ Backup data is invalid or empty');
            return res.status(400).send('Backup data invalid');
        }

        const batch = db.batch();
        let docCount = 0;

        for (const [collectionName, docs] of Object.entries(backupData)) {
            if (!Array.isArray(docs)) continue;

            for (const doc of docs) {
                if (!doc?.id) continue;
                const ref = db.collection(collectionName).doc(doc.id);
                batch.set(ref, doc.data || {});
                docCount++;

                if (docCount % 490 === 0) {
                    console.log('⚠️ Splitting large restore into multiple batches...');
                    await batch.commit();
                }
            }
        }

        await batch.commit();

        await db.collection('backupLogs').add({
            time: admin.firestore.FieldValue.serverTimestamp(),
            status: 'restored',
        });

        console.log(`✅ Restore completed successfully (${docCount} documents restored).`);
        return res.status(200).send('Restore completed successfully');
    } catch (error) {
        console.error('❌ Error restoring backup:', error);
        return res.status(500).send(`Error restoring backup: ${error.message}`);
    }
};

// Get available backups
exports.getAvailableBackups = async (req, res) => {
    try {
        const snapshot = await db.collection('backups').orderBy('createdAt', 'desc').get();
        const backups = snapshot.docs.map(doc => ({
            id: doc.id,
            status: doc.data().status,
            createdAt: doc.data().createdAt?.toDate?.() || null,
        }));
        return res.status(200).json(backups);
    } catch (error) {
        console.error('Error fetching backups:', error);
        return res.status(500).json({ error: 'Failed to fetch backups' });
    }
};

// Get specific backup data
exports.getBackupData = async (req, res) => {
    const { backupId } = req.params;
    try {
        const doc = await db.collection('backups').doc(backupId).get();
        if (!doc.exists) {
            return res.status(404).send('Backup not found');
        }
        return res.status(200).json(doc.data());
    } catch (error) {
        console.error('Error getting backup data:', error);
        return res.status(500).json({ error: 'Failed to get backup data' });
    }
};
