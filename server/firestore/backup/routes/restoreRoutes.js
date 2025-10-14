const express = require("express");
const router = express.Router();
const restoreController = require("../controller/restoreController");

router.post("/", restoreController.restoreBackup);
router.get("/", restoreController.getAvailableBackups);
router.get("/:backupId", restoreController.getBackupData);

module.exports = router;
