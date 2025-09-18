import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Check, Bell, GraduationCap, Building, Link2, Settings, ShieldAlert, CalendarDays, FileText } from 'lucide-react';

const Toast = ({ message, type, isVisible, onClose }) => {
    if (!isVisible) return null;
    const baseClasses = "fixed bottom-5 right-5 z-50 p-4 rounded-lg shadow-xl text-white flex items-center space-x-2 transition-transform transform duration-300";
    const typeClasses = type === 'success' ? "bg-green-500 translate-x-0" : "bg-red-500 translate-x-0";
    return (
        <div className={`${baseClasses} ${typeClasses}`}>
            {type === 'success' ? <Check size={20} /> : <X size={20} />}
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
                <X size={20} />
            </button>
        </div>
    );
};

const PANEL = {
    ANNOUNCEMENT: 'announcement',
    PROGRAMS: 'programs',
    WELLNESS: 'wellness',
    QUICKLINKS: 'quicklinks',
    VIOLATIONS: 'violations',
    SCHOOL_YEAR: 'school_year'
};

export default function ContentManagement() {
    const [activePanel, setActivePanel] = useState(PANEL.ANNOUNCEMENT);

    // Existing state
    const [announcements, setAnnouncements] = useState([]);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', body: '' });
    const [tertiaryPrograms, setTertiaryPrograms] = useState([]);
    const [shsStrands, setShsStrands] = useState([]);
    const [wellnessLink, setWellnessLink] = useState('');
    const [tempWellnessLink, setTempWellnessLink] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'SHS' or 'Tertiary'
    const [newItem, setNewItem] = useState({ name: '', acronym: '' });
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

    // New states for added panels
    const [violations, setViolations] = useState([]);
    const [newViolation, setNewViolation] = useState({ category: '', priority: '1' });
    const [quickLinks, setQuickLinks] = useState([]);
    const [newQuickLink, setNewQuickLink] = useState({ title: '', file: null });
    const [schoolYearData, setSchoolYearData] = useState({ currentYear: '2024-2025', currentCollegeSemester: '1st Semester', currentShsQuarter: '1st Quarter' });
    const [tempSchoolYearData, setTempSchoolYearData] = useState({ currentYear: '2024-2025', currentCollegeSemester: '1st Semester', currentShsQuarter: '1st Quarter' });
    const [isQuickLinkModalOpen, setIsQuickLinkModalOpen] = useState(false);
    const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);

    // Mock API endpoint for demonstration
    const API = "/content";

    const showToast = (message, type) => {
        setToast({ isVisible: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 3000);
    };

    // === Fetch data on mount ===
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Mock API calls
                const annRes = { data: { announcements: [] } };
                const progRes = { data: { programs: [] } };
                const strandRes = { data: { strands: [] } };
                const wellRes = { data: { link: 'https://www.example.com/wellness' } };
                const violationsRes = { data: { violations: [] } };
                const quickLinksRes = { data: { links: [] } };
                
                // Simulating fetch and setting initial data
                setAnnouncements(annRes.data.announcements || []);
                setTertiaryPrograms(progRes.data.programs || []);
                setShsStrands(strandRes.data.strands || []);
                setWellnessLink(wellRes.data.link || '');
                setTempWellnessLink(wellRes.data.link || '');
                setViolations(violationsRes.data.violations || []);
                setQuickLinks(quickLinksRes.data.links || []);

            } catch (error) {
                console.error("Error fetching content management data:", error);
            }
        };
        fetchData();
    }, []);

    // === Handlers ===
    const handlePostAnnouncement = async () => {
        if (newAnnouncement.title && newAnnouncement.body) {
            try {
                await axios.post(`${API}/announcement/add`, {
                    title: newAnnouncement.title,
                    description: newAnnouncement.body
                });
                setAnnouncements([{ 
                    title: newAnnouncement.title, 
                    description: newAnnouncement.body, 
                    timeCreated: new Date() 
                }, ...announcements]);
                setNewAnnouncement({ title: '', body: '' });
                showToast("New announcement successfully posted!", "success");
            } catch (error) {
                console.error("Error posting announcement:", error);
                showToast("Failed to post announcement.", "error");
            }
        } else {
            showToast("Please fill out both title and body fields.", "error");
        }
    };

    const handleSetWellnessLink = async () => {
        if (tempWellnessLink) {
            try {
                await axios.put(`${API}/wellness/change`, { link: tempWellnessLink });
                setWellnessLink(tempWellnessLink);
                showToast("Wellness Program link successfully updated!", "success");
            } catch (error) {
                console.error("Error updating wellness link:", error);
                showToast("Failed to update wellness link.", "error");
            }
        } else {
            showToast("Please provide a valid link.", "error");
        }
    };

    const handleAddProgram = (type) => {
        setModalType(type);
        setIsAddModalOpen(true);
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        if (newItem.name && newItem.acronym) {
            try {
                if (modalType === 'Tertiary') {
                    await axios.post(`${API}/program/add`, newItem);
                    setTertiaryPrograms([...tertiaryPrograms, newItem]);
                    showToast("New Program successfully added!", "success");
                } else if (modalType === 'SHS') {
                    await axios.post(`${API}/strand/add`, newItem);
                    setShsStrands([...shsStrands, newItem]);
                    showToast("New Strand successfully added!", "success");
                }
                setIsAddModalOpen(false);
                setNewItem({ name: '', acronym: '' });
            } catch (error) {
                console.error("Error adding item:", error);
                showToast("Failed to add item.", "error");
            }
        } else {
            showToast("Please fill out both fields.", "error");
        }
    };

    const handleViolationModalSubmit = async (e) => {
        e.preventDefault();
        if (newViolation.category && newViolation.priority) {
            try {
                // Mock API call
                // await axios.post(`${API}/violations/add`, newViolation);
                setViolations([...violations, { ...newViolation, id: Date.now() }]);
                setNewViolation({ category: '', priority: '1' });
                showToast("New violation successfully added!", "success");
                setIsViolationModalOpen(false);
            } catch (error) {
                console.error("Error adding violation:", error);
                showToast("Failed to add violation.", "error");
            }
        } else {
            showToast("Please fill out all fields.", "error");
        }
    };

    const handleSetSchoolYear = async () => {
        try {
            // Mock API call
            // await axios.put(`${API}/school-year/set`, tempSchoolYearData);
            setSchoolYearData(tempSchoolYearData);
            showToast("School year and academic period successfully updated!", "success");
        } catch (error) {
            console.error("Error updating school year:", error);
            showToast("Failed to update school year.", "error");
        }
    };

    const handleQuickLinkUpload = async (e) => {
        e.preventDefault();
        if (newQuickLink.title && newQuickLink.file) {
            try {
                // Mock API call for file upload
                // const formData = new FormData();
                // formData.append('title', newQuickLink.title);
                // formData.append('file', newQuickLink.file);
                // await axios.post(`${API}/quicklinks/upload`, formData);
                
                const fileUrl = URL.createObjectURL(newQuickLink.file);
                setQuickLinks([...quickLinks, { title: newQuickLink.title, url: fileUrl, fileName: newQuickLink.file.name }]);
                setNewQuickLink({ title: '', file: null });
                showToast("File successfully uploaded!", "success");
                setIsQuickLinkModalOpen(false); // Close modal on success
            } catch (error) {
                console.error("Error uploading file:", error);
                showToast("Failed to upload file.", "error");
            }
        } else {
            showToast("Please provide a title and select a file.", "error");
        }
    };

    const renderProgramList = (list) => (
        <div className="flex flex-col space-y-2 h-full overflow-y-auto custom-scrollbar">
            {list.length > 0 ? (
                list.map((item, index) => (
                    <div key={index} className="p-2 bg-gray-100 rounded-lg shadow-sm">
                        <p className="font-semibold text-gray-800">{item.acronym}</p>
                        <p className="text-sm text-gray-600">{item.name}</p>
                    </div>
                ))
            ) : (
                <p className="text-gray-500 text-center py-4">No items added yet.</p>
            )}
        </div>
    );

    // --- Panels ---
    const AnnouncementPanel = (
        <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col h-full">
            <div className="flex items-center gap-2 ">
                <h2 className="text-2xl font-bold text-[#0172bd]">Announcement</h2>
                <Bell className="w-7 h-7 text-[#0172bd] ml-2 mt-1" />
            </div>
            <div className="space-y-4 flex flex-col">
                <input
                    type="text"
                    placeholder="Title of announcement"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
                />
                <textarea
                    placeholder="Body of announcement"
                    value={newAnnouncement.body}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, body: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0172bd] resizable-y min-h-[150px]"
                ></textarea>
                <button
                    onClick={handlePostAnnouncement}
                    className="self-end px-6 py-2 bg-[#0172bd] text-white font-semibold rounded-lg hover:bg-blue-500 transition duration-150 ease-in-out"
                >
                    Post
                </button>
            </div>
            <div className="mt-6">
                <h3 className="text-xl font-bold text-[#0172bd] mb-2">Past Announcements</h3>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-y-auto custom-scrollbar max-h-[250px]">
                    {announcements.length > 0 ? (
                        announcements.map((ann, index) => (
                            <div
                                key={index}
                                className={`p-4 bg-white rounded-lg shadow-sm ${index !== 0 ? 'mt-2' : ''}`}
                            >
                                <h4 className="font-bold text-[#0172bd]">{ann.title}</h4>
                                <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                                    {ann.description || ann.body}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center">No past announcements.</p>
                    )}
                </div>
            </div>
        </div>
    );

    const ProgramsPanel = (
        <div className="bg-white p-4 rounded-xl shadow-lg flex-1 flex flex-col h-full">
            <div className="flex flex-col md:flex-row gap-4 h-full">
                {/* Tertiary Programs Panel */}
                <div className="flex-1 flex flex-col bg-gray-50 rounded-xl shadow-md p-4 h-full">
                    <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-lg font-bold text-[#0172bd]">Tertiary Programs</h2>
                        <GraduationCap className="w-6 h-6 text-[#0172bd]" />
                    </div>
                    <div className="flex-1">{renderProgramList(tertiaryPrograms)}</div>
                    <button
                        onClick={() => handleAddProgram('Tertiary')}
                        className="mt-4 px-6 py-2 bg-[#28a745] text-white font-semibold rounded-lg hover:bg-green-500 transition duration-150 ease-in-out flex items-center justify-center gap-2"
                    >
                        <Plus size={18} />
                        <span>Add Program</span>
                    </button>
                </div>
                {/* SHS Strands Panel */}
                <div className="flex-1 flex flex-col bg-gray-50 rounded-xl shadow-md p-4 h-full">
                    <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-lg font-bold text-[#0172bd]">SHS Strands</h2>
                        <Building className="w-6 h-6 text-[#0172bd]" />
                    </div>
                    <div className="flex-1">{renderProgramList(shsStrands)}</div>
                    <button
                        onClick={() => handleAddProgram('SHS')}
                        className="mt-4 px-6 py-2 bg-[#28a745] text-white font-semibold rounded-lg hover:bg-green-500 transition duration-150 ease-in-out flex items-center justify-center gap-2"
                    >
                        <Plus size={18} />
                        <span>Add Strand</span>
                    </button>
                </div>
            </div>
        </div>
    );

    const WellnessPanel = (
        <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-[#0172bd]">Wellness Program</h2>
                <Link2 className="w-6 h-6 text-[#0172bd]" />
            </div>
            <input
                type="url"
                placeholder="https://linkNgWellnessProgram.com"
                value={tempWellnessLink}
                onChange={(e) => setTempWellnessLink(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
            />
            <button
                onClick={handleSetWellnessLink}
                className="mt-4 px-6 py-2 bg-[#28a745] text-white font-semibold rounded-lg hover:bg-green-500 transition duration-150 ease-in-out self-end"
            >
                Set
            </button>
        </div>
    );

    // New Panels
    const ViolationsPanel = (
        <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-[#0172bd]">Violations</h2>
                <ShieldAlert className="w-6 h-6 text-[#0172bd]" />
            </div>
            <button
                onClick={() => setIsViolationModalOpen(true)}
                className="w-full px-6 py-2 bg-[#28a745] text-white font-semibold rounded-lg hover:bg-green-500 transition duration-150 ease-in-out flex items-center justify-center gap-2 mb-4"
            >
                <Plus size={18} />
                <span>Add Violation</span>
            </button>
            <div className="mt-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-[#0172bd] mb-2">Predefined Violations</h3>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-y-auto custom-scrollbar flex-1">
                    {violations.length > 0 ? (
                        violations.map((v) => (
                            <div key={v.id} className="p-4 bg-white rounded-lg shadow-sm mb-2">
                                <h4 className="font-bold text-[#0172bd]">{v.category}</h4>
                                <p className="text-sm text-gray-600">Priority: {v.priority}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center">No violations defined yet.</p>
                    )}
                </div>
            </div>
        </div>
    );

    const SchoolYearPanel = (
        <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-[#0172bd]">School Year & Academic Period</h2>
                <CalendarDays className="w-6 h-6 text-[#0172bd]" />
            </div>
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select School Year</label>
                        <select
                            value={tempSchoolYearData.currentYear}
                            onChange={(e) => setTempSchoolYearData({ ...tempSchoolYearData, currentYear: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
                        >
                            <option>2024-2025</option>
                            <option>2025-2026</option>
                            <option>2026-2027</option>
                        </select>
                    </div>
                    {/* College Semester Section */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">College Semester</label>
                        <select
                            value={tempSchoolYearData.currentCollegeSemester}
                            onChange={(e) => setTempSchoolYearData({ ...tempSchoolYearData, currentCollegeSemester: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
                        >
                            <option>1st Semester</option>
                            <option>2nd Semester</option>
                        </select>
                    </div>
                    {/* SHS Quarter Section */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">SHS Quarter</label>
                        <select
                            value={tempSchoolYearData.currentShsQuarter}
                            onChange={(e) => setTempSchoolYearData({ ...tempSchoolYearData, currentShsQuarter: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
                        >
                            <option>1st Quarter</option>
                            <option>2nd Quarter</option>
                            <option>3rd Quarter</option>
                            <option>4th Quarter</option>
                        </select>
                    </div>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                    <h4 className="text-lg font-semibold mb-2">Current Academic Period:</h4>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 p-4 bg-white rounded-lg shadow-sm">
                            <h5 className="font-semibold text-gray-800">College</h5>
                            <p className="text-xl font-bold text-[#0172bd]">
                                {schoolYearData.currentYear} - {schoolYearData.currentCollegeSemester}
                            </p>
                        </div>
                        <div className="flex-1 p-4 bg-white rounded-lg shadow-sm">
                            <h5 className="font-semibold text-gray-800">SHS</h5>
                            <p className="text-xl font-bold text-[#0172bd]">
                                {schoolYearData.currentYear} - {schoolYearData.currentShsQuarter}
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleSetSchoolYear}
                    className="w-full px-6 py-2 bg-[#28a745] text-white font-semibold rounded-lg hover:bg-green-500 transition duration-150 ease-in-out"
                >
                    Update
                </button>
            </div>
        </div>
    );

    const QuickLinksPanel = (
        <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-[#0172bd]">Quick Links & Resources</h2>
                <FileText className="w-6 h-6 text-[#0172bd]" />
            </div>
            <button
                onClick={() => setIsQuickLinkModalOpen(true)}
                className="w-full px-6 py-2 bg-[#28a745] text-white font-semibold rounded-lg hover:bg-green-500 transition duration-150 ease-in-out flex items-center justify-center gap-2 mb-4"
            >
                <Plus size={18} />
                <span>Add Quick Link</span>
            </button>
            <div className="mt-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-[#0172bd] mb-2">Uploaded Resources</h3>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-y-auto custom-scrollbar flex-1">
                    {quickLinks.length > 0 ? (
                        quickLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-4 bg-white rounded-lg shadow-sm mb-2 hover:bg-gray-100 transition"
                            >
                                <FileText className="text-[#0172bd] flex-shrink-0" />
                                <span className="font-medium text-gray-800 break-all">{link.title} ({link.fileName})</span>
                                <Link2 size={16} className="text-gray-400 flex-shrink-0 ml-auto" />
                            </a>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center">No resources uploaded yet.</p>
                    )}
                </div>
            </div>
        </div>
    );

    // --- Top Buttons ---
    const topButtons = [
        { key: PANEL.ANNOUNCEMENT, label: "Announcement", icon: <Bell className="w-5 h-5" /> },
        { key: PANEL.PROGRAMS, label: "Programs/Strands", icon: <span className="flex gap-1"><GraduationCap className="w-5 h-5" /><Building className="w-5 h-5" /></span> },
        { key: PANEL.VIOLATIONS, label: "Violations", icon: <ShieldAlert className="w-5 h-5" /> },
        { key: PANEL.SCHOOL_YEAR, label: "School Year", icon: <CalendarDays className="w-5 h-5" /> },
        { key: PANEL.QUICKLINKS, label: "Quick Links & Resources", icon: <FileText className="w-5 h-5" /> },
        { key: PANEL.WELLNESS, label: "Wellness Link", icon: <Link2 className="w-5 h-5" /> },
    ];

    return (
        <div className="flex flex-col h-full bg-gray-100 p-2 md:p-4 gap-4 font-sans">
            <style>
                {`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: #e5e7eb;
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #9ca3af;
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #6b7280;
                    }
                    .resizable-y {
                        resize: vertical;
                    }
                `}
            </style>
            {/* Top Row Buttons */}
            <div className="flex flex-wrap gap-2 md:gap-4 w-full">
                {topButtons.map(btn => (
                    <button
                        key={btn.key}
                        onClick={() => setActivePanel(btn.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition
                            ${activePanel === btn.key
                                ? "bg-[#0172bd] text-white shadow"
                                : "bg-white text-black hover:bg-gray-200"}
                            flex-1 min-w-[150px] justify-center`}
                    >
                        {btn.icon}
                        <span className="whitespace-nowrap">{btn.label}</span>
                    </button>
                ))}
            </div>

            {/* Panels */}
            <div className="flex-1 w-full overflow-hidden">
                {activePanel === PANEL.ANNOUNCEMENT && AnnouncementPanel}
                {activePanel === PANEL.PROGRAMS && ProgramsPanel}
                {activePanel === PANEL.WELLNESS && WellnessPanel}
                {activePanel === PANEL.QUICKLINKS && QuickLinksPanel}
                {activePanel === PANEL.VIOLATIONS && ViolationsPanel}
                {activePanel === PANEL.SCHOOL_YEAR && SchoolYearPanel}
            </div>

            {/* Add Program/Strand Modal */}
            <div className={`${isAddModalOpen ? 'flex' : 'hidden'} fixed inset-0 z-50 items-center justify-center bg-black bg-opacity-50`}>
                <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm md:max-w-md transform transition-all scale-100 ease-out duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-[#0172bd]">Add New {modalType === 'SHS' ? 'Strand' : 'Program'}</h3>
                        <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={handleModalSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Program/Strand</label>
                                <input
                                    type="text"
                                    required
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Acronym</label>
                                <input
                                    type="text"
                                    required
                                    value={newItem.acronym}
                                    onChange={(e) => setNewItem({ ...newItem, acronym: e.target.value.toUpperCase() })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                            </div>
                        </div>
                        <div className="flex flex-row justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="flex items-center justify-center gap-2 bg-[#dc3545] text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-150 ease-in-out"
                            >
                                <span>Cancel</span>
                                <X className="w-5 h-5" />
                            </button>
                            <button
                                type="submit"
                                className="flex items-center justify-center gap-2 bg-[#28a745] text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-500 transition duration-150 ease-in-out"
                            >
                                <span>Add</span>
                                <Check className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {/* Add Quick Link Modal */}
            <div className={`${isQuickLinkModalOpen ? 'flex' : 'hidden'} fixed inset-0 z-50 items-center justify-center bg-black bg-opacity-50`}>
                <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm md:max-w-md transform transition-all scale-100 ease-out duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-[#0172bd]">Add New Quick Link</h3>
                        <button onClick={() => setIsQuickLinkModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={handleQuickLinkUpload}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newQuickLink.title}
                                    onChange={(e) => setNewQuickLink({ ...newQuickLink, title: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    placeholder="e.g., Student Handbook"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">PDF File</label>
                                <label className="block w-full cursor-pointer bg-gray-100 text-gray-700 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#0172bd] transition p-6 text-center">
                                    <span className="font-semibold">{newQuickLink.file ? newQuickLink.file.name : 'Choose PDF File'}</span>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => setNewQuickLink({ ...newQuickLink, file: e.target.files[0] })}
                                        className="hidden"
                                        required
                                    />
                                </label>
                            </div>
                        </div>
                        <div className="flex flex-row justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsQuickLinkModalOpen(false)}
                                className="flex items-center justify-center gap-2 bg-[#dc3545] text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-150 ease-in-out"
                            >
                                <span>Cancel</span>
                                <X className="w-5 h-5" />
                            </button>
                            <button
                                type="submit"
                                className="flex items-center justify-center gap-2 bg-[#28a745] text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-500 transition duration-150 ease-in-out"
                            >
                                <span>Upload</span>
                                <Check className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {/* Add Violation Modal */}
            <div className={`${isViolationModalOpen ? 'flex' : 'hidden'} fixed inset-0 z-50 items-center justify-center bg-black bg-opacity-50`}>
                <div className="bg-white p-6 rounded-xl shadow-2xl h-78 w-full max-w-sm md:max-w-md transform transition-all scale-100 ease-out duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-[#0172bd]">Add New Violation</h3>
                        <button onClick={() => setIsViolationModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={handleViolationModalSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Violation Category Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newViolation.category}
                                    onChange={(e) => setNewViolation({ ...newViolation, category: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Priority Level (1-3, 3 is highest)</label>
                                <select
                                    required
                                    value={newViolation.priority}
                                    onChange={(e) => setNewViolation({ ...newViolation, priority: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                >
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-row justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsViolationModalOpen(false)}
                                className="flex items-center justify-center gap-2 bg-[#dc3545] text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-150 ease-in-out"
                            >
                                <span>Cancel</span>
                                <X className="w-5 h-5" />
                            </button>
                            <button
                                type="submit"
                                className="flex items-center justify-center gap-2 bg-[#28a745] text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-500 transition duration-150 ease-in-out"
                            >
                                <span>Add</span>
                                <Check className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
        </div>
    );
}
