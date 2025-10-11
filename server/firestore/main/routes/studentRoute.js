const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const { addStudent, getStudents, updateStudent, getStudent, getActiveStudent, getArchivedStudent, archiveStudent, restoreStudent, searchStudent } = require("../controller/studentController.js");

const upload = multer({ dest: path.join(__dirname, "../uploads") });

router.get("/", getStudents);                       // For retrieving all student data
router.get("/get/:sid", getStudent);                // For retrieving student data by ID
router.get("/active", getActiveStudent);            // For retrieving student data by ID
router.get("/archived", getArchivedStudent);        // For retrieving student data by ID
router.post("/create", upload.array("attachments", 5), addStudent); // Accept up to 5 files
router.put("/update/:sid", upload.array("attachments", 5), updateStudent); // Accept up to 5 files
router.put("/archiveData/:sid", archiveStudent);      // For archiving student data
router.put("/restoreData/:sid", restoreStudent);      // For archiving student data
router.get("/search", searchStudent)                // For autofill search

module.exports = router;
