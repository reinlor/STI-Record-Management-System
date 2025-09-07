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

// Controller function for adding announcement
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

// Controller function for getting announcements
const getAnnouncement = async (req, res) => {
    try {
        const announcementDocRef = getContentManagementCollection().doc("announcement");
        const docSnapshot = await announcementDocRef.get();

        if (!docSnapshot.exists){
            return res.status(404).json({ error: "No announcements found." });
        }

        const messages = docSnapshot.data().messages || [];

        const cutOffDate = new Date();
        cutOffDate.setDate(cutOffDate.getDate() - 30); 

        const recentAnnouncements = messages.filter(announcement => {
            if (!announcement.timeCreated) return false;
            const announcementDate = announcement.timeCreated.toDate();
            return announcementDate >= cutOffDate;
        });

        res.status(200).json( {announcements: recentAnnouncements });
    } catch (error) {
        console.error("Error fetching announcements:", error);
        res.status(500).json({ error: "Failed to fetch announcements." });
    }
}

// Controller function for adding program
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

// Controller function for getting programs
const getProgram = async (req, res) => {
    try {
        const programDocRef = getContentManagementCollection().doc("programStrand");
        const docSnapshot = await programDocRef.get();
    
        if (!docSnapshot.exists) {
        return res.status(404).json({ error: "No programs found." });
        }
    
        const programData = docSnapshot.data().program || [];
        res.status(200).json({ programs: programData });
    } catch (error) {
        console.error("Error fetching programs:", error);
        res.status(500).json({ error: "Failed to fetch programs." });
    }
}

// Controller function for adding strand
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

// Controller function for getting strands
const getStrand = async (req, res) => {
    try {
        const strandDocRef = getContentManagementCollection().doc("programStrand");
        const docSnapshot = await strandDocRef.get();
    
        if (!docSnapshot.exists) {
        return res.status(404).json({ error: "No strands found." });
        }
    
        const strandData = docSnapshot.data().strand || [];
        res.status(200).json({ strands: strandData });
    } catch (error) {
        console.error("Error fetching strands:", error);
        res.status(500).json({ error: "Failed to fetch strands." });
    }
}

// Controller function for changing wellness link
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

// Controller function for getting wellness link
const getWellnessLink = async (req, res) => {
    try {
        const wellnessDocRef = getContentManagementCollection().doc("wellness");
        const docSnapshot = await wellnessDocRef.get();

        if (!docSnapshot.exists){
            return res.status(404).json({ error: "No wellness link found." });
        }

        const wellnessLink = docSnapshot.data().link || "N/A";
        res.status(200).json({ link: wellnessLink });
    } catch (error) {
        console.error("Error fetching wellness link:", error);
        res.status(500).json({ error: "Failed to fetch wellness link." });
    }
}

module.exports = { addAnnouncement, addProgram, addStrand, changeWellnessLink, getProgram, getStrand, getWellnessLink, getAnnouncement };
