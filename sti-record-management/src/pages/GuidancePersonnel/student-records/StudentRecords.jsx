import React, { useState, Fragment, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../../AuthProvider.jsx';
import axios from 'axios';
import { Navigate, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../index.css';

// Para sa interesection observers
import { ChevronRight, ChevronLeft, Search } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

import studentIcon from '../../../assets/student.png';
import dropdown from '../../../assets/dropdown.png';
import back from '../../../assets/back.png';
import user from '../../../assets/user.png';
import next from '../../../assets/next.png';
import cases from '../../../assets/cases.png';
import archive from '../../../assets/archive.png';
import edit from '../../../assets/edit.png';

import { X, Check } from 'lucide-react';

import InfoSection from './components/InfoSection.jsx';
import AddStudentModal from './components/AddStudentModal.jsx';
import BulkModal from './components/BulkModal.jsx';
import PhotoToTextModal from './components/PhotoToTextModal.jsx';
import ArchiveConfirmModal from './components/ArchiveConfirmModal.jsx';
import { normalizeForUI, updateRawField } from './components/StudentUtils.jsx';

function StudentRecords() {
    const { authData, logout } = useContext(AuthContext);
    // Para sa Intersection observers
    const studentsListRef = useRef(null);
    const itemRefs = useRef(new Map());
    const observerRef = useRef(null);
    const [visibleIds, setVisibleIds] = useState(new Set());

    const [students, setStudents] = useState([]);
    const [activeTab, setActiveTab] = useState('Enrolled');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);
    const [editedStudentData, setEditedStudentData] = useState(null);

    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [showArchiveConfirmModal, setShowArchiveConfirmModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [infoType, setInfoType] = useState('basic');
    const [selectedYearLevel, setSelectedYearLevel] = useState('none');
    const [selectedProgram, setSelectedProgram] = useState('none');
    const navigate = useNavigate();

    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showPhotoToTextModal, setShowPhotoToTextModal] = useState(false);

    const formatBirthDate = (input) => {
        if (!input) return "";
        const parts = input.split(/[\/\-]/);
        if (parts.length === 3) {
            const [m, d, y] = parts;
            if (y.length === 4) {
                return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
            }
        }
        return input;
    };

    const setRef = (element, id) => {
        if (element) {
            itemRefs.current.set(id, element);
        } else {
            itemRefs.current.delete(id);
        }
    };

    const initialNewStudentFormState = {
        fullName: "", studentNumber: "",
        emailAddress: "", gradeYearLevel: "", programStrand: "", section: "",
        birthDate: "", age: "", gender: "", mobileNo: "", address: "",
        emergencyContact: "", contactNo: "", healthCondition: "",
        profileImage: null,
    };

    const [newStudentForm, setNewStudentForm] = useState(initialNewStudentFormState);

    const handleNewStudentFormChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === "file") {
            setNewStudentForm((prev) => ({ ...prev, [name]: files[0] }));
        } else {
            setNewStudentForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleClearStudentForm = () => {
        setNewStudentForm(initialNewStudentFormState)
    }

    const handleCaseButton = () => {
        const idSearch = selectedStudentId

        navigate("/guidance/student-cases", { state: { idSearch: idSearch } })
    }

    const [addMode, setAddMode] = useState('individual');


    // Fetch student data based on the active tab
    useEffect(() => {
        const endpoint = activeTab === 'Enrolled' ? '/student/active' : '/student/archived';
        axios.get(endpoint)
            .then(res => {
                if (Array.isArray(res.data)) {
                    setStudents(res.data);
                } else {
                    setStudents(res.data?.questions ?? res.data ?? []);
                }
            })
            .catch(err => {
                console.error('Error fetching student list', err);
                toast.error('Error fetching student list.');
                setStudents([]);
            });
    }, [activeTab, showAddStudentModal, showBulkModal, showPhotoToTextModal]);

    // Update selected student details from local state
    useEffect(() => {
        if (selectedStudentId) {
            // Find the student in the local 'students' state
            const student = students.find(s => s.id === selectedStudentId || s.sid === selectedStudentId);

            if (student) {
                setSelectedStudentDetails(student);
                setEditedStudentData(JSON.parse(JSON.stringify(student)));
                setIsEditing(false);
            } else {
                // If student is not found in the list (e.g., after an archive action), reset the state
                setSelectedStudentDetails(null);
                setEditedStudentData(null);
                setIsEditing(false);
            }
        } else {
            setSelectedStudentDetails(null);
            setEditedStudentData(null);
            setIsEditing(false);
        }
    }, [selectedStudentId, students]);

    const handleAddStudent = async () => {
        try {
            const formData = new FormData();
            Object.entries(newStudentForm).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const res = await axios.post('/student/create', formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setStudents(prev => [...prev, res.data]);
            setShowAddStudentModal(false);
            toast.success('Student Added Successfully!');
        } catch (err) {
            console.error(err);
            toast.error('Error adding student.');
        }
    };

    const handleAddStudentButtonClick = () => {
        if (addMode === 'individual') setShowAddStudentModal(true);
        else if (addMode === 'bulk') setShowBulkModal(true);
        else if (addMode === 'photo') setShowPhotoToTextModal(true);
    };

    const handleArchiveStudent = async () => {

        if (selectedStudentId) {
            try {
                const archiveConfig = activeTab === 'Archived' ? 'restoreData' : 'archiveData';
                const res = await axios.put(`/student/${archiveConfig}/${selectedStudentId}`);

                setStudents(prev =>
                    prev.filter(student => student.id !== selectedStudentId && student.sid !== selectedStudentId)
                );

                setSelectedStudentId(null);

                setShowArchiveConfirmModal(false);
                toast.success(res.data?.message || "Student Archived Successfully! "); // Replaced alert
            } catch (err) {
                console.error(err);
                toast.error("Error archiving student.");
            }
        }
    };


    const handleSaveEdits = async () => {
        if (editedStudentData && selectedStudentId) {
            try {
                const { id, sid, ...updateData } = editedStudentData;

                const res = await axios.put(
                    `/student/update/${selectedStudentId}`,
                    updateData
                );

                // Update local state
                setStudents(prev =>
                    prev.map(student =>
                        (student.id === selectedStudentId || student.sid === selectedStudentId) ? res.data : student
                    )
                );

                setSelectedStudentDetails(res.data);
                setEditedStudentData(JSON.parse(JSON.stringify(res.data)));
                setIsEditing(false);
                toast.success("Changes saved successfully!");
            } catch (err) {
                console.error(err);
                toast.error("Error saving changes.");
            }
        }
    };

    const handleInfoFieldChange = (category, field, value) => {
        setEditedStudentData(prev => {
            if (!prev) return prev;
            return updateRawField(prev, category, field, value);
        });
    };

    const displayStudentRaw = isEditing && editedStudentData ? editedStudentData : selectedStudentDetails;
    const uiGroup = normalizeForUI(displayStudentRaw);
    const displayStudentData = uiGroup;

    // Mapping for year level to section prefix
    const yearLevelMapping = {
        '1st Year College': '1',
        '2nd Year College': '2',
        '3rd Year College': '3',
        '4th Year College': '4',
    };

    const filteredStudents = students.filter(student => {
        const nameStr = (student.studentProfile?.name ?? student.name ?? '').toString().toLowerCase();
        const idStr = (student.sid ?? student.id ?? '').toString().toLowerCase();

        const matchesSearch = searchTerm === '' ||
            nameStr.includes(searchTerm.toLowerCase()) ||
            idStr.includes(searchTerm.toLowerCase());

        const matchesYearLevel = selectedYearLevel === 'none' ||
            (student.studentProfile?.section?.startsWith(yearLevelMapping[selectedYearLevel]));

        const matchesProgram = selectedProgram === 'none' ||
            (student.studentProfile?.program === selectedProgram);

        return matchesSearch && matchesYearLevel && matchesProgram;
    }).sort((a, b) => {
        const yearOrder = {
            'Grade 11': 1, 'Grade 12': 2,
            '1st Year College': 3, '2nd Year College': 4,
            '3rd Year College': 5, '4th Year College': 6,
            'Graduated': 7, 'Left': 8, 'NA': 9, '': 10
        };
        const yearA = yearOrder[a.yearLevel ?? a.studentProfile?.academicLevel] || 99;
        const yearB = yearOrder[b.yearLevel ?? b.studentProfile?.academicLevel] || 99;

        if (selectedYearLevel !== 'none') {
            if (yearA !== yearB) return yearA - yearB;
        }

        if (selectedProgram !== 'none') {
            if ((a.program ?? a.studentProfile?.program) !== (b.program ?? b.studentProfile?.program)) {
                return (a.program ?? a.studentProfile?.program ?? '').localeCompare(b.program ?? b.studentProfile?.program ?? '');
            }
        }

        return 0;
    });

    const yearLevelOptions = [
        "none", "Grade 11", "Grade 12", "1st Year College",
        "2nd Year College", "3rd Year College", "4th Year College",
    ];

    const [tertiaryPrograms, setTertiaryPrograms] = useState(() => {
        const stored = localStorage.getItem('tertiaryPrograms');
        if (stored) return JSON.parse(stored).map(p => p.acronym);
        return ["BMMA", "BSIT", "BSBA", "BSA", "BSCS", "BSECE"];
    });
    const [shsStrands, setShsStrands] = useState(() => {
        const stored = localStorage.getItem('shsStrands');
        if (stored) return JSON.parse(stored).map(s => s.acronym);
        return ["STEM", "TVL", "GAS", "HUMSS", "ABM", "ICT"];
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [programRes, strandRes] = await Promise.all([
                    axios.get("/content/program/get"),
                    axios.get("/content/strand/get")
                ]);

                setTertiaryPrograms(programRes.data.programs.map(p => p.acronym));
                setShsStrands(strandRes.data.strands.map(s => s.acronym));
            } catch (error) {
                console.error("Error fetching programs/strands:", error);
                toast.error("Failed to load program & strand options.");
            }
        };

        fetchData();
    }, []);

    // Listen for changes in localStorage (in case another tab updates)
    useEffect(() => {
        const syncLists = () => {
            const t = localStorage.getItem('tertiaryPrograms');
            const s = localStorage.getItem('shsStrands');
            if (t) setTertiaryPrograms(JSON.parse(t).map(p => p.acronym));
            if (s) setShsStrands(JSON.parse(s).map(s => s.acronym));
        };
        window.addEventListener('storage', syncLists);
        return () => window.removeEventListener('storage', syncLists);
    }, []);

    // Dynamic program options based on year level
    const getProgramOptions = () => {
        if (selectedYearLevel === "Grade 11" || selectedYearLevel === "Grade 12") {
            return ["none", ...shsStrands];
        }
        if (
            selectedYearLevel === "1st Year College" ||
            selectedYearLevel === "2nd Year College" ||
            selectedYearLevel === "3rd Year College" ||
            selectedYearLevel === "4th Year College"
        ) {
            return ["none", ...tertiaryPrograms];
        }
        // Default options
        return ["none", ...tertiaryPrograms];
    };

    if (!authData?.user?.access?.studentRecords?.canView) {
        return <Navigate to="/error401" replace />
    }

    useEffect(() => {
        // Disconnect the old observer if it exists
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        // Create a new observer instance
        const observer = new IntersectionObserver(
            (entries) => {
                setVisibleIds(prev => {
                    const next = new Set(prev);
                    entries.forEach(entry => {
                        const id = entry.target.getAttribute('data-student-id');
                        if (entry.isIntersecting) {
                            next.add(id);
                        } else {
                            next.delete(id);
                        }
                    });
                    return next;
                });
            },
            {
                root: studentsListRef.current, // Use the container as the root
                rootMargin: '200px', // Start loading 200px before the item enters the view
                threshold: 0.1,
            }
        );

        observerRef.current = observer;

        // Observe all the elements currently in the refs map
        itemRefs.current.forEach(el => {
            if (el) observer.observe(el);
        });

        // Cleanup function
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [filteredStudents]);

    return (
        <div className="bg-gray-100 h-full p-3 rounded-lg">
            <div className="flex bg-gray-100 h-full overflow-hidden">
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

                {/* --- Student List --- */}
                <div
                    className={`h-full bg-white border-r border-gray-200 shadow-lg flex flex-col rounded-lg transition-all duration-300
                    ${selectedStudentId ? 'w-0 lg:w-96' : 'w-full lg:w-96'}`}
                >
                    {/* Only show content if not collapsed */}
                    {!(selectedStudentId && window.innerWidth < 1024) && (
                        <>
                            <div className="p-2 border-b border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <p className="text-3xl font-bold text-gray-800">Student List</p>
                                </div>

                                {/* Archive/Enrolled */}
                                <div className="flex justify-around bg-gray-200 p-1 rounded-lg mb-2">
                                    <button className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out cursor-pointer hover:bg-[#003d54] 
                                ${activeTab === 'Archived' ? 'bg-[#0a1220] text-white shadow-sm' : 'text-gray-700 hover:bg-gray-300'}`}
                                        onClick={() => setActiveTab('Archived')}>
                                        Archive
                                    </button>
                                    <button className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out cursor-pointer hover:bg-[#003d54] 
                                    ${activeTab === 'Enrolled' ? 'bg-[#0a1220] text-white shadow-sm' : 'text-gray-700 hover:bg-gray-300'}`}
                                        onClick={() => setActiveTab('Enrolled')}>Enrolled</button>
                                </div>
                            </div>
                            {/* Search Bar */}
                            <div className="relative p-2">
                                <input type="text" placeholder="Name/ ID"
                                    className="w-full pl-2 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out hover:bg-gray-100"
                                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                <Search className="w-5 h-5 absolute right-5 top-4.5 text-gray-400" />
                            </div>

                            <div className="flex space-x-2 p-2">
                                <div className="relative flex-1">
                                    <select className="text-sm block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0a1220] focus:border-transparent transition duration-150 ease-in-out appearance-none bg-white pr-8 cursor-pointer" value={selectedYearLevel} onChange={(e) => setSelectedYearLevel(e.target.value)}>
                                        <option value="none">Year Level</option>
                                        {yearLevelOptions.filter(opt => opt !== "none").map(option => (<option key={option} value={option}>{option}</option>))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <img src={dropdown} alt="dropdownIcon" className="w-2.5 h-2.5 object-cover mr-2" />
                                    </div>
                                </div>

                                <div className="relative flex-1">
                                    <select
                                        className="text-sm block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0a1220] focus:border-transparent transition duration-150 ease-in-out appearance-none bg-white pr-8 cursor-pointer"
                                        value={selectedProgram}
                                        onChange={(e) => setSelectedProgram(e.target.value)}
                                    >
                                        <option value="none">Program/Course</option>
                                        {getProgramOptions().filter(opt => opt !== "none").map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <img src={dropdown} alt="dropdownIcon" className="w-2.5 h-2.5 object-cover mr-2" />
                                    </div>
                                </div>
                            </div>

                            {authData?.user?.access?.studentRecords?.canEdit ? (
                                <div className="flex space-x-2 p-2">
                                    <button className="flex-1 bg-[#0a1220] hover:bg-[#003d54] text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out shadow-md hover:shadow-lg" onClick={handleAddStudentButtonClick}>
                                        {addMode === 'individual' && 'Add Student'}
                                        {addMode === 'bulk' && 'Bulk Add'}
                                        {addMode === 'photo' && 'Photo-to-Text'}
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                    </button>

                                    <div className="relative">
                                        <select className="block px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0a1220] focus:border-transparent transition duration-150 ease-in-out appearance-none bg-white pr-8 text-sm cursor-pointer" value={addMode} onChange={e => setAddMode(e.target.value)}>
                                            <option value="individual">Individual</option>
                                            <option value="photo">Photo-to-Text</option>
                                            <option value="bulk">Bulk</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                            <img src={dropdown} alt="dropdownIcon" className="w-2.5 h-2.5 object-cover mr-2" />
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            <div ref={studentsListRef} className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => {
                                        const sid = student.sid ?? student.id ?? 'N/A';
                                        const name = student.studentProfile?.name ?? student.name ?? sid;
                                        const isVisible = visibleIds.has(sid);

                                        return (
                                            <div
                                                key={sid}
                                                data-student-id={sid}
                                                ref={(el) => setRef(el, sid)}
                                                className={`flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer transition duration-150 ease-in-out ${selectedStudentId === sid
                                                    ? 'bg-blue-100 border-l-4 border-blue-500'
                                                    : 'hover:bg-gray-50'
                                                    }`}
                                                onClick={() => setSelectedStudentId(sid)}
                                            >
                                                {isVisible ? (
                                                    <div className="flex items-center">
                                                        <img src={user} alt="User" className="w-5 h-5 object-cover mr-5" />
                                                        <div>
                                                            <p className="font-semibold text-gray-800">{name}</p>
                                                            <p className="text-sm text-gray-600">{sid}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{ height: '50px', width: '100%' }}></div>
                                                )}
                                                <ChevronRight className="w-5 h-5 text-[#0a1220]" />
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="p-4 text-gray-500 text-center">No students found.</p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* --- Student Details --- */}
                <div
                    className={`
                flex-1 bg-white flex flex-col
                ${selectedStudentId ? 'flex' : 'hidden lg:flex'} /* keep visible on desktop */
            `}
                >
                    <Fragment>
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center space-x-2 sm:space-x-4">
                                {/* Back button */}
                                <button
                                    className="p-2 rounded-full hover:bg-gray-200 transition duration-150 ease-in-out cursor-pointer"
                                    onClick={() => setSelectedStudentId(null)}
                                >
                                    <img src={back} alt="backIcon" className="w-5 h-5 object-cover" />
                                </button>

                                <select
                                    className="block px-3 sm:px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out appearance-none bg-white pr-8 text-sm sm:text-base cursor-pointer"
                                    value={infoType}
                                    onChange={(e) => setInfoType(e.target.value)}
                                >
                                    <option value="basic">Basic Information</option>
                                    <option value="personal">Personal Information</option>
                                    <option value="contact">Contact Information</option>
                                    <option value="family">Family Background</option>
                                    <option value="educational">Educational Background</option>
                                    <option value="work">Work Experience (Optional)</option>
                                    <option value="interests">Interests and Activities</option>
                                    <option value="health">Health</option>
                                    <option value="life">Life Circumstances</option>
                                </select>
                            </div>

                            {/* actions */}
                            {selectedStudentId !== null && (
                                <div className="flex items-center space-x-2 sm:space-x-3 mt-2 sm:mt-0">
                                    {selectedStudentId !== null ? <div className="flex items-center space-x-2 sm:space-x-3 mt-2 sm:mt-0">
                                        {authData?.user?.access?.studentRecords?.canEdit ?
                                            <button
                                                className={`px-3 sm:px-4 py-2 rounded-lg flex items-center transition duration-150 ease-in-out text-m sm:text-base font-medium cursor-pointer ${isEditing ? 'bg-gray-500 text-white shadow-md' : 'bg-[#0a1220] hover:bg-gray-900 text-white shadow-md hover:shadow-lg'}`}
                                                onClick={() => { if (isEditing) { handleSaveEdits(); } setIsEditing(!isEditing); }}>

                                                {isEditing ? 'Save' : 'Edit Student'}
                                                <img src={edit} alt="editIcon" className="w-5 h-5 sm:w-5 sm:h-5 ml-3" />
                                            </button> : null}

                                        <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 sm:px-4 rounded-lg flex items-center transition duration-150 ease-in-out shadow-md hover:shadow-lg cursor-pointer" onClick={() => setShowArchiveConfirmModal(true)}>
                                            {activeTab === 'Archived' ? 'Restore' : 'Archive'}
                                            <img src={archive} alt="archiveIcon" className="w-5 h-5 sm:w-5 sm:h-5 ml-3" />
                                        </button>

                                        <button className="bg-[#0a1220] hover:bg-[#003d54] text-white font-bold py-2 px-3 sm:px-4 rounded-lg flex items-center transition duration-150 ease-in-out shadow-md hover:shadow-lg cursor-pointer"
                                            onClick={() => handleCaseButton()}>
                                            Case
                                            <img src={cases} alt="caseIcon" className="w-5 h-5 sm:w-5 sm:h-5 ml-3" />
                                        </button>
                                    </div> : null}
                                </div>
                            )}
                        </div>

                        {/* Details body */}
                        <div className="flex-1 p-6 overflow-y-auto">
                            {selectedStudentDetails ? (
                                <InfoSection
                                    infoType={infoType}
                                    student={displayStudentData[infoType]}
                                    isEditing={isEditing}
                                    onFieldChange={handleInfoFieldChange}
                                />
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-500 text-xl p-4 text-center">
                                    Select a student from the list to view their information.
                                </div>
                            )}
                        </div>
                    </Fragment>
                </div>

                {/* --- Modals --- */}
                <AddStudentModal
                    visible={showAddStudentModal}
                    onClose={() => setShowAddStudentModal(false)}
                    newStudentForm={newStudentForm}
                    handleNewStudentFormChange={handleNewStudentFormChange}
                    onSave={handleAddStudent}
                    clearForm={handleClearStudentForm}
                />
                <BulkModal visible={showBulkModal} onClose={() => setShowBulkModal(false)} />
                <PhotoToTextModal
                    visible={showPhotoToTextModal}
                    onClose={() => setShowPhotoToTextModal(false)}
                    onOCRSuccess={(ocr) => {
                        setNewStudentForm((prev) => ({
                            ...prev,
                            fullName: ocr.name || "",
                            studentNumber: ocr.studentId || "",
                            emailAddress: ocr.email || "",
                            gradeYearLevel: ocr.yearLevel || "",
                            programStrand: ocr.program || "",
                            section: ocr.section || "",
                            birthDate: formatBirthDate(ocr.datebirth) || "",
                            age: ocr.age || "",
                            gender: ocr.gender || "",
                            mobileNo: ocr.mobileNo || "",
                            address: ocr.address || "",
                            emergencyContact: ocr.emergencyContact || "",
                            contactNo: ocr.contactNo || "",
                            healthCondition: ocr.healthCondition || "",
                        }));
                        setShowPhotoToTextModal(false);
                        setShowAddStudentModal(true);
                    }}
                />
                <ArchiveConfirmModal
                    visible={showArchiveConfirmModal}
                    onCancel={() => setShowArchiveConfirmModal(false)}
                    onConfirm={handleArchiveStudent}
                    todo={activeTab === 'Archived' ? 'restore' : 'archive'}
                />
            </div>
        </div>
    );

}

export default StudentRecords;