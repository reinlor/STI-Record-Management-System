// AssessmentExamController.js
const { getAssessmentExamCollection } = require("../models/assessmentExamModel");
const { getContentManagementCollection } = require("../models/contentManagementModel");
const Joi = require("joi");
const admin = require("firebase-admin");
const { Timestamp } = require('firebase-admin/firestore');

// Document IDs
const ASSESSMENT_FORM_DOC_ID = "assessmentForm";
const LIKERT_THEME_DOC_ID = "likertScale";

// Joi Schemas
const ScoreDistribution = Joi.object({
  name: Joi.string().optional().allow(""),
  percentage: Joi.number().optional().allow(""),
});

const QuestionSchema = Joi.object({
  category: Joi.string().required(),
  question: Joi.string().required().min(0).max(150),
  options: Joi.array().required(),
});

const assessmentExamSchema = Joi.object({
  questions: Joi.array().required().items(QuestionSchema),
  totalScore: Joi.number().optional(),
  scoreDistribution: Joi.array().optional().items(ScoreDistribution),
});

const updateSchema = Joi.object({
  questions: Joi.array().optional().items(QuestionSchema),
  totalScore: Joi.number().optional().allow(""),
  scoreDistribution: Joi.array().optional().items(ScoreDistribution).allow(""),
});

const themeSchema = Joi.object({
  themeName: Joi.string().required(),
  scale: Joi.array().required(),
});

// Helper - total score calculation (keeps previous logic)
const calculateTotalScore = (questions) => {
  if (!questions || !Array.isArray(questions)) return 0;
  const highestScorePerQuestion = 5;
  return questions.length * highestScorePerQuestion;
};

// Helper: get the assessmentForm doc reference and data
const getAssessmentFormDocRef = () => getAssessmentExamCollection().doc(ASSESSMENT_FORM_DOC_ID);

const getAssessmentFormData = async () => {
  const docRef = getAssessmentFormDocRef();
  const doc = await docRef.get();
  if (!doc.exists) return null;
  return { _id: doc.id, ...doc.data() };
};

/**
 * ----------------------
 * Likert theme functions
 * ----------------------
 */

const addLikertTheme = async (req, res) => {
  try {
    const { error, value: newTheme } = themeSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const docRef = getAssessmentExamCollection().doc(LIKERT_THEME_DOC_ID);
    const doc = await docRef.get();

    if (!doc.exists) {
      // Create the document with likert array
      await docRef.set({ likert: [newTheme] });
    } else {
      // Append safely
      await docRef.update({
        likert: admin.firestore.FieldValue.arrayUnion(newTheme),
      });
    }

    res.status(200).send({ message: "Theme added successfully!", data: newTheme });
  } catch (err) {
    console.error("addLikertTheme:", err);
    res.status(500).json({ error: err.message });
  }
};

const getLikertTheme = async (req, res) => {
  try {
    const docRef = getAssessmentExamCollection().doc(LIKERT_THEME_DOC_ID);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).send({ error: "Likert themes not found." });
    res.status(200).send({ _id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("getLikertTheme:", err);
    res.status(500).send({ error: err.message });
  }
};

const updateLikertTheme = async (req, res) => {
  try {
    const { error, value: validated } = themeSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const docRef = getAssessmentExamCollection().doc(LIKERT_THEME_DOC_ID);
    const doc = await docRef.get();
    if (!doc.exists) {
      await docRef.set({ likert: [validated] });
    } else {
      await docRef.update({
        likert: admin.firestore.FieldValue.arrayUnion(validated),
      });
    }

    res.status(200).send({ message: "Theme saved successfully.", theme: validated });
  } catch (err) {
    console.error("updateLikertTheme:", err);
    res.status(500).send({ error: err.message });
  }
};

const editLikertTheme = async (req, res) => {
  try {
    const { oldThemeName, newTheme } = req.body;
    const docRef = getAssessmentExamCollection().doc(LIKERT_THEME_DOC_ID);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).send({ error: "Theme document not found" });

    const data = doc.data();
    if (!Array.isArray(data.likert)) return res.status(404).send({ error: "No themes found" });

    const updatedThemes = data.likert.map((t) => (t.themeName === oldThemeName ? newTheme : t));
    await docRef.update({ likert: updatedThemes });

    res.status(200).send({ message: "Theme updated successfully", themes: updatedThemes });
  } catch (err) {
    console.error("editLikertTheme:", err);
    res.status(500).send({ error: err.message });
  }
};

const deleteLikertTheme = async (req, res) => {
  try {
    const { themeName } = req.body;
    const docRef = getAssessmentExamCollection().doc(LIKERT_THEME_DOC_ID);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).send({ error: "Theme document not found" });

    const data = doc.data();
    if (!Array.isArray(data.likert)) return res.status(404).send({ error: "No themes found" });

    const updatedThemes = data.likert.filter((t) => t.themeName !== themeName);
    await docRef.update({ likert: updatedThemes });

    res.status(200).send({ message: "Theme deleted successfully", themes: updatedThemes });
  } catch (err) {
    console.error("deleteLikertTheme:", err);
    res.status(500).send({ error: err.message });
  }
};

// Create a new survey
// POST /exam/survey/create
// body: { surveyName, description (optional) }
const createSurvey = async (req, res) => {
  try {
    const { surveyName, description = "", processedBy = "Admin" } = req.body;
    if (!surveyName) return res.status(400).send({ error: "surveyName is required" });

    const docRef = getAssessmentFormDocRef();
    const doc = await docRef.get();

    // Logic to get current school year
    const schoolPeriodDoc = await getContentManagementCollection().doc("schoolPeriod").get();
    let currentSchoolYear = "";
    if (schoolPeriodDoc.exists) {
      currentSchoolYear = schoolPeriodDoc.data().schoolYear || "";
    }

    if (!doc.exists) {
      // create document with surveys object
      const surveys = {
        [surveyName]: { description, questions: [], isReleased: false, totalScore: 0, processedBy, timeCreated: Timestamp.fromDate(new Date()), schoolYear: currentSchoolYear },
      };
      await docRef.set({ surveys });
      return res.status(201).send({ message: "Survey created", survey: surveys[surveyName] });
    } else {
      const data = doc.data();
      const surveys = data.surveys || {};
      if (surveys[surveyName]) {
        return res.status(409).send({ error: "Survey with this name already exists" });
      }
      surveys[surveyName] = { description, questions: [], isReleased: false, totalScore: 0, processedBy, timeCreated: Timestamp.fromDate(new Date()), schoolYear: currentSchoolYear };
      await docRef.update({ surveys });
      return res.status(201).send({ message: "Survey created", survey: surveys[surveyName] });
    }
  } catch (err) {
    console.error("createSurvey:", err);
    res.status(500).send({ error: err.message });
  }
};

// GET /exam/questions/databank
const getQuestionDatabank = async (req, res) => {
  try {
    const data = await getAssessmentFormData();
    if (!data) return res.status(200).send({ questions: [] });

    const surveys = data.surveys || {};
    const aggregated = [];

    Object.entries(surveys).forEach(([surveyName, meta]) => {
      const qs = Array.isArray(meta.questions) ? meta.questions : [];
      qs.forEach((q) => {
        aggregated.push({
          surveyName,
          category: q.category || "",
          question: q.question || "",
          options: q.options || [],
        });
      });
    });

    res.status(200).send({ questions: aggregated });
  } catch (err) {
    console.error("getQuestionDatabank:", err);
    res.status(500).send({ error: err.message });
  }
};


// Get all surveys
// GET /exam/survey/getAll
const getAllSurveys = async (req, res) => {
  try {
    const data = await getAssessmentFormData();
    if (!data) return res.status(200).send({ surveys: {} });
    res.status(200).send({ surveys: data.surveys || {} });
  } catch (err) {
    console.error("getAllSurveys:", err);
    res.status(500).send({ error: err.message });
  }
};

// Get a specific survey by name
// GET /exam/survey/get/:surveyName
const getSurveyByName = async (req, res) => {
  try {
    const { surveyName } = req.params;
    if (!surveyName) return res.status(400).send({ error: "surveyName is required in params" });

    const data = await getAssessmentFormData();
    if (!data || !data.surveys || !data.surveys[surveyName]) {
      return res.status(404).send({ error: "Survey not found" });
    }
    res.status(200).send({ surveyName, ...data.surveys[surveyName] });
  } catch (err) {
    console.error("getSurveyByName:", err);
    res.status(500).send({ error: err.message });
  }
};

// Delete a survey
// DELETE /exam/survey/delete
// body: { surveyName }
const deleteSurvey = async (req, res) => {
  try {
    const { surveyName } = req.body;
    if (!surveyName) return res.status(400).send({ error: "surveyName is required" });

    const docRef = getAssessmentFormDocRef();
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).send({ error: "No surveys found" });

    const data = doc.data();
    const surveys = data.surveys || {};
    if (!surveys[surveyName]) return res.status(404).send({ error: "Survey not found" });

    delete surveys[surveyName];
    await docRef.update({ surveys });
    res.status(200).send({ message: "Survey deleted", surveyName });
  } catch (err) {
    console.error("deleteSurvey:", err);
    res.status(500).send({ error: err.message });
  }
};

// Toggle release for a specific survey
// PUT /exam/survey/release
// body: { surveyName, isReleased }
const toggleReleaseSurvey = async (req, res) => {
  try {
    const { surveyName, isReleased } = req.body;
    if (typeof isReleased !== "boolean") return res.status(400).send({ error: "isReleased (boolean) required" });
    if (!surveyName) return res.status(400).send({ error: "surveyName is required" });

    const docRef = getAssessmentFormDocRef();
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).send({ error: "No surveys found" });

    const data = doc.data();
    const surveys = data.surveys || {};
    if (!surveys[surveyName]) return res.status(404).send({ error: "Survey not found" });

    surveys[surveyName].isReleased = isReleased;
    await docRef.update({ surveys });

    res.status(200).send({ message: `Survey ${isReleased ? "released" : "disabled"} successfully.`, surveyName, isReleased });
  } catch (err) {
    console.error("toggleReleaseSurvey:", err);
    res.status(500).send({ error: err.message });
  }
};

/**
 * Question-level operations operate on a named survey
 */

// Add questions to a survey (or create survey implicitly if missing)
// POST /exam/add
// body: { surveyName, questions: [...] }
const addAssessmentExam = async (req, res) => {
  try {
    const { surveyName, questions } = req.body;
    if (!surveyName) return res.status(400).send({ error: "surveyName is required" });
    if (!Array.isArray(questions) || questions.length === 0) return res.status(400).send({ error: "questions (array) is required" });

    // validate questions
    const { error } = assessmentExamSchema.validate({ questions });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const docRef = getAssessmentFormDocRef();
    const doc = await docRef.get();


    if (!doc.exists) {
      // create doc and survey
      const totalScore = calculateTotalScore(questions);
      const surveys = { [surveyName]: { description: "", questions, isReleased: false, totalScore } };
      await docRef.set({ surveys });
      return res.status(201).send({ message: "Survey created with questions", surveyName, survey: surveys[surveyName] });
    }

    const data = doc.data();
    const surveys = data.surveys || {};



    if (!surveys[surveyName]) {
      // create survey
      const totalScore = calculateTotalScore(questions);
      surveys[surveyName] = { description: "", questions, isReleased: false, totalScore };
    } else {
      // append questions (preserve existing)
      const existingQuestions = Array.isArray(surveys[surveyName].questions) ? surveys[surveyName].questions : [];
      const updatedQuestions = [...existingQuestions, ...questions];
      surveys[surveyName].questions = updatedQuestions;
      surveys[surveyName].totalScore = calculateTotalScore(updatedQuestions);
    }

    await docRef.update({ surveys });
    res.status(200).send({ message: "Questions added", surveyName, survey: surveys[surveyName] });
  } catch (err) {
    console.error("addAssessmentExam:", err);
    res.status(500).send({ error: err.message });
  }
};

// Update entire survey object (questions, description, etc.) or partial updates
// PUT /exam/survey/update
// body: { surveyName, updates: { description?, questions?, scoreDistribution? } }
// If questions provided, replace entire questions array for that survey.
const updateSurvey = async (req, res) => {
  try {
    const { surveyName, updates } = req.body;
    if (!surveyName) return res.status(400).send({ error: "surveyName is required" });
    if (!updates || typeof updates !== "object") return res.status(400).send({ error: "updates object required" });

    const docRef = getAssessmentFormDocRef();
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).send({ error: "No surveys found" });

    const data = doc.data();
    const surveys = data.surveys || {};
    if (!surveys[surveyName]) return res.status(404).send({ error: "Survey not found" });

    // Validate if questions provided
    if (updates.questions) {
      const { error } = updateSchema.validate({ questions: updates.questions });
      if (error) return res.status(400).json({ error: error.details[0].message });
      updates.totalScore = calculateTotalScore(updates.questions);
    }

    // Apply updates
    surveys[surveyName] = { ...surveys[surveyName], ...updates };
    await docRef.update({ surveys });

    res.status(200).send({ message: "Survey updated", surveyName, survey: surveys[surveyName] });
  } catch (err) {
    console.error("updateSurvey:", err);
    res.status(500).send({ error: err.message });
  }
};

// Delete a specific question inside a survey
// DELETE /exam/question/delete
// body: { surveyName, question }  (question matches the question.text)
const deleteAssessmentExamQuestion = async (req, res) => {
  try {
    const { surveyName, question } = req.body;
    if (!surveyName || !question) return res.status(400).send({ error: "surveyName and question required" });

    const docRef = getAssessmentFormDocRef();
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).send({ error: "No surveys found" });

    const data = doc.data();
    const surveys = data.surveys || {};
    if (!surveys[surveyName]) return res.status(404).send({ error: "Survey not found" });

    const existingQuestions = Array.isArray(surveys[surveyName].questions) ? surveys[surveyName].questions : [];
    const updatedQuestions = existingQuestions.filter((q) => q.question !== question);

    surveys[surveyName].questions = updatedQuestions;
    surveys[surveyName].totalScore = calculateTotalScore(updatedQuestions);

    await docRef.update({ surveys });
    res.status(200).send({ message: "Question deleted successfully", surveyName, questions: updatedQuestions });
  } catch (err) {
    console.error("deleteAssessmentExamQuestion:", err);
    res.status(500).send({ error: err.message });
  }
};

// Update category name inside a survey
// PUT /exam/category/update
// body: { surveyName, oldCategory, newCategory }
const updateAssessmentExamCategory = async (req, res) => {
  try {
    const { surveyName, oldCategory, newCategory } = req.body;
    if (!surveyName || !oldCategory || !newCategory) return res.status(400).send({ error: "surveyName, oldCategory and newCategory required" });

    const docRef = getAssessmentFormDocRef();
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).send({ error: "No surveys found" });

    const data = doc.data();
    const surveys = data.surveys || {};
    if (!surveys[surveyName]) return res.status(404).send({ error: "Survey not found" });

    const existingQuestions = Array.isArray(surveys[surveyName].questions) ? surveys[surveyName].questions : [];
    const updatedQuestions = existingQuestions.map((q) => (q.category === oldCategory ? { ...q, category: newCategory } : q));

    surveys[surveyName].questions = updatedQuestions;
    await docRef.update({ surveys });

    res.status(200).send({ message: "Category updated", surveyName, questions: updatedQuestions });
  } catch (err) {
    console.error("updateAssessmentExamCategory:", err);
    res.status(500).send({ error: err.message });
  }
};

module.exports = {
  // surveys
  createSurvey,
  getAllSurveys,
  getSurveyByName,
  deleteSurvey,
  toggleReleaseSurvey,
  // questions operations (survey-scoped)
  addAssessmentExam,
  updateSurvey,
  deleteAssessmentExamQuestion,
  updateAssessmentExamCategory,
  // likert theme
  addLikertTheme,
  getLikertTheme,
  updateLikertTheme,
  editLikertTheme,
  deleteLikertTheme,
  getQuestionDatabank
};
