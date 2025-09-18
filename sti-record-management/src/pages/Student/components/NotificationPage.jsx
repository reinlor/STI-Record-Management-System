import React, { useState } from 'react';
import { Bell, Check, X, ClipboardList, Clock, ChevronLeft, ChevronRight } from "lucide-react";

// MOCK DATA
const ALL_NOTIFICATIONS = [
  { id: 'notif_1', from: 'Admin', subject: 'Your Absent Slip has been Approved', date: 'September 14, 2025', isRead: false, status: 'Approved' },
  { id: 'notif_2', from: 'Disciplinary Officer', subject: 'Your Incident Report has been Denied', date: 'September 13, 2025', isRead: false, status: 'Denied' },
  { id: 'notif_3', from: 'Admin', subject: 'Your Incident Report has been Resolved', date: 'September 12, 2025', isRead: true, status: 'Resolved' },
  { id: 'notif_4', from: 'Admin', subject: 'Your Incident Report is In Progress', date: 'September 11, 2025', isRead: true, status: 'In Progress' },
  { id: 'notif_5', from: 'System', subject: 'Password Change Successful', date: 'September 10, 2025', isRead: true, status: 'Resolved' },
  { id: 'notif_6', from: 'Registrar', subject: 'Your Enrollment Request has been Approved', date: 'September 09, 2025', isRead: false, status: 'Approved' },
  { id: 'notif_7', from: 'Registrar', subject: 'Your Enrollment Request is In Progress', date: 'September 08, 2025', isRead: true, status: 'In Progress' },
  { id: 'notif_8', from: 'System', subject: 'Security Alert: Suspicious Login Attempt', date: 'September 07, 2025', isRead: false, status: 'Denied' },
  { id: 'notif_9', from: 'Admin', subject: 'Your Clearance Form is Ready', date: 'September 06, 2025', isRead: false, status: 'Resolved' },
  { id: 'notif_10', from: 'System', subject: 'New Feature Available in Portal', date: 'September 05, 2025', isRead: true, status: 'Approved' },
  { id: 'notif_11', from: 'Disciplinary Officer', subject: 'Reminder: Submit Incident Report', date: 'September 04, 2025', isRead: false, status: 'In Progress' },
  { id: 'notif_12', from: 'Admin', subject: 'Payment for tuition has been received', date: 'September 03, 2025', isRead: false, status: 'Approved' },
];

// function for smart pagination
const getVisiblePageNumbers = (currentPage, totalPages, maxVisible = 5) => {
  const visiblePages = [];
  const startPage = Math.max(2, currentPage - Math.floor(maxVisible / 2));
  const endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

  // Always show the first page
  visiblePages.push(1);

  // Add ellipsis if needed
  if (startPage > 2) {
    visiblePages.push('...');
  }

  // Add the central visible pages
  for (let i = startPage; i <= endPage; i++) {
    visiblePages.push(i);
  }

  // Add a second ellipsis if needed
  if (endPage < totalPages - 1) {
    visiblePages.push('...');
  }

  // Always show the last page (if it's not already visible)
  if (totalPages > 1 && !visiblePages.includes(totalPages)) {
    visiblePages.push(totalPages);
  }

  // Handle cases where the last page is close to the current page
  if (totalPages <= maxVisible + 2) {
    visiblePages.length = 0;
    for (let i = 1; i <= totalPages; i++) {
      visiblePages.push(i);
    }
  }

  return visiblePages;
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(ALL_NOTIFICATIONS);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(notifications.length / pageSize);

  const toggleReadStatus = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, isRead: !notif.isRead } : notif
    ));
  };

  // Paginated slice
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedNotifications = notifications.slice(startIndex, startIndex + pageSize);

  // Get the visible pages to display
  const visiblePages = getVisiblePageNumbers(currentPage, totalPages);

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#0B5793] flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Notifications
          </h1>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0B5793] text-white">
                <th className="px-4 py-3 font-semibold">From</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Date</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Read?</th>
              </tr>
            </thead>
            <tbody>
              {paginatedNotifications.map((notif) => (
                <tr
                  key={notif.id}
                  className={`border-b last:border-b-0 transition-colors cursor-pointer
                  ${notif.isRead ? 'bg-gray-50 hover:bg-gray-100' : 'bg-blue-50 hover:bg-blue-100'}`}
                  onClick={() => toggleReadStatus(notif.id)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        notif.status === "Approved" ? "bg-green-100" :
                        notif.status === "Denied" ? "bg-red-100" :
                        notif.status === "Resolved" ? "bg-green-100" :
                        notif.status === "In Progress" ? "bg-yellow-100" : "bg-gray-100"
                      }`}>
                        {notif.status === "Approved" ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : notif.status === "Denied" ? (
                          <X className="w-5 h-5 text-red-600" />
                        ) : notif.status === "Resolved" ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : notif.status === "In Progress" ? (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <ClipboardList className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <span className="font-medium text-gray-800">{notif.from}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">
                    {notif.subject}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {notif.date}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                    {notif.isRead ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-red-500" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {notifications.length > pageSize && (
          <div className="flex justify-center items-center mt-6 gap-2">
            {/* Previous Button with ChevronLeft icon */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Numbered Page Buttons with Ellipses */}
            {visiblePages.map((num, index) => (
              <React.Fragment key={index}>
                {num === '...' ? (
                  <span className="px-3 py-1 text-gray-500">...</span>
                ) : (
                  <button
                    onClick={() => setCurrentPage(num)}
                    className={`px-3 py-1 rounded-md text-sm sm:text-base ${
                      currentPage === num
                        ? "bg-[#0B5793] text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {num}
                  </button>
                )}
              </React.Fragment>
            ))}

            {/* Next Button with ChevronRight icon */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {notifications.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <p className="mb-2">No notifications to display.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;