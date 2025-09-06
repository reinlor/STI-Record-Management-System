import React from 'react';
import { EllipsisVertical, Archive } from 'lucide-react';

export default function UserTable({ filteredUsers, displayRoles, displayAccess, handleEditInfo, showArchived, handleArchiveUser, handleRestoreUser }) {
    return (
        <div className="bg-white rounded-lg shadow-md h-[75vh] overflow-y-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="sticky top-0 z-10 bg-gray-300 px-6 py-3 text-left font-semibold tracking-wider">Name</th>
                        <th className="sticky top-0 z-10 bg-gray-300 px-6 py-3 text-left font-semibold tracking-wider">Roles</th>
                        <th className="sticky top-0 z-10 bg-gray-300 px-6 py-3 text-left font-semibold tracking-wider">Access</th>
                        <th className="sticky top-0 z-10 bg-gray-300 px-6 py-3 text-right font-semibold tracking-wider"></th>
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
    );
}