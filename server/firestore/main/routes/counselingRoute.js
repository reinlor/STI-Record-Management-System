const express = require("express");

const { addCounseling, getAllCounseling, deleteCounseling, getCounselings, updateCounseling } = require("../controller/counselingController");

const router = express.Router();

router.post("/add", addCounseling);                 // For creating Counseling Info
router.get("/", getAllCounseling);                  // For retrieving all Counseling Info
router.delete("/delete/:id", deleteCounseling);
router.get("/counselings/:sid", getCounselings);
router.put("/update/:id", updateCounseling);

module.exports = router;
