const express = require("express");

const { 
    addAssessmentExam,
    addLikertTheme,
    updateAssessmentExam,
    updateLikertTheme,
    getAssessmentExamForm,
    getLikertTheme} = require("../controller/assessmentExamController");

const router = express.Router();

router.post("/add", addAssessmentExam);                  // For creating an assessment exam forms
router.post("/theme/add", addLikertTheme);               // For creating an assessment exam forms
router.put("/update/", updateAssessmentExam);            // For updating an assessment exam forms
router.put("/theme/update/", updateLikertTheme);         // For updating an assessment exam forms
router.get("/get", getAssessmentExamForm)                // For retrieiving an assessment exam forms by examID
router.get("/theme/get", getLikertTheme)                 // For retrieiving an assessment exam forms by examID

module.exports = router;