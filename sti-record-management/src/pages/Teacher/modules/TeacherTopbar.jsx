import React, { useState, useRef, useEffect } from 'react';
import { Settings, LogOut, KeyRound, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const modules = [
    { id: "submit", text: "Submit Referral Form" },
    { id: "view", text: "View Request History" },
];

export default function TeacherTopbar({ selected, setSelected, onLogout, onOpenChangePassword }) {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const containerRef = useRef(null);
    const mobileMenuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            // Close desktop dropdown if click is outside
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
            
            // Close mobile menu if click is outside
            if (
                isMobileMenuOpen &&
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target) &&
                !event.target.closest("button.sm:hidden")
            ) {
                setIsMobileMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen]);

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="bg-[#0B5793] text-white flex items-center justify-between px-4 py-4 relative shadow-lg">
            {/* Left Section (Logo + Nav) */}
            <div className="flex items-center">
                <span className="text-2xl sm:text-3xl font-bold mr-3 sm:mr-6">
                    <span className="text-[#F4D03F]">STI</span>{" "}
                    <span className="text-white">GORMS</span>
                </span>

                {/* Desktop Menu (show starting from sm: screens) */}
                <div className="hidden sm:flex space-x-1 lg:space-x-2 font-medium">
                    {modules.map((mod) => (
                        <button
                            key={mod.id}
                            onClick={() => setSelected(mod.id)}
                            className={`py-2 px-3 lg:px-4 rounded-md transition-colors whitespace-nowrap text-sm lg:text-base ${
                                selected === mod.id
                                    ? 'bg-[#3473A4] text-white font-bold'
                                    : 'hover:bg-[#3473A4]'
                            }`}
                        >
                            {mod.text}
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
                {/* Settings Dropdown (PC only) */}
                <div ref={containerRef} className="relative hidden sm:block">
                    <button
                        className="p-2 text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#F4D03F] rounded-full"
                        onClick={() => setIsDropdownOpen(open => !open)}
                        aria-expanded={isDropdownOpen}
                        aria-label="User settings menu"
                    >
                        <Settings className="w-6 h-6" />
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-lg shadow-xl py-2 z-20 animate-fade-in">
                            <button
                                onClick={() => {
                                    onOpenChangePassword();
                                    setIsDropdownOpen(false);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[#39310F] hover:bg-[#E8E9EF] transition-colors duration-150"
                            >
                                <KeyRound className="w-4 h-4 text-[#0B5793]" />
                                <span>Change Password</span>
                            </button>
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[#39310F] hover:bg-red-500 hover:text-white transition-colors duration-150"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Hamburger (only visible on xs) */}
                <button
                    className="sm:hidden p-2 text-gray-300 hover:text-white"
                    onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                >
                    {isMobileMenuOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
                </button>
            </div>

            {/* Mobile Menu Panel */}
            {isMobileMenuOpen && (
                <div ref={mobileMenuRef} className="absolute top-full left-0 w-full bg-white text-[#607D8D] flex flex-col items-start px-4 py-3 space-y-2 sm:hidden z-30 shadow-lg animate-fade-in-down">
                    {modules.map((mod) => (
                        <button
                            key={mod.id}
                            onClick={() => {
                                setSelected(mod.id);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`w-full text-left py-3 px-4 rounded-lg transition-colors duration-200 ${
                                selected === mod.id
                                    ? 'bg-[#3473A4] text-white font-bold'
                                    : 'hover:bg-[#E8E9EF]'
                            }`}
                        >
                            {mod.text}
                        </button>
                    ))}
                    
                    <hr className="border-gray-300 w-full my-2" />

                    <button
                        onClick={() => {
                            onOpenChangePassword();
                            setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[#607D8D] hover:bg-[#E8E9EF] rounded-md transition-colors"
                    >
                        <KeyRound className="w-4 h-4 text-[#0B5793]" />
                        <span>Change Password</span>
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[#607D8D] hover:bg-red-500 hover:text-white rounded-md transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
}