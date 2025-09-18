const Joi = require("joi");
const { getReferralFormCollection } = require("../models/referralModel");
const { getChartDataCollection } = require("../models/chartDataModel");
const { getNotificationCollection } = require("../models/notificationModel");
const { FieldValue } = require("firebase-admin/firestore");

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
  age: Joi.number().required().options({ convert: true }),
  referredBy: Joi.string().required(),
  areasOfConcern: Joi.array().optional(),  // subject to remove this bullshet
  counselingTypeCategory: Joi.string().required(),
  violation: Joi.string().required(),
  actionRequired: Joi.string().required().allow(''),
  levelOfPriority: Joi.string().required(),
  actionTaken: Joi.string().required(),
  reasonForReferral: Joi.string().required(),
  initialAction: Joi.string().required().allow(''),
  preparedDate: Joi.string().required(),
  feedBackDate: Joi.string().required().allow(''),
  receivedBy: Joi.string().required().allow(''),
  receivedDate: Joi.string().required().allow(''),
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
  actionRequired: Joi.string().optional().allow(''),
  levelOfPriority: Joi.string().optional(),
  actionTaken: Joi.string().optional(),
  reasonForReferral: Joi.string().optional(),
  initialAction: Joi.string().optional().allow(''),
  preparedDate: Joi.string().optional(),
  feedBackDate: Joi.string().optional().allow(''),
  receivedBy: Joi.string().optional().allow(''),
  receivedDate: Joi.string().optional().allow(''),
});

// Controller Function for adding
const addReferral = async (req, res) => {
  try {
    referralSchema.validate(req.body);

    const { error, value: newReferral } = referralSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    await getReferralFormCollection().doc().set(newReferral);

    const sid = newReferral.sid;
    const reason = newReferral.counselingTypeCategory;
    const name = newReferral.studentName;
    const program = newReferral.program;

    const chartData = {
      sid: sid,
      type: reason,
      name: name,
      section: program,
      date: new Date().toISOString(),
    };

    const studentCaseRef = getChartDataCollection().doc("studentCase");
    const docSnapshot = await studentCaseRef.get();

    if (!docSnapshot.exists) {
      await studentCaseRef.set({
        data: [chartData],
      });
    } else {
      await studentCaseRef.update({
        data: FieldValue.arrayUnion(chartData),
      });
    }


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

    // Firestore update call is perfect.
    await referralRef.set(validatedUpdates, { merge: true });

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
      date: new Date(),
      from: name,
      isRead: false,
      notifID: `TR-${uid}-${existingNotifications.length + 1}`,
      status: updates.status,
      subject: `Your Referral has been ${updates.status}`
    };

    const newAdminNotification = {
      date: new Date(),
      from: name,
      isRead: false,
      notifID: `adminReferral-${existingAdminNotification.length + 1}`,
      type: 'Update',
      subject: `${uid} referral has been ${updates.status}`
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


    res.status(201).json({
      message: `Referral Form (${id}) successfully updated.`,
      updates: updates,
    });
  } catch (error) {
    console.error(`Referral form error: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

// Controller Function to retrieve all referral submission
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

module.exports = { addReferral, updateReferral, getAllReferral, getReferral, getReferralById };
