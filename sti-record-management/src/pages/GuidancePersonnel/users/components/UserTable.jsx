import React, { useState } from 'react';
import { EllipsisVertical, Archive, ChevronLeft, ChevronRight } from 'lucide-react';

export default function UserTable({
  filteredUsers,
  displayRoles,
  displayAccess,
  handleEditInfo,
  showArchived,
  handleArchiveUser,
  handleRestoreUser,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const pagedUsers = filteredUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto overflow-y-auto custom-scrollbar h-auto">
      <table className="min-w-full table-fixed divide-y divide-gray-200 text-[10px] sm:text-xs md:text-sm lg:text-base">
        <thead className="bg-gray-50">
          <tr>
            <th className="sticky top-0 z-10 bg-[#0172bd] text-white px-4 py-2 text-left font-semibold w-1/4">Name</th>
            <th className="sticky top-0 z-10 bg-[#0172bd] text-white px-1 py-2 text-left font-semibold w-1/4">Roles</th>
            <th className="sticky top-0 z-10 bg-[#0172bd] text-white px-1 py-2 text-left font-semibold w-1/4">Access</th>
            <th className="sticky top-0 z-10 bg-[#0172bd] text-white px-1 py-2 text-right font-semibold w-1/4"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {pagedUsers.length > 0 ? (
            pagedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                <td className="px-4 py-2 break-words w-1/4 max-w-[180px]">
                  <div className="font-semibold text-black ">{user.name}</div>
                  <div className="text-gray-400 text-medium">{user.employeeNumber}</div>
                </td>
                <td className="px-1 py-1 break-words w-1/4 max-w-[50px] text-black font-semibold">{displayRoles(user)}</td>
                <td className="px-1 py-1 break-words w-1/4 max-w-[120px] text-gray-500">{displayAccess(user.access)}</td>
                <td className="px-1 py-1 w-1/4 align-middle">
                  <div className="flex items-center justify-end space-x-2 h-full mr-5">
                    <button onClick={() => handleEditInfo(user)} className="text-[#0172bd] hover:text-blue-600 transition cursor-pointer">
                      <EllipsisVertical className="w-6 h-6" />
                    </button>
                    {showArchived ? (
                      <button onClick={() => handleRestoreUser(user)} className="text-[#28a745] hover:text-green-500 transition items-center justify-center cursor-pointer">
                        <Archive className="w-6 h-6" />
                      </button>
                    ) : (
                      <button onClick={() => handleArchiveUser(user)} className="text-[#dc3545] hover:text-red-700 transition items-center justify-center cursor-pointer">
                        <Archive className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-8 text-gray-500">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {/* Pagination controls - OUTSIDE the table */}
      <div className="w-full flex justify-center lg:justify-end items-center mt-2 pr-0 lg:pr-2 pb-2">
        <nav className="flex items-center space-x-1">
          <button
            className="px-2 py-1 rounded hover:bg-gray-200 text-[#0172bd] font-bold cursor-pointer"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-5 h-5 object-cover rounded" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`px-2 py-1 rounded cursor-pointer ${currentPage === i + 1 ? 'bg-[#0172bd] text-white' : 'hover:bg-gray-200 text-[#0172bd]'}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="px-2 py-1 rounded hover:bg-gray-200 text-[#0172bd] font-bold cursor-pointer"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-5 h-5 object-cover rounded" />
          </button>
        </nav>
      </div>
    </div>
  );
}