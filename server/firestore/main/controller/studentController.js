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
    name: Joi.string().optional(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    middleName: Joi.string().optional().empty(''),
    suffix: Joi.string().empty('').optional(),
    nickname: Joi.string().empty('').optional(),
    section: Joi.string().empty('').optional(),
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
    medicalCert: Joi.object({
      urls: Joi.array().items(Joi.string()).optional().default([]),
      ids: Joi.array().items(Joi.string()).optional().default([])
    }).optional().default({ urls: [], ids: [] }),
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
    name: Joi.string().empty('').optional(), // Add name for search/display
    firstName: Joi.string().empty('').optional(),
    lastName: Joi.string().empty('').optional(),
    middleName: Joi.string().empty('').optional(),
    suffix: Joi.string().optional(),
    nickname: Joi.string().empty('').optional(),
    section: Joi.string().empty('').optional(),
    academicLevel: Joi.string().empty('').optional(),
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
    contactNo: Joi.string().empty('').optional(), //.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
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
    medicalCert: Joi.object({
      urls: Joi.array().items(Joi.string()).optional().default([]),
      ids: Joi.array().items(Joi.string()).optional().default([])
    }).optional().default({ urls: [], ids: [] }),
    prescribedDrug: Joi.array().items(Joi.string()).empty('').optional().default([]),
    hereditary: Joi.array().items(Joi.string()).empty('').optional().default([]),
    doctorLastSeen: Joi.array().items(Joi.string()).empty('').optional().default([]),
  }).empty({}).optional(),

  lifeCircumstances: Joi.object({
    recentLoss: Joi.string().empty('').optional(),
    currentConcern: Joi.string().empty('').optional(),
  }).empty({}).optional(),

  violations: Joi.object().optional().empty({}),
  deleteCerts: Joi.string().optional(),
});


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
  let resultUrls = [];
  let publicIds = [];

  try {
    const { processedBy, ...data } = req.body;
    const { error, value: newStudent } = studentSchema.validate(data);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Construct and add the full name
    const profile = newStudent.studentProfile;
    profile.name = [
      profile.lastName,
      profile.firstName ? `, ${profile.firstName}` : "",
      profile.middleName ? ` ${profile.middleName}` : "",
      profile.suffix ? ` ${profile.suffix}` : "",
    ]
      .filter(Boolean)
      .join("");


    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: "medical-certificates" });
        resultUrls.push(secure_url);
        publicIds.push(public_id);
        fs.unlinkSync(file.path);
      }
      if (!newStudent.health) newStudent.health = {};
      newStudent.health.medicalCert = {
        urls: resultUrls,
        ids: publicIds
      };
    }

    const sid = newStudent.sid;
    const archived = newStudent.isArchived ?? false;

    await getStudentCollection().doc(sid).set(newStudent);

    const userRecord = await admin.auth().createUser({
      disabled: archived,
      uid: sid,
      email: newStudent.contactInfo.email,
      password: "student1234",
      displayName: `${newStudent.studentProfile.lastName} ${newStudent.suffix}, ${newStudent.studentProfile.firstName} ${newStudent.studentProfile.middleName}`,
    });

    await getUserCollection().doc(userRecord.uid).set({
      uid: userRecord.uid,
      displayName: `${newStudent.studentProfile.lastName} ${newStudent.suffix}, ${newStudent.studentProfile.firstName} ${newStudent.studentProfile.middleName}`,
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
  let newPublicIds = []; // Track newly uploaded file IDs for potential rollback

  try {
    const { sid } = req.params;
    const { processedBy, ...updates } = req.body;

    if (typeof updates.health === "string") {
      try {
        updates.health = JSON.parse(updates.health);
      } catch (err) {
        return res.status(400).json({ error: "Invalid health format" });
      }
    }

    if (!updates || Object.keys(updates).length === 0) {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No update data provided" });
      }
    }
    const { error, value: validatedUpdates } = updateSchema.validate(updates);

    // Prevent Joi defaults from wiping out existing medical certificates.
    // If the client did not include a medicalCert field (and there are no file uploads/deletions),
    // remove the defaulted medicalCert produced by Joi so we don't overwrite stored certs with empty arrays.
    let sentHealthPayload;
    if (typeof updates.health === "string") {
      try {
        sentHealthPayload = JSON.parse(updates.health);
      } catch (e) {
        sentHealthPayload = undefined;
      }
    } else {
      sentHealthPayload = updates.health;
    }
    const hasHealthMedicalCertInPayload = !!(sentHealthPayload && Object.prototype.hasOwnProperty.call(sentHealthPayload, "medicalCert"));
    const hasFileUpload = req.files && req.files.length > 0;
    const hasDeleteCerts = !!req.body.deleteCerts;
    if (validatedUpdates.health && !hasHealthMedicalCertInPayload && !hasFileUpload && !hasDeleteCerts) {
      delete validatedUpdates.health.medicalCert;
    }

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // If name parts are updated, reconstruct the full name
    if (validatedUpdates.studentProfile) {
      const studentRefCheck = getStudentCollection().doc(sid);
      const currentDocCheck = await studentRefCheck.get();
      const currentProfile = currentDocCheck.data()?.studentProfile || {};

      const updatedProfile = { ...currentProfile, ...validatedUpdates.studentProfile };

      validatedUpdates.studentProfile.name = [
        updatedProfile.lastName,
        updatedProfile.firstName ? `, ${updatedProfile.firstName}` : "",
        updatedProfile.middleName ? ` ${updatedProfile.middleName}` : "",
        updatedProfile.suffix ? ` ${updatedProfile.suffix}` : "",
      ]
        .filter(Boolean)
        .join("");
    }

    const studentRef = getStudentCollection().doc(sid);
    const currentDoc = await studentRef.get();
    if (!currentDoc.exists) {
      return res.status(404).json({ error: "Student not found" });
    }

    const currentHealth = currentDoc.data().health || {};
    let medicalCertUrls = Array.isArray(currentHealth.medicalCert?.urls) ? [...currentHealth.medicalCert.urls] : [];
    let medicalCertIds = Array.isArray(currentHealth.medicalCert?.ids) ? [...currentHealth.medicalCert.ids] : [];

    // 1. Handle new file uploads first
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: "medical-certificates" });
        medicalCertUrls.push(secure_url);
        medicalCertIds.push(public_id);
        newPublicIds.push(public_id); // Track for rollback
        fs.unlinkSync(file.path);
      }
    }

    // 2. Handle deletions from the (now updated) lists
    if (req.body.deleteCerts) {
      let toDelete = [];
      try {
        toDelete = JSON.parse(req.body.deleteCerts);
      } catch (e) {
        // ignore invalid JSON
      }
      if (Array.isArray(toDelete) && toDelete.length > 0) {
        toDelete.forEach(({ url, id }) => {
          const idx = id ? medicalCertIds.findIndex((pid) => pid === id) : medicalCertUrls.findIndex((u) => u === url);

          if (idx !== -1) {
            const deletedId = medicalCertIds[idx];
            medicalCertUrls.splice(idx, 1);
            medicalCertIds.splice(idx, 1);
            if (deletedId) {
              cloudinary.uploader.destroy(deletedId).catch(() => { });
            }
          }
        });
      }
    }

    // 3. Assign the final, consolidated certificate data to the update payload
    if ((req.files && req.files.length > 0) || req.body.deleteCerts) {
      if (!validatedUpdates.health) validatedUpdates.health = {};
      validatedUpdates.health.medicalCert = { urls: medicalCertUrls, ids: medicalCertIds };
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

    if (processedBy !== null && processedBy !== undefined) {
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
    }


  } catch (error) {
    console.error("Update error:", error);

    // Rollback: delete newly uploaded files if an error occurred
    for (const publicId of newPublicIds) {
      await cloudinary.uploader.destroy(publicId);
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
    const raw = (req.query.name || "").trim();
    if (!raw || raw.length < 2) return res.json([]);

    const collection = getStudentCollection();

    const variants = new Set();
    variants.add(raw);
    variants.add(raw[0]?.toUpperCase() + raw.slice(1));
    variants.add(raw.split(/\s+/).map((w, i) => i === 0 ? (w[0]?.toUpperCase() + w.slice(1)) : w).join(" "));

    const fields = [
      "studentProfile.firstName",
      "studentProfile.middleName",
      "studentProfile.lastName",
      "studentProfile.suffix",
      "studentProfile.name"
    ];

    const studentsMap = new Map();

    const promises = [];
    for (const field of fields) {
      for (const v of variants) {
        promises.push(
          collection
            .where(field, ">=", v)
            .where(field, "<=", v + "\uf8ff")
            .limit(50)
            .get()
            .catch(() => ({ empty: true, docs: [] }))
        );
      }
    }

    const snapshots = await Promise.all(promises);

    snapshots.forEach(snapshot => {
      if (!snapshot || snapshot.empty) return;
      snapshot.docs.forEach(doc => {
        const id = doc.id;
        if (!studentsMap.has(id)) {
          studentsMap.set(id, { id, ...doc.data() });
        }
      });
    });

    const qLower = raw.toLowerCase();
    const matched = [];
    for (const [, data] of studentsMap) {
      const profile = data.studentProfile || {};

      const candidates = [];
      // split fields
      ["firstName", "middleName", "lastName", "suffix", "name"].forEach(k => {
        if (profile[k]) candidates.push(String(profile[k]));
      });
      const joinedParts = [profile.lastName, profile.firstName, profile.middleName, profile.suffix]
        .filter(Boolean)
        .join(" ");
      if (joinedParts) candidates.push(joinedParts);

      const isMatch = candidates.some(c => c.toLowerCase().startsWith(qLower));
      if (!isMatch) continue;

      const formatted = [
        `${profile.lastName || ""}${profile.lastName ? "," : ""}`,
        [profile.firstName, profile.middleName, profile.suffix].filter(Boolean).join(" ")
      ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

      data.studentProfile = {
        ...profile,
        fullName: formatted
      };

      matched.push(data);
    }

    matched.sort((a, b) => {
      const pa = a.studentProfile || {}, pb = b.studentProfile || {};
      const la = (pa.lastName || "").toLowerCase();
      const lb = (pb.lastName || "").toLowerCase();
      if (la !== lb) return la.localeCompare(lb);
      const fa = (pa.firstName || "").toLowerCase();
      const fb = (pb.firstName || "").toLowerCase();
      return fa.localeCompare(fb);
    });

    res.json(matched);
  } catch (error) {
    console.error("searchStudent error:", error);
    res.status(500).json({ message: "Search failed" });
  }
};

// Controller Function to check if student number exists
const checkStudentNumber = async (req, res) => {
  try {
    const { studentNumber } = req.params;
    const snapshot = await getStudentCollection()
      .where("sid", "==", studentNumber)
      .get();

    if (!snapshot.empty) {
      return res.status(200).json({ exists: true });
    }
    return res.status(404).json({ exists: false });

  } catch (error) {
    console.error("Check student number error:", error);
    res.status(500).json({ error: "Failed to check student number" });
  }
};

// Controller Function to check if email exists
const checkEmail = async (req, res) => {
  try {
    const { email } = req.query;
    const snapshot = await getStudentCollection()
      .where("contactInfo.email", "==", email)
      .get();

    if (!snapshot.empty) {
      return res.status(200).json({ exists: true });
    }
    return res.status(404).json({ exists: false });

  } catch (error) {
    console.error("Check email error:", error);
    res.status(500).json({ error: "Failed to check email" });
  }
};

module.exports = { addStudent, getStudents, updateStudent, getStudent, getActiveStudent, getArchivedStudent, archiveStudent, restoreStudent, searchStudent, checkStudentNumber, checkEmail  };