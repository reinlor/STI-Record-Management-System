const { getStudentCollection } = require("../models/studentModel.js");

// Controller Function for adding student data 
const addStudent = async (req, res) => {
  try {
    const newStudent = req.body;
    const sid = newStudent.sid;

    await getStudentCollection().doc(sid).set(newStudent);
    
    res.status(201).json({ 
      message: "Student registered successfully", 
      id: sid 
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Controller Function for retrieving student data
const getStudent = async (req, res) => {
  try {
    const snapshot = await getStudentCollection().get();
    const students = snapshot.docs.map((doc) => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    res.status(200).send(students);
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).send({ error: "Failed to fetch students" });
  }
};

// Controller Function for updating student data
const updateStudent = async (req, res) => {
  try {
    const { sid } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No update data provided" });
    }
    const studentRef = getStudentCollection().doc(sid);

    const doc = await studentRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Student not found" });
    }

    await studentRef.set(updates, { merge: true });

    res.status(200).json({ 
      message: "Student updated successfully",
      id: sid,
      updates: updates
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Controller Function for archiving student data (Wala pa)

module.exports = { addStudent, getStudent, updateStudent };