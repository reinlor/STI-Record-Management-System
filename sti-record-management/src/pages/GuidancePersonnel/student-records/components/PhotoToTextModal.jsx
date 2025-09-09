import React, { useState } from 'react';
import closeB from '../../../../assets/closeblack.png';
import axios from 'axios';
import {X,Check} from 'lucide-react';

const PhotoToTextModal = ({ visible, onClose, onOCRSuccess }) => {
    const [loading, setLoading] = useState(false);

    if (!visible) return null;

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            const res = await axios.post("http://localhost:5000/photo-to-text/ocr", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setLoading(false);

            // send extracted data to parent
            if (res.data && res.data.success && res.data.ocr) {
                onOCRSuccess(res.data.ocr);
                onClose();
            }

        } catch (err) {
            setLoading(false);
            console.error("OCR failed", err);
            alert("OCR failed. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-2xl font-bold text-[#0172bd]">Photo-to-Text (OCR)</h3>
                    <button className="p-2 rounded-lg hover:bg-gray-200 cursor-pointer" onClick={onClose}>
                        <X className="w-10 h-10 text-[#0172bd]" /> 
                    </button>
                </div>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                    <p className="text-gray-700 mb-2">Upload a JPEG or PNG image</p>
                    <input type="file" accept="image/jpeg,image/png" className="hidden" id="photoToTextInput" onChange={handleFileChange} />
                    <label htmlFor="photoToTextInput" className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg">
                        {loading ? "Scanning..." : "Select Image"}
                    </label>
                </div>
                <p className="text-gray-500 text-center">After upload, fields will be prefilled automatically.</p>
            </div>
        </div>
    );
};

export default PhotoToTextModal;
