import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from '../../../AuthProvider.jsx';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import historyW from "../../../assets/history.png";
import closeB from "../../../assets/closeblack.png";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ReferralFormProcessing() {
  const { authData, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [display, setDisplay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [referralData, setReferralData] = useState([]);

  const [selectedReferral, setSelectedReferral] = useState(null);

  const [search, setSearch] = useState("");

  // For email
  const [counselorNote, setCounselorNote] = useState();
  const [emailTo, setEmailTo] = useState();
  const [emailSubject, setEmailSubject] = useState();
  const [emailBody, setEmailBody] = useState();

  useEffect(() => {
    const fetchReferrals = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get("/referral/getAll");
        setReferralData(res.data);
      } catch (err) {
        console.error("Error fetching list:", err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReferrals();
  }, []);

  const openForm = async (ref) => {
    console.log(ref)
    setSelectedReferral(ref);
    setDisplay(true);
    setCounselorNote(ref.counselorNote || "");
    setEmailTo(ref.email || "");
    setEmailSubject("Referral Submission");
    setEmailBody("Your submitted referral status has been updated");
  };

  const closeForm = () => {
    setDisplay(false); // Hide the modal
    setSelectedReferral(null); // Clear the selected referral data
  };
  const handleUpdate = async (newStatus) => {
    try {
      const updatedData = {
        ...selectedReferral,
        // counselorNote: counselorNote,
        status: newStatus,
      };

      const emailData = {
        to: emailTo,
        subject: emailSubject,
        text: emailBody
      }

      await axios.put(`/referral/update/${selectedReferral.id}`, updatedData);
      await axios.post(`/email/send`, emailData);

      // Refresh the list of referrals
      const response = await axios.get(`/referral/getAll`);
      setReferralData(response.data);

      closeForm();
      toast.success(`Referral status updated to "${newStatus}"!`);
    } catch (error) {
      console.error("Error updating referral:", error);
      toast.error("Error updating referral.");
    }
  };


  // filter logic stays the same
  const filtered = referralData.filter(
    (ref) =>
      ref.referredBy?.toLowerCase().includes(search.toLowerCase()) ||
      ref.studentName?.toLowerCase().includes(search.toLowerCase())
  );

  if (!authData?.user?.access?.referralForm?.canView) {
        return <Navigate to="/error401" replace />
    }

  return (
    <div className="bg-gray-100 h-full p-2 sm:p-4">
      <ToastContainer position="top-right" autoClose={4000} />
      <div className="bg-white shadow-md p-2 sm:p-4 rounded-lg overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-2 sm:gap-4">
          <div className="text-left">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">Referral Form Processing</p>
            <p className="text-gray-500 text-sm sm:text-base">View pending Referral Forms</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            {authData?.user?.access?.referralForm?.canEdit && (
              <button
                className="flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition w-full sm:w-auto"
                onClick={() => navigate("/guidance/referral-form-history")}
              >
                History
                <img src={historyW} alt="history" className="w-5 h-5 object-cover rounded" />
              </button>
            )}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Name/ ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <span className="absolute right-3 top-3 text-gray-400">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto custom-scrollbar h-[70vh]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="sticky top-0 z-10 bg-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Name</th>
                <th className="sticky top-0 z-10 px-0 py-0 text-[0px] bg-gray-300 w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Employee No.</th>
                <th className="sticky top-0 z-10 bg-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Reason</th>
                <th className="sticky top-0 z-10 bg-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Student</th>
                <th className="sticky top-0 z-10 px-0 py-0 text-[0px] bg-gray-300 w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Date</th>
                <th className="sticky top-0 z-10 px-0 py-0 text-[0px] bg-gray-300 w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Status</th>
                <th className="sticky top-0 z-10 bg-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered
                  .filter((ref) => ref.status !== 'Resolved')
                  .map((ref) => (
                    <tr key={ref.id} className="hover:bg-gray-100 transition">
                      <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:whitespace-nowrap">{ref.referredBy}</td>
                      <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{ref.employeeID}</td>
                      <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 whitespace-normal break-words max-w-[150px]">{ref.reasonForReferral}</td>
                      <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:whitespace-nowrap">{ref.studentName}</td>
                      <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{ref.date}</td>
                      <td className={`px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto font-semibold ${
                        ref.status === 'Resolved' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {ref.status}
                      </td>
                      {authData?.user?.access?.referralForm?.canEdit && (
                        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3">
                          <button
                            className="bg-gray-900 text-white px-3 sm:px-4 py-1 rounded-full hover:bg-gray-700 transition w-full sm:w-auto"
                            onClick={() => openForm(ref)}
                          >
                            Open
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
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
      </div>

      {/* Modal - Responsive */}
      {display && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ease-out opacity-100">
          <div className="bg-white w-full max-w-[98vw] sm:max-w-3xl lg:max-w-4xl rounded-lg shadow-lg overflow-y-auto max-h-[92vh] p-6 sm:p-8 relative transform transition-all duration-300 ease-out scale-100 custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Referral Form</h2>
              <div className="flex items-center gap-4">
                {selectedReferral && (
                  <span
                    className={`font-semibold text-lg ${selectedReferral.status === 'Resolved' ? 'text-green-600' : 'text-orange-500'}`}
                  >
                    Status: {selectedReferral.status}
                  </span>
                )}
                <button
                  onClick={closeForm}
                  className="text-gray-700 hover:text-black transition-transform hover:scale-110"
                >
                  <img src={closeB} alt="closeb" className="w-7 h-7 object-cover rounded " />
                </button>
              </div>
            </div>
            <hr className="mb-4 border-gray-300" />

            {selectedReferral ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
                {/* Left Column */}
                <div className="space-y-4">
                  <p>
                    <strong className="text-gray-700">School Year:</strong>{" "}
                    <span className="text-gray-600">{selectedReferral.schoolYear || "-"}</span>
                  </p>
                  <p>
                    <strong className="text-gray-700">Grade Level:</strong>{" "}
                    <span className="text-gray-600">{selectedReferral.gradeLevel || "-"}</span>
                  </p>
                  <p>
                    <strong className="text-gray-700">Student Number:</strong>{" "}
                    <span className="text-gray-600">{selectedReferral.sid || "-"}</span>
                  </p>
                  <p>
                    <strong className="text-gray-700">Student’s Name:</strong>{" "}
                    <span className="text-gray-600">{selectedReferral.studentName || "-"}</span>
                  </p>
                  <p>
                    <strong className="text-gray-700">Program and Section:</strong>{" "}
                    <span className="text-gray-600">{selectedReferral.program || "-"}</span>
                  </p>
                  <p>
                    <strong className="text-gray-700">Gender:</strong>{" "}
                    <span className="text-gray-600">{selectedReferral.gender || "-"}</span>
                  </p>
                  <p>
                    <strong className="text-gray-700">Age:</strong>{" "}
                    <span className="text-gray-600">{selectedReferral.age || "-"}</span>
                  </p>
                  <p>
                    <strong className="text-gray-700">Referred By:</strong>{" "}
                    <span className="text-gray-600">{selectedReferral.referredBy || "-"}</span>
                  </p>
                  <p>
                    <strong className="text-gray-700">Areas of Concern:</strong>{" "}
                    <span className="text-gray-600">{selectedReferral.areasOfConcern || "-"}</span>
                  </p>
                  <p>
                    <strong className="text-gray-700">Action Required:</strong>{" "}
                    <span className="text-gray-600">{selectedReferral.actionRequired || "-"}</span>
                  </p>
                  <p>
                    <strong className="text-gray-700">Level of Priority:</strong>{" "}
                    <span className="text-gray-600">{selectedReferral.levelOfPriority || "-"}</span>
                  </p>

                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Actions Taken before Referral:</p>
                    <textarea
                      readOnly
                      value={selectedReferral.actionTaken || ""}
                      className="w-full border border-gray-300 rounded-md p-3 mt-1 resize-none bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
                      rows={3}
                    />
                  </div>

                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Reasons for Referral / Comments:</p>
                    <textarea
                      readOnly
                      value={selectedReferral.reasonForReferral || ""}
                      className="w-full border border-gray-300 rounded-md p-3 mt-1 resize-none bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
                      rows={3}
                    />
                  </div>
                </div>
                {/* Right Column */}
                <div className="space-y-4">
                  <p className="font-semibold text-gray-700 mb-1">Counselor’s Initial Action:</p>
                  <textarea
                    readOnly
                    value={selectedReferral.initialAction || ""}
                    className="w-full border border-gray-300 rounded-md p-3 resize-none bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
                    rows={10}
                  />

                  {/* Email / Update Section */}
                  <div className="mt-6 space-y-4">
                    <p className="font-semibold text-gray-700">Counselor's Note:</p>
                    <textarea
                      className="w-full border border-gray-300 rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                      rows={3}
                      placeholder="Add notes here..."
                      value={counselorNote}
                      onChange={(e) => { setCounselorNote(e.target.value) }}
                    />

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <p className="font-bold text-gray-800 flex-shrink-0">Send Email To:</p>
                        <input
                          type="text"
                          placeholder=" "
                          className="flex-grow border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                          value={emailTo}
                          onChange={(e) => { setEmailTo(e.target.value) }}
                        />
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <p className="font-bold text-gray-800 flex-shrink-0">Subject:</p>
                        <input
                          type="text"
                          placeholder="Referral Form Update"
                          className="flex-grow border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                          value={emailSubject}
                          onChange={(e) => { setEmailSubject(e.target.value) }}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-gray-800 mb-1">Body:</p>
                      <textarea
                        placeholder="Please proceed to the Guidance and Counseling Office"
                        className="w-full border border-gray-300 rounded-md p-2 resize-y focus:outline-none focus:ring-2 focus:ring-blue-300"
                        rows={5}
                        value={emailBody}
                        onChange={(e) => { setEmailBody(e.target.value) }}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      <button
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-200 shadow-md"
                        onClick={() => handleUpdate("In Progress")}
                      >
                        Update
                      </button>
                      <button
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition duration-200 shadow-md"
                        onClick={() => handleUpdate("Resolved")}
                      >
                        Solved
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
    </div>
  );
}

export default ReferralFormProcessing;