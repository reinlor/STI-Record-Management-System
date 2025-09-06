import React, { useState, useEffect, useContext, useRef } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import {
  FileText,
  Clock,
  IdCard,
  Shirt,
  Upload,
  Trash2,
  CalendarDays,
  CircleCheck,
} from "lucide-react";
import { AuthContext } from "../../../AuthProvider.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function StudentRequestSlip() {
  const [activeSlip, setActiveSlip] = useState("Absent");
  const [student, setStudentData] = useState(null);
  const { authData, logout } = useContext(AuthContext);

  // Use refs to access the date input elements directly
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  // State to manage individual attachments for the Absent Slip
  const [excuseLetter, setExcuseLetter] = useState(null);
  const [parentID, setParentID] = useState(null);
  const [medicalCertificate, setMedicalCertificate] = useState(null);

  // State to manage single attachment for other slips
  const [singleAttachment, setSingleAttachment] = useState(null);

  // State to hold form data, now without the attachments array
  const [formData, setFormData] = useState({
    name: "",
    sid: "",
    section: "",
    program: "",
    email: "",
    reason: "",
    dateAbsent: "",
    dateAbsentEnd: "",
  });

  useEffect(() => {
    if (!authData || !authData.user?.uid) return;
    const fetchStudentData = async () => {
      try {
        const res = await axios.get(`/student/get/${authData.user.uid}`);
        setStudentData(res.data);
        setFormData((prev) => ({
          ...prev,
          name: res.data.studentProfile.name || "",
          sid: res.data.sid || "",
          section: res.data.studentProfile.section || "",
          program: res.data.studentProfile.program || "",
          email: res.data.contactInfo.email || "",
        }));
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };
    fetchStudentData();
  }, [authData]);

  // Handle input changes for form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle file selection for a specific type
  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const fileType = file.type;
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

      if (!allowedTypes.includes(fileType)) {
        toast.error("Invalid file type. Only image files (JPEG, PNG, GIF) are allowed.");
        e.target.value = null;
        return;
      }
      setFile({ id: crypto.randomUUID(), file: file, name: file.name });
    }
    e.target.value = null; // Reset input for re-uploading the same file
  };

  // Handle file removal for a specific type
  const handleRemoveFile = (setFile) => {
    setFile(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("name", formData.name);
    form.append("sid", formData.sid);
    form.append("section", formData.section);
    form.append("program", formData.program);
    form.append("email", formData.email);
    form.append("reason", formData.reason);

    if (activeSlip === "Absent") {
      form.append("typeOfSlip", "Absent Slip");
      form.append("dateAbsentEnd", formData.dateAbsentEnd);
      form.append("dateAbsent", formData.dateAbsent);

      if (excuseLetter) form.append("attachments", excuseLetter.file);
      if (medicalCertificate) form.append("attachments", medicalCertificate.file);
      if (parentID) form.append("attachments", parentID.file);
    } else if (activeSlip === "Late") {
      form.append("typeOfSlip", "Late Slip");
      if (singleAttachment) form.append("attachments", singleAttachment.file);
    } else if (activeSlip === "ID Pass") {
      form.append("typeOfSlip", "ID Slip");
      if (singleAttachment) form.append("attachments", singleAttachment.file);
    } else if (activeSlip === "Uniform Pass") {
      form.append("typeOfSlip", "Uniform Pass");
      if (singleAttachment) form.append("attachments", singleAttachment.file);
    }

    // Choose endpoint based on slip type
    let endpoint = "";
    if (activeSlip === "Absent") endpoint = "/slip/absentSlip/add";
    else if (activeSlip === "Late") endpoint = "/slip/lateSlip/add";
    else if (activeSlip === "ID Pass") endpoint = "/slip/IDPass/add";
    else if (activeSlip === "Uniform Pass") endpoint = "/slip/uniformSlip/add";

    try {
      await axios.post(endpoint, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Slip submitted successfully!");
      setFormData((prev) => ({
        ...prev,
        reason: "",
        dateAbsent: "",
        dateAbsentEnd: "",
      }));
      // Reset the new file states
      setExcuseLetter(null);
      setParentID(null);
      setMedicalCertificate(null);
      setSingleAttachment(null);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to submit slip. Please try again."
      );
    }
  };

  // Helper function to create a valid HTML ID from a string
  const getFileId = (label) => {
    return label.toLowerCase().replace(/\s/g, "-").replace(/['/]/g, '');
  };

  // Helper function to render file upload sections
  const renderFileUpload = (file, setFile, label, guidelines = null) => {
    const fileId = getFileId(label);
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {guidelines && (
          <p className="text-xs text-gray-500 mb-1">{guidelines}</p>
        )}
        {!file ? (
          <label className="inline-block cursor-pointer">
            <button
              type="button"
              onClick={() => document.getElementById(fileId).click()}
              className="py-2.5 px-6 bg-yellow-400 text-black font-semibold rounded-lg shadow-md hover:bg-yellow-500 hover:-translate-y-0.5 transform transition-all duration-300"
            >
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Choose File</span>
              </div>
            </button>
            <input
              id={fileId}
              type="file"
              onChange={(e) => handleFileChange(e, setFile)}
              className="hidden"
              accept="image/*"
            />
          </label>
        ) : (
          <div className="group relative flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-200 ease-in-out hover:shadow-lg hover:border-yellow-400">
            <span className="text-sm font-medium text-gray-800 truncate flex-grow">
              {file.name}
            </span>
            <button
              type="button"
              onClick={() => handleRemoveFile(setFile)}
              className="ml-4 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Remove file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Tab data for rendering
  const slipTypes = [
    { id: "Absent", label: "Absent Slip", icon: FileText },
    { id: "Late", label: "Late Slip", icon: Clock },
    { id: "ID Pass", label: "ID Pass", icon: IdCard },
    { id: "Uniform Pass", label: "Uniform Pass", icon: Shirt },
  ];

  // Tailwind classes for consistent input styling
  const inputClasses =
    "w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200";

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <span className="text-gray-500 text-lg">Loading student info...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-gray-100 font-sans">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <style>
        {`
          @keyframes smooth-fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-smooth-fade-in {
            animation: smooth-fade-in 0.3s ease-out forwards;
          }
          .date-input-wrapper {
            position: relative;
            display: grid;
            grid-template-areas: "input-area";
            align-items: center;
          }
          .date-input-wrapper input {
            grid-area: input-area;
            z-index: 1;
            -webkit-appearance: none; /* Hide default iOS calendar icon */
          }
          .date-input-wrapper .calendar-icon {
            grid-area: input-area;
            justify-self: end;
            z-index: 2;
            margin-right: 1rem; /* Adjust as needed */
            pointer-events: auto;
          }
        `}
      </style>
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full container mx-auto border border-gray-200 animate-smooth-fade-in">
        {/* Header and Tabs */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Student Request Slip
          </h2>
          <CircleCheck className="text-yellow-400 w-8 h-8" />
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {slipTypes.map((slip) => (
            <button
              key={slip.id}
              type="button"
              onClick={() => setActiveSlip(slip.id)}
              className={`flex items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm ${
                activeSlip === slip.id
                  ? "bg-yellow-400 text-black shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-black"
              }`}
            >
              <slip.icon className="w-5 h-5" />
              {slip.label}
            </button>
          ))}
        </div>

        {/* Main Form Content */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Common Student Information Section */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
              <IdCard className="w-6 h-6 text-gray-500" />
              Student Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.name}
                  className={inputClasses}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Number
                </label>
                <input
                  type="text"
                  name="studentID"
                  value={formData.sid}
                  className={inputClasses}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program and Year/Section
                </label>
                <input
                  type="text"
                  name="program"
                  value={`${formData.program} ${formData.section}`}
                  className={inputClasses}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className={inputClasses}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Conditional Slip-specific Fields */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-gray-500" />
              {activeSlip} Slip Details
            </h2>

            {/* Fields for Absent Slip */}
            {activeSlip === "Absent" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date of Absence
                    </label>
                    <div className="date-input-wrapper">
                      <input
                        ref={startDateRef}
                        type="date"
                        name="dateAbsent"
                        value={formData.dateAbsent}
                        onChange={handleChange}
                        className={`${inputClasses} pr-10`}
                        required
                      />
                      <CalendarDays
                        className="calendar-icon text-gray-400 cursor-pointer"
                        onClick={() => startDateRef.current.showPicker()}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date of Absence
                    </label>
                    <div className="date-input-wrapper">
                      <input
                        ref={endDateRef}
                        type="date"
                        name="dateAbsentEnd"
                        value={formData.dateAbsentEnd}
                        onChange={handleChange}
                        className={`${inputClasses} pr-10`}
                        required
                      />
                      <CalendarDays
                        className="calendar-icon text-gray-400 cursor-pointer"
                        onClick={() => endDateRef.current.showPicker()}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Absent
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows="4"
                    className={`${inputClasses} resize-none`}
                    placeholder="Please provide a detailed explanation for your reason."
                    required
                  ></textarea>
                </div>
              </div>
            )}

            {/* Fields for Late, Uniform Pass, and ID Pass Slips */}
            {(activeSlip === "Late" ||
              activeSlip === "Uniform Pass" ||
              activeSlip === "ID Pass") && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for{" "}
                    {activeSlip === "Late"
                      ? "being late"
                      : activeSlip === "Uniform Pass"
                      ? "not wearing uniform"
                      : "not wearing ID"}
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows="4"
                    className={`${inputClasses} resize-none`}
                    placeholder={`Please provide a detailed explanation for your reason.`}
                    required
                  ></textarea>
                </div>
              </div>
            )}
          </div>

          {/* Attachment Section */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Upload className="w-6 h-6 text-gray-500" />
              Attachments
            </h2>
            {/* Specific upload buttons for Absent Slip */}
            {activeSlip === "Absent" ? (
              <div className="space-y-6">
                <p className="text-sm font-medium text-gray-700 mb-4">
                  Please upload the required documents below.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {renderFileUpload(
                    excuseLetter,
                    setExcuseLetter,
                    "Excuse Letter",
                    "For 1-2 days absent only."
                  )}
                  {renderFileUpload(
                    medicalCertificate,
                    setMedicalCertificate,
                    "Medical Certificate",
                    "For 3 or more days absent."
                  )}
                  {renderFileUpload(
                    parentID,
                    setParentID,
                    "Parent's/Guardian's ID",
                    "With signature."
                  )}
                </div>
              </div>
            ) : (
              // Single upload button for other slip types
              <div className="space-y-6">
                <p className="text-sm font-medium text-gray-700 mb-4">
                  Please attach one (1) proof for your request.
                </p>
                {renderFileUpload(singleAttachment, setSingleAttachment, "Proof of Request")}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  name: student?.studentProfile?.name || "",
                  sid: student?.sid || "",
                  section: student?.studentProfile?.section || "",
                  program: student?.studentProfile?.program || "",
                  email: student?.contactInfo?.email || "",
                  reason: "",
                  dateAbsent: "",
                  dateAbsentEnd: "",
                });
                // Reset individual file states
                setExcuseLetter(null);
                setParentID(null);
                setMedicalCertificate(null);
                setSingleAttachment(null);
              }}
              className="py-2.5 px-6 bg-gray-200 border-none rounded-xl text-gray-800 font-semibold shadow-sm hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 bg-yellow-400 text-black font-semibold rounded-xl shadow-lg hover:bg-yellow-500 hover:-translate-y-0.5 transform transition-all duration-200"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}