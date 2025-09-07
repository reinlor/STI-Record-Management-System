const { getViolationsCollection } = require("../models/studentCasesModel");
const { getChartDataCollection } = require("../models/chartDataModel");
const Joi = require("joi");
const { FieldValue } = require("firebase-admin/firestore");
const cloudinary = require("../../../config/cloudinary.js");
const fs = require("fs");

// Violation Schema
const violationSchema = Joi.object({
  sid: Joi.string().required().empty(""),
  name: Joi.string().required().empty(""),
  programSection: Joi.string().required().empty(""),
  initiationDate: Joi.string().required().empty(""),
  initialTime: Joi.string().required().empty(""),
  counselingType: Joi.string().required().empty(""),
  violation: Joi.string().required().empty(""),
  detailedDescription: Joi.string().required().empty(""),
  proofDescription: Joi.string().required().empty(""),
  actionTaken: Joi.string().required().empty(""),
  dateOfAction: Joi.string().required().empty(""),
  status: Joi.string().required().empty(""),
  notes: Joi.string().required().empty(""),
  proofUrl: Joi.string().optional().empty(""),
  timeCreated: Joi.string().optional().empty("")
});
const updateSchema = Joi.object({
  sid: Joi.string().optional(),
  name: Joi.string().optional(),
  programSection: Joi.string().optional(),
  initiationDate: Joi.string().optional(),
  initialTime: Joi.string().optional(),
  counselingType: Joi.string().optional(),
  violation: Joi.string().optional(),
  detailedDescription: Joi.string().optional(),
  proofDescription: Joi.string().optional(),
  actionTaken: Joi.string().optional(),
  dateOfAction: Joi.string().optional(),
  status: Joi.string().optional(),
  notes: Joi.string().optional(),
  proofUrl: Joi.string().optional(),
  timeCreated: Joi.string().optional("")

});

// Controller function to retrieve all violation
const getAllViolations = async (req, res) => {
  const snapshot = await getViolationsCollection().get();

  try {
    const violations = snapshot.docs.map((violation) => ({
      id: violation.id,
      ...violation.data(),
    }));

    res.status(200).send(violations);
  } catch (error) {
    res
      .status(404)
      .send({ error: `Failed to retrieve all violation records.` });
  }
};

// Controller function to retrieve violation by ID
const getViolations = async (req, res) => {
  const { sid } = req.params;

  try {
    const snapshot = await getViolationsCollection()
      .where("sid", "==", sid)
      .get();

    if (snapshot.empty) {
      return res
        .status(404)
        .send({ error: `No violations available for Student: ${sid}` });
    }

    const violations = snapshot.docs.map((violation) => ({
      id: violation.id,
      ...violation.data(),
    }));

    res.status(200).send(violations);
  } catch (error) {
    res.status(404).send({ error: `Unable to retrieve user's violations.` });
  }
};

// Controller Function to add violation
const addViolation = async (req, res) => {
  try {
    let uploadedPublicId = "";
    let proofUrl = "";
    if (req.file) {
      console.log("Uploading file to Cloudinary...");
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "student-case-proof",
      });
      proofUrl = result.secure_url;
      uploadedPublicId = result.public_id;
      console.log("Cloudinary upload result:", result);
      fs.unlinkSync(req.file.path);
    }

    const violation = {
      ...req.body,
      proofUrl: proofUrl,
    }

    console.log("Validating body:", req.body);
    const { error, value: newViolation } = violationSchema.validate(violation);

    if (error) {
      if (uploadedPublicId) {
        await cloudinary.uploader.destroy(uploadedPublicId);
      }
      console.log("Validation error:", error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const sid = newViolation.sid;
    const reason = newViolation.counselingType;
    const name = newViolation.name;
    const programSection = newViolation.programSection;

    const serverTimestamp = FieldValue.serverTimestamp();

    const chartData = {
      sid: sid,
      type: reason,
      name: name,
      section: programSection,
      date: new Date().toISOString(),
    };

    const studentCaseRef = getChartDataCollection().doc("studentCase");
    const docSnapshot = await studentCaseRef.get();

    const violationData = {
      ...newViolation,
      date: serverTimestamp,
      timeCreated: serverTimestamp
    };

    if (!docSnapshot.exists) {
      await studentCaseRef.set({
        data: [chartData],
      });
    } else {
      await studentCaseRef.update({
        data: FieldValue.arrayUnion(chartData),
      });
    }

    await getViolationsCollection().doc().set(violationData);

    res.status(201).json({
      message: `Added a new violation for Student: ${sid}`,
      proofUrl: proofUrl || "",
    });
  } catch (error) {
    console.error("Error adding violation:", error);
    res.status(500).send({
      error: `Failed to add a violation for User: ${req.body?.sid || "N/A"}`,
    });
  }
};

// Controller Function to update violation
const updateViolation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No update data provided" });
    }
    const { error, value: validatedUpdates } = updateSchema.validate(updates);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const violationRef = getViolationsCollection().doc(id);

    const doc = await violationRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Violation not found" });
    }

    await violationRef.set(validatedUpdates, { merge: true });

    res.status(201).json({
      message: `Violation updated successfully!`,
    });
  } catch (error) {
    return res.status(400).send({ error: `Violation update failed.` });
  }
};

// Controller function for deleting violation
const deleteViolation = async (req, res) => {
  const { id } = req.params;

  try {
    await getViolationsCollection().doc(id).delete();

    res.status(200).send({ message: `Violation successfully deleted.` });
  } catch (error) {
    res.status(404).send({ error: `Violation deletion is unsuccessful.` });
  }
};

module.exports = {
  addViolation,
  deleteViolation,
  getAllViolations,
  getViolations,
  updateViolation,
};
