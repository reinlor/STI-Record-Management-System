const Joi = require('joi');
const { getTeacherCollection } = require("../models/teacherModel");

// Teacher Schema
const teacherSchema = Joi.object({
  uid:      Joi.string().required(),
  name:     Joi.string().required(),
  email:    Joi.string().email({ 
                         minDomainSegments: 2, 
                        tlds: { 
                        llow: ['com', 'net'] } }),
});

const updateSchema = Joi.object({
  uid:      Joi.string().optional(),
  name:     Joi.string().optional(),
  email:    Joi.string().email({ 
                         minDomainSegments: 2, 
                        tlds: { 
                        llow: ['com', 'net'] } }).optional(),
});

// Controller function for adding a teacher
const addTeacher = async (req, res) => {
  try {
    teacherSchema.validate(req.body);

    const { error, value: newTeacher } = teacherSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const uid = newTeacher.uid;
    await getTeacherCollection().doc(uid).set(newTeacher);
    
    res.status(201).json({ 
      message: "Teacher registered successfully", 
      id: uid 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller Function for updating a teacher profile
const updateTeacher = async (req, res) => {
  try {
    const { uid } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No update data provided" });
    }
    const { error, value: validatedUpdates } = updateSchema.validate(updates);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const teacherRef = getTeacherCollection().doc(uid);

    const doc = await teacherRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    await teacherRef.set(validatedUpdates, { merge: true });

    res.status(200).json({
      message: "Teacher updated successfully",
      id: uid,
      updates: validatedUpdates
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller function for retrieving teacher data
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
