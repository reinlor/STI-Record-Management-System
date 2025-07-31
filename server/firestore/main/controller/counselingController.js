const { getCounselingsCollection } = require("../models/counselingModel");
const Joi = require('joi');

// CounselingInfo Schema
const counselingSchema = Joi.object({
  sid:             Joi.string().required(),
  name:            Joi.string().required(),
  incidentDate:    Joi.string().required(),
  category:        Joi.string().required(),
  concern:         Joi.string().required(),
  description:     Joi.string().optional(),
  proofUrl:        Joi.string().required(),
  actionTaken:     Joi.string().required(),
  status:          Joi.string().required(),
  notes:           Joi.string().required(),   
})

const updateSchema = Joi.object({
  sid:             Joi.string().optional(),
  name:            Joi.string().optional(),
  incidentDate:    Joi.string().optional(),
  category:        Joi.string().optional(),
  concern:         Joi.string().optional(),
  description:     Joi.string().optional(),
  proofUrl:        Joi.string().optional(),
  actionTaken:     Joi.string().optional(),
  status:          Joi.string().optional(),
  notes:           Joi.string().optional(),   
})

// Controller Function for adding Counseling Info
const addCounseling = async (req, res) => {
  try {
    counselingSchema.validate(req.body);
    const { error, value: newCounseling } = counselingSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    };
    const sid = newCounseling.sid
    await getCounselingsCollection().doc().set(newCounseling);

    res.status(200).send({
      message: `Counseling record added successfully for Student: ${sid}.`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller Function for retrieving all Counseling Info
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

// Controller Function for retrieving Counseling Info by ID
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

// For Deleting Counseling Info
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


// For updating Counseling Info
const updateCounseling = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const { error, value: validatedUpdates } = updateSchema.validate(updates);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    if (Object.keys(validatedUpdates).length === 0) {
      return res.status(400).json({ error: "No valid update data provided." });
    }

    const counselingDocRef = getCounselingsCollection().doc(id);
    const snapshot = await counselingDocRef.get();

    if (!snapshot.exists) {
      return res
        .status(404)
        .send({ error: `Counseling record with ID: ${id} not found.` });
    }

    await counselingDocRef.update(validatedUpdates);

    res
      .status(200) 
      .send({
        message: `Counseling record with ID: ${id} updated successfully.`,
        updates: validatedUpdates 
      });
  } catch (error) {
    console.error("Update Counseling error:", error);
    res.status(500).send({ error: `Failed to update counseling record: ${error.message}` })
  }
};

module.exports = {
  addCounseling,
  getAllCounseling,
  deleteCounseling,
  getCounselings,
  updateCounseling,
};
