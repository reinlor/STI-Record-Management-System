import React, { useState, useEffect } from "react";
import { Megaphone } from "lucide-react";
import axios from "axios";
import LoadingDots from "../../../component/Loading";
import { db } from "../../../firebaseClient";
import { doc, onSnapshot } from "firebase/firestore";

export default function TeacherDashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true)
    const announcementRef = doc(db, "content", "announcement");
    const unsubAnnouncements = onSnapshot(
      announcementRef,
      (docSnap) => {
        if (docSnap.exists()) {
          let msgs = docSnap.data().messages || [];

          // Convert Firestore Timestamps
          msgs = msgs.map((m) => {
            let date = null;
            if (m.timeCreated?.toDate) {
              date = m.timeCreated.toDate();
            } else if (m.timeCreated instanceof Date) {
              date = m.timeCreated;
            } else {
              date = new Date();
            }
            return { ...m, timeCreated: date };
          });

          // Filter: keep only announcements within 30 days
          const now = new Date();
          const validMsgs = msgs.filter((m) => {
            const diffDays = (now - m.timeCreated) / (1000 * 60 * 60 * 24);
            return diffDays <= 30;
          });

          // Sort: latest first
          validMsgs.sort((a, b) => b.timeCreated - a.timeCreated);

          setAnnouncements(validMsgs);
        } else {
          setAnnouncements([]);
        }

        setLoading(false)

        return () => {
          unsubAnnouncements();
        }
      },
      (err) => {
        console.error("Announcement listener error:", err);
        setError("Failed to fetch announcements.");
        setLoading(false)
      }
    );
  }, []);

  const toggleExpand = (index) => {
    setExpanded((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (loading) return <LoadingDots />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 to-gray-100 font-sans">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 bg-gray-100 min-h-screen font-sans">
      <div className="mx-auto rounded-3xl shadow-xl overflow-hidden p-8 sm:p-12 bg-white border border-gray-200 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Teacher Dashboard
            </h2>
            <p className="text-gray-500 mt-2 text-lg">
              Welcome back 👋 Here’s the latest announcements.
            </p>
          </div>
        </div>

        {/* Announcements Section */}
        <section className="bg-gray-50 p-6 rounded-2xl shadow-inner">
          <div className="flex items-center mb-6">
            <div className="bg-yellow-400 p-3 rounded-full mr-3">
              <Megaphone className="w-7 h-7 text-gray-900" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Announcements
            </h2>
          </div>

          {announcements.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {announcements.map((item, index) => {
                const isExpanded = expanded[index] || false;
                const isLong = item.description?.length > 200;
                const displayText =
                  isExpanded || !isLong
                    ? item.description
                    : item.description?.slice(0, 200) + "...";

                return (
                  <li
                    key={index}
                    className="py-5 px-4 hover:bg-yellow-50 rounded-lg transition"
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-2 h-2 mt-2 bg-yellow-400 rounded-full"></span>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {displayText || "No description available."}
                        </p>
                        {isLong && (
                          <button
                            onClick={() => toggleExpand(index)}
                            className="mt-1 text-yellow-600 text-xs font-medium hover:underline hover:-translate-y-0.5 transform transition-all duration-200"
                          >
                            {isExpanded ? "Show Less" : "Read More"}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No announcements available.</p>
          )}
        </section>
      </div>
    </div>
  );
}
