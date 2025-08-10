import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultPic from '../../../assets/user.png';
import STILogo from '../../../assets/sti-logo.png';

function TeacherTopbar() {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="w-full flex items-center justify-between bg-white border-b-2 border-blue-700 px-6 py-3">
            <div className="flex items-center">
                <img
                    src={STILogo}
                    alt='STI Logo'
                    className="w-14 h-10 mr-3"
                />
                <h3 className="text-xl font-semibold text-black">
                    Guidance and Counseling Online Slip Request
                </h3>
            </div>
            <div 
                className="relative" 
                onMouseEnter={() => setIsDropdownOpen(true)}
            >
                <img
                    src={DefaultPic}
                    alt='Profile Picture'
                    className="w-10 h-10 rounded-full border border-gray-300 cursor-pointer"
                />
                
                {isDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-10">
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-400 hover:text-white cursor-pointer"
                            onMouseLeave={() => setIsDropdownOpen(false)}
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TeacherTopbar;