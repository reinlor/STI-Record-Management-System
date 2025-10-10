import React, { useState, useRef, useEffect } from "react";
import { Bell, ClipboardList, FilePen, FilePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseClient";

const GuidanceNotificationIcon = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const today = new Date();
  const todayCount = notifications.filter((notif) => {
    const notifDate = notif.date?.toDate ? notif.date.toDate() : new Date(notif.date);
    return (
      notifDate.getDate() === today.getDate() &&
      notifDate.getMonth() === today.getMonth() &&
      notifDate.getFullYear() === today.getFullYear()
    );
  }).length;

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const handleNotificationClick = (notif) => {
    setIsDropdownOpen(false);
    if (notif.collectionType === "referral") {
      navigate("/guidance/referral-form");
    } else {
      navigate("/guidance/request-slip");
    }
  };

  useEffect(() => {
    const requestRef = doc(db, "notification", "request");
    const referralRef = doc(db, "notification", "referral");

    const unsubscribeRequest = onSnapshot(requestRef, (requestSnapshot) => {
      const requestData = requestSnapshot.exists()
        ? requestSnapshot.data().data || []
        : [];
      setRequests(requestData.map((n) => ({ ...n, collectionType: "request" })));
    });

    const unsubscribeReferral = onSnapshot(referralRef, (referralSnapshot) => {
      const referralData = referralSnapshot.exists()
        ? referralSnapshot.data().data || []
        : [];
      setReferrals(referralData.map((n) => ({ ...n, collectionType: "referral" })));
    });

    return () => {
      unsubscribeRequest();
      unsubscribeReferral();
    };
  }, []);

  useEffect(() => {
    setNotifications([...requests, ...referrals]);
  }, [requests, referrals]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const parseToDate = (val) => {
    if (!val) return null;
    if (val.toDate && typeof val.toDate === "function") return val.toDate();
    if (val.seconds) return new Date(val.seconds * 1000);
    if (val._seconds) return new Date(val._seconds * 1000);
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDate = (timestamp) => {
    const d = parseToDate(timestamp);
    return d ? d.toLocaleString() : "N/A";
  };

  return (
    <div ref={dropdownRef} className="relative z-50">
      <button
        onClick={toggleDropdown}
        className="p-2 text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#F4D03F] rounded-full relative"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {todayCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] inline-flex items-center justify-center px-1 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
            {todayCount > 99 ? "99+" : todayCount}
          </span>
        )}
      </button>

      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-lg shadow-xl py-2 text-gray-800">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h3 className="text-lg font-bold">Notifications</h3>
            {todayCount > 0 && (
              <span className="text-sm text-gray-500">Today: {todayCount}</span>
            )}
          </div>

          <ul className="max-h-60 overflow-y-auto custom-scrollbar">
            {notifications
              .sort((a, b) => {
                const da = parseToDate(a.date);
                const db = parseToDate(b.date);
                return db - da;
              })
              .slice(0, 5)
              .map((notif) => (
                <li
                  key={notif.notifID}
                  className="py-2 px-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="flex items-start gap-3">
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
                      ) : notif.type === "Submission" ? (
                        <FilePlus className="w-5 h-5 text-red-600" />
                      ) : (
                        <ClipboardList className="w-5 h-5 text-gray-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold">{notif.subject}</p>
                      <p className="text-sm text-gray-600">{notif.from}</p>
                      <p className="text-xs text-gray-400">{formatDate(notif.date)}</p>
                    </div>
                  </div>
                </li>
              ))}
          </ul>

          <div className="px-4 py-2 mt-2">
            <button
              className="block w-full text-center text-[#0B5793] font-semibold hover:text-[#3473A4]"
              onClick={() => {
                navigate("/guidance/notifications");
              }}
            >
              See all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidanceNotificationIcon;
