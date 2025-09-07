import React, { useState, useEffect } from 'react';
import { Plus, X, Link, Check, Bell, GraduationCap, Building, Link2, Settings } from 'lucide-react';

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

export default function ContentManagement() {
    const [announcements, setAnnouncements] = useState([
        { title: "Campus-wide Safety Drill", body: "Please be advised that there will be a mandatory safety and fire drill on Friday, October 26, 2025, at 10:00 AM. All students and staff are required to participate. Follow the designated evacuation routes." },
        { title: "Guidance Office is Open!", body: "Welcome back, students! The Guidance Office is now open for consultations. You can book an appointment with a counselor to discuss academic concerns, personal growth, or career planning. We're here to support you!" },
    ]);

    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', body: '' });

    const [tertiaryPrograms, setTertiaryPrograms] = useState([
        { name: "Bachelor of Science in Information Technology", acronym: "BSIT" },
        { name: "Bachelor of Science in Hospitality Management", acronym: "BSHM" },
        { name: "Bachelor of Science in Tourism Management", acronym: "BSTM" },
        { name: "Bachelor of Science in Computer Science", acronym: "BSCS" },
    ]);

    const [shsStrands, setShsStrands] = useState([
        { name: "Science, Technology, Engineering, and Mathematics", acronym: "STEM" },
        { name: "Humanities and Social Sciences", acronym: "HUMSS" },
        { name: "Information and Communications Technology", acronym: "ICT" },
        { name: "Technical-Vocational-Livelihood", acronym: "TVL" },
    ]);

    const [wellnessLink, setWellnessLink] = useState("https://wellnessprogram.com");
    const [tempWellnessLink, setTempWellnessLink] = useState(wellnessLink);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'SHS' or 'Tertiary'
    const [newItem, setNewItem] = useState({ name: '', acronym: '' });

    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

    const showToast = (message, type) => {
        setToast({ isVisible: true, message, type });
        setTimeout(() => {
            setToast({ ...toast, isVisible: false });
        }, 3000);
    };

    const handlePostAnnouncement = () => {
        if (newAnnouncement.title && newAnnouncement.body) {
            setAnnouncements([newAnnouncement, ...announcements]);
            setNewAnnouncement({ title: '', body: '' });
            showToast("New announcement successfully posted!", "success");
        } else {
            showToast("Please fill out both title and body fields.", "error");
        }
    };

    const handleSetWellnessLink = () => {
        if (tempWellnessLink) {
            setWellnessLink(tempWellnessLink);
            showToast("Wellness Program link successfully updated!", "success");
        } else {
            showToast("Please provide a valid link.", "error");
        }
    };

    const handleAddProgram = (type) => {
        setModalType(type);
        setIsAddModalOpen(true);
    };

    const handleModalSubmit = (e) => {
        e.preventDefault();
        if (newItem.name && newItem.acronym) {
            if (modalType === 'Tertiary') {
                setTertiaryPrograms([...tertiaryPrograms, newItem]);
                showToast("New Program successfully added!", "success");
            } else if (modalType === 'SHS') {
                setShsStrands([...shsStrands, newItem]);
                showToast("New Strand successfully added!", "success");
            }
            setIsAddModalOpen(false);
            setNewItem({ name: '', acronym: '' });
        } else {
            showToast("Please fill out both fields.", "error");
        }
    };

    const renderProgramList = (list) => (
        <div className="flex flex-col space-y-2 lg:h-48 md:h-30 overflow-y-auto custom-scrollbar">
            {list.map((item, index) => (
                <div key={index} className="p-2 bg-gray-100 rounded-lg shadow-sm">
                    <p className="font-semibold text-gray-800">{item.acronym}</p>
                    <p className="text-sm text-gray-600">{item.name}</p>
                </div>
            ))}
        </div>
    );

    // Save to localStorage whenever lists change
    useEffect(() => {
        localStorage.setItem('tertiaryPrograms', JSON.stringify(tertiaryPrograms));
    }, [tertiaryPrograms]);

    useEffect(() => {
        localStorage.setItem('shsStrands', JSON.stringify(shsStrands));
    }, [shsStrands]);

    return (
        <div className="flex flex-col md:flex-row h-full bg-gray-100 p-2 md:p-4 gap-2 md:gap-4">
            {/* Left Column */}
            <div className="w-full md:w-2/3 flex flex-col gap-2">
                {/* Announcements */}
                <div className="bg-white p-2 sm:p-3 md:p-4 rounded-xl shadow-lg flex flex-col h-auto">
                    <div className="flex items-center gap-2 mb-2 md:mb-4">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-black">Announcement</h2>
                        <Bell className="w-5 h-5 md:w-7 md:h-7 text-gray-700 ml-2 mt-1" />
                    </div>
                    <div className="space-y-2 md:space-y-4 flex-grow flex flex-col">
                        <input
                            type="text"
                            placeholder="Title of announcement"
                            value={newAnnouncement.title}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                            className="w-full p-2 sm:p-2 md:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-xs sm:text-sm md:text-base"
                        />
                        <textarea
                            placeholder="Body of announcement"
                            value={newAnnouncement.body}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, body: e.target.value })}
                            className="w-full p-2 sm:p-2 md:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resizable-y min-h-[60px] md:min-h-[80px] text-xs sm:text-sm md:text-base"
                        ></textarea>
                        <button
                            onClick={handlePostAnnouncement}
                            className="self-end px-3 sm:px-4 md:px-6 py-2 bg-[#1a1a2e] text-white font-semibold rounded-lg hover:bg-[#3c2844] transition duration-150 ease-in-out text-xs sm:text-sm md:text-base"
                        >
                            Post
                        </button>
                    </div>
                    <div className="flex-grow overflow-hidden flex flex-col mt-2 h-50">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-black mb-2">Past Announcements</h3>
                        <div className="p-2 sm:p-2 md:p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-y-auto custom-scrollbar flex-grow">
                            {announcements.length > 0 ? (
                                announcements.map((ann, index) => (
                                    <div key={index} className="mb-2 md:mb-4 last:mb-0 p-2 sm:p-2 md:p-4 bg-white rounded-lg shadow-sm">
                                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base">{ann.title}</h4>
                                        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 whitespace-pre-wrap">{ann.body}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center text-xs sm:text-sm">No past announcements.</p>
                            )}
                        </div>
                    </div>
                </div>
                {/* Programs and Strands */}
                <div className="flex flex-col sm:flex-row gap-2 md:h-68 lg:h-full">
                    <div className="flex-1 bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-lg flex flex-col mb-2 md:mb-0">
                        <div className="flex items-center gap-2 mb-2 md:mb-4">
                            <h2 className="text-base sm:text-lg md:text-lg font-bold text-gray-800">Tertiary Programs</h2>
                            <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                        </div>
                        {renderProgramList(tertiaryPrograms)}
                        <button
                            onClick={() => handleAddProgram('Tertiary')}
                            className="mt-2 md:mt-4 px-3 sm:px-4 md:px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-150 ease-in-out flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base"
                        >
                            <Plus size={18} />
                            <span>Add Program</span>
                        </button>
                    </div>
                    <div className="flex-1 bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-lg flex flex-col">
                        <div className="flex items-center gap-2 mb-2 md:mb-4 ">
                            <h2 className="text-base sm:text-lg md:text-lg font-bold text-gray-800">SHS Strands</h2>
                            <Building className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                        </div>
                        {renderProgramList(shsStrands)}
                        <button
                            onClick={() => handleAddProgram('SHS')}
                            className="mt-2 md:mt-4 px-3 sm:px-4 md:px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-150 ease-in-out flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base"
                        >
                            <Plus size={18} />
                            <span>Add Strand</span>
                        </button>
                    </div>
                </div>
            </div>
            {/* Right Column */}
            <div className="w-full md:w-1/3 flex flex-col gap-2">
                {/* Wellness Program Link */}
                <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-lg flex flex-col">
                    <div className="flex items-center gap-2 mb-2 md:mb-4">
                        <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Wellness Program</h2>
                        <Link2 className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                    </div>
                    <input
                        type="url"
                        placeholder="https://linkNgWellnessProgram.com"
                        value={tempWellnessLink}
                        onChange={(e) => setTempWellnessLink(e.target.value)}
                        className="w-full p-2 sm:p-2 md:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-xs sm:text-sm md:text-base"
                    />
                    <button
                        onClick={handleSetWellnessLink}
                        className="mt-2 md:mt-4 px-3 sm:px-4 md:px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-150 ease-in-out self-end text-xs sm:text-sm md:text-base"
                    >
                        Set
                    </button>
                </div>
                {/* Suggested Module */}
                <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-lg flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2 md:mb-4">
                        <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Quick Links & Resources</h2>
                        <Settings className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                    </div>
                    <div className="flex-grow flex items-center justify-center p-2 sm:p-2 md:p-4 text-center text-gray-500 text-xs sm:text-sm md:text-base">
                        <p>This module can be used to manage important links for students and staff. You can add, edit, and remove links to keep them up to date with school resources and events.</p>
                    </div>
                </div>
            </div>
            
            {/* Add Program/Strand Modal */}
            <div className={`${isAddModalOpen ? 'flex' : 'hidden'} fixed inset-0 z-50 items-center justify-center bg-black bg-opacity-50`}>
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md transform transition-all scale-100 ease-out duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Add New {modalType === 'SHS' ? 'Strand' : 'Program'}</h3>
                        <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={handleModalSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700">Program/Strand</label>
                                <input
                                    type="text"
                                    required
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-xs sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700">Acronym</label>
                                <input
                                    type="text"
                                    required
                                    value={newItem.acronym}
                                    onChange={(e) => setNewItem({ ...newItem, acronym: e.target.value.toUpperCase() })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-xs sm:text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="flex items-center justify-center gap-2 bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-150 ease-in-out text-xs sm:text-sm"
                            >
                                <X className="w-5 h-5" />
                                <span>Cancel</span>
                            </button>
                            <button
                                type="submit"
                                className="flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition duration-150 ease-in-out text-xs sm:text-sm"
                            >
                                <Check className="w-5 h-5" />
                                <span>Add</span>
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
