import { useState, useEffect, useContext } from "react";
import { AuthContext } from '../../../AuthProvider.jsx';
import { useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import LoadingDots from "../../../component/Loading.jsx";
import 'react-toastify/dist/ReactToastify.css';
import {
  Search,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileEdit
} from 'lucide-react';
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseClient.js";

const PRIORITY_LEVELS = [
  { value: "0", label: "No Priority" },
  { value: "1", label: "Level 1" },
  { value: "2", label: "Level 2" },
  { value: "3", label: "Level 3" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "Pending", label: "Pending" },
  { value: "In Progress", label: "In Progress" },
];

// Add sort options
const SORT_OPTIONS = [
  { value: "oldest", label: "Oldest First" },
  { value: "newest", label: "Newest First" },
];

function ReferralFormProcessing() {
  const { authData, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [display, setDisplay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateToastId, setUpdateToastId] = useState(null);


  const [showRedirectPrompt, setShowRedirectPrompt] = useState(false);
  const [resolvedReferralData, setResolvedReferralData] = useState(null);

  const [referralData, setReferralData] = useState([]);

  const [selectedReferral, setSelectedReferral] = useState(null);

  const [search, setSearch] = useState("");

  // Editable Fields
  const [priorityLevel, setPriorityLevel] = useState();
  const [action, setAction] = useState();
  const [counselorNote, setCounselorNote] = useState();
  const [remarks, setRemarks] = useState();
  const [emailTo, setEmailTo] = useState();
  const [emailSubject, setEmailSubject] = useState();
  const [emailBody, setEmailBody] = useState();

  const ROW_COLOR_CLASSES = {
    RED: "bg-red-100",
    YELLOW: "bg-yellow-100",
    BLUE: "bg-blue-100",
    WHITE: "bg-white",
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      });
    }
    if (typeof timestamp === "string") return timestamp;
    return "-";
  };

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // FILTER STATE
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [sortBy, setSortBy] = useState("oldest"); // <-- Add sort state

  // For Color Indicator
  const toMillisSafe = (input) => {
    if (!input) return null;

    if (typeof input === "number") return input > 1e12 ? input : input * 1000;
    if (input instanceof Date) return input.getTime();

    if (typeof input === "object" && typeof input.toDate === "function") {
      try { return input.toDate().getTime(); } catch { }
    }

    if (typeof input === "object" && (input.seconds !== undefined || input._seconds !== undefined)) {
      const sec = Number(input.seconds ?? input._seconds ?? 0);
      const ns = Number(input.nanoseconds ?? input._nanoseconds ?? 0);
      return sec * 1000 + Math.floor(ns / 1e6);
    }

    if (typeof input === "string") {
      const parsed = Date.parse(input);
      if (!isNaN(parsed)) return parsed;
    }

    return null;
  };

  const getDateDifference = (dateInput) => {
    const ms = toMillisSafe(dateInput);
    if (!ms) return 0;
    const diff = Date.now() - ms;
    if (diff < 0) return 0;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getRowColor = (days) => {
    if (days >= 8) return ROW_COLOR_CLASSES.RED;
    if (days >= 4 && days <= 7) return ROW_COLOR_CLASSES.YELLOW;
    if (days >= 1 && days <= 3) return ROW_COLOR_CLASSES.BLUE;
    return ROW_COLOR_CLASSES.WHITE;
  };


  useEffect(() => {
    setIsLoading(true);

    const unsubscribe = onSnapshot(
      collection(db, "referralForm"),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReferralData(list);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching referral list:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const openForm = async (ref) => {
    console.log(ref);
    setPriorityLevel(ref.levelOfPriority);
    setSelectedReferral(ref);
    setDisplay(true);
    setCounselorNote(ref.counselorNote || "");
    setRemarks(ref.remarks || "");
    setEmailTo(ref.email || "");
    setEmailSubject("Referral Submission");
    setAction(ref.initialAction || "")
    setEmailBody("Your submitted referral status has been updated");
  };

  const closeForm = () => {
    setDisplay(false); // Hide the modal
    setSelectedReferral(null); // Clear the selected referral data
  };
  const handleUpdate = async (newStatus) => {
    if (!selectedReferral) return;

    setIsUpdating(true);

    const toastId = toast.loading("Updating referral — please wait...");

    try {
      const { initialAction, preparedDate, feedBackDate, levelOfPriority, ...data } = selectedReferral;

      const updatedData = {
        ...data,
        levelOfPriority: priorityLevel,
        counselorNote: counselorNote,
        remarks: remarks,
        initialAction: action,
        status: newStatus,
        name: authData?.user?.displayName ?? "Admin",
        uid: selectedReferral.employeeID,
        receivedBy: authData?.user?.displayName ?? "Admin",
      };

      const emailData = {
        to: emailTo,
        subject: emailSubject,
        text: emailBody,
      };

      await axios.put(`/referral/update/${selectedReferral.id}`, updatedData);
      await axios.post(`/email/send`, emailData);

      closeForm();

      // ✅ Update toast to success
      toast.update(toastId, {
        render: `Referral status updated to "${newStatus}"!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });

      if (newStatus === "Resolved") {
        setResolvedReferralData(selectedReferral);
        setShowRedirectPrompt(true);
      }
    } catch (error) {
      console.error("Error updating referral:", error);

      // ✅ Update toast to error (using the same toastId)
      toast.update(toastId, {
        render: "Error updating referral.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
        closeOnClick: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };



  // filter logic with status and priority
  const filtered = referralData.filter(
    (ref) =>
      (filterStatus === "" || ref.status === filterStatus) &&
      (filterPriority === "" || ref.priority === filterPriority) &&
      (
        ref.referredBy?.toLowerCase().includes(search.toLowerCase()) ||
        ref.studentName?.toLowerCase().includes(search.toLowerCase())
      )
  );

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    const aDate = new Date(a.preparedDate || a.createdAt || 0).getTime();
    const bDate = new Date(b.preparedDate || b.createdAt || 0).getTime();
    if (sortBy === "newest") {
      return bDate - aDate;
    } else {
      return aDate - bDate;
    }
  });

  // Remove resolved from display
  const filteredPending = sorted.filter(
    (ref) => ref.status !== 'Resolved' && ref.status !== 'Cancelled'
  );
  const totalRows = filteredPending.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const pagedReferrals = filteredPending.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (!authData?.user?.access?.referralForm) {
    return <Navigate to="/error401" replace />
  }

  if (isLoading) {
    return <LoadingDots />
  }

  return (
    <div className="bg-gray-100 h-full p-3">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="bg-white shadow-md p-4 rounded-lg overflow-y-auto h-full">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <FileEdit className="h-10 w-10 text-[#0172bd]" />
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0172bd] mb-2">Referral Form Processing</p>
            </div>

            <p className="text-gray-500 text-sm sm:text-base">View pending Referral Forms</p>
          </div>

          {/* Legend */}
          {/* Color Legend */}
          <div className="flex gap-4 items-center mb-3">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-100 border border-gray-400"></div>
              <span className="text-sm text-gray-600">More than 7 days</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-100 border border-gray-400"></div>
              <span className="text-sm text-gray-600">4 - 6 days</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blue-100 border border-gray-400"></div>
              <span className="text-sm text-gray-600">1 - 3 days</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-white border border-gray-400"></div>
              <span className="text-sm text-gray-600">Today</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            {/* History Button */}
            {authData?.user?.access?.referralForm && (
              <button
                className="flex items-center justify-center gap-2 bg-[#0172bd] text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition w-full sm:w-auto shadow-lg font-semibold"
                onClick={() => navigate("/guidance/referral-form-history")}
              >
                History
                <Clock className="w-5 h-5 object-cover rounded" />
              </button>
            )}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Name/ ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
              />
              <span className="absolute right-3 top-3 text-gray-400">
                <Search className="w-4 h-4 object-cover rounded " />
              </span>
            </div>
          </div>
        </div>

        {/* --- FILTER ROW --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-auto-fit gap-4 mb-4"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Priority Level</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
            >
              {PRIORITY_LEVELS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Sort By</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto custom-scrollbar h-auto relative">
          <table className="w-full text-left">
            <thead>
              <tr className="text-white">
                <th className="sticky bg-[#0172bd] top-0 z-10 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Name</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-0 py-0 text-[0px]  w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Employee No.</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Reason</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Student</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-0 py-0 text-[0px]  w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Date</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-0 py-0 text-[0px]  w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Status</th>
                <th className="sticky bg-[#0172bd] top-0 z-10 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold"></th>
              </tr>
            </thead>
            <tbody>
              {pagedReferrals.length > 0 ? (
                pagedReferrals.map((ref) => {
                  const days = getDateDifference(ref.preparedDate || ref.createdAt);
                  const rowBgClass = getRowColor(days);
                  return (
                    <tr
                      key={ref.id}
                      className={`border-b transition-colors duration-150 ${rowBgClass} hover:brightness-95`}
                    >
                      <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:whitespace-nowrap font-semibold w-1/4">
                        {ref.referredBy}
                      </td>
                      <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{ref.employeeID}</td>
                      <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 break-words max-w-[120px] truncate align-middle">{ref.reasonForReferral}</td>
                      <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:whitespace-nowrap">{ref.studentName}</td>
                      <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{formatDate(ref.preparedDate)}</td>
                      <td className={`px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto font-semibold ${ref.status === 'Resolved' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                        {ref.status}
                      </td>
                      {authData?.user?.access?.referralForm && (
                        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3">
                          <button
                            className="bg-[#0172bd] text-white font-semibold px-3 sm:px-4 py-1 rounded-lg hover:bg-blue-500 transition w-full sm:w-auto"
                            onClick={() => openForm(ref)}
                          >
                            Open
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    No pending referral forms found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>


        </div>
        {/* Pagination controls - OUTSIDE the scrollable table */}
        <div className="w-full flex justify-center lg:justify-end items-center mt-2 pr-0 lg:pr-2">
          <nav className="flex items-center space-x-1">
            <button
              className="px-2 py-1 rounded hover:bg-gray-200 text-[#0172bd] font-bold"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-5 h-5 object-cover rounded" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-2 py-1 rounded ${currentPage === i + 1 ? 'bg-[#0172bd] text-white' : 'hover:bg-gray-200 text-[#0172bd]'}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-2 py-1 rounded hover:bg-gray-200 text-[#0172bd] font-bold"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-5 h-5 object-cover rounded" />
            </button>
          </nav>
        </div>
      </div>

      {/* Modal - Responsive */}
      {display && (
        <div className="fixed inset-0 p-2 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-opacity duration-300 ease-out opacity-100">
          <div className="bg-white w-full sm:max-w-350 lg:max-w-400 rounded-lg shadow-lg overflow-y-auto max-h-[92vh] p-6 sm:p-8 relative transform transition-all duration-300 ease-out scale-100 custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#0172bd]">Referral Form</h2>

              <div className="flex items-center gap-4">

                {/* --- PRIORITY DROPDOWN LEFT OF STATUS --- */}
                <select
                  className="px-3 py-1 rounded-lg font-semibold text-xs sm:text-sm bg-gray-100 text-[#0172bd] hover:bg-blue-100"
                  value={priorityLevel || ""}
                  onChange={(e) => { setPriorityLevel(e.target.value) }}
                  disabled={selectedReferral?.status === "Resolved"}
                >
                  {PRIORITY_LEVELS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {/* --- STATUS --- */}
                {selectedReferral && (
                  <span
                    className={`font-semibold text-lg ${selectedReferral.status === 'Resolved' ? 'text-[#28a745]' : 'text-gray-500'}`}
                  >
                    Status: {selectedReferral.status}
                  </span>
                )}
                <button
                  onClick={closeForm}
                  className="text-[#0172bd] transition-transform hover:scale-110 hover:text-blue-500"
                >
                  <X className="w-10 h-10 object-cover rounded " />
                </button>
              </div>
            </div>
            <hr className="mb-4" />

            {selectedReferral ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-sm">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Info fields in two-column grid, keeping order */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 border border-gray-300 p-2 rounded-md">

                    <p>
                      <strong className="text-[#0172bd]">School Year:</strong>{" "}
                      <span className="text-black">{selectedReferral.schoolYear || "-"}</span>
                    </p>
                    <p>
                      <strong className="text-[#0172bd]">Gender:</strong>{" "}
                      <span className="text-black">{selectedReferral.gender || "-"}</span>
                    </p>

                    <p>
                      <strong className="text-[#0172bd]">Grade Level:</strong>{" "}
                      <span className="text-black">{selectedReferral.gradeLevel || "-"}</span>
                    </p>
                    <p>
                      <strong className="text-[#0172bd]">Referred By:</strong>{" "}
                      <span className="text-black">{selectedReferral.referredBy || "-"}</span>
                    </p>

                    <p>
                      <strong className="text-[#0172bd]">Student Number:</strong>{" "}
                      <span className="text-black">{selectedReferral.sid || "-"}</span>
                    </p>

                    <p>
                      <strong className="text-[#0172bd]">Student’s Name:</strong>{" "}
                      <span className="text-black">{selectedReferral.studentName || "-"}</span>
                    </p>

                    <p>
                      <strong className="text-[#0172bd]">Program and Section:</strong>{" "}
                      <span className="text-black">{selectedReferral.program || "-"}</span>
                    </p>
                    <p>
                      <strong className="text-[#0172bd]">Level of Priority:</strong>{" "}
                      <span className="text-black">{selectedReferral.levelOfPriority || "-"}</span>
                    </p>
                    <p>
                      <strong className="text-[#0172bd]">Category:</strong>{" "}
                      <span className="text-black">{selectedReferral.counselingTypeCategory || "-"}</span>
                    </p>
                    <p>
                      <strong className="text-[#0172bd]">Violation/Case:</strong>{" "}
                      <span className="text-black">{selectedReferral.violation || "-"}</span>
                    </p>
                    <p>
                      <strong className="text-[#0172bd]">Prepared Date:</strong>{" "}
                      <span className="text-black">{formatDate(selectedReferral.preparedDate) || "-"}</span>
                    </p>
                    <p>
                      <strong className="text-[#0172bd]">Feedback Date:</strong>{" "}
                      <span className="text-black">{formatDate(selectedReferral.feedBackDate) || "-"}</span>
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-[#0172bd]">Actions Taken before Referral:</p>
                    <textarea
                      readOnly
                      value={selectedReferral.actionTaken || ""}
                      className="w-full border border-gray-300 rounded-md p-3 mt-1 resize-y bg-[#f3f4f6] text-black focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
                      rows={2}
                    />
                  </div>

                  <div>
                    <p className="font-bold text-[#0172bd]">Reasons for Referral / Comments:</p>
                    <textarea
                      readOnly
                      value={selectedReferral.reasonForReferral || ""}
                      className="w-full border border-gray-300 rounded-md p-3 mt-1 resize-y bg-[#f3f4f6] text-black focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
                      rows={2}
                    />
                  </div>

                  <p className="font-bold text-[#0172bd]">Counselor’s Initial Action:<span className="text-red-700">*</span></p>
                  <textarea
                    value={action}
                    onChange={(e) => { setAction(e.target.value) }}
                    className="w-full border border-gray-300 rounded-md p-3 mt-1 resize-y bg-[#f3f4f6] text-black focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
                    placeholder="Investigates the case, Develop an action plan, etc..."
                    rows={5}
                  />

                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Email / Update Section */}
                  <div className="space-y-4">
                    <p className="font-bold text-[#0172bd]">Counselor's Note:</p>
                    <textarea
                      className="w-full border border-gray-300 rounded-md p-3 mt-1 resize-y bg-[#f3f4f6] text-black focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
                      rows={2}
                      placeholder="Only admin can see the notes added here"
                      value={counselorNote}
                      onChange={(e) => { setCounselorNote(e.target.value) }}
                    />

                    <p className="font-bold text-[#0172bd]">Remarks:</p>
                    <textarea
                      className="w-full border border-gray-300 rounded-md p-3 mt-1 resize-y bg-[#f3f4f6] text-black focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
                      rows={2}
                      placeholder="Add remarks here..."
                      value={remarks}
                      onChange={(e) => { setRemarks(e.target.value) }}
                    />

                    <p className="font-bold text-[#0172bd] text-xl">Email Notification</p>
                    <hr />

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <p className="font-bold text-[#0172bd] flex-shrink-0">Send Email To:</p>
                        <input
                          type="text"
                          placeholder=" "
                          className="flex-grow border border-gray-300 bg-[#f3f4f6] rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={emailTo}
                          onChange={(e) => { setEmailTo(e.target.value) }}
                        />
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <p className="font-bold text-[#0172bd] flex-shrink-0">Subject:</p>
                        <input
                          type="text"
                          placeholder="Referral Form Update"
                          className="flex-grow border border-gray-300 bg-[#f3f4f6] rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={emailSubject}
                          onChange={(e) => { setEmailSubject(e.target.value) }}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-[#0172bd] mb-1">Body:</p>
                      <textarea
                        placeholder="Please proceed to the Guidance and Counseling Office"
                        className="w-full border border-gray-300 bg-[#f3f4f6] rounded-md p-2 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        value={emailBody}
                        onChange={(e) => { setEmailBody(e.target.value) }}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      <button
                        className={`flex-1 ${isUpdating ? 'opacity-60 cursor-not-allowed' : ''} bg-[#0172bd] text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition duration-200 shadow-md`}
                        onClick={() => handleUpdate("In Progress")}
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Working...' : 'Update'}
                      </button>

                      <button
                        className={`flex-1 ${isUpdating ? 'opacity-60 cursor-not-allowed' : ''} bg-[#28a745] text-white px-4 py-2 rounded-lg hover:bg-green-500 transition duration-200 shadow-md`}
                        onClick={() => handleUpdate("Resolved")}
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Working...' : 'Solved'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showRedirectPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md text-center">
            <h2 className="text-2xl font-bold text-[#0172bd] mb-4">Create Case Record?</h2>
            <p className="text-gray-700 mb-6">
              This referral has been marked as <span className="font-semibold text-green-600">Resolved</span>.<br />
              Would you like to create a case record for this referral?<br />
              You will be redirected to the Student Cases page.
            </p>

            <div className="flex justify-center gap-4">
              <button
                className="bg-[#0172bd] hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold transition"
                onClick={() => {
                  if (!resolvedReferralData) return;
                  setShowRedirectPrompt(false);
                  navigate("/guidance/student-cases", {
                    state: {
                      referralData: {
                        studentName: resolvedReferralData.studentName,
                        studentId: resolvedReferralData.sid,
                        programSection: resolvedReferralData.program,
                        counselingTypeCategory: resolvedReferralData.counselingTypeCategory,
                        violation: resolvedReferralData.violation,
                        detailedDescription: resolvedReferralData.reasonForReferral,
                        actions: resolvedReferralData.actionTaken,
                        dateOfInitiation: new Date().toISOString().split("T")[0],
                        timeOfInitiation: new Date().toTimeString().slice(0, 5),
                        dateOfAction: new Date().toISOString().split("T")[0],
                        caseStatus: "Resolved",
                      }
                    }
                  });
                }}
              >
                Yes, Continue
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg font-semibold transition"
                onClick={() => setShowRedirectPrompt(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ReferralFormProcessing;