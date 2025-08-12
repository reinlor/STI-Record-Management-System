import React, { useState } from 'react';

// The main component for your Request Slip module
export default function StudentRequestSlip() {
    // State to manage the active slip type (tab)
    const [activeSlip, setActiveSlip] = useState('Absent');
    
    // State to hold form data, could be expanded for different fields
    const [formData, setFormData] = useState({
        fullName: '',
        studentNumber: '',
        program: '',
        yearAndSection: '',
        email: '',
        reason: '',
        dateAbsent: '',
        daysAbsent: '',
        attachments: null,
    });

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    // Handle file changes
    const handleFileChange = (e) => {
        setFormData(prevData => ({ ...prevData, attachments: e.target.files }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitting form for:', activeSlip, formData);
        alert(`Submitting form for ${activeSlip}.`);
    };

    // Tab data for rendering
    const slipTypes = [
        { id: 'Absent', label: 'Absent Slip', icon: '📝' },
        { id: 'Late', label: 'Late Slip', icon: '⏰' },
        { id: 'ID Pass', label: 'ID Pass', icon: '🆔' },
        { id: 'Uniform Pass', label: 'Uniform Pass', icon: '👕' },
    ];

    // Tailwind classes for consistent input styling
    const inputClasses = "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500";

    return (
        <div className="animate-fade-in min-h-screen flex flex-col items-center pt-4 font-sans">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl">
                {/* Header and Tabs */}
                <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-4">Request Slip</h2>

                <div className="flex flex-wrap gap-2 mb-8">
                    {slipTypes.map(slip => (
                        <button
                            key={slip.id}
                            type="button"
                            onClick={() => setActiveSlip(slip.id)}
                            className={`flex items-center gap-2 py-2 px-4 rounded-full text-sm font-semibold transition-colors duration-200 ${
                                activeSlip === slip.id
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Student Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student Number</label>
                                <input
                                    type="text"
                                    name="studentNumber"
                                    value={formData.studentNumber}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Program/Strand</label>
                                <input
                                    type="text"
                                    name="program"
                                    value={formData.program}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year and Section</label>
                                <input
                                    type="text"
                                    name="yearAndSection"
                                    value={formData.yearAndSection}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Conditional Slip-specific Fields */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">{activeSlip} Slip Details</h2>
                        
                        {/* Fields for Absent Slip */}
                        {activeSlip === 'Absent' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Absent</label>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">No. of Days Absent</label>
                                    <input
                                        type="number"
                                        name="daysAbsent"
                                        value={formData.daysAbsent}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Absent</label>
                                    <textarea
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleChange}
                                        rows="4"
                                        className={inputClasses}
                                        placeholder="Please provide a detailed reason for your absence."
                                        required
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        {/* Fields for Late, Uniform Pass, and ID Pass Slips */}
                        {(activeSlip === 'Late' || activeSlip === 'Uniform Pass' || activeSlip === 'ID Pass') && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Reason for {activeSlip === 'Late' ? 'being late' : activeSlip === 'Uniform Pass' ? 'not wearing uniform' : 'not wearing ID'}
                                    </label>
                                    <textarea
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleChange}
                                        rows="4"
                                        className={inputClasses}
                                        placeholder={`Please provide a detailed reason for your ${activeSlip.toLowerCase()}.`}
                                        required
                                    ></textarea>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Attachment Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-700 mb-2">Attachments</h2>
                        
                        {/* Absent Slip Attachments Description */}
                        {activeSlip === 'Absent' && (
                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    Please attach the following documents:
                                </p>
                                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                                    <li>Excuse letter (if 1-2 days absent only)</li>
                                    <li>Medical certificate (if 3 or more days absent)</li>
                                    <li>Photocopy of parent's/guardian's valid ID with signature</li>
                                </ul>
                            </div>
                        )}
                        
                        {/* Other Slip Attachments Description */}
                        {(activeSlip === 'Late' || activeSlip === 'Uniform Pass' || activeSlip === 'ID Pass') && (
                            <p className="text-sm font-medium text-gray-700 mb-4">
                                Please attach proof for your request.
                            </p>
                        )}
                        
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg
                                    className="w-10 h-10 mb-3 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v8"
                                    ></path>
                                </svg>
                                <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span>
                                </p>
                                <p className="text-xs text-gray-500">PDF, JPG, PNG, etc.</p>
                            </div>
                            <input
                                type="file"
                                name="attachments"
                                onChange={handleFileChange}
                                multiple
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setFormData({
                                    fullName: '',
                                    studentNumber: '',
                                    program: '',
                                    yearAndSection: '',
                                    email: '',
                                    reason: '',
                                    dateAbsent: '',
                                    daysAbsent: '',
                                    attachments: null,
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