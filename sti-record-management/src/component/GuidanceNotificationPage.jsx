import React, { useState } from 'react';
import { Bell, Check, X, ClipboardList, Clock, ChevronLeft, ChevronRight } from "lucide-react";

// MOCK DATA for Guidance Personnel
const ALL_NOTIFICATIONS = [
  { id: 'guidance_1', from: 'System', subject: 'New Incident Report Submitted', date: 'September 18, 2025', isRead: false, status: 'In Progress' },
  { id: 'guidance_2', from: 'Admin', subject: 'Student Absent Slip Approved', date: 'September 17, 2025', isRead: false, status: 'Approved' },
  { id: 'guidance_3', from: 'Registrar', subject: 'Student Enrollment Issue', date: 'September 16, 2025', isRead: true, status: 'Denied' },
];

const getVisiblePageNumbers = (currentPage, totalPages, maxVisible = 5) => {
  const visiblePages = [];
  const startPage = Math.max(2, currentPage - Math.floor(maxVisible / 2));
  const endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

  visiblePages.push(1);
  if (startPage > 2) visiblePages.push('...');
  for (let i = startPage; i <= endPage; i++) visiblePages.push(i);
  if (endPage < totalPages - 1) visiblePages.push('...');
  if (totalPages > 1 && !visiblePages.includes(totalPages)) visiblePages.push(totalPages);
  if (totalPages <= maxVisible + 2) {
    visiblePages.length = 0;
    for (let i = 1; i <= totalPages; i++) visiblePages.push(i);
  }
  return visiblePages;
};

const GuidanceNotificationPage = ({ setSelectedPage }) => {
  const [notifications, setNotifications] = useState(ALL_NOTIFICATIONS);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(notifications.length / pageSize);

  const toggleReadStatus = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, isRead: !notif.isRead } : notif
    ));
  };

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedNotifications = notifications.slice(startIndex, startIndex + pageSize);
  const visiblePages = getVisiblePageNumbers(currentPage, totalPages);

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#0B5793] flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Guidance Notifications
          </h1>
          <button
            onClick={() => setSelectedPage('home')}
            className="px-4 py-2 bg-[#0B5793] text-white rounded-lg hover:bg-[#3473A4] font-semibold"
          >
            Back
          </button>
        </div>
        <div className="overflow-x-auto rounded-lg">
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
        {notifications.length > pageSize && (
          <div className="flex justify-center items-center mt-6 gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
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

export default GuidanceNotificationPage;