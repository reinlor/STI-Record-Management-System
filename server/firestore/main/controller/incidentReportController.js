const Joi = require("joi");
const { FieldValue } = require("firebase-admin/firestore");
const {
  getIncidentReportCollection,
} = require("../models/incidentReportModel");
const { getChartDataCollection } = require("../models/chartDataModel");
const { getNotificationCollection } = require("../models/notificationModel.js");
const { getContentManagementCollection } = require("../models/contentManagementModel.js");
const cloudinary = require("../../../config/cloudinary.js");

// Incident Report Form Schema
const incidentReportSchema = Joi.object({
  name: Joi.string().required().empty(""),
  sid: Joi.string().required().empty(""),
  program: Joi.string().required().empty(""),
  section: Joi.string().required().empty(""),
  email: Joi.string().required().empty(""),
  typeOfSlip: Joi.string().required().empty(""),
  dateOfIncident: Joi.string().required().empty(""),
  incidentTime: Joi.string().required().empty(""),
  locationOfIncident: Joi.string().required().empty(""),
  personInvolved: Joi.string().required().allow("").empty(""),
  witnessName: Joi.string().required().allow("").empty(""),
  witnessContact: Joi.string().optional().allow("").empty(""),
  narrativeReport: Joi.string().required().empty(""),
  actionTaken: Joi.string().required().empty(""),
  attachmentCount: Joi.number().required(),
  status: Joi.string().optional().empty(""),
  remarks: Joi.string().required().allow(""),
  attachmentUrl: Joi.array().items(Joi.string()).optional(),
  timeCreated: Joi.date().required(),
});

const updateIncidentReportSchema = Joi.object({
  name: Joi.string().optional().empty(""),
  sid: Joi.string().optional().empty(""),
  program: Joi.optional().required().empty(""),
  section: Joi.optional().required().empty(""),
  email: Joi.string().optional().empty(""),
  typeOfSlip: Joi.string().optional().empty(""),
  dateOfIncident: Joi.string().optional().empty(""),
  incidentTime: Joi.string().optional().empty(""),
  locationOfIncident: Joi.string().optional().empty(""),
  personInvolved: Joi.string().optional().empty(""),
  witnessName: Joi.string().optional().empty(""),
  witnessContact: Joi.string().optional().allow("").empty(""),
  narrativeReport: Joi.string().optional().empty(""),
  actionTaken: Joi.string().optional().empty(""),
  attachmentCount: Joi.number().optional(),
  status: Joi.string().optional().empty(""),
  remarks: Joi.string().optional().empty(""),
  attachmentUrl: Joi.array().items(Joi.string()).optional(),
  timeCreated: Joi.date().optional()
});

// Controller function for adding new incidents
const addIncident = async (req, res) => {
  let publicIds = [];
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const attachmentUrls = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "incident_reports",
      });

      attachmentUrls.push(result.secure_url);
      publicIds.push(result.public_id);
    }

    const incidentData = {
      ...req.body,
      attachmentUrl: attachmentUrls,
      status: "Pending",
      timeCreated: new Date(),
      attachmentCount: attachmentUrls.length
    };

    const { error, value: newIncidentReport } =
      incidentReportSchema.validate(incidentData);
    if (error) {
      await Promise.all(publicIds.map((id) => cloudinary.uploader.destroy(id)));
      return res.status(400).json({ error: error.details[0].message });
    }

    await getIncidentReportCollection().doc().set(newIncidentReport);

    // Pang Charts
    const chartDataDocRef = getChartDataCollection().doc("slip-n-pass");
    const docSnapshot = await chartDataDocRef.get();

    const updatedData = docSnapshot.exists ? docSnapshot.data() : { id: "slip-n-pass", data: [] };
    const existingDataArray = updatedData.data || [];
    const schoolPeriodDoc = await getContentManagementCollection().doc("schoolPeriod").get();

    // Logic to get current school year
    let currentSchoolYear = "";
    if (schoolPeriodDoc.exists) {
      currentSchoolYear = schoolPeriodDoc.data().schoolYear || "";
    }

    existingDataArray.push({
      sid: newIncidentReport.sid,
      type: "Incident Report",
      schoolYear: currentSchoolYear,
      date: new Date()
    });

    updatedData.data = existingDataArray;
    await chartDataDocRef.set(updatedData, { merge: true });
    // Pang Charts


    // Admin Notification
    const notifCollection = getNotificationCollection();
    const adminDoc = notifCollection.doc('request');
    const adminDocData = await adminDoc.get();

    let existingAdminNotification = [];
    if (adminDocData.exists && adminDocData.data()['data']) {
      existingAdminNotification = adminDocData.data()['data'];
    }

    const newAdminNotification = {
      date: new Date(),
      from: 'Student',
      isRead: false,
      notifID: `adminRequest-${existingAdminNotification.length + 1}`,
      type: 'Submission',
      subject: `${req.body.name} has submitted a request`
    }

    const updatedAdminNotifications = [...existingAdminNotification, newAdminNotification]
    const updateAdminPayload = {
      data: updatedAdminNotifications
    }

    await adminDoc.set(updateAdminPayload, { merge: true });


    res.status(201).json({ message: "Incident report added successfully" });
  } catch (error) {
    if (publicIds.length > 0) {
      try {
        await Promise.all(publicIds.map(id => cloudinary.uploader.destroy(id)));
      } catch (cleanupError) {
        console.error("Error cleaning up files:", cleanupError);
      }
    }

    console.error("Error adding incident report:", error);
    res
      .status(500)
      .json({ message: `Failed to add the incident report: ${error.message}` });
  }
};

// Controller function for retrieving all incident reports
const getAllIncident = async (req, res) => {
  try {
    const incidentSnapshot = await getIncidentReportCollection().get();

    if (incidentSnapshot.empty) {
      return res.status(404).json({ message: "No incident reports found." });
    }

    const incidentReports = incidentSnapshot.docs.map((incidentReport) => ({
      _id: incidentReport.id,
      ...incidentReport.data(),
    }));

    res.status(200).json(incidentReports);
  } catch (error) {
    console.error(`Error in retrieving incident reports: ${error.message}`);
    res.status(500).json({ message: "Failed to retrieve incident reports." });
  }
};

// Controller function for retrieving incident by student ID
const getIncidentByID = async (req, res) => {
  try {
    const { sid } = req.params;

    const incidentSnapshot = await getIncidentReportCollection()
      .where("sid", "==", sid)
      .get();

    if (incidentSnapshot.empty) {
      return res
        .status(404)
        .json({
          message: `No incident report found with the student ID ${sid}`,
        });
    }

    const incidentReports = incidentSnapshot.docs.map((incidentReport) => ({
      _id: incidentReport.id,
      ...incidentReport.data(),
    }));

    res.status(200).json(incidentReports);
  } catch (error) {
    console.error(`Error in retrieving incident reports: ${error.message}`);
    res.status(500).json({ message: "Failed to retrieve incident reports." });
  }
};

// Controller function for updating incident by document ID
const updateIncident = async (req, res) => {
  try {
    const { _id } = req.params;
    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No update data provided" });
    }

    const { error, value: validatedData } = updateIncidentReportSchema.validate(updateData);
    if (error) {
      return res.status(400).json({ message: `Cannot update the incident report due to invalid data: ${error.details[0].message}` });
    }

    const incidentReportDocRef = getIncidentReportCollection().doc(_id);
    const docSnapshot = await incidentReportDocRef.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({ message: `No incident report found with the ID ${_id}` });
    }

    await incidentReportDocRef.set(validatedData, { merge: true });

    res.status(200).json({ message: `Incident report ${_id} successfully updated.` });

  } catch (error) {
    console.error(`Failed to update incident report: ${error}`);
    res.status(500).json({ error: `Failed to update incident report: ${error.message}` });
  }
};

module.exports = {
  addIncident,
  getAllIncident,
  getIncidentByID,
  updateIncident,
};
