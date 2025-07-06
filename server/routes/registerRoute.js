const express = require("express");
const router = express.Router();
const { registerUser } = require("../controller/registerController.js");

// POST /api/register
router.post("/", registerUser);

module.exports = router;
