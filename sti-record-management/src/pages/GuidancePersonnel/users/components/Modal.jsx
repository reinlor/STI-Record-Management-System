import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
            <div className="bg-white rounded-lg shadow-xl z-60 max-w-2xl w-full p-6 mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-800">×</button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
}