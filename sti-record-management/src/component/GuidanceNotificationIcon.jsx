import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, X, ClipboardList, Clock } from "lucide-react";
import GuidanceNotificationPage from "./GuidanceNotificationPage"; // Import the GuidanceNotificationPage component

// MOCK DATA for Guidance Personnel
const ALL_NOTIFICATIONS = [
  { id: 'guidance_1', from: 'System', subject: 'New Incident Report Submitted', date: 'September 18, 2025', isRead: false, status: 'In Progress' },
  { id: 'guidance_2', from: 'Admin', subject: 'Student Absent Slip Approved', date: 'September 17, 2025', isRead: false, status: 'Approved' },
  { id: 'guidance_3', from: 'Registrar', subject: 'Student Enrollment Issue', date: 'September 16, 2025', isRead: true, status: 'Denied' },
];

const GuidanceNotificationIcon = ({ setSelected }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState(ALL_NOTIFICATIONS);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((notif) => !notif.isRead).length;
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const markAllAsRead = () => setNotifications(notifications.map((notif) => ({ ...notif, isRead: true })));
  const handleNotificationClick = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            {notifications.slice(0, 5).map((notif) => (
              <li
                key={notif.id}
                className={`py-2 px-4 border-b last:border-b-0 cursor-pointer ${
                  !notif.isRead
                    ? "bg-blue-50 hover:bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => handleNotificationClick(notif.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      notif.status === "Approved"
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
                  <div className="flex-1">
                    <p className="font-semibold">{notif.subject}</p>
                    <p className="text-sm text-gray-600">{notif.from}</p>
                    <p className="text-xs text-gray-400">{notif.date}</p>
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
                setSelected("guidanceNotifications");
                setIsDropdownOpen(false);
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