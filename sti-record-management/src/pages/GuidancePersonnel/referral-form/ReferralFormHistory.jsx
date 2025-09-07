import react, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import back from '../../../assets/back.png'
import closeB from '../../../assets/closeblack.png';
import axios from 'axios';

function ReferralFormHistory() {
    const navigate = useNavigate();
    const [display, setDisplay] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedReferral, setSelectedReferral] = useState(null);
    const [referralData, setReferralData] = useState([]);

    useEffect(() => {
        axios
            .get("/referral/getAll")
            .then((res) => setReferralData(res.data))
            .catch((err) => console.error("Error fetching list:", err.message));
    }, []);

    const displayReferralTable = () => {
        return referralData.map((referrals) => {
            if (referrals.status !== 'Resolved') return null;
            return (
                <tr key={referrals.id} className="hover:bg-gray-100 transition">
                    <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 whitespace-nowrap">{referrals.referredBy}</td>
                    <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto whitespace-nowrap">{referrals.employeeID}</td>
                    <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 whitespace-normal break-words max-w-[150px]">{referrals.reasonForReferral}</td>
                    <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 whitespace-nowrap">{referrals.studentName}</td>
                    <td className="px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto whitespace-nowrap">{referrals.preparedDate}</td>
                    <td className={`px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto font-semibold ${
                        referrals.status === 'Resolved' ? 'text-green-600' : 'text-red-600'
                    } whitespace-nowrap`}>
                        {referrals.status}
                    </td>
                    <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3">
                        <button
                            onClick={() => setSelectedReferral(referrals)}
                            className="bg-gray-900 text-white px-3 sm:px-4 py-1 rounded-full hover:bg-gray-700 transition w-full sm:w-auto"
                        >
                            Open
                        </button>
                    </td>
                </tr>
            );
        });
    };

    const displayReferralData = () => {
        if (!selectedReferral) return null;
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-white w-full max-w-[95vw] sm:max-w-xl lg:max-w-2xl rounded-lg shadow-lg p-4 sm:p-6 relative overflow-y-auto max-h-[90vh] outline-solid outline-2 outline-gray-300">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold">Referral Form</h2>
                        <button
                            onClick={() => setSelectedReferral(null)}
                            className="text-gray-700 hover:text-black transition-transform hover:scale-110"
                        >
                            <img src={closeB} alt="closeb" className="w-7 h-7 object-cover rounded" />
                        </button>
                    </div>
                    <hr className="mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                        {/* Left Column */}
                        <div className="space-y-2">
                            <p><strong>School Year:</strong> {selectedReferral.schoolYear || "-"}</p>
                            <p><strong>Tertiary (Semester):</strong> {selectedReferral.semester || "-"}</p>
                            <p><strong>Senior High (Quarter):</strong> {selectedReferral.quarter || "-"}</p>
                            <p><strong>Student Number:</strong> {selectedReferral.studentNumber || "-"}</p>
                            <p><strong>Student’s Name:</strong> {selectedReferral.studentName || "-"}</p>
                            <p><strong>Program and Section:</strong> {selectedReferral.programSection || "-"}</p>
                            <p><strong>Gender:</strong> {selectedReferral.gender || "-"}</p>
                            <p><strong>Age:</strong> {selectedReferral.age || "-"}</p>
                            <p><strong>Referred By:</strong> {selectedReferral.referredBy || "-"}</p>
                            <p><strong>Areas of Concern:</strong> {selectedReferral.areasOfConcern || "-"}</p>
                            <p><strong>Action Required:</strong> {selectedReferral.actionRequired || "-"}</p>
                            <p><strong>Level of Priority:</strong> {selectedReferral.levelPriority || "-"}</p>
                            <div>
                                <p className="font-semibold">Actions Taken before Referral:</p>
                                <textarea
                                    readOnly
                                    value={selectedReferral.actionsBefore || ""}
                                    className="w-full border border-gray-300 rounded p-2 mt-1 resize-none bg-gray-50"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <p className="font-semibold">Reasons for Referral / Comments:</p>
                                <textarea
                                    readOnly
                                    value={selectedReferral.reasons || ""}
                                    className="w-full border border-gray-300 rounded p-2 mt-1 resize-none bg-gray-50"
                                    rows={3}
                                />
                            </div>
                        </div>
                        {/* Right Column */}
                        <div className="space-y-2">
                            <p className="font-semibold">Counselor’s Initial Action:</p>
                            <textarea
                                readOnly
                                value={selectedReferral.counselorAction || ""}
                                className="w-full border border-gray-300 rounded p-2 resize-none bg-gray-50"
                                rows={10}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-100 min-h-screen p-2 sm:p-3">
            <div className="bg-white shadow-md p-2 sm:p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                    <button
                        onClick={() => navigate(-1)}
                        style={{ cursor: 'pointer' }}
                        className='flex items-center justify-center p-1 hover:bg-gray-300 transition duration-200 rounded'
                    >
                        <img src={back} alt="back" className="w-7 h-7 object-cover rounded" />
                    </button>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">Referral Form History</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                    <p className="text-gray-500">View Referral Forms History</p>
                    <div className="flex gap-2 w-full sm:w-auto">
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
                <div className="bg-white rounded-lg shadow-md overflow-y-auto custom-scrollbar h-full">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700">
                                <th className="sticky top-0 z-10 bg-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-semibold">Name</th>
                                <th className="sticky top-0 z-10 bg-gray-300 px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto font-semibold whitespace-nowrap">Employee No.</th>
                                <th className="sticky top-0 z-10 bg-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-semibold">Violation</th>
                                <th className="sticky top-0 z-10 bg-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-semibold">Referred Student</th>
                                <th className="sticky top-0 z-10 bg-gray-300 px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto font-semibold whitespace-nowrap">Date</th>
                                <th className="sticky top-0 z-10 bg-gray-300 px-0 py-0 text-[0px] w-0 lg:px-4 lg:py-3 lg:text-base lg:w-auto font-semibold whitespace-nowrap">Status</th>
                                <th className="sticky top-0 z-10 bg-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-semibold"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayReferralTable()}
                        </tbody>
                    </table>
                    <div>{displayReferralData()}</div>
                </div>
            </div>
        </div>
    );
}

export default ReferralFormHistory;