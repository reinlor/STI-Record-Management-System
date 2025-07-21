const Joi = require ('joi');
const { getReferralFormCollection } = require("../models/referralModel");

// Referral Schema
const referralSchema = Joi.object({
  schoolYear:          Joi.string().required(),
  sid:                 Joi.string().required(),
  studentName:         Joi.string().required(),
  program:             Joi.string().required(),
  section:             Joi.string().required(),
  gender:              Joi.string().required(),
  status:              Joi.string().required(),
  age:                 Joi.number().required(),
  referredBy:          Joi.string().required(),
  areasOfConcern:      Joi.string().required(),
  actionRequired:      Joi.string().required(),
  levelOfPriority:     Joi.string().required(),
  actionTaken:         Joi.string().required(),
  reasonForRefferal:   Joi.string().required(),
  initialAction:       Joi.string().required(),
  timeCreated:         Joi.date().required()
});

const updateSchema = Joi.object({
  schoolYear:          Joi.string().optional(),
  sid:                 Joi.string().optional(),
  studentName:         Joi.string().optional(),
  program:             Joi.string().optional(),
  section:             Joi.string().optional(),
  gender:              Joi.string().optional(),
  status:              Joi.string().optional(),
  age:                 Joi.string().optional(),
  referredBy:          Joi.string().optional(),
  areasOfConcern:      Joi.string().optional(),
  actionRequired:      Joi.string().optional(),
  levelOfPriority:     Joi.string().optional(),
  actionTaken:         Joi.string().optional(),
  reasonForRefferal:   Joi.string().optional(),
  initialAction:       Joi.string().optional(),
  timeCreated:         Joi.date().optional()
});

// Controller Function for adding 
const addReferral = async (req, res) => {
  try {
    referralSchema.validate(req.body);

    const { error, value: newReferral } = referralSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    };
    await getReferralFormCollection().doc().set(newReferral);

    res.status(200).json({
      message: `Referral form added successfully.`,
    });

  } catch (error) {
    console.error(`Referral form error: ${error}`);
    res.status(500).json({ error: error.message });
  }
};


// Controller Function to update referrall submission
const updateReferral = async (req, res) => {
  try {
    const { id,sid } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No update data provided" });
    }
    

    const { error, value: validatedUpdates } = updateSchema.validate(updates);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const referralRef = getReferralFormCollection().doc(id);

    const doc = await referralRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Student not found" });
    }

    await referralRef.set(validatedUpdates, { merge: true });

    res.status(200).json({
      message: `Referral Form (${sid}) successfully updated.`,
      updates: updates,
    });
  } catch (error) {
    console.error(`Referral form error: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

// Controller Function to retrieve all referral submission
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
