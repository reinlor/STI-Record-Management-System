const express = require('express');
const multer = require("multer");


const {
    addIncident,
    getAllIncident,
    getIncidentByID,
    updateIncident
} = require('../controller/incidentReportController.js');

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/add", upload.array("attachments"), addIncident);
router.get('/getAll', getAllIncident);
router.get('/get/:sid', getIncidentByID);
router.put('/update/:_id', updateIncident);

module.exports = router;