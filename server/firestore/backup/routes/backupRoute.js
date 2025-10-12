const express = require('express');
const router = express.Router();
const backupController = require('../controller/backupController');

router.post('/export-now', backupController.backupData); 
router.get('/logs', backupController.getBackupLogs);
router.get('/schedule', backupController.getBackupSchedule);
router.post('/schedule', backupController.setBackupSchedule);

module.exports = router;