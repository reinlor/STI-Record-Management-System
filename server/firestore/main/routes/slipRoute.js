const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  addAbsentSlip,
  getAllAbsentSlip,
  getAbsentSlip,
  getAllSlips,
  getAllSlipsById,
  updateSlipStatus,
  cancelRequestSlip
} = require("../controller/slipController");

const router = express.Router();

const upload = multer({ dest: path.join(__dirname, "../uploads") });

// Absent Slips
router.post("/absentSlip/add/", upload.array("attachments", 3), addAbsentSlip);
router.get("/absentSlip", getAllAbsentSlip);
router.get("/absentSlip/:sid", getAbsentSlip);

//All Slips
router.get('/allSlips', getAllSlips);
router.get('/allSlips/:sid', getAllSlipsById);
router.put('/update/:slipType/:slipId', updateSlipStatus)   // For updating slips
router.put('/cancel/:slipType/:slipId', cancelRequestSlip)   // For cancelling slips

module.exports = router;