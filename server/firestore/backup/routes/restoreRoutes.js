const express = require('express');
const router = express.Router();
const restoreController = require('../controller/restoreController');

router.post('/', restoreController.restoreBackup);
router.get('/backups', restoreController.getAvailableBackups);
router.get('/backups/:backupId', restoreController.getBackupData);

module.exports = router;