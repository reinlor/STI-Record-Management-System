const Joi = require("joi");
const { FieldValue } = require("firebase-admin/firestore");
const { getIncidentReportCollection } = require("../models/incidentReportModel");
const { getChartDataCollection } = require("../models/chartDataModel");

// Incident Report Form Schema
const incidentReportSchema = Joi.object({
    name: Joi.string().required().empty(''),
    sid: Joi.string().required().empty(''),
    programSection: Joi.string().required().empty(''),
    email: Joi.string().required().empty(''),
    dateOfIncident: Joi.string().required().empty(''),
    locationOfIncident: Joi.string().required().empty(''),
    personInvolved: Joi.string().required().empty(''),
    witnessName: Joi.string().required().empty(''),
    narrativeReport: Joi.string().required().empty(''),
    actionTaken: Joi.string().required().empty(''),
    actionTaken: Joi.string().required().empty(''),
    actionTaken: Joi.string().required().empty(''),
    status: Joi.string().required().empty(''),
    remarks: Joi.string().required().empty(''),
    attachmentUrl: Joi.array().required().empty([]),
})

const updateIncidentReportSchema = Joi.object({
    name: Joi.string().optional().empty(''),
    sid: Joi.string().optional().empty(''),
    programSection: Joi.optional().required().empty(''),
    email: Joi.string().optional().empty(''),
    dateOfIncident: Joi.string().optional().empty(''),
    locationOfIncident: Joi.string().optional().empty(''),
    personInvolved: Joi.string().optional().empty(''),
    witnessName: Joi.string().optional().empty(''),
    narrativeReport: Joi.string().optional().empty(''),
    actionTaken: Joi.string().optional().empty(''),
    actionTaken: Joi.string().optional().empty(''),
    actionTaken: Joi.string().optional().empty(''),
    status: Joi.string().optional().empty(''),
    remarks: Joi.string().optional().empty(''),
    attachmentUrl: Joi.array().optional().empty([]),
})

// Controller function for adding new incidents
const addIncident = async (req, res) => {
    
};

// Controller function for retrieving all incident reports
const getIncident = async (req, res) => {
    
};

// Controller function for retrieving incident by ID
const getIncidentByID = async (req, res) => {
    
};

// Controller function for updating incident by ID
const updateIncident = async (req, res) => {
    
};