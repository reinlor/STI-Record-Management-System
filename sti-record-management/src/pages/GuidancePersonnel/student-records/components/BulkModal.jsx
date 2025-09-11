import React, { useState } from 'react';
import closeB from '../../../../assets/closeblack.png';
import axios from 'axios';
import {X,Check} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const BulkModal = ({ visible, onClose }) => {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState("Waiting for file...");

    if (!visible) return null;

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file); // ⬅️ must match `upload.single('file')` in backend

        try {
            setStatusMessage("Uploading...");
            setUploadProgress(0);

            const response = await axios.post("http://localhost:5000/bulk-upload/students", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                }
            });

            setStatusMessage(`✅ Uploaded! Processed: ${response.data.processed}, Skipped: ${response.data.skipped}`);
            toast.success(`Upload successful! Processed: ${response.data.processed}, Skipped: ${response.data.skipped}`);
            setUploadProgress(100);
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Upload failed. Check console for details.");
            setStatusMessage("❌ Upload failed. Check console.");
            setUploadProgress(0);
        }
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-2xl font-bold text-[#0172bd]">Bulk Add Students</h3>
                    <button
                        className="p-2 rounded-lg hover:bg-gray-200 cursor-pointer"
                        onClick={onClose}
                    >
                        <X className="w-10 h-10 text-[#0172bd]" /> 
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                    <p className="text-gray-700 mb-2">Drop your Excel file here or click to select</p>
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        id="bulkExcelInput"
                        onChange={handleFileChange}
                    />
                    <label
                        htmlFor="bulkExcelInput"
                        className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg"
                    >
                        Select File
                    </label>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                    <div
                        className="bg-[#fef201] h-4 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                    ></div>
                </div>

                <p className="text-gray-500 text-center">{statusMessage}</p>
                <a className="text-blue-500 hover:underline mt-4 block text-center"
                href='downloadlinkngemptyexcelformat'>Download excel format</a>
            </div>
        </div>
    );
};

export default BulkModal;
