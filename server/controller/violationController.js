const { getViolationsCollection } = require("../models/violationModel");
const Joi = require('joi');
const admin = require("../firebase");

// Violation Schema
const violationSchema =  Joi.object({
  sid:                   Joi.string().required(),
  name:                  Joi.string().required(),
  incidentDate:          Joi.date().required(),
  incidentTime:          Joi.string().required(),
  violation:             Joi.array().required(),
  description:           Joi.string().optional(),
  proofUrl:              Joi.string().required(),
  actionTaken:           Joi.string().required(),
  status:                Joi.string().required(),
  notes:                 Joi.string().required(),
})
const updateSchema =  Joi.object({
  sid:                   Joi.string().optional(),
  name:                  Joi.string().optional(),
  incidentDate:          Joi.date().optional(),
  incidentTime:          Joi.string().optional(),
  violation:             Joi.array().optional(),
  description:           Joi.string().optional(),
  proofUrl:              Joi.string().optional(),
  actionTaken:           Joi.string().optional(),
  status:                Joi.string().optional(),
  notes:                 Joi.string().optional(),
})

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
    violationSchema.validate(req.body);

    const { error, value: newViolation } = violationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const sid = newViolation.sid;
    await getViolationsCollection().doc().set(newViolation);
    
    res.status(201).json({ 
      message: `Added a new violation for Student: ${sid}`
    });
  } catch (error) {
    res
      .status(404)
      .send({ error: `Failed to add a violation for User: ${sid}` });
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
      message: `Violation updated successfully!`
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
