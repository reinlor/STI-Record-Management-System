const { getStudentCollection } = require("../models/studentModel.js");
const Joi = require('joi');

// Student Schema
const studentSchema = Joi.object({
  sid:            Joi.string().required(),

  studentProfile: {
    name:         Joi.string().required(),
    nickname:     Joi.string().required(),
    section:      Joi.string().required(),
    academicLevel:Joi.string().required(),
    age:          Joi.number().required(),
    nationality:  Joi.string().required(),
    gender:       Joi.string().required(),
    status:       Joi.string().required(),
    birthPlace:   Joi.string().required(),
    birthday:     Joi.string().required(),
    religion:     Joi.string().required()
  },

  contactInfo: {
    email:        Joi.string().email().required(),
    contactNo:    Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    homeNo:       Joi.string().required(),
    workNo:       Joi.string().required(),
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
      birthday:    Joi.string().optional(),
      educationalAttainment: Joi.string(),
      occupation:  Joi.string().optional(),
      contactNo:   Joi.string().optional(),
      email:       Joi.string().email().optional()
    },
    motherInfo: {
      name:        Joi.string().optional(),
      age:         Joi.number().optional(),
      nationality: Joi.string().optional(),
      religion:    Joi.string().optional(),
      birthday:    Joi.string().optional(),
      educationalAttainment: Joi.string(),
      occupation:  Joi.string().optional(),
      contactNo:   Joi.string().optional(),
      email:       Joi.string().email().optional()
    },
    guardian: {
      name:        Joi.string().optional(),
      relation:    Joi.string().optional(),
      contactNo:   Joi.string().optional(),
      email:       Joi.string().email().optional()
    },
    address:              Joi.string().optional(),
    statusOfParent:       Joi.string().optional(),
    siblings:             Joi.array().optional(),
    birthOrder:           Joi.string().optional(),
    emergency: {
      name:        Joi.string().optional(),
      contactNo:   Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).optional()
    }
  },

  educationalBackground: {
    dateEnrolled:    Joi.date().optional(),
    seniorHighSchool: {
      schoolName:    Joi.string().optional(),
      dateEnrolled:  Joi.string().optional()
    },
    juniorHighSchool: {
      schoolName:    Joi.string().optional(),
      dateEnrolled:  Joi.string().optional()
    },
    elementary: {
      schoolName:    Joi.string().optional(),
      dateEnrolled:  Joi.string().optional()
    },
    college: {
      schoolName:    Joi.string().optional(),
      dateEnrolled:  Joi.string().optional()
    },
    extraCurricular: Joi.string().optional(),
    awards:          Joi.string().optional(),
    likedSubject:    Joi.string().optional(),
    leastSubject:    Joi.string().optional()               
  },

  workExperience:{
    name:          Joi.string().optional(),
    duration:      Joi.string().optional(),
    description:   Joi.string().optional(),
    contactNo:     Joi.string().optional(),
    email:         Joi.string().email().optional()
  },

  interests:{
    sports:         Joi.string().optional(),
    hobbies:        Joi.string().optional(),
    talents:        Joi.string().optional(),
    socioCivic:     Joi.string().optional(),
    organization:   Joi.string().optional(),
  },

  health: {
    hospitalized:   Joi.string().optional(),
    reason:         Joi.string().optional(),
    operation:      Joi.string().optional(),
    illness:        Joi.string().optional(),
    medicalCert:    Joi.string().optional(),
    prescribedDrug: Joi.string().optional(),
    hereditary:     Joi.string().optional(),
    doctorLastSeen: Joi.string().optional(),
  },

  lifeCircumstances: {
    recentLoss:     Joi.string().optional(),
    currentConcern: Joi.string().optional(),
  }
})

const updateSchema = Joi.object({
  sid:            Joi.string().optional(),

  studentProfile: {
    name:         Joi.string().optional(),
    nickname:     Joi.string().optional(),
    section:      Joi.string().optional(),
    academicLevel:Joi.string().optional(),
    age:          Joi.number().optional(),
    nationality:  Joi.string().optional(),
    gender:       Joi.string().optional(),
    status:       Joi.string().optional(),
    birthPlace:   Joi.string().optional(),
    birthday:     Joi.string().optional(),
    religion:     Joi.string().optional()
  },

  contactInfo: {
    email:        Joi.string().email().required(),
    contactNo:    Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    homeNo:       Joi.string().optional(),
    workNo:       Joi.string().optional(),
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
      birthday:    Joi.string().optional(),
      educationalAttainment: Joi.string(),
      occupation:  Joi.string().optional(),
      contactNo:   Joi.string().optional(),
      email:       Joi.string().email().optional()
    },
    motherInfo: {
      name:        Joi.string().optional(),
      age:         Joi.number().optional(),
      nationality: Joi.string().optional(),
      religion:    Joi.string().optional(),
      birthday:    Joi.string().optional(),
      educationalAttainment: Joi.string(),
      occupation:  Joi.string().optional(),
      contactNo:   Joi.string().optional(),
      email:       Joi.string().email().optional()
    },
    guardian: {
      name:        Joi.string().optional(),
      relation:    Joi.string().optional(),
      contactNo:   Joi.string().optional(),
      email:       Joi.string().email().optional()
    },
    address:              Joi.string().optional(),
    monthlyFamilyIncome:  Joi.number().optional(),
    statusOfParent:       Joi.string().optional(),
    siblings:             Joi.array().optional(),
    birthOrder:           Joi.string().optional(),
    emergency: {
      name:        Joi.string().optional(),
      contactNo:   Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).optional()
    }
  },

  educationalBackground: {
    dateEnrolled:    Joi.date().optional(),
    seniorHighSchool: {
      schoolName:    Joi.string().optional(),
      dateEnrolled:  Joi.string().optional()
    },
    juniorHighSchool: {
      schoolName:    Joi.string().optional(),
      dateEnrolled:  Joi.string().optional()
    },
    elementary: {
      schoolName:    Joi.string().optional(),
      dateEnrolled:  Joi.string().optional()
    },
    college: {
      schoolName:    Joi.string().optional(),
      dateEnrolled:  Joi.string().optional()
    },
    extraCurricular: Joi.array().optional(),
    awards:          Joi.array().optional(),
    likedSubject:    Joi.string().optional(),
    leastSubject:    Joi.string().optional()               
  },

  workExperience:{
    name:          Joi.string().optional(),
    duration:      Joi.string().optional(),
    description:   Joi.string().optional(),
    contactNo:     Joi.string().optional(),
    email:         Joi.string().email().optional()
  },

  Interests:{
    sports:         Joi.string().optional(),
    hobbies:        Joi.string().optional(),
    talents:        Joi.string().optional(),
    socioCivic:     Joi.string().optional(),
    organization:   Joi.string().optional(),
  },

  health: {
    hospitalized:   Joi.string().optional(),
    reason:         Joi.string().optional(),
    operation:      Joi.string().optional(),
    illness:        Joi.string().optional(),
    medicalCert:    Joi.string().optional(),
    prescribedDrug: Joi.string().optional(),
    hereditary:     Joi.string().optional(),
    doctorLastSeen: Joi.string().optional(),
  },

  lifeCircumstances: {
    recentLoss:     Joi.string().optional(),
    currentConcern: Joi.string().optional(),
  }
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