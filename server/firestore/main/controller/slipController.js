const Joi = require("joi");
const { Timestamp } = require("firebase-admin").firestore;

const cloudinary = require("../../../config/cloudinary.js");
const fs = require("fs");

const {
  getAbsentSlipsCollection,
} = require("../models/slipModel");

const {
  getIncidentReportCollection,
} = require("../models/incidentReportModel");

const { getChartDataCollection } = require("../models/chartDataModel");


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
  timeCreated: Joi.date().required(),
  dateAbsent: Joi.string().required(),
  dateAbsentEnd: Joi.string().required(),
  remarks: Joi.string().optional().allow(''),
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
      if (req.files[0]) {
        const result = await cloudinary.uploader.upload(req.files[0].path, {
          folder: "slip-attachments",
        });
        excuseLetterUrl = result.secure_url;
        uploadedPublicIds.push(result.public_id); // Track for cleanup
        fs.unlinkSync(req.files[0].path);
      }
      if (req.files[1]) {
        const result = await cloudinary.uploader.upload(req.files[1].path, {
          folder: "slip-attachments",
        });
        medicalCertificateUrl = result.secure_url;
        uploadedPublicIds.push(result.public_id);
        fs.unlinkSync(req.files[1].path);
      }
      if (!req.files[1]) {
        medicalCertificateUrl = "Empty";
      }
      if (req.files[2]) {
        const result = await cloudinary.uploader.upload(req.files[2].path, {
          folder: "slip-attachments",
        });
        guardianValidIDUrl = result.secure_url;
        uploadedPublicIds.push(result.public_id);
        fs.unlinkSync(req.files[2].path);
      }
      if (!req.files[2]) {
        guardianValidIDUrl = "Empty";
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
      timeCreated: new Date(),
      dateAbsent: req.body.dateAbsent,
      dateAbsentEnd: req.body.dateAbsentEnd,
      remarks: ""
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

    const updatedData = docSnapshot.exists ? docSnapshot.data() : { id: "slip-n-pass", data: [] };
    const existingDataArray = updatedData.data || [];

    existingDataArray.push({
      sid: newAbsentSlip.sid,
      type: "Absent Slip",
      date: new Date().toISOString()
    });

    updatedData.data = existingDataArray;
    await chartDataDocRef.set(updatedData, { merge: true });
    // Pang Charts

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

    if (
      snapshot.empty &&
      snapshot2.empty
    ) {
      return res.status(404).send({ error: `There is no available slips and incident reports.` });
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

    if (
      snapshot.empty &&
      snapshot2.empty
    ) {
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
  const { status, remarks } = req.body;

  const statusSchema = Joi.object({
    status: Joi.string().valid("Approved", "Denied").required(),
    remarks: Joi.string().required(),
    processedDate: Joi.date()
  });

  const { error } = statusSchema.validate({ 
    status,
    remarks,
    processedDate: new Date(),
  });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  let collectionRef;
  switch (slipType) {
    case "Absent Slip":
      collectionRef = getAbsentSlipsCollection();
      break;
    case "Incident Report":
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
      status,
      remarks,
      processedDate: new Date() });

    res.status(200).send({ message: `Slip ${slipId} status updated to ${status}.` });
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
  updateSlipStatus
};
