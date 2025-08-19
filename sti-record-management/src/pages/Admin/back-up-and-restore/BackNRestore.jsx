import React from 'react';
import server from '../../../assets/data-server.png';

function BackNRestore() {
    return (
        // Main container for the page content.
        // It's flex-centered to ensure the content is well-positioned on the screen.
        <div className="bg-gray-100 flex items-start justify-center p-6 h-full">
            {/* White content box with shadow and rounded corners */}
            <div className="w-full h-full bg-white rounded-lg p-4 shadow-sm flex flex-col">
                {/* Page Title */}
                <p className="text-4xl font-bold text-gray-800 mb-2">Back-up and Restore</p>
                {/* Page Description */}
                <p className="text-gray-600 mb-8">Create a back-up for emergency and restore files</p>

                {/* Main Content Box for Backup/Download Options */}
                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    {/* Icon representing backup/files */}
                    <img src={server} alt="User" className="w-75 h-75 object-cover" />

                    {/* Section Heading for download options */}
                    <h2 className="text-2xl font-bold text-black mb-6">Save your files, download it here:</h2>

                    {/* Checkbox Grid for Data Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8 mb-8 text-gray-700">
                        {/* Guidance Head Checkbox Group */}
                        <div className="flex flex-col">
                            <span className="font-semibold text-lg text-black mb-2">Guidance Head:</span>
                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out" />
                                <span className="ml-2">Student Records</span>
                            </label>
                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out" />
                                <span className="ml-2">Student Case</span>
                            </label>
                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out" />
                                <span className="ml-2">Users</span>
                            </label>
                            <label className="inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out" />
                                <span className="ml-2">Student Wellness</span>
                            </label>
                        </div>

                        {/* Disciplinary Officer Checkbox Group */}
                        <div className="flex flex-col md:col-span-1 lg:col-span-2">
                            <span className="font-semibold text-lg text-black mb-2">Disciplinary Officer:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4">
                                <label className="inline-flex items-center mb-1 cursor-pointer">
                                    <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out" />
                                    <span className="ml-2">Student Records (Basic)</span>
                                </label>

                                <label className="inline-flex items-center mb-1 cursor-pointer">
                                    <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out" />
                                    <span className="ml-2">Request Slip and History</span>
                                </label>

                                <label className="inline-flex items-center mb-1 cursor-pointer">
                                    <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out" />
                                    <span className="ml-2">Student Case (Basic)</span>
                                </label>
                                
                                <label className="inline-flex items-center mb-1 cursor-pointer">
                                    <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out" />
                                    <span className="ml-2">Referral Forms and History</span>
                                </label>
                                <label className="inline-flex items-center mb-1 cursor-pointer">
                                    <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out" />
                                    <span className="ml-2">Student Wellness</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Download Button */}
                    <button className="bg-[#0B1320] hover:bg-[#1A2635] text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out flex items-center justify-center text-lg">
                        Download (.xlsx)
                        {/* Download icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-6 h-6 ml-3"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BackNRestore;
