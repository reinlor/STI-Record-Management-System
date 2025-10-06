const express = require("express");

const {
  addReferral,
  updateReferral,
  getAllReferral,
  getReferral,
  getReferralById,
  cancelReferral
} = require("../controller/referralController");

const router = express.Router();

router.post("/add", addReferral); // For creating new Referral submission
router.put("/update/:id", updateReferral); // For updating Referral submission
router.get("/getAll", getAllReferral); // For retrieving all Referral submission
router.get("/get/:id", getReferral); // For retrieving a specific Referral submission by ID
router.get("/get/employee/:employeeID", getReferralById); // For retrieving a specific Referral submission by ID
router.put("/cancel/:referralId", cancelReferral); // For cancelling a specific Referral submission

module.exports = router;
