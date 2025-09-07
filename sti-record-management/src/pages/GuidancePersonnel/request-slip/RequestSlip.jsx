import react, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import RequestSlipHistory from "./RequestSlipHistory.jsx";
import axios from "axios";
import historyW from "../../../assets/history.png";
import closeB from "../../../assets/closeblack.png";
import closeW from "../../../assets/close.png";
import checkW from "../../../assets/check.png";
import { AuthContext } from '../../../AuthProvider.jsx';

// palagyan ng CSS
function RequestSlip() {
  const [display, setDisplay] = useState(false);
  const [allSlipData, setAllSlipData] = useState([]);
  const [search, setSearch] = useState("");
  const { authData, logout } = useContext(AuthContext);


  const navigate = useNavigate();

  // holds the slip details when “Open” is clicked
  const [selectedSlip, setSelectedSlip] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/slip/allSlips");

        const allSlips = res.data.map((slip) => ({
          ...slip,
        }));

        setAllSlipData(allSlips);
      } catch (error) {
        console.error("Error fetching slip data:", error.message);
      }
    };

    fetchData();
  }, []);

  // open modal and fetch single slip details
  const openSlip = (id) => {
    const foundSlip = allSlipData.find((slip) => slip._id === id);
    if (foundSlip) {
      setSelectedSlip(foundSlip);
      setDisplay(true);
    } else {
      console.error("Slip not found in local data");
    }
  };

  // close modal & clear selected data
  const closeModal = () => {
    setDisplay(false);
    setSelectedSlip(null);
  };


  const displaySlipForm = () => {
    if (!display || !selectedSlip) return null;

    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="relative bg-white w-full max-w-[95vw] sm:max-w-xl lg:max-w-2xl rounded-lg shadow-xl p-4 sm:p-6 overflow-y-auto max-h-[90vh] animate-fadeIn custom-scrollbar outline-solid outline-2 outline-gray-300">
          {/* header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Request Slip Form</h2>
              <span className="px-3 py-2 bg-gray-100 text-gray-800 text-md font-medium rounded">
                {selectedSlip.typeOfSlip}
              </span>
            </div>
            <button
              onClick={closeModal}
              className="text-2xl text-gray-700 hover:text-black"
            >
              <img src={closeB} alt="closeb" className="w-7 h-7 object-cover rounded " />
            </button>
          </div>
          <hr className="mb-4" />

          {/* Responsive grid: stack on mobile, side-by-side on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            {/* LEFT PANEL */}
            <div className="space-y-6">
              <div className="space-y-2">
                {/* Info Section */}
                {[
                  { label: "Name: ", value: selectedSlip.name },
                  { label: "Program: ", value: selectedSlip.program },
                  { label: "Year & Section: ", value: selectedSlip.yearSection || "4A" },
                  { label: "Email: ", value: selectedSlip.email },
                  {
                    label: "Status: ",
                    value: selectedSlip.status,
                    className:
                      selectedSlip.status === "Approved"
                        ? "text-green-600 font-bold"
                        : selectedSlip.status === "Rejected"
                          ? "text-red-600 font-bold"
                          : "text-gray-600 font-bold",
                  },
                  { label: "Reason: ", value: selectedSlip.reason },
                  { label: "Days Absent: ", value: selectedSlip.daysAbsent },
                ].map((item, i) => (
                  <div key={i} className="flex items-center flex-wrap">
                    <p className="font-bold text-gray-600 mr-5">{item.label}</p>
                    <p className={`font-semibold ${item.className || "text-black"} break-all`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              {/* Attachments Section */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  "Excuse Letter / Medical Certificate",
                  "Guardian’s ID Front",
                  "Guardian’s ID Back",
                ].map((label, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 border border-gray-300 flex items-center justify-center hover:shadow-md transition">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 7l9 6 9-6-9-6-9 6zm0 7l9 6 9-6"
                        />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600 mt-2 text-center">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Send Email To</label>
                <input
                  type="text"
                  value={selectedSlip.email}
                  className="border rounded px-3 py-2 w-full text-xs sm:text-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  defaultValue="Requested Slip Form Status"
                  className="border rounded px-3 py-2 w-full text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Body</label>
                <textarea
                  defaultValue="Please proceed to the Guidance and Counseling Office"
                  className="border rounded px-3 py-2 w-full h-20 sm:h-24 resize-none text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons: always at the bottom, full width on mobile */}
          <div className="flex flex-col sm:flex-row gap-2 pt-6">
            <button className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
              Deny
              <img src={closeW} alt="closeW" className="w-4 h-4 object-cover rounded " />
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
              Approve
              <img src={checkW} alt="checkW" className="w-4 h-4 object-cover rounded " />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Filtered data for search
  const filteredSlipData = allSlipData.filter(
    (slip) =>
      slip.name?.toLowerCase().includes(search.toLowerCase()) ||
      slip.sid?.toLowerCase().includes(search.toLowerCase())
  );

  // data na iloload sa table
  const requestTable = filteredSlipData.map((slips) => (
    <tr key={slips._id} className="hover:bg-gray-100 transition">
      <td className="px-4 py-3">{slips.name}</td>
      <td className="px-4 py-3">{slips.sid}</td>
      <td className="px-4 py-3">{slips.typeOfSlip}</td>
      <td className="px-4 py-3">{slips.Date}</td>
      {/* STATUS with conditional styling */}
      <td
        className={`px-4 py-3 font-semibold ${slips.status === "Approved"
          ? "text-green-600"
          : slips.status === "Rejected"
            ? "text-red-600"
            : "text-gray-600"
          }`}
      >
        {slips.status}
      </td>
      <td className="px-4 py-3">{slips.reason}</td>
      <td className="px-4 py-3">{slips.attachmentCount}</td>
      {authData?.user?.access?.requestSlip?.canEdit ? <td className="px-4 py-3">
        <button
          className="bg-gray-900 text-white px-6 py-1 rounded-full hover:bg-gray-700 transition"
          onClick={() => openSlip(slips._id)}>
          Open
        </button>
      </td> : null}
    </tr>
  ));

  if (!authData?.user?.access?.requestSlip?.canView) {
    return <Navigate to="/error401" replace />
  }

  // Palagyan ng CSS papalit din ng html kung kinakailangan
  return (
    <div className="bg-gray-100 h-full p-3">
      <div className="bg-white shadow-md p-4 rounded-lg overflow-y-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3">
          <div className="text-left">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">Request Slip Processing</p>
            <p className="text-gray-500 text-sm sm:text-base ">Approve/ Deny Request Slips.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            {/* History button */}
            {authData?.user?.access?.requestSlip?.canEdit && (
              <button
                className="flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition w-full sm:w-auto"
                onClick={() => navigate("/guidance/request-slip-history")}
              >
                History
                <img src={historyW} alt="history" className="w-5 h-5 object-cover rounded" />
              </button>
            )}

            {/* Search Bar */}
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

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto custom-scrollbar h-[70vh]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-gray-700">
                <th className="sticky top-0 z-10 bg-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Name</th>
                <th className="sticky top-0 z-10 px-0 py-0 text-[0px] bg-gray-300 w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Student No.</th>
                <th className="sticky top-0 z-10 bg-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Type of Slip</th>
                <th className="sticky top-0 z-10 px-0 py-0 text-[0px] bg-gray-300 w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Date</th>
                <th className="sticky top-0 z-10 px-0 py-0 text-[0px] bg-gray-300 w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Status</th>
                <th className="sticky top-0 z-10 bg-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-bold">Reason</th>

                {/* Shrunk columns for small/tablet */}
                <th className="sticky top-0 z-10 px-0 py-0 text-[0px] bg-gray-300 w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">Attachments</th>

                <th className="sticky top-0 z-10 bg-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredSlipData.map((slips) => (
              <tr key={slips._id} className="hover:bg-gray-100 transition">
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:whitespace-nowrap">{slips.name}</td>
                <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{slips.sid}</td>
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:whitespace-nowrap">{slips.typeOfSlip}</td>
                <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{slips.Date}</td>
                <td
                  className={`px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto font-semibold ${
                    slips.status === "Approved"
                      ? "text-green-600"
                      : slips.status === "Rejected"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {slips.status}
                </td>
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 whitespace-normal break-words max-w-[150px]">{slips.reason}</td>

                {/* Shrunk columns */}
                
                
                <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto">{slips.attachmentCount}</td>

                {authData?.user?.access?.requestSlip?.canEdit && (
                  <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3">
                    <button
                      className="bg-gray-900 text-white px-3 sm:px-4 py-1 rounded-full hover:bg-gray-700 transition w-full sm:w-auto"
                      onClick={() => openSlip(slips._id)}
                    >
                      Open
                    </button>
                  </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    {displaySlipForm()}
  </div>

      );
}

export default RequestSlip;