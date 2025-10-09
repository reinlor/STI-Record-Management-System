import React, { useState } from "react";
import { X, User, Info, MessageSquare } from "lucide-react";
import { getStatusClasses } from "../../Student/components/statusClasses";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DisplayInfo({ data, onClose }) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const renderField = (label, value) => (
    <div className="space-y-1">
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <p className="font-semibold text-gray-900 text-base">{value || "N/A"}</p>
    </div>
  );

  // Cancel referral request handler
  const handleCancelReferral = async () => {
    setIsCancelling(true);
    try {
      const referralId = data.id || data._id;
      await axios.put(`/referral/cancel/${referralId}`);
      setCancelSuccess(true);
      toast.success("Referral successfully cancelled!", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      toast.error("Failed to cancel referral. Please try again.", {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30 animate-fade-in-backdrop">
      <ToastContainer theme="light" />
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
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">Referral Details</h2>
          <p className="text-gray-500 mt-2 text-sm md:text-base">Detailed information about the student referral.</p>
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
          {/* Left Column (Referral & Student Info) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Referral Information Card */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-lg">
              <div className="flex items-center text-yellow-700 mb-4">
                <Info size={24} className="mr-3 text-gray-700" />
                <h3 className="font-bold text-gray-700 text-xl">Referral Info</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm text-gray-700">
                {renderField("School Year", data.schoolYear)}
                {renderField("Referred By", data.referredBy)}
                {renderField("Employee No.", data.employeeID)}
                {renderField("Prepared Date", data.preparedDate)}
                {renderField("Level of Priority", data.levelOfPriority)}
                {renderField("Reason For Referral", data.reasonForReferral)}
              </div>
            </div>

            {/* Student Information Card */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-lg">
              <div className="flex items-center text-yellow-700 mb-4">
                <User size={24} className="mr-3 text-gray-700" />
                <h3 className="font-bold text-gray-700 text-xl">Student Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm text-gray-700">
                {renderField("Student Name", data.studentName)}
                {renderField("Program", data.program)}
                {renderField("Gender", data.gender)}
                {renderField("Age", data.age)}
                <div className="space-y-1 md:col-span-2">
                  <p className="text-gray-500 text-sm font-medium">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(data.status, "table")}`}>
                    {data.status || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Counselor's Action) */}
          <div className="lg:col-span-1 space-y-8">
            {/* Counselor's Action Card */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-lg">
              <div className="flex items-center text-yellow-700 mb-4">
                <MessageSquare size={24} className="mr-3 text-gray-700" />
                <h3 className="font-bold text-gray-700 text-xl">Counselor's Action</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                {renderField("Received By", data.receivedBy)}
                {renderField("Initial Action", data.initialAction)}
                {renderField("Action Required", data.actionRequired)}
                {renderField("Received Date", data.receivedDate)}
                {renderField("Feedback Update Date", data.feedBackDate)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Cancel Button */}
        {(data.status === "Pending" || data.status === "In Progress") && (
          <div className="sticky bottom-0 bg-white border-t border-gray-100 rounded-b-3xl p-4 flex justify-end z-30">
            <button
              onClick={handleCancelReferral}
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
                : "Cancel Referral"}
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