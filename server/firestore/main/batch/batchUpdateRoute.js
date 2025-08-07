const express = require('express');
const { batchUpdateSection, batchUpdateDate } = require('./batchUpdateController');
const router = express.Router();

router.post('/section-reset', batchUpdateSection);
router.post('/schedule', batchUpdateDate);

module.exports = router;