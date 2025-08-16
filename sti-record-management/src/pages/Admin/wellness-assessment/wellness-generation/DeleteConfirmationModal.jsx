import React from 'react';

const DeleteConfirmationModal = ({ onConfirm, onCancel, questionText }) => {
  return (
    <div
      className="fixed inset-0 bg-opacity-30 flex items-center justify-center p-4 z-50 animate-fade-in"
      style={{ backdropFilter: 'blur(10px)' }}
      onClick={onCancel}
    >
      <div
        className="p-6 my-4 bg-white rounded-lg shadow-lg max-w-sm w-full relative animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4 text-red-600">Confirm Deletion</h3>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete this question?
          <br /><br />
          <strong>"{questionText}"</strong>
        </p>
        <div className="flex justify-between">
          <button
            onClick={onConfirm}
            className="flex-1 py-2 px-4 mr-2 bg-red-500 text-white font-bold rounded-md hover:bg-red-600 transition-colors cursor-pointer"
            type="button"
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 ml-2 bg-gray-500 text-white font-bold rounded-md hover:bg-gray-600 transition-colors cursor-pointer"
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;