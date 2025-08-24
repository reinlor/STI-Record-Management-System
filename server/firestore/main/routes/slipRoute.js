const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  addLateSlip,
  getAllLateSlip,
  getLateSlip,
  addAbsentSlip,
  getAllAbsentSlip,
  getAbsentSlip,
  addIDPass,
  getAllIDPass,
  getIDPass,
  getAllSlips,
  getAllSlipsById,
  addUniformPass,
  getAllUniformPass,
  getUniformPass
} = require("../controller/slipController");

const router = express.Router();

const upload = multer({ dest: path.join(__dirname, "../uploads") });

// Late Slips
router.post("/lateSlip/add/", upload.array("attachments", 3), addLateSlip);
router.get("/lateSlip", getAllLateSlip);
router.get("/lateSlip/:sid", getLateSlip);

// Absent Slips
router.post("/absentSlip/add/", upload.array("attachments", 3), addAbsentSlip);
router.get("/absentSlip", getAllAbsentSlip);
router.get("/absentSlip/:sid", getAbsentSlip);

// ID Pass
router.post("/IDPass/add/", upload.array("attachments", 3), addIDPass);
router.get("/IDPass", getAllIDPass);
router.get("/IDPass/:sid", getIDPass);

// Uniform Slips
router.post("/uniformSlip/add/", upload.array("attachments", 3), addUniformPass);
router.get("/uniformSlip", getAllUniformPass);
router.get("/uniformSlip/:sid", getUniformPass);

//All Slips
router.get('/allSlips', getAllSlips);
router.get('/allSlips/:sid', getAllSlipsById);

module.exports = router;