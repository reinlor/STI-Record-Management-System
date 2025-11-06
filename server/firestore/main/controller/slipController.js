const Joi = require("joi");
const { Timestamp } = require('firebase-admin/firestore');

const cloudinary = require("../../../config/cloudinary.js");
const fs = require("fs");

const { getAbsentSlipsCollection } = require("../models/slipModel");

const {
  getIncidentReportCollection,
} = require("../models/incidentReportModel");

const { getChartDataCollection } = require("../models/chartDataModel");
const { getNotificationCollection } = require("../models/notificationModel.js");
const { getContentManagementCollection } = require("../models/contentManagementModel.js");

// SLIPS / Passes Schema
const absentSlipSchema = Joi.object({
  sid: Joi.string().required(),
  name: Joi.string().required(),
  program: Joi.string().optional(),
  section: Joi.string().required(),
  typeOfSlip: Joi.string().valid("Absent Slip").required(),
  email: Joi.string().email().required(),
  reason: Joi.string().optional(),
  excuseLetterUrl: Joi.string().required(),
  medicalCertificateUrl: Joi.string().required(),
  guardianValidIDUrl: Joi.string().required(),
  attachmentCount: Joi.number().required(),
  status: Joi.string().required(),
  timeCreated: Joi.required(),
  dateAbsent: Joi.string().required(),
  dateAbsentEnd: Joi.string().required(),
  remarks: Joi.string().optional().allow(""),
});

// Controller Function For adding Absent Slip
const addAbsentSlip = async (req, res) => {
  // Track uploaded files' public_ids for cleanup
  const uploadedPublicIds = [];
  try {
    let excuseLetterUrl = "",
      medicalCertificateUrl = "",
      guardianValidIDUrl = "";

    if (req.files && req.files.length > 0) {
      // NEW ORDER: [0] Excuse Letter, [1] Guardian ID, [2] Medical Certificate
      if (req.files[0]) {
        const result = await cloudinary.uploader.upload(req.files[0].path, {
          folder: "slip-attachments",
        });
        excuseLetterUrl = result.secure_url;
        uploadedPublicIds.push(result.public_id);
        fs.unlinkSync(req.files[0].path);
      }
      if (req.files[1]) {
        const result = await cloudinary.uploader.upload(req.files[1].path, {
          folder: "slip-attachments",
        });
        guardianValidIDUrl = result.secure_url;
        uploadedPublicIds.push(result.public_id);
        fs.unlinkSync(req.files[1].path);
      }
      if (!req.files[1]) {
        guardianValidIDUrl = "Empty";
      }
      if (req.files[2]) {
        const result = await cloudinary.uploader.upload(req.files[2].path, {
          folder: "slip-attachments",
        });
        medicalCertificateUrl = result.secure_url;
        uploadedPublicIds.push(result.public_id);
        fs.unlinkSync(req.files[2].path);
      }
      if (!req.files[2]) {
        medicalCertificateUrl = "Empty";
      }
    }

    const slipData = {
      ...req.body,
      name: req.body.name?.trim(),
      sid: req.body.sid?.trim(),
      excuseLetterUrl,
      medicalCertificateUrl,
      guardianValidIDUrl,
      attachmentCount: req.files ? req.files.length : 0,
      status: "Pending",
      timeCreated: Timestamp.fromDate(new Date()),
      dateAbsent: req.body.dateAbsent,
      dateAbsentEnd: req.body.dateAbsentEnd,
      remarks: "",
    };

    const { error, value: newAbsentSlip } = absentSlipSchema.validate(slipData);
    if (error) {
      // Clean up uploaded files if validation fails
      for (const public_id of uploadedPublicIds) {
        await cloudinary.uploader.destroy(public_id);
      }
      return res.status(400).json({ error: error.details[0].message });
    }
    await getAbsentSlipsCollection().doc().set(newAbsentSlip);

    // Pang Charts
    const chartDataDocRef = getChartDataCollection().doc("slip-n-pass");
    const docSnapshot = await chartDataDocRef.get();
    const schoolPeriodDoc = await getContentManagementCollection().doc("schoolPeriod").get();

    // Logic to get current school year
    let currentSchoolYear = "";
    if (schoolPeriodDoc.exists) {
      currentSchoolYear = schoolPeriodDoc.data().schoolYear || "";
    }

    const updatedData = docSnapshot.exists
      ? docSnapshot.data()
      : { id: "slip-n-pass", data: [] };
    const existingDataArray = updatedData.data || [];

    existingDataArray.push({
      sid: newAbsentSlip.sid,
      type: "Absent Slip",
      schoolYear: currentSchoolYear,
      date: new Date(),
    });

    updatedData.data = existingDataArray;
    await chartDataDocRef.set(updatedData, { merge: true });
    //

    // Admin Notification
    const notifCollection = getNotificationCollection();
    const adminDoc = notifCollection.doc("request");
    const adminDocData = await adminDoc.get();

    let existingAdminNotification = [];
    if (adminDocData.exists && adminDocData.data()["data"]) {
      existingAdminNotification = adminDocData.data()["data"];
    }

    const newAdminNotification = {
      date: Timestamp.fromDate(new Date()),
      from: "Student",
      isRead: false,
      notifID: `adminRequest-${existingAdminNotification.length + 1}`,
      type: "Submission",
      subject: `${req.body.name} has submitted a request`,
    };

    const updatedAdminNotifications = [
      ...existingAdminNotification,
      newAdminNotification,
    ];
    const updateAdminPayload = {
      data: updatedAdminNotifications,
    };

    await adminDoc.set(updateAdminPayload, { merge: true });

    res
      .status(200)
      .send({ message: `Absent slip added to Student: ${newAbsentSlip.name}` });
  } catch (error) {
    // Clean up uploaded files if any error occurs
    if (uploadedPublicIds.length) {
      for (const public_id of uploadedPublicIds) {
        await cloudinary.uploader.destroy(public_id);
      }
    }
    res.status(500).send({ error: error.message });
  }
};

// Controller Function for retrieving all absent Slip
const getAllAbsentSlip = async (req, res) => {
  try {
    const snapshot = await getAbsentSlipsCollection().get();

    if (snapshot.empty) {
      return res
        .status(404)
        .send({ error: `There is no available absent slips.` });
    }

    const absentSlips = snapshot.docs.map((absentSlip) => ({
      _id: absentSlip.id,
      ...absentSlip.data(),
    }));
    res.status(200).send(absentSlips);
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
};

// Controller Function for retrieving Absent Slip by SID
const getAbsentSlip = async (req, res) => {
  const { sid } = req.params;

  try {
    const snapshot = await getAbsentSlipsCollection()
      .where("sid", "==", sid)
      .get();

    if (snapshot.empty) {
      return res.status(404).send({
        error: `There is no available absent slips for Student: ${sid}`,
      });
    }

    const absentSlips = snapshot.docs.map((absentSlip) => ({
      _id: absentSlip.id,
      ...absentSlip.data(),
    }));

    res.status(200).send(absentSlips);
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
};

// Controller Function for retrieving all slips
const getAllSlips = async (req, res) => {
  try {
    const snapshot = await getAbsentSlipsCollection().get();
    const snapshot2 = await getIncidentReportCollection().get();

    if (snapshot.empty && snapshot2.empty) {
      return res
        .status(404)
        .send({ error: `There is no available slips and incident reports.` });
    }

    const absentSlips = snapshot.docs.map((absentSlip) => ({
      _id: absentSlip.id,
      ...absentSlip.data(),
    }));

    const incidentReports = snapshot2.docs.map((incidentReport) => ({
      _id: incidentReport.id,
      ...incidentReport.data(),
    }));

    allSlips = [...absentSlips, ...incidentReports];

    res.status(200).json(allSlips);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const getAllSlipsById = async (req, res) => {
  const { sid } = req.params;

  try {
    const snapshot = await getAbsentSlipsCollection()
      .where("sid", "==", sid)
      .get();
    const snapshot2 = await getIncidentReportCollection()
      .where("sid", "==", sid)
      .get();

    if (snapshot.empty && snapshot2.empty) {
      return res.status(404).send({ error: `There is no available slips.` });
    }

    const absentSlips = snapshot.docs.map((absentSlip) => ({
      _id: absentSlip.id,
      ...absentSlip.data(),
    }));

    const incidentReports = snapshot2.docs.map((incidentReport) => ({
      _id: incidentReport.id,
      ...incidentReport.data(),
    }));

    allSlips = [...absentSlips, ...incidentReports];

    res.status(200).json(allSlips);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Controller Function for updating slips/passes
const updateSlipStatus = async (req, res) => {
  const { slipType, slipId } = req.params;
  const { status, remarks, uid, name, studentName, pickUpDate } = req.body;

  const statusSchema = Joi.object({
    status: Joi.string().valid("Approved", "Denied", "In Progress", "Denied", "Cancelled", "Inactive", "Resolved").required(),
    remarks: Joi.string().required(),
    pickUpDate: Joi.string().optional().empty(''),
  });

  const { error } = statusSchema.validate({
    status,
    remarks,
    pickUpDate,
  });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  if (status === "Approved" && (!pickUpDate || pickUpDate.trim() === "")) {
    return res.status(400).json({ error: "Pickup date is required when approving a request slip." });
  }

  let collectionRef;
  let typeOfSlip;
  switch (slipType) {
    case "Absent Slip":
      typeOfSlip = "Absent Slip";
      collectionRef = getAbsentSlipsCollection();
      break;
    case "Incident Report":
      typeOfSlip = "Incident Report";
      collectionRef = getIncidentReportCollection();
      break;
    default:
      return res.status(400).json({ error: "Invalid slip type provided." });
  }

  try {
    const docRef = collectionRef.doc(slipId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Slip not found." });
    }

    const updateData = {
      status,
      remarks,
      processedDate: new Date(),
      processedBy: name
    };


    if (status === "Approved" && pickUpDate) {
      updateData.pickUpDate = pickUpDate;
    }
    await docRef.update(updateData);

    const notifCollection = getNotificationCollection();
    const studentDoc = notifCollection.doc("student");
    const studentDocData = await studentDoc.get();
    const adminDoc = notifCollection.doc("request");
    const adminDocData = await adminDoc.get();

    let existingNotifications = [];
    if (studentDocData.exists && studentDocData.data()[uid]) {
      existingNotifications = studentDocData.data()[uid];
    }

    let existingAdminNotification = [];
    if (adminDocData.exists && adminDocData.data()["data"]) {
      existingAdminNotification = adminDocData.data()["data"];
    }

    const newStudentNotification = {
      date: Timestamp.fromDate(new Date()),
      from: name,
      isRead: false,
      notifID: `SR-${uid}-${existingNotifications.length + 1}`,
      status: status,
      subject: `Your ${typeOfSlip} has been ${status}`,
    };

    const newAdminNotification = {
      date: Timestamp.fromDate(new Date()),
      from: name,
      isRead: false,
      notifID: `adminRequest-${existingAdminNotification.length + 1}`,
      type: "Update",
      subject: `${studentName}'s slip has been ${status}`,
    };

    const updatedNotifications = [
      ...existingNotifications,
      newStudentNotification,
    ];
    const updatedAdminNotifications = [
      ...existingAdminNotification,
      newAdminNotification,
    ];

    const updatePayload = {
      [uid]: updatedNotifications,
    };

    const updateAdminPayload = {
      data: updatedAdminNotifications,
    };

    await studentDoc.set(updatePayload, { merge: true });
    await adminDoc.set(updateAdminPayload, { merge: true });

    res
      .status(200)
      .send({
        message: `Slip ${slipId} status updated to ${status}. Notification sent to ${name}.`,
      });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Controller function for cancelling slip request
const cancelRequestSlip = async (req, res) => {
  const { slipType, slipId } = req.params;

  let collectionRef;
  let typeOfSlip;
  switch (slipType) {
    case "Absent Slip":
      typeOfSlip = "Absent Slip";
      collectionRef = getAbsentSlipsCollection();
      break;
    case "Incident Report":
      typeOfSlip = "Incident Report";
      collectionRef = getIncidentReportCollection();
      break;
    default:
      return res.status(400).json({ error: "Invalid slip type provided." });
  }

  try {
    const docRef = collectionRef.doc(slipId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Slip not found." });
    }

    await docRef.update({
      status: "Cancelled",
      processedDate: Timestamp.fromDate(new Date())
    });

    res
      .status(200)
      .send({ message: `Slip ${slipId} has been successfully cancelled.` });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = {
  addAbsentSlip,
  getAllAbsentSlip,
  getAbsentSlip,
  getAllSlips,
  getAllSlipsById,
  updateSlipStatus,
  cancelRequestSlip,
};
