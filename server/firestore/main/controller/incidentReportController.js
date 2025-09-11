const Joi = require("joi");
const { FieldValue } = require("firebase-admin/firestore");
const {
  getIncidentReportCollection,
} = require("../models/incidentReportModel");
const { getChartDataCollection } = require("../models/chartDataModel");
const cloudinary = require("../../../config/cloudinary.js");

// Incident Report Form Schema
const incidentReportSchema = Joi.object({
  name: Joi.string().required().empty(""),
  sid: Joi.string().required().empty(""),
  programSection: Joi.string().required().empty(""),
  email: Joi.string().required().empty(""),
  dateOfIncident: Joi.string().required().empty(""),
  locationOfIncident: Joi.string().required().empty(""),
  personInvolved: Joi.string().required().empty(""),
  witnessName: Joi.string().required().empty(""),
  narrativeReport: Joi.string().required().empty(""),
  actionTaken: Joi.string().required().empty(""),
  status: Joi.string().required().empty(""),
  remarks: Joi.string().required().empty(""),
  attachmentUrl: Joi.array().items(Joi.string()).optional(),
});

const updateIncidentReportSchema = Joi.object({
  name: Joi.string().optional().empty(""),
  sid: Joi.string().optional().empty(""),
  programSection: Joi.optional().required().empty(""),
  email: Joi.string().optional().empty(""),
  dateOfIncident: Joi.string().optional().empty(""),
  locationOfIncident: Joi.string().optional().empty(""),
  personInvolved: Joi.string().optional().empty(""),
  witnessName: Joi.string().optional().empty(""),
  narrativeReport: Joi.string().optional().empty(""),
  actionTaken: Joi.string().optional().empty(""),
  status: Joi.string().optional().empty(""),
  remarks: Joi.string().optional().empty(""),
  attachmentUrl: Joi.array().items(Joi.string()).optional(),
});

// Controller function for adding new incidents
const addIncident = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const attachmentUrls = [];
    const publicIds = [];

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
    };

    const { error, value: newIncidentReport } =
      incidentReportSchema.validate(incidentData);
    if (error) {
      await Promise.all(publicIds.map((id) => cloudinary.uploader.destroy(id)));
      return res.status(400).json({ error: error.details[0].message });
    }

    await getIncidentReportCollection().doc().set(newIncidentReport);

    res.status(201).json({ message: "Incident report added successfully" });
  } catch (error) {
    if (publicIds.length) {
      await Promise.all(publicIds.map((id) => cloudinary.uploader.destroy(id)));
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

      if (!updateData || Object.keys(updateData).length === 0){
        return res.status(400).json({ error: "No update data provided" });
      }

      const { error, value: validatedData } = updateIncidentReportSchema.validate(updateData);
      if (error) {
        return res.status(400).json({ message: `Cannot update the incident report due to invalid data: ${error.details[0].message}` });
      }

      const incidentReportDocRef = getIncidentReportCollection().doc(_id);
      const docSnapshot = await incidentReportDocRef.get();

      if(!docSnapshot.exists){
        return res.status(404).json({ message: `No incident report found with the ID ${_id}` });
      }

      await incidentReportDocRef.set(validatedData, {merge: true});

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
