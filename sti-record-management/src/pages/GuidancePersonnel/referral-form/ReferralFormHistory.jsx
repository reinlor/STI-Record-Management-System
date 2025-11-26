import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import LoadingDots from '../../../component/Loading';
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseClient.js";

function ReferralFormHistory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [referralData, setReferralData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onSnapshot(
      collection(db, "referralForm"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReferralData(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching referral list:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";

    // Handle Firebase Timestamp object or serialized map
    if (typeof timestamp === "object" && timestamp !== null) {
      const secs = timestamp.seconds || timestamp._seconds;
      const nano = timestamp.nanoseconds || timestamp._nanoseconds || 0;

      if (typeof secs === "number") {
        const ms = secs * 1000 + nano / 1000000;
        return new Date(ms).toLocaleString("en-US", {
          timeZone: "Asia/Manila",
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
        });
      }

      if (timestamp instanceof Date) {
        return timestamp.toLocaleString("en-US", {
          timeZone: "Asia/Manila",
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
        });
      }
    }

    if (typeof timestamp === "string") return timestamp;

    return "-";
  };


  const getTimestampMs = (timestamp) => {
    if (!timestamp) return 0;

    if (typeof timestamp === "object" && timestamp !== null) {
      const secs = timestamp.seconds || timestamp._seconds;
      const nano = timestamp.nanoseconds || timestamp._nanoseconds || 0;

      if (typeof secs === "number") {
        return secs * 1000 + nano / 1000000;
      }

      if (timestamp instanceof Date) {
        return timestamp.getTime();
      }
    }

    if (typeof timestamp === "string") {
      return new Date(timestamp).getTime();
    }

    return 0;
  };

  // Filter and pagination logic
  const filtered = referralData.filter(
    (ref) =>
      (ref.status === 'Resolved' || ref.status === 'Cancelled') &&
      (
        ref.referredBy?.toLowerCase().includes(search.toLowerCase()) ||
        ref.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        ref.id?.toLowerCase().includes(search.toLowerCase())
      )
  );

  const sorted = filtered.sort((a, b) => getTimestampMs(b.feedBackDate) - getTimestampMs(a.feedBackDate));

  const totalRows = sorted.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const pagedReferrals = sorted.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Table rows
  const displayReferralTable = () => {
    if (!pagedReferrals.length > 0) {
      return <tr>
        <td colSpan="7" className="text-center py-4 text-gray-500">
          No referral history forms found.
        </td>
      </tr>
    }
    return pagedReferrals.map((referrals) => (
      <tr
        key={referrals.id}
        className="hover:bg-gray-100 transition cursor-pointer"
        onClick={() => setSelectedReferral(referrals)}
      >
        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-semibold text-[#0172bd] w-1/4">{referrals.referredBy}</td>
        <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{referrals.employeeID}</td>
        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 break-words max-w-[150px] truncate align-middle">{referrals.reasonForReferral}</td>
        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3">{referrals.studentName}</td>
        <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{formatDate(referrals.feedBackDate)}</td>
        <td className={`px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto font-semibold ${referrals.status === 'Resolved' ? 'text-green-600' : 'text-red-600'
          }`}>
          {referrals.status}
        </td>
        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedReferral(referrals);
            }}
            className="bg-[#0172bd] text-white font-semibold px-3 sm:px-4 py-1 rounded-lg hover:bg-blue-500 transition w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
          >
            Open
          </button>
        </td>
      </tr>
    ));
  };

  // Modal
  const displayReferralData = () => {
    if (!selectedReferral) return null;
    return (
      <div className="fixed inset-0 p-2 bg-black/40 flex items-center justify-center z-50 transition-opacity duration-300 ease-out opacity-100">
        <div className="bg-white w-full sm:max-w-350 lg:max-w-400 rounded-lg shadow-lg overflow-y-auto max-h-[92vh] p-6 sm:p-8 relative transform transition-all duration-300 ease-out scale-100 custom-scrollbar">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#0172bd]">Referral Form</h2>

            <div className="flex items-center gap-4">
              <span
                className={`font-semibold text-lg ${selectedReferral.status === 'Resolved' ? 'text-[#28a745]' : 'text-gray-500'}`}
              >
                Status: {selectedReferral.status}
              </span>

              <button
                onClick={() => setSelectedReferral(null)}
                className="text-[#0172bd] hover:text-blue-500 transition-transform hover:scale-110 cursor-pointer"
              >
                <X className="w-10 h-10 object-cover rounded" />
              </button>
            </div>
          </div>
          <hr className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Left Column */}
            <div className="space-y-3">
              <p><span className="font-bold text-[#0172bd]">School Year:</span> {selectedReferral.schoolYear || "-"}</p>
              <p><span className="font-bold text-[#0172bd]">Grade Level:</span> {selectedReferral.gradeLevel || "-"}</p>
              <p><span className="font-bold text-[#0172bd]">Student Number:</span> {selectedReferral.sid || "-"}</p>
              <p><span className="font-bold text-[#0172bd]">Student’s Name:</span> {selectedReferral.studentName || "-"}</p>
              <p><span className="font-bold text-[#0172bd]">Program and Section:</span> {selectedReferral.program || "-"}</p>
              <p><span className="font-bold text-[#0172bd]">Gender:</span> {selectedReferral.gender || "-"}</p>
              <p><span className="font-bold text-[#0172bd]">Referred By:</span> {selectedReferral.referredBy || "-"}</p>
              <p><span className="font-bold text-[#0172bd]">Level of Priority:</span> {selectedReferral.levelOfPriority || "-"}</p>
              <p><span className="font-bold text-[#0172bd]">Category:</span> {selectedReferral.counselingTypeCategory || "-"}</p>
              <p><span className="font-bold text-[#0172bd]">Violation:</span> {selectedReferral.violation || "-"}</p>
              <p><span className="font-bold text-[#0172bd]">Prepared Date:</span> {formatDate(selectedReferral.preparedDate) || "-"}</p>
              <p><span className="font-bold text-[#0172bd]">Feedback Date:</span> {formatDate(selectedReferral.feedBackDate) || "-"}</p>

            </div>
            {/* Right Column */}
            <div className="space-y-3">

              <div>
                <p className="font-bold text-[#0172bd]">Actions Taken before Referral:</p>
                <textarea
                  readOnly
                  value={selectedReferral.actionTaken || ""}
                  className="w-full border border-gray-300 rounded p-2 mt-1 resize-none bg-gray-50"
                  rows={3}
                />
              </div>
              <div>
                <p className="font-bold text-[#0172bd]">Reasons for Referral / Comments:</p>
                <textarea
                  readOnly
                  value={selectedReferral.reasonForReferral || ""}
                  className="w-full border border-gray-300 rounded p-2 mt-1 resize-none bg-gray-50"
                  rows={3}
                />
              </div>

              <p className="font-bold text-[#0172bd]">Counselor’s Initial Action:</p>
              <textarea
                readOnly
                value={selectedReferral.initialAction || ""}
                className="w-full border border-gray-300 rounded p-2 resize-none bg-gray-50"
                rows={10}
              />

            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingDots />
  }

  return (
    <div className="bg-gray-100 h-full p-3">
      <div className="bg-white shadow-md p-4 rounded-lg h-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="text-left">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(-1)}
                  style={{ cursor: 'pointer' }}
                  className='flex items-top justify-top hover:bg-gray-300 transition duration-200 rounded cursor-pointer'
                >
                  <ChevronLeft className="w-10 h-10 object-cover rounded text-[#0172bd] " />
                </button>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0172bd] mb-2">Referral Forms History</p>
              </div>
              <p className="text-gray-500 text-sm sm:text-base ">View Resolved Referral Forms</p>
            </div>
          </div>
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Name/ ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
              />
              <span className="absolute right-3 top-3 text-gray-400">
                <Search className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-y-auto custom-scrollbar h-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0172bd] text-white">
                <th className="sticky top-0 bg-[#0172bd] px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Name</th>
                <th className="sticky top-0 bg-[#0172bd] px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto font-bold whitespace-nowrap">Employee No.</th>
                <th className="sticky top-0 bg-[#0172bd] px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Violation</th>
                <th className="sticky top-0 bg-[#0172bd] px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Referred Student</th>
                <th className="sticky top-0 bg-[#0172bd] px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto font-bold whitespace-nowrap">Processed Date</th>
                <th className="sticky top-0 bg-[#0172bd] px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto font-bold whitespace-nowrap">Status</th>
                <th className="sticky top-0 bg-[#0172bd] px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold"></th>
              </tr>
            </thead>
            <tbody>
              {displayReferralTable()}
            </tbody>

          </table>

          <div>{displayReferralData()}</div>

        </div>
        {/* Pagination controls */}
        <div className="w-full flex justify-center lg:justify-end items-center mt-2 pr-0 lg:pr-2">
          <nav className="flex items-center space-x-1">
            <button
              className="px-2 py-1 rounded hover:bg-gray-200 text-[#0172bd] font-bold cursor-pointer"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-5 h-5 object-cover rounded" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-2 py-1 rounded ${currentPage === i + 1 ? 'bg-[#0172bd] text-white' : 'hover:bg-gray-200 text-[#0172bd] cursor-pointer'}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-2 py-1 rounded hover:bg-gray-200 text-[#0172bd] font-bold cursor-pointer"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-5 h-5 object-cover rounded" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default ReferralFormHistory;