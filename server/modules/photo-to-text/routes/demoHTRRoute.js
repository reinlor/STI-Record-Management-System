const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const controller = require('../controllers/demoHTRController');

// store uploads in server/uploads (folder exists at project root)
const uploadDir = path.resolve(__dirname, '../../../uploads'); // <- fixed path (server/uploads)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${unique}${ext}`);
  },
});
const upload = multer({ storage });

router.post('/ocr', upload.single('file'), controller.ocrUpload);

module.exports = router;