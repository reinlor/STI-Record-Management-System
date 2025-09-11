const { getAssessmentExamCollection } = require("../models/assessmentExamModel");
const Joi = require('joi');
const admin = require('firebase-admin');

// AssessmentExamForm Schema
const ScoreDistribution = Joi.object({
  name: Joi.string().optional().allow(''),
  percentage: Joi.number().optional().allow('')
});
const assessmentExamSchema = Joi.object({
  questions: Joi.array().required().items(Joi.object({
    category: Joi.string().required(),
    question: Joi.string().required().min(0).max(150),
    options: Joi.array().required()
  })),
  totalScore: Joi.number().optional(),
  scoreDistribution: Joi.array().optional().items(ScoreDistribution)
});
const updateSchema = Joi.object({
  questions: Joi.array().optional().items(Joi.object({
    category: Joi.string().required(),
    question: Joi.string().required().min(0).max(150),
    options: Joi.array().required()
  })),
  totalScore: Joi.number().optional().allow(''),
  scoreDistribution: Joi.array().optional().items(ScoreDistribution).allow('')
});
const themeSchema = Joi.object({
  themeName: Joi.string().required(),
  scale: Joi.array().required()
});

// Mga document ID
const ASSESSMENT_FORM_DOC_ID = 'assessmentForm';
const LIKERT_THEME_DOC_ID = 'likertScale';

// Helper function to calculate total score
const calculateTotalScore = (questions) => {
  if (!questions || !Array.isArray(questions)) {
    return 0;
  }
  const highestScorePerQuestion = 5;
  return questions.length * highestScorePerQuestion;
};

const addLikertTheme = async (req, res) => {
  try {
    const docRef = getAssessmentExamCollection().doc(LIKERT_THEME_DOC_ID);
    const doc = await docRef.get();

    if (doc.exists) {
      return res.status(409).json({ error: 'Assessment form already exists. Use the update route to modify it.' });
    }

    const { error, value: newTheme } = themeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    await docRef.set(newTheme);

    res.status(200).send({
      message: `Theme added successfully!`,
      data: newTheme
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getLikertTheme = async (req, res) => {
  try {
    const docRef = getAssessmentExamCollection().doc(LIKERT_THEME_DOC_ID);
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

const updateLikertTheme = async (req, res) => {
  try {
    const updates = req.body;
    const docRef = getAssessmentExamCollection().doc(LIKERT_THEME_DOC_ID);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).send({ error: `Assessment Form not found. Please create it first.` });
    }

    const { error, value: validatedUpdates } = themeSchema.validate(updates);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // This line is the solution. It tells the database to safely add
    // your new theme to the 'likert' array without any risk of data loss.
    await docRef.update({
      likert: admin.firestore.FieldValue.arrayUnion(validatedUpdates)
    });

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

// Controller Function for adding an assessment exam form
const addAssessmentExam = async (req, res) => {
  try {
    const docRef = getAssessmentExamCollection().doc(ASSESSMENT_FORM_DOC_ID);
    const doc = await docRef.get();

    // The data to be added/updated
    const { error, value: newExamData } = assessmentExamSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    if (doc.exists) {
      // Logic for when the document already exists: update it
      const existingData = doc.data();

      // Get the new questions to be added from the request body
      const newQuestions = newExamData.questions;

      // Use arrayUnion to safely add the new questions to the existing array.
      // This is the correct, atomic way to append data to an array in Firestore.
      await docRef.update({
        questions: admin.firestore.FieldValue.arrayUnion(...newQuestions)
      });

      // Recalculate the total score with the newly added questions
      const updatedQuestions = [...existingData.questions, ...newQuestions];
      const newTotalScore = calculateTotalScore(updatedQuestions);

      // Update the totalScore field in the database
      await docRef.update({ totalScore: newTotalScore });

      return res.status(200).send({
        message: 'Questions added to existing assessment form.',
        data: { ...existingData, questions: updatedQuestions, totalScore: newTotalScore }
      });

    } else {
      // Logic for when the document does NOT exist: create it for the first time
      const totalScore = calculateTotalScore(newExamData.questions);
      newExamData.totalScore = totalScore;

      await docRef.set(newExamData);

      return res.status(200).send({
        message: 'Assessment Exam Form added successfully!',
        data: newExamData
      });
    }
  } catch (error) {
    console.error("Error in addAssessmentExam:", error);
    return res.status(500).json({ error: error.message });
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

// Controller Function for Deleting a specific question
const deleteAssessmentExamQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    const docRef = getAssessmentExamCollection().doc(ASSESSMENT_FORM_DOC_ID);
    const doc = await docRef.get();

    if (!doc.exists) return res.status(404).send({ error: "Form not found" });

    const existingData = doc.data();
    const updatedQuestions = existingData.questions.filter(q => q.question !== question);

    await docRef.update({
      questions: updatedQuestions,
      totalScore: calculateTotalScore(updatedQuestions)
    });

    res.status(200).send({ message: "Question deleted successfully", questions: updatedQuestions });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Controller Function for Updating category name
const updateAssessmentExamCategory = async (req, res) => {
  try {
    const { oldCategory, newCategory } = req.body;
    const docRef = getAssessmentExamCollection().doc(ASSESSMENT_FORM_DOC_ID);
    const doc = await docRef.get();

    if (!doc.exists) return res.status(404).send({ error: "Form not found" });

    const existingData = doc.data();
    const updatedQuestions = existingData.questions.map(q =>
      q.category === oldCategory ? { ...q, category: newCategory } : q
    );

    await docRef.update({
      questions: updatedQuestions
    });

    res.status(200).send({ message: "Category updated", questions: updatedQuestions });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Controller Function for editing likert theme
const editLikertTheme = async (req, res) => {
  try {
    const { oldThemeName, newTheme } = req.body;
    const docRef = getAssessmentExamCollection().doc(LIKERT_THEME_DOC_ID);
    const doc = await docRef.get();

    if (!doc.exists) return res.status(404).send({ error: "Theme document not found" });

    const data = doc.data();
    if (!data.likert) return res.status(404).send({ error: "No themes found" });

    const updatedThemes = data.likert.map((theme) =>
      theme.themeName === oldThemeName ? newTheme : theme
    );

    await docRef.update({ likert: updatedThemes });

    res.status(200).send({ message: "Theme updated successfully", themes: updatedThemes });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Controller function for deleting a likert theme
const deleteLikertTheme = async (req, res) => {
  try {
    const { themeName } = req.body;
    const docRef = getAssessmentExamCollection().doc(LIKERT_THEME_DOC_ID);
    const doc = await docRef.get();

    if (!doc.exists) return res.status(404).send({ error: "Theme document not found" });

    const data = doc.data();
    if (!data.likert) return res.status(404).send({ error: "No themes found" });

    const updatedThemes = data.likert.filter((theme) => theme.themeName !== themeName);

    await docRef.update({ likert: updatedThemes });

    res.status(200).send({ message: "Theme deleted successfully", themes: updatedThemes });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Controller function for Toggling release status
const toggleReleaseExam = async (req, res) => {
  try {
    const { isReleased } = req.body;
    const docRef = getAssessmentExamCollection().doc(ASSESSMENT_FORM_DOC_ID);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).send({ error: "Assessment Form not found." });
    }

    await docRef.update({ isReleased });

    res.status(200).send({
      message: `Exam ${isReleased ? "released" : "disabled"} successfully.`,
      isReleased,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};




module.exports = {
  addAssessmentExam,
  updateAssessmentExam,
  getAssessmentExamForm,
  addLikertTheme,
  getLikertTheme,
  updateLikertTheme,
  deleteAssessmentExamQuestion,
  updateAssessmentExamCategory,
  editLikertTheme,
  deleteLikertTheme,
  toggleReleaseExam
};