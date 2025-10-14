// Importing necessary modules
const cloudinary = require("../../../config/cloudinary.js"); // Cloudinary config for image uploading
const { getUploadCollection } = require("../models/uploadModel.js"); // Firestore upload collection reference
const fs = require("fs"); // File system module for removing temporary files

// Get all uploaded images from Firestore
const getAllImages = async (req, res) => {
  try {
    // Fetch all documents in the upload collection (images stored in Firestore)
    const snapshot = await getUploadCollection().get();

    // Convert each document snapshot into a plain JS object
    const images = snapshot.docs.map((doc) => ({
      id: doc.id,         // Firestore document ID
      ...doc.data(),      // Spread the document data (imageUrl, publicID)
    }));

    // Send images as JSON response
    res.status(200).json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
};

// Delete an image from both Cloudinary and Firestore
const deleteImage = async (req, res) => {
  try {
    const { id } = req.params; // Extract the Firestore document ID from route

    // Reference and retrieve the document snapshot
    const docRef = getUploadCollection().doc(id);
    const docSnap = await docRef.get();

    // If document doesn't exist, send 404 error
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Extract Cloudinary public ID from Firestore document
    const { publicID } = docSnap.data();

    // Delete the image from Cloudinary using publicID
    await cloudinary.uploader.destroy(publicID);

    // Delete the document from Firestore
    await docRef.delete();

    // Send success response
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
};

// Upload an image to Cloudinary
const uploadImage = async (req, res) => {
  try {
    // Upload the image file from temporary upload directory to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "uploads", // Store inside "uploads" folder in your Cloudinary account
    });

    // Delete the local temporary file after successful upload
    fs.unlinkSync(req.file.path);

    // Return Cloudinary URL and public ID for further use
    res.status(200).json({
      imageUrl: result.secure_url,
      publicID: result.public_id,
    });
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    res.status(500).json({ error: "Failed to upload image" });
  }
};

const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }
    if (req.files.length > 3) {
      return res.status(400).json({ error: "Maximum 3 images allowed" });
    }

    const uploadResults = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "uploads",
      });
      fs.unlinkSync(file.path); // Remove temp file
      uploadResults.push({
        imageUrl: result.secure_url,
        publicID: result.public_id,
      });
    }

    res.status(200).json(uploadResults);
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    res.status(500).json({ error: "Failed to upload images" });
  }
};


// Export controller functions for use in Express routes
module.exports = {
  uploadImage,
  getAllImages,
  deleteImage,
  uploadImages
};
