import React from 'react';

const ArchiveConfirmModal = ({ visible, onCancel, onConfirm, todo = 'archive' }) => {
    if (!visible) return null;

    function capitalizeFirstLetter(string) {
        if (!string) {
            return '';
        }
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Confirm {todo}</h3>
                <p className="text-gray-700 mb-6">Are you sure you want to {todo} this student?</p>
                <div className="mt-6 flex justify-end space-x-3">
                    <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-150 ease-in-out cursor-pointer" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150 ease-in-out cursor-pointer" onClick={onConfirm}>
                        {capitalizeFirstLetter(todo)}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArchiveConfirmModal;