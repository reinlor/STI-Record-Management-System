const express = require("express");

const {
  addReferral,
  updateReferral,
  getAllReferral,
  getReferral
} = require("../controller/referralController");

const router = express.Router();

router.post("/add", addReferral); // For creating new Referral submission
router.put("/update/:id", updateReferral); // For updating Referral submission
router.get("/", getAllReferral); // For retrieving all Referral submission
router.get("/:id", getReferral); // For retrieving a specific Referral submission by ID

module.exports = router;
