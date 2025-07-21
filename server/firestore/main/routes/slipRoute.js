const express = require("express");

const {addLateSlip, getAllLateSlip, getLateSlip, addAbsentSlip, getAllAbsentSlip, getAbsentSlip, addIDPass, getAllIDPass, getIDPass} = require("../controller/slipController");

const router = express.Router();

// Late Slips
router.post("/lateSlip/add/", addLateSlip);          // For adding Late Slip submission
router.get("/lateSlip", getAllLateSlip);             // For retrieving all Late Slip submission
router.get("/lateSlip/:sid", getLateSlip);           // For retrieving Late Slip submission by ID

// Absent Slips
router.post("/absentSlip/add/", addAbsentSlip);      // For adding Absent Slip submission
router.get("/absentSlip", getAllAbsentSlip);         // For retrieving Absent all Slip submission
router.get("/absentSlip/:sid", getAbsentSlip);       // For retrieving Absent Slip submission by ID

// ID Pass
router.post("/IDPass/add/", addIDPass);              // For adding ID Pass submission
router.get("/IDPass", getAllIDPass);                 // For retrieving all ID Pass submission
router.get("/IDPass/:sid", getIDPass);               // For retrieving ID Pass submission by ID

module.exports = router;