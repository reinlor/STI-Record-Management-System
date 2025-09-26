const express = require("express");
const router = express.Router();
const { addStudent, getStudents, updateStudent, getStudent, getActiveStudent, getArchivedStudent, archiveStudent, restoreStudent, searchStudent } = require("../controller/studentController.js");

router.get("/", getStudents);                       // For retrieving all student data
router.get("/get/:sid", getStudent);                // For retrieving student data by ID
router.get("/active", getActiveStudent);            // For retrieving student data by ID
router.get("/archived", getArchivedStudent);        // For retrieving student data by ID
router.post("/create", addStudent);                 // For creating student data
router.put("/update/:sid", updateStudent);          // For updating student data by ID
router.put("/archiveData/:sid", archiveStudent);      // For archiving student data
router.put("/restoreData/:sid", restoreStudent);      // For archiving student data
router.get("/search", searchStudent)                // For autofill search

module.exports = router;
