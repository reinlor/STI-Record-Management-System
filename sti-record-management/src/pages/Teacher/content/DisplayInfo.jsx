import React from "react";
import { X, User, Info, Calendar, MessageSquare } from "lucide-react";

export default function DisplayInfo({ data, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30">
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-6xl relative animate-fade-in border border-gray-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors duration-200"
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Referral Details</h2>
                    <p className="text-gray-500 mt-1">Detailed information about the student referral.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Referral Information Card */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center text-blue-500 mb-3">
                            <Info size={20} className="mr-2" />
                            <h3 className="font-bold text-lg">Referral Info</h3>
                        </div>
                        <div className="space-y-3 text-sm text-gray-700">
                            <p><span className="font-semibold text-gray-900">School Year:</span> {data.schoolYear || "-"}</p>
                            <p><span className="font-semibold text-gray-900">Referred By:</span> {data.referredBy || "-"}</p>
                            <p><span className="font-semibold text-gray-900">Employee No.:</span> {data.employeeID || "-"}</p>
                            <p><span className="font-semibold text-gray-900">Prepared Date:</span> {data.preparedDate || "-"}</p>
                            <p><span className="font-semibold text-gray-900">Reason For Referral:</span> {data.reasonForReferral || "-"}</p>
                            <p><span className="font-semibold text-gray-900">Level of Priority:</span> {data.levelOfPriority || "-"}</p>
                        </div>
                    </div>

                    {/* Student Information Card */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center text-blue-500 mb-3">
                            <User size={20} className="mr-2" />
                            <h3 className="font-bold text-lg">Student</h3>
                        </div>
                        <div className="space-y-3 text-sm text-gray-700">
                            <p><span className="font-semibold text-gray-900">Student Name:</span> {data.studentName || "-"}</p>
                            <p><span className="font-semibold text-gray-900">Program:</span> {data.program || "-"}</p>
                            <p><span className="font-semibold text-gray-900">Gender:</span> {data.gender || "-"}</p>
                            <p><span className="font-semibold text-gray-900">Age:</span> {data.age || "-"}</p>
                            <p className="flex items-center">
                                <span className="font-semibold text-gray-900 mr-2">Status:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    data.status === "Approved" ? "bg-green-100 text-green-700" :
                                    data.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                                    data.status === "Rejected" ? "bg-red-100 text-red-700" :
                                    "bg-gray-200 text-gray-700"
                                }`}>
                                    {data.status || "-"}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Counselor's Action Card */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center text-blue-500 mb-3">
                            <MessageSquare size={20} className="mr-2" />
                            <h3 className="font-bold text-lg">Counselor's Action</h3>
                        </div>
                        <div className="space-y-3 text-sm text-gray-700">
                            <p><span className="font-semibold text-gray-900">Received By:</span> {data.receivedBy || "-"}</p>
                            <p><span className="font-semibold text-gray-900">Initial Action:</span> {data.initialAction || "-"}</p>
                            <p><span className="font-semibold text-gray-900">Action Required:</span> {data.actionRequired || "-"}</p>
                            <p><span className="font-semibold text-gray-900">Received Date:</span> {data.receivedDate || "-"}</p>
                            <p><span className="font-semibold text-gray-900">Feedback Update Date:</span> {data.feedBackDate || "-"}</p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .animate-fade-in {
                    animation: fadeInModal 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                @keyframes fadeInModal {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}