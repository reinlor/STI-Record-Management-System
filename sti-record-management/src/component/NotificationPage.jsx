import React, { useState, useEffect } from 'react';
import { Bell, Check, X, ClipboardList, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebaseClient";

// function for smart pagination
const getVisiblePageNumbers = (currentPage, totalPages, maxVisible = 5) => {
  const visiblePages = [];
  const startPage = Math.max(2, currentPage - Math.floor(maxVisible / 2));
  const endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

  visiblePages.push(1);

  if (startPage > 2) visiblePages.push("...");

  for (let i = startPage; i <= endPage; i++) {
    visiblePages.push(i);
  }

  if (endPage < totalPages - 1) visiblePages.push("...");

  if (totalPages > 1 && !visiblePages.includes(totalPages)) {
    visiblePages.push(totalPages);
  }

  if (totalPages <= maxVisible + 2) {
    visiblePages.length = 0;
    for (let i = 1; i <= totalPages; i++) {
      visiblePages.push(i);
    }
  }

  return visiblePages;
};

const NotificationsPage = ({ uid = "02000288488" }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!uid) return;
    const docRef = doc(db, "notification", "student");

    // Subscribe in real-time
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setNotifications(data[uid] || []);
      }
    });

    return () => unsubscribe();
  }, [uid]);

  const parseToDate = (val) => {
    if (!val) return null;

    if (val.toDate && typeof val.toDate === "function") {
      return val.toDate();
    }

    if (val.seconds) {
      return new Date(val.seconds * 1000);
    }
    if (val._seconds) {
      return new Date(val._seconds * 1000);
    }

    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };


  const formatDate = (timestamp) => {
    const d = parseToDate(timestamp);
    return d ? d.toLocaleString() : "N/A";
  };

  const toggleReadStatus = async (id) => {
    const docRef = doc(db, "notification", "student");
    const updated = notifications.map((n) =>
      n.notifID === id ? { ...n, isRead: !n.isRead } : n
    );
    await updateDoc(docRef, { [uid]: updated });
  };
  

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(notifications.length / pageSize);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedNotifications = notifications.slice(startIndex, startIndex + pageSize);
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
                  key={notif.notifID}
                  className={`border-b last:border-b-0 cursor-pointer transition-colors ${notif.isRead ? "bg-gray-50 hover:bg-gray-100" : "bg-blue-50 hover:bg-blue-100"
                    }`}
                  onClick={() => toggleReadStatus(notif.notifID)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${notif.status === "Approved"
                          ? "bg-green-100"
                          : notif.status === "Denied"
                            ? "bg-red-100"
                            : notif.status === "Resolved"
                              ? "bg-green-100"
                              : notif.status === "In Progress"
                                ? "bg-yellow-100"
                                : "bg-gray-100"
                          }`}
                      >
                        {notif.status === "Approved" || notif.status === "Resolved" ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : notif.status === "Denied" ? (
                          <X className="w-5 h-5 text-red-600" />
                        ) : notif.status === "In Progress" ? (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <ClipboardList className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <span className="font-medium text-gray-800">{notif.from}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{notif.subject}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {formatDate(notif.date)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                    {notif.isRead ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {notifications.length > pageSize && (
          <div className="flex justify-center items-center mt-6 gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {visiblePages.map((num, i) =>
              num === "..." ? (
                <span key={i} className="px-3 py-1 text-gray-500">...</span>
              ) : (
                <button
                  key={i}
                  onClick={() => setCurrentPage(num)}
                  className={`px-3 py-1 rounded-md ${currentPage === num
                    ? "bg-[#0B5793] text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                    }`}
                >
                  {num}
                </button>
              )
            )}

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
