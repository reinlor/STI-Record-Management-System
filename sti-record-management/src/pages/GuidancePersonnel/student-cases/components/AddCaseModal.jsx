import React, { useState, useEffect, useCallback } from 'react';
import { X, Check, Upload } from 'lucide-react';
import axios, { all } from "axios";
import Loading from "../../../../component/Loading"

const AddCaseModal = ({ visible, onClose, newCaseForm, onChange, onSave, isButtonSubmitting }) => {
    if (!visible) return null;

    const [violations, setViolations] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoading, setIsLoading] = useState(true)
    const [priorityLevels, setPriorityLevels] = useState({});

    const [categories, setCategories] = useState([
        'Academic Misconduct', 'Disruptive Behavior', 'Property and Vandalism', 'Technology Misuse',
        'Substance Abuse', 'Safety and Security', 'Non-compliance with School Rules', 'Others']);

    const [allViolations, setAllViolations] = useState({
        'Academic Misconduct': ['Cheating', 'Plagiarism', 'Fabrication', 'Facilitating academic dishonesty'],
        'Disruptive Behavior': ['Classroom Disruption', 'Harassment', 'Bullying', 'Threats'],
        'Property and Vandalism': ['Theft', 'Vandalism', 'Unauthorized use of property', 'Damage to school property'],
        'Technology Misuse': ['Unauthorized access to school systems', 'Cyberbullying', 'Inappropriate use of school technology', 'Sharing of private information without consent'],
        'Substance Abuse': ['Alcohol possession or use', 'Drug possession, use, or distribution', 'Smoking or vaping on school grounds'],
        'Safety and Security': ['Possession of weapons', 'Failure to follow safety procedures', 'Endangerment of others', 'Trespassing'],
        'Non-compliance with School Rules': ['Tardiness', 'Truancy', 'Dress code violations', 'Disobedience to school staff'],
        'Others': [],
    })

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);

                const response = await axios.get('/content/violations/get');
                const fetchedData = response.data;

                const newCategories = Object.keys(fetchedData);
                const newAllViolations = {};
                const newPriorityLevels = {};

                newCategories.forEach(categoryKey => {
                    newAllViolations[categoryKey] = fetchedData[categoryKey].violations;
                    newPriorityLevels[categoryKey] = fetchedData[categoryKey].priorityLevel;
                });

                setCategories(newCategories);
                setAllViolations(newAllViolations);
                setPriorityLevels(newPriorityLevels);

                console.log("New Categories:", newCategories);
                console.log("New All Violations:", newAllViolations);
                console.log("New Priority Levels:", newPriorityLevels);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const selectedViolations = allViolations[newCaseForm.counselingTypeCategory] || [];
        setViolations(selectedViolations);
    }, [newCaseForm.counselingTypeCategory]);

    const fetchStudents = async (query) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const res = await axios.get(`/student/search?name=${query}`);
            setSearchResults(res.data || []);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    };

    const debouncedFetch = useCallback(debounce(fetchStudents, 500), []);

    const handleStudentInput = (e) => {
        onChange(e);
        debouncedFetch(e.target.value);
    };

    const handleSelectStudent = (student) => {
        setSearchResults([]);
        onChange({ name: "studentName", value: student.studentProfile.name });
        onChange({ name: "studentId", value: student.sid });
        onChange({ name: "programSection", value: `${student.studentProfile.program} ${student.studentProfile.section}` });
    };

    const handleViolationInput = () => {
        const hasSpecificViolations = violations.length > 0;
        if (hasSpecificViolations) {
            return (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Violation:<span className='text-red-700'>*</span></label>
                    <select
                        name="violation"
                        value={newCaseForm.violation}
                        onChange={onChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    >
                        <option value="">Select a Violation</option>
                        {violations.map((violation, index) => (
                            <option key={index} value={violation}>{violation}</option>
                        ))}
                    </select>
                </div>
            );
        }
        return (
            (newCaseForm.counselingTypeCategory !== '' ?
                <div>
                    <label className="block text-sm font-medium text-gray-700">Violation:</label>
                    <input
                        type="text"
                        name="violation"
                        value={newCaseForm.violation}
                        onChange={onChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    />
                </div> : null)
        );
    };

    const handleCategoryDropDown = () => (
        <div>
            <label className="block text-sm font-medium text-gray-700">Counseling Type/Category:<span className='text-red-700'>*</span></label>
            <select
                name="counselingTypeCategory"
                value={newCaseForm.counselingTypeCategory}
                onChange={onChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            >
                <option value="">Select a Category</option>
                {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-7xl max-h-[100vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-2xl font-bold text-[#0172bd]">Add New Case</h3>
                    <button className="rounded-lg hover:bg-gray-200 cursor-pointer" onClick={onClose}>
                        <X className="w-10 h-10 text-[#0172bd]" />
                    </button>
                </div>

                {isLoading ? <Loading /> :
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="space-y-4">
                            {/* Student Name with AutoComplete */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700">Student Name:<span className='text-red-700'>*</span></label>
                                <input
                                    type="text"
                                    name="studentName"
                                    value={newCaseForm.studentName}
                                    onChange={handleStudentInput}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                                    autoComplete="off"
                                />
                                {isSearching && <p className="text-xs text-gray-500">Searching...</p>}
                                {searchResults.length > 0 && (
                                    <ul className="absolute bg-white border border-gray-300 rounded-md mt-1 w-full max-h-40 overflow-y-auto z-10 shadow-lg">
                                        {searchResults.map((student, idx) => (
                                            <li
                                                key={idx}
                                                onClick={() => handleSelectStudent(student)}
                                                className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                                            >
                                                {student.studentProfile.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Student ID:<span className='text-red-700'>*</span></label>
                                <input type="text" name="studentId" value={newCaseForm.studentId} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Program and Section:<span className='text-red-700'>*</span></label>
                                <input type="text" name="programSection" value={newCaseForm.programSection} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
                            </div>
                            <div>
                                <label htmlFor="dateOfInitiation" className="block text-sm font-medium text-gray-700">Date of Initiation:<span className='text-red-700'>*</span></label>
                                <input type="date" id="dateOfInitiation" name="dateOfInitiation" value={newCaseForm.dateOfInitiation} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="timeOfInitiation" className="block text-sm font-medium text-gray-700">Time of Initiation:<span className='text-red-700'>*</span></label>
                                <input type="time" id="timeOfInitiation" name="timeOfInitiation" value={newCaseForm.timeOfInitiation} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>

                            {handleCategoryDropDown()}
                            {handleViolationInput()}

                            <div>
                                <label htmlFor="detailedDescription" className="block text-sm font-medium text-gray-700">Detailed Description:</label>
                                <textarea id="detailedDescription" name="detailedDescription" value={newCaseForm.detailedDescription} onChange={onChange} rows="4" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-y"></textarea>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="actions" className="block text-sm font-medium text-gray-700">Actions Taken:</label>
                                <textarea id="actions" name="actions" value={newCaseForm.actions} onChange={onChange} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-y"></textarea>
                            </div>
                            <div>
                                <label htmlFor="dateOfAction" className="block text-sm font-medium text-gray-700">Date of Action:<span className='text-red-700'>*</span></label>
                                <input type="date" id="dateOfAction" name="dateOfAction"
                                    value={newCaseForm.dateOfAction} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="caseStatus" className="block text-sm font-medium text-gray-700">Case Status:<span className='text-red-700'>*</span></label>
                                <select id="caseStatus" name="caseStatus" value={newCaseForm.caseStatus} onChange={onChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer">
                                    <option value="On-going">On-going</option>
                                    <option value="Resolved">Resolved</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="counselorNotes" className="block text-sm font-medium text-gray-700">Counselor's Notes:</label>
                                <textarea id="counselorNotes" name="counselorNotes" value={newCaseForm.counselorNotes} onChange={onChange} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"></textarea>
                            </div>
                            <div>
                                <label htmlFor="proofDescription" className="block text-sm font-medium text-gray-700">Proof Description:</label>
                                <textarea id="proofDescription" name="proofDescription" value={newCaseForm.proofDescription} onChange={onChange} rows="2" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"></textarea>
                            </div>
                            <div>
                                <label htmlFor="proofImage" className="block text-sm font-medium text-gray-700">Proof Image:</label>
                                <div className="mt-1 flex justify-center items-center w-full h-25 border-2 border-gray-300 border-dashed rounded-md cursor-pointer relative group">
                                    {newCaseForm.proofImage ? (
                                        typeof newCaseForm.proofImage === "object" ? (
                                            <img
                                                src={URL.createObjectURL(newCaseForm.proofImage)}
                                                alt="Proof Preview"
                                                className="max-h-full max-w-full object-contain rounded-md"
                                            />
                                        ) : (
                                            <img
                                                src={newCaseForm.proofImage}
                                                alt="Proof Preview"
                                                className="max-h-full max-w-full object-contain rounded-md"
                                            />
                                        )
                                    ) : (
                                        <Upload className="w-10 h-10 object-cover" />
                                    )}

                                    <input id="proofImage" name="proofImage" type="file" accept="image/*" onChange={onChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <span className="absolute bottom-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">Upload Image</span>
                                </div>
                            </div>
                        </div>
                    </form>}

                <div className="mt-6 flex justify-end space-x-4">
                    <button className="bg-[#dc3545] hover:bg-red-600 text-white font-bold py-2 px-5 rounded-lg flex items-center transition duration-150 ease-in-out cursor-pointer" onClick={onClose}>
                        Cancel
                        <X className="w-8 h-8 ml-2" />
                    </button>
                    <button className="bg-[#28a745] hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out cursor-pointer"
                        onClick={() => onSave({
                            ...newCaseForm,
                            priorityLevels,
                        })}
                        disabled={isButtonSubmitting}
                    >
                        {isButtonSubmitting ? 'Submitting...' : <>Add Case <Check className="w-8 h-8 ml-2" /></>}

                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCaseModal;