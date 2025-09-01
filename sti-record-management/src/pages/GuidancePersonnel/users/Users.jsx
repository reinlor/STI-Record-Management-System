import React, { useState } from 'react';
import { User, Search, EllipsisVertical, Plus, X, Check, Eye, Archive } from 'lucide-react';

export default function Users() {
    
const [mockUsers, setMockUsers] = useState([
    {
        id: 'user-1',
        name: 'Margallo, Catherine T.',
        roles: ['Guidance Head', 'Super Admin'],
        employeeNumber: '123456789',
        email: 'cathmarg@dasmarinas.sti.edu.ph',
        access: {
            'Student 201 Files': { canView: true, canEdit: true },
            'Student Cases': { canView: true, canEdit: true },
            'Request Slips Form': true,
            'Referral Forms': true,
            'Backup and Restore': true,
            'Student Wellness': true,
        },
        isArchived: false,
    },
    {
        id: 'user-2',
        name: 'Tabilog, Jerwin',
        roles: ['Disciplinary Head'],
        employeeNumber: '987654321',
        email: 'jtabilog@dasmarinas.sti.edu.ph',
        access: {
            'Student 201 Files': { canView: true, canEdit: false },
            'Student Cases': { canView: true, canEdit: false },
            'Request Slips Form': false,
            'Referral Forms': true,
            'Backup and Restore': false,
            'Student Wellness': false,
        },
        isArchived: false,
    },
    {
        id: 'user-3',
        name: 'Cruz, Juan B.',
        roles: ['Guidance Head'],
        employeeNumber: '112233445',
        email: 'jcruz@dasmarinas.sti.edu.ph',
        access: {
            'Student 201 Files': { canView: true, canEdit: true },
            'Student Cases': { canView: true, canEdit: true },
            'Request Slips Form': true,
            'Referral Forms': true,
            'Backup and Restore': false,
            'Student Wellness': true,
        },
        isArchived: false,
    },
]);

const accessPermissions = [
    'Student 201 Files',
    'Student Cases',
    'Request Slips Form',
    'Referral Forms',
    'Backup and Restore',
    'Student Wellness',
];

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 mx-4 transform transition-all scale-100 ease-out duration-300">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

const UserPanel = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showUserEditModal, setShowUserEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showArchived, setShowArchived] = useState(false);

    const initialNewUserAccess = accessPermissions.reduce((acc, curr) => {
        if (['Student 201 Files', 'Student Cases'].includes(curr)) {
            acc[curr] = { canView: false, canEdit: false };
        } else {
            acc[curr] = false;
        }
        return acc;
    }, {});

    const [newUser, setNewUser] = useState({
        name: '',
        roles: [],
        employeeNumber: '',
        email: '',
        access: initialNewUserAccess,
    });
    
    const [editedUser, setEditedUser] = useState(null);

    const filteredUsers = mockUsers.filter(user =>
        (showArchived ? user.isArchived : !user.isArchived) &&
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase())) ||
        user.employeeNumber.includes(searchTerm))
    );

    const handleEditInfo = (user) => {
        setSelectedUser(user);
        setEditedUser({...user}); // Clone the user for editing
        setShowUserEditModal(true);
    };

    const handleAddUserChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'roles') {
            const newRoles = value.split(',').map(role => role.trim());
            setNewUser(prev => ({ ...prev, roles: newRoles }));
        } else {
            setNewUser(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleUserAccessToggle = (permission, subPermission = null) => {
        setEditedUser(prev => {
            if (subPermission) {
                return {
                    ...prev,
                    access: {
                        ...prev.access,
                        [permission]: {
                            ...prev.access[permission],
                            [subPermission]: !prev.access[permission][subPermission],
                        },
                    },
                };
            } else {
                return {
                    ...prev,
                    access: {
                        ...prev.access,
                        [permission]: !prev.access[permission],
                    },
                };
            }
        });
    };
    
    const handleAddUserAccessToggle = (permission, subPermission = null) => {
        setNewUser(prev => {
            if (subPermission) {
                 return {
                    ...prev,
                    access: {
                        ...prev.access,
                        [permission]: {
                            ...prev.access[permission],
                            [subPermission]: !prev.access[permission][subPermission],
                        },
                    },
                };
            } else {
                 return {
                    ...prev,
                    access: {
                        ...prev.access,
                        [permission]: !prev.access[permission],
                    },
                };
            }
        });
    };

    const handleCreateUser = () => {
        // Here you would handle saving the new user to a database (e.g., Firestore)
        console.log('Creating new user:', newUser);
        setMockUsers(prev => [...prev, {...newUser, id: `user-${Date.now()}`}]);
        setShowAddUserModal(false);
        setNewUser({
            name: '',
            roles: [],
            employeeNumber: '',
            email: '',
            access: initialNewUserAccess,
        });
        // For a real app, you would add a success message or UI feedback
    };
    
    const handleSaveChanges = () => {
        // Here you would handle saving the edited user to a database (e.g., Firestore)
        console.log('Saving changes for user:', editedUser);
        setMockUsers(mockUsers.map(u => u.id === editedUser.id ? editedUser : u));
        setShowUserEditModal(false);
    };

    const handleArchiveUser = (userToArchive) => {
        setMockUsers(mockUsers.map(user => 
            user.id === userToArchive.id ? { ...user, isArchived: true } : user
        ));
    };

    const handleRestoreUser = (userToRestore) => {
        setMockUsers(mockUsers.map(user =>
            user.id === userToRestore.id ? { ...user, isArchived: false } : user
        ));
    };

    const displayRoles = (roles) => {
        return roles.join(', ');
    };

    const displayAccess = (access) => {
        const enabledAccess = [];
        Object.keys(access).forEach(key => {
            const value = access[key];
            if (typeof value === 'object') {
                const subPermissions = [];
                if (value.canView) subPermissions.push('View');
                if (value.canEdit) subPermissions.push('Edit');
                if (subPermissions.length > 0) {
                    enabledAccess.push(`${key} (${subPermissions.join(', ')})`);
                }
            } else if (value) {
                enabledAccess.push(key);
            }
        });
        const truncatedList = enabledAccess.slice(0, 2).join(', ');
        const remainingCount = enabledAccess.length - 2;
        if (remainingCount > 0) {
            return `${truncatedList},...`;
        }
        return truncatedList || 'None';
    };

    return (
        <>
            <style>
                {`
                .toggle-checkbox {
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                    width: 38px;
                    height: 20px;
                    border-radius: 9999px;
                    background-color: #d1d5db; /* gray-300 */
                    cursor: pointer;
                    position: relative;
                    transition: all 0.2s ease-in-out;
                    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .toggle-checkbox:checked {
                    background-color: #0A1220; /* custom dark blue */
                }

                .toggle-checkbox::before {
                    content: '';
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 16px;
                    height: 16px;
                    border-radius: 9999px;
                    background-color: #fff;
                    transition: all 0.2s ease-in-out;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                }

                .toggle-checkbox:checked::before {
                    transform: translateX(18px);
                }
                `}
            </style>
            <div className="flex flex-col h-full bg-gray-100 p-3 rounded-xl shadow-lg">
                <div className="bg-white shadow-md p-4 rounded-lg">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col space-y-1">
                        <h2 className="text-4xl font-bold text-gray-800">User List</h2>
                        <p className="text-gray-500">Create new users, customize user permission, and remove users</p>
                    </div>
                    <div className="flex space-x-4">
                        {/* Add */}
                        <button
                            className="flex items-center space-x-2 bg-[#0A1220] text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-gray-900 transition duration-150 ease-in-out"
                            onClick={() => setShowAddUserModal(true)}
                        >
                            <span>Add User</span>
                            <Plus className="w-5 h-5" />
                        </button>
                         {/* Archive/Restore Toggle */}
                        <button
                            className={`flex items-center space-x-2 font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out
                                ${showArchived
                                    ? 'bg-green-600 text-white hover:bg-green-500'
                                    : 'bg-red-600 text-white hover:bg-red-500'
                                }`
                            }
                            onClick={() => setShowArchived(!showArchived)}
                        >
                            <span>{showArchived ? 'Show Active' : 'Show Archived'}</span>
                            <Archive className="w-5 h-5" />
                        </button>
                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Name / ID"
                                className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="w-5 h-5 absolute right-3 top-3 text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-m font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.employeeNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{displayRoles(user.roles)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{displayAccess(user.access)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEditInfo(user)} className="text-gray-400 hover:text-gray-600 transition">
                                                <EllipsisVertical className="w-5 h-5" />
                                            </button>
                                            {showArchived ? (
                                                <button onClick={() => handleRestoreUser(user)} className="text-blue-500 hover:text-blue-700 ml-2 transition">
                                                    <Archive className="w-5 h-5" />
                                                </button>
                                            ) : (
                                                <button onClick={() => handleArchiveUser(user)} className="text-red-500 hover:text-red-700 ml-2 transition">
                                                    <Archive className="w-5 h-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Add User Modal */}
                <Modal isOpen={showAddUserModal} onClose={() => setShowAddUserModal(false)} title="Add User">
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
                                <label className="block text-sm font-medium text-gray-700">Roles (comma-separated)</label>
                                <input type="text" name="roles" value={newUser.roles.join(', ')} onChange={handleAddUserChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" name="email" value={newUser.email} onChange={handleAddUserChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
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
                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                onClick={() => setShowAddUserModal(false)}
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

                {/* User Edit Modal */}
                <Modal isOpen={showUserEditModal} onClose={() => setShowUserEditModal(false)} title="Edit User Information">
                    {editedUser && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Name</label>
                                    <p className="text-gray-900 font-semibold">{editedUser.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Role</label>
                                    <p className="text-gray-900 font-semibold">{displayRoles(editedUser.roles)}</p>
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
                                    onClick={() => setShowUserEditModal(false)}
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
            </div>
            </div>
        </>
    );
};

    return <UserPanel />;
}
