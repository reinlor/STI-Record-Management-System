const { getAssessmentReportCollection } = require("../models/assessmentReportModel");
const Joi = require('joi');

// assessmentReport Schema
const answerSchema = Joi.object({
    questionID: Joi.string().required(),
    response: Joi.string().required(),
    score: Joi.number().required()
});

const assessmentReportSchema = Joi.object({
    sid: Joi.string().required(),
    examID: Joi.string().required(),
    answers: Joi.array().required().items(answerSchema),
    computedScore: Joi.number().required()
});

const updateSchema = Joi.object({
    sid: Joi.string().optional(),
    examID: Joi.string().optional(),
    answers: {
        questionID: Joi.string().optional(),
        response: Joi.string().optional(),
        score: Joi.number().optional()
    },
    computedScore: Joi.number().optional()
});

// Controller function for adding Assessment Report
const addAssessmentReport = async (req, res) => {
    try {
        assessmentReportSchema.validate(req.body);
        const { error, value: newReport } = assessmentReportSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        };
        await getAssessmentReportCollection().doc().set(newReport);

        res.status(200).send({
            message: `Assessment Exam Report added successfully!`,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller function for deleting Assessment Report
const deleteAssessmentReport = async (req, res) => {
    const { id } = req.params;

    try {
        const assessmentReportRef = getAssessmentReportCollection().doc(id);
        const assessmentReportDoc = await assessmentReportRef.get();

        if (!assessmentReportDoc.exists) {
            return res.status(404).send({ error: `Exam assessment form with ID '${id}' not found.` });
        }

        const assessmentData = assessmentReportDoc.data();
        const examSid = assessmentData.sid || 'Unknown ID'; // Use 'Unknown ID' as a fallback
        await assessmentReportRef.delete();

        res.status(200).send({ message: `Exam Assessment Form: '${examSid}' deleted successfully.` });
    } catch (error) {
        res.status(404).send({ error: `Failed to delete Exam Assessment Form.` });
    }
};

// Controller Function for updating an assessment exam form
const updateAssessmentReport = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    if (!id) {
      return res.status(400).send({ error: 'Assessment Report ID is required in the URL parameters for update.' });
    }

    const { error, value: validatedUpdates } = updateSchema.validate(updates, { abortEarly: false });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message).join('; ');
      return res.status(400).json({ error: `Validation failed: ${errorMessages}` });
    }

    if (Object.keys(validatedUpdates).length === 0) {
      return res.status(400).json({ error: "No valid update data provided after validation." });
    }

    const assessmentReportRef = getAssessmentReportCollection().doc(id);
    const assessmentReportDoc = await assessmentReportRef.get();

    if (!assessmentReportDoc.exists) {
      return res.status(404).send({ error: `Exam Assessment Report with ID: '${id}' not found.` });
    }

    const documentCurrentData = assessmentReportDoc.data();
    const examSid = documentCurrentData.sid || 'Unknown ID';

    await assessmentReportRef.update(validatedUpdates);

    res.status(200).send({
      message: `Exam Assessment Report: '${examSid}' updated successfully.`,
      updatesApplied: validatedUpdates 
    });

  } catch (error) {
    console.error("Error updating assessment report:", error); 
    res.status(500).send({
      error: `Failed to update exam assessment report with ID '${id}'. Please try again.`,
      details: error.message 
    });
  }
};

// Controller function for retrieving assessmentExamReport by ID
const getAssessmentReport = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).send({ error: 'Assessment Report ID is required in the URL parameters.' });
    }
    const assessmentReportRef = getAssessmentReportCollection().doc(id);
    const assessmentReportDoc = await assessmentReportRef.get(); // Fetch the document snapshot

    if (!assessmentReportDoc.exists) {
      return res.status(404).send({ error: `Assessment exam report with ID '${id}' not found.` });
    }

    const assessmentExamReport = {
      _id: assessmentReportDoc.id, 
      ...assessmentReportDoc.data(), 
    };
    res.status(200).send(assessmentExamReport);
  } catch (error) {
    console.error('Error fetching assessment exam report:', error);

    res.status(500).send({
      error: `Failed to retrieve assessment exam report with ID '${id}'. Please try again later.`,
      details: error.message 
    });
  }
};

// Controller Function to retrieve all Assessment Exam Report
const getAllAssessmentReport = async (req, res) => {
    const snapshot = await getAssessmentReportCollection().get();

    try {

        if (snapshot.empty) {
            return res.status(404).send({ error: `There is no assessment exam report available.` });
        }

        const assessmentExamReport = snapshot.docs.map((examReport) => ({
            _id: examReport.id,
            ...examReport.data(),
        }));

        res.status(200).send(assessmentExamReport);
    } catch (error) {
        res.status(404).send({ error: `Failed to retrieve assessment exam report.` });
    }
};

module.exports = {
    addAssessmentReport,
    deleteAssessmentReport,
    updateAssessmentReport,
    getAssessmentReport,
    getAllAssessmentReport
}