// AddUserModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { X, Check, Eye, EyeOff } from 'lucide-react';
import { accessPermissions } from './AccessUtils';

export default function AddUserModal({
    isOpen,
    onClose,
    newUser,
    handleAddUserChange,
    handleRoleSelect,
    handleAddUserAccessToggle,
    handleCreateUser,
    initialNewUserAccess,
}) {
    // we handle adminPosition and customRole locally, then pass derived values to parent via 
    handleRoleSelect
    const [topRole, setTopRole] = useState(''); // 'Admin' or 'Teacher' 
    const [adminPosition, setAdminPosition] = useState(''); // 'Disciplinary' | 'Other' 
    const [customAdminPosition, setCustomAdminPosition] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setTopRole('');
            setAdminPosition('');
            setCustomAdminPosition('');
        }
    }, [isOpen]);

    const onTopRoleChange = (value) => {
        setTopRole(value);
        // if Teacher, immediately set position => Teacher 
        if (value === 'Teacher') {
            setAdminPosition('');
            setCustomAdminPosition('');
            handleRoleSelect('Teacher', 'Teacher');
        } else if (value === 'Admin') {
            // default Admin with position 'Admin' until adminPosition chosen 
            handleRoleSelect('Admin', 'Admin');
        } else {
            // nothing selected 
            handleRoleSelect('', '');
        }
    };

    const onAdminPositionChange = (value) => {
        setAdminPosition(value);
        if (value === 'Other') {
            // wait for custom input 
            handleRoleSelect('Admin', '');
        } else {
            // Disciplinary 
            handleRoleSelect('Admin', value);
        }
    };

    const onCustomAdminPositionInput = (e) => {
        setCustomAdminPosition(e.target.value);
        handleRoleSelect('Admin', e.target.value || '');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add User">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[#0172bd] ">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={newUser.name}
                            onChange={handleAddUserChange}
                            className="mt-1 block w-full h-8 rounded-md shadow-sm focus:ring focus:ring-[#0172bd] hover:bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#0172bd]">Employee Number</label>
                        <input
                            type="text"
                            name="employeeNumber"
                            value={newUser.employeeNumber}
                            onChange={handleAddUserChange}
                            className="mt-1 block w-full h-8 rounded-md shadow-sm focus:ring focus:ring[#0172bd] hover:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#0172bd] items-center">Role</label>
                        <select
                            name="role"
                            value={topRole}
                            onChange={(e) => onTopRoleChange(e.target.value)}
                            className="mt-1 block w-full h-8 rounded-md shadow-sm focus:ring focus:ring-[#0172bd] hover:bg-gray-100 cursor-pointer"
                        >
                            <option value="">Select role</option>
                            <option value="Admin">Admin</option>
                            <option value="Teacher">Teacher</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">If Admin is selected, choose Admin position
                            below (Disciplinary or Other).</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#0172bd]">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={newUser.email}
                            onChange={handleAddUserChange}
                            className="mt-1 block w-full h-8 rounded-md shadow-sm border-blue-300 focus:ring focus:ring-[#0172bd] hover:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#0172bd]">Default Password</label>
                        <div className="mt-1 flex items-center">
                            <span className="block w-full h-8 rounded-md shadow-sm border-blue-300 focus:ring focus:ring-[#0172bd] hover:bg-gray-100 px-3 py-1 bg-gray-50 text-gray-900">
                                {showPassword ? '123456' : '******'}
                            </span>
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-2 text-gray-600 hover:text-gray-800 cursor-pointer">
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Admin position selector — only show if Admin selected */}
                {topRole === 'Admin' && (
                    <div>
                        <label className="block text-sm font-medium text-[#0172bd]">Admin Position</label>
                        <select
                            name="adminPosition"
                            value={adminPosition}
                            onChange={(e) => onAdminPositionChange(e.target.value)}
                            className="mt-1 block w-1/2 h-8 rounded-md shadow-sm focus:ring focus:ring-[#0172bd] hover:bg-gray-100"
                        >
                            <option value="">Select admin position (optional)</option>
                            <option value="Disciplinary">Disciplinary</option>
                            <option value="Other">Other roles</option>
                        </select>

                        {adminPosition === 'Other' && (
                            <input
                                type="text"
                                placeholder="Enter custom role name (e.g., Registrar)"
                                value={customAdminPosition}
                                onChange={onCustomAdminPositionInput}
                                className="mt-2 block w-1/2 h-8 rounded-md shadow-sm border-blue-300 focus:ring focus:ring-[#0172bd] hover:bg-gray-100"
                            />
                        )}
                    </div>
                )}

                {/* Access section: hide when Teacher */}
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
                                                checked={!!newUser.access[permission]}
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
                                                    checked={!!newUser.access[permission]?.canView}
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
                                                    checked={!!newUser.access[permission]?.canEdit}
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
                        className="flex items-center justify-center space-x-2 bg-[#dc3545] hover:bg-red-700  text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out cursor-pointer"
                    >
                        <span>Cancel</span>
                        <X className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleCreateUser}
                        className="flex items-center justify-center space-x-2 bg-[#28a745] hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-lg  transition duration-150 ease-in-out cursor-pointer"
                    >
                        <span>Create</span>
                        <Check className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </Modal>
    );
} 