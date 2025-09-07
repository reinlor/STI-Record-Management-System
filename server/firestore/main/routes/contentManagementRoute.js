const express = require("express");

const {
    addAnnouncement,
    addProgram,
    addStrand,
    changeWellnessLink
} = require("../controller/contentManagementController.js");

const router = express.Router();

router.post("/announcement/add", addAnnouncement);
router.post("/program/add", addProgram);
router.post("/strand/add", addStrand);
router.put("/wellness/change", changeWellnessLink);

module.exports = router;