const express = require("express");

const { addTeacher, updateTeacher, getTeachers } = require("../controller/teacherController");

const router = express.Router();

router.post("/add", addTeacher);
router.put("/update/:uid", updateTeacher);
router.get("/", getTeachers);

module.exports = router;