const express = require("express");
const router = express.Router();
const { getSummary } = require("./SummaryController");

router.post("/generate-summary", getSummary);

module.exports = router;
