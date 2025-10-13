import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import LoadingDots from "../../../component/Loading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Debounce helper
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

function SubmitReferralForm({ teacher = {}, onCancel, onSuccess }) {
  const [referral, setReferral] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [violations, setViolations] = useState([]);
  const [schoolPeriod, setSchoolPeriod] = useState({});
  const [categories, setCategories] = useState([]);
  const [allViolations, setAllViolations] = useState({});
  const [isStudentLoading, setIsStudentLoading] = useState(false);
  const [studentNotFound, setStudentNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // NEW

  // Track recently auto-filled fields for highlight animation
  const [highlightedFields, setHighlightedFields] = useState({});
  const highlightField = (field) => {
    setHighlightedFields((prev) => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setHighlightedFields((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }, 1500);
  };

  const debouncedStudentID = useDebounce(referral.sid || "", 500);

  // Fetch school period and violation categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const schoolRes = await axios.get("/content/schoolPeriod/get");
        setSchoolPeriod(schoolRes.data);
        setReferral((prev) => ({
          ...prev,
          schoolYear: schoolRes.data.schoolYear,
        }));

        const violationsRes = await axios.get("/content/violations/get");
        const data = violationsRes.data;
        setAllViolations(data);
        setCategories(Object.keys(data));
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update violations and priority
  useEffect(() => {
    if (!referral.counselingTypeCategory) return;

    const categoryData = allViolations[referral.counselingTypeCategory];
    if (categoryData) {
      setViolations(categoryData.violations || []);
      setReferral((prev) => ({
        ...prev,
        priorityLevel: categoryData.priorityLevel || "",
      }));
    } else {
      setViolations([]);
      setReferral((prev) => ({ ...prev, priorityLevel: "" }));
    }
    setReferral((prev) => ({ ...prev, violation: "" }));
  }, [referral.counselingTypeCategory, allViolations]);

  // Quarter/semester auto-fill
  useEffect(() => {
    if (referral.gradeLevel === "Tertiary") {
      setReferral((prev) => ({
        ...prev,
        quarterSemester: schoolPeriod?.tertiary,
      }));
    } else if (referral.gradeLevel === "Senior High School") {
      setReferral((prev) => ({
        ...prev,
        quarterSemester: schoolPeriod?.seniorHigh,
      }));
    }
  }, [referral.gradeLevel, schoolPeriod]);

  // Teacher info on mount
  useEffect(() => {
    if (!teacher || !teacher.user?.uid || !teacher.displayName) return;

    const formatDateForInput = (date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    };

    const currentDate = new Date();
    const formattedDateForInput = formatDateForInput(currentDate);

    setReferral((prev) => ({
      ...prev,
      id: teacher.user.uid,
      referredBy: teacher.displayName,
      preparedBy: teacher.displayName,
      status: "Pending",
      email: teacher.user.email,
      preparedDate: formattedDateForInput,
    }));
  }, [teacher]);

  // Auto-fill student data
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!debouncedStudentID) return;
      setIsStudentLoading(true);
      setStudentNotFound(false);

      try {
        const { data } = await axios.get(`/student/get/${debouncedStudentID}`);
        if (data?.studentProfile) {
          const updates = {
            studentName: data.studentProfile.name || "",
            programSection:
              data.studentProfile.program && data.studentProfile.section
                ? `${data.studentProfile.program} ${data.studentProfile.section}`
                : "",
            gender: data.studentProfile.gender || "",
            gradeLevel: data.studentProfile.academicLevel || "",
          };

          setReferral((prev) => ({ ...prev, ...updates }));

          // highlight each updated field
          Object.keys(updates).forEach((field) => highlightField(field));
        } else {
          setStudentNotFound(true);
        }
      } catch (error) {
        console.error("Failed to auto-fill student data:", error.message);
        setStudentNotFound(true);
      } finally {
        setIsStudentLoading(false);
      }
    };

    fetchStudentData();
  }, [debouncedStudentID]);

  // Generic input handler
  const handleReferralForm = (event, name) => {
    const { value, type, checked } = event.target;
    setReferral((prev) => {
      if (type === "radio") return { ...prev, [name]: value };
      if (type === "checkbox") {
        const currentValues = prev[name] ? [...prev[name]] : [];
        if (checked) currentValues.push(value);
        else currentValues.splice(currentValues.indexOf(value), 1);
        return { ...prev, [name]: currentValues };
      }
      return { ...prev, [name]: value };
    });
  };

  // Submit handler
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const referralData = {
      employeeID: referral.id,
      schoolYear: referral.schoolYear,
      studentName: referral.studentName,
      sid: referral.sid,
      program: referral.programSection,
      gradeLevel: referral.gradeLevel,
      gender: referral.gender,
      status: referral.status,
      referredBy: referral.referredBy,
      areasOfConcern: referral.concerns,
      counselingTypeCategory: referral.counselingTypeCategory,
      violation: referral.violation,
      levelOfPriority: referral.priorityLevel,
      actionTaken: referral.actionsBefore,
      reasonForReferral: referral.reasons,
      email: referral.email,
    };

    try {
      await axios.post("/referral/add", referralData);

      toast.success(
        `Referral for ${referralData.studentName} has been submitted!`
      );

      setReferral((prev) => ({
        id: prev.id,
        schoolYear: prev.schoolYear,
        email: prev.email,
        referredBy: prev.referredBy,
        preparedBy: prev.preparedBy,
        preparedDate: prev.preparedDate,
        status: prev.status,
      }));

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to submit referral: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Violation input
  const handleViolationInput = () => {
    if (violations.length > 0) {
      return (
        <div>
          <label
            htmlFor="violation"
            className="block text-gray-700 font-medium mb-1"
          >
            Violation: <span className="text-red-500">*</span>
          </label>
          <select
            id="violation"
            name="violation"
            value={referral.violation || ""}
            onChange={(e) => handleReferralForm(e, "violation")}
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
            required
          >
            <option value="">Select a Violation</option>
            {referral.counselingTypeCategory !== ""
              ? violations.map((violation, index) => (
                  <option key={index} value={violation}>
                    {violation}
                  </option>
                ))
              : null}
          </select>
        </div>
      );
    }
  };

  // Category dropdown
  const handleCategoryDropDown = () => (
    <div>
      <label
        htmlFor="counselingTypeCategory"
        className="block text-gray-700 font-medium mb-1"
      >
        Counseling Type/Category: <span className="text-red-500">*</span>
      </label>
      <select
        id="counselingTypeCategory"
        name="counselingTypeCategory"
        value={referral.counselingTypeCategory || ""}
        onChange={(e) => handleReferralForm(e, "counselingTypeCategory")}
        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
        required
      >
        <option value="">Select a Category</option>
        {categories.map((category, index) => (
          <option key={index} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );

  // Global loading
  if (isLoading) {
    return <LoadingDots />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-gray-100 font-sans">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full container mx-auto border border-gray-200">
        <div className="mb-8 pb-4 border-b border-gray-200">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
            Student Referral Form
          </h2>
          <p className="text-gray-600 text-lg">
            Please fill out the details below to refer a student for counseling
            or assistance.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8"
        >
          {/* Left column */}
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                School Year: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800"
                value={referral.schoolYear || ""}
                disabled
              />
            </div>

            {/* Student Number */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Student Number: <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  className={`w-full p-3 border rounded-lg pr-10 ${
                    studentNotFound
                      ? "border-red-400 bg-red-50 text-red-700"
                      : "border-gray-300 bg-gray-50 text-gray-800"
                  }`}
                  value={referral.sid || ""}
                  onChange={(e) => handleReferralForm(e, "sid")}
                  placeholder="Enter student number and wait to auto-fill details"
                  required
                />
                {isStudentLoading && (
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  </div>
                )}
              </div>
              {studentNotFound && (
                <p className="mt-1 text-sm text-red-600">
                  Student not found in records.
                </p>
              )}
            </div>

            {/* Level */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Level: <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-6 mt-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="gradeLevel"
                    value="Senior High School"
                    checked={referral.gradeLevel === "Senior High School"}
                    onChange={(e) => handleReferralForm(e, "gradeLevel")}
                    className="form-radio h-5 w-5 text-blue-600 rounded-full border-gray-300"
                    required
                  />
                  <span className="ml-2 text-gray-800">Senior High</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="gradeLevel"
                    value="Tertiary"
                    checked={referral.gradeLevel === "Tertiary"}
                    onChange={(e) => handleReferralForm(e, "gradeLevel")}
                    className="form-radio h-5 w-5 text-blue-600 rounded-full border-gray-300"
                    required
                  />
                  <span className="ml-2 text-gray-800">Tertiary</span>
                </label>
              </div>
            </div>

            {/* Quarter/Semester */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Quarter/Semester: <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800"
                value={referral.quarterSemester || ""}
                disabled
              />
            </div>

            {/* Student Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Student Name: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 transition-colors duration-500 ${
                  highlightedFields.studentName
                    ? "bg-yellow-100 animate-pulse"
                    : ""
                }`}
                value={referral.studentName || ""}
                onChange={(e) => handleReferralForm(e, "studentName")}
                required
              />
            </div>

            {/* Program and Section */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Program and Section: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 transition-colors duration-500 ${
                  highlightedFields.programSection
                    ? "bg-yellow-100 animate-pulse"
                    : ""
                }`}
                value={referral.programSection || ""}
                onChange={(e) => handleReferralForm(e, "programSection")}
                required
              />
            </div>

            {/* Gender */}
            <div
              className={`transition-colors duration-500 ${
                highlightedFields.gender
                  ? "bg-yellow-100 animate-pulse rounded-lg p-2"
                  : ""
              }`}
            >
              <label className="block text-gray-700 font-medium mb-1">
                Gender: <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-6 mt-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={referral.gender === "Male"}
                    onChange={(e) => handleReferralForm(e, "gender")}
                    className="form-radio h-5 w-5 text-blue-600 rounded-full border-gray-300"
                    required
                  />
                  <span className="ml-2 text-gray-800">Male</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={referral.gender === "Female"}
                    onChange={(e) => handleReferralForm(e, "gender")}
                    className="form-radio h-5 w-5 text-blue-600 rounded-full border-gray-300"
                    required
                  />
                  <span className="ml-2 text-gray-800">Female</span>
                </label>
              </div>
            </div>

            {/* Referred By */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Referred by: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-200 text-gray-800 cursor-not-allowed"
                value={referral.referredBy || ""}
                disabled
              />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {handleCategoryDropDown()}
            {handleViolationInput()}

            {/* Reasons */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Reasons for Referral / Comments:{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 resize-none h-40"
                value={referral.reasons || ""}
                onChange={(e) => handleReferralForm(e, "reasons")}
                required
              />
            </div>

            {/* Actions Before Referral */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Actions Taken Before Referral:{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 resize-none h-40"
                value={referral.actionsBefore || ""}
                onChange={(e) => handleReferralForm(e, "actionsBefore")}
                required
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="md:col-span-2 flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="py-2.5 px-6 bg-gray-200 rounded-xl hover:bg-gray-300 transition-all"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`py-2.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${
                isSubmitting
                  ? "bg-yellow-300 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-500"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubmitReferralForm;