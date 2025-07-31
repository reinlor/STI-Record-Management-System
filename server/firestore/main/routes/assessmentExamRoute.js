const express = require("express");

const { 
    addAssessmentExam,
    deleteAssessmentExam,
    updateAssessmentExam,
    getAssessmentExamForm,
    getAllAssessmentExam } = require("../controller/assessmentExamController");

const router = express.Router();

router.post("/add", addAssessmentExam);                  // For creating an assessment exam forms
router.delete("/delete/:examID", deleteAssessmentExam);  // For updating an assessment exam forms
router.put("/update/:examID", updateAssessmentExam);     // For updating an assessment exam forms
router.get("/:examID", getAssessmentExamForm)            // For retrieiving an assessment exam forms by examID
router.get("/", getAllAssessmentExam);                   // For retrieving all assessment exam forms

module.exports = router;