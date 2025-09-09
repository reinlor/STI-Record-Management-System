// ...existing code...
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './components/Modal';
import AddUserModal from './components/AddUserModal';
import EditUserModal from './components/EditUserModal';
import UserTable from './components/UserTable';
import { accessPermissions, initialNewUserAccess, serverAccessPresets, serverToUIAccess, uiToServerAccess } from './components/AccessUtils'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import 
    { Search, 
        Plus, 
        X, 
        Check, 
        Archive, 
        Users as User  } from 'lucide-react';


// ...existing code...
export default function Users() {
    const [mockUsers, setMockUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showUserEditModal, setShowUserEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showArchived, setShowArchived] = useState(false);

    const [newUser, setNewUser] = useState({
        name: '',
        roles: [],
        employeeNumber: '',
        email: '',
        access: initialNewUserAccess,
    });

    const [editedUser, setEditedUser] = useState(null);

    // Fetch users from server and transform to UI model
    const fetchUsers = async () => {
        try {
            const res = await axios.get('/user/');
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
        !user.roles.includes('Super Admin') &&
        !user.roles.includes('Student') &&
        (showArchived ? user.isArchived : !user.isArchived) &&
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase())) ||
            user.employeeNumber.includes(searchTerm))
    );


    const handleEditInfo = (user) => {
        setSelectedUser(user);
        setEditedUser({ ...user });
        setShowUserEditModal(true);
    };

    const handleAddUserChange = (e) => {
        const { name, value } = e.target;
        if (name === 'roles') {
            const newRoles = value.split(',').map(role => role.trim()).filter(Boolean);
            setNewUser(prev => ({ ...prev, roles: newRoles }));
        } else {
            setNewUser(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleRoleSelect = (role) => {
        setNewUser(prev => {
            if (role === 'Teacher') {
                return { ...prev, roles: [role], access: {} };
            }
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
            const password = `123456`;
            const role = newUser.roles && newUser.roles.length ? newUser.roles[0] : 'Student';

            const payload = {
                uid,
                displayName,
                email,
                password,
                role,
                employeeNumber: newUser.employeeNumber || '',
            };

            if (serverAccessPresets[role]) {
                payload.access = serverAccessPresets[role];
            } else if (role === 'Teacher') {
                // omit access
            } else {
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
            toast.success('User added successfully!');
        } catch (err) {
            toast.error('Failed to add user. Please try again.');
        }
    };

    const handleSaveChanges = async () => {
        try {
            if (!editedUser) return;
            const uid = editedUser.uid || editedUser.id;
            if (!uid) return console.error('No UID available for update');

            const payload = {
                displayName: editedUser.name,
                email: editedUser.email,
                role: editedUser.roles && editedUser.roles.length ? editedUser.roles[0] : '',
                access: uiToServerAccess(editedUser.access),
                employeeNumber: editedUser.employeeNumber,
                isArchived: !!editedUser.isArchived,
            };

            await axios.put(`/user/update/${uid}`, payload);
            console.log(payload)
            setShowUserEditModal(false);
            await fetchUsers();
            toast.success('User edited successfully!');
        } catch (err) {
            toast.error('Failed to save changes. Please try again.');
            console.error('Save changes failed', err);
        }
    };

    const handleArchiveUser = async (userToArchive) => {
        try {
            const uid = userToArchive.uid || userToArchive.id;
            setMockUsers(prev => prev.map(user => user.id === userToArchive.id ? { ...user, isArchived: true } : user));
            if (uid) {
                await axios.put(`/user/update/${uid}`, { isArchived: true });
                await fetchUsers();
            }
            toast.success('User archived successfully!');
        } catch (err) {
            console.error('Archive failed', err);
            toast.error('Failed to archive user. Please try again.');
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
            toast.success('User restored successfully!');
        } catch (err) {
            console.error('Restore failed', err);
            toast.error('Failed to restore user. Please try again.');
            await fetchUsers();
        }
    };

    const displayRoles = (roles) => roles.join(', ');

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
            <style>{`
            .toggle-checkbox {
                -webkit-appearance: none;
                -moz-appearance: none;
                appearance: none;
                width: 38px;
                height: 20px;
                border-radius: 9999px;
                background-color: #d1d5db;
                cursor: pointer;
                position: relative;
                transition: all 0.2s ease-in-out;
                box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .toggle-checkbox:checked { background-color: #fef201; }
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
            .toggle-checkbox:checked::before { transform: translateX(18px); }
            `}
            </style>

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <div className="flex flex-col h-full bg-gray-100 p-2 lg:p-3 rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-white shadow-md p-1 lg:p-4 rounded-lg flex flex-col" style={{ height: "90vh" }}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
                        <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2"> 
                                <User className="w-6 h-6 sm:w-8 sm:h-8 text-[#0172bd] mt-1" />
                                <h2 className="text-2xl sm:text-4xl font-bold text-[#0172bd]">User List</h2>
                            </div>
                            <p className="text-xs sm:text-base text-gray-500">Create new users, customize user permission, and remove users</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">

                            <button
                                className="flex-1 flex items-center justify-center space-x-2 bg-[#0172bd] text-[#fef201] font-semibold py-2 px-2 rounded-lg shadow-md hover:bg-blue-500 transition duration-150 ease-in-out text-xs sm:text-base"
                                onClick={() => setShowAddUserModal(true)}
                            >
                                <span>Add User</span>
                                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                                className={`flex-1 flex items-center justify-center space-x-2 font-semibold py-2 px-2 rounded-lg shadow-md transition duration-150 ease-in-out text-xs sm:text-base
                                    ${showArchived ? 'bg-[#28a745] text-white hover:bg-green-500' : 'bg-[#dc3545] text-white hover:bg-red-600'}`}
                                onClick={() => setShowArchived(!showArchived)}
                            >
                                <span>{showArchived ? 'Show Active' : 'Show Archived'}</span>
                                <Archive className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Name / ID"
                                    className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out text-xs sm:text-base w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute right-3 top-2.5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                        <div className="min-w-[400px] sm:min-w-0">
                            <UserTable
                                filteredUsers={filteredUsers}
                                displayRoles={displayRoles}
                                displayAccess={displayAccess}
                                handleEditInfo={handleEditInfo}
                                showArchived={showArchived}
                                handleArchiveUser={handleArchiveUser}
                                handleRestoreUser={handleRestoreUser}
                                tableClassName="text-xs sm:text-base"
                            />
                        </div>
                    </div>

                    <AddUserModal
                        isOpen={showAddUserModal}
                        onClose={() => setShowAddUserModal(false)}
                        newUser={newUser}
                        handleAddUserChange={handleAddUserChange}
                        handleRoleSelect={handleRoleSelect}
                        handleAddUserAccessToggle={handleAddUserAccessToggle}
                        handleCreateUser={handleCreateUser}
                        initialNewUserAccess={initialNewUserAccess}
                    />

                    <EditUserModal
                        isOpen={showUserEditModal}
                        onClose={() => setShowUserEditModal(false)}
                        editedUser={editedUser}
                        handleUserAccessToggle={handleUserAccessToggle}
                        handleSaveChanges={handleSaveChanges}
                    />
                </div>
            </div>
        </>
    );
};
