const express = require("express");

const { addTeacher, updateTeacher, getTeachers } = require("../controller/teacherController");

const router = express.Router();

router.post("/add", addTeacher);            // For creating a teacher profile
router.put("/update/:uid", updateTeacher);  // For updating a teacher profile
router.get("/", getTeachers);               // For retrieving all teacher profile

module.exports = router;