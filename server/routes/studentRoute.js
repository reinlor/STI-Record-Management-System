const express = require("express");
const router = express.Router();
const { addStudent, getStudent, updateStudent } = require("../controller/studentController.js");

router.get("/", getStudent);
router.post("/create", addStudent);
router.put("/:sid", updateStudent);

module.exports = router;
