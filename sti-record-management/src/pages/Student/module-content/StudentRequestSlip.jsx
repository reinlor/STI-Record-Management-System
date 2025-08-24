import React, { useState, useEffect } from "react";
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
<<<<<<< HEAD
    dateAbsent: "",
    dateAbsentEnd: "",
=======
    startDateAbsent: "",
    endDateAbsent: "",
>>>>>>> origin/jordan-v4
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
      )
      .slice(0, 3 - formData.attachments.length)
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
<<<<<<< HEAD
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
=======
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
          form.append("endDateAbsent", formData.endDateAbsent);
          form.append("startDateAbsent", formData.startDateAbsent);
      } else if (activeSlip === "Late") {
          form.append("typeOfSlip", "Late Slip");
      } else if (activeSlip === "ID Pass") {
          form.append("typeOfSlip", "ID Slip");
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
  
      try {
          await axios.post(endpoint, form, {
              headers: { "Content-Type": "multipart/form-data" },
          });
          alert("Slip submitted successfully!");
          setFormData((prev) => ({
              ...prev,
              reason: "",
              startDateAbsent: "",
              endDateAbsent: "",
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
>>>>>>> origin/jordan-v4
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
                    <div className="relative">
                      <input
                        type="date"
                        name="startDateAbsent"
                        value={formData.startDateAbsent}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                      />
                      <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date of Absence
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="endDateAbsent"
                        value={formData.endDateAbsent}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                      />
                      <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div>
<<<<<<< HEAD
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
=======
                  <label className="block text-sm font-medium text-gray-700 mb-2">
>>>>>>> origin/jordan-v4
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

            {/* "Upload File" button */}
            <label className="inline-block cursor-pointer">
              <button
                type="button"
                onClick={() => document.getElementById("file-input").click()}
                className="py-2.5 px-6 bg-yellow-400 text-black font-semibold rounded-lg shadow-md hover:bg-yellow-500 hover:shadow-lg hover:-translate-y-0.5 transform transition-all duration-300"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {formData.attachments.map((item) => {
                const isPdf = item.name.toLowerCase().endsWith(".pdf");

                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-200 ease-in-out hover:shadow-lg hover:border-yellow-400"
                  >
                    {/* File Icon */}
                    <div
                      className={`flex-shrink-0 p-3 rounded-full mb-3 ${
                        isPdf
                          ? "bg-red-100 text-red-500"
                          : "bg-green-100 text-green-500"
                      }`}
                    >
                      {isPdf ? (
                        <FileText className="w-8 h-8" />
                      ) : (
                        <CalendarDays className="w-8 h-8" />
                      )}
                    </div>

                    {/* File name */}
                    <span className="text-sm font-medium text-gray-800 text-center truncate w-full">
                      {item.name}
                    </span>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(item.id)}
                      className="absolute -top-3 -right-3 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-label="Remove file"
                    >
                      <Trash2 className="w-5 h-5" />
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
<<<<<<< HEAD
                  dateAbsent: "",
                  dateAbsentEnd: "",
=======
                  startDateAbsent: "",
                  endDateAbsent: "",
>>>>>>> origin/jordan-v4
                  attachments: [],
                });
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
