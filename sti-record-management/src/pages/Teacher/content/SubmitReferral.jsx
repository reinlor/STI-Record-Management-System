import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

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

    const debouncedStudentID = useDebounce(referral.sid || "", 500);

    // Fetch school period and violation categories from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const schoolRes = await axios.get("/content/schoolPeriod/get");
                setSchoolPeriod(schoolRes.data);
                setReferral(prev => ({ ...prev, schoolYear: schoolRes.data.schoolYear }));

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

    // Update violations and priority level when category changes
    useEffect(() => {
        if (!referral.counselingTypeCategory) return;

        const categoryData = allViolations[referral.counselingTypeCategory];
        if (categoryData) {
            setViolations(categoryData.violations || []);
            setReferral(prev => ({ ...prev, priorityLevel: categoryData.priorityLevel || "" }));
        } else {
            setViolations([]);
            setReferral(prev => ({ ...prev, priorityLevel: "" }));
        }
        setReferral(prev => ({ ...prev, violation: "" }));
    }, [referral.counselingTypeCategory, allViolations]);

    // Set quarter/semester based on grade level
    useEffect(() => {
        if (referral.gradeLevel === "Tertiary") {
            setReferral(prev => ({ ...prev, quarterSemester: schoolPeriod?.tertiary }));
        } else if (referral.gradeLevel === "Senior High School") {
            setReferral(prev => ({ ...prev, quarterSemester: schoolPeriod?.seniorHigh }));
        }
    }, [referral.gradeLevel, schoolPeriod]);

    // Set teacher info on mount
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

        setReferral(prev => ({
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

            try {
                const { data } = await axios.get(`/student/get/${debouncedStudentID}`);
                if (data?.studentProfile) {
                    setReferral(prev => ({
                        ...prev,
                        studentName: data.studentProfile.name || "",
                        programSection: data.studentProfile.program && data.studentProfile.section
                            ? `${data.studentProfile.program} ${data.studentProfile.section}`
                            : "",
                        age: data.studentProfile.age || "",
                        gender: data.studentProfile.gender || "",
                        gradeLevel: data.studentProfile.academicLevel || "",
                    }));
                }
            } catch (error) {
                console.error("Failed to auto-fill student data:", error.message);
            }
        };

        fetchStudentData();
    }, [debouncedStudentID]);

    // Generic input handler
    const handleReferralForm = (event, name) => {
        const { value, type, checked } = event.target;
        setReferral(prev => {
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

        const referralData = {
            employeeID: referral.id,
            schoolYear: referral.schoolYear,
            studentName: referral.studentName,
            sid: referral.sid,
            program: referral.programSection,
            gradeLevel: referral.gradeLevel,
            gender: referral.gender,
            status: referral.status,
            age: referral.age,
            referredBy: referral.referredBy,
            areasOfConcern: referral.concerns,
            counselingTypeCategory: referral.counselingTypeCategory,
            violation: referral.violation,
            actionRequired: "awaiting for response",
            levelOfPriority: referral.priorityLevel,
            actionTaken: referral.actionsBefore,
            reasonForReferral: referral.reasons,
            initialAction: "awaiting for response",
            preparedDate: referral.preparedDate,
            feedBackDate: "awaiting for response",
            receivedBy: "awaiting for response",
            receivedDate: "awaiting for response",
            email: referral.email,
        };

        const submissionPromise = axios.post("/referral/add", referralData);

        toast.promise(submissionPromise, {
            loading: "Submitting referral...",
            success: () => {
                setReferral(prev => ({
                    id: prev.id,
                    schoolYear: prev.schoolYear,
                    email: prev.email,
                    referredBy: prev.referredBy,
                    preparedBy: prev.preparedBy,
                    preparedDate: prev.preparedDate,
                    status: prev.status
                }));
                if (onSuccess) onSuccess();
                return `Referral for ${referralData.studentName} has been submitted!`;
            },
            error: (error) => `Failed to submit referral: ${error.message}`,
        });
    };

    // Render violation input dynamically
    const handleViolationInput = () => {
        if (violations.length > 0) {
            return (
                <div>
                    <label htmlFor="violation" className="block text-gray-700 font-medium mb-1">Violation:</label>
                    <select
                        id="violation"
                        name="violation"
                        value={referral.violation || ""}
                        onChange={(e) => handleReferralForm(e, "violation")}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
                    >
                        <option value="">Select a Violation</option>
                        {referral.counselingTypeCategory !== "" ? violations.map((violation, index) => (
                            <option key={index} value={violation}>{violation}</option>
                        )): null}
                    </select>
                </div>
            );
        }
    };

    // Render category dropdown
    const handleCategoryDropDown = () => (
        <div>
            <label htmlFor="counselingTypeCategory" className="block text-gray-700 font-medium mb-1">
                Counseling Type/Category:
            </label>
            <select
                id="counselingTypeCategory"
                name="counselingTypeCategory"
                value={referral.counselingTypeCategory || ""}
                onChange={(e) => handleReferralForm(e, "counselingTypeCategory")}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
            >
                <option value="">Select a Category</option>
                {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                ))}
            </select>
        </div>
    );

    // Loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-gray-100 font-sans">
            <Toaster position="top-center" reverseOrder={false} />
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full container mx-auto border border-gray-200">
                <div className="mb-8 pb-4 border-b border-gray-200">
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Student Referral Form</h2>
                    <p className="text-gray-600 text-lg">Please fill out the details below to refer a student for counseling or assistance.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
                    <div className="space-y-6">
                        {/* Left-side fields */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">School Year:</label>
                            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800" value={referral.schoolYear || ""} disabled />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Student ID:</label>
                            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800" value={referral.sid || ""} onChange={(e) => handleReferralForm(e, "sid")} />
                        </div>

                        {/* Grade Level */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Level:</label>
                            <div className="flex items-center space-x-6 mt-2">
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" name="gradeLevel" value="Senior High School" checked={referral.gradeLevel === "Senior High School"} onChange={(e) => handleReferralForm(e, "gradeLevel")} className="form-radio h-5 w-5 text-blue-600 rounded-full border-gray-300" />
                                    <span className="ml-2 text-gray-800">Senior High</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" name="gradeLevel" value="Tertiary" checked={referral.gradeLevel === "Tertiary"} onChange={(e) => handleReferralForm(e, "gradeLevel")} className="form-radio h-5 w-5 text-blue-600 rounded-full border-gray-300" />
                                    <span className="ml-2 text-gray-800">Tertiary</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Quarter/Semester:</label>
                            <input className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800" value={referral.quarterSemester || ""} disabled />
                        </div>

                        {/* Student Name */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Student Name:</label>
                            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800" value={referral.studentName || ""} onChange={(e) => handleReferralForm(e, "studentName")} />
                        </div>

                        {/* Program and Section */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Program and Section:</label>
                            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800" value={referral.programSection || ""} onChange={(e) => handleReferralForm(e, "programSection")} />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Gender:</label>
                            <div className="flex items-center space-x-6 mt-2">
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" name="gender" value="Male" checked={referral.gender === "Male"} onChange={(e) => handleReferralForm(e, "gender")} className="form-radio h-5 w-5 text-blue-600 rounded-full border-gray-300" />
                                    <span className="ml-2 text-gray-800">Male</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" name="gender" value="Female" checked={referral.gender === "Female"} onChange={(e) => handleReferralForm(e, "gender")} className="form-radio h-5 w-5 text-blue-600 rounded-full border-gray-300" />
                                    <span className="ml-2 text-gray-800">Female</span>
                                </label>
                            </div>
                        </div>

                        {/* Age */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Age:</label>
                            <input type="number" className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800" value={referral.age || ""} onChange={(e) => handleReferralForm(e, "age")} />
                        </div>

                        {/* Referred By */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Referred by:</label>
                            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg bg-gray-200 text-gray-800 cursor-not-allowed" value={referral.referredBy || ""} disabled />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {handleCategoryDropDown()}
                        {handleViolationInput()}

                        {/* Actions Taken Before Referral */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Actions Taken Before Referral:</label>
                            <textarea className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 resize-none h-40" value={referral.actionsBefore || ""} onChange={(e) => handleReferralForm(e, "actionsBefore")} />
                        </div>

                        {/* Reasons for Referral */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Reasons for Referral / Comments:</label>
                            <textarea className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 resize-none h-40" value={referral.reasons || ""} onChange={(e) => handleReferralForm(e, "reasons")} />
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="md:col-span-2 flex justify-end gap-4 pt-6 border-t border-gray-200">
                        <button type="button" className="py-2.5 px-6 bg-gray-200 rounded-xl hover:bg-gray-300 transition-all" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="py-2.5 px-6 bg-yellow-400 rounded-xl hover:bg-yellow-500 transition-all">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SubmitReferralForm;
