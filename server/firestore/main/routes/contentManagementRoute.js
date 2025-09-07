const express = require("express");

const {
    addAnnouncement,
    addProgram,
    addStrand,
    changeWellnessLink,
    getProgram,
    getStrand,
    getWellnessLink,
    getAnnouncement
} = require("../controller/contentManagementController.js");

const router = express.Router();

router.post("/announcement/add", addAnnouncement);
router.post("/program/add", addProgram);
router.post("/strand/add", addStrand);
router.put("/wellness/change", changeWellnessLink);

router.get("/program/get", getProgram);
router.get("/strand/get", getStrand);
router.get("/wellness/get", getWellnessLink);
router.get("/announcement/get", getAnnouncement);

module.exports = router;