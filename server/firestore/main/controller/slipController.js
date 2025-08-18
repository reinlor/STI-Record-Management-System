const Joi = require("joi");
const { Timestamp } = require("firebase-admin").firestore;

const cloudinary = require("../../../config/cloudinary.js");
const fs = require("fs");

const {
  getLateSlipsCollection,
  getAbsentSlipsCollection,
  getIDPassCollection,
} = require("../models/slipModel");

// SLIPS / Passes Schema
const lateSlipSchema = Joi.object({
  sid: Joi.string().required(),
  name: Joi.string().required(),
  program: Joi.string().optional(),
  section: Joi.string().required(),
  typeOfSlip: Joi.string().valid("Late Slip").required(),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: {
      allow: ["com", "net"],
    },
  }),
  reason: Joi.string().required(),
  attachmentCount: Joi.number().required(),
  proofUrl: Joi.string().required(),
  status: Joi.string().required(),
  timeCreated: Joi.date().required(),
});

const absentSlipSchema = Joi.object({
  sid: Joi.string().required(),
  name: Joi.string().required(),
  program: Joi.string().optional(),
  section: Joi.string().required(),
  typeOfSlip: Joi.string().valid("Absent Slip").required(),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: {
      allow: ["com", "net"],
    },
  }),
  reason: Joi.string().required(),
  excuseLetterUrl: Joi.string().required(),
  medicalCertificateUrl: Joi.string().required(),
  guardianValidIDUrl: Joi.string().required(),
  attachmentCount: Joi.number().required(),
  status: Joi.string().required(),
  timeCreated: Joi.date().required(),
  daysAbsent: Joi.number().required(),
});

const idPassSchema = Joi.object({
  sid: Joi.string().required(),
  name: Joi.string().required(),
  program: Joi.string().optional(),
  section: Joi.string().required(),
  typeOfSlip: Joi.string().valid("ID Slip").required(),
  proofUrl: Joi.string().required(),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: {
      allow: ["com", "net"],
    },
  }),
  reason: Joi.string().required(),
  attachmentCount: Joi.number().required().default(0),
  status: Joi.string().required(),
  timeCreated: Joi.date().required(),
});

// Controller function for adding Late Slip
const addLateSlip = async (req, res) => {
  try {
    // Upload files to Cloudinary and assign URLs
    let proofUrl = "";
    if (req.files && req.files.length > 0) {
      if (req.files[0]) {
        const result = await cloudinary.uploader.upload(req.files[0].path, {
          folder: "slip-attachments",
        });
        proofUrl = result.secure_url;
        fs.unlinkSync(req.files[0].path);
      }
    }

    const slipData = {
      ...req.body,
      name: req.body.name?.trim(),
      sid: req.body.sid?.trim(),
      proofUrl,
      attachmentCount: req.files ? req.files.length : 0,
      status: "Pending",
      timeCreated: new Date(),
    };

    const { error, value: newLateSlip } = lateSlipSchema.validate(slipData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    await getLateSlipsCollection().doc().set(newLateSlip);
    res
      .status(200)
      .send({ message: `Late slip added to Student: ${newLateSlip.name}`, slip: newLateSlip });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Controller Function For adding Absent Slip
const addAbsentSlip = async (req, res) => {
  try {
    // Upload files to Cloudinary and assign URLs
    let excuseLetterUrl = "",
      medicalCertificateUrl = "",
      guardianValidIDUrl = "";
    if (req.files && req.files.length > 0) {
      if (req.files[0]) {
        const result = await cloudinary.uploader.upload(req.files[0].path, {
          folder: "slip-attachments",
        });
        excuseLetterUrl = result.secure_url;
        fs.unlinkSync(req.files[0].path);
      }
      if (req.files[1]) {
        const result = await cloudinary.uploader.upload(req.files[1].path, {
          folder: "slip-attachments",
        });
        medicalCertificateUrl = result.secure_url;
        fs.unlinkSync(req.files[1].path);
      }
      if (req.files[2]) {
        const result = await cloudinary.uploader.upload(req.files[2].path, {
          folder: "slip-attachments",
        });
        guardianValidIDUrl = result.secure_url;
        fs.unlinkSync(req.files[2].path);
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
    };

    const { error, value: newAbsentSlip } = absentSlipSchema.validate(slipData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    await getAbsentSlipsCollection().doc().set(newAbsentSlip);
    res
      .status(200)
      .send({ message: `Absent slip added to Student: ${newAbsentSlip.name}` });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Controller Function for adding ID Pass
const addIDPass = async (req, res) => {
  try {
    // Upload files to Cloudinary and assign URLs
    let proofUrl = "";
    if (req.files && req.files.length > 0) {
      if (req.files[0]) {
        const result = await cloudinary.uploader.upload(req.files[0].path, {
          folder: "slip-attachments",
        });
        proofUrl = result.secure_url;
        fs.unlinkSync(req.files[0].path);
      }
    }

    const slipData = {
      ...req.body,
      name: req.body.name?.trim(),
      sid: req.body.sid?.trim(),
      proofUrl,
      attachmentCount: req.files ? req.files.length : 0,
      status: "Pending",
      timeCreated: new Date(),
    };

    const { error, value: newIDPass } = idPassSchema.validate(slipData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    await getIDPassCollection().doc().set(newIDPass);
    res
      .status(200)
      .send({ message: `ID Pass added to Student: ${newIDPass.name}` });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Controller Function for retrieving all Late Slip
const getAllLateSlip = async (req, res) => {
  try {
    const snapshot = await getLateSlipsCollection().get();

    if (snapshot.empty) {
      return res
        .status(404)
        .send({ error: `There is no available late slips.` });
    }

    const lateSlips = snapshot.docs.map((lateSlip) => ({
      _id: lateSlip.id,
      ...lateSlip.data(),
    }));

    res.status(200).send(lateSlips);
  } catch (error) {
    res.status(404).send({ error: error.message });
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

// Controller Function for retrieving all ID Pass
const getAllIDPass = async (req, res) => {
  try {
    const snapshot = await getIDPassCollection().get();

    if (snapshot.empty) {
      return res.status(404).send({ error: `There is no available ID Pass.` });
    }

    const IDPasses = snapshot.docs.map((IDPass) => ({
      _id: IDPass.id,
      ...IDPass.data(),
    }));

    res.status(200).send(IDPasses);
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
};

// Controller Function for retriving Late Slip by SID
const getLateSlip = async (req, res) => {
  const { sid } = req.params;

  try {
    const snapshot = await getLateSlipsCollection()
      .where("sid", "==", sid)
      .get();

    if (snapshot.empty) {
      return res.status(404).send({
        error: `There is no available late slips for Student: ${sid}`,
      });
    }

    const lateSlips = snapshot.docs.map((lateSlip) => ({
      _id: lateSlip.id,
      ...lateSlip.data(),
    }));

    res.status(200).send(lateSlips);
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

// Controller Function for retrieving ID Pass by SID
const getIDPass = async (req, res) => {
  const { sid } = req.params;

  try {
    const snapshot = await getIDPassCollection().where("sid", "==", sid).get();

    if (snapshot.empty) {
      return res.status(404).send({
        error: `There is no available ID passes for Student: ${sid}`,
      });
    }

    const IDPasses = snapshot.docs.map((IDPass) => ({
      _id: IDPass.id,
      ...IDPass.data(),
    }));

    res.status(200).send(IDPasses);
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
};

// Controller Function for retrieving all slips
const getAllSlips = async (req, res) => {
  try {
    const snapshot = await getLateSlipsCollection().get();
    const snapshot2 = await getAbsentSlipsCollection().get();
    const snapshot3 = await getIDPassCollection().get();

    if (snapshot.empty && snapshot2.empty && snapshot3.empty) {
      return res.status(404).send({ error: `There is no available slips.` });
    }

    const lateSlips = snapshot.docs.map((lateSlip) => ({
      _id: lateSlip.id,
      ...lateSlip.data(),
    }));

    const absentSlips = snapshot2.docs.map((absentSlip) => ({
      _id: absentSlip.id,
      ...absentSlip.data(),
    }));

    const IDPasses = snapshot3.docs.map((IDPass) => ({
      _id: IDPass.id,
      ...IDPass.data(),
    }));

    allSlips = [...lateSlips, ...absentSlips, ...IDPasses];

    res.status(200).json(allSlips);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const getAllSlipsById = async (req, res) => {
  const { sid } = req.params;

  try {
    const snapshot = await getLateSlipsCollection()
      .where("sid", "==", sid)
      .get();
    const snapshot2 = await getAbsentSlipsCollection()
      .where("sid", "==", sid)
      .get();
    const snapshot3 = await getIDPassCollection().where("sid", "==", sid).get();

    if (snapshot.empty && snapshot2.empty && snapshot3.empty) {
      return res.status(404).send({ error: `There is no available slips.` });
    }

    const lateSlips = snapshot.docs.map((lateSlip) => ({
      _id: lateSlip.id,
      ...lateSlip.data(),
    }));

    const absentSlips = snapshot2.docs.map((absentSlip) => ({
      _id: absentSlip.id,
      ...absentSlip.data(),
    }));

    const IDPasses = snapshot3.docs.map((IDPass) => ({
      _id: IDPass.id,
      ...IDPass.data(),
    }));

    allSlips = [...lateSlips, ...absentSlips, ...IDPasses];

    res.status(200).json(allSlips);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = {
  addLateSlip,
  getAllLateSlip,
  getLateSlip,
  addAbsentSlip,
  getAllAbsentSlip,
  getAbsentSlip,
  addIDPass,
  getAllIDPass,
  getIDPass,
  getAllSlips,
  getAllSlipsById,
};
