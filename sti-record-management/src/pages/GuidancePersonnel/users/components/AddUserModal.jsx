import React from 'react';
import Modal from './Modal';
import { X, Check } from 'lucide-react';
import { accessPermissions } from './AccessUtils';

export default function AddUserModal({
    isOpen, onClose, newUser, handleAddUserChange, handleRoleSelect,
    handleAddUserAccessToggle, handleCreateUser, initialNewUserAccess
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add User">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input type="text" name="name" value={newUser.name} onChange={handleAddUserChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Employee Number</label>
                        <input type="text" name="employeeNumber" value={newUser.employeeNumber} onChange={handleAddUserChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                            name="role"
                            value={newUser.roles[0] || ''}
                            onChange={(e) => handleRoleSelect(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        >
                            <option value="">Select role</option>
                            <option value="Admin">Admin</option>
                            <option value="Disciplinary">Disciplinary</option>
                            <option value="Teacher">Teacher</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" value={newUser.email} onChange={handleAddUserChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                    </div>
                </div>
                {!(newUser.roles[0] === 'Teacher') && (
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
                                                id={`add-toggle-${permission}`}
                                                checked={newUser.access[permission]}
                                                onChange={() => handleAddUserAccessToggle(permission)}
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
                                                    id={`add-toggle-${permission}-canView`}
                                                    checked={newUser.access[permission].canView}
                                                    onChange={() => handleAddUserAccessToggle(permission, 'canView')}
                                                    className="toggle-checkbox"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-100">
                                                <span className="text-sm text-gray-600">Can Edit</span>
                                                <input
                                                    type="checkbox"
                                                    name={`${permission}-canEdit`}
                                                    id={`add-toggle-${permission}-canEdit`}
                                                    checked={newUser.access[permission].canEdit}
                                                    onChange={() => handleAddUserAccessToggle(permission, 'canEdit')}
                                                    className="toggle-checkbox"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center space-x-2 bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-150 ease-in-out"
                    >
                        <X className="w-5 h-5" />
                        <span>Cancel</span>
                    </button>
                    <button
                        onClick={handleCreateUser}
                        className="flex items-center justify-center space-x-2 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition duration-150 ease-in-out"
                    >
                        <Check className="w-5 h-5" />
                        <span>Create</span>
                    </button>
                </div>
            </div>
        </Modal>
    );
}