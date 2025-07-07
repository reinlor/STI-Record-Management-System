const admin = require("../firebase");

const {
  getLateSlipsCollection,
  getAbsentSlipsCollection,
  getIDPassCollection,
} = require("../models/slipModel");

const addLateSlip = async (req, res) => {
  const { sid } = req.params;
  const { name, program, section, email, reason, proofUrl, timeCreated } =
    req.body;

  try {
    await getLateSlipsCollection().add({
      sid,
      name,
      program,
      section,
      email,
      reason,
      proofUrl,
      timeCreated,
    });

    res.status(200).send({ message: `Late slip added to Student: ${sid}` });
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
};

const addAbsentSlip = async (req, res) => {
  const { sid } = req.params;
  const {
    name,
    program,
    section,
    email,
    excuseLetterURL,
    medicalCertificateURL,
    guardianValidIDURL,
    timeCreated,
  } = req.body;

  try {
    await getAbsentSlipsCollection().add({
      sid,
      name,
      program,
      section,
      email,
      excuseLetterURL,
      medicalCertificateURL,
      guardianValidIDURL,
      timeCreated,
    });

    res.status(200).send({ message: `Absent slip added to Student: ${sid}` });
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
};

const addIDPass = async (req, res) => {
  const { sid } = req.params;
  const { name, program, section, email, reason, timeCreated } = req.body;

  try {
    await getIDPassCollection().add({
      sid,
      name,
      program,
      section,
      email,
      reason,
      timeCreated,
    });

    res.status(200).send({ message: `ID slip added to Student: ${sid}` });
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
};

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

module.exports = {
  addLateSlip,
  getAllLateSlip,
  getLateSlip,
  addAbsentSlip,
  getAllAbsentSlip,
  getAbsentSlip,
  addIDPass,
  getAllIDPass,
  getIDPass
};
