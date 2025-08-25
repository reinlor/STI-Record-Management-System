import React, { useState, useRef, useEffect } from 'react';
import { Settings, LogOut } from 'lucide-react';

const modules = [
    { id: "submit", text: "Submit Referral Form" },
    { id: "view", text: "View Request History" },
];

export default function TeacherTopbar({ selected, setSelected, onLogout }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="bg-gray-900 text-white flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
                <span className="text-2xl font-bold text-[#FFCF3F] mr-8">STI GORMS</span>
                <div className="flex space-x-4 font-medium">
                    {modules.map((mod) => (
                        <button
                            key={mod.id}
                            onClick={() => setSelected(mod.id)}
                            className={`py-2 px-4 rounded-md transition-colors ${
                                selected === mod.id
                                    ? 'bg-[#FFCF3F] text-black font-bold'
                                    : 'hover:bg-gray-700'
                            }`}
                        >
                            {mod.text}
                        </button>
                    ))}
                </div>
            </div>
            <div ref={containerRef} className="relative">
                <button
                    className="p-2 text-white hover:text-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded-full"
                    onClick={() => setIsDropdownOpen(open => !open)}
                    aria-expanded={isDropdownOpen}
                    aria-label="User settings menu"
                >
                    <Settings className="w-6 h-6" />
                </button>
                {isDropdownOpen && (
                    <div className="absolute top-full right-0 mt-3 w-40 bg-white rounded-lg shadow-xl py-2 z-20">
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-500 hover:text-white transition-colors duration-150"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}