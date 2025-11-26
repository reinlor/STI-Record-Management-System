import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';

import Modal from './components/Modal';
import AddUserModal from './components/AddUserModal';
import EditUserModal from './components/EditUserModal';
import UserTable from './components/UserTable';
import WarningModal from './components/WarningModal';
import {
  accessPermissions,
  initialNewUserAccess,
  serverAccessPresets,
  serverToUIAccess,
  uiToServerAccess,
} from './components/AccessUtils';
import { AuthContext } from "../../../AuthProvider.jsx";
import { toast } from 'react-toastify';

import { Search, Plus, Archive, Users as UserIcon } from 'lucide-react';
import LoadingDots from '../../../component/Loading';

export default function Users() {
  const [mockUsers, setMockUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUserManagementWarning, setShowUserManagementWarning] = useState(false);
  const [pendingUserAction, setPendingUserAction] = useState(null);
  const { authData } = useContext(AuthContext);
  const [newUser, setNewUser] = useState({
    name: '',
    roles: [],
    employeeNumber: '',
    email: '',
    access: initialNewUserAccess,
    position: '',
  });

  const [editedUser, setEditedUser] = useState(null);

  // Fetch users from server and transform to UI model
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/user/');
      const users = (Array.isArray(res.data) ? res.data : []).map((u) => {
        const roles = Array.isArray(u.role) ? u.role : u.role ? [u.role] : [];
        // prefer explicit position from server, otherwise if teacher assume 'Teacher'
        const position = u.position || (roles.includes('Teacher') ? 'Teacher' : '');
        return {
          id: u.uid || u.id || (u._id || ''),
          uid: u.uid || u._id || u.id || '',
          name: u.displayName || u.name || '',
          roles,
          position,
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
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <LoadingDots />
  }

  const filteredUsers = mockUsers.filter(
    (user) =>
      !user.roles.includes('Super Admin') &&
      !user.roles.includes('Student') &&
      (showArchived ? user.isArchived : !user.isArchived) &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.roles || []).some((role) => role.toLowerCase().includes(searchTerm.toLowerCase())) ||
        user.employeeNumber.includes(searchTerm) ||
        (user.position || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEditInfo = (user) => {
    setSelectedUser(user);
    // ensure we have a copy and access object for editing
    setEditedUser({ ...user, access: user.access || initialNewUserAccess });
    setShowUserEditModal(true);
  };

  // handleAddUser Change for generic inputs
  const handleAddUserChange = (e) => {
    const { name, value } = e.target;
    if (name === 'roles') {
      const newRoles = value.split(',').map((r) => r.trim()).filter(Boolean);
      setNewUser((prev) => ({ ...prev, roles: newRoles }));
    } else {
      setNewUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRoleSelect = (role, position = '') => {
    setNewUser((prev) => {
      let finalPosition = position;
      if (!finalPosition) {
        if (role === 'Teacher') finalPosition = 'Teacher';
        else finalPosition = role === 'Admin' ? 'Admin' : role;
      }

      const presetKey = finalPosition && serverAccessPresets[finalPosition] ? finalPosition : role;
      const payloadAccess = serverAccessPresets[presetKey] ? serverToUIAccess(serverAccessPresets[presetKey]) : prev.access;

      const finalAccess = role === 'Teacher' ? initialNewUserAccess : payloadAccess;

      return {
        ...prev,
        roles: [role],
        position: finalPosition,
        access: finalAccess,
      };
    });
  };

  const handleUserAccessToggle = (permission, subPermission = null) => {
    if (permission === 'User Management' && !editedUser.access['User Management']) {
      setPendingUserAction('edit');
      setShowUserManagementWarning(true);
      return;
    }
    setEditedUser((prev) => {
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

  const proceedUserManagementAccess = () => {
    setShowUserManagementWarning(false);
    if (pendingUserAction === 'create') {
      setNewUser((prev) => ({
        ...prev,
        access: {
          ...prev.access,
          ['User Management']: true,
        },
      }));
    } else if (pendingUserAction === 'edit') {
      setEditedUser((prev) => ({
        ...prev,
        access: {
          ...prev.access,
          ['User Management']: true,
        },
      }));
    }
    setPendingUserAction(null);
  };

  const handleAddUserAccessToggle = (permission, subPermission = null) => {
    if (permission === 'User Management' && !newUser.access['User Management']) {
      setPendingUserAction('create');
      setShowUserManagementWarning(true);
      return;
    }
    setNewUser((prev) => {
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

  const derivePayloadRoleAndPosition = (userState) => {
    const role = userState.roles && userState.roles.length ? userState.roles[0] : 'Student';
    const position = userState.position || (role === 'Teacher' ? 'Teacher' : role);
    return { role, position };
  };
  const handleCreateUser = async () => {
    try {
      const uid = newUser.employeeNumber || `uid-${Date.now()}`;
      const displayName = newUser.name;
      const email = newUser.email || `${uid}@example.com`;
      const password = `123456`;
      const { role, position } = derivePayloadRoleAndPosition(newUser);

      const payload = {
        uid,
        displayName,
        email,
        password,
        role,
        position,
        employeeNumber: newUser.employeeNumber || '',

        processedBy: authData?.displayName ?? 'Admin',
        processedUID: authData?.user?.uid ?? 'Admin',
        processedPosition: authData?.user?.position ?? 'Admin',
        processedRole: authData?.user?.role ?? 'Admin',
      };

      if (serverAccessPresets[position]) {
        payload.access = serverAccessPresets[position];
      } else if (role === 'Teacher') {
      } else {
        payload.access = uiToServerAccess(newUser.access);
      }

      await axios.post('/user/create', payload);
      console.log(payload)
      setShowAddUserModal(false);
      setNewUser({
        name: '',
        roles: [],
        employeeNumber: '',
        email: '',
        access: initialNewUserAccess,
        position: '',
      });
      await fetchUsers();
      toast.success('User added successfully!');
    } catch (err) {
      console.error('Create user failed', err);
      toast.error('Failed to add user. Please try again.');
    }
  };

  const handleSaveChanges = async () => {
    try {
      if (!editedUser) return;
      const uid = editedUser.uid || editedUser.id;
      if (!uid) return console.error('No UID available for update');

      const role = editedUser.roles && editedUser.roles.length ? editedUser.roles[0] : '';
      const position = editedUser.position || (role === 'Teacher' ? 'Teacher' : role);

      const payload = {
        displayName: editedUser.name,
        email: editedUser.email,
        role,
        position,
        access: uiToServerAccess(editedUser.access || {}),
        employeeNumber: editedUser.employeeNumber,
        isArchived: !!editedUser.isArchived,

        processedBy: authData?.displayName ?? 'Admin',
        processedUID: authData?.user?.uid ?? 'Admin',
        processedPosition: authData?.user?.position ?? 'Admin',
        processedRole: authData?.user?.role ?? 'Admin',
      };

      await axios.put(`/user/update/${uid}`, payload);

      setShowUserEditModal(false);
      await fetchUsers();
      toast.success('User edited successfully!');
    } catch (err) {
      console.error('Save changes failed', err);
      toast.error('Failed to save changes. Please try again.');
    }
  };

  const handleArchiveUser = async (userToArchive) => {
    try {
      const uid = userToArchive.uid || userToArchive.id;
      setMockUsers((prev) => prev.map((user) => (user.id === userToArchive.id ? { ...user, isArchived: true } : user)));
      if (uid) {
        await axios.put(`/user/update/${uid}`, {
          isArchived: true, processedBy: authData?.displayName ?? 'Admin',
          processedUID: authData?.user?.uid ?? 'Admin',
          processedPosition: authData?.user?.position ?? 'Admin',
          processedRole: authData?.user?.role ?? 'Admin',
        });
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
      setMockUsers((prev) => prev.map((user) => (user.id === userToRestore.id ? { ...user, isArchived: false } : user)));
      if (uid) {
        await axios.put(`/user/update/${uid}`, {
          isArchived: false,
          processedBy: authData?.displayName ?? 'Admin',
          processedUID: authData?.user?.uid ?? 'Admin',
          processedPosition: authData?.user?.position ?? 'Admin',
          processedRole: authData?.user?.role ?? 'Admin',
        });
        await fetchUsers();
      }
      toast.success('User restored successfully!');
    } catch (err) {
      console.error('Restore failed', err);
      toast.error('Failed to restore user. Please try again.');
      await fetchUsers();
    }
  };

  // Show role and (derived) position as "Role (Position)" if position exists
  const displayRoles = (user) => {
    const roles = user.roles || [];
    const position = user.position || (roles.includes('Teacher') ? 'Teacher' : '');
    const roleText = roles.join(', ');
    return position ? `${roleText} (${position})` : roleText;
  };

  const displayAccess = (access) => {
    const enabledAccess = [];
    Object.keys(access).forEach((key) => {
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
      `}</style>

      <div className="flex flex-col h-full bg-gray-100 p-2 lg:p-3 rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-white shadow-md p-1 lg:p-4 rounded-lg flex flex-col" style={{ height: '90vh' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#0172bd] mt-1" />
                <h2 className="text-2xl sm:text-4xl font-bold text-[#0172bd]">User List</h2>
              </div>
              <p className="text-xs sm:text-base text-gray-500">Create new users, customize user permission, and remove users</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
              <button
                className="flex-1 flex items-center justify-center space-x-2 bg-[#0172bd] text-white font-semibold py-2 px-2 rounded-lg shadow-md hover:bg-blue-500 transition duration-150 ease-in-out text-xs sm:text-base cursor-pointer"
                onClick={() => setShowAddUserModal(true)}
              >
                <span>Add User</span>
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                className={`flex-1 flex items-center justify-center space-x-2 font-semibold py-2 px-2 rounded-lg shadow-md transition duration-150 ease-in-out text-xs sm:text-base cursor-pointer ${showArchived ? 'bg-[#28a745] text-white hover:bg-green-500' : 'bg-[#dc3545] text-white hover:bg-red-600'}`}
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

          <WarningModal
            isOpen={showUserManagementWarning}
            onClose={() => { setShowUserManagementWarning(false); setPendingUserAction(null); }}
            onConfirm={proceedUserManagementAccess}
          />
        </div>
      </div>
    </>
  );
}
