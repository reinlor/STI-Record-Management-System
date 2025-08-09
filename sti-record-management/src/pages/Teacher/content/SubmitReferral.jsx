import React, { useState } from "react";
import axios from 'axios';

function SubmitReferralForm() {
    const [referral, setReferral] = useState({});

    function handleReferralForm(event, name) {
        const { value, type, checked } = event.target;
        setReferral((prev) => {
            if (type === "radio") {
                // For radio buttons, set the value directly
                return { ...prev, [name]: value };
            }
            if (type === "checkbox") {
                // For checkboxes, handle an array of values
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
            // For other input types, set the value directly
            return { ...prev, [name]: value };
        });
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const res = await axios.post("/referral/add", referral);
        } catch (error) {
            console.error("Referral submission failed:", error.message);
        }
        
        console.log("Form submitted:", referral);
    };

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
                className="border border-gray-400 rounded px-3 py-2 w-full mt-1"
                value={referral.quarterSemester || ""}
                onChange={(e) => handleReferralForm(e, "quarterSemester")}
                disabled={!gradeLevel}
            >
                <option value="">Choose</option>
                {options}
            </select>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 mx-auto mt-8 w-full max-w-5xl">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {/* Left Column */}
                <div className="space-y-4">
                    <div>
                        <label className="font-semibold">School Year:</label>
                        <input
                            type="text"
                            className="border border-gray-400 rounded px-3 py-2 w-full mt-1"
                            value={referral.schoolYear || ""}
                            onChange={(e) => handleReferralForm(e, "schoolYear")}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="font-semibold">Level:</label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="gradeLevel"
                                value="Senior High"
                                checked={referral.gradeLevel === "Senior High"}
                                onChange={(e) => handleReferralForm(e, "gradeLevel")}
                                className="form-radio"
                            />
                            <span className="ml-2">Senior High</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="gradeLevel"
                                value="Tertiary"
                                checked={referral.gradeLevel === "Tertiary"}
                                onChange={(e) => handleReferralForm(e, "gradeLevel")}
                                className="form-radio"
                            />
                            <span className="ml-2">Tertiary</span>
                        </label>
                    </div>
                    <div>
                        <label className="font-semibold">Quarter/Semester:</label>
                        {handleQuarterSem()}
                    </div>
                    <div>
                        <label className="font-semibold">Student Name:</label>
                        <input
                            type="text"
                            className="border border-gray-400 rounded px-3 py-2 w-full mt-1"
                            value={referral.studentName || ""}
                            onChange={(e) => handleReferralForm(e, "studentName")}
                        />
                    </div>
                    <div>
                        <label className="font-semibold">Program and Section:</label>
                        <input
                            type="text"
                            className="border border-gray-400 rounded px-3 py-2 w-full mt-1"
                            value={referral.programSection || ""}
                            onChange={(e) => handleReferralForm(e, "programSection")}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="font-semibold">Gender:</label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="gender"
                                value="Male"
                                checked={referral.gender === "Male"}
                                onChange={(e) => handleReferralForm(e, "gender")}
                                className="form-radio"
                            />
                            <span className="ml-2">Male</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="gender"
                                value="Female"
                                checked={referral.gender === "Female"}
                                onChange={(e) => handleReferralForm(e, "gender")}
                                className="form-radio"
                            />
                            <span className="ml-2">Female</span>
                        </label>
                    </div>
                    <div>
                        <label className="font-semibold">Status:</label>
                        <input
                            type="text"
                            className="border border-gray-400 rounded px-3 py-2 w-full mt-1"
                            value={referral.status || ""}
                            onChange={(e) => handleReferralForm(e, "status")}
                        />
                    </div>
                    <div>
                        <label className="font-semibold">Age:</label>
                        <input
                            type="text"
                            className="border border-gray-400 rounded px-3 py-2 w-full mt-1"
                            value={Number(referral.age) || ""}
                            onChange={(e) => handleReferralForm(e, "age")}
                        />
                    </div>
                    <div>
                        <label className="font-semibold">Referred by:</label>
                        <input
                            type="text"
                            className="border border-gray-400 rounded px-3 py-2 w-full mt-1"
                            // papalitan soon ng automatic na magdidisplay yung pangalan ng user
                            value={referral.referredBy || ""} 
                            onChange={(e) => handleReferralForm(e, "referredBy")}
                        />
                    </div>
                    <div>
                        <label className="font-semibold">Areas of Concern:</label>
                        <div className="flex flex-col gap-1 mt-1">
                            {["Counseling", "Classroom Observation", "Group Selection", "Evaluation/Assessment", "Consultation", "Other"].map((concern) => (
                                <label key={concern} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        value={concern}
                                        checked={referral.concerns?.includes(concern) || false}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setReferral((prev) => {
                                                const concerns = prev.concerns ? [...prev.concerns] : [];
                                                if (checked) {
                                                    if (!concerns.includes(concern)) concerns.push(concern);
                                                } else {
                                                    const index = concerns.indexOf(concern);
                                                    if (index > -1) concerns.splice(index, 1);
                                                }
                                                return { ...prev, concerns };
                                            });
                                        }}
                                        className="form-checkbox"
                                    />
                                    <span className="ml-2">{concern}</span>
                                    {concern === "Other" && (
                                        <input
                                            type="text"
                                            className="border border-gray-400 rounded px-2 py-1 ml-2"
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
                <div className="space-y-4">
                    <div>
                        <label className="font-semibold">Level of Priority:</label>
                        <select
                            className="border border-gray-400 rounded px-3 py-2 w-full mt-1"
                            value={referral.priorityLevel || ""}
                            onChange={(e) => handleReferralForm(e, "priorityLevel")}
                        >
                            <option value="">Select Priority</option>
                            <option value="High Priority">High Priority</option>
                            <option value="Medium Priority">Medium Priority</option>
                            <option value="Low Priority">Low Priority</option>
                        </select>
                    </div>
                    <div>
                        <label className="font-semibold">Actions Taken Before Referral:</label>
                        <textarea
                            className="border border-gray-400 rounded px-3 py-2 w-full mt-1 resize-none h-32"
                            value={referral.actionsBefore || ""}
                            onChange={(e) => handleReferralForm(e, "actionsBefore")}
                        />
                    </div>
                    <div>
                        <label className="font-semibold">Reasons for Referral / Comments:</label>
                        <textarea
                            className="border border-gray-400 rounded px-3 py-2 w-full mt-1 resize-none h-32"
                            value={referral.reasons || ""}
                            onChange={(e) => handleReferralForm(e, "reasons")}
                        />
                    </div>
                    <div>
                        <label className="font-semibold">Counselor's Initial Action:</label>
                        <textarea
                            className="border border-gray-400 rounded px-3 py-2 w-full mt-1 resize-none h-32"
                            value={referral.counselorAction || ""}
                            onChange={(e) => handleReferralForm(e, "counselorAction")}
                        />
                    </div>
                    <div>
                        <label className="font-semibold">Feedback Date:</label>
                        <input
                            type="date"
                            className="border border-gray-400 rounded px-3 py-2 w-full mt-1"
                            value={referral.feedbackDate || ""}
                            onChange={(e) => handleReferralForm(e, "feedbackDate")}
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="font-semibold">Prepared By:</label>
                            <input
                                type="text"
                                className="border border-gray-400 rounded px-3 py-2 w-full mt-1"
                                value={referral.preparedBy || ""}
                                onChange={(e) => handleReferralForm(e, "preparedBy")}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="font-semibold">Date:</label>
                            <input
                                type="date"
                                className="border border-gray-400 rounded px-3 py-2 w-full mt-1"
                                value={referral.preparedDate || ""}
                                onChange={(e) => handleReferralForm(e, "preparedDate")}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="font-semibold">Received By:</label>
                            <input
                                type="text"
                                className="border border-gray-400 rounded px-3 py-2 w-full mt-1"
                                value={referral.receivedBy || ""}
                                onChange={(e) => handleReferralForm(e, "receivedBy")}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="font-semibold">Date:</label>
                            <input
                                type="date"
                                className="border border-gray-400 rounded px-3 py-2 w-full mt-1"
                                value={referral.receivedDate || ""}
                                onChange={(e) => handleReferralForm(e, "receivedDate")}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                        <button
                            type="button"
                            className="flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Submit
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default SubmitReferralForm;