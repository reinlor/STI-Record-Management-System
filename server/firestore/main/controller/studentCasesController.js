// StudentCasesController.js
const { getViolationsCollection } = require("../models/studentCasesModel");
const { getChartDataCollection } = require("../models/chartDataModel");
const { getNotificationCollection } = require("../models/notificationModel.js");
const { getStudentCollection } = require("../models/studentModel.js");
const { getContentManagementCollection } = require("../models/contentManagementModel.js");

const Joi = require("joi");
const { FieldValue } = require("firebase-admin/firestore");
const cloudinary = require("../../../config/cloudinary.js");
const fs = require("fs");

// Violation Schema
const violationSchema = Joi.object({
  sid: Joi.string().required().empty(""),
  name: Joi.string().required().empty(""),
  programSection: Joi.string().required().empty(""),
  initiationDate: Joi.string().required().empty(""),
  initialTime: Joi.string().required().empty(""),
  counselingType: Joi.string().required().empty(""),
  violation: Joi.string().required().empty(""),
  detailedDescription: Joi.string().optional().empty(""),
  proofDescription: Joi.string().optional().empty(""),
  actionTaken: Joi.string().optional().empty(""),
  dateOfAction: Joi.string().required().empty(""),
  status: Joi.string().required().empty(""),
  notes: Joi.string().optional().empty(""),
  proofUrl: Joi.string().optional().empty(""),
  priorityLevel: Joi.string().optional().empty(""),
  timeCreated: Joi.date().optional().empty(""),
  processedBy: Joi.string().optional().empty(""),
});
const updateSchema = Joi.object({
  sid: Joi.string().optional(),
  name: Joi.string().optional(),
  programSection: Joi.string().optional(),
  initiationDate: Joi.string().optional(),
  initialTime: Joi.string().optional(),
  counselingType: Joi.string().optional(),
  violation: Joi.string().optional(),

  detailedDescription: Joi.string().optional(),
  proofDescription: Joi.string().optional(),
  actionTaken: Joi.string().optional(),
  dateOfAction: Joi.string().optional(),
  status: Joi.string().optional(),
  notes: Joi.string().optional(),
  proofUrl: Joi.string().optional(),
  priorityLevel: Joi.string().optional().empty(""),
  timeCreated: Joi.date().optional(),
  processedBy: Joi.string().optional().empty(""),
  lastUpdate: Joi.date().optional(),
});

async function assignViolationToStudent(sid, violationName) {
  try {
    if (!sid || !violationName) {
      console.warn("assignViolationToStudent called with missing sid or violationName");
      return { category: null, newDegree: null, sanction: null };
    }

    const contentRoot = getContentManagementCollection();

    let violationsData = {};
    let offensesData = {};
    try {
      const vDoc = await contentRoot.doc("violations").get();
      if (vDoc.exists) violationsData = vDoc.data();
    } catch (e) {
      console.warn("Could not load content/violations doc:", e.message || e);
    }
    try {
      const oDoc = await contentRoot.doc("offenses").get();
      if (oDoc.exists) offensesData = oDoc.data();
    } catch (e) {
      console.warn("Could not load content/offenses doc:", e.message || e);
    }

    const normalizedViolation = String(violationName).toLowerCase().trim();
    let offenseCategoryName = null;

    if (violationsData && violationsData[violationName]) {
      offenseCategoryName = violationsData[violationName].offense || violationName;
    }

    if (!offenseCategoryName && violationsData && typeof violationsData === "object") {
      for (const [catKey, catVal] of Object.entries(violationsData)) {
        const vlist = catVal && catVal.violations ? catVal.violations : [];
        if (Array.isArray(vlist)) {
          for (const v of vlist) {
            if (String(v).toLowerCase().trim() === normalizedViolation) {
              offenseCategoryName = (catVal && (catVal.offense || catVal.Offense)) || catKey;
              break;
            }
          }
        }
        if (offenseCategoryName) break;
      }
    }

    if (!offenseCategoryName && offensesData && offensesData[violationName]) {
      offenseCategoryName = violationName;
    }

    if (!offenseCategoryName) {
      console.warn(`Could not determine offense category for violation "${violationName}".`);
      return { category: null, newDegree: null, sanction: null };
    }

    const studentRef = getStudentCollection().doc(sid);
    const studentSnap = await studentRef.get();
    if (!studentSnap.exists) {
      console.warn(`Student ${sid} not found when assigning violation for "${violationName}"`);
      return { category: offenseCategoryName, newDegree: null, sanction: null };
    }
    const studentData = studentSnap.data() || {};
    const studentViolations = studentData.violations || {};

    const existingEntry = studentViolations[offenseCategoryName] || {};
    const existingDegree = existingEntry.degree || "";

    const degreeOrder = ["First Offense", "Second Offense", "Third Offense"];
    let newDegree = "First Offense";
    const idx = degreeOrder.indexOf(existingDegree);
    if (idx === -1) newDegree = "First Offense";
    else if (idx < degreeOrder.length - 1) newDegree = degreeOrder[idx + 1];
    else newDegree = degreeOrder[idx];

    const offenseDocEntry = offensesData[offenseCategoryName] || {};
    let sanction =
      offenseDocEntry[newDegree] ||
      offenseDocEntry["Offense"] ||
      offenseDocEntry["offense"] ||
      offenseDocEntry.description ||
      null;

    const updatePayload = {
      violations: {
        [offenseCategoryName]: {
          degree: newDegree,
          sanction: sanction || "",
          lastAssigned: FieldValue.serverTimestamp(),
        },
      },
    };

    await studentRef.set(updatePayload, { merge: true });

    console.log(
      `Assigned violation to student ${sid} -> category: ${offenseCategoryName}, degree: ${newDegree}`
    );

    return { category: offenseCategoryName, newDegree, sanction };
  } catch (err) {
    console.error("Error in assignViolationToStudent:", err);
    return { category: null, newDegree: null, sanction: null };
  }
}
const getAllViolations = async (req, res) => {
  const snapshot = await getViolationsCollection().get();

  try {
    const violations = snapshot.docs.map((violation) => ({
      id: violation.id,
      ...violation.data(),
    }));

    res.status(200).send(violations);
  } catch (error) {
    res.status(404).send({ error: `Failed to retrieve all violation records.` });
  }
};

// Controller function to retrieve violation by ID
const getViolations = async (req, res) => {
  const { sid } = req.params;

  try {
    const snapshot = await getViolationsCollection().where("sid", "==", sid).get();

    if (snapshot.empty) {
      return res.status(404).send({ error: `No violations available for Student: ${sid}` });
    }

    const violations = snapshot.docs.map((violation) => ({
      id: violation.id,
      ...violation.data(),
    }));

    res.status(200).send(violations);
  } catch (error) {
    res.status(404).send({ error: `Unable to retrieve user's violations.` });
  }
};

// Controller Function to add violation
const addViolation = async (req, res) => {
  try {
    let uploadedPublicId = "";
    let proofUrl = "";
    if (req.file) {
      console.log("Uploading file to Cloudinary...");
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "student-case-proof",
      });
      proofUrl = result.secure_url;
      uploadedPublicId = result.public_id;
      console.log("Cloudinary upload result:", result);
      fs.unlinkSync(req.file.path);
    }

    const body = {
      sid: req.body.sid || req.body.studentId,
      name: req.body.name || req.body.studentName,
      programSection: req.body.programSection || req.body.programSection,
      initiationDate: req.body.initiationDate || req.body.dateOfInitiation,
      initialTime: req.body.initialTime || req.body.timeOfInitiation,
      counselingType: req.body.counselingType || req.body.counselingTypeCategory,
      actionTaken: req.body.actionTaken || req.body.actions,
      status: req.body.status || req.body.caseStatus,
      notes: req.body.notes || req.body.counselorNotes,
      violation: req.body.violation,
      detailedDescription: req.body.detailedDescription,
      proofDescription: req.body.proofDescription,
      dateOfAction: req.body.dateOfAction,

      priorityLevel: req.body.priorityLevel || req.body.priorityLevels,
      proofUrl,
      processedBy: req.body.processedBy,
    };

    const violation = {
      ...body,
      proofUrl: proofUrl,
    };

    console.log("Validating body:", req.body);
    const { error, value: newViolation } = violationSchema.validate(violation);

    if (error) {
      if (uploadedPublicId) {
        await cloudinary.uploader.destroy(uploadedPublicId);
      }
      console.log("Validation error:", error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const sid = newViolation.sid;
    const reason = newViolation.counselingType;
    const name = newViolation.name;
    const programSection = newViolation.programSection;

    const serverTimestamp = FieldValue.serverTimestamp();

    const chartData = {
      sid: sid,
      type: reason,
      name: name,
      section: programSection,
      date: new Date().toISOString(),
    };

    if (body.status === "Resolved") {
      const studentCaseRef = getChartDataCollection().doc("studentCase");
      const docSnapshot = await studentCaseRef.get();

      if (!docSnapshot.exists) {
        await studentCaseRef.set({
          data: [chartData],
        });
      } else {
        await studentCaseRef.update({
          data: FieldValue.arrayUnion(chartData),
        });
      }
    }

    const violationData = {
      ...newViolation,
      timeCreated: serverTimestamp,
    };

    const violationRef = getViolationsCollection().doc();
    await violationRef.set(violationData);

    if ((newViolation.status || "").toLowerCase() === "resolved") {
      try {
        const { newDegree, sanction } = await assignViolationToStudent(
          sid,
          newViolation.violation
        );

        await violationRef.set(
          {
            assignedDegree: newDegree || "",
            assignedSanction: sanction || "",
            assignedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error("Error assigning violation after add:", err);
      }
    }

    // Notification
    const notifCollection = getNotificationCollection();
    const adminDoc = notifCollection.doc("cases");
    const adminDocData = await adminDoc.get();

    let existingAdminNotification = [];
    if (adminDocData.exists && adminDocData.data()["data"]) {
      existingAdminNotification = adminDocData.data()["data"];
    }

    const newAdminNotification = {
      date: new Date(),
      from: "Admin",
      notifID: `adminCase-${existingAdminNotification.length + 1}`,
      type: "Submission",
      subject: `${req.body.processedBy} has created a new cases`,
    };

    const updatedAdminNotifications = [...existingAdminNotification, newAdminNotification];
    const updateAdminPayload = {
      data: updatedAdminNotifications,
    };

    await adminDoc.set(updateAdminPayload, { merge: true });

    res.status(201).json({
      message: `Added a new violation for Student: ${sid}`,
      proofUrl: proofUrl || "",
    });
  } catch (error) {
    console.error("Error adding violation:", error);
    res.status(500).send({
      error: `Failed to add a violation for User: ${req.body?.sid || "N/A"}`,
    });
  }
};

// Controller Function to update violation
const updateViolation = async (req, res) => {
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

    const violationRef = getViolationsCollection().doc(id);

    const doc = await violationRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Violation not found" });
    }

    await violationRef.set(
      {
        ...validatedUpdates,
        lastUpdate: new Date(),
      },
      { merge: true }
    );

    console.log(validatedUpdates.status)

    if ((validatedUpdates.status || "").toLowerCase() === "resolved" || (doc.data()?.status || "").toLowerCase() !== "resolved" && (validatedUpdates.status || "").toLowerCase() === "resolved") {
      try {
        const updatedDoc = await violationRef.get();
        const saved = updatedDoc.data() || {};
        const sid = saved.sid;
        const violationName = saved.violation;

        const { category, newDegree, sanction } = await assignViolationToStudent(
          sid,
          violationName
        );

        await violationRef.set(
          {
            assignedDegree: newDegree || "",
            assignedSanction: sanction || "",
            assignedCategory: category || "",
            assignedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error("Error assigning violation on update (Resolved):", err);
        // do not block the update - only log
      }
    }

    // Notification
    const notifCollection = getNotificationCollection();
    const adminDoc = notifCollection.doc("cases");
    const adminDocData = await adminDoc.get();

    let existingAdminNotification = [];
    if (adminDocData.exists && adminDocData.data()["data"]) {
      existingAdminNotification = adminDocData.data()["data"];
    }

    const message = () => {
      if (req.body.status === "Resolved") {
        return `${req.body.processedBy} resolved a case`;
      }
      return `${req.body.processedBy} has updated a case`;
    };

    const newAdminNotification = {
      date: new Date(),
      from: "Admin",
      notifID: `adminCase-${existingAdminNotification.length + 1}`,
      type: "Submission",
      subject: message(),
    };

    const updatedAdminNotifications = [...existingAdminNotification, newAdminNotification];
    const updateAdminPayload = { data: updatedAdminNotifications };

    await adminDoc.set(updateAdminPayload, { merge: true });

    res.status(201).json({
      message: `Violation updated successfully!`,
    });
  } catch (error) {
    return res.status(400).send({ error: `Violation update failed.` });
  }
};

// Controller function for deleting violation
const deleteViolation = async (req, res) => {
  const { id } = req.params;

  try {
    await getViolationsCollection().doc(id).delete();

    res.status(200).send({ message: `Violation successfully deleted.` });
  } catch (error) {
    res.status(404).send({ error: `Violation deletion is unsuccessful.` });
  }
};

module.exports = {
  addViolation,
  deleteViolation,
  getAllViolations,
  getViolations,
  updateViolation,
};
