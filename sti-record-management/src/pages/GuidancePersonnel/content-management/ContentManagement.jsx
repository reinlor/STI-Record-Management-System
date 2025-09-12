import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Check, Bell, GraduationCap, Building, Link2, Settings } from 'lucide-react';

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
    QUICKLINKS: 'quicklinks'
};

export default function ContentManagement() {
    const [activePanel, setActivePanel] = useState(PANEL.ANNOUNCEMENT);

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

    const API = "/content"; // adjust base URL if needed

    const showToast = (message, type) => {
        setToast({ isVisible: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 3000);
    };

    // === Fetch data on mount ===
    useEffect(() => {
        const fetchData = async () => {
            try {
                const annRes = await axios.get(`${API}/announcement/get`);
                setAnnouncements(annRes.data.announcements || []);

                const progRes = await axios.get(`${API}/program/get`);
                setTertiaryPrograms(progRes.data.programs || []);

                const strandRes = await axios.get(`${API}/strand/get`);
                setShsStrands(strandRes.data.strands || []);

                const wellRes = await axios.get(`${API}/wellness/get`);
                setWellnessLink(wellRes.data.link || '');
                setTempWellnessLink(wellRes.data.link || '');
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

    const renderProgramList = (list) => (
        <div className="flex flex-col space-y-2 h-full overflow-y-auto custom-scrollbar">
            {list.map((item, index) => (
                <div key={index} className="p-2 bg-gray-100 rounded-lg shadow-sm">
                    <p className="font-semibold text-gray-800">{item.acronym}</p>
                    <p className="text-sm text-gray-600">{item.name}</p>
                </div>
            ))}
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0172bd] resizable-y min-h-[200px]"
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
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-y-auto custom-scrollbar max-h-150">
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

    const QuickLinksPanel = (
        <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col flex-1 h-full">
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-[#0172bd]">Quick Links & Resources</h2>
                <Settings className="w-6 h-6 text-[#0172bd]" />
            </div>
            <div className="flex-grow flex items-center justify-center p-4 text-center text-gray-500">
                <p>This module can be used to manage important links for students and staff. You can add, edit, and remove links to keep them up to date with school resources and events.</p>
            </div>
        </div>
    );

    // --- Top Buttons ---
    const topButtons = [
        {
            key: PANEL.ANNOUNCEMENT,
            label: "Announcement",
            icon: <Bell className="w-5 h-5" />
        },
        {
            key: PANEL.PROGRAMS,
            label: "Programs/Strands",
            icon: (
                <span className="flex gap-1">
                    <GraduationCap className="w-5 h-5" />
                    <Building className="w-5 h-5" />
                </span>
            )
        },
        {
            key: PANEL.WELLNESS,
            label: "Wellness Link",
            icon: <Link2 className="w-5 h-5" />
        },
        {
            key: PANEL.QUICKLINKS,
            label: "Quick Links & Resources",
            icon: <Settings className="w-5 h-5" />
        }
    ];

    return (
        <div className="flex flex-col h-full bg-gray-100 p-2 md:p-4 gap-4">
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
                        <span>{btn.label}</span>
                    </button>
                ))}
            </div>

            {/* Panels */}
            <div className="flex-1 w-full">
                {activePanel === PANEL.ANNOUNCEMENT && AnnouncementPanel}
                {activePanel === PANEL.PROGRAMS && ProgramsPanel}
                {activePanel === PANEL.WELLNESS && WellnessPanel}
                {activePanel === PANEL.QUICKLINKS && QuickLinksPanel}
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
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
        </div>
    );
}
