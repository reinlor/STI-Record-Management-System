const express = require('express');
const multer = require('multer');
const { bulkUpload } = require('./bulkUploadController');
const router = express.Router();
const upload = multer();

router.post('/students', upload.single('file'), bulkUpload);

module.exports = router;