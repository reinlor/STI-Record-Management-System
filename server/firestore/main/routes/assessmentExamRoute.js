const express = require("express");

const { 
    addAssessmentExam,
    updateAssessmentExam,
    getAssessmentExamForm} = require("../controller/assessmentExamController");

const router = express.Router();

router.post("/add", addAssessmentExam);                  // For creating an assessment exam forms
router.put("/update/", updateAssessmentExam);     // For updating an assessment exam forms
router.get("/get", getAssessmentExamForm)            // For retrieiving an assessment exam forms by examID

module.exports = router;