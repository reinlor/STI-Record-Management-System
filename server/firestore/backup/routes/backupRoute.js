const express = require("express");
const router = express.Router();
const backupController = require("../controller/backupController");

router.get("/auth", backupController.authGoogle);
router.get("/oauth2callback", backupController.oauth2callback);

router.post("/export-now", backupController.backupData);
router.get("/schedule", backupController.getBackupSchedule);
router.post("/schedule", backupController.setBackupSchedule);
router.get("/logs", backupController.getBackupLogs);

module.exports = router;
