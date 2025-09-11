const express = require("express");

const {
    addAssessmentExam,
    addLikertTheme,
    updateAssessmentExam,
    updateLikertTheme,
    updateAssessmentExamCategory,
    editLikertTheme,
    getAssessmentExamForm,
    getLikertTheme,
    deleteAssessmentExamQuestion,
    deleteLikertTheme,
    toggleReleaseExam } = require("../controller/assessmentExamController");

const router = express.Router();

router.post("/add", addAssessmentExam);                           // For adding an assessment exam forms
router.post("/theme/add", addLikertTheme);                        // For creating an theme for assessment exam forms
router.put("/update/", updateAssessmentExam);                     // For updating an assessment exam forms
router.put("/theme/update/", updateLikertTheme);                  // For updating a theme for assessment exam forms
router.put("/category/update", updateAssessmentExamCategory);     // For updating an assessment exam category
router.put("/theme/edit", editLikertTheme);                       // For updating a theme
router.get("/get", getAssessmentExamForm)                         // For retrieiving an assessment exam forms by examID
router.get("/theme/get", getLikertTheme)                          // For retrieiving an assessment exam forms by examID
router.delete("/question/delete", deleteAssessmentExamQuestion);  // For deleting a specific question
router.delete("/theme/delete", deleteLikertTheme);                // For deleting a theme
router.put("/release", toggleReleaseExam);                        // For toggling release status

module.exports = router;