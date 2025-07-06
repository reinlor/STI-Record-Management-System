import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Upload.module.css"; // Import modular CSS for styling
import { toast } from 'react-toastify';

const Upload = () => {
  // =======================
  // STATE VARIABLES
  // =======================
  const [file, setFile] = useState(null); // Stores the selected file
  const [imageUrl, setImageUrl] = useState(""); // Stores Cloudinary image URL
  const [publicID, setPublicID] = useState(""); // Stores Cloudinary public ID
  const [images, setImages] = useState([]); // Stores list of all saved images from Firestore

  // =======================
  // Fetch saved images on component mount
  // =======================
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      // Request all saved image metadata from backend
      const res = await axios.get("http://localhost:5000/upload/getImages");
      setImages(res.data); // Store in state
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  // =======================
  // DELETE image by document ID from Firestore
  // =======================
  const handleDeleteImage = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/upload/${id}`);
      // Update local state to remove the deleted image
      setImages((prev) => prev.filter((img) => img.id !== id));
      
    } catch (error) {
      console.error("Delete image error:", error);
    }
  };

  // =======================
  // ADD image to Firestore
  // =======================
  const handleAddImage = async () => {
    // Ensure image has been uploaded first
    if (!imageUrl || !publicID) {
      alert("Please upload an image first.");
      return;
    }

    try {
      // Save image metadata to Firestore
      const res = await axios.post("http://localhost:5000/upload/add", {
        imageUrl,
        publicID,
      });

      // Update local state with the newly added image
      setImages((prev) => [...prev, res.data]);
      setImageUrl(""); // Clear image preview
      setPublicID(""); // Clear public ID
    } catch (error) {
      console.error("Add image error:", error);
    }
  };

  // =======================
  // Track file input change
  // =======================
  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Store selected file in state
  };

  // =======================
  // Upload image file to Cloudinary
  // =======================
  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("image", file); // Append selected file

    try {
      // Send POST request to backend which uploads to Cloudinary
      const res = await axios.post(
        "http://localhost:5000/upload/upload",
        formData
      );
      setImageUrl(res.data.imageUrl); // Store Cloudinary image URL
      setPublicID(res.data.publicID); // Store Cloudinary public ID
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  // =======================
  // JSX Template
  // =======================
  return (
    <div className={styles.container}>
      <h2>Cloudinary Image Uploader</h2>

      {/* Upload controls */}
      <div className={styles.uploadSection}>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload to Cloudinary</button>
        <button onClick={handleAddImage}>Save to Firestore</button>
      </div>

      {/* Preview uploaded image */}
      {imageUrl && (
        <div className={styles.preview}>
          <h3>Preview</h3>
          <p>Public ID: {publicID}</p>
          <img src={imageUrl} alt="Preview" />
        </div>
      )}

      {/* Display gallery of saved images */}
      <div className={styles.gallery}>
        <h3>All Uploaded Images</h3>
        {images.length === 0 ? (
          <p>No images yet.</p>
        ) : (
          <div className={styles.grid}>
            {images.map((img) => (
              <div key={img.id} className={styles.card}>
                <img src={img.imageUrl} alt={img.publicID} />
                <p>{img.publicID}</p>
                <button onClick={() => handleDeleteImage(img.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
