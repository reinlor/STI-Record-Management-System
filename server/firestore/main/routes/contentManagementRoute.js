const express = require("express");
const multer = require("multer");

const {
    addAnnouncement,
    addProgram,
    addStrand,
    changeWellnessLink,
    getProgram,
    getStrand,
    getWellnessLink,
    getAnnouncement,
    addCollegeStudentHandbook,
    getCollegeStudentHandbook,
    addShsStudentHandbook,
    getShsStudentHandbook,
    getViolations,
    getSchoolPeriod,
    addViolationCategory,
    updateViolationCategory,
    updateSchoolPeriod,
    getAllContent,
    getAllOffenses
} = require("../controller/contentManagementController.js");

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post("/announcement/add", addAnnouncement);
router.post("/program/add", addProgram);
router.post("/strand/add", addStrand);
router.put("/wellness/change", changeWellnessLink);
router.put("/studentHandbook/add", upload.single("file"), addCollegeStudentHandbook);
router.put("/shsStudentHandbook/add", upload.single("file"), addShsStudentHandbook);

router.get("/program/get", getProgram);
router.get("/strand/get", getStrand);
router.get("/wellness/get", getWellnessLink);
router.get("/announcement/get", getAnnouncement);
router.get("/studentHandbook/get", getCollegeStudentHandbook);
router.get("/shsStudentHandbook/get", getShsStudentHandbook);

router.post("/violations/add", addViolationCategory)
router.put("/violations/update", updateViolationCategory)
router.get("/violations/get", getViolations);

router.put('/schoolPeriod/update', updateSchoolPeriod);
router.get("/schoolPeriod/get", getSchoolPeriod);

router.get("/getAll", getAllContent)
router.get("/offenses/get", getAllOffenses)

module.exports = router;