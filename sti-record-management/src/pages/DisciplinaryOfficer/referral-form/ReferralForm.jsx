import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import historyIcon from "../../../assets/history.png";
import closeIcon from "../../../assets/closeblack.png";

function ReferralFormProcessing() {
  const navigate = useNavigate();

  // controls table vs. modal
  const [display, setDisplay] = useState(false);

  // holds the list of pending referrals
  const [referralData, setReferralData] = useState([]);

  // holds the referral object when you click Open
  const [selectedReferral, setSelectedReferral] = useState(null);

  // search filter
  const [search, setSearch] = useState("");

  // fetch list on mount
  useEffect(() => {
    axios
      .get("/referral/getAll")
      .then((res) => setReferralData(res.data))
      .catch((err) => console.error("Error fetching list:", err.message));
  }, []);

  // open the modal and fetch one referral’s details
  const openForm = async (id) => {
    setDisplay(true);
    try {
      const res = await axios.get(`/referral/get/${id}`);
      setSelectedReferral(res.data);
    } catch (err) {
      console.error("Error fetching detail:", err);
    }
  };

  // close the modal & reset
  const closeForm = () => {
    setDisplay(false);
    setSelectedReferral(null);
  };

  // filter logic stays the same
  const filtered = referralData.filter(
    (ref) =>
      ref.referredBy?.toLowerCase().includes(search.toLowerCase()) ||
      ref.studentName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-100 min-h-screen p-3">
      <div className="bg-white shadow-md p-4 rounded-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold">Referral Form Processing</h1>
          <button
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition"
            onClick={() => navigate("/disciplinary/referral-form-history")}
          >
            History
            <img
              src={historyIcon}
              alt="history"
              className="w-5 h-5 object-cover rounded"
            />
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Name / ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 border border-gray-300 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Employee No.</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ref) => (
                <tr key={ref.id} className="hover:bg-gray-100 transition">
                  <td className="px-4 py-3">{ref.referredBy}</td>
                  <td className="px-4 py-3">{ref.employeeID}</td>
                  <td className="px-4 py-3">{ref.reasonForReferral}</td>
                  <td className="px-4 py-3">{ref.studentName}</td>
                  <td className="px-4 py-3">{ref.date}</td>
                  <td className="px-4 py-3">{ref.status}</td>
                  <td className="px-4 py-3">
                    <button
                      className="bg-gray-900 text-white px-6 py-1 rounded-full hover:bg-gray-700 transition"
                      onClick={() => openForm(ref.id)}>
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {display && selectedReferral && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 rounded-lg shadow-lg overflow-y-auto max-h-[90vh] p-6 relative">
            {/* Close button */}
            <button
              onClick={closeForm}
              className="absolute top-4 right-4 text-gray-700 hover:text-black"
            >
              <img src={closeIcon} alt="close" className="w-7 h-7 object-cover rounded" />
            </button>

            <h2 className="text-2xl font-bold mb-4">Referral Form Details</h2>
            <hr className="mb-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p>
                  <strong>Referral ID:</strong> {selectedReferral.id}
                </p>
                <p>
                  <strong>School Year:</strong> {selectedReferral.schoolYear || "-"}
                </p>
                <p>
                  <strong>Student No.:</strong> {selectedReferral.sid || "-"}
                </p>
                <p>
                  <strong>Name:</strong> {selectedReferral.studentName || "-"}
                </p>
                <p>
                  <strong>Program & Section:</strong>{" "}
                  {selectedReferral.program} - {selectedReferral.section}
                </p>
                <p>
                  <strong>Gender:</strong> {selectedReferral.gender}
                </p>
                <p>
                  <strong>Age:</strong> {selectedReferral.age}
                </p>
                <p>
                  <strong>Referred By:</strong> {selectedReferral.referredBy}
                </p>
              </div>

              <div className="space-y-2">
                <p>
                  <strong>Reason for Referral:</strong>{" "}
                  {selectedReferral.reasonForReferral}
                </p>
                <p>
                  <strong>Areas of Concern:</strong> {selectedReferral.areasOfConcern}
                </p>
                <p>
                  <strong>Action Required:</strong> {selectedReferral.actionRequired}
                </p>
                <p>
                  <strong>Priority Level:</strong> {selectedReferral.levelOfPriority}
                </p>
                <p className="font-semibold">Actions Taken Before Referral:</p>
                <textarea
                  readOnly
                  value={selectedReferral.actionTaken}
                  rows={3}
                  className="w-full border rounded p-2 resize-none"
                />
                <p className="font-semibold">Counselor’s Initial Action:</p>
                <textarea
                  readOnly
                  value={selectedReferral.initialAction}
                  rows={5}
                  className="w-full border rounded p-2 resize-none"
                />
              </div>
            </div>

            {/* Email / Update */}
            <div className="mt-6 space-y-3">
              <p className="font-semibold">Counselor's Note:</p>
              <textarea className="w-full border rounded p-2 resize-none" rows={3} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Send Email To"
                  className="border rounded p-2"
                />
                <input type="text" placeholder="Subject" className="border rounded p-2" />
                <input type="text" placeholder="Body" className="border rounded p-2" />
              </div>
              <div className="flex gap-2 mt-4">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Update
                </button>
                <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Solved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReferralFormProcessing;