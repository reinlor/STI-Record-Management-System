const { getStudentCollection } = require("../models/studentModel.js");
const { getUserCollection } = require("../models/userModel.js");
const { getNotificationCollection } = require("../models/notificationModel.js");
const admin = require("firebase-admin");
const Joi = require("joi");

const cloudinary = require("../../../config/cloudinary.js");
const fs = require("fs");

// Student Schema
const studentSchema = Joi.object({
  sid: Joi.string().required(),
  isArchived: Joi.boolean().required().default(false),

  studentProfile: Joi.object({
    name: Joi.string().required(),
    nickname: Joi.string().empty('').optional(),
    section: Joi.string().required(),
    academicLevel: Joi.string().required(),
    nationality: Joi.string().empty('').optional(),
    gender: Joi.string().required(),
    status: Joi.string().empty('').optional(),
    birthPlace: Joi.string().empty('').optional(),
    birthday: Joi.string().required(),
    religion: Joi.string().empty('').optional(),
    program: Joi.string().required()
  }).required(),

  contactInfo: Joi.object({
    email: Joi.string().email().required(),
    contactNo: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).empty('').required(),
    homeNo: Joi.string().empty('').optional(),
    workNo: Joi.string().empty('').optional(),
    address: Joi.object({
      permanentAddress: Joi.string().empty('').optional(),
      currentAddress: Joi.string().empty('').required(),
      provincialAddress: Joi.string().empty('').optional()
    }).required()
  }).required(),

  familyBackground: Joi.object({
    fatherInfo: Joi.object({
      name: Joi.string().empty('').optional(),
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
    siblings: Joi.array().items(Joi.string()).optional().default([]),
    birthOrder: Joi.string().empty('').optional(),

    emergency: Joi.object({
      name: Joi.string().empty('').optional(),
      contactNo: Joi.string().empty('').optional()
    }).empty({}).optional()
  }).empty({}).optional(),

  educationalBackground: Joi.object({
    // dateEnrolled: Joi.date().empty('').optional(),
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
    extraCurricular: Joi.array().items(Joi.string()).empty('').optional().default([]),
    awards: Joi.array().items(Joi.string()).empty('').optional().default([]),
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
    sports: Joi.array().items(Joi.string()).empty('').optional().default([]),
    hobbies: Joi.array().items(Joi.string()).empty('').optional().default([]),
    talents: Joi.array().items(Joi.string()).empty('').optional().default([]),
    socioCivic: Joi.array().items(Joi.string()).empty('').optional().default([]),
    organization: Joi.array().items(Joi.string()).empty('').optional().default([]),
  }).empty({}).optional(),

  health: Joi.object({
    hospitalized: Joi.array().items(Joi.string()).empty('').optional().default([]),
    reason: Joi.array().items(Joi.string()).empty('').optional().default([]),
    operation: Joi.array().items(Joi.string()).empty('').optional().default([]),
    illness: Joi.array().items(Joi.string()).empty('').optional().default([]),
    medicalCert: Joi.array().items(Joi.string()).empty('').optional().default([]),
    prescribedDrug: Joi.array().items(Joi.string()).empty('').optional().default([]),
    hereditary: Joi.array().items(Joi.string()).empty('').optional().default([]),
    doctorLastSeen: Joi.array().items(Joi.string()).empty('').optional().default([]),
  }).empty({}).optional(),

  lifeCircumstances: Joi.object({
    recentLoss: Joi.string().empty('').optional(),
    currentConcern: Joi.string().empty('').optional(),
  }).empty({}).optional()
});

const updateSchema = Joi.object({
  sid: Joi.string().empty('').optional(),
  isArchived: Joi.boolean().optional(),

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
    religion: Joi.string().empty('').optional(),
    program: Joi.string().empty('').optional()
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
    siblings: Joi.array().items(Joi.string()).optional(),
    birthOrder: Joi.string().empty('').optional(),
    emergency: Joi.object({
      name: Joi.string().empty('').optional(),
      contactNo: Joi.string().empty('').optional()
    }).empty({}).optional()
  }).empty({}).optional(),

  educationalBackground: Joi.object({
    // dateEnrolled: Joi.date().empty('').optional(),
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
    extraCurricular: Joi.array().items(Joi.string()).empty('').optional(),
    awards: Joi.array().items(Joi.string()).empty('').optional(),
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
    sports: Joi.array().items(Joi.string()).empty('').optional(),
    hobbies: Joi.array().items(Joi.string()).empty('').optional(),
    talents: Joi.array().items(Joi.string()).empty('').optional(),
    socioCivic: Joi.array().items(Joi.string()).empty('').optional(),
    organization: Joi.array().items(Joi.string()).empty('').optional(),
  }).empty({}).optional(),

  health: Joi.object({
    hospitalized: Joi.array().items(Joi.string()).empty('').optional().default([]),
    reason: Joi.array().items(Joi.string()).empty('').optional().default([]),
    operation: Joi.array().items(Joi.string()).empty('').optional().default([]),
    illness: Joi.array().items(Joi.string()).empty('').optional().default([]),
    medicalCert: Joi.array().items(Joi.string()).empty('').optional().default([]),
    prescribedDrug: Joi.array().items(Joi.string()).empty('').optional().default([]),
    hereditary: Joi.array().items(Joi.string()).empty('').optional().default([]),
    doctorLastSeen: Joi.array().items(Joi.string()).empty('').optional().default([]),
  }).empty({}).optional(),

  lifeCircumstances: Joi.object({
    recentLoss: Joi.string().empty('').optional(),
    currentConcern: Joi.string().empty('').optional(),
  }).empty({}).optional(),

  violations: Joi.object().optional().empty({})
});

const mapUIToRaw = (ui) => {
  const set = (obj, path, value) => {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (cur[p] === undefined) cur[p] = {};
      cur = cur[p];
    }
    cur[parts[parts.length - 1]] = value;
  };

  const out = {};

  if (ui.sid) {
    out.sid = ui.sid;
  }

  if (ui.isArchived !== undefined) {
    out.isArchived = ui.isArchived;
  }

  if (ui.basic) {
    const b = ui.basic;
    if (b.fullName) set(out, 'studentProfile.name', b.fullName);
    if (b.studentId) { out.sid = b.studentId; set(out, 'id', b.studentId); }
    if (b.emailAddress) set(out, 'contactInfo.email', b.emailAddress);
    if (b.mobilePhoneNumber) set(out, 'contactInfo.contactNo', b.mobilePhoneNumber);
    if (b.academicLevel) set(out, 'studentProfile.academicLevel', b.academicLevel);
    if (b.program) set(out, 'studentProfile.program', b.program);
    if (b.section) set(out, 'studentProfile.section', b.section);
    if (b.gender) set(out, 'studentProfile.gender', b.gender);
    if (b.birthDate) set(out, 'studentProfile.birthday', b.birthDate);
    if (b.address) set(out, 'contactInfo.address.currentAddress', b.address);
    if (b.emergencyContact) set(out, 'familyBackground.emergency.contactNo', b.emergencyContact);
    if (b.healthCondition) set(out, 'health.illness', b.healthCondition);
  }

  if (ui.personal) {
    const p = ui.personal;
    if (p.nickname) set(out, 'studentProfile.nickname', p.nickname);
    if (p.gradeYearLevel) set(out, 'studentProfile.academicLevel', p.gradeYearLevel);
    if (p.tertiaryCollegeProgram) set(out, 'studentProfile.program', p.tertiaryCollegeProgram);
    if (p.section) set(out, 'studentProfile.section', p.section);
    if (p.birthDate) set(out, 'studentProfile.birthday', p.birthDate);
    if (p.nationality) set(out, 'studentProfile.nationality', p.nationality);
    if (p.religion) set(out, 'studentProfile.religion', p.religion);
    if (p.status) set(out, 'studentProfile.status', p.status);
  }

  if (ui.contact) {
    const c = ui.contact;
    if (c.mobilePhoneNumber) set(out, 'contactInfo.contactNo', c.mobilePhoneNumber);
    if (c.emailAddress) set(out, 'contactInfo.email', c.emailAddress);
    if (c.homeNumber) set(out, 'contactInfo.homeNo', c.homeNumber);
    if (c.presentAddress) set(out, 'contactInfo.address.currentAddress', c.presentAddress);
    if (c.permanentAddress) set(out, 'contactInfo.address.permanentAddress', c.permanentAddress);
    if (c.working) set(out, 'contactInfo.workNo', c.working);
    if (c.emergencyContact) set(out, 'familyBackground.emergency.contactNo', c.emergencyContact);
  }

  if (ui.family) {
    const f = ui.family;
    // fathers
    if (f.fatherName) set(out, 'familyBackground.fatherInfo.name', f.fatherName);
    if (f.fatherContactNumber) set(out, 'familyBackground.fatherInfo.contactNo', f.fatherContactNumber);
    if (f.motherName) set(out, 'familyBackground.motherInfo.name', f.motherName);
    if (f.motherContactNumber) set(out, 'familyBackground.motherInfo.contactNo', f.motherContactNumber);
    if (f.statusOfParents) set(out, 'familyBackground.statusOfParent', f.statusOfParents);
    if (f.nameOfGuardian) set(out, 'familyBackground.guardian.name', f.nameOfGuardian);
    if (f.typeOfRelationWithGuardian) set(out, 'familyBackground.guardian.relation', f.typeOfRelationWithGuardian);
    if (f.guardianContactNumber) set(out, 'familyBackground.guardian.contactNo', f.guardianContactNumber);
    if (f.parentGuardianAddress) set(out, 'familyBackground.address', f.parentGuardianAddress);
    if (f.siblings) set(out, 'familyBackground.siblings', Array.isArray(f.siblings) ? f.siblings : String(f.siblings).split(',').map(s => s.trim()));
    if (f.birthOrder) set(out, 'familyBackground.birthOrder', f.birthOrder);
  }

  if (ui.educational) {
    const e = ui.educational;
    if (e.nameOfGradeSchool) set(out, 'educationalBackground.elementary.schoolName', e.nameOfGradeSchool);
    if (e.yearsAttendedGradeSchool) set(out, 'educationalBackground.elementary.dateEnrolled', e.yearsAttendedGradeSchool);
    if (e.nameOfJuniorHighSchool) set(out, 'educationalBackground.juniorHighSchool.schoolName', e.nameOfJuniorHighSchool);
    if (e.yearsAttendedJuniorHighSchool) set(out, 'educationalBackground.juniorHighSchool.dateEnrolled', e.yearsAttendedJuniorHighSchool);
    if (e.nameOfSeniorHighSchool) set(out, 'educationalBackground.seniorHighSchool.schoolName', e.nameOfSeniorHighSchool);
    if (e.yearsAttendedSeniorHighSchool) set(out, 'educationalBackground.seniorHighSchool.dateEnrolled', e.yearsAttendedSeniorHighSchool);
    if (e.nameOfCollege) set(out, 'educationalBackground.college.schoolName', e.nameOfCollege);
    if (e.yearsAttendedCollege) set(out, 'educationalBackground.college.dateEnrolled', e.yearsAttendedCollege);
    if (e.extraCurricularActivities) set(out, 'educationalBackground.extraCurricular', Array.isArray(e.extraCurricularActivities) ? e.extraCurricularActivities : String(e.extraCurricularActivities).split(',').map(s => s.trim()));
    if (e.awards) set(out, 'educationalBackground.awards', Array.isArray(e.awards) ? e.awards : String(e.awards).split(',').map(s => s.trim()));
    if (e.mostLikedSubject) set(out, 'educationalBackground.likedSubject', e.mostLikedSubject);
    if (e.leastLikedSubject) set(out, 'educationalBackground.leastSubject', e.leastLikedSubject);
  }

  if (ui.work) {
    const w = ui.work;
    if (w.nameOfCompanyInstitution) set(out, 'workExperience.name', w.nameOfCompanyInstitution);
    if (w.durationFromTo) set(out, 'workExperience.duration', w.durationFromTo);
    if (w.jobDescription) set(out, 'workExperience.description', w.jobDescription);
    if (w.companyContactNo) set(out, 'workExperience.contactNo', w.companyContactNo);
    if (w.companyEmailAddress) set(out, 'workExperience.email', w.companyEmailAddress);
  }

  if (ui.interests) {
    const i = ui.interests;
    if (i.sports) set(out, 'interests.sports', Array.isArray(i.sports) ? i.sports : String(i.sports).split(',').map(s => s.trim()));
    if (i.hobbies) set(out, 'interests.hobbies', Array.isArray(i.hobbies) ? i.hobbies : String(i.hobbies).split(',').map(s => s.trim()));
    if (i.talents) set(out, 'interests.talents', Array.isArray(i.talents) ? i.talents : String(i.talents).split(',').map(s => s.trim()));
    if (i.socioCivic) set(out, 'interests.socioCivic', Array.isArray(i.socioCivic) ? i.socioCivic : String(i.socioCivic).split(',').map(s => s.trim()));
    if (i.organization) set(out, 'interests.organization', Array.isArray(i.organization) ? i.organization : String(i.organization).split(',').map(s => s.trim()));
  }

  if (ui.health) {
    const h = ui.health;
    if (h.hospitalized) set(out, 'health.hospitalized', Array.isArray(h.hospitalized) ? h.hospitalized : String(h.hospitalized).split(',').map(s => s.trim()));
    if (h.reason) set(out, 'health.reason', Array.isArray(h.reason) ? h.reason : String(h.reason).split(',').map(s => s.trim()));
    if (h.operation) set(out, 'health.operation', Array.isArray(h.operation) ? h.operation : String(h.operation).split(',').map(s => s.trim()));
    if (h.illness) set(out, 'health.illness', Array.isArray(h.illness) ? h.illness : h.illness);
    if (h.medicalCert) set(out, 'health.medicalCert', Array.isArray(h.medicalCert) ? h.medicalCert : String(h.medicalCert).split(',').map(s => s.trim()));
    if (h.prescribedDrug) set(out, 'health.prescribedDrug', Array.isArray(h.prescribedDrug) ? h.prescribedDrug : String(h.prescribedDrug).split(',').map(s => s.trim()));
    if (h.hereditary) set(out, 'health.hereditary', Array.isArray(h.hereditary) ? h.hereditary : String(h.hereditary).split(',').map(s => s.trim()));
    if (h.doctorLastSeen) set(out, 'health.doctorLastSeen', Array.isArray(h.doctorLastSeen) ? h.doctorLastSeen : String(h.doctorLastSeen).split(',').map(s => s.trim()));
  }

  if (ui.life) {
    const l = ui.life;
    if (l.recentLoss) set(out, 'lifeCircumstances.recentLoss', l.recentLoss);
    if (l.currentConcern) set(out, 'lifeCircumstances.currentConcern', l.currentConcern);
  }

  if (ui.violations) {
    out.violations = ui.violations;
  }

  return out;
};

// Controller Function to retrieve active student data
const getActiveStudent = async (req, res) => {
  try {
    const snapshot = await getStudentCollection()
      .where("isArchived", "==", false)
      .get();

    const student = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).send(student);
  } catch (error) {
    res.status(404).send({ error: `Failed to retrieve active student records.` });
  }
};

const getArchivedStudent = async (req, res) => {
  try {
    const snapshot = await getStudentCollection()
      .where("isArchived", "==", true)
      .get();

    const student = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).send(student);
  } catch (error) {
    res.status(404).send({ error: `Failed to retrieve archived student records.` });
  }
};

// Controller Function for adding student data
const addStudent = async (req, res) => {
  try {
    const { processedBy, ...data } = req.body;
    const { error, value: newStudent } = studentSchema.validate(data);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    let resultUrls = [];
    let publicIds = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path);
        resultUrls.push(secure_url);
        publicIds.push(public_id);
        fs.unlinkSync(file.path);
      }
      if (!newStudent.health) newStudent.health = {};

      newStudent.health.medicalCert = resultUrls;
      newStudent.health.medicalCertIds = publicIds;
    }

    const sid = newStudent.sid;
    const archived = newStudent.isArchived ?? false;

    await getStudentCollection().doc(sid).set(newStudent);

    const userRecord = await admin.auth().createUser({
      disabled: archived,
      uid: sid,
      email: newStudent.contactInfo.email,
      password: "student1234",
      displayName: newStudent.studentProfile.name,
    });

    await getUserCollection().doc(userRecord.uid).set({
      uid: userRecord.uid,
      displayName: newStudent.studentProfile.name,
      email: newStudent.contactInfo.email,
      role: "Student",
      isFirstLogin: true
    });

    res.status(201).json({
      message: "Student and User created successfully",
      sid: sid,
      uid: userRecord.uid,
    });

    // Notification
    const notifCollection = getNotificationCollection();
    const adminDoc = notifCollection.doc('records');
    const adminDocData = await adminDoc.get();

    let existingAdminNotification = [];
    if (adminDocData.exists && adminDocData.data()['data']) {
      existingAdminNotification = adminDocData.data()['data'];
    }

    const newAdminNotification = {
      date: new Date(),
      from: 'Admin',
      notifID: `adminRecord-${existingAdminNotification.length + 1}`,
      type: 'Creation',
      subject: `${processedBy} has created a new student record`
    }

    const updatedAdminNotifications = [...existingAdminNotification, newAdminNotification]
    const updateAdminPayload = {
      data: updatedAdminNotifications
    }

    await adminDoc.set(updateAdminPayload, { merge: true });

  } catch (error) {
    console.error("Registration error:", error);

    if (req.body?.sid) {
      await getStudentCollection().doc(req.body.sid).delete().catch(() => { });
    }

    for (const publicId of publicIds) {
      await cloudinary.uploader.destroy(publicId);
    }

    res.status(500).json({ error: error.message });
  }
};

// Controller Function for retrieving student data
const getStudents = async (req, res) => {
  try {
    const snapshot = await getStudentCollection().get();
    const students = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).send(students);
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).send({ error: "Failed to fetch students" });
  }
};

const getStudent = async (req, res) => {
  const { sid } = req.params;
  try {
    const doc = await getStudentCollection().doc(sid).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(doc.data());
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller Function for updating student data
const updateStudent = async (req, res) => {
  let resultUrls = [];
  let publicIds = [];

  try {
    const { sid } = req.params;
    const { processedBy, ...updatesRaw } = req.body;

    if (!updatesRaw || Object.keys(updatesRaw).length === 0) {
      return res.status(400).json({ error: "No update data provided" });
    }

    const uiKeys = ['basic', 'personal', 'contact', 'family', 'educational', 'work', 'interests', 'health', 'life', 'violations'];
    const hasUIKeys = uiKeys.some(k => Object.prototype.hasOwnProperty.call(updatesRaw, k));

    const updates = hasUIKeys ? mapUIToRaw(updatesRaw) : updatesRaw;

    const { error, value: validatedUpdates } = updateSchema.validate(updates);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path);
        resultUrls.push(secure_url);
        publicIds.push(public_id);
        fs.unlinkSync(file.path);
      }
      if (!validatedUpdates.health) validatedUpdates.health = {};

      // Merge with existing medicalCert
      const currentDoc = await getStudentCollection().doc(sid).get();
      const currentHealth = currentDoc.exists && currentDoc.data().health ? currentDoc.data().health : {};

      validatedUpdates.health.medicalCert = [
        ...(currentHealth.medicalCert || []),
        ...resultUrls
      ];
      validatedUpdates.health.medicalCertIds = [
        ...(currentHealth.medicalCertIds || []),
        ...publicIds
      ];
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
      updates: validatedUpdates,
    });

    // Notification
    const notifCollection = getNotificationCollection();
    const adminDoc = notifCollection.doc('records');
    const adminDocData = await adminDoc.get();

    let existingAdminNotification = [];
    if (adminDocData.exists && adminDocData.data()['data']) {
      existingAdminNotification = adminDocData.data()['data'];
    }

    const newAdminNotification = {
      date: new Date(),
      from: 'Admin',
      notifID: `adminRecord-${existingAdminNotification.length + 1}`,
      type: 'Update',
      subject: `${processedBy} has updated a student record`
    }

    const updatedAdminNotifications = [...existingAdminNotification, newAdminNotification]
    const updateAdminPayload = {
      data: updatedAdminNotifications
    }

    await adminDoc.set(updateAdminPayload, { merge: true });
  } catch (error) {
    console.error("Update error:", error);

    for (const publicId of publicIds) {
      try { await cloudinary.uploader.destroy(publicId); } catch (e) { }
    }

    res.status(500).json({ error: error.message });
  }
};

// Controller Function for archiving student data
const archiveStudent = async (req, res) => {
  try {
    const { sid } = req.params;
    const { processedBy } = req.body;
    const studentRef = getStudentCollection().doc(sid);

    const doc = await studentRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Student not found" });
    }

    await studentRef.update({ isArchived: true });

    // Disable Firebase Auth account
    await admin.auth().updateUser(sid, { disabled: true });

    res.status(200).json({
      message: "Student archived and account disabled successfully",
      id: sid,
    });

    // Notification
    const notifCollection = getNotificationCollection();
    const adminDoc = notifCollection.doc('records');
    const adminDocData = await adminDoc.get();

    let existingAdminNotification = [];
    if (adminDocData.exists && adminDocData.data()['data']) {
      existingAdminNotification = adminDocData.data()['data'];
    }

    const newAdminNotification = {
      date: new Date(),
      from: 'Admin',
      notifID: `adminRecord-${existingAdminNotification.length + 1}`,
      type: 'Archive',
      subject: `${processedBy} has archived a student record`
    }

    const updatedAdminNotifications = [...existingAdminNotification, newAdminNotification]
    const updateAdminPayload = {
      data: updatedAdminNotifications
    }

    await adminDoc.set(updateAdminPayload, { merge: true });

  } catch (error) {
    console.error("Archive error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Controller Function for restoring student data
const restoreStudent = async (req, res) => {
  try {
    const { sid } = req.params;
    const { processedBy } = req.body;
    const studentRef = getStudentCollection().doc(sid);

    const doc = await studentRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Student not found" });
    }

    await studentRef.update({ isArchived: false });

    // Re-enable Firebase Auth account
    await admin.auth().updateUser(sid, { disabled: false });

    res.status(200).json({
      message: "Student restored and account re-enabled successfully",
      id: sid,
    });

    // Notification
    const notifCollection = getNotificationCollection();
    const adminDoc = notifCollection.doc('records');
    const adminDocData = await adminDoc.get();

    let existingAdminNotification = [];
    if (adminDocData.exists && adminDocData.data()['data']) {
      existingAdminNotification = adminDocData.data()['data'];
    }

    const newAdminNotification = {
      date: new Date(),
      from: 'Admin',
      notifID: `adminRecord-${existingAdminNotification.length + 1}`,
      type: 'Restore',
      subject: `${processedBy} has restored a student record`
    }

    const updatedAdminNotifications = [...existingAdminNotification, newAdminNotification]
    const updateAdminPayload = {
      data: updatedAdminNotifications
    }

    await adminDoc.set(updateAdminPayload, { merge: true });

  } catch (error) {
    console.error("Restore error:", error);
    res.status(500).json({ error: error.message });
  }
};

const searchStudent = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.json([]);

    const snapshot = await getStudentCollection()
      .where("studentProfile.name", ">=", name)
      .where("studentProfile.name", "<=", name + "\uf8ff")
      .get();

    const students = snapshot.docs.map(doc => doc.data());
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Search failed" });
  }
}

module.exports = { addStudent, getStudents, updateStudent, getStudent, getActiveStudent, getArchivedStudent, archiveStudent, restoreStudent, searchStudent };