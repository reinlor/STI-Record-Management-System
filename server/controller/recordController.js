const { getRecordCollection } = require("../models/recordModel");

const admin = require("../firebase");

const getAllRecords = async (req, res) => {
  const snapshot = await getRecordCollection().get();

  try {
    const records = snapshot.docs.map((record) => ({
      id: record.id,
      ...record.data(),
    }));

    res.status(200).send(records);
  } catch (error) {
    res.status(404).send({ error: `Failed to retrieve all records.` });
  }
};

const getRecords = async (req, res) => {
  const { id } = req.params;

  try {
    const snapshot = await getRecordCollection()
      .where("suspect", "==", id)
      .get();

    if (snapshot.empty) {
      return res
        .status(404)
        .send({ error: `No records available for User: ${id}` });
    }

    const records = snapshot.docs.map((record) => ({
      id: record.id,
      ...record.data(),
    }));

    res.status(200).send(records);
  } catch (error) {
    res.status(404).send({ error: `Unable to retrieve user's records.` });
  }
};

const addRecord = async (req, res) => {
  const { id } = req.params;
  const { category, details, offense } = req.body;

  try {
    await getRecordCollection().add({
      category: category,
      createdAt: `${
        // formatted creation date in MM/DD/YYYY format
        String(new Date().getMonth() + 1).padStart(2, "0")
      }/${String(new Date().getDate()).padStart(
        2,
        "0"
      )}/${new Date().getFullYear()}`,
      details: details,
      offense: offense,
      resolved: false,
      suspect: id,
    });

    res.status(200).send({ message: `Added new record for User: ${id}` });
  } catch (error) {
    res.status(404).send({ error: `Failed to add a record for User: ${id}` });
  }
};

const updateRecord = async (req, res) => {
  const { id } = req.params;
  const { category, details, offense, resolved } = req.body;

  try {
    const recordDocRef = getRecordCollection().doc(id);

    const snapshot = await recordDocRef.get();

    if (!snapshot.exists) {
      return res.status(400).send({ error: `Record not found.` });
    }

    await recordDocRef.update({
      category,
      details,
      offense,
      resolved,
    });

    res.status(200).send({message: `Record updated successfully.`});
  } catch (error) {
    return res.status(400).send({ error: `Record update failed.` });
  }
};

const deleteRecord = async (req, res) => {
  const { id } = req.params;

  try {
    await getRecordCollection().doc(id).delete();

    res.status(200).send({ message: `Record successfully deleted.` });
  } catch (error) {
    res.status(404).send({ error: `Record deletion is unsuccessful.` });
  }
};

module.exports = { addRecord, deleteRecord, getAllRecords, getRecords, updateRecord };
