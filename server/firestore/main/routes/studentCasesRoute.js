const express = require("express");
const multer = require("multer");
const path = require("path");
const { addViolation, deleteViolation, getAllViolations, getViolations, updateViolation } = require("../controller/studentCasesController");
const router = express.Router();

const upload = multer({ dest: path.join(__dirname, "../uploads") });

router.post("/add", upload.single("proof"), addViolation);                // For adding new violations
router.delete("/delete/:id", deleteViolation);                            // For deleting violations
router.get("/", getAllViolations);                                        // for retrieving all violation
router.get("/allViolations/:sid", getViolations)                          // for retrieving violation by ID
router.put("/update/:id", updateViolation)                                // for updating violation

module.exports = router;
