// Import required modules
const express = require("express");
const multer = require("multer");
const path = require("path");

// Import controller functions for handling image logic
const {
  uploadImage,
  uploadImages,
  getAllImages,
  deleteImage,
} = require("../controller/uploadController.js");

// Create a new Express router instance
const router = express.Router();

// ==========================
// ROUTES
// ==========================

// ✅ GET all images from Firestore
// This must match the path used in your React frontend (e.g., axios.get("/upload2/getImages"))
router.get("/getImages", getAllImages);

// ==========================
// Upload Setup using multer
// ==========================

// Use multer to temporarily store uploaded files in the /uploads folder
const upload = multer({
  dest: path.join(__dirname, "../uploads"), // Temporary local storage before uploading to Cloudinary
});

// ✅ POST image file to Cloudinary
// First uploads the file to the server using multer, then passes it to the Cloudinary uploader in the controller
router.post("/upload", upload.single("image"), uploadImage);

// ✅ POST multiple images to Cloudinary (1-3 images)
router.post("/add-multiple", upload.array("images", 3), uploadImages);

// ✅ DELETE an image document from Firestore by document ID
// Called by passing the Firestore document ID as a URL parameter (e.g., /upload2/123456)
router.delete("/:id", deleteImage);

// Export the router to be used in index.js
module.exports = router;
