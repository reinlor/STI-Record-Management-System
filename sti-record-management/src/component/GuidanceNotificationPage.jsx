import React, { useState, useEffect } from "react";
import { Bell, ClipboardList, FilePen, FilePlus, ChevronLeft, ChevronRight } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseClient";
import { useNavigate } from "react-router-dom";
import LoadingDots from "./Loading";

const getVisiblePageNumbers = (currentPage, totalPages, maxVisible = 5) => {
  const pages = [];
  const start = Math.max(2, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages - 1, start + maxVisible - 1);
  pages.push(1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push("...");
  if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);
  if (totalPages <= maxVisible + 2) {
    pages.length = 0;
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  }
  return pages;
};

const GuidanceNotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);

    const requestRef = doc(db, "notification", "request");
    const referralRef = doc(db, "notification", "referral");
    const casesRef = doc(db, "notification", "cases");

    const mergeData = (newData, type) => {
      setNotifications((prev) => {
        const filtered = prev.filter((n) => n.collectionType !== type);
        const formatted = (newData || []).map((n) => ({ ...n, collectionType: type }));
        return [...filtered, ...formatted];
      });
    };

    const unsubReq = onSnapshot(requestRef, (snap) => {
      const data = snap.exists() ? snap.data().data || [] : [];
      mergeData(data, "request");
      setIsLoading(false);
    });

    const unsubRef = onSnapshot(referralRef, (snap) => {
      const data = snap.exists() ? snap.data().data || [] : [];
      mergeData(data, "referral");
    });

    const unsubCase = onSnapshot(casesRef, (snap) => {
      const data = snap.exists() ? snap.data().data || [] : [];
      mergeData(data, "cases");
    });

    return () => {
      unsubReq();
      unsubRef();
      unsubCase();
    };
  }, []);

  const today = new Date();
  const isToday = (d) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const sorted = [...notifications].sort((a, b) => {
    const da = a.date?.toDate ? a.date.toDate() : new Date(a.date);
    const db = b.date?.toDate ? b.date.toDate() : new Date(b.date);
    return db - da;
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = sorted.slice(startIndex, startIndex + pageSize);
  const visiblePages = getVisiblePageNumbers(currentPage, totalPages);

  if (isLoading) return <LoadingDots />;

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-[#0B5793] flex items-center gap-2 mb-6">
          <Bell className="w-8 h-8" /> Guidance Notifications
        </h1>

        <div className="overflow-x-auto rounded-lg">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0B5793] text-white">
                <th className="px-4 py-3 font-semibold">From</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((notif) => {
                const notifDate = notif.date?.toDate ? notif.date.toDate() : new Date(notif.date);
                const highlight = isToday(notifDate);
                return (
                  <tr
                    key={notif.notifID}
                    onClick={() => {
                      if (notif.collectionType === "referral") {
                        navigate("/guidance/referral-form");
                      } else if (notif.collectionType === "cases") {
                        navigate("/guidance/student-cases");
                      } else {
                        navigate("/guidance/request-slip");
                      }
                    }}
                    className={`border-b last:border-b-0 cursor-pointer transition-colors ${highlight ? "bg-blue-50 hover:bg-blue-100" : "bg-white hover:bg-gray-50"
                      }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${notif.type === "Update"
                              ? "bg-green-100 text-green-600"
                              : notif.type === "Submission"
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                        >
                          {notif.type === "Update" ? (
                            <FilePen className="w-5 h-5" />
                          ) : notif.type === "Submission" ? (
                            <FilePlus className="w-5 h-5" />
                          ) : (
                            <ClipboardList className="w-5 h-5" />
                          )}
                        </div>
                        <span className="font-medium text-gray-800">{notif.from}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">{notif.subject}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {notifDate.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sorted.length > pageSize && (
          <div className="flex justify-center items-center mt-6 gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {visiblePages.map((num, idx) =>
              num === "..." ? (
                <span key={idx} className="px-3 py-1 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={idx}
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

        {sorted.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No notifications available.
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidanceNotificationPage;
