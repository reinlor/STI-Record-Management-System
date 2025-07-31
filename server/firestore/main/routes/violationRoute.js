const express = require("express");
const { addViolation, deleteViolation, getAllViolations, getViolations, updateViolation } = require("../controller/violationController");
const router = express.Router();

router.post("/add", addViolation);                // For adding new violations
router.delete("/delete/:id", deleteViolation);    // For deleting violations
router.get("/", getAllViolations);                // for retrieving all violation
router.get("/allViolations/:sid", getViolations)  // for retrieving violation by ID
router.put("/update/:id", updateViolation)        // for updating violation

module.exports = router;
