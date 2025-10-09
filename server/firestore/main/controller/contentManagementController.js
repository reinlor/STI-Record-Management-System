const { Timestamp } = require("firebase-admin/firestore");
const cloudinary = require("../../../config/cloudinary.js");
const streamifier = require("streamifier");

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

// Schema for Violations
const violationCategorySchema = Joi.object({
  violationCategory: Joi.string().required().empty(""),
  priorityLevel: Joi.string().required().empty(""),
  violations: Joi.array().items(Joi.string().required().empty("")).required(),
  offense: Joi.string().required().empty(""),
}).required();

// Schema for Updating Violations
const violationCategoryUpdateSchema = Joi.object({
  oldCategoryName: Joi.string().optional().empty(""),
  violationCategory: Joi.string().optional().empty(""),
  priorityLevel: Joi.string().optional().empty(""),
  violations: Joi.array().items(Joi.string().optional().empty("")).optional(),
  offense: Joi.string().optional().empty(""),
});

const updateSchoolPeriodSchema = Joi.object({
  schoolYear: Joi.string().required().empty(""),
  seniorHigh: Joi.string().required().empty(""),
  tertiary: Joi.string().required().empty(""),
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
    const announcementDocRef =
      getContentManagementCollection().doc("announcement");
    const docSnapshot = await announcementDocRef.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({ error: "No announcements found." });
    }

    const messages = docSnapshot.data().messages || [];

    const cutOffDate = new Date();
    cutOffDate.setDate(cutOffDate.getDate() - 30);

    const recentAnnouncements = messages.filter((announcement) => {
      if (!announcement.timeCreated) return false;
      const announcementDate = announcement.timeCreated.toDate();
      return announcementDate >= cutOffDate;
    });

    res.status(200).json({ announcements: recentAnnouncements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ error: "Failed to fetch announcements." });
  }
};

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
};

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
};

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

    if (!docSnapshot.exists) {
      return res.status(404).json({ error: "No wellness link found." });
    }

    const wellnessLink = docSnapshot.data().link || "N/A";
    res.status(200).json({ link: wellnessLink });
  } catch (error) {
    console.error("Error fetching wellness link:", error);
    res.status(500).json({ error: "Failed to fetch wellness link." });
  }
};

// Controller function for adding college student handbook PDF
const addCollegeStudentHandbook = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files are allowed." });
    }

    const collegeStudentHandbookDocRef = getContentManagementCollection().doc(
      "collegeStudentHandbook"
    );

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "studentHandbook",
        public_id: "collegeStudentHandbook", // Always overwrite the same doc
        overwrite: true,
        format: "pdf",
      },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary upload failed:", error);
          return res.status(500).json({
            error: "Cloudinary upload failed",
            details: error.message,
          });
        }

        await collegeStudentHandbookDocRef.set(
          {
            link: result.secure_url,
            public_id: result.public_id,
            uploadedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        res.json({
          message: "College Student Handbook uploaded successfully",
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    console.error("Error updating college student handbook link:", error);
    res
      .status(500)
      .json({ error: "Failed to update college student handbook link." });
  }
};

// Controller function for getting college student handbook PDF link
const getCollegeStudentHandbook = async (req, res) => {
  try {
    const collegeStudentHandbook = getContentManagementCollection().doc(
      "collegeStudentHandbook"
    );
    const docSnapshot = await collegeStudentHandbook.get();

    if (!docSnapshot.exists) {
      return res
        .status(404)
        .json({ error: "College Student Handbook not found" });
    }

    const { link } = docSnapshot.data();

    res.status(200).json({ link });
  } catch (error) {
    console.error("Error retrieving college student handbook:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve college student handbook." });
  }
};

// Controller function for adding SHS student handbook PDF
const addShsStudentHandbook = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files are allowed." });
    }

    const shsStudentHandbookDocRef =
      getContentManagementCollection().doc("shsStudentHandbook");

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "studentHandbook",
        public_id: "shsStudentHandbook", // Always overwrite the same doc
        overwrite: true,
        format: "pdf",
      },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary upload failed:", error);
          return res.status(500).json({
            error: "Cloudinary upload failed",
            details: error.message,
          });
        }

        await shsStudentHandbookDocRef.set(
          {
            link: result.secure_url,
            public_id: result.public_id,
            uploadedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        res.json({
          message: "SHS Student Handbook uploaded successfully",
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    console.error("Error updating SHS student handbook link:", error);
    res
      .status(500)
      .json({ error: "Failed to update SHS student handbook link." });
  }
};

// Controller function for getting SHS student handbook PDF link
const getShsStudentHandbook = async (req, res) => {
  try {
    const shsStudentHandbook =
      getContentManagementCollection().doc("shsStudentHandbook");
    const docSnapshot = await shsStudentHandbook.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({ error: "SHS Student Handbook not found" });
    }

    const { link } = docSnapshot.data();

    res.status(200).json({ link });
  } catch (error) {
    console.error("Error retrieving SHS student handbook:", error);
    res.status(500).json({ error: "Failed to retrieve SHS student handbook." });
  }
};

// Controller function for getting violation data
const getViolations = async (req, res) => {
  try {
    const violation = getContentManagementCollection().doc("violations");
    const docSnapshot = await violation.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({ error: "Violation not found" });
    }

    res.status(200).json(docSnapshot.data());
  } catch (error) {
    console.error("Error retrieving violation data:", error);
    res.status(500).json({ error: "Failed to retrieve violation data." });
  }
};

// Controller function for getting current school periods
const getSchoolPeriod = async (req, res) => {
  try {
    const schoolPeriod = getContentManagementCollection().doc("schoolPeriod");
    const docSnapshot = await schoolPeriod.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({ error: "School period not found" });
    }

    res.status(200).json(docSnapshot.data());
  } catch (error) {
    console.error("Error retrieving school period data:", error);
    res.status(500).json({ error: "Failed to retrieve school period data." });
  }
};

// Controller function for adding
const addViolationCategory = async (req, res) => {
  try {
    const { violationCategoryName, priorityLevel, violations, offense } = req.body;

    const { error } = violationCategorySchema.validate({
      violationCategory: violationCategoryName,
      priorityLevel,
      violations,
      offense,
    });

    if (error) {
      return res.status(400).json({
        error: "Invalid violation category data",
        details: error.details,
      });
    }

    const violationsDocRef = getContentManagementCollection().doc("violations");
    // always set or merge to ensure doc exists
    await violationsDocRef.set(
      {
        [violationCategoryName]: {
          priorityLevel,
          violations,
          offense,
        },
      },
      { merge: true }
    );

    res.status(200).json({
      message: `Violation Category ${violationCategoryName} added successfully!`,
    });
  } catch (error) {
    console.error("Error adding violation category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller function for updating violation categories
const updateViolationCategory = async (req, res) => {
  try {
    const { oldCategoryName, violationCategoryName, priorityLevel, violations, offense } = req.body;

    const { error } = violationCategoryUpdateSchema.validate({
      oldCategoryName,
      violationCategory: violationCategoryName,
      priorityLevel,
      violations,
      offense,
    });

    if (error) {
      return res.status(400).json({
        error: "Invalid violation category data",
        details: error.details,
      });
    }

    const violationsDocRef = getContentManagementCollection().doc("violations");
    const docSnapshot = await violationsDocRef.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({
        error: "Violations document is missing.",
      });
    }

    const data = docSnapshot.data();

    if (oldCategoryName && oldCategoryName !== violationCategoryName) {
      if (!data[oldCategoryName]) {
        return res.status(404).json({
          error: `Violation Category ${oldCategoryName} does not exist.`,
        });
      }
      await violationsDocRef.update({
        [violationCategoryName]: {
          priorityLevel,
          violations,
          offense,
        },
        [oldCategoryName]: admin.firestore.FieldValue.delete(),
      });

      return res.status(200).json({
        message: `Violation Category ${oldCategoryName} renamed to ${violationCategoryName} and updated successfully!`,
      });
    }

    if (!data[violationCategoryName]) {
      return res.status(404).json({
        error: `Violation Category ${violationCategoryName} does not exists.`,
      });
    }

    await violationsDocRef.update({
      [violationCategoryName]: {
        priorityLevel,
        violations,
        offense,
      },
    });

    res.status(200).json({
      message: `Violation Category ${violationCategoryName} updated successfully!`,
    });
  } catch (error) {
    console.error("Error updating violation category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller function for deleting a violation category
const deleteViolationCategory = async (req, res) => {
  try {
    const { violationCategoryName } = req.body || req.query || {};

    if (!violationCategoryName) {
      return res.status(400).json({ error: "violationCategoryName required" });
    }

    const violationsDocRef = getContentManagementCollection().doc("violations");
    const docSnapshot = await violationsDocRef.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({ error: "Violations document is missing." });
    }

    const data = docSnapshot.data();
    if (!data[violationCategoryName]) {
      return res.status(404).json({ error: `Violation Category ${violationCategoryName} does not exists.` });
    }

    await violationsDocRef.update({
      [violationCategoryName]: admin.firestore.FieldValue.delete(),
    });

    res.status(200).json({ message: `Violation Category ${violationCategoryName} deleted successfully.` });
  } catch (error) {
    console.error("Error deleting violation category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Controller function for updating School Period
const updateSchoolPeriod = async (req, res) => {
  try {
    const { error, value: newSchoolPeriod } = updateSchoolPeriodSchema.validate(
      req.body
    );

    if (error) {
      return res.status(400).json({ error: `Invalid school period data` });
    }

    const schoolPeriodDocRef =
      getContentManagementCollection().doc("schoolPeriod");
    const docSnapshot = await schoolPeriodDocRef.get();

    if (!docSnapshot.exists) {
      return res
        .status(404)
        .json({ error: `School Period Document doesn't exists.` });
    }

    await schoolPeriodDocRef.set(newSchoolPeriod, { merge: true });

    res.status(200).json({ message: `School period updated successfully!` })
  } catch (error) {
    console.error("Error updating school period:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller function for getting all content data
const getAllContent = async (req, res) => {
  try {
    const contents = await getContentManagementCollection().get()
    const contentData = contents.docs.map((doc) => ({
      [doc.id]: doc.data(),
    }));

    res.status(200).json(contentData);
  } catch (error) {
    console.error("Error retrieving content management data:", error);
    res.status(500).json({ error: "Failed to retrieve content management data." });
  }
}

const getAllOffenses = async (req, res) => {
  try {
    const offenses = getContentManagementCollection().doc('offenses');
    const docSnapshot = await offenses.get()

    if (!docSnapshot.exists) {
      return res.status(404).json({ error: "Offenses not found" });
    }

    res.status(200).json(docSnapshot.data());
  } catch (error) {
    console.error("Error retrieving offenses data:", error);
    res.status(500).json({ error: "Failed to retrieve offenses data." });
  }
}


module.exports = {
  addAnnouncement,
  addProgram,
  addStrand,
  changeWellnessLink,
  getProgram,
  getStrand,
  getWellnessLink,
  getAnnouncement,
  addCollegeStudentHandbook,
  getCollegeStudentHandbook,
  addShsStudentHandbook,
  getShsStudentHandbook,
  getViolations,
  getSchoolPeriod,
  addViolationCategory,
  updateViolationCategory,
  deleteViolationCategory,
  updateSchoolPeriod,
  getAllContent,
  getAllOffenses
};
