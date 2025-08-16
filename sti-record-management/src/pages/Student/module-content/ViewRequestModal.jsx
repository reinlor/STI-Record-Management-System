import React from "react";
import { X, User, FileText, Paperclip, Clock, Calendar, MessageSquare, Info } from "lucide-react";

export default function ViewRequestModal({ data, onClose }) {
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
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Request Slip Details</h2>
          <p className="text-gray-500 mt-1">Detailed information about the student's request.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Student Information Card */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center text-blue-500 mb-3">
              <User size={20} className="mr-2" />
              <h3 className="font-bold text-lg">Student Information</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <p><span className="font-semibold text-gray-900">Full Name:</span> {data.fullName || "-"}</p>

              <p><span className="font-semibold text-gray-900">Student Number:</span> {data.studentNumber || "-"}</p>

              <p><span className="font-semibold text-gray-900">Program/Strand:</span> {data.program || "-"}</p>

              <p><span className="font-semibold text-gray-900">Year and Section:</span> {data.yearAndSection || "-"}</p>

              <p><span className="font-semibold text-gray-900">Email:</span> {data.email || "-"}</p>
            </div>
          </div>

          {/* Slip Details Card */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center text-blue-500 mb-3">
              <FileText size={20} className="mr-2" />
              <h3 className="font-bold text-lg">Slip Details</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <p><span className="font-semibold text-gray-900">Slip Type:</span> {data.slipType || "-"}</p>
              {data.slipType === "Absent Slip" && (
                <>
                  <p><span className="font-semibold text-gray-900">Date of Absent:</span> {data.dateAbsent || "-"}</p>

                  <p><span className="font-semibold text-gray-900">No. of Days Absent:</span> {data.daysAbsent || "-"}</p>

                  <p><span className="font-semibold text-gray-900">Reason:</span> {data.reason || "-"}</p>
                </>
              )}
              {(data.slipType === "Late Slip" || data.slipType === "ID Pass" || data.slipType === "Uniform Pass") && (
                <p><span className="font-semibold text-gray-900">Reason:</span> {data.reason || "-"}</p>
              )}
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center text-blue-500 mb-3">
              <Info size={20} className="mr-2" />
              <h3 className="font-bold text-lg">Status</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
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
              <p><span className="font-semibold text-gray-900">Processed Date:</span> {data.processedDate || "-"}</p>

              <p><span className="font-semibold text-gray-900">Remarks:</span> {data.remarks || "-"}</p>
            </div>
          </div>

          {/* Attachments Card */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center text-blue-500 mb-3">
              <Paperclip size={20} className="mr-2" />
              <h3 className="font-bold text-lg">Attachments</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              {data.attachments && data.attachments.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {data.attachments.map((file, idx) => (
                    <li key={idx} className="flex items-center"><Paperclip size={16} className="mr-2 text-gray-400" />{file}</li>
                  ))}
                </ul>
              ) : (
                <p>None</p>
              )}
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
