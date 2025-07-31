const express = require('express');
const multer = require('multer');
const { exportData, importData } = require('../controller/backupController');

const router = express.Router();
const upload = multer(); // memory storage

router.get('/export', exportData);
router.post('/import', upload.single('backup'), importData);

module.exports = router;