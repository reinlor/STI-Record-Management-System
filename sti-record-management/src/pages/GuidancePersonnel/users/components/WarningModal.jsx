import React from 'react';
import Modal from './Modal'; // Use your existing Modal component

export default function WarningModal({ isOpen, onClose, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Warning: User Management Access">
      <div className="space-y-4">
        <p className="text-red-600 font-semibold">
          Giving <b>User Management</b> access allows this user to edit module access for all users, including themselves. 
          Please ensure you trust this user with administrative privileges.
        </p>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-[#dc3545] hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Proceed
          </button>
        </div>
      </div>
    </Modal>
  );
}