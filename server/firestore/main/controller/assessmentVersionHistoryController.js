const { getAssessmentVersionCollection } = require("../models/assessmentVersionHistory.model");
const Joi = require('joi');

// Controller function for adding new version
const addVersion = async (req, res) => {
    try {
        const newVersion = req.body;

        await getAssessmentVersionCollection().doc(Date.now()).set(newVersion);

        res.status(200).json(newVersion)
    } catch (error) {
        
    }
};

// Controller function for retrieving all assessment versions

module.exports = {
    addVersion
}

// Unfinisheed