import React, { useState, useEffect } from 'react';
import { Megaphone } from 'lucide-react';
import axios from 'axios';

export default function StudentDashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [wellnessLink, setWellnessLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Announcements
        const announcementsRes = await axios.get('http://localhost:5000/content/announcement/get');
        setAnnouncements(announcementsRes.data.announcements);

        // Fetch Wellness Link
        const wellnessRes = await axios.get('http://localhost:5000/content/wellness/get');
        setWellnessLink(wellnessRes.data.link);
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
      window.open(wellnessLink, '_blank', 'noopener,noreferrer');
    } else {
      console.log("Wellness survey link not available.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-gray-100 min-h-screen font-sans">
      <div className="mx-auto rounded-3xl shadow-xl overflow-hidden p-6 sm:p-10 bg-white">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-500 mt-2">Welcome back, student! Here's a quick look at your day.</p>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Announcements Section */}
          <div className="bg-gray-100 p-6 rounded-2xl shadow-inner">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-400 p-2 rounded-full flex items-center justify-center mr-2">
                <Megaphone className="w-6 h-6 text-gray-900" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Announcements</h2>
            </div>
            <ul className="space-y-4">
              {announcements.length > 0 ? (
                announcements.map((item, index) => (
                  <li
                    key={index}
                    className="p-4 bg-white rounded-xl shadow-md transition-transform transform hover:scale-105 duration-200 cursor-pointer hover:bg-yellow-100"
                  >
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  </li>
                ))
              ) : (
                <li className="text-center text-gray-500">No announcements available.</li>
              )}
            </ul>
          </div>

          {/* Wellness Check Survey Button */}
          <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-2xl shadow-inner text-center">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Wellness Check</h3>
              <p className="text-sm text-gray-500 mt-1">Take a moment to check in with yourself. Your well-being is our priority.</p>
            </div>
            <button
              className="py-2.5 px-6 bg-yellow-400 text-black font-semibold rounded-lg shadow-md hover:bg-yellow-500 hover:-translate-y-0.5 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleWellnessCheckClick}
              disabled={!wellnessLink}
            >
              Start Survey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
