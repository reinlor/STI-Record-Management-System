const admin = require("../firebase");
const { getCounselingsCollection } = require("../models/counselingModel");

const addCounseling = async (req, res) => {
  const { sid } = req.params;
  const {
    name,
    incidentDate,
    category,
    concern,
    description,
    proofURL,
    actionTaken,
    status,
    notes,
  } = req.body;

  try {
    await getCounselingsCollection().add({
      sid,
      name,
      incidentDate,
      category,
      concern,
      description,
      proofURL,
      actionTaken,
      status,
      notes,
    });

    res.status(200).send({
      message: `Counseling record added successfully for Student: ${sid}.`,
    });
  } catch (error) {
    res
      .status(404)
      .send({ error: `Cannot add a counseling record for Student: ${sid}` });
  }
};

const getAllCounseling = async (req, res) => {
  const snapshot = await getCounselingsCollection().get();

  try {

    if(snapshot.empty){
        return res.status(404).send({error: `There is no counseling records available.`});
    }

    const counselings = snapshot.docs.map((counseling) => ({
      _id: counseling.id,
      ...counseling.data(),
    }));

    res.status(200).send(counselings);
  } catch (error) {
    res.status(404).send({error: `Failed to retrieve counseling records.`});
  }
};

const getCounselings = async (req, res) => {
  const { sid } = req.params;

  try {
    const snapshot = await getCounselingsCollection()
      .where("sid", "==", sid)
      .get();

    if (snapshot.empty) {
      return res
        .status(400)
        .send({ error: `Student: ${sid} doesnt have any counseling records.` });
    }

    const counselings = snapshot.docs.map((counseling) => ({
      _id: counseling.id,
      ...counseling.data(),
    }));

    res.status(200).send(counselings);
  } catch (error) {
    res.status(404).send({
      error: `Failed to retrieve counseling records for the student.`,
    });
  }
};

const deleteCounseling = async (req, res) => {
  const { id } = req.params;

  try {
    const counselingDocRef = getCounselingsCollection().doc(id);
    const counselingDoc = await counselingDocRef.get();

    if (!counselingDoc.exists) {
      return res.status(404).send({ error: `Counseling Record not found.` });
    }

    await counselingDocRef.delete();

    res.status(200).send({ message: `Counseling Record: ${id} deleted.` });
  } catch (error) {
    res.status(404).send({ error: `Failed to delete counseling record.` });
  }
};

const updateCounseling = async (req, res) => {
  const { id } = req.params;

  const {
    sid,
    name,
    incidentDate,
    category,
    concern,
    description,
    proofURL,
    actionTaken,
    status,
    notes,
  } = req.body;

  try {
    const counselingDocRef = getCounselingsCollection().doc(id);

    const snapshot = await counselingDocRef.get();

    if (!snapshot.exists) {
      return res
        .status(404)
        .send({ error: `There is no counseling records for this student.` });
    }

    await counselingDocRef.update({
      sid,
      name,
      incidentDate,
      category,
      concern,
      description,
      proofURL,
      actionTaken,
      status,
      notes,
    });

    res
      .status(202)
      .send({ message: `Counseling record updated successfully.` });
  } catch (error) {
    res.status(404).send({ error: `Failed to update counseling record.` });
  }
};

module.exports = {
  addCounseling,
  getAllCounseling,
  deleteCounseling,
  getCounselings,
  updateCounseling,
};
