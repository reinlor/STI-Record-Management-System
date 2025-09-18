const express = require('express');
const router = express.Router();
const {
    getStudentNotificationwithID,
    updateNotificationReadStatus } = require('../controller/notificationController.js');

router.get('/get/:id', getStudentNotificationwithID);
router.put('/update/:employeeId/', updateNotificationReadStatus);

module.exports = router;