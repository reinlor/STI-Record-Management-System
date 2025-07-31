// firestore/main/controllers/archiveController.js
const archiveModel = require("../models/archiveModel"); // Adjust path as needed

/**
 * Handles the request to archive a student and all their related documents.
 * Expects studentId as a URL parameter.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.archiveStudentData = async (req, res) => {
  const { studentId } = req.params; // Get studentId from URL parameters

  if (!studentId) {
    return res.status(400).json({ message: "Student ID is required for archiving." });
  }

  try {
    const archivedCount = await archiveModel.archiveStudentAndRelatedData(studentId);
    res.status(200).json({
      message: `Student '${studentId}' and ${archivedCount} related documents successfully archived.`,
      archivedDocumentsCount: archivedCount,
    });
  } catch (error) {
    console.error("Error archiving student and related data:", error.message);
    if (error.message.includes("Student document with ID")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to archive student data.", error: error.message });
  }
};

// Existing getArchivedDocumentById remains the same if you need it
exports.getArchivedDocumentById = async (req, res) => {
  const { collectionName, documentId } = req.params;

  if (!collectionName || !documentId) {
    return res
      .status(400)
      .json({
        message: "Collection name and document ID are required.",
      });
  }

  try {
    const archivedData = await archiveModel.getArchivedDocument(
      collectionName,
      documentId
    );
    if (archivedData) {
      res.status(200).json({
        message: `Archived document '${documentId}' from collection '${collectionName}' retrieved successfully.`,
        data: archivedData,
      });
    } else {
      res.status(404).json({ message: "Archived document not found." });
    }
  } catch (error) {
    console.error("Error retrieving archived document:", error.message);
    res.status(500).json({ message: "Failed to retrieve archived document.", error: error.message });
  }
};