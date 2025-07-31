const { getStudentCollection } = require("../../main/models/studentModel");
const { getUserCollection } = require("../../main/models/userModel");
// Add other collections as needed

// Export (Backup) Data
const exportData = async (req, res) => {
  try {
    const studentsSnap = await getStudentCollection().get();
    const usersSnap = await getUserCollection().get();
    // Add other collections...

    const data = {
      students: studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      users: usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      // Add other collections...
    };

    res.setHeader('Content-Disposition', 'attachment; filename=backup.json');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 2));
  } catch (error) {
    res.status(500).send({ error: "Backup failed", details: error.message });
  }
};

// Import (Restore) Data
const importData = async (req, res) => {
  try {
    const backup = req.file;
    if (!backup) return res.status(400).send({ error: "No file uploaded" });

    const data = JSON.parse(backup.buffer.toString());

    for (const student of data.students || []) {
      await getStudentCollection().doc(student.id).set(student);
    }
    for (const user of data.users || []) {
      await getUserCollection().doc(user.id).set(user);
    }
    // Add other collections...

    res.status(200).send({ message: "Restore successful" });
  } catch (error) {
    res.status(500).send({ error: "Restore failed", details: error.message });
  }
};

module.exports = { exportData, importData };