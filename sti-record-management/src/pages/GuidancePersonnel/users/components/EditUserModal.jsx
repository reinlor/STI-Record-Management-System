// EditUserModal.jsx

import React from 'react';
import Modal from './Modal';
import { X, Check } from 'lucide-react';
import { accessPermissions } from './AccessUtils';

export default function EditUserModal({ isOpen, onClose, editedUser, handleUserAccessToggle,
  handleSaveChanges }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User Information">
      {editedUser && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0172bd] ">Name</label>
              <p className="text-gray-900 font-semibold">{editedUser.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0172bd] ">Role</label>
              <p className="text-gray-900 font-semibold">{(editedUser.roles || []).join(', ')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0172bd] ">Position</label>
              <p className="text-gray-900 font-semibold">{editedUser.position || ''}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0172bd] ">Employee Number</label>
              <p className="text-gray-900 font-semibold">{editedUser.employeeNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0172bd] ">Email</label>
              <p className="text-gray-900 font-semibold">{editedUser.email}</p>
            </div>
          </div>

          {/* Hide access section if Teacher */}
          {!(editedUser.roles && editedUser.roles.includes('Teacher')) && (
            <div className="mt-6">
              <label className="block text-sm font-bold text-[#0172bd]">Access</label>
              <div className="mt-2 space-y-2">
                {accessPermissions.map((permission, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between p-2 rounded-lg  bg-[#f3f4f6]">
                      <span className="text-sm font-medium text-[#0172bd]">{permission}</span>
                      {['Student 201 Files', 'Student Cases'].includes(permission) ? null : (
                        <input
                          type="checkbox"
                          name={permission}
                          id={`edit-toggle-${permission}`}
                          checked={!!editedUser.access?.[permission]}
                          onChange={() => handleUserAccessToggle(permission)}
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
                            id={`edit-toggle-${permission}-canView`}
                            checked={!!editedUser.access?.[permission]?.canView}
                            onChange={() => handleUserAccessToggle(permission, 'canView')}
                            className="toggle-checkbox accent-[#fef201]"
                          />
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-[#f3f4f6]">
                          <span className="text-sm text-gray-600">Can Edit</span>
                          <input
                            type="checkbox"
                            name={`${permission}-canEdit`}
                            id={`edit-toggle-${permission}-canEdit`}
                            checked={!!editedUser.access?.[permission]?.canEdit}
                            onChange={() => handleUserAccessToggle(permission, 'canEdit')}
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
            {!(editedUser.roles && editedUser.roles.includes('Teacher')) ? (<>
              <button
                onClick={onClose}
                className="flex items-center justify-center space-x-2 bg-[#dc3545] hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out cursor-pointer"
              >
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSaveChanges}
                className="flex items-center justify-center space-x-2 bg-[#28a745] hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out cursor-pointer"
              >
                <Check className="w-5 h-5" />
                <span>Save Changes</span>
              </button></>) :
              <button
                onClick={onClose}
                className="flex items-center justify-center space-x-2 bg-[#dc3545] hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out cursor-pointer"
              >
                <X className="w-5 h-5" />
                <span>Close</span>
              </button>
            }
          </div>
        </div>
      )}
    </Modal>
  );
} 