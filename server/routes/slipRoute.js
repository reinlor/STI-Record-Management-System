const express = require("express");

const {addLateSlip, getAllLateSlip, getLateSlip, addAbsentSlip, getAllAbsentSlip, getAbsentSlip, addIDPass, getAllIDPass, getIDPass} = require("../controller/slipController");

const router = express.Router();

router.post("/lateSlip/add/:sid", addLateSlip);
router.get("/lateSlip", getAllLateSlip);
router.get("/lateSlip/:sid", getLateSlip);

router.post("/absentSlip/add/:sid", addAbsentSlip);
router.get("/absentSlip", getAllAbsentSlip);
router.get("/absentSlip/:sid", getAbsentSlip);

router.post("/IDPass/add/:sid", addIDPass);
router.get("/IDPass", getAllIDPass);
router.get("/IDPass/:sid", getIDPass);

module.exports = router;