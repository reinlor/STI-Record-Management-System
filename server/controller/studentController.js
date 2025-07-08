const { getStudentCollection } = require("../models/studentModel.js");
const Joi = require('joi');

// Student Schema
const studentSchema = Joi.object({
  sid:            Joi.string().required(),

  studentProfile: {
    name:         Joi.string().required(),
    section:      Joi.string().required(),
    age:          Joi.number().required(),
    nationality:  Joi.string().required(),
    gender:       Joi.string().required(),
    status:       Joi.string().required(),
    birthPlace:   Joi.string().required(),
    birthday:     Joi.date().required(),
    religion:     Joi.string().required()
  },

  contactInfo: {
    email:        Joi.string().email().required(),
    contactNo:    Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    address: {
      permanentAddress:  Joi.string().required(),
      currentAddress:    Joi.string().required(),
      provincialAddress: Joi.string().optional()
    }
  },

  familyBackground:{
    fatherInfo: {
      name:        Joi.string().optional(),
      age:         Joi.number().optional(),
      nationality: Joi.string().optional(),
      religion:    Joi.string().optional(),
      educationalAttainment: Joi.string(),
      occupation:  Joi.string().optional(),
      company:     Joi.string().optional()
    },
    motherInfo: {
      name:        Joi.string().optional(),
      age:         Joi.number().optional(),
      nationality: Joi.string().optional(),
      religion:    Joi.string().optional(),
      educationalAttainment: Joi.string(),
      occupation:  Joi.string().optional(),
      company:     Joi.string().optional()
    },
    monthlyFamilyIncome: Joi.number().optional(),
    statusOfParent:       Joi.string().optional(),
    siblingOrder:         Joi.array().optional(),
    emergency: {
      name:        Joi.string().optional(),
      contactNo:   Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).optional()
    }
  },

  educationalBackground: {
    dateEnrolled:  Joi.date().optional(),
    seniorHighSchool: {
      schoolName:  Joi.string().optional(),
      dateEnrolled:Joi.date().optional(),
      withHonors:  Joi.boolean().optional()
    },
    juniorHighSchool: {
      schoolName:  Joi.string().optional(),
      dateEnrolled:Joi.date().optional(),
      withHonors:  Joi.boolean().optional()
    },
    elementary: {
      schoolName:  Joi.string().optional(),
      dateEnrolled:Joi.date().optional(),
      withHonors:  Joi.boolean().optional()
    },
  },

  hobbies:         Joi.array().optional(),

  health: {
    currentConcerns: Joi.array().optional(),
    otherConcerns:  Joi.string().optional()
  },

  lifeCircumstances: Joi.array().optional()
})

const updateSchema = Joi.object({
  sid:            Joi.string().optional(),

  studentProfile: {
    name:         Joi.string().optional(),
    section:      Joi.string().optional(),
    age:          Joi.number().optional(),
    nationality:  Joi.string().optional(),
    gender:       Joi.string().optional(),
    status:       Joi.string().optional(),
    birthPlace:   Joi.string().optional(),
    birthday:     Joi.date().optional(),
    religion:     Joi.string().optional()
  },

  contactInfo: {
    email:        Joi.string().email().required(),
    contactNo:    Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    address: {
      permanentAddress:  Joi.string().required(),
      currentAddress:    Joi.string().required(),
      provincialAddress: Joi.string().optional()
    }
  },

  familyBackground:{
    fatherInfo: {
      name:        Joi.string().optional(),
      age:         Joi.number().optional(),
      nationality: Joi.string().optional(),
      religion:    Joi.string().optional(),
      educationalAttainment: Joi.string(),
      occupation:  Joi.string().optional(),
      company:     Joi.string().optional()
    },
    motherInfo: {
      name:        Joi.string().optional(),
      age:         Joi.number().optional(),
      nationality: Joi.string().optional(),
      religion:    Joi.string().optional(),
      educationalAttainment: Joi.string(),
      occupation:  Joi.string().optional(),
      company:     Joi.string().optional()
    },
    monthlyFamilyIncome: Joi.number().optional(),
    statusOfParent:       Joi.string().optional(),
    siblingOrder:         Joi.array().optional(),
    emergency: {
      name:        Joi.string().optional(),
      contactNo:   Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).optional()
    }
  },

  educationalBackground: {
    dateEnrolled:  Joi.date().optional(),
    seniorHighSchool: {
      schoolName:  Joi.string().optional(),
      dateEnrolled:Joi.date().optional(),
      withHonors:  Joi.boolean().optional()
    },
    juniorHighSchool: {
      schoolName:  Joi.string().optional(),
      dateEnrolled:Joi.date().optional(),
      withHonors:  Joi.boolean().optional()
    },
    elementary: {
      schoolName:  Joi.string().optional(),
      dateEnrolled:Joi.date().optional(),
      withHonors:  Joi.boolean().optional()
    },
  },

  hobbies:         Joi.array().optional(),

  health: {
    currentConcerns: Joi.array().optional(),
    otherConcerns:  Joi.string().optional()
  },

  lifeCircumstances: Joi.array().optional()
})

// Controller Function for adding student data 
const addStudent = async (req, res) => {
  try {
    studentSchema.validate(req.body);

    const { error, value: newStudent } = studentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
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
    const { error, value: validatedUpdates } = updateSchema.validate(updates);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const studentRef = getStudentCollection().doc(sid);

    const doc = await studentRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Student not found" });
    }

    await studentRef.set(validatedUpdates, { merge: true });

    res.status(200).json({
      message: "Student updated successfully",
      id: sid,
      updates: validatedUpdates
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Controller Function for archiving student data (Wala pa)

module.exports = { addStudent, getStudent, updateStudent };