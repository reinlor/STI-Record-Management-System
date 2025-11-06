import React, { useState, useEffect } from 'react';
import closeB from '../../../assets/closeblack.png';
import axios from 'axios';

import { toast } from 'react-toastify';

import {X} from 'lucide-react';


const RestoreModal = ({ visible, onClick }) => {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState("Waiting for file...");

    if (!visible) {
        return null;
    }


    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("backup", file); 

        try {
            setStatusMessage("Uploading...");
            setUploadProgress(0);

            const response = await axios.post("/backup/import", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                }
            });

            setStatusMessage(`${response.data.message}`);
            setUploadProgress(100);
            toast.success('Restored succesfully')
        } catch (error) {
            console.error("Upload error:", error);
            setStatusMessage("❌ Upload failed. Check console.");
            toast.error('Restore uploading failed.')
            setUploadProgress(0);
        }
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="text-2xl font-bold text-[#0172bd]">Insert Restore File</h3>
                    <button
                        className="p-2 rounded-lg hover:bg-gray-200 cursor-pointer"
                        onClick={onClick}
                    >
                        <X className="w-10 h-10 object-cover text-[#0172bd] " />
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                    <p className="text-gray-700 mb-2">Drop your Excel file here or click to select</p>
                    <input
                        type="file"
                        accept=".json"
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
            </div>
        </div>
    );
};

export default RestoreModal;
