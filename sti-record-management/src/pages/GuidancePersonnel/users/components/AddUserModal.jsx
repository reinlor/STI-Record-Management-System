import React, { useState } from 'react';
import Modal from './Modal';
import { X, Check } from 'lucide-react';
import { accessPermissions } from './AccessUtils';

export default function AddUserModal({
    isOpen, onClose, newUser, handleAddUserChange, handleRoleSelect,
    handleAddUserAccessToggle, handleCreateUser, initialNewUserAccess
}) {
    // Add local state for custom role
    const [customRole, setCustomRole] = useState('');
    const [showCustomRoleInput, setShowCustomRoleInput] = useState(false);

    // Handle role selection
    const handleRoleChange = (value) => {
        if (value === 'Other') {
            setShowCustomRoleInput(true);
            handleRoleSelect(''); // Clear the role in parent
        } else {
            setShowCustomRoleInput(false);
            setCustomRole('');
            handleRoleSelect(value);
        }
    };

    // Handle custom role input
    const handleCustomRoleInput = (e) => {
        setCustomRole(e.target.value);
        handleRoleSelect(e.target.value); // Pass custom role up
    };

    // Reset custom role input when modal is closed
    React.useEffect(() => {
        if (!isOpen) {
            setShowCustomRoleInput(false);
            setCustomRole('');
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add User"> 
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[#0172bd] ">Name</label>
                        <input type="text" name="name" value={newUser.name} onChange={handleAddUserChange} 
                        className="mt-1 block w-full h-8 rounded-md shadow-sm focus:ring focus:ring-[#0172bd] hover:bg-gray-100" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#0172bd]">Employee Number</label>
                        <input type="text" name="employeeNumber" value={newUser.employeeNumber} onChange={handleAddUserChange} 
                            className="mt-1 block w-full h-8 rounded-md shadow-sm focus:ring focus:ring-[#0172bd] hover:bg-gray-100" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#0172bd] items-center">
                            Role
                            {showCustomRoleInput && (
                                <span className="ml-2 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                                    Custom Role
                                </span>
                            )}
                        </label>
                        {!showCustomRoleInput ? (
                            <select
                                name="role"
                                value={newUser.roles[0] || ''}
                                onChange={(e) => handleRoleChange(e.target.value)}
                                className="mt-1 block w-full h-8 rounded-md shadow-sm focus:ring focus:ring-[#0172bd] hover:bg-gray-100"
                            >
                                <option value="">Select role</option>
                                <option value="Admin">Admin</option>
                                <option value="Disciplinary">Disciplinary</option>
                                <option value="Teacher">Teacher</option>
                                <option value="Other">Other roles</option>
                            </select>
                        ) : (
                            <input
                                type="text"
                                placeholder="Enter custom role name"
                                value={customRole}
                                onChange={handleCustomRoleInput}
                                className="mt-1 block w-full h-8 rounded-md shadow-sm border-blue-300 focus:ring focus:ring-[#0172bd] hover:bg-gray-100"
                            />
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#0172bd]">Email</label>
                        <input type="email" name="email" value={newUser.email} onChange={handleAddUserChange} 
                        className="mt-1 block w-full h-8 rounded-md shadow-sm border-blue-300 focus:ring focus:ring-[#0172bd] hover:bg-gray-100" />
                    </div>
                </div>
                {!(newUser.roles[0] === 'Teacher') && (
                    <div className="mt-6">
                        <label className="block text-sm font-bold text-[#0172bd]">Access</label>
                        <div className="mt-2 space-y-2">
                            {accessPermissions.map((permission, index) => (
                                <div key={index}>
                                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#f3f4f6]">
                                        <span className="text-sm font-medium text-[#0172bd]">{permission}</span>
                                        {['Student 201 Files', 'Student Cases'].includes(permission) ? null : (
                                            <input
                                                type="checkbox"
                                                name={permission}
                                                id={`add-toggle-${permission}`}
                                                checked={newUser.access[permission]}
                                                onChange={() => handleAddUserAccessToggle(permission)}
                                                className="toggle-checkbox accent-[#fef201]"
                                            />
                                        )}
                                    </div>
                                    {['Student 201 Files', 'Student Cases'].includes(permission) && (
                                        <div className="ml-6 mt-2 space-y-2">
                                            <div className="flex items-center justify-between p-2 rounded-lg bg-[#f3f4f6]">
                                                <span className="text-sm text-gray-600">Can View</span>
                                                <input
                                                    type="checkbox"
                                                    name={`${permission}-canView`}
                                                    id={`add-toggle-${permission}-canView`}
                                                    checked={newUser.access[permission].canView}
                                                    onChange={() => handleAddUserAccessToggle(permission, 'canView')}
                                                    className="toggle-checkbox accent-[#fef201]"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between p-2 rounded-lg bg-[#f3f4f6]">
                                                <span className="text-sm text-gray-600">Can Edit</span>
                                                <input
                                                    type="checkbox"
                                                    name={`${permission}-canEdit`}
                                                    id={`add-toggle-${permission}-canEdit`}
                                                    checked={newUser.access[permission].canEdit}
                                                    onChange={() => handleAddUserAccessToggle(permission, 'canEdit')}
                                                    className="toggle-checkbox accent-[#fef201]"
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
                        className="flex items-center justify-center space-x-2 bg-[#dc3545] hover:bg-red-600  text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                    >
                        <span>Cancel</span>
                        <X className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleCreateUser}
                        className="flex items-center justify-center space-x-2 bg-[#28a745] hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-lg  transition duration-150 ease-in-out"
                    >
                        <span>Create</span>
                        <Check className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </Modal>
    );
}