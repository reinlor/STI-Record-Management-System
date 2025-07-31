// firestore/main/models/archiveModel.js
const firebaseAdmin = require("firebase-admin"); // <-- ADD THIS LINE to get the base firebase-admin module
const { admin, archive } = require("../../../firebase"); // This imports your initialized app instances

const db = admin.firestore(); // Main Firestore instance (from the initialized 'admin' app)
const archiveDb = archive.firestore(); // Archive Firestore instance (from the initialized 'archive' app)

// Define the collections related to a student and their respective foreign key fields
const STUDENT_RELATED_COLLECTIONS = [
  { collectionName: "students", studentIdField: "id" }, // 'id' indicates the document ID for the 'students' collection
  { collectionName: "lateSlips", studentIdField: "sid" },
  { collectionName: "absentSlips", studentIdField: "sid" },
  { collectionName: "idPassSlips", studentIdField: "sid" }, // Corrected: Now uses 'sid'
  { collectionName: "assessmentReport", studentIdField: "sid" },
  { collectionName: "counselings", studentIdField: "sid" },
  { collectionName: "violations", studentIdField: "sid" },
];

/**
 * Archives a student and all their related documents across specified collections.
 * This operation involves reading data from the main database, writing to the archive database,
 * and then deleting from the main database. It uses batch writes for efficiency.
 *
 * @param {string} studentId - The ID of the student to archive.
 * @returns {Promise<number>} - A promise that resolves with the total number of documents archived.
 * @throws {Error} If the student document is not found, or any database operation fails.
 */
const archiveStudentAndRelatedData = async (studentId) => {
  if (!studentId) {
    throw new Error("Student ID is required for archiving.");
  }

  const docsToArchive = []; // Store documents to be archived along with their collection & original ID

  try {
    // Phase 1: Gather all related documents from the active database
    console.log(`[Archive Model] Gathering data for student ${studentId} from active database...`);
    for (const config of STUDENT_RELATED_COLLECTIONS) {
      const { collectionName, studentIdField } = config;
      let querySnapshot;

      if (collectionName === "students" && studentIdField === "id") {
        // Special handling for the main 'students' document, fetched by its document ID
        const docRef = db.collection(collectionName).doc(studentId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          docsToArchive.push({
            collection: collectionName,
            id: docSnap.id,
            data: docSnap.data(),
          });
          console.log(`- Found student document: ${docSnap.id}`);
        } else {
          // If the primary student document isn't found, we cannot proceed with archiving
          throw new Error(`Student document with ID '${studentId}' not found in 'students' collection.`);
        }
      } else {
        // For all other related collections, query by the specified studentIdField (e.g., 'sid')
        querySnapshot = await db.collection(collectionName)
                                 .where(studentIdField, "==", studentId)
                                 .get();

        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            docsToArchive.push({
              collection: collectionName,
              id: doc.id,
              data: doc.data(),
            });
          });
          console.log(`- Found ${querySnapshot.size} documents in '${collectionName}' for student ${studentId}.`);
        } else {
          console.log(`- No documents found in '${collectionName}' for student ${studentId}.`);
        }
      }
    }

    if (docsToArchive.length === 0) {
        throw new Error(`No documents found related to student ID '${studentId}' for archiving. (Perhaps only the student document was missing if that was the only one expected)`);
    }

    // Phase 2: Write all gathered documents to the archive database using a batch
    console.log(`[Archive Model] Starting archive write for ${docsToArchive.length} documents...`);
    let archiveBatch = archiveDb.batch(); // Initialize the batch
    let writeCount = 0;

    for (const docInfo of docsToArchive) {
      const archiveDocRef = archiveDb.collection(docInfo.collection).doc(docInfo.id);
      const dataWithTimestamp = {
        ...docInfo.data,
        archivedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(), // <-- FIXED THIS LINE
      };
      archiveBatch.set(archiveDocRef, dataWithTimestamp);
      writeCount++;

      // Commit batch if it gets too large (Firestore limit is 500 operations per batch)
      if (writeCount % 499 === 0) { // Commit at 499 to leave room for one more write in the next iteration or final commit
        await archiveBatch.commit();
        console.log(`- Committed ${writeCount} documents to archive (batch complete).`);
        archiveBatch = archiveDb.batch(); // Start a new batch
      }
    }
    // Commit any remaining operations in the last batch
    if (writeCount > 0 && writeCount % 499 !== 0) { // Only commit if there are pending writes in the current batch
      await archiveBatch.commit();
      console.log(`- Committed final ${writeCount} documents to archive (remaining in batch).`);
    } else if (writeCount === 0 && docsToArchive.length > 0) {
         if (docsToArchive.length > 0) { // Ensure there were docs to process
            await archiveBatch.commit(); // Commit the last batch if it somehow wasn't committed
            console.log(`- Committed final (empty or small) batch to archive.`);
         }
    }
    console.log(`[Archive Model] Successfully wrote ${writeCount} documents to archive database.`);


    // Phase 3: Delete all archived documents from the active database using a batch
    console.log(`[Archive Model] Starting deletion of ${docsToArchive.length} documents from active database...`);
    let deleteBatch = db.batch(); // Initialize the batch
    let deleteCount = 0;

    for (const docInfo of docsToArchive) {
      const activeDocRef = db.collection(docInfo.collection).doc(docInfo.id);
      deleteBatch.delete(activeDocRef);
      deleteCount++;

      // Commit batch if it gets too large
      if (deleteCount % 499 === 0) {
        await deleteBatch.commit();
        console.log(`- Deleted ${deleteCount} documents from active DB (batch complete).`);
        deleteBatch = db.batch(); // Start a new batch
      }
    }
    // Commit any remaining operations in the last batch
    if (deleteCount > 0 && deleteCount % 499 !== 0) { // Only commit if there are pending deletes in the current batch
      await deleteBatch.commit();
      console.log(`- Deleted final ${deleteCount} documents from active DB (remaining in batch).`);
    } else if (deleteCount === 0 && docsToArchive.length > 0) {
        if (docsToArchive.length > 0) {
            await deleteBatch.commit();
            console.log(`- Deleted final (empty or small) batch from active DB.`);
        }
    }
    console.log(`[Archive Model] Successfully deleted ${deleteCount} documents from active database.`);

    return deleteCount; // Return the count of documents successfully archived and deleted
  } catch (error) {
    console.error("[Archive Model] Error in archiveStudentAndRelatedData:", error);
    // Important: If an error occurs after Phase 2 (writing to archive) but before Phase 3 (deleting from active),
    // you will have duplicate data. Manual intervention or a separate cleanup process might be needed.
    throw error; // Re-throw to be caught by the controller
  }
};

/**
 * Retrieves an archived document from the archive database.
 * This is an example function for completeness, useful for unarchiving or viewing.
 *
 * @param {string} collectionName - The name of the collection in the archive.
 * @param {string} documentId - The ID of the archived document.
 * @returns {Promise<Object|null>} - A promise that resolves with the archived data or null if not found.
 */
const getArchivedDocument = async (collectionName, documentId) => {
  const archiveDocRef = archiveDb.collection(collectionName).doc(documentId);
  const docSnapshot = await archiveDocRef.get();
  if (docSnapshot.exists) {
    return docSnapshot.data();
  }
  return null;
};

module.exports = {
  archiveStudentAndRelatedData,
  getArchivedDocument,
};