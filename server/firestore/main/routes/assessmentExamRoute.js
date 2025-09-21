// AssessmentExamRoute.js
const express = require("express");
const router = express.Router();

const {
  createSurvey,
  getAllSurveys,
  getSurveyByName,
  deleteSurvey,
  toggleReleaseSurvey,
  addAssessmentExam,
  updateSurvey,
  deleteAssessmentExamQuestion,
  updateAssessmentExamCategory,
  addLikertTheme,
  getLikertTheme,
  updateLikertTheme,
  editLikertTheme,
  deleteLikertTheme,
} = require("../controller/assessmentExamController");

// Survey-level routes
router.post("/survey/create", createSurvey);         // create survey
router.get("/survey/getAll", getAllSurveys);        // get all surveys
router.get("/survey/get/:surveyName", getSurveyByName); // get survey by name
router.delete("/survey/delete", deleteSurvey);      // delete survey
router.put("/survey/release", toggleReleaseSurvey); // toggle release per survey
router.put("/survey/update", updateSurvey);         // update survey (partial or full)

// Question-level routes (survey-scoped)
router.post("/add", addAssessmentExam);             // add questions to a survey (body: { surveyName, questions })
router.delete("/question/delete", deleteAssessmentExamQuestion); // delete question in survey
router.put("/category/update", updateAssessmentExamCategory);    // update category in a survey

// Likert theme routes (keep as before)
router.post("/theme/add", addLikertTheme);
router.get("/theme/get", getLikertTheme);
router.put("/theme/update", updateLikertTheme);  // append a theme
router.put("/theme/edit", editLikertTheme);      // replace a theme by name
router.delete("/theme/delete", deleteLikertTheme);

module.exports = router;
