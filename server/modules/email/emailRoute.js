const express = require('express');
const { sendEmail, sendResetPassword } = require('./emailController');
const router = express.Router();

router.post('/send', sendEmail);
router.post('/sendResetPassword', sendResetPassword);

module.exports = router;