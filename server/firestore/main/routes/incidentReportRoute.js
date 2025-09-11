const express = require('express');

const {
    addIncident,
    getAllIncident,
    getIncidentByID,
    updateIncident
} = require('../controller/incidentReportController.js');

const router = express.Router();

router.post('/add', addIncident);
router.get('/getAll', getAllIncident);
router.get('/get/:sid', getIncidentByID);
router.put('/update/:_id', updateIncident);

module.exports = router;