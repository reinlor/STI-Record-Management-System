import React, { useState, useEffect } from "react";
import { Bell, Check, X, ClipboardList, Clock, ChevronLeft, ChevronRight, FilePen, FilePlus } from "lucide-react";
import { doc, onSnapshot, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseClient";

const getVisiblePageNumbers = (currentPage, totalPages, maxVisible = 5) => {
  const visiblePages = [];
  const startPage = Math.max(2, currentPage - Math.floor(maxVisible / 2));
  const endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

  visiblePages.push(1);
  if (startPage > 2) visiblePages.push("...");
  for (let i = startPage; i <= endPage; i++) visiblePages.push(i);
  if (endPage < totalPages - 1) visiblePages.push("...");
  if (totalPages > 1 && !visiblePages.includes(totalPages)) visiblePages.push(totalPages);
  if (totalPages <= maxVisible + 2) {
    visiblePages.length = 0;
    for (let i = 1; i <= totalPages; i++) visiblePages.push(i);
  }
  return visiblePages;
};

const GuidanceNotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Load notifications from Firestore
  useEffect(() => {
    const requestRef = doc(db, "notification", "request");
    const referralRef = doc(db, "notification", "referral");

    const unsubscribeRequest = onSnapshot(requestRef, (snap) => {
      const data = snap.exists() ? snap.data().data || [] : [];
      setNotifications((prev) => {
        const referrals = prev.filter((n) => n.collectionType === "referral");
        return [...data.map((n) => ({ ...n, collectionType: "request" })), ...referrals];
      });
    });

    const unsubscribeReferral = onSnapshot(referralRef, (snap) => {
      const data = snap.exists() ? snap.data().data || [] : [];
      setNotifications((prev) => {
        const requests = prev.filter((n) => n.collectionType === "request");
        return [...requests, ...data.map((n) => ({ ...n, collectionType: "referral" }))];
      });
    });

    return () => {
      unsubscribeRequest();
      unsubscribeReferral();
    };
  }, []);

  // Toggle read status in Firestore
  const toggleReadStatus = async (notif) => {
    try {
      const docRef = doc(db, "notification", notif.collectionType);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;

      const data = snap.data().data || [];
      const updatedData = data.map((item) =>
        item.notifID === notif.notifID ? { ...item, isRead: !item.isRead } : item
      );

      await updateDoc(docRef, { data: updatedData });
    } catch (err) {
      console.error("Error updating notification:", err);
    }
  };

  // Pagination
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
            Guidance Notifications
          </h1>
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
                  key={notif.notifID}
                  className={`border-b last:border-b-0 transition-colors cursor-pointer
                  ${notif.isRead ? "bg-gray-50 hover:bg-gray-100" : "bg-blue-50 hover:bg-blue-100"}`}
                  onClick={() => toggleReadStatus(notif)}
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
                        {notif.type === "Update" ? (
                          <FilePen className="w-5 h-5 text-green-600" />
                        ) : notif.status === "Submission" ? (
                          <FilePlus className="w-5 h-5 text-red-600" />
                        ) : (
                          <ClipboardList className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <span className="font-medium text-gray-800">{notif.from}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{notif.subject}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{notif.date?.toDate?.() ? notif.date.toDate().toLocaleString() : notif.date}</td>
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

        {/* Pagination controls */}
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
                {num === "..." ? (
                  <span className="px-3 py-1 text-gray-500">...</span>
                ) : (
                  <button
                    onClick={() => setCurrentPage(num)}
                    className={`px-3 py-1 rounded-md text-sm sm:text-base ${currentPage === num
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

        {/* Empty state */}
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
