const express = require("express");
const { addViolation, deleteViolation, getAllViolations, getViolations, updateViolation } = require("../controller/violationController");
const router = express.Router();

router.post("/:sid", addViolation);

router.delete("/delete/:id", deleteViolation);

router.get("/", getAllViolations);

router.get("/allViolations/:sid", getViolations)

router.post("/update/:id", updateViolation)

module.exports = router;
