import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react'; // Added logout icon
import STILogo from '../../../assets/sti-logo.png';

export default function StudentTopbar() {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const containerRef = useRef(null);

    // Close dropdown on outside click
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

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="w-full flex items-center justify-between bg-white border-b-2 border-blue-700 px-6 py-3">
            {/* Left side */}
            <div className="flex items-center">
                <img src={STILogo} alt="STI Logo" className="w-14 h-10 mr-3" />
                <h3 className="text-xl font-semibold text-black">
                    Guidance and Counseling Online Slip Request
                </h3>
            </div>

            {/* Settings + Dropdown */}
            <div ref={containerRef} className="relative">
                <Settings
                    className="w-10 h-10 text-gray-700 hover:text-blue-700 cursor-pointer p-2 border border-gray-300 rounded-full transition-colors duration-200"
                    onClick={() => setIsDropdownOpen(open => !open)}
                />

                {isDropdownOpen && (
                    <div
                        className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 z-10 animate-fadeIn"
                        style={{ animation: 'fadeIn 0.15s ease-in-out' }}
                    >
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-500 hover:text-white transition-colors duration-150"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                )}
            </div>

            {/* Fade-in animation */}
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(-4px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fadeIn {
                        animation: fadeIn 0.15s ease-in-out;
                    }
                `}
            </style>
        </div>
    );
}
