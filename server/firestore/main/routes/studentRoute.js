const express = require("express");
const router = express.Router();
const { addStudent, getStudent, updateStudent } = require("../controller/studentController.js");

router.get("/", getStudent);            // For retrieving all student data
router.post("/create", addStudent);     // For creating student data
router.put("/:sid", updateStudent);     // For retrieving student data by ID

module.exports = router;
