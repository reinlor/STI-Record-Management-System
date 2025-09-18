import React from "react";
import { X, User, FileText, MessageSquare, Info, Paperclip, AlertTriangle } from "lucide-react";
import { getStatusClasses } from "../components/statusClasses";

export default function ViewRequestModal({ data, onClose }) {
  const renderField = (label, value, isDate = false) => (
    <div className="space-y-1">
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <p className="font-semibold text-gray-900 text-base">
        {isDate ? formatDate(value) : (value || "N/A")}
      </p>
    </div>
  );

  const isAbsentSlip = data.typeOfSlip === "Absent Slip";
  const isIncidentReport = data.typeOfSlip === "Incident Report";
  // Check for the presence of any Absent Slip attachments
  const hasAbsentAttachments = data.excuseLetterUrl || data.guardianValidIDUrl || data.medicalCertificateUrl;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30 animate-fade-in-backdrop">
      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 lg:p-10 w-full max-w-full md:max-w-3xl lg:max-w-5xl xl:max-w-7xl relative animate-fade-in border border-gray-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors duration-200 transform hover:-translate-y-0.5"
        >
          <X size={24} />
        </button>

        {/* Header with Prominent Status */}
        <div className="text-center mb-6 md:mb-8 border-b-2 pb-4 border-gray-100">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-800 tracking-tight">Request Slip Details</h2>
          <p className="text-gray-500 mt-2 text-sm md:text-base">Detailed information about the student's request.</p>
        </div>

        {/* Prominent Status Badge */}
        <div className="flex justify-center mb-6 md:mb-8">
          <div
            className={`flex items-center space-x-2 px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-lg font-bold shadow-md transition-colors duration-200 border ${getStatusClasses(
              data.status,
              "modal"
            )}`}
          >
            <Info size={20} md:size={24} />
            <span>Status: {data.status || "N/A"}</span>
          </div>
        </div>

        {/* Main Content Grid with Scrolling */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Left Column (Student & Slip Details) */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Student Information Card */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-lg">
              <div className="flex items-center text-gray-800 mb-4">
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

            {/* Slip Details Card */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-lg">
              <div className="flex items-center text-gray-800 mb-4">
                {isAbsentSlip ? <FileText size={24} className="mr-3 text-gray-700" /> : <AlertTriangle size={24} className="mr-3 text-gray-700" />}
                <h3 className="font-bold text-xl">{data.typeOfSlip || "Slip"} Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-x-8 md:gap-y-6 text-sm text-gray-700">
                {renderField("Slip Type", data.typeOfSlip)}
                {renderField("Processed Date", data.processedDate, true)}
                {isAbsentSlip && (
                  <>
                    {renderField("Start Date of Absence", data.dateAbsent, true)}
                    {renderField("End Date of Absence", data.dateAbsentEnd, true)}
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

              {/* Narrative and Actions Taken Sections */}
              {isIncidentReport && (
                <div className="space-y-6 mt-6">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Narrative of the Incident</p>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 whitespace-pre-wrap break-words min-h-[100px] mt-1">
                      <p className="font-semibold text-gray-900 text-base">
                        {data.narrativeReport || "No narrative provided."}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Actions Taken</p>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 whitespace-pre-wrap break-words min-h-[100px] mt-1">
                      <p className="font-semibold text-gray-900 text-base">
                        {data.actionTaken || "No actions listed."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isAbsentSlip && (
                <div className="space-y-3 mt-6">
                  <p className="text-gray-500 text-sm font-medium">Reason</p>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 whitespace-pre-wrap break-words min-h-[100px]">
                    <p className="font-semibold text-gray-900 text-base">
                      {data.reason || "No reason provided."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Remarks & Attachments) */}
          <div className="lg:col-span-1 space-y-6 md:space-y-8">
            {/* Remarks Card */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-lg">
              <div className="flex items-center text-gray-800 mb-4">
                <MessageSquare size={24} className="mr-3 text-gray-700" />
                <h3 className="font-bold text-xl">Remarks</h3>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 whitespace-pre-wrap break-words min-h-[100px]">
                <p className="font-semibold text-gray-900 text-base">{data.remarks || "No remarks."}</p>
              </div>
            </div>

            {/* Attachments Card */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-lg flex flex-col">
              <div className="flex items-center text-gray-800 mb-4">
                <Paperclip size={24} className="mr-3 text-gray-700" />
                <h3 className="font-bold text-xl">Attachments</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-700 max-h-[150px] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                {isAbsentSlip && hasAbsentAttachments ? (
                  <>
                    {data.excuseLetterUrl && (
                      <div className="flex items-start">
                        <Paperclip size={16} className="flex-shrink-0 mr-2 text-gray-400 mt-1" />
                        <a
                          href={data.excuseLetterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline break-all font-semibold"
                        >
                          Excuse Letter
                        </a>
                      </div>
                    )}
                    {data.guardianValidIDUrl && (
                      <div className="flex items-start">
                        <Paperclip size={16} className="flex-shrink-0 mr-2 text-gray-400 mt-1" />
                        <a
                          href={data.guardianValidIDUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline break-all font-semibold"
                        >
                          Guardian ID
                        </a>
                      </div>
                    )}
                    {data.medicalCertificateUrl && (
                      <div className="flex items-start">
                        <Paperclip size={16} className="flex-shrink-0 mr-2 text-gray-400 mt-1" />
                        <a
                          href={data.medicalCertificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline break-all font-semibold"
                        >
                          Medical Certificate
                        </a>
                      </div>
                    )}
                  </>
                ) : isIncidentReport && Array.isArray(data.attachmentUrl) && data.attachmentUrl.length > 0 ? (
                  <ul className="list-none space-y-2">
                    {data.attachmentUrl.map((file, idx) => (
                      <li key={idx} className="flex items-start">
                        <Paperclip size={16} className="flex-shrink-0 mr-2 text-gray-400 mt-1" />
                        <a
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline break-all font-semibold"
                        >
                          Evidence {idx + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-semibold text-gray-900">None</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeInModal 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-fade-in-backdrop {
          animation: fadeInBackdrop 0.3s ease-out;
        }
        @keyframes fadeInModal {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Minimalist Scrollbar Styles */
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