const express = require('express');

const {
    addVersion
} = require("../controller/assessmentVersionHistoryController");

const router = express.Router();

router.post("/add", addVersion);                  // For add assessment exam

module.exports = router;

// Unfinished