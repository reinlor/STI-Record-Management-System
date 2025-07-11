const admin = require("../firebase");

const {
  getLateSlipsCollection,
  getAbsentSlipsCollection,
  getIDPassCollection,
} = require("../models/slipModel");

const addLateSlip = async (req, res) => {
  const { sid } = req.params;
  const newSlip = req.body;

  try {
    await getLateSlipsCollection().add({
      sid,
      ...newSlip,
    });

    res.status(200).send({ message: `Late slip added to Student: ${sid}` });
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
};

const addAbsentSlip = async (req, res) => {
  const { sid } = req.params;
  const newSlip = req.body;

  try {
    await getAbsentSlipsCollection().add({
      sid,
      ...newSlip,
    });

    res.status(200).send({ message: `Absent slip added to Student: ${sid}` });
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
};

const addIDPass = async (req, res) => {
  const { sid } = req.params;
  const newSlip = req.body;

  try {
    await getIDPassCollection().add({
      sid,
      ...newSlip,
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

const uploadImage = async (req, res) => {
  try {
    // Upload the image file from temporary upload directory to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "proofs", // Store inside "proofs" folder in your Cloudinary account
    });

    // Delete the local temporary file after successful upload
    fs.unlinkSync(req.file.path);

    // Return Cloudinary URL and public ID for further use
    res.status(200).json({
      imageUrl: result.secure_url,
      publicID: result.public_id,
    });
  } catch (err) {
    console.error("Cloudinary Image Upload Error:", err);
    res.status(500).json({ error: "Failed to upload image." });
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
  uploadImage,
};
