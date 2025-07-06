const express = require("express");
const { addRecord, deleteRecord, getAllRecords, getRecords, updateRecord } = require("../controller/recordController");
const router = express.Router();

router.post("/:id", addRecord);

router.delete("/delete/:id", deleteRecord);

router.get("/", getAllRecords);

router.get("/allRecords/:id", getRecords)

router.post("/records/:id", updateRecord)

module.exports = router;
