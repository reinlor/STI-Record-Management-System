import React, { useState, useEffect } from "react";
import { Megaphone, BookOpen, Heart } from "lucide-react";
import axios from "axios";
import LoadingDots from '../../../component/Loading'

export default function StudentDashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [wellnessLink, setWellnessLink] = useState("");
  const [handbooks, setHandbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPDF, setSelectedPDF] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const announcementsRes = await axios.get(
          "http://localhost:5000/content/announcement/get"
        );
        setAnnouncements(announcementsRes.data.announcements);

        const wellnessRes = await axios.get(
          "http://localhost:5000/content/wellness/get"
        );
        setWellnessLink(wellnessRes.data.link);

        const handbookRes = await axios.get(
          "http://localhost:5000/content/studentHandbook/get"
        );
        setHandbooks([
          {
            title: "High School Handbook",
            level: "High School",
            description:
              "Covers policies, guidelines, and services for junior and senior high students.",
            url: handbookRes.data.link,
          },
          {
            title: "Tertiary Handbook",
            level: "College / University",
            description:
              "Provides academic rules, student services, and conduct guidelines for tertiary students.",
            url: handbookRes.data.link,
          },
        ]);
      } catch (err) {
        setError("Failed to fetch data. Please check the network connection.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleWellnessCheckClick = () => {
    if (wellnessLink) {
      window.open(wellnessLink, "_blank", "noopener,noreferrer");
    }
  };

  const openPDF = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const toggleExpand = (index) => {
    setExpanded((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (loading) {
    return <LoadingDots />
  }

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
              Student Dashboard
            </h2>
            <p className="text-gray-500 mt-2 text-lg">
              Welcome back 👋 Here’s a quick look at your day.
            </p>
          </div>
        </div>

        {/* Announcements */}
        <section className="bg-gray-50 p-6 rounded-2xl shadow-inner mb-10">
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
            <p className="text-center text-gray-500">
              No announcements available.
            </p>
          )}
        </section>

        {/* Wellness + Handbooks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Wellness */}
          <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-pink-50 to-yellow-50 rounded-2xl shadow-md text-center border border-gray-200">
            <Heart className="w-10 h-10 text-red-400 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900">
              Wellness Check
            </h3>
            <p className="text-sm text-gray-600 mt-2 max-w-xs">
              Take a moment to check in with yourself. Your well-being is our
              priority.
            </p>
            <button
              className="mt-6 py-2.5 px-8 bg-yellow-400 text-black font-semibold rounded-lg shadow hover:bg-yellow-500 hover:-translate-y-0.5 transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleWellnessCheckClick}
              disabled={!wellnessLink}
            >
              Start Survey
            </button>
          </div>

          {/* Handbooks */}
          <div className="bg-gradient-to-br from-yellow-50 to-gray-50 p-8 rounded-2xl shadow-md border border-gray-200">
            <div className="flex flex-col items-center text-center mb-6">
              <BookOpen className="w-10 h-10 text-yellow-500 mb-3" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Student Handbooks
              </h2>
              <p className="text-sm text-gray-600 mt-2 max-w-md">
                Access the official handbooks to guide you through rules,
                policies, and student services.
              </p>
            </div>
            <div className="flex flex-col gap-5">
              {handbooks.map((hb, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 transition"
                >
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {hb.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{hb.description}</p>
                  <button
                    className="py-2 px-4 bg-yellow-400 text-black text-sm font-medium rounded-lg shadow hover:bg-yellow-500 hover:-translate-y-0.5 transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => openPDF(hb.url)}
                  >
                    View PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PDF Viewer */}
        {selectedPDF && (
          <div className="mt-12 bg-gray-50 p-6 rounded-2xl shadow-inner border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              PDF Viewer
            </h2>
            <div className="h-[70vh] bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100">
              <iframe
                src={selectedPDF}
                className="w-full h-full border-0"
                title="PDF Viewer"
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
