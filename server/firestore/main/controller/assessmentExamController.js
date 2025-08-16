const { getAssessmentExamCollection } = require("../models/assessmentExamModel");
const Joi = require('joi');

// AssessmentExamForm Schema
const optionSchema = Joi.object({
  answer: Joi.string().required(),
  score: Joi.number().required()
});
const ScoreDistribution = Joi.object({
  name: Joi.string().optional().allow(''),
  percentage: Joi.number().optional().allow('')
});
const assessmentExamSchema = Joi.object({
  questions: Joi.array().required().items(Joi.object({
    question: Joi.string().required().min(0).max(150),
    options: Joi.array().required().items(optionSchema)
  })),
  totalScore: Joi.number().optional(),
  scoreDistribution: Joi.array().optional().items(ScoreDistribution)
});
const updateSchema = Joi.object({
  questions: Joi.array().optional().items(Joi.object({
    question: Joi.string().required().min(0).max(150),
    options: Joi.array().required().items(optionSchema)
  })),
  totalScore: Joi.number().optional().allow(''),
  scoreDistribution: Joi.array().optional().items(ScoreDistribution).allow('')
});

// The single, unique document ID
const ASSESSMENT_FORM_DOC_ID = 'assessmentForm';

// Helper function to calculate total score
const calculateTotalScore = (questions) => {
    if (!questions || !Array.isArray(questions)) {
        return 0;
    }
    const highestScorePerQuestion = 5; // Assuming the highest score is 5 for each question
    return questions.length * highestScorePerQuestion;
};

// Controller Function for adding an assessment exam form
const addAssessmentExam = async (req, res) => {
  try {
    // Check if the document already exists
    const docRef = getAssessmentExamCollection().doc(ASSESSMENT_FORM_DOC_ID);
    const doc = await docRef.get();

    if (doc.exists) {
      return res.status(409).json({ error: 'Assessment form already exists. Use the update route to modify it.' });
    }

    const { error, value: newExam } = assessmentExamSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Automatically calculate the totalScore based on the number of questions
    const totalScore = calculateTotalScore(newExam.questions);
    newExam.totalScore = totalScore;

    await docRef.set(newExam);

    res.status(200).send({
      message: `Assessment Exam Form added successfully!`,
      data: newExam // Return the full object including the new totalScore
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller Function for updating an assessment exam form
const updateAssessmentExam = async (req, res) => {
  try {
    const updates = req.body;
    const docRef = getAssessmentExamCollection().doc(ASSESSMENT_FORM_DOC_ID);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).send({ error: `Assessment Form not found. Please create it first.` });
    }
    
    const { error, value: validatedUpdates } = updateSchema.validate(updates);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    if (Object.keys(validatedUpdates).length === 0) {
      return res.status(400).json({ error: "No valid update data provided." });
    }

    // If 'questions' are being updated, recalculate the totalScore
    if (validatedUpdates.questions) {
        validatedUpdates.totalScore = calculateTotalScore(validatedUpdates.questions);
    }

    await docRef.update(validatedUpdates);

    res.status(200).send({
      message: `Exam Assessment Form updated successfully.`,
      updates: validatedUpdates
    });
  } catch (error) {
    console.error("Error updating assessment exam:", error);
    res.status(500).send({
      error: `Failed to update exam assessment form. Please try again.`,
      details: error.message
    });
  }
};

// Controller Function for retrieving the assessment form
const getAssessmentExamForm = async (req, res) => {
  try {
    const docRef = getAssessmentExamCollection().doc(ASSESSMENT_FORM_DOC_ID);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).send({
        error: `Assessment exam form not found.`,
      });
    }

    const assessmentExamForm = {
      _id: doc.id,
      ...doc.data(),
    };

    res.status(200).send(assessmentExamForm);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = {
  addAssessmentExam,
  updateAssessmentExam,
  getAssessmentExamForm,
};