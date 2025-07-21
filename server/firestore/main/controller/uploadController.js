// Importing necessary modules
const cloudinary = require("../../../config/cloudinary.js"); // Cloudinary config for image uploading
const { getUploadCollection } = require("../models/uploadModel.js"); // Firestore upload collection reference
const fs = require("fs"); // File system module for removing temporary files

// =====================
// Get all uploaded images from Firestore
// =====================
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
    res.status(500).send({ error: "Failed to fetch images" });
  }
};

// =====================
// Delete an image from both Cloudinary and Firestore
// =====================
const deleteImage = async (req, res) => {
  try {
    const { id } = req.params; // Extract the Firestore document ID from route

    // Reference and retrieve the document snapshot
    const docRef = getUploadCollection().doc(id);
    const docSnap = await docRef.get();

    // If document doesn't exist, send 404 error
    if (!docSnap.exists) {
      return res.status(404).send({ error: "Image not found" });
    }

    // Extract Cloudinary public ID from Firestore document
    const { publicID } = docSnap.data();

    // Delete the image from Cloudinary using publicID
    await cloudinary.uploader.destroy(publicID);

    // Delete the document from Firestore
    await docRef.delete();

    // Send success response
    res.status(200).send({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).send({ error: "Failed to delete image" });
  }
};

// =====================
// Upload an image to Cloudinary
// =====================
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

// =====================
// Add uploaded image details to Firestore
// =====================
const addImage = async (req, res) => {
  const { imageUrl, publicID } = req.body; // Extract from frontend request body

  const newImage = { imageUrl, publicID }; // Create a new image object

  try {
    // Save the image object as a new document in Firestore
    const docRef = await getUploadCollection().add(newImage);

    // Respond with the newly created document ID and data
    res.status(201).send({ id: docRef.id, ...newImage });
  } catch (error) {
    console.error("Error adding image:", error);
    res.status(500).send({ error: "Failed to add image" });
  }
};

// Export controller functions for use in Express routes
module.exports = {
  uploadImage,
  addImage,
  getAllImages,
  deleteImage,
};
