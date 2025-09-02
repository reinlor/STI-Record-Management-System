import React from 'react';
import closeB from '../../../../assets/closeblack.png';

const PhotoToTextModal = ({ visible, onClose }) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">Photo-to-Text (OCR)</h3>
                    <button className="p-2 rounded-lg hover:bg-gray-200 cursor-pointer" onClick={onClose}>
                        <img src={closeB} alt="closeIcon" className="w-5 h-5 object-cover" />
                    </button>
                </div>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                    <p className="text-gray-700 mb-2">Upload a JPEG or PNG image</p>
                    <input type="file" accept="image/jpeg,image/png" className="hidden" id="photoToTextInput" />
                    <label htmlFor="photoToTextInput" className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg">
                        Select Image
                    </label>
                </div>
                <p className="text-gray-500 text-center">After upload, you will be redirected to the add student form with prefilled fields.</p>
            </div>
        </div>
    );
};

export default PhotoToTextModal;