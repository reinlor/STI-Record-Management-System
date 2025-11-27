// BulkModal.jsx (replace your component with this)
import React, { useState, useRef } from 'react';
import { X, Eye, EyeOff, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const BulkModal = ({ visible, onClose }) => {
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState("Waiting for file...");
    const [uploadDetails, setUploadDetails] = useState({
        added: [],
        updated: [],
        skipped: [],
        skippedCount: 0,
    });
    const [defaultPassword, setDefaultPassword] = useState('student1234');
    const [showPassword, setShowPassword] = useState(false);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingFile, setPendingFile] = useState(null);

    if (!visible) return null;

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPendingFile(file);
        setShowConfirmModal(true);
    };

    const handleCancelConfirm = () => {
        setShowConfirmModal(false);
        setPendingFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const proceedBulkUpload = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            setIsUploading(true);
            setStatusMessage("Uploading...");
            setUploadProgress(0);

            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    const next = prev + Math.random() * 30;
                    return next > 90 ? 90 : next; 
                });
            }, 300);

            const response = await axios.post("/bulk-upload/students", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    if (!progressEvent.total) return;
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                }
            });

            clearInterval(progressInterval);

            const resp = response.data || {};
            const added = Array.isArray(resp.added) ? resp.added : [];
            const updated = Array.isArray(resp.updated) ? resp.updated : [];

            let skippedArr = [];
            let skippedCount = 0;
            if (Array.isArray(resp.skipped)) {
                skippedArr = resp.skipped;
                skippedCount = skippedArr.length;
            } else if (typeof resp.skipped === 'number') {
                skippedArr = [];
                skippedCount = resp.skipped;
            } else if (typeof resp.skipped === 'string' && resp.skipped.trim().length > 0) {
                skippedArr = [resp.skipped];
                skippedCount = skippedArr.length;
            }

            setUploadDetails({ added, updated, skipped: skippedArr, skippedCount });

            setUploadProgress(100);
            const processed = typeof resp.processed === 'number' ? resp.processed : resp.processed || added.length;
            setStatusMessage(`Uploaded! Processed: ${processed}, Skipped: ${skippedCount}`);
            toast.success(`Upload successful! Processed: ${processed}, Skipped: ${skippedCount}`);
            
            await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Upload failed. Check console for details.");
            setStatusMessage("Upload failed. Check console.");
            setUploadProgress(0);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = "";
            setIsUploading(false);
            setPendingFile(null);
        }
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            {showConfirmModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h2 className="text-xl font-bold mb-4 text-[#0172bd]">Confirm Bulk Upload</h2>
                        
                        {/* File Name Display */}
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">Selected File:</p>
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <p className="font-semibold text-gray-900 break-all">
                                    {pendingFile?.name || 'No file selected'}
                                </p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Size: {pendingFile ? `${(pendingFile.size / 1024).toFixed(2)} KB` : 'N/A'}
                            </p>
                        </div>

                        <p className="mb-4 text-gray-700">
                            Are you sure you want to proceed with bulk uploading students from this file? This action may update or add multiple records and cannot be undone.
                        </p>
                        
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 cursor-pointer font-medium"
                                onClick={handleCancelConfirm}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded bg-[#0172bd] text-white hover:bg-blue-500 cursor-pointer font-medium"
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    if (pendingFile) {
                                        proceedBulkUpload(pendingFile);
                                    }
                                }}
                            >
                                Proceed with Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-2xl font-bold text-[#0172bd]">Bulk Add Students</h3>
                    <button
                        className={`p-2 rounded-lg ${isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200 cursor-pointer"}`}
                        disabled={isUploading}
                        onClick={() => {
                            if (isUploading) return;
                            setUploadProgress(0);
                            setStatusMessage("Waiting for file...");
                            setUploadDetails({ added: [], updated: [], skipped: [], skippedCount: 0 });
                            if (fileInputRef.current) fileInputRef.current.value = "";
                            onClose();
                        }}
                    >
                        <X className="w-10 h-10 text-[#0172bd]" />
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                    <p className="text-gray-700 mb-2">Drop your Excel file here or click to select</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        id="bulkExcelInput"
                        onChange={handleFileChange}
                    />
                    <label
                        htmlFor={!isUploading ? "bulkExcelInput" : undefined}
                        className={`cursor-pointer px-4 py-2 rounded-lg ${isUploading
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-100 hover:bg-blue-200 text-blue-800"
                            }`}
                    >
                        {isUploading ? "Uploading..." : "Select File"}
                    </label>
                </div>

                {/* Progress Bar with Percentage */}
                <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
                        <div
                            className="bg-[#fef201] h-4 rounded-full transition-all duration-300 flex items-center justify-center"
                            style={{ width: `${Math.round(uploadProgress)}%` }}
                        >
                            {Math.round(uploadProgress) > 10 && (
                                <span className="text-xs font-bold text-gray-800">
                                    {Math.round(uploadProgress)}%
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-gray-500 text-center flex-1">{statusMessage}</p>
                        <span className="text-sm font-semibold text-[#0172bd] ml-2">
                            {Math.round(uploadProgress)}%
                        </span>
                    </div>
                </div>

                <a className="text-blue-500 hover:underline mt-4 block text-center" target="_blank" rel="noreferrer"
                    href="https://docs.google.com/spreadsheets/d/17zlRmtjL1YlJusBXpifd8U5cq5tIlfgK/edit?usp=sharing&ouid=102643336413636901319&rtpof=true&sd=true">
                    Download excel format
                </a>

                {/* Password Section */}
                <div className="mt-4">
                    <label className="block text-sm font-medium text-[#0172bd]">Default Password</label>
                    <div className="mt-1 flex items-center">
                        <span className="block w-full h-8 rounded-md shadow-sm border-blue-300 focus:ring focus:ring-[#0172bd] hover:bg-gray-100 px-3 py-1 bg-gray-50 text-gray-900">
                            {showPassword ? defaultPassword : '******'}
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="ml-2 text-gray-600 hover:text-gray-800 cursor-pointer"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Results */}
                <div className="mt-4 border-t pt-2 max-h-40 overflow-y-auto text-sm">
                    <h4 className="font-bold text-green-600">✅ Added:</h4>
                    {uploadDetails.added.length > 0 ? (
                        <ul className="list-disc ml-5">
                            {uploadDetails.added.map((s, i) => <li key={`a-${i}`}>{s}</li>)}
                        </ul>
                    ) : <p className="text-gray-500">None</p>}

                    <h4 className="font-bold text-yellow-600 mt-2">✏️ Updated:</h4>
                    {uploadDetails.updated.length > 0 ? (
                        <ul className="list-disc ml-5">
                            {uploadDetails.updated.map((s, i) => <li key={`u-${i}`}>{s}</li>)}
                        </ul>
                    ) : <p className="text-gray-500">None</p>}

                    <h4 className="font-bold text-red-600 mt-2">⏭ Skipped:</h4>
                    {uploadDetails.skipped.length > 0 ? (
                        <ul className="list-disc ml-5">
                            {uploadDetails.skipped.map((s, i) => <li key={`s-${i}`}>{s}</li>)}
                        </ul>
                    ) : (
                        <p className="text-gray-500">Skipped count: {uploadDetails.skippedCount}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkModal;
