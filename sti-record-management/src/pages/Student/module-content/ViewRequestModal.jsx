import React from "react";
import { X, User, FileText, MessageSquare, Info, Paperclip, CalendarDays } from "lucide-react";
import { getStatusClasses } from "../components/statusClasses";

export default function ViewRequestModal({ data, onClose }) {
  const renderField = (label, value) => (
    <div className="space-y-1">
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <p className="font-semibold text-gray-900 text-base">{value || "N/A"}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30 animate-fade-in-backdrop">
      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 w-full max-w-7xl relative animate-fade-in border border-gray-200">
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
        <div className="text-center mb-8 border-b-2 pb-4 border-gray-100">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">Request Slip Details</h2>
          <p className="text-gray-500 mt-2 text-sm md:text-base">Detailed information about the student's request.</p>
        </div>

        {/* Prominent Status Badge */}
        <div className="flex justify-center mb-8">
          <div
            className={`flex items-center space-x-2 px-6 py-3 rounded-full text-lg font-bold shadow-md transition-colors duration-200 border ${getStatusClasses(
              data.status,
              "modal"
            )}`}
          >
            <Info size={24} />
            <span>Status: {data.status || "N/A"}</span>
          </div>
        </div>

        {/* Main Content Grid with Scrolling */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-h-[70vh] overflow-y-auto">
          {/* Left Column (Student & Slip Details) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Student Information Card */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-lg">
              <div className="flex items-center text-gray-800 mb-4">
                <User size={24} className="mr-3 text-gray-700" />
                <h3 className="font-bold text-xl">Student Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm text-gray-700">
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
                <FileText size={24} className="mr-3 text-gray-700" />
                <h3 className="font-bold text-xl">Slip Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm text-gray-700">
                {renderField("Slip Type", data.typeOfSlip)}
                {renderField("Processed Date", data.processedDate)}
                {data.typeOfSlip === "Absent Slip" && (
                  <>
                    {renderField("Start Date of Absence", data.dateAbsent)}
                    {renderField("End Date of Absence", data.dateAbsentEnd)}
                  </>
                )}
                <div className="space-y-3 md:col-span-2">
                  <p className="text-gray-500 text-sm font-medium">Reason</p>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 whitespace-pre-wrap break-words min-h-[100px]">
                    <p className="font-semibold text-gray-900 text-base">
                      {data.reason || "No reason provided."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Remarks & Attachments) */}
          <div className="lg:col-span-1 space-y-8">
            {/* Remarks Card */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-lg">
              <div className="flex items-center text-gray-800 mb-4">
                <MessageSquare size={24} className="mr-3 text-gray-700" />
                <h3 className="font-bold text-xl">Remarks</h3>
              </div>
              <p className="text-sm text-gray-700 font-semibold">{data.remarks || "No remarks."}</p>
            </div>

            {/* Attachments Card */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-lg flex flex-col">
              <div className="flex items-center text-gray-800 mb-4">
                <Paperclip size={24} className="mr-3 text-gray-700" />
                <h3 className="font-bold text-xl">Attachments</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-700 max-h-[150px] overflow-y-auto pr-2 -mr-2">
                {data.typeOfSlip === "Absent Slip" ? (
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
                    {!data.excuseLetterUrl && !data.guardianValidIDUrl && !data.medicalCertificateUrl && (
                      <p className="font-semibold">None</p>
                    )}
                  </>
                ) : Array.isArray(data.proofUrl) && data.proofUrl.length > 0 ? (
                  <ul className="list-none space-y-2">
                    {data.proofUrl.map((file, idx) => (
                      <li key={idx} className="flex items-start">
                        <Paperclip size={16} className="flex-shrink-0 mr-2 text-gray-400 mt-1" />
                        <a
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline break-all font-semibold"
                        >
                          {file}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : data.proofUrl ? (
                  <a
                    href={data.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline break-all font-semibold"
                  >
                    {data.proofUrl}
                  </a>
                ) : (
                  <p className="font-semibold">None</p>
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
      `}</style>
    </div>
  );
}
