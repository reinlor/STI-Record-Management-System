import { useState, useContext } from 'react'
import UserTable from './UserTable.jsx'
import AddUserModal from './AddUserModal.jsx'
import Button from '../../../component/Button.jsx'
import { AuthContext } from '../../../AuthProvider.jsx';

export default function Users() {
    const { authData, logout } = useContext(AuthContext);


    // MOCK DATA
    const mockUsers = [
        { id: 'U001', name: 'Dionne One', role: 'Guidance Head' },
        { id: 'U002', name: 'Jeus Quo Pho', role: 'Discplinary Officer' },
        { id: 'U003', name: 'Janu Kalbo', role: 'Guidance Assistant' },
        { id: 'U004', name: 'Abby Garcia', role: 'Guidance Assistant' },
        { id: 'U005', name: 'Karina Lopez', role: 'Guidance Assistant' },
        { id: 'U006', name: 'Mark Santos', role: 'Guidance Assistant' },
        { id: 'U007', name: 'Liza Reyes', role: 'Guidance Assistant' },
        { id: 'U008', name: 'John Doe', role: 'Guidance Assistant' },
        { id: 'U009', name: 'Jane Smith', role: 'Guidance Assistant' },
        { id: 'U010', name: 'Alice Johnson', role: 'Guidance Assistant' }

    ]

    // ✅ States
    const [selectedUsers, setSelectedUsers] = useState([])
    const [searchQuery, setSearchQuery] = useState('') // 🔍 New
    const [showAddModal, setShowAddModal] = useState(false)
    const [openDropdownId, setOpenDropdownId] = useState(null)

    // 📌 Handle checkbox toggle
    const handleCheck = (id) => {
        setSelectedUsers((prev) =>
            prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
        )
    }

    // 📌 Select/unselect all
    const handleCheckAll = () => {
        if (selectedUsers.length === mockUsers.length) {
            setSelectedUsers([])
        } else {
            setSelectedUsers(mockUsers.map((user) => user.id))
        }
    }

    // 🔍 Search Function : Para sa filter
    const filteredUsers = mockUsers.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.role.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (!authData?.user?.access?.userManagement?.canView) {
        return <Navigate to="/error401" replace />
    }

    return (
        <div className="px-12 py-8 bg-white min-h-screen box-border">
            {/* 📌 TITLE & DESCRIPTION */}
            <h1 className="text-[2rem] font-bold mb-1">User Management</h1>
            <p className="text-gray-600 mb-6">
                Create new users, customize user permission, and archive users
            </p>

            {/* 🔔 ACTION BUTTONS */}
            {authData?.user?.access?.userManagement?.canEdit ? <div className="flex gap-4 mt-2.5 mb-6 justify-end">
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-slate-900 text-white py-2 px-5 rounded-full font-medium hover:bg-slate-800 transition"
                >
                    Add User
                </Button>
                <Button className="bg-red-500 text-white py-2 px-5 rounded-full font-medium hover:bg-red-600 transition">
                    Archived User
                </Button>
            </div> : null}

            {/* 🔍 SEARCH BAR */}
            <input
                type="text"
                className="
            w-1/2
            px-4 py-3
            border border-gray-300
            rounded-md
            text-base
            mb-6
            transition-colors
            focus:outline-none focus:border-blue-500
            "
                placeholder="Search by Name, ID, or Role"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* 📋 USER TABLE */}
            <UserTable
                users={filteredUsers}
                selectedUsers={selectedUsers}
                onCheck={handleCheck}
                onCheckAll={handleCheckAll}
                openDropdownId={openDropdownId}
                setOpenDropdownId={setOpenDropdownId}
            />

            {/* ➕ ADD USER MODAL */}
            <AddUserModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
        </div>
    )
}