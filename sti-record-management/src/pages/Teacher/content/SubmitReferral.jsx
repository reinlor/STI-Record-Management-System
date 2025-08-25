import React, { useState, useEffect } from "react";
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Mail, User, Phone, Briefcase, PlusCircle, CheckCircle, XCircle } from 'lucide-react';

// The main component for the referral form.
function SubmitReferralForm({ teacher = {}, onCancel, onSuccess }) {
    const [referral, setReferral] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // This hook fetches and sets the initial referral data when the component loads.
    useEffect(() => {
        // Ensure teacher data is available before setting initial state.
        if (!teacher || !teacher.uid || !teacher.displayName) {
            return;
        }

        // Helper function to format the current date as YYYY-MM-DD.
        function formatDateForInput(date) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${year}-${month}-${day}`;
        }

        const currentDate = new Date();
        const formattedDateForInput = formatDateForInput(currentDate);

        // Set the initial state with pre-filled values.
        setReferral(prev => ({
            ...prev,
            id: teacher.id,
            referredBy: teacher.displayName,
            preparedBy: teacher.displayName,
            status: 'Pending',
            email: teacher.email,
            preparedDate: formattedDateForInput
        }));
        setIsLoading(false);
    }, [teacher]);

    // Handles changes to form inputs (text, radio, checkbox).
    function handleReferralForm(event, name) {
        const { value, type, checked } = event.target;
        setReferral((prev) => {
            if (type === "radio") {
                return { ...prev, [name]: value };
            }
            if (type === "checkbox") {
                const currentValues = prev[name] ? [...prev[name]] : [];
                if (checked) {
                    currentValues.push(value);
                } else {
                    const index = currentValues.indexOf(value);
                    if (index > -1) {
                        currentValues.splice(index, 1);
                    }
                }
                return { ...prev, [name]: currentValues };
            }
            return { ...prev, [name]: value };
        });
    }

    // Handles form submission, including API call and toast notifications.
    const handleSubmit = async (event) => {
        event.preventDefault();

        const referralData = {
            employeeID: referral.id,
            schoolYear: referral.schoolYear,
            studentName: referral.studentName,
            program: referral.programSection,
            gradeLevel: referral.gradeLevel,
            gender: referral.gender,
            status: referral.status,
            age: referral.age,
            referredBy: referral.referredBy,
            areasOfConcern: referral.concerns,
            actionRequired: 'awaiting for response',
            levelOfPriority: referral.priorityLevel,
            actionTaken: referral.actionsBefore,
            reasonForReferral: referral.reasons,
            initialAction: 'awaiting for response',
            preparedDate: referral.preparedDate,
            feedBackDate: 'awaiting for response',
            receivedBy: 'awaiting for response',
            receivedDate: 'awaiting for response',
            email: referral.email
        };

        const submissionPromise = axios.post("/referral/add", referralData);

        toast.promise(submissionPromise, {
            loading: 'Submitting referral...',
            success: () => {
                console.log("Form submitted successfully");
                setReferral(prev => ({
                    referredBy: prev.referredBy,
                    preparedBy: prev.preparedBy,
                    preparedDate: prev.preparedDate,
                }));
                if (onSuccess) onSuccess();
                return `Referral for ${referralData.studentName} has been submitted!`;
            },
            error: (error) => {
                console.error("Referral submission failed:", error.message);
                return `Failed to submit referral: ${error.message}`;
            },
        });
    };

    // Renders the appropriate dropdown options for Quarter/Semester based on grade level.
    const handleQuarterSem = () => {
        const { gradeLevel } = referral;
        const options = [];

        if (gradeLevel === "Tertiary") {
            options.push(
                <option key="1st Semester" value="1st Semester">1st Semester</option>,
                <option key="2nd Semester" value="2nd Semester">2nd Semester</option>
            );
        } else if (gradeLevel === "Senior High") {
            options.push(
                <option key="1st Quarter" value="1st Quarter">1st Quarter</option>,
                <option key="2nd Quarter" value="2nd Quarter">2nd Quarter</option>,
                <option key="3rd Quarter" value="3rd Quarter">3rd Quarter</option>,
                <option key="4th Quarter" value="4th Quarter">4th Quarter</option>
            );
        }

        return (
            <select
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
                value={referral.quarterSemester || ""}
                onChange={(e) => handleReferralForm(e, "quarterSemester")}
                disabled={!gradeLevel}
            >
                <option value="">Choose</option>
                {options}
            </select>
        );
    };

    // Displays a loading spinner while the form is initializing.
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-gray-100 font-sans">
            <style>
                {`
                    .animate-fade-in {
                        animation: fadeIn 0.5s ease-in-out;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}
            </style>
            <Toaster position="top-center" reverseOrder={false} />

            {/* The main container div with the new animation class applied */}
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full container mx-auto border border-gray-200 animate-smooth-fade-in">
                {/* Form Header - FIX APPLIED HERE */}
                <div className="mb-8 pb-4 border-b border-gray-200">
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Student Referral Form</h2>
                    <p className="text-gray-600 text-lg">Please fill out the details below to refer a student for counseling or assistance.</p>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* School Year */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">School Year:</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
                                value={referral.schoolYear || ""}
                                onChange={(e) => handleReferralForm(e, "schoolYear")}
                            />
                        </div>

                        {/* Level */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Level:</label>
                            <div className="flex items-center space-x-6 mt-2">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="gradeLevel"
                                        value="Senior High"
                                        checked={referral.gradeLevel === "Senior High"}
                                        onChange={(e) => handleReferralForm(e, "gradeLevel")}
                                        className="form-radio h-5 w-5 text-blue-600 rounded-full border-gray-300 focus:ring-blue-500"
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
                                        className="form-radio h-5 w-5 text-blue-600 rounded-full border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-gray-800">Tertiary</span>
                                </label>
                            </div>
                        </div>

                        {/* Quarter/Semester */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Quarter/Semester:</label>
                            {handleQuarterSem()}
                        </div>

                        {/* Student Name */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Student Name:</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
                                value={referral.studentName || ""}
                                onChange={(e) => handleReferralForm(e, "studentName")}
                            />
                        </div>

                        {/* Program and Section */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Program and Section:</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
                                value={referral.programSection || ""}
                                onChange={(e) => handleReferralForm(e, "programSection")}
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Gender:</label>
                            <div className="flex items-center space-x-6 mt-2">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="Male"
                                        checked={referral.gender === "Male"}
                                        onChange={(e) => handleReferralForm(e, "gender")}
                                        className="form-radio h-5 w-5 text-blue-600 rounded-full border-gray-300 focus:ring-blue-500"
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
                                        className="form-radio h-5 w-5 text-blue-600 rounded-full border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-gray-800">Female</span>
                                </label>
                            </div>
                        </div>

                        {/* Age */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Age:</label>
                            <input
                                type="number" // Changed to number type for better input validation
                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
                                value={referral.age || ""}
                                onChange={(e) => handleReferralForm(e, "age")}
                            />
                        </div>

                        {/* Referred By */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Referred by:</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-200 text-gray-800 cursor-not-allowed"
                                value={referral.referredBy || ""}
                                onChange={(e) => handleReferralForm(e, "referredBy")}
                                disabled
                            />
                        </div>

                        {/* Areas of Concern */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Areas of Concern:</label>
                            <div className="grid grid-cols-2 gap-y-2">
                                {["Counseling", "Classroom Observation", "Group Selection", "Evaluation/Assessment", "Consultation", "Other"].map((concern) => (
                                    <label key={concern} className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            value={concern}
                                            checked={referral.concerns?.includes(concern) || false}
                                            onChange={(e) => handleReferralForm(e, "concerns")}
                                            className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-gray-800">{concern}</span>
                                        {concern === "Other" && (
                                            <input
                                                type="text"
                                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
                                                value={referral.otherConcern || ""}
                                                onChange={(e) => handleReferralForm(e, "otherConcern")}
                                                disabled={!referral.concerns?.includes("Other")}
                                                placeholder="Specify"
                                            />
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Level of Priority */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Level of Priority:</label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
                                value={referral.priorityLevel || ""}
                                onChange={(e) => handleReferralForm(e, "priorityLevel")}
                            >
                                <option value="">Select Priority</option>
                                <option className="text-red-600 font-semibold" value="High Priority">High Priority</option>
                                <option className="text-yellow-600 font-semibold" value="Medium Priority">Medium Priority</option>
                                <option className="text-green-600 font-semibold" value="Low Priority">Low Priority</option>
                            </select>
                        </div>

                        {/* Actions Taken Before Referral */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Actions Taken Before Referral:</label>
                            <textarea
                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 resize-none h-40 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
                                value={referral.actionsBefore || ""}
                                onChange={(e) => handleReferralForm(e, "actionsBefore")}
                            />
                        </div>

                        {/* Reasons for Referral / Comments */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Reasons for Referral / Comments:</label>
                            <textarea
                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 resize-none h-40 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
                                value={referral.reasons || ""}
                                onChange={(e) => handleReferralForm(e, "reasons")}
                            />
                        </div>

                        {/* Prepared By and Date */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-gray-700 font-medium mb-1">Prepared By:</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-200 text-gray-800 cursor-not-allowed"
                                    value={referral.preparedBy || ""}
                                    onChange={(e) => handleReferralForm(e, "preparedBy")}
                                    disabled
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-gray-700 font-medium mb-1">Date:</label>
                                <input
                                    type="date"
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-200 text-gray-800 cursor-not-allowed"
                                    value={referral.preparedDate || ""}
                                    onChange={(e) => handleReferralForm(e, "preparedDate")}
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                            {/* Cancel Button */}
                            <button
                                type="button"
                                className="py-2.5 px-6 bg-gray-200 border-none rounded-xl text-gray-800 font-semibold shadow-sm hover:bg-gray-300 transition-colors duration-200"
                                onClick={onCancel}
                            >
                                Cancel
                            </button>
                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="py-2.5 px-6 bg-yellow-400 text-black font-semibold rounded-xl shadow-lg hover:bg-yellow-500 hover:-translate-y-0.5 transform transition-all duration-200"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SubmitReferralForm;
