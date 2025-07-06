const express = require("express");

const { addCounseling, getAllCounseling, deleteCounseling, getCounselings, updateCounseling } = require("../controller/counselingController");

const router = express.Router();

router.post("/:sid", addCounseling);
router.get("/", getAllCounseling);
router.delete("/delete/:id", deleteCounseling);
router.get("/counselings/:sid", getCounselings);
router.post("/update/:id", updateCounseling);

module.exports = router;
