const express = require("express");
const router = express.Router();
const { addStudent, getStudents, updateStudent, getStudent } = require("../controller/studentController.js");

router.get("/", getStudents);                   // For retrieving all student data
router.get("/get/:sid", getStudent);            // For retrieving student data by ID
router.post("/create", addStudent);             // For creating student data
router.put("/update/:sid", updateStudent);      // For updating student data by ID

module.exports = router;
