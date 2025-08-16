import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
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
        <div className="w-full flex items-center justify-between bg-[#0172B9] shadow-lg px-4 md:px-8 py-3 relative z-10">
            {/* Left side */}
            <div className="flex items-center space-x-3 md:space-x-4">
                <img src={STILogo} alt="STI Logo" className="h-9 md:h-11" />
                <h3 className="text-sm md:text-xl font-bold text-white tracking-wide">
                    Guidance and Counseling Online Slip Request
                </h3>
            </div>

            {/* Settings + Dropdown */}
            <div ref={containerRef} className="relative">
                <button
                    className="p-2 md:p-3 text-white hover:text-blue-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-full"
                    onClick={() => setIsDropdownOpen(open => !open)}
                    aria-expanded={isDropdownOpen}
                    aria-label="User settings menu"
                >
                    <Settings className="w-6 h-6 md:w-7 md:h-7" />
                </button>

                {isDropdownOpen && (
                    <div className="absolute top-full right-0 mt-3 w-40 bg-white rounded-lg shadow-xl py-2 z-20 animate-fade-in-up origin-top-right">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-500 hover:text-white transition-colors duration-150"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Custom fade-in animation */}
            <style jsx>{`
                .animate-fade-in-up {
                    animation: fadeInUp 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}