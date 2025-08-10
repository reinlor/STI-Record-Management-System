const Joi = require("joi");
const { getReferralFormCollection } = require("../models/referralModel");

// Referral Schema
const referralSchema = Joi.object({
  employeeID: Joi.string().required(),
  schoolYear: Joi.string().required(),
  gradeLevel: Joi.string().required(),
  // sid: Joi.string().required(),
  studentName: Joi.string().required(),
  program: Joi.string().required(),
  gender: Joi.string().required(),
  status: Joi.string().required(),
  age: Joi.number().required().options({ convert: true }),
  referredBy: Joi.string().required(),
  areasOfConcern: Joi.array().required(),
  actionRequired: Joi.string().required().allow(''),
  levelOfPriority: Joi.string().required(),
  actionTaken: Joi.string().required(),
  reasonForReferral: Joi.string().required(),
  initialAction: Joi.string().required().allow(''),
  preparedDate: Joi.string().required(),
  feedBackDate: Joi.string().required().allow(''),
  receivedBy: Joi.string().required().allow(''),
  receivedDate: Joi.string().required().allow(''),
});

const updateSchema = Joi.object({
  employeeID: Joi.string().optional(),
  schoolYear: Joi.string().optional(),
  // sid: Joi.string().optional(),
  studentName: Joi.string().optional(),
  program: Joi.string().optional(),
  section: Joi.string().optional(),
  gender: Joi.string().optional(),
  status: Joi.string().optional(),
  age: Joi.number().optional().options({ convert: true }),
  referredBy: Joi.string().optional(),
  areasOfConcern: Joi.array().optional(),
  actionRequired: Joi.string().optional().allow(''),
  levelOfPriority: Joi.string().optional(),
  actionTaken: Joi.string().optional(),
  reasonForReferral: Joi.string().optional(),
  initialAction: Joi.string().optional().allow(''),
  preparedDate: Joi.string().optional(),
});

// Controller Function for adding
const addReferral = async (req, res) => {
  try {
    referralSchema.validate(req.body);

    const { error, value: newReferral } = referralSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    await getReferralFormCollection().doc().set(newReferral);

    res.status(201).json({
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
    const { id } = req.params;
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

    res.status(201).json({
      message: `Referral Form (${id}) successfully updated.`,
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

    res.status(200).json(referrals);
  } catch (error) {
    console.error(`Referral form error: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

const getReferral = async (req, res) => {
  try {
    const { id } = req.params;

    const referralRef = getReferralFormCollection().doc(id);
    const snapshot = await referralRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        error: `Referral form with ID ${id} does not exist.`,
      });
    }

    const referralData = {
      id: snapshot.id,
      ...snapshot.data(),
    };

    res.status(200).json(referralData);
  } catch (error) {
    res.status(500).json({
      error: `Error fetching the referral form: ${error.message}`,
    });
  }
};

// Controller function to display referral from a specific Employee No.
const getReferralById = async (req, res) => {
  try {
    const { employeeID } = req.params;

    if (!employeeID) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    const snapshot = await getReferralFormCollection().where('employeeID', '==', employeeID).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "No referrals found for this employee ID" });
    }

    const referrals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(referrals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { addReferral, updateReferral, getAllReferral, getReferral, getReferralById };
