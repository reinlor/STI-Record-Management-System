import React from 'react';
import Modal from './Modal';
import { X, Check } from 'lucide-react';
import { accessPermissions } from './AccessUtils';

export default function EditUserModal({ isOpen, onClose, editedUser, handleUserAccessToggle, handleSaveChanges }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit User Information">
            {editedUser && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Name</label>
                            <p className="text-gray-900 font-semibold">{editedUser.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Role</label>
                            <p className="text-gray-900 font-semibold">{(editedUser.roles || []).join(', ')}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Employee Number</label>
                            <p className="text-gray-900 font-semibold">{editedUser.employeeNumber}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Email</label>
                            <p className="text-gray-900 font-semibold">{editedUser.email}</p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <label className="block text-sm font-bold text-gray-700">Access</label>
                        <div className="mt-2 space-y-2">
                            {accessPermissions.map((permission, index) => (
                                <div key={index}>
                                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                                        <span className="text-sm font-medium text-gray-700">{permission}</span>
                                        {['Student 201 Files', 'Student Cases'].includes(permission) ? null : (
                                            <input
                                                type="checkbox"
                                                name={permission}
                                                id={`edit-toggle-${permission}`}
                                                checked={editedUser.access[permission]}
                                                onChange={() => handleUserAccessToggle(permission)}
                                                className="toggle-checkbox"
                                            />
                                        )}
                                    </div>
                                    {['Student 201 Files', 'Student Cases'].includes(permission) && (
                                        <div className="ml-6 mt-2 space-y-2">
                                            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-100">
                                                <span className="text-sm text-gray-600">Can View</span>
                                                <input
                                                    type="checkbox"
                                                    name={`${permission}-canView`}
                                                    id={`edit-toggle-${permission}-canView`}
                                                    checked={editedUser.access[permission].canView}
                                                    onChange={() => handleUserAccessToggle(permission, 'canView')}
                                                    className="toggle-checkbox"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-100">
                                                <span className="text-sm text-gray-600">Can Edit</span>
                                                <input
                                                    type="checkbox"
                                                    name={`${permission}-canEdit`}
                                                    id={`edit-toggle-${permission}-canEdit`}
                                                    checked={editedUser.access[permission].canEdit}
                                                    onChange={() => handleUserAccessToggle(permission, 'canEdit')}
                                                    className="toggle-checkbox"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center space-x-2 bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-150 ease-in-out"
                        >
                            <X className="w-5 h-5" />
                            <span>Cancel</span>
                        </button>
                        <button
                            onClick={handleSaveChanges}
                            className="flex items-center justify-center space-x-2 bg-[#16A34A] text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-150 ease-in-out"
                        >
                            <Check className="w-5 h-5" />
                            <span>Save Changes</span>
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}