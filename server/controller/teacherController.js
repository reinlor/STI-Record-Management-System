const admin = require("../firebase");

const { getTeacherCollection } = require("../models/teacherModel");

const addTeacher = async (req, res) => {
  try {
    const newTeacher = req.body;
    const uid = newTeacher.uid;

    await getTeacherCollection().doc(uid).set(newTeacher);

    res.status(201).json({
      message: `Teacher registered successfully`,
      uid: uid,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const { uid } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No update data provided" });
    }

    const teacherDocRef = getTeacherCollection().doc(uid);

    const snapshot = await teacherDocRef.get();

    if (!snapshot.exists) {
      return res
        .status(404)
        .json({ error: `There's no teacher with a UID of ${uid}` });
    }

    await teacherDocRef.set(updates, { merge: true });

    res.status(200).json({
      message: `Teacher updated successfully.`,
      uid: uid,
      updates: updates,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTeachers = async (req, res) => {
  try {
    const snapshot = await getTeacherCollection().get();

    const teachers = snapshot.docs.map((teacher) => ({
      id: teacher.id,
      ...teacher.data(),
    }));

    res.status(201).json(teachers);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = { addTeacher, updateTeacher, getTeachers };
