// ...existing code...
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Search, EllipsisVertical, Plus, X, Check, Eye, Archive } from 'lucide-react';

export default function Users() {

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
    };

    // map server access keys -> UI access keys
    const serverToUIAccess = (srv = {}) => {
        return {
            'Student 201 Files': srv.studentRecords ? { canView: !!srv.studentRecords.canView, canEdit: !!srv.studentRecords.canEdit } : { canView: false, canEdit: false },
            'Student Cases': srv.studentCases ? { canView: !!srv.studentCases.canView, canEdit: !!srv.studentCases.canEdit } : { canView: false, canEdit: false },
            'Request Slips Form': srv.requestSlip ? !!(srv.requestSlip.canView || srv.requestSlip === true) : false,
            'Referral Forms': srv.referralForm ? !!(srv.referralForm.canEdit || srv.referralForm.canView || srv.referralForm === true) : false,
            'Backup and Restore': srv.backupRestore ? !!(srv.backupRestore.canView || srv.backupRestore === true) : false,
            'Student Wellness': srv.wellness ? !!(srv.wellness.canView || srv.wellness === true) : false,
        };
    };

    // map UI access -> server access keys (for create/update)
    const uiToServerAccess = (ui = {}) => {
        const srv = {};
        if (ui['Student 201 Files']) {
            srv.studentRecords = { canView: !!ui['Student 201 Files'].canView, canEdit: !!ui['Student 201 Files'].canEdit };
        }
        if (ui['Student Cases']) {
            srv.studentCases = { canView: !!ui['Student Cases'].canView, canEdit: !!ui['Student Cases'].canEdit };
        }
        if (ui['Request Slips Form']) {
            srv.requestSlip = { canView: true };
        }
        if (ui['Referral Forms']) {
            srv.referralForm = { canEdit: true };
        }
        if (ui['Backup and Restore']) {
            srv.backupRestore = { canView: true };
        }
        if (ui['Student Wellness']) {
            srv.wellness = { canView: true };
        }
        return srv;
    };

    const [mockUsers, setMockUsers] = useState([]);
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

    const serverAccessPresets = {
        Admin: {
            studentCases: { canView: true, canEdit: false },
            backupRestore: { canView: true },
            userManagement: { canView: true, canEdit: true },
            requestSlip: { canView: false },
            wellness: { canView: true },
            referralForm: { canView: false },
            studentRecords: { canView: true, canEdit: true },
        },
        Disciplinary: {
            studentCases: { canView: true, canEdit: true },
            backupRestore: { canView: false },
            userManagement: { canView: false, canEdit: false },
            requestSlip: { canView: true },
            wellness: { canView: false },
            referralForm: { canEdit: true },
            studentRecords: { canView: true, canEdit: false },
        },
        Teacher: undefined,
    };


    const [newUser, setNewUser] = useState({
        name: '',
        roles: [],
        employeeNumber: '',
        email: '',
        access: initialNewUserAccess,
    });

    const handleRoleSelect = (role) => {
        setNewUser(prev => {
            // If Teacher selected, we remove access from payload UI (and hide UI)
            if (role === 'Teacher') {
                return { ...prev, roles: [role], access: {} };
            }
            // For Admin/Disciplinary, keep UI access (you can still toggle) or prefill from preset mapped to UI shape
            // Map server preset -> UI access shape (accessPermissions keys)
            const preset = serverAccessPresets[role];
            if (!preset) {
                return { ...prev, roles: [role] };
            }
            const uiAccess = {};
            uiAccess['Student 201 Files'] = preset.studentRecords ? { canView: !!preset.studentRecords.canView, canEdit: !!preset.studentRecords.canEdit } : { canView: false, canEdit: false };
            uiAccess['Student Cases'] = preset.studentCases ? { canView: !!preset.studentCases.canView, canEdit: !!preset.studentCases.canEdit } : { canView: false, canEdit: false };
            uiAccess['Request Slips Form'] = !!preset.requestSlip;
            uiAccess['Referral Forms'] = !!(preset.referralForm || preset.referralForm === true);
            uiAccess['Backup and Restore'] = !!preset.backupRestore;
            uiAccess['Student Wellness'] = !!preset.wellness;
            return { ...prev, roles: [role], access: uiAccess };
        });
    }



    const [editedUser, setEditedUser] = useState(null);

    // Fetch users from server and transform to UI model
    const fetchUsers = async () => {
        try {
            const res = await axios.get('/user/'); // route provided
            // server returns array of user documents (with uid/displayName/email/role/access)
            const users = (Array.isArray(res.data) ? res.data : []).map(u => {
                const roles = Array.isArray(u.role) ? u.role : (u.role ? [u.role] : []);
                return {
                    id: u.uid || u.id || (u._id || ''),
                    uid: u.uid || u._id || u.id || '',
                    name: u.displayName || u.name || '',
                    roles,
                    employeeNumber: u.employeeNumber || (u.uid ? String(u.uid) : ''),
                    email: u.email || '',
                    access: serverToUIAccess(u.access || u),
                    isArchived: !!u.isArchived,
                };
            });
            setMockUsers(users);
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = mockUsers.filter(user =>
        // Do not display Super Admin roles on the table
        !user.roles.includes('Super Admin') &&
        (showArchived ? user.isArchived : !user.isArchived) &&
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase())) ||
            user.employeeNumber.includes(searchTerm))
    );

    const handleEditInfo = (user) => {
        setSelectedUser(user);
        setEditedUser({ ...user }); // Clone the user for editing
        setShowUserEditModal(true);
    };

    const handleAddUserChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'roles') {
            const newRoles = value.split(',').map(role => role.trim()).filter(Boolean);
            setNewUser(prev => ({ ...prev, roles: newRoles }));
        } else {
            setNewUser(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleUserAccessToggle = (permission, subPermission = null) => {
        setEditedUser(prev => {
            if (!prev) return prev;
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

    const handleCreateUser = async () => {
        try {
            const uid = newUser.employeeNumber || `uid-${Date.now()}`;
            const displayName = newUser.name;
            const email = newUser.email || `${uid}@example.com`;
            const password = `TempPass#${Date.now()}`; // server requires password
            const role = newUser.roles && newUser.roles.length ? newUser.roles[0] : 'Student';

            const payload = {
                uid,
                displayName,
                email,
                password,
                role,
                employeeNumber: newUser.employeeNumber || '',
            };

            // If a preset server access exists for the selected role, use it.
            if (serverAccessPresets[role]) {
                payload.access = serverAccessPresets[role];
            } else if (role === 'Teacher') {
                // Teacher should not include access key at all (per requirement) -> do nothing
            } else {
                // fallback: convert UI access to server shape
                payload.access = uiToServerAccess(newUser.access);
            }

            await axios.post('/user/create', payload);
            setShowAddUserModal(false);
            setNewUser({
                name: '',
                roles: [],
                employeeNumber: '',
                email: '',
                access: initialNewUserAccess,
            });
            await fetchUsers();
        } catch (err) {
            console.error('Create user failed', err);
        }
    };

    const handleSaveChanges = async () => {
        try {
            if (!editedUser) return;
            const uid = editedUser.uid || editedUser.id;
            if (!uid) {
                console.error('No UID available for update');
                return;
            }

            const payload = {
                displayName: editedUser.name,
                email: editedUser.email,
                role: editedUser.roles && editedUser.roles.length ? editedUser.roles[0] : '',
                access: uiToServerAccess(editedUser.access),
                employeeNumber: editedUser.employeeNumber,
                isArchived: !!editedUser.isArchived,
            };

            await axios.put(`/user/update/${uid}`, payload);
            setShowUserEditModal(false);
            await fetchUsers();
        } catch (err) {
            console.error('Save changes failed', err);
        }
    };

    const handleArchiveUser = async (userToArchive) => {
        try {
            const uid = userToArchive.uid || userToArchive.id;
            // optimistic local update
            setMockUsers(prev => prev.map(user => user.id === userToArchive.id ? { ...user, isArchived: true } : user));
            if (uid) {
                await axios.put(`/user/update/${uid}`, { isArchived: true });
                await fetchUsers();
            }
        } catch (err) {
            console.error('Archive failed', err);
            await fetchUsers();
        }
    };

    const handleRestoreUser = async (userToRestore) => {
        try {
            const uid = userToRestore.uid || userToRestore.id;
            setMockUsers(prev => prev.map(user => user.id === userToRestore.id ? { ...user, isArchived: false } : user));
            if (uid) {
                await axios.put(`/user/update/${uid}`, { isArchived: false });
                await fetchUsers();
            }
        } catch (err) {
            console.error('Restore failed', err);
            await fetchUsers();
        }
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
// ...existing code...