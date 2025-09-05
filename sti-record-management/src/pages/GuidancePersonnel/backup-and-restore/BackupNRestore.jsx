import React, { useContext, useState } from 'react';
import server from '../../../assets/data-server.png';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

// Mock AuthContext for demonstration.
const AuthContext = React.createContext({
    authData: { user: { access: { backupRestore: { canView: true } } } },
    logout: () => { },
});

function BackNRestore() {
    const { authData } = useContext(AuthContext);
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    const [selectedItem, setSelectedItem] = useState({});

    const handleCheckboxChange = (event) => {
        const value = event.target.value;
        const isChecked = event.target.checked;
        setSelectedItem(prev => ({
            ...prev,
            [value]: isChecked
        }));
    };

    const handleGuidanceAllCheck = (event) => {
        const isChecked = event.target.checked;
        setSelectedItem(prev => ({
            ...prev,
            studentRecord: isChecked,
            studentCase: isChecked,
            users: isChecked,
            wellness: isChecked
        }));
    };

    const handleDisciplinaryAllCheck = (event) => {
        const isChecked = event.target.checked;
        setSelectedItem(prev => ({
            ...prev,
            referralForm: isChecked,
            requestSlip: isChecked
        }));
    };

    const allGuidanceChecked = selectedItem.studentRecord && selectedItem.studentCase && selectedItem.users && selectedItem.wellness;
    const allDisciplinaryChecked = selectedItem.referralForm && selectedItem.requestSlip;
    const isGuidanceIndeterminate = (selectedItem.studentRecord || selectedItem.studentCase || selectedItem.users || selectedItem.wellness) && !allGuidanceChecked;
    const isDisciplinaryIndeterminate = (selectedItem.referralForm || selectedItem.requestSlip) && !allDisciplinaryChecked;

    if (!authData?.user?.access?.backupRestore?.canView) {
        return <Navigate to="/error401" replace />;
    }

    const exportData = async () => {
        console.log(selectedItem);
        setErrorMessage('');
        setProgress(0);
        setIsExporting(true);

        try {
            const response = await axios.post("/backup/export", selectedItem, {
                responseType: "blob",
                onDownloadProgress: (e) => {
                    if (e.total) {
                        const percentage = Math.round((e.loaded * 100) / e.total);
                        setProgress(percentage);
                    }
                },
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "backup.json");
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Backup failed:", err);
            setErrorMessage("Backup failed! Please try again.");
        } finally {
            setIsExporting(false);
            setProgress(0);
        }
    };

    return (
        <div className="bg-gray-100 flex items-start justify-center p-6 h-full font-sans">
            <div className="w-full h-full bg-white rounded-lg p-4 shadow-sm flex flex-col max-w-4xl">
                <p className="text-4xl font-bold text-gray-800 mb-2">Back-up and Restore</p>
                <p className="text-gray-600 mb-8">Create a back-up for emergency and restore files.</p>
                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <img src={server} alt="Server" className="w-75 h-75 object-cover" />
                    <h2 className="text-2xl font-bold text-black mb-6 mt-4">Save your files, download it here:</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8 mb-8 text-gray-700 w-full">
                        <div className="flex flex-col">
                            <span className="font-semibold text-lg text-black mb-2">
                                Guidance Head:
                                <label className="inline-flex items-center ml-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out cursor-pointer"
                                        onChange={handleGuidanceAllCheck}
                                        checked={allGuidanceChecked}
                                        // Set a ref to handle the indeterminate state
                                        ref={el => el && (el.indeterminate = isGuidanceIndeterminate)}
                                    />
                                </label>
                            </span>
                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                                    value="studentRecord"
                                    onChange={handleCheckboxChange}
                                    checked={!!selectedItem.studentRecord}
                                />
                                <span className="ml-2">Student Records</span>
                            </label>
                            <label className="inline-flex items-center mb-1 cursor-pointer cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                                    value="studentCase"
                                    onChange={handleCheckboxChange}
                                    checked={!!selectedItem.studentCase}
                                />
                                <span className="ml-2">Student Case</span>
                            </label>
                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                                    value="users"
                                    onChange={handleCheckboxChange}
                                    checked={!!selectedItem.users}
                                />
                                <span className="ml-2">Users</span>
                            </label>
                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                                    value="wellness"
                                    onChange={handleCheckboxChange}
                                    checked={!!selectedItem.wellness}
                                />
                                <span className="ml-2">Student Wellness</span>
                            </label>
                        </div>
                        <div className="flex flex-col md:col-span-1 lg:col-span-2 ">
                            <span className="font-semibold text-lg text-black mb-2">
                                Disciplinary Officer:
                                <label className="inline-flex items-center ml-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out cursor-pointer"
                                        onChange={handleDisciplinaryAllCheck}
                                        checked={allDisciplinaryChecked}
                                        ref={el => el && (el.indeterminate = isDisciplinaryIndeterminate)}
                                    />
                                </label>
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4">
                                <label className="inline-flex items-center mb-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                                        value="requestSlip"
                                        onChange={handleCheckboxChange}
                                        checked={!!selectedItem.requestSlip}
                                    />
                                    <span className="ml-2">Request Slip and History</span>
                                </label>
                                <label className="inline-flex items-center mb-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                                        value="referralForm"
                                        onChange={handleCheckboxChange}
                                        checked={!!selectedItem.referralForm}
                                    />
                                    <span className="ml-2">Referral Forms and History</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    {isExporting ? (
                        <div className="w-full max-w-md flex flex-col items-center">
                            <p className="text-sm text-gray-600 mb-2">Exporting... {progress}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    ) : (
                        <button
                            className="bg-[#0B1320] hover:bg-[#1A2635] text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out flex items-center justify-center text-lg max-w-sm"
                            onClick={exportData}
                        >
                            Download (.json)
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
                    )}
                    {errorMessage && (
                        <p className="mt-4 text-red-600 text-sm font-medium">{errorMessage}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BackNRestore;
