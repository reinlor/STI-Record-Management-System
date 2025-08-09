const { getStudentCollection } = require('../models/studentModel');
const { admin } = require('../../../firebase');

const batchUpdateSection = async (req, res) => {
  try {
    const scheduleSnap = await admin.firestore().collection('batchSchedules')
      .where('updateType', '==', 'sectionReset')
      .limit(1)
      .get();
    if (scheduleSnap.empty) {
      return res.status(404).json({ error: "No batch schedule found." });
    }

    const scheduleDoc = scheduleSnap.docs[0].data();
    const scheduledDate = new Date(scheduleDoc.scheduledDate);
    const now = new Date();

    if (now < scheduledDate) {
      return res.status(400).json({ error: "Batch update not yet scheduled." });
    }

    // Get all students
    const studentsSnap = await getStudentCollection().get();
    const batch = admin.firestore().batch();

    studentsSnap.forEach(doc => {
      const ref = doc.ref;
      batch.update(ref, {
        "studentProfile.section": "not enrolled"
      });
    });

    await batch.commit();

    res.json({ message: "Batch update completed.", updatedCount: studentsSnap.size });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const batchUpdateDate = async (req, res) => {
  const { updateType, scheduledDate } = req.body;
  try {
    const ref = admin.firestore().collection('batchSchedules').doc(updateType);
    await ref.set({ updateType, scheduledDate }, { merge: true });
    res.json({ message: "Schedule set." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { batchUpdateSection, batchUpdateDate };