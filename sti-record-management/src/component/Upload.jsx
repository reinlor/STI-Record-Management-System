import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Upload.module.css"; // Import modular CSS for styling
import { toast } from "react-toastify";

const Upload = () => {
  // =======================
  // STATE VARIABLES
  // =======================
  const [file, setFile] = useState(null); // Stores the selected file
  const [imageUrl, setImageUrl] = useState(""); // Stores Cloudinary image URL
  const [publicID, setPublicID] = useState(""); // Stores Cloudinary public ID
  const [images, setImages] = useState([]); // Stores list of all saved images from Firestore
  const [preview, setPreview] = useState(null); // NEW: preview before upload

  // =======================
  // Fetch saved images on component mount
  // =======================
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await axios.get("http://localhost:5000/upload/getImages");
      setImages(res.data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  // =======================
  // DELETE image
  // =======================
  const handleDeleteImage = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/upload/${id}`);
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (error) {
      console.error("Delete image error:", error);
    }
  };

  // =======================
  // File input change handler (with preview)
  // =======================
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result); // show base64 preview
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // =======================
  // Upload image to Cloudinary
  // =======================
  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/upload/upload",
        formData
      );

      const uploadedUrl = res.data.imageUrl;
      const uploadedID = res.data.publicID;

      setImageUrl(uploadedUrl);
      setPublicID(uploadedID);

      // Now use the returned values directly
      const res2 = await axios.post("http://localhost:5000/upload/add", {
        imageUrl: uploadedUrl,
        publicID: uploadedID,
      });

      setImages((prev) => [...prev, res2.data]);
      setImageUrl("");
      setPublicID("");
      setPreview(null);
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

      <div className={styles.uploadSection}>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload to Cloudinary</button>
      </div>

      {/* Preview before upload */}
      {preview && !imageUrl && (
        <div className={styles.preview}>
          <h3>Preview Before Upload</h3>
          <img src={preview} alt="Image Preview" />
        </div>
      )}

      {/* Preview after upload */}
      {imageUrl && (
        <div className={styles.preview}>
          <h3>Uploaded Preview</h3>
          <p>Public ID: {publicID}</p>
          <img src={imageUrl} alt="Uploaded" />
        </div>
      )}

      {/* Saved Images */}
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
                <button onClick={() => handleDeleteImage(img.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
