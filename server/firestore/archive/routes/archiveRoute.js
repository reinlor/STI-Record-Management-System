// firestore/main/routes/archiveRoute.js
const express = require("express");
const archiveController = require("../controllers/archiveController"); // Adjust path as needed
const router = express.Router();

// Middleware for authentication/authorization (highly recommended)
const authenticateUser = (req, res, next) => {
  // Implement your actual authentication and authorization logic here.
  // Example: Check if user is logged in and has an 'admin' or 'archiver' role.
  // if (!req.user || !req.user.roles.includes('archiver')) {
  //   return res.status(403).json({ message: "Access denied. Insufficient privileges for archiving." });
  // }
  console.log("Authentication placeholder: User is allowed to archive.");
  next();
};

// Route to archive a specific student and ALL their related documents
router.post("/student/:studentId", authenticateUser, archiveController.archiveStudentData);

// Route to get an archived document (for viewing/unarchiving purposes)
router.get("/:collectionName/:documentId", authenticateUser, archiveController.getArchivedDocumentById);

// You can remove the old single document archive route if no longer needed
// router.post("/:collectionName/:documentId", authenticateUser, archiveController.archiveDocumentById);

module.exports = router;