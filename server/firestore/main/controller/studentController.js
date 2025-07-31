const { getStudentCollection } = require("../models/studentModel.js");
const Joi = require('joi');

// Student Schema
const studentSchema = Joi.object({
  sid: Joi.string().required(),

  studentProfile: Joi.object({
    name: Joi.string().required(),
    nickname: Joi.string().required(),
    section: Joi.string().required(),
    academicLevel: Joi.string().required(),
    age: Joi.number().required(),
    nationality: Joi.string().required(),
    gender: Joi.string().required(),
    status: Joi.string().required(),
    birthPlace: Joi.string().required(),
    birthday: Joi.string().required(),
    religion: Joi.string().required()
  }).required(),

  contactInfo: Joi.object({
    email: Joi.string().email().required(),
    contactNo: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).empty(''),
    homeNo: Joi.string().required(),
    workNo: Joi.string().required(),
    address: Joi.object({
      permanentAddress: Joi.string().required(),
      currentAddress: Joi.string().required(),
      provincialAddress: Joi.string().empty('').optional()
    }).required()
  }).required(),

  familyBackground: Joi.object({
    fatherInfo: Joi.object({
      name: Joi.string().empty('').optional(),
      age: Joi.number().optional(),
      nationality: Joi.string().empty('').optional(),
      religion: Joi.string().empty('').optional(),
      birthday: Joi.string().empty('').optional(),
      educationalAttainment: Joi.string().empty('').optional(),
      occupation: Joi.string().empty('').optional(),
      contactNo: Joi.string().empty('').optional(),
      email: Joi.string().email().empty('').optional()
    }).empty({}).optional(),

    motherInfo: Joi.object({
      name: Joi.string().empty('').optional(),
      age: Joi.number().optional(),
      nationality: Joi.string().empty('').optional(),
      religion: Joi.string().empty('').optional(),
      birthday: Joi.string().empty('').optional(),
      educationalAttainment: Joi.string().empty('').optional(),
      occupation: Joi.string().empty('').optional(),
      contactNo: Joi.string().empty('').optional(),
      email: Joi.string().email().empty('').optional()
    }).empty({}).optional(),

    guardian: Joi.object({
      name: Joi.string().empty('').optional(),
      relation: Joi.string().empty('').optional(),
      contactNo: Joi.string().empty('').optional(),
      email: Joi.string().email().empty('').optional()
    }).empty({}).optional(),

    address: Joi.string().empty('').optional(),
    monthlyFamilyIncome: Joi.number().optional(),
    statusOfParent: Joi.string().empty('').optional(),
    siblings: Joi.array().items(Joi.any()).optional(),
    birthOrder: Joi.string().empty('').optional(),
    
    emergency: Joi.object({
      name: Joi.string().empty('').optional(),
      contactNo: Joi.string().empty('').optional()
    }).empty({}).optional()
  }).empty({}).optional(),

  educationalBackground: Joi.object({
    dateEnrolled: Joi.date().empty('').optional(),
    seniorHighSchool: Joi.object({
      schoolName: Joi.string().empty('').optional(),
      dateEnrolled: Joi.string().empty('').optional()
    }).empty({}).optional(),
    juniorHighSchool: Joi.object({
      schoolName: Joi.string().empty('').optional(),
      dateEnrolled: Joi.string().empty('').optional()
    }).empty({}).optional(),
    elementary: Joi.object({
      schoolName: Joi.string().empty('').optional(),
      dateEnrolled: Joi.string().empty('').optional()
    }).empty({}).optional(),
    college: Joi.object({
      schoolName: Joi.string().empty('').optional(),
      dateEnrolled: Joi.string().empty('').optional()
    }).empty({}).optional(),
    extraCurricular: Joi.string().empty('').optional(),
    awards: Joi.string().empty('').optional(),
    likedSubject: Joi.string().empty('').optional(),
    leastSubject: Joi.string().empty('').optional()
  }).empty({}).optional(),

  workExperience: Joi.object({
    name: Joi.string().empty('').optional(),
    duration: Joi.string().empty('').optional(),
    description: Joi.string().empty('').optional(),
    contactNo: Joi.string().empty('').optional(),
    email: Joi.string().email().empty('').optional()
  }).empty({}).optional(),

  interests: Joi.object({
    sports: Joi.string().empty('').optional(),
    hobbies: Joi.string().empty('').optional(),
    talents: Joi.string().empty('').optional(),
    socioCivic: Joi.string().empty('').optional(),
    organization: Joi.string().empty('').optional(),
  }).empty({}).optional(),

  health: Joi.object({
    hospitalized: Joi.string().empty('').optional(),
    reason: Joi.string().empty('').optional(),
    operation: Joi.string().empty('').optional(),
    illness: Joi.string().empty('').optional(),
    medicalCert: Joi.string().empty('').optional(),
    prescribedDrug: Joi.string().empty('').optional(),
    hereditary: Joi.string().empty('').optional(),
    doctorLastSeen: Joi.string().empty('').optional(),
  }).empty({}).optional(),

  lifeCircumstances: Joi.object({
    recentLoss: Joi.string().empty('').optional(),
    currentConcern: Joi.string().empty('').optional(),
  }).empty({}).optional()
});

const updateSchema = Joi.object({
  sid: Joi.string().empty('').optional(),

  studentProfile: Joi.object({
    name: Joi.string().empty('').optional(),
    nickname: Joi.string().empty('').optional(),
    section: Joi.string().empty('').optional(),
    academicLevel: Joi.string().empty('').optional(),
    age: Joi.number().optional(),
    nationality: Joi.string().empty('').optional(),
    gender: Joi.string().empty('').optional(),
    status: Joi.string().empty('').optional(),
    birthPlace: Joi.string().empty('').optional(),
    birthday: Joi.string().empty('').optional(),
    religion: Joi.string().empty('').optional()
  }).empty({}).optional(),

  contactInfo: Joi.object({
    email: Joi.string().email().empty('').optional(),
    contactNo: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).empty('').optional(),
    homeNo: Joi.string().empty('').optional(),
    workNo: Joi.string().empty('').optional(),
    address: Joi.object({
      permanentAddress: Joi.string().empty('').optional(),
      currentAddress: Joi.string().empty('').optional(),
      provincialAddress: Joi.string().empty('').optional()
    }).empty({}).optional()
  }).empty({}).optional(),

  familyBackground: Joi.object({
    fatherInfo: Joi.object({
      name: Joi.string().empty('').optional(),
      age: Joi.number().optional(),
      nationality: Joi.string().empty('').optional(),
      religion: Joi.string().empty('').optional(),
      birthday: Joi.string().empty('').optional(),
      educationalAttainment: Joi.string().empty('').optional(),
      occupation: Joi.string().empty('').optional(),
      contactNo: Joi.string().empty('').optional(),
      email: Joi.string().email().empty('').optional()
    }).empty({}).optional(),
    motherInfo: Joi.object({
      name: Joi.string().empty('').optional(),
      age: Joi.number().optional(),
      nationality: Joi.string().empty('').optional(),
      religion: Joi.string().empty('').optional(),
      birthday: Joi.string().empty('').optional(),
      educationalAttainment: Joi.string().empty('').optional(),
      occupation: Joi.string().empty('').optional(),
      contactNo: Joi.string().empty('').optional(),
      email: Joi.string().email().empty('').optional()
    }).empty({}).optional(),
    guardian: Joi.object({
      name: Joi.string().empty('').optional(),
      relation: Joi.string().empty('').optional(),
      contactNo: Joi.string().empty('').optional(),
      email: Joi.string().email().empty('').optional()
    }).empty({}).optional(),
    address: Joi.string().empty('').optional(),
    monthlyFamilyIncome: Joi.number().optional(),
    statusOfParent: Joi.string().empty('').optional(),
    siblings: Joi.array().items(Joi.any()).optional(),
    birthOrder: Joi.string().empty('').optional(),
    emergency: Joi.object({
      name: Joi.string().empty('').optional(),
      contactNo: Joi.string().empty('').optional()
    }).empty({}).optional()
  }).empty({}).optional(),

  educationalBackground: Joi.object({
    dateEnrolled: Joi.date().empty('').optional(),
    seniorHighSchool: Joi.object({
      schoolName: Joi.string().empty('').optional(),
      dateEnrolled: Joi.string().empty('').optional()
    }).empty({}).optional(),
    juniorHighSchool: Joi.object({
      schoolName: Joi.string().empty('').optional(),
      dateEnrolled: Joi.string().empty('').optional()
    }).empty({}).optional(),
    elementary: Joi.object({
      schoolName: Joi.string().empty('').optional(),
      dateEnrolled: Joi.string().empty('').optional()
    }).empty({}).optional(),
    college: Joi.object({
      schoolName: Joi.string().empty('').optional(),
      dateEnrolled: Joi.string().empty('').optional()
    }).empty({}).optional(),
    extraCurricular: Joi.string().empty('').optional(),
    awards: Joi.string().empty('').optional(),
    likedSubject: Joi.string().empty('').optional(),
    leastSubject: Joi.string().empty('').optional()
  }).empty({}).optional(),

  workExperience: Joi.object({
    name: Joi.string().empty('').optional(),
    duration: Joi.string().empty('').optional(),
    description: Joi.string().empty('').optional(),
    contactNo: Joi.string().empty('').optional(),
    email: Joi.string().email().empty('').optional()
  }).empty({}).optional(),

  interests: Joi.object({
    sports: Joi.string().empty('').optional(),
    hobbies: Joi.string().empty('').optional(),
    talents: Joi.string().empty('').optional(),
    socioCivic: Joi.string().empty('').optional(),
    organization: Joi.string().empty('').optional(),
  }).empty({}).optional(),

  health: Joi.object({
    hospitalized: Joi.string().empty('').optional(),
    reason: Joi.string().empty('').optional(),
    operation: Joi.string().empty('').optional(),
    illness: Joi.string().empty('').optional(),
    medicalCert: Joi.string().empty('').optional(),
    prescribedDrug: Joi.string().empty('').optional(),
    hereditary: Joi.string().empty('').optional(),
    doctorLastSeen: Joi.string().empty('').optional(),
  }).empty({}).optional(),

  lifeCircumstances: Joi.object({
    recentLoss: Joi.string().empty('').optional(),
    currentConcern: Joi.string().empty('').optional(),
  }).empty({}).optional()
});

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