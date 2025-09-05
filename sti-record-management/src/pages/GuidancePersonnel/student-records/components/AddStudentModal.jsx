import React from 'react';
import { X, Check } from 'lucide-react';
import upload from '../../../../assets/upload.png';
import closeB from '../../../../assets/closeblack.png';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import toast CSS
import DatePicker from 'react-datepicker';

const AddStudentModal = ({ visible, onClose, newStudentForm, handleNewStudentFormChange, clearForm }) => {
    if (!visible) return null;

    const handleAddStudent = async () => {
        const newStudent = {
            sid: newStudentForm.studentNumber,
            isArchived: false,

            studentProfile: {
                name: newStudentForm.fullName,
                academicLevel: newStudentForm.gradeYearLevel,
                program: newStudentForm.programStrand,
                section: newStudentForm.section,
                birthday: newStudentForm.birthDate,
                age: newStudentForm.age,
                gender: newStudentForm.gender,
            },

            contactInfo: {
                email: newStudentForm.emailAddress,
                contactNo: newStudentForm.mobileNo,
                homeNo: newStudentForm.contactNo,
                address: {
                    currentAddress: newStudentForm.address
                }
            },

            health: {
                illness: newStudentForm.healthCondition
            }
        }

        try {
            const response = await axios.post('/student/create', newStudent);
            toast.success("Student Created Successfully!"); 
            clearForm();
            onClose();
        } catch (error) {
            console.error("Error creating student:", error);
            toast.error("Student Creation Unsuccessful.");
        }
    }

const yearLevelOptions = [
    "Grade 11", "Grade 12", "1st Year College",
    "2nd Year College", "3rd Year College", "4th Year College"
];
const programOptions = [
    "BSIT", "BSCS", "BSBA", "BSECE", "BMMA"
];

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">Fill up Basic Information</h3>
                    <button className="p-2 rounded-lg hover:bg-gray-200 cursor-pointer" onClick={onClose}>
                        <img src={closeB} alt="closeIcon" className="w-5 h-5 object-cover" />
                    </button>
                </div>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name: </label>
                            <input type="text" id="fullName" name="fullName" value={newStudentForm.fullName} onChange={handleNewStudentFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="studentNumber" className="block text-sm font-medium text-gray-700">Student Number:</label>
                            <input type="text" id="studentNumber" name="studentNumber" value={newStudentForm.studentNumber} onChange={handleNewStudentFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700">Email Address:</label>
                            <input type="email" id="emailAddress" name="emailAddress" value={newStudentForm.emailAddress} onChange={handleNewStudentFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>

                        <div>
                            <label htmlFor="gradeYearLevel" className="block text-sm font-medium text-gray-700">Grade/Year Level:</label>
                            <select
                                id="gradeYearLevel"
                                name="gradeYearLevel"
                                value={newStudentForm.gradeYearLevel}
                                onChange={handleNewStudentFormChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select Grade/Year Level</option>
                                {yearLevelOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="programStrand" className="block text-sm font-medium text-gray-700">Program/ Strand:</label>
                            <select
                                id="programStrand"
                                name="programStrand"
                                value={newStudentForm.programStrand}
                                onChange={handleNewStudentFormChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select Program/Strand</option>
                                {programOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="section" className="block text-sm font-medium text-gray-700">Section:</label>
                            <input type="text" id="section" name="section" value={newStudentForm.section} onChange={handleNewStudentFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>

                        <div>
                            <div className="relative">
                                <input
                                    type="date"
                                    id="birthDate"
                                    name="birthDate"
                                    value={newStudentForm.birthDate}
                                    onChange={handleNewStudentFormChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                <span
                                    className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
                                    onClick={() => document.getElementById('birthDate').showPicker && document.getElementById('birthDate').showPicker()}
                                    tabIndex={-1}
                                >
                                    {/* Calendar SVG */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                                        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                </span>
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age:</label>
                            <input type="number" id="age" name="age" value={newStudentForm.age} onChange={handleNewStudentFormChange} 
                            className="mt-1 block w-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender:</label>
                            <div className="flex space-x-4">
                                <label className="inline-flex items-center">
                                    <input type="radio" name="gender" value="Male" checked={newStudentForm.gender === 'Male'} onChange={handleNewStudentFormChange} className="form-radio text-blue-600 h-4 w-4" />
                                    <span className="ml-2 text-gray-700">Male</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input type="radio" name="gender" value="Female" checked={newStudentForm.gender === 'Female'} onChange={handleNewStudentFormChange} className="form-radio text-blue-600 h-4 w-4" />
                                    <span className="ml-2 text-gray-700">Female</span>
                                </label>
                                {/* <label className="inline-flex items-center">
                                    <input type="radio" name="gender" value="Others" checked={newStudentForm.gender === 'Others'} onChange={handleNewStudentFormChange} className="form-radio text-blue-600 h-4 w-4" />
                                    <span className="ml-2 text-gray-700">Others:</span>
                                </label> */}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="mobileNo" className="block text-sm font-medium text-gray-700">Mobile No.:</label>
                            <input type="text" id="mobileNo" name="mobileNo" value={newStudentForm.mobileNo} onChange={handleNewStudentFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address:</label>
                            <textarea id="address" name="address" value={newStudentForm.address} onChange={handleNewStudentFormChange} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-y"></textarea>
                        </div>
                        <div>
                            <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">Emergency Contact:</label>
                            <input type="text" id="emergencyContact" name="emergencyContact" value={newStudentForm.emergencyContact} onChange={handleNewStudentFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="contactNo" className="block text-sm font-medium text-gray-700">Contact No.:</label>
                            <input type="text" id="contactNo" name="contactNo" value={newStudentForm.contactNo} onChange={handleNewStudentFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="healthCondition" className="block text-sm font-medium text-gray-700">Health Condition:</label>
                            <input type="text" id="healthCondition" name="healthCondition" value={newStudentForm.healthCondition} onChange={handleNewStudentFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>

                        {/* <div>
                            <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">Profile:</label>
                            <div className="mt-1 flex justify-center items-center w-full h-40 border-2 border-gray-300 border-dashed rounded-md cursor-pointer relative group">
                                {newStudentForm.profileImage ? (
                                    <img src={URL.createObjectURL(newStudentForm.profileImage)} alt="Profile Preview" className="max-h-full max-w-full object-contain rounded-md" />
                                ) : (
                                    <img src={upload} alt="uploadIcon" className="w-10 h-10 object-cover" />
                                )}
                                <input id="profileImage" name="profileImage" type="file" accept="image/*" onChange={handleNewStudentFormChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                <span className="absolute bottom-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">Upload Image</span>
                            </div>
                        </div> */}

                    </div>
                </form>

                <div className="mt-6 flex justify-end space-x-4">
                    <button className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out cursor-pointer" onClick={onClose}>
                        Cancel
                        <X className="w-8 h-8 ml-2" />
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out cursor-pointer" onClick={handleAddStudent}>
                        Save
                        <Check className="w-8 h-8 ml-2" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddStudentModal;