import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import { Paperclip } from "lucide-react";

// Main component for the Student Request Slip module
export default function StudentRequestSlip() {
  // State to manage the active slip type (tab)
  const [activeSlip, setActiveSlip] = useState("Absent");
  const [student, setStudentData] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await axios.get(`/student/get/02000288488`);
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
  }, []);

  // State to hold form data. Attachments is now an array of objects to allow for individual removal.
  const [formData, setFormData] = useState({
    name: "",
    sid: "",
    section: "",
    program: "",
    email: "",
    reason: "",
    dateAbsent: "",
    dateAbsentEnd: "",
    attachments: [],
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle new file selection and add them to the attachments array
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files)
      .filter(
        (file) => !formData.attachments.some((att) => att.name === file.name)
      ) // Prevent duplicates
      .slice(0, 3 - formData.attachments.length) // Limit to 3 total

      .map((file) => ({
        id: crypto.randomUUID(),
        file: file,
        name: file.name,
      }));

    setFormData((prevData) => ({
      ...prevData,
      attachments: [...prevData.attachments, ...newFiles],
    }));
    e.target.value = null;
  };

  // Handle file removal from the list
  const handleRemoveFile = (fileId) => {
    setFormData((prevData) => ({
      ...prevData,
      attachments: prevData.attachments.filter((item) => item.id !== fileId),
    }));
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
    } else if (activeSlip === "Late") {
      form.append("typeOfSlip", "Late Slip");
    } else if (activeSlip === "ID Pass") {
      form.append("typeOfSlip", "ID Slip");
    } else if (activeSlip === "ID Pass") {
      form.append("typeOfSlip", "ID Slip");
    } else if (activeSlip === "Uniform Pass") {
      form.append("typeOfSlip", "Uniform Pass");
    }

    // Attach files (up to 3)
    formData.attachments.forEach((item) => {
      form.append("attachments", item.file);
    });

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
      alert("Slip submitted successfully!");
      setFormData((prev) => ({
        ...prev,
        reason: "",
        dateAbsent: "",
        dateAbsentEnd: "",
        attachments: [],
      }));
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.error ||
          error.message ||
          "Failed to submit slip. Please try again."
      );
    }
  };

  // Tab data for rendering
  const slipTypes = [
    { id: "Absent", label: "Absent Slip", icon: "📝" },
    { id: "Late", label: "Late Slip", icon: "⏰" },
    { id: "ID Pass", label: "ID Pass", icon: "🆔" },
    { id: "Uniform Pass", label: "Uniform Pass", icon: "👕" },
  ];

  // Tailwind classes for consistent input styling
  const inputClasses =
    "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500";

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-500 text-lg">Loading student info...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in min-h-screen flex flex-col items-center pt-4 font-sans">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl">
        {/* Header and Tabs */}
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-4">
          Request Slip
        </h2>

        <div className="flex flex-wrap gap-2 mb-8">
          {slipTypes.map((slip) => (
            <button
              key={slip.id}
              type="button"
              onClick={() => setActiveSlip(slip.id)}
              className={`flex items-center gap-2 py-2 px-4 rounded-full text-sm font-semibold transition-colors duration-200 ${
                activeSlip === slip.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <span className="text-lg">{slip.icon}</span>
              {slip.label}
            </button>
          ))}
        </div>

        {/* Main Form Content */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Common Student Information Section */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              Student Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                {/* Label updated to "Program and Year/Section" */}
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              {activeSlip} Slip Details
            </h2>

            {/* Fields for Absent Slip */}
            {activeSlip === "Absent" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Absent
                  </label>
                  <input
                    type="date"
                    name="dateAbsent"
                    value={formData.dateAbsent}
                    onChange={handleChange}
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End of Date of Absent
                  </label>
                  <input
                    type="date"
                    name="dateAbsentEnd"
                    value={formData.dateAbsentEnd}
                    onChange={handleChange}
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Absent
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows="4"
                    className={inputClasses}
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className={inputClasses}
                    placeholder={`Please provide a detailed explanation for your reason.`}
                    required
                  ></textarea>
                </div>
              </div>
            )}
          </div>

          {/* Attachment Section */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              Attachments
            </h2>

            {/* Conditional attachment info based on slip type */}
            {activeSlip === "Absent" && (
              <div className="mb-4 text-gray-700">
                <p className="text-sm font-medium mb-2">
                  Please attach the following documents:
                </p>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                  <li>Excuse letter (if 1-2 days absent only)</li>
                  <li>Medical certificate (if 3 or more days absent)</li>
                  <li>
                    Photocopy of parent's/guardian's valid ID with signature
                  </li>
                </ul>
              </div>
            )}
            {(activeSlip === "Late" ||
              activeSlip === "Uniform Pass" ||
              activeSlip === "ID Pass") && (
              <p className="text-sm font-medium text-gray-700 mb-4">
                Please attach one (1) proof for your request.
              </p>
            )}

            {/* "Upload File" button to trigger file input */}
            <label className="inline-block">
              <button
                type="button"
                onClick={() => document.getElementById("file-input").click()}
                className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors duration-200"
              >
                Upload File
              </button>
              <input
                id="file-input"
                type="file"
                name="attachments"
                onChange={handleFileChange}
                multiple
                className="hidden"
                accept=".pdf,image/*"
              />
            </label>

            {/* File preview cards */}
            <div className="flex flex-wrap gap-4 mt-4">
              {formData.attachments.map((item) => {
                const isPdf = item.name.toLowerCase().endsWith(".pdf");
                const isImage = item.name
                  .toLowerCase()
                  .match(/\.(jpg|jpeg|png|gif)$/);

                return (
                  <div
                    key={item.id}
                    className="group relative flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-200 ease-in-out hover:shadow-lg max-w-[250px]"
                  >
                    {/* File Icon Container */}
                    <div
                      className={`flex-shrink-0 p-2 rounded-md ${
                        isPdf
                          ? "bg-red-100 text-red-500"
                          : "bg-green-100 text-green-500"
                      }`}
                    >
                      {/* Conditional SVG for PDF and Image */}
                      {isPdf ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <path
                            fillRule="evenodd"
                            d="M10 12.5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h1zM14 12.5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h1zM10.5 15.5h3v1h-3v-1z"
                          ></path>
                        </svg>
                      ) : isImage ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M15 8c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 1c-2.76 0-5 2.24-5 5v5c0 2.76 2.24 5 5 5s5-2.24 5-5v-5c0-2.76-2.24-5-5-5z"></path>
                        </svg>
                      ) : (
                        // Default file icon
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <path d="M14 2v6h6"></path>
                        </svg>
                      )}
                    </div>

                    {/* File name */}
                    <span className="flex-grow text-sm font-medium text-gray-700 truncate">
                      {item.name}
                    </span>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(item.id)}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-label="Remove file"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
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
                  attachments: [],
                });
              }}
              className="py-2 px-6 bg-white border border-gray-300 rounded-md text-gray-700 font-semibold shadow-sm hover:bg-gray-100 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-6 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors duration-200"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
      <style>
        {`
                    .animate-fade-in {
                        animation: fadeIn 0.5s;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}
      </style>
    </div>
  );
}
