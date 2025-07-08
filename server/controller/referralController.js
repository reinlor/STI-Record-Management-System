const admin = require("../firebase");

const { getReferralFormCollection } = require("../models/referralModel");
const { merge } = require("../routes/referralRoute");

const addReferral = async (req, res) => {
  try {
    const newReferral = req.body;
    const uid = newReferral.uid;

    await getReferralFormCollection().add(newReferral);

    res.status(201).json({
      message: `Referral form added successfully.`,
    });
  } catch (error) {
    console.error(`Referral form error: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

const updateReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const referralDocRef = getReferralFormCollection().doc(id);
    const snapshot = await referralDocRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        message: `There's no referral form with an ID of ${id}`,
      });
    }

    await referralDocRef.set(updates, { merge: true });

    res.status(201).json({
      message: `Referral Form (${id}) successfully updated.`,
      updates: updates,
    });
  } catch (error) {
    console.error(`Referral form error: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

const getAllReferral = async (req, res) => {
  try {
    const snapshot = await getReferralFormCollection().get();

    if (snapshot.empty) {
      return res.status(404).json({
        error: `There is no referral forms to fetch.`,
      });
    }

    const referrals = snapshot.docs.map((referral) => ({
      id: referral.id,
      ...referral.data(),
    }));

    res.status(201).json(referrals);
  } catch (error) {
    console.error(`Referral form error: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addReferral, updateReferral, getAllReferral };
