const express = require("express");
const { addRecord, deleteRecord, getAllRecords, getRecords, updateRecord } = require("../controller/recordController");
const router = express.Router();

router.post("/:id", addRecord);                  // For adding records
router.delete("/delete/:id", deleteRecord);      // For deleting records (archive pero sa later date na)
router.get("/", getAllRecords);                  // For displaying all records
router.get("/allRecords/:id", getRecords)        // For displaying a record by ID
router.post("/records/:id", updateRecord)        // For updating a record by ID

module.exports = router;
