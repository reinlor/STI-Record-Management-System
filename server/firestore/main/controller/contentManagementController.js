const { Timestamp } = require("firebase-admin/firestore");

const {
  getContentManagementCollection,
} = require("../models/contentManagementModel.js");

const Joi = require("joi");

// Schema for announcement
const announcementSchema = Joi.object({
  description: Joi.string().required().empty(""),
  timeCreated: Joi.string().optional().empty(""),
  title: Joi.string().required().empty(""),
}).required();

// Schema for programStrand
const programStrandSchema = Joi.object({
  acronym: Joi.string().required().empty(""),
  name: Joi.string().required().empty(""),
}).required();

// Schema for wellness
const wellnessSchema = Joi.object({
  link: Joi.string().required().empty(""),
});

const addAnnouncement = async (req, res) => {
  try {
    const { error, value: newAnnouncementData } = announcementSchema.validate(
      req.body
    );

    if (error) {
      return res
        .status(400)
        .json({ error: "Invalid announcement data", details: error.details });
    }

    const announcementDocRef =
      getContentManagementCollection().doc("announcement");
    const docSnapshot = await announcementDocRef.get();

    const updatedData = docSnapshot.exists
      ? docSnapshot.data()
      : { id: "announcement", messages: [] };
    const existingDataArray = updatedData.messages || [];

    existingDataArray.push({
      ...newAnnouncementData,
      timeCreated: Timestamp.fromDate(new Date()),
    });

    updatedData.messages = existingDataArray;
    await announcementDocRef.set(updatedData, { merge: true });

    res.status(200).json({ message: "New announcement added successfully." });
  } catch (error) {
    console.error("Error adding announcement:", error);
    res.status(500).json({ error: "Failed to add announcement." });
  }
};

const addProgram = async (req, res) => {
  try {
    const { error, value: newProgramData } = programStrandSchema.validate(
      req.body
    );

    if (error) {
      return res
        .status(400)
        .json({ error: "Invalid program data", details: error.details });
    }

    const programDocRef = getContentManagementCollection().doc("programStrand");
    const docSnapshot = await programDocRef.get();

    const updatedData = docSnapshot.exists
      ? docSnapshot.data()
      : { id: "programStrand", program: [], strand: [] };

    const existingDataArray = updatedData.program || [];

    existingDataArray.push({
      ...newProgramData,
    });

    updatedData.program = existingDataArray;
    await programDocRef.set(updatedData, { merge: true });

    res.status(200).json({ message: "New program added successfully." });
  } catch (error) {
    console.error("Error adding program:", error);
    res.status(500).json({ error: "Failed to add program." });
  }
};

const addStrand = async (req, res) => {
  try {
    const { error, value: newStrandData } = programStrandSchema.validate(
      req.body
    );

    if (error) {
      return res
        .status(400)
        .json({ error: "Invalid strand data", details: error.details });
    }

    const strandDocRef = getContentManagementCollection().doc("programStrand");
    const docSnapshot = await strandDocRef.get();

    const updatedData = docSnapshot.exists
      ? docSnapshot.data()
      : { id: "programStrand", program: [], strand: [] };

    const existingDataArray = updatedData.strand || [];

    existingDataArray.push({
      ...newStrandData,
    });

    updatedData.strand = existingDataArray;
    await strandDocRef.set(updatedData, { merge: true });

    res.status(200).json({ message: "New strand added successfully." });
  } catch (error) {
    console.error("Error adding strand:", error);
    res.status(500).json({ error: "Failed to add strand." });
  }
};

const changeWellnessLink = async (req, res) => {
  try {
    const { error, value: newWellnessLink } = wellnessSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ error: "Invalid wellness link", details: error.details });
    }

    const wellnessDocRef = getContentManagementCollection().doc("wellness");

    await wellnessDocRef.set({ link: newWellnessLink.link }, { merge: true });
    res.status(200).json({ message: "Wellness link updated successfully." });
  } catch (error) {
    console.error("Error updating wellness link:", error);
    res.status(500).json({ error: "Failed to update wellness link." });
  }
};

module.exports = { addAnnouncement, addProgram, addStrand, changeWellnessLink };
