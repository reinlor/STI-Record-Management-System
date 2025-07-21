const express = require("express");

const {
  addReferral,
  updateReferral,
  getAllReferral,
} = require("../controller/referralController");

const router = express.Router();

router.post("/add", addReferral);              // For creating new Referral submission
router.put("/update/:id", updateReferral);     // For updating Referral submission
router.get("/", getAllReferral);               // For retrieving all Referral submission 

module.exports = router;
