const express = require('express');

const {
    addAssessmentReport,
    deleteAssessmentReport,
    updateAssessmentReport,
    getAssessmentReport,
    getAllAssessmentReport
} = require("../controller/assessmentReportController");

const router = express.Router();

router.post("/add", addAssessmentReport);                  // For creating an assessment exam forms
router.delete("/delete/:id", deleteAssessmentReport);      // For updating an assessment exam forms
router.put("/update/:id", updateAssessmentReport);         // For updating an assessment exam forms
router.get("/:id", getAssessmentReport)                    // For retrieiving an assessment exam forms by examID
router.get("/", getAllAssessmentReport);                   // For retrieving all assessment exam forms

module.exports = router;