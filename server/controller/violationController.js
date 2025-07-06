const { getViolationsCollection } = require("../models/violationModel");

const admin = require("../firebase");

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

const addViolation = async (req, res) => {
  const { sid } = req.params;
  const {
    name,
    incidentDate,
    incidentTime,
    violation,
    description,
    proofURL,
    actionTaken,
    status,
    notes,
  } = req.body;

  try {
    await getViolationsCollection().add({
      sid,
      name,
      incidentDate,
      incidentTime,
      violation,
      description,
      proofURL,
      actionTaken,
      status,
      notes,
    });

    res
      .status(200)
      .send({ message: `Added a new violation for Student: ${sid}` });
  } catch (error) {
    res
      .status(404)
      .send({ error: `Failed to add a violation for User: ${sid}` });
  }
};

const updateViolation = async (req, res) => {
  const { id } = req.params;
  const {
    sid,
    name,
    incidentDate,
    incidentTime,
    violation,
    description,
    proofURL,
    actionTaken,
    status,
    notes,
  } = req.body;

  try {
    const violationDocRef = getViolationsCollection().doc(id);

    const snapshot = await violationDocRef.get();

    if (!snapshot.exists) {
      return res.status(400).send({ error: `Violation not found.` });
    }

    await violationDocRef.update({
      sid,
      name,
      incidentDate,
      incidentTime,
      violation,
      description,
      proofURL,
      actionTaken,
      status,
      notes,
    });

    res.status(200).send({ message: `Violation updated successfully.` });
  } catch (error) {
    return res.status(400).send({ error: `Violation update failed.` });
  }
};

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
