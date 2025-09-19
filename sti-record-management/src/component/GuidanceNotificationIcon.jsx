import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, X, ClipboardList, Clock, FilePen, FilePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { doc, onSnapshot, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseClient";


const GuidanceNotificationIcon = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((notif) => !notif.isRead).length;
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const markAllAsRead = async () => {
    try {
      const requestRef = doc(db, "notification", "request");
      const requestSnap = await getDoc(requestRef);
      if (requestSnap.exists()) {
        const requestData = requestSnap.data().data || [];
        const updatedRequests = requestData.map((item) => ({ ...item, isRead: true }));
        await updateDoc(requestRef, { data: updatedRequests });
      }

      const referralRef = doc(db, "notification", "referral");
      const referralSnap = await getDoc(referralRef);
      if (referralSnap.exists()) {
        const referralData = referralSnap.data().data || [];
        const updatedReferrals = referralData.map((item) => ({ ...item, isRead: true }));   
        await updateDoc(referralRef, { data: updatedReferrals });
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };


  const handleNotificationClick = async (notif) => {
    try {
      const docRef = doc(db, "notification", notif.notifID.startsWith("adminReferral") ? "referral" : "request");

      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;

      const data = docSnap.data().data || [];

      const updatedData = data.map((item) =>
        item.notifID === notif.notifID ? { ...item, isRead: true } : item
      );

      await updateDoc(docRef, { data: updatedData });

    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    const requestRef = doc(db, "notification", "request");
    const referralRef = doc(db, "notification", "referral");

    const unsubscribeRequest = onSnapshot(requestRef, (requestSnapshot) => {
      const requestData = requestSnapshot.exists()
        ? requestSnapshot.data().data || []
        : [];
      setRequests(requestData);
    });

    const unsubscribeReferral = onSnapshot(referralRef, (referralSnapshot) => {
      const referralData = referralSnapshot.exists()
        ? referralSnapshot.data().data || []
        : [];
      setReferrals(referralData);
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
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  return (
    <div ref={dropdownRef} className="relative z-50">
      <button
        onClick={toggleDropdown}
        className="p-2 text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#F4D03F] rounded-full relative"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] inline-flex items-center justify-center px-1 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-lg shadow-xl py-2 text-gray-800">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h3 className="text-lg font-bold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-[#0B5793] hover:text-[#3473A4] transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
          <ul className="max-h-60 overflow-y-auto custom-scrollbar">
            {notifications.sort((a, b) => {
              const da = parseToDate(a.date);
              const db = parseToDate(b.date);
              return db - da;
            })
              .slice(0, 5)
              .map((notif) => (
                <li
                  key={notif.id}
                  className={`py-2 px-4 border-b last:border-b-0 cursor-pointer ${!notif.isRead
                    ? "bg-blue-50 hover:bg-blue-100"
                    : "hover:bg-gray-100"
                    }`}
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
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-[#F4D03F] rounded-full shrink-0 mt-2"></span>
                    )}
                  </div>
                </li>
              ))}
          </ul>
          <div className="px-4 py-2 mt-2">
            <button
              className="block w-full text-center text-[#0B5793] font-semibold hover:text-[#3473A4]"
              onClick={() => {
                navigate('/guidance/notifications')
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