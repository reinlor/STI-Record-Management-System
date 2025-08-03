const express = require('express');
const { sendEmail } = require('./emailController');
const router = express.Router();

router.post('/send', sendEmail);

module.exports = router;