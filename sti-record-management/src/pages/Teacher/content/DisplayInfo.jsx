import React from "react";

function DisplayInfo({ data, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl relative animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-xl font-bold"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Referral Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Referral Information */}
                    <div>
                        <h3 className="font-bold text-lg mb-2 text-blue-700">Referral Info</h3>
                        <div className="space-y-2">
                            <div>
                                <span className="font-semibold">School Year:</span> {data.schoolYear}
                            </div>
                            <div>
                                <span className="font-semibold">Referred By:</span> {data.referredBy}
                            </div>
                            <div>
                                <span className="font-semibold">Employee No.:</span> {data.employeeID}
                            </div>
                            <div>
                                <span className="font-semibold">Prepared Date:</span> {data.preparedDate}
                            </div>
                            <div>
                                <span className="font-semibold">Reason For Referral:</span> {data.reasonForReferral}
                            </div>
                            <div>
                                <span className="font-semibold">Level of Priority:</span> {data.levelOfPriority}
                            </div>
                        </div>
                    </div>

                    {/* Student Referred Information */}
                    <div>
                        <h3 className="font-bold text-lg mb-2 text-blue-700">Student</h3>
                        <div className="space-y-2">
                            <div>
                                <span className="font-semibold">Student Name:</span> {data.studentName}
                            </div>
                            <div>
                                <span className="font-semibold">Program:</span> {data.program}
                            </div>
                            <div>
                                <span className="font-semibold">Gender:</span> {data.gender}
                            </div>
                            <div>
                                <span className="font-semibold">Age:</span> {data.age}
                            </div>
                            <div>
                                <span className="font-semibold">Status:</span> {data.status}
                            </div>
                        </div>
                    </div>
                    {/* Counselor Action Information */}
                    <div>
                        <h3 className="font-bold text-lg mb-2 text-blue-700">Counselor's Action</h3>
                        <div className="space-y-2">
                            <div>
                                <span className="font-semibold">Received By:</span> {data.receivedBy}
                            </div>
                            <div>
                                <span className="font-semibold">Initial Action:</span> {data.initialAction}
                            </div>
                            <div>
                                <span className="font-semibold">Action Required:</span> {data.actionRequired}
                            </div>
                            <div>
                                <span className="font-semibold">Received Date:</span> {data.receivedDate}
                            </div>
                            <div>
                                <span className="font-semibold">Feedback Update Date:</span> {data.feedBackDate}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Animation */}
            <style>
                {`
          .animate-fade-in {
            animation: fadeInModal 0.3s;
          }
          @keyframes fadeInModal {
            from { opacity: 0; transform: scale(0.95);}
            to { opacity: 1; transform: scale(1);}
          }
        `}
            </style>
        </div>
    );
}

export default DisplayInfo;