import React from 'react';
import { EllipsisVertical, Archive } from 'lucide-react';

export default function UserTable({ filteredUsers, displayRoles, displayAccess, handleEditInfo, showArchived, handleArchiveUser, handleRestoreUser }) {
    return (
        <div className="bg-white rounded-lg shadow-md h-[75vh] overflow-x-auto overflow-y-auto custom-scrollbar">
            <table className="min-w-full max-w-200 divide-y divide-gray-200 text-[10px] sm:text-xs md:text-sm lg:text-base ">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="sticky top-0 z-10 bg-gray-300 px-4 py-2 text-left font-semibold">Name</th>
                        <th className="sticky top-0 z-10 bg-gray-300 px-1 py-2 text-left font-semibold">Roles</th>
                        <th className="sticky top-0 z-10 bg-gray-300 px-1 py-2 text-left font-semibold">Access</th>
                        <th className="sticky top-0 z-10 bg-gray-300 px-1 py-2 text-right font-semibold"></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                                <td className="px-4 py-2 whitespace-normal break-words max-w-[120px]">
                                    <div className="font-medium text-gray-900">{user.name}</div>
                                    <div className="text-gray-500">{user.employeeNumber}</div>
                                </td>
                                <td className="px-1 py-1 whitespace-normal break-words max-w-[80px] text-gray-500">{displayRoles(user.roles)}</td>
                                <td className="px-1 py-1 whitespace-normal break-words max-w-[80px] text-gray-500">{displayAccess(user.access)}</td>
                                <td className="px-1 py-1 whitespace-nowrap text-right font-medium">
                                    <button onClick={() => handleEditInfo(user)} className="text-gray-400 hover:text-gray-600 transition">
                                        <EllipsisVertical className="w-4 h-4" />
                                    </button>
                                    {showArchived ? (
                                        <button onClick={() => handleRestoreUser(user)} className="text-blue-500 hover:text-blue-700 ml-1 transition">
                                            <Archive className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <button onClick={() => handleArchiveUser(user)} className="text-red-500 hover:text-red-700 ml-1 transition">
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