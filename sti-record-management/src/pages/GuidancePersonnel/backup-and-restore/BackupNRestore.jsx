import React, { useContext, useState } from 'react';
import server from '../../../assets/data-server.png';
import { Navigate } from 'react-router-dom';
import RestoreModal from './Restore';
import axios from 'axios';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Mock AuthContext for demonstration.
const AuthContext = React.createContext({
    authData: { user: { access: { backupRestore: { canView: true } } } },
    logout: () => { },
});

function BackNRestore() {
    const [showModal, setShowModal] = useState();
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

    if (!authData?.user?.access?.backupRestore) {
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
            toast.success("Backup successful downloaded.");
        } catch (err) {
            console.error("Backup failed:", err);
            toast.error("Backup failed. Please try again.");
        } finally {
            setIsExporting(false);
            setProgress(0);
        }
    };

    return (
        <div className="bg-gray-100 flex items-start justify-center p-2 sm:p-6 h-full font-sans">
            <RestoreModal onClick={() => setShowModal(false)} visible={showModal}/>
                <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className="w-full h-full bg-white rounded-lg p-2 sm:p-4 shadow-sm flex flex-col max-w-full sm:max-w-2xl md:max-w-4xl">
                <p className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">Back-up and Restore</p>
                <p className="text-xs sm:text-base text-gray-600 mb-5">Create a back-up for emergency and restore files.</p>
                <div className="flex flex-col items-center justify-center p-2 sm:p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <img src={server} alt="Server" className="w-32 h-32 sm:w-48 sm:h-48 object-cover" />
                    <h2 className="text-lg sm:text-2xl font-bold text-black mb-4 mt-2 sm:mt-4 text-center">Save your files, download it here:</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-8 mb-6 text-gray-700 w-full">
                        {/* Guidance Head */}
                        <div className="flex flex-col">
                            <span className="font-semibold text-base sm:text-lg text-black mb-2">
                                Guidance Head:
                                <label className="inline-flex items-center ml-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out cursor-pointer"
                                        onChange={handleGuidanceAllCheck}
                                        checked={allGuidanceChecked}
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
                                <span className="ml-2 text-xs sm:text-sm">Student Records</span>
                            </label>
                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                                    value="studentCase"
                                    onChange={handleCheckboxChange}
                                    checked={!!selectedItem.studentCase}
                                />
                                <span className="ml-2 text-xs sm:text-sm">Student Case</span>
                            </label>
                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                                    value="users"
                                    onChange={handleCheckboxChange}
                                    checked={!!selectedItem.users}
                                />
                                <span className="ml-2 text-xs sm:text-sm">Users</span>
                            </label>
                            <label className="inline-flex items-center mb-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                                    value="wellness"
                                    onChange={handleCheckboxChange}
                                    checked={!!selectedItem.wellness}
                                />
                                <span className="ml-2 text-xs sm:text-sm">Student Wellness</span>
                            </label>
                        </div>
                        {/* Disciplinary Officer */}
                        <div className="flex flex-col">
                            <span className="font-semibold text-base sm:text-lg text-black mb-2">
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
                            <div className="grid grid-cols-1 gap-1">
                                <label className="inline-flex items-center mb-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                                        value="requestSlip"
                                        onChange={handleCheckboxChange}
                                        checked={!!selectedItem.requestSlip}
                                    />
                                    <span className="ml-2 text-xs sm:text-sm">Request Slip and History</span>
                                </label>
                                <label className="inline-flex items-center mb-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                                        value="referralForm"
                                        onChange={handleCheckboxChange}
                                        checked={!!selectedItem.referralForm}
                                    />
                                    <span className="ml-2 text-xs sm:text-sm">Referral Forms and History</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    {isExporting ? (
                        <div className="w-full max-w-md flex flex-col items-center">
                            <p className="text-xs sm:text-sm text-gray-600 mb-2">Exporting... {progress}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    ) : (
                        <div className='flex flex-col sm:flex-row gap-2 w-full items-stretch'>
                            <button
                                className="bg-[#0B1320] hover:bg-[#1A2635] text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out flex items-center justify-center text-sm sm:text-lg w-full"
                                onClick={exportData}
                            >
                                Backup (.json)
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-5 h-5 sm:w-6 sm:h-6 ml-2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                                    />
                                </svg>
                            </button>
                            <button
                                className="bg-[#0B1320] hover:bg-[#1A2635] text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out flex items-center justify-center text-sm sm:text-lg w-full"
                                onClick={() => setShowModal(true)}
                            >
                                Restore (.json)
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-5 h-5 sm:w-6 sm:h-6 ml-2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                                    />
                                </svg>
                            </button>
                        </div>
                    )}
                    {errorMessage && (
                        <p className="mt-4 text-red-600 text-xs sm:text-sm font-medium">{errorMessage}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BackNRestore;
