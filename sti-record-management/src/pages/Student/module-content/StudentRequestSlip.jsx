import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { FileText, Upload, Trash2, CircleCheck, IdCard, AlertTriangle } from "lucide-react";
import { AuthContext } from "../../../AuthProvider.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingDots from "../../../component/Loading.jsx";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseClient.js"; 

export default function StudentRequestSlip() {
  const [activeSlip, setActiveSlip] = useState("Absent");
  const [student, setStudentData] = useState(null);
  const { authData } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  // Reason Combo Box
  const [absentReason, setAbsentReason] = useState(""); // "Health-Related" or "Non-Health-Related"

  // File states with preview
  const [excuseLetter, setExcuseLetter] = useState(null);
  const [parentID, setParentID] = useState(null);
  const [medicalCertificate, setMedicalCertificate] = useState(null);
  const [incidentEvidence, setIncidentEvidence] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    sid: "",
    section: "",
    program: "",
    email: "",
    dateAbsent: "",
    dateAbsentEnd: "",
    incidentDate: "",
    incidentTime: "",
    incidentLocation: "",
    personsInvolved: "",
    witnessName: "",
    witnessContact: "",
    narrative: "",
    actionsTaken: "",
  });

  useEffect(() => {
    if (!authData?.user?.uid) {
      setRequestData([]);
      return;
    }

    const uid = authData.user.uid;
    setIsLoading(true);

    try {
      const absentRef = query(collection(db, "absentSlips"), where("sid", "==", uid));
      const incidentRef = query(collection(db, "incidentReport"), where("sid", "==", uid));

      const unsubAbsent = onSnapshot(
        absentRef,
        (snapshot) => {
          const absents = snapshot.docs.map((doc) => ({
            id: doc.id,
            type: "absentSlip",
            ...doc.data(),
          }));

          setRequestData((prev) => {
            const incidents = prev.filter((x) => x.type === "incidentReport");
            return [...absents, ...incidents];
          });

          setIsLoading(false);
        },
        (err) => {
          console.error("Absent slips listener error:", err);
          setIsLoading(false);
        }
      );

      const unsubIncident = onSnapshot(
        incidentRef,
        (snapshot) => {
          const incidents = snapshot.docs.map((doc) => ({
            id: doc.id,
            type: "incidentReport",
            ...doc.data(),
          }));

          setRequestData((prev) => {
            const absents = prev.filter((x) => x.type === "absentSlip");
            return [...absents, ...incidents];
          });

          setIsLoading(false);
        },
        (err) => {
          console.error("Incident reports listener error:", err);
          setIsLoading(false);
        }
      );

      return () => {
        unsubAbsent();
        unsubIncident();
      };
    } catch (err) {
      console.error("Error setting up Firestore listeners:", err);
      setRequestData([]);
      setIsLoading(false);
    }
  }, [authData]);

  // Helper to compute absent days
  const getAbsentDays = () => {
    if (!formData.dateAbsent || !formData.dateAbsentEnd) return 0;
    const start = new Date(formData.dateAbsent);
    const end = new Date(formData.dateAbsentEnd);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  // File upload with preview
  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.type;
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(fileType)) {
        toast.error("Invalid file type. Only image files (JPEG, PNG, GIF) are allowed.");
        e.target.value = null;
        return;
      }
      setFile({
        id: crypto.randomUUID(),
        file: file,
        name: file.name,
        preview: URL.createObjectURL(file),
      });
    }
    e.target.value = null;
  };

  const handleRemoveFile = (fileObj, setFile) => {
    if (fileObj?.preview) {
      URL.revokeObjectURL(fileObj.preview);
    }
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Show loading toast
    const toastId = toast.loading("Submitting, please wait...");

    const form = new FormData();
    form.append("name", formData.name);
    form.append("sid", formData.sid);
    form.append("section", formData.section);
    form.append("program", formData.program);
    form.append("email", formData.email);

    let endpoint = "";

    if (activeSlip === "Absent") {
      form.append("typeOfSlip", "Absent Slip");
      form.append("dateAbsentEnd", formData.dateAbsentEnd);
      form.append("dateAbsent", formData.dateAbsent);
      form.append("reason", absentReason); //Reason of Absence nilagay ko nalang reason para gumana to sa backend 

      const absentDays = getAbsentDays();

      // Health-Related: require medical certificate only if 3 or more days
      if (absentReason === "Health-Related") {
        if (!excuseLetter || !parentID) {
          toast.error("Excuse Letter and Parent's/Guardian's ID are required.");
          setIsLoading(false);
          return;
        }
        form.append("attachments", excuseLetter.file);
        if (absentDays >= 3) {
          if (!medicalCertificate) {
            toast.error("Medical Certificate is required for 3 or more days of Health-Related absence.");
            setIsLoading(false);
            return;
          }
          form.append("attachments", medicalCertificate.file);
        }
        form.append("attachments", parentID.file);
      } else if (absentReason === "Non-Health-Related") {
        if (!excuseLetter || !parentID) {
          toast.error("Excuse Letter and Parent's/Guardian's ID are required.");
          setIsLoading(false);
          return;
        }
        form.append("attachments", excuseLetter.file);
        form.append("attachments", parentID.file);
      } else {
        toast.error("Please select a Reason for Absence.");
        setIsLoading(false);
        return;
      }

      endpoint = "/slip/absentSlip/add";
    } else if (activeSlip === "Report") {
      form.append("typeOfSlip", "Incident Report");
      form.append("dateOfIncident", formData.incidentDate);
      form.append("incidentTime", formData.incidentTime);
      form.append("locationOfIncident", formData.incidentLocation);
      form.append("personInvolved", formData.personsInvolved);
      form.append("witnessName", formData.witnessName);
      form.append("witnessContact", formData.witnessContact);
      form.append("narrativeReport", formData.narrative);
      form.append("actionTaken", formData.actionsTaken);
      form.append("remarks", "");

      incidentEvidence.forEach((evidence) => {
        form.append("attachments", evidence.file);
      });

      endpoint = "/incidentReport/add";
    }

    try {
      await axios.post(endpoint, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.update(toastId, { render: "Form submitted successfully!", type: "success", isLoading: false, autoClose: 2000 });
      setFormData((prev) => ({
        ...prev,
        dateAbsent: "",
        dateAbsentEnd: "",
        incidentDate: "",
        incidentTime: "",
        incidentLocation: "",
        personsInvolved: "",
        witnessName: "",
        witnessContact: "",
        narrative: "",
        actionsTaken: "",
      }));
      if (excuseLetter?.preview) URL.revokeObjectURL(excuseLetter.preview);
      if (parentID?.preview) URL.revokeObjectURL(parentID.preview);
      if (medicalCertificate?.preview) URL.revokeObjectURL(medicalCertificate.preview);
      incidentEvidence.forEach(f => f.preview && URL.revokeObjectURL(f.preview));

      setExcuseLetter(null);
      setParentID(null);
      setMedicalCertificate(null);
      setIncidentEvidence([]);
      setAbsentReason("");
    } catch (error) {
      console.error("Submission error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      toast.update(toastId, {
        render: error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to submit form. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFileId = (label) => {
    return label.toLowerCase().replace(/\s/g, "-").replace(/['/]/g, '');
  };

  // File upload with preview
  const renderFileUpload = (fileObj, setFile, label, guidelines = null) => {
    const fileId = getFileId(label);
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {guidelines && <p className="text-xs text-gray-500 mb-1">{guidelines}</p>}
        {!fileObj ? (
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
          <div className="flex flex-col items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-yellow-400 transition-colors duration-200 relative">
            <div className="w-40 h-40 flex justify-center items-center overflow-hidden rounded-md border border-gray-300 mb-2 bg-gray-50">
              <img
                src={fileObj.preview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-sm font-medium text-gray-800 text-center break-all mb-2">
              {fileObj.name}
            </span>
            <button
              type="button"
              onClick={() => handleRemoveFile(fileObj, setFile)}
              className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
              aria-label="Remove file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const slipTypes = [
    { id: "Absent", label: "Absent Slip", icon: FileText },
    { id: "Report", label: "Incident Report Form", icon: AlertTriangle },
  ];

  const inputClasses =
    "w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200";

  if (!student) {
    return <LoadingDots />;
  }
  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-gray-100 font-sans">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full container mx-auto border border-gray-200">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <h2 className="text-3xl font-extrabold text-gray-900">Student Request Slip</h2>
          <CircleCheck className="text-yellow-400 w-8 h-8" />
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {slipTypes.map((slip) => (
            <button
              key={slip.id}
              type="button"
              onClick={() => {
                setActiveSlip(slip.id);
                setAbsentReason("");
                setExcuseLetter(null);
                setParentID(null);
                setMedicalCertificate(null);
              }}
              className={`flex items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${activeSlip === slip.id
                ? "bg-yellow-400 text-black shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-black"
                }`}
            >
              <slip.icon className="w-5 h-5" />
              {slip.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Student Info */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
              <IdCard className="w-6 h-6 text-gray-500" />
              Student Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name: <span className="text-red-500">*</span>
                </label>
                <input type="text" value={formData.name} readOnly className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Number: <span className="text-red-500">*</span>
                </label>
                <input type="text" value={formData.sid} readOnly className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program and Section: <span className="text-red-500">*</span>
                </label>
                <input type="text" value={`${formData.program} ${formData.section}`} readOnly className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email: <span className="text-red-500">*</span>
                </label>
                <input type="email" value={formData.email} readOnly className={inputClasses} />
              </div>
            </div>
          </div>

          {/* Slip-specific fields */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-gray-500" />
              {activeSlip} Details
            </h2>

            {activeSlip === "Absent" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date of Absence: <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={startDateRef}
                      type="date"
                      name="dateAbsent"
                      value={formData.dateAbsent}
                      onChange={handleChange}
                      className={inputClasses}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date of Absence: <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={endDateRef}
                      type="date"
                      name="dateAbsentEnd"
                      value={formData.dateAbsentEnd}
                      onChange={handleChange}
                      className={inputClasses}
                      required
                    />
                  </div>
                </div>
                {/* Reason Combo Box */}
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Absence: <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={absentReason}
                    onChange={(e) => setAbsentReason(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
                    required
                  >
                    <option value="">Select Reason</option>
                    <option value="Health-Related">Health-Related</option>
                    <option value="Non-Health-Related">Non-Health-Related</option>
                  </select>
                </div>
              </div>
            )}

            {activeSlip === "Report" && (
              <div className="space-y-6">
                {/* Incident Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Incident: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="incidentDate"
                      value={formData.incidentDate}
                      onChange={handleChange}
                      className={inputClasses}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time of Incident: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="incidentTime"
                      value={formData.incidentTime}
                      onChange={handleChange}
                      className={inputClasses}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location of Incident: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="incidentLocation"
                    value={formData.incidentLocation}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="e.g. Classroom, Hallway, Canteen"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Person/s Involved: <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="personsInvolved"
                    value={formData.personsInvolved}
                    onChange={handleChange}
                    rows="2"
                    className={`${inputClasses} resize-none`}
                    placeholder="List names separated by commas or line breaks"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Witness Name (if any)
                    </label>
                    <input
                      type="text"
                      name="witnessName"
                      value={formData.witnessName}
                      onChange={handleChange}
                      className={inputClasses}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Witness Contact Info
                    </label>
                    <input
                      type="text"
                      name="witnessContact"
                      value={formData.witnessContact}
                      onChange={handleChange}
                      className={inputClasses}
                      placeholder="Phone or Email (Optional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Narrative of the Incident: <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="narrative"
                    value={formData.narrative}
                    onChange={handleChange}
                    rows="4"
                    className={`${inputClasses} resize-none`}
                    placeholder="Provide a detailed description of the incident"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actions Taken: <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="actionsTaken"
                    value={formData.actionsTaken}
                    onChange={handleChange}
                    rows="3"
                    className={`${inputClasses} resize-none`}
                    placeholder="List or explain the actions you took after the incident."
                    required
                  />
                </div>

                {/* Attach Supporting Evidence */}
                <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Upload className="w-6 h-6 text-gray-500" />
                    Attach Supporting Evidence: <span className="text-red-500">*</span>
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    You may upload up to <span className="font-semibold">5 images</span> (JPEG, PNG, or GIF). At least one attachment is required for Incident Reports.
                    Please make sure your evidence is clear and directly related to the incident.
                  </p>

                  <div className="space-y-3">
                    <input
                      id="incidentEvidence"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

                        if (files.length > 5) {
                          toast.error("You can only upload up to 5 images.");
                          e.target.value = null;
                          return;
                        }

                        for (const file of files) {
                          if (!allowedTypes.includes(file.type)) {
                            toast.error("Only JPEG, PNG, or GIF images are allowed.");
                            e.target.value = null;
                            return;
                          }
                        }

                        setIncidentEvidence(
                          files.map((file) => ({
                            id: crypto.randomUUID(),
                            file,
                            name: file.name,
                            preview: URL.createObjectURL(file),
                          }))
                        );
                        e.target.value = null;
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="incidentEvidence"
                      className="inline-block cursor-pointer py-2.5 px-6 bg-yellow-400 text-black font-semibold rounded-lg shadow-md hover:bg-yellow-500 hover:-translate-y-0.5 transform transition-all duration-300"
                    >
                      <div className="flex items-center space-x-2">
                        <Upload className="w-5 h-5" />
                        <span>Choose Files</span>
                      </div>
                    </label>

                    {/* Preview uploaded files */}
                    {incidentEvidence.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {incidentEvidence.map((fileObj) => (
                          <div
                            key={fileObj.id}
                            className="flex flex-col items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-yellow-400 transition-colors duration-200 relative"
                          >
                            <div className="w-32 h-32 flex justify-center items-center overflow-hidden rounded-md border border-gray-300 mb-2 bg-gray-50">
                              <img
                                src={fileObj.preview}
                                alt="Preview"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-800 text-center break-all mb-2">
                              {fileObj.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                URL.revokeObjectURL(fileObj.preview);
                                setIncidentEvidence((prev) =>
                                  prev.filter((f) => f.id !== fileObj.id)
                                );
                              }}
                              className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                              aria-label="Remove file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Attachments for Absent Slip */}
          {activeSlip === "Absent" && absentReason && (
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
              <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Upload className="w-6 h-6 text-gray-500" />
                Attachments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderFileUpload(
                  excuseLetter,
                  setExcuseLetter,
                  "Excuse Letter",
                  "Upload a signed excuse letter from your parent/guardian. Required for all absences."
                )}
                {absentReason === "Health-Related" && (
                  renderFileUpload(
                    medicalCertificate,
                    setMedicalCertificate,
                    "Medical Certificate (required if 3+ consecutive days)",
                    "Upload a medical certificate from a licensed doctor if absent for 3 or more consecutive days."
                  )
                )}
                {renderFileUpload(
                  parentID,
                  setParentID,
                  "Parent's/Guardian's ID",
                  "Upload a clear photo of your parent’s/guardian’s valid ID with visible signature. Required to verify the excuse letter."
                )}
                {absentReason === "Non-Health-Related" && (
                  <div className="hidden md:block"></div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => {
                if (excuseLetter?.preview) URL.revokeObjectURL(excuseLetter.preview);
                if (parentID?.preview) URL.revokeObjectURL(parentID.preview);
                if (medicalCertificate?.preview) URL.revokeObjectURL(medicalCertificate.preview);
                incidentEvidence.forEach(f => f.preview && URL.revokeObjectURL(f.preview));

                setFormData({
                  name: [student?.studentProfile?.firstName, student?.studentProfile?.middleName, student?.studentProfile?.lastName, student?.studentProfile?.suffix].filter(Boolean).join(' ') || "",
                  sid: student?.sid || "",
                  section: student?.studentProfile?.section || "",
                  program: student?.studentProfile?.program || "",
                  email: student?.contactInfo?.email || "",
                  dateAbsent: "",
                  dateAbsentEnd: "",
                  incidentDate: "",
                  incidentTime: "",
                  incidentLocation: "",
                  personsInvolved: "",
                  witnessName: "",
                  witnessContact: "",
                  narrative: "",
                  actionsTaken: "",
                });
                setExcuseLetter(null);
                setParentID(null);
                setMedicalCertificate(null);
                setIncidentEvidence([]);
                setAbsentReason("");
              }}
              className="py-2.5 px-6 bg-gray-200 rounded-xl text-gray-800 font-semibold shadow-sm hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 bg-yellow-400 text-black font-semibold rounded-xl shadow-lg hover:bg-yellow-500 hover:-translate-y-0.5 transform transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}