import React, { useState } from "react";
import { X, User, FileText, MessageSquare, Info, Paperclip, AlertTriangle } from "lucide-react";
import { getStatusClasses } from "../components/statusClasses";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

export default function ViewRequestModal({ data, onClose }) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const renderField = (label, value, isDate = false) => (
    <div className="space-y-1">
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <p className="font-semibold text-gray-900 text-base">
        {isDate ? formatDate(value) : value || "N/A"}
      </p>
    </div>
  );

  const isAbsentSlip = data.typeOfSlip === "Absent Slip";
  const isIncidentReport = data.typeOfSlip === "Incident Report";
  const hasAbsentAttachments =
    data.excuseLetterUrl || data.guardianValidIDUrl || data.medicalCertificateUrl;

  const parseToDate = (val) => {
    if (!val) return null;
    if (typeof val === "object" && val._seconds) {
      return new Date(val._seconds * 1000);
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDate = (val) => {
    const d = parseToDate(val);
    return d ? d.toLocaleString() : "N/A";
  };

  const handleCancelRequest = async () => {
    setIsCancelling(true);
    try {
      const slipId = data._id || data.id;
      await axios.post(`/slip/cancel/${slipId}`);
      setCancelSuccess(true);
      toast.success("Request successfully cancelled!");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      toast.error("Failed to cancel request. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 animate-fade-in-backdrop">
      <Toaster position="top-right" />
      <div className="relative flex flex-col bg-white rounded-3xl shadow-2xl w-full max-w-full md:max-w-3xl lg:max-w-5xl xl:max-w-6xl animate-fade-in border border-gray-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-50 text-gray-500 hover:text-gray-900 transition-colors duration-200"
        >
          <X size={26} />
        </button>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 text-center p-6 md:p-8 rounded-t-3xl z-20">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-800 tracking-tight">
            Request Slip Details
          </h2>
          <p className="text-gray-500 mt-2 text-sm md:text-base">
            Detailed information about the student's request.
          </p>
          {/* Status Badge */}
          <div className="flex justify-center mt-5">
            <div
              className={`flex items-center space-x-2 px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-lg font-bold shadow-sm border ${getStatusClasses(
                data.status,
                "modal"
              )}`}
            >
              <Info size={20} />
              <span>Status: {data.status || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto custom-scrollbar px-6 md:px-10 py-6 max-h-[70vh]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* Student Info */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-md">
                <div className="flex items-center mb-4 text-gray-800">
                  <User size={24} className="mr-3 text-gray-700" />
                  <h3 className="font-bold text-xl">Student Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-x-8 md:gap-y-6 text-sm text-gray-700">
                  {renderField("Full Name", data.name)}
                  {renderField("Student Number", data.sid)}
                  {renderField("Program/Strand", data.program)}
                  {renderField("Year and Section", data.section)}
                  {renderField("Email", data.email)}
                </div>
              </div>

              {/* Slip Details */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-md">
                <div className="flex items-center mb-4 text-gray-800">
                  {isAbsentSlip ? (
                    <FileText size={24} className="mr-3 text-gray-700" />
                  ) : (
                    <AlertTriangle size={24} className="mr-3 text-gray-700" />
                  )}
                  <h3 className="font-bold text-xl">
                    {data.typeOfSlip || "Slip"} Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-x-8 md:gap-y-6 text-sm text-gray-700">
                  {renderField("Slip Type", data.typeOfSlip)}
                  {renderField("Processed Date", data.processedDate, true)}
                  {isAbsentSlip && (
                    <>
                      {renderField("Start Date of Absence", data.dateAbsent, true)}
                      {renderField("End Date of Absence", data.dateAbsentEnd, true)}
                      {renderField("Reason for Absence", data.reason)}
                    </>
                  )}
                  {isIncidentReport && (
                    <>
                      {renderField("Date of Incident", data.dateOfIncident, true)}
                      {renderField("Time of Incident", data.incidentTime)}
                      {renderField("Location of Incident", data.locationOfIncident)}
                      {renderField("Person/s Involved", data.personInvolved)}
                      {renderField("Witness Name", data.witnessName)}
                      {renderField("Witness Contact", data.witnessContact)}
                    </>
                  )}
                </div>

                {/* Narrative / Reason */}
                {isIncidentReport && (
                  <div className="space-y-6 mt-6">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">
                        Narrative of the Incident
                      </p>
                      <div className="bg-white p-4 rounded-xl border border-gray-200 whitespace-pre-wrap break-words min-h-[100px] mt-1">
                        <p className="font-semibold text-gray-900 text-base">
                          {data.narrativeReport || "No narrative provided."}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm font-medium">
                        Actions Taken
                      </p>
                      <div className="bg-white p-4 rounded-xl border border-gray-200 whitespace-pre-wrap break-words min-h-[100px] mt-1">
                        <p className="font-semibold text-gray-900 text-base">
                          {data.actionTaken || "No actions listed."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-6 md:space-y-8">
              {/* Remarks */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-md">
                <div className="flex items-center mb-4 text-gray-800">
                  <MessageSquare size={24} className="mr-3 text-gray-700" />
                  <h3 className="font-bold text-xl">Remarks</h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 whitespace-pre-wrap break-words min-h-[100px]">
                  <p className="font-semibold text-gray-900 text-base">
                    {data.remarks || "No remarks."}
                  </p>
                </div>
              </div>

              {/* Attachments */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-md">
                <div className="flex items-center mb-4 text-gray-800">
                  <Paperclip size={24} className="mr-3 text-gray-700" />
                  <h3 className="font-bold text-xl">Attachments</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-700 max-h-[150px] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                  {isAbsentSlip && hasAbsentAttachments ? (
                    <>
                      {data.excuseLetterUrl && (
                        <a
                          href={data.excuseLetterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 underline break-all font-semibold"
                        >
                          Excuse Letter
                        </a>
                      )}
                      {data.guardianValidIDUrl && (
                        <a
                          href={data.guardianValidIDUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 underline break-all font-semibold"
                        >
                          Guardian ID
                        </a>
                      )}
                      {data.medicalCertificateUrl && (
                        <a
                          href={data.medicalCertificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 underline break-all font-semibold"
                        >
                          Medical Certificate
                        </a>
                      )}
                    </>
                  ) : isIncidentReport &&
                    Array.isArray(data.attachmentUrl) &&
                    data.attachmentUrl.length > 0 ? (
                    data.attachmentUrl.map((file, idx) => (
                      <a
                        key={idx}
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 underline break-all font-semibold"
                      >
                        Evidence {idx + 1}
                      </a>
                    ))
                  ) : (
                    <p className="font-semibold text-gray-900">None</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Cancel Button */}
        {data.status === "Pending" && (
          <div className="sticky bottom-0 bg-white border-t border-gray-100 rounded-b-3xl p-4 flex justify-end z-30">
            <button
              onClick={handleCancelRequest}
              disabled={isCancelling || cancelSuccess}
              className={`px-8 py-3 rounded-lg font-semibold shadow transition-colors text-white ${
                cancelSuccess
                  ? "bg-green-500"
                  : isCancelling
                  ? "bg-gray-400"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {isCancelling
                ? "Cancelling..."
                : cancelSuccess
                ? "Cancelled!"
                : "Cancel Request"}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeInModal 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-fade-in-backdrop {
          animation: fadeInBackdrop 0.3s ease-out;
        }
        @keyframes fadeInModal {
          from { opacity: 0; transform: scale(0.97) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
      `}</style>
    </div>
  );
}