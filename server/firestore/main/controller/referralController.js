const Joi = require("joi");
const { getReferralFormCollection } = require("../models/referralModel");
const { getChartDataCollection } = require("../models/chartDataModel");
const { getNotificationCollection } = require("../models/notificationModel");
const { getContentManagementCollection } = require("../models/contentManagementModel");
const { FieldValue, Timestamp } = require("firebase-admin/firestore");

// Referral Schema
const referralSchema = Joi.object({
  employeeID: Joi.string().required(),
  schoolYear: Joi.string().required(),
  gradeLevel: Joi.string().required(),
  sid: Joi.string().required(),
  email: Joi.string().required(),
  studentName: Joi.string().required(),
  program: Joi.string().required(),
  gender: Joi.string().required(),
  status: Joi.string().required(),
  age: Joi.number().optional().allow(null, '').options({ convert: true }),
  referredBy: Joi.string().required(),
  counselingTypeCategory: Joi.string().required(),
  violation: Joi.string().required(),
  levelOfPriority: Joi.string().required(),
  actionTaken: Joi.string().required(),
  reasonForReferral: Joi.string().required(),
});

const updateSchema = Joi.object({
  employeeID: Joi.string().optional(),
  schoolYear: Joi.string().optional(),
  gradeLevel: Joi.string().optional(),
  sid: Joi.string().optional(),
  email: Joi.string().optional(),
  studentName: Joi.string().optional(),
  program: Joi.string().optional(),
  section: Joi.string().optional(),
  gender: Joi.string().optional(),
  status: Joi.string().optional(),
  age: Joi.number().optional().options({ convert: true }),
  referredBy: Joi.string().optional(),
  areasOfConcern: Joi.array().optional(),
  counselingTypeCategory: Joi.string().optional(),
  violation: Joi.string().optional(),
  levelOfPriority: Joi.string().optional(),
  actionTaken: Joi.string().optional(),
  reasonForReferral: Joi.string().optional(),
  initialAction: Joi.string().optional().allow(''),
  preparedDate: Joi.optional(),
  feedBackDate: Joi.optional().allow(''),
  receivedBy: Joi.string().optional().allow(''),
  remarks: Joi.string().optional().allow(''),
  counselorNote: Joi.string().optional().allow('')
});

// Controller Function for adding
const addReferral = async (req, res) => {
  try {
    referralSchema.validate(req.body);

    const { error, value: newReferral } = referralSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    await getReferralFormCollection().doc().set({ preparedDate: Timestamp.fromDate(new Date()), ...newReferral });



    // Notifications
    const notifCollection = getNotificationCollection();
    const adminDoc = notifCollection.doc('referral');
    const adminDocData = await adminDoc.get();

    let existingAdminNotification = [];
    if (adminDocData.exists && adminDocData.data()['data']) {
      existingAdminNotification = adminDocData.data()['data'];
    }

    const newAdminNotification = {
      date: Timestamp.fromDate(new Date()),
      from: 'Teacher',
      isRead: false,
      notifID: `adminReferral-${existingAdminNotification.length + 1}`,
      type: 'Submission',
      subject: `${req.body.referredBy} has submitted a referral`
    }

    const updatedAdminNotifications = [...existingAdminNotification, newAdminNotification]
    const updateAdminPayload = {
      data: updatedAdminNotifications
    }

    await adminDoc.set(updateAdminPayload, { merge: true });


    res.status(201).json({
      message: `Referral form added successfully.`,
    });
  } catch (error) {
    console.error(`Referral form error: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

// Controller Function to update referrall submission
const updateReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: _, name, uid, ...updates } = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No update data provided" });
    }

    const { error, value: validatedUpdates } = updateSchema.validate(updates);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const referralRef = getReferralFormCollection().doc(id);

    const doc = await referralRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Student not found" });
    }

    await referralRef.set({ feedBackDate: Timestamp.fromDate(new Date()), ...validatedUpdates }, { merge: true });

    // Notification
    const notifCollection = getNotificationCollection();
    const teacherDoc = notifCollection.doc('teacher');
    const teacherDocData = await teacherDoc.get();
    const adminDoc = notifCollection.doc('referral');
    const adminDocData = await adminDoc.get();

    let existingNotifications = [];
    if (teacherDocData.exists && teacherDocData.data()[uid]) {
      existingNotifications = teacherDocData.data()[uid];
    }

    let existingAdminNotification = [];
    if (adminDocData.exists && adminDocData.data()['data']) {
      existingAdminNotification = adminDocData.data()['data'];
    }


    const newTeacherNotification = {
      date: Timestamp.fromDate(new Date()),
      from: name,
      isRead: false,
      notifID: `TR-${uid}-${existingNotifications.length + 1}`,
      status: updates.status,
      subject: `Your Referral has been ${updates.status}`
    };

    const newAdminNotification = {
      date: Timestamp.fromDate(new Date()),
      from: name,
      isRead: false,
      notifID: `adminReferral-${existingAdminNotification.length + 1}`,
      type: 'Update',
      subject: `${req.body.referredBy}'s referral has been ${updates.status}`
    }

    const updatedNotifications = [...existingNotifications, newTeacherNotification];
    const updatedAdminNotifications = [...existingAdminNotification, newAdminNotification]

    const updatePayload = {
      [uid]: updatedNotifications,
    };

    const updateAdminPayload = {
      data: updatedAdminNotifications
    }

    await teacherDoc.set(updatePayload, { merge: true });
    await adminDoc.set(updateAdminPayload, { merge: true });
    //

    // Chart Data (Dashboard)
    // const sid = validatedUpdates.sid;
    // const reason = validatedUpdates.counselingTypeCategory;
    // const studentName = validatedUpdates.studentName;
    // const program = validatedUpdates.program;
    // const schoolPeriodDoc = await getContentManagementCollection().doc("schoolPeriod").get();

    // Logic to get current school year
    // if (validatedUpdates.status === 'Resolved') {
    //   let currentSchoolYear = "";
    //   if (schoolPeriodDoc.exists) {
    //     currentSchoolYear = schoolPeriodDoc.data().schoolYear || "";  
    //   }


    //   const chartData = {
    //     sid: sid,
    //     type: reason,
    //     name: studentName,
    //     section: program,
    //     schoolYear: currentSchoolYear,
    //     date: new Date(),
    //   };

    //   const studentCaseRef = getChartDataCollection().doc("studentCase");
    //   const docSnapshot = await studentCaseRef.get();

    //   if (!docSnapshot.exists) {
    //     await studentCaseRef.set({
    //       data: [chartData],
    //     });
    //   } else {
    //     await studentCaseRef.update({
    //       data: FieldValue.arrayUnion(chartData),
    //     });
    //   }
    // }
    //

    res.status(201).json({
      message: `Referral Form (${id}) successfully updated.`,
      updates: updates,
    });
  } catch (error) {
    console.error(`Referral form error: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

// Controller function for cancelling referral
const cancelReferral = async (req, res) => {
  const { referralId } = req.params;

  try {
    const docRef = getReferralFormCollection().doc(referralId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Slip not found." });
    }

    await docRef.update({
      status: "Cancelled",
      feedBackDate: Timestamp.fromDate(new Date())
    });

    res.status(200).send({ message: `Referral ${referralId} has been successfully cancelled.` });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}

// Controller function to retrieve all referral submission
const getAllReferral = async (req, res) => {
  try {
    const snapshot = await getReferralFormCollection().get();

    if (snapshot.empty) {
      return res.status(404).json({
        error: `There is no referral forms to fetch.`,
      });
    }

    const referrals = snapshot.docs.map((referral) => ({
      id: referral.id,
      ...referral.data(),
    }));

    res.status(200).json(referrals);
  } catch (error) {
    console.error(`Referral form error: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

const getReferral = async (req, res) => {
  try {
    const { id } = req.params;

    const referralRef = getReferralFormCollection().doc(id);
    const snapshot = await referralRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        error: `Referral form with ID ${id} does not exist.`,
      });
    }

    const referralData = {
      id: snapshot.id,
      ...snapshot.data(),
    };

    res.status(200).json(referralData);
  } catch (error) {
    res.status(500).json({
      error: `Error fetching the referral form: ${error.message}`,
    });
  }
};

// Controller function to display referral from a specific Employee No.
const getReferralById = async (req, res) => {
  try {
    const { employeeID } = req.params;

    if (!employeeID) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    const snapshot = await getReferralFormCollection().where('employeeID', '==', employeeID).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "No referrals found for this employee ID" });
    }

    const referrals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(referrals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Controller function for follow-up request
const followUpReferral = async (req, res) => {
  const { referralId } = req.params;
  const { teacherName, teacherId, email } = req.body;

  try {
    const docRef = getReferralFormCollection().doc(referralId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Referral not found." });
    }

    const currentData = doc.data();
    const followUpCount = (currentData.followUpCount || 0) + 1;
    const followUpDates = currentData.followUpDates || [];
    followUpDates.push(Timestamp.fromDate(new Date()));

    // Update referral with follow-up info
    await docRef.update({
      followUpCount,
      followUpDates,
      isFollowedUp: true,
      lastFollowUpDate: Timestamp.fromDate(new Date()),
    });

    // Add admin notification
    const notifCollection = getNotificationCollection();
    const adminDoc = notifCollection.doc("referral");
    const adminDocData = await adminDoc.get();

    let existingAdminNotification = [];
    if (adminDocData.exists && adminDocData.data()["data"]) {
      existingAdminNotification = adminDocData.data()["data"];
    }

    const newAdminNotification = {
      date: Timestamp.fromDate(new Date()),
      from: "Teacher",
      isRead: false,
      notifID: `adminReferral-${existingAdminNotification.length + 1}`,
      type: "Follow-Up",
      subject: `Teacher Follow-Up: ${teacherName} requested an update for ${currentData.studentName}'s referral`,
    };

    const updatedAdminNotifications = [
      ...existingAdminNotification,
      newAdminNotification,
    ];

    await adminDoc.set({ data: updatedAdminNotifications }, { merge: true });

    res.status(200).json({
      message: "Follow-up sent successfully",
      followUpCount,
    });
  } catch (error) {
    console.error("Follow-up error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  addReferral, 
  updateReferral, 
  getAllReferral, 
  getReferral, 
  getReferralById, 
  cancelReferral,
  followUpReferral  // Add this export
};
