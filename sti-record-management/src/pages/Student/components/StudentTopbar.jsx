import React, { useState, useRef, useEffect } from "react";
import { Settings, LogOut, KeyRound, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const modules = [
  { id: "dashboard", text: "Dashboard" },
  { id: "profile", text: "Profile" },
  { id: "request", text: "Request Slips" },
  { id: "history", text: "View Request History" },
  { id: "wellness", text: "Wellness Check" },
  { id: "survey", text: "Survey Form" },
];

const StudentTopBar = ({
  selected,
  setSelected,
  onLogout,
  onOpenChangePassword,
}) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="bg-gray-900 text-white flex items-center justify-between px-4 py-4 relative">
      {/* Left Section (Logo + Nav) */}
      <div className="flex items-center">
        <span className="text-2xl font-bold text-[#FFCF3F] mr-6">
          STI GORMS
        </span>

        {/* Desktop Menu (show starting from sm: screens) */}
        <div className="hidden sm:flex space-x-2 font-medium">
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setSelected(mod.id)}
              className={`py-2 px-4 rounded-md transition-colors ${
                selected === mod.id
                  ? "bg-[#FFCF3F] text-black font-bold"
                  : "hover:bg-gray-700"
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
            className="p-2 text-gray-400 hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 rounded-full"
            onClick={() => setIsDropdownOpen((open) => !open)}
            aria-expanded={isDropdownOpen}
            aria-label="User settings menu"
          >
            <Settings className="w-6 h-6" />
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-lg shadow-xl py-2 z-20">
              <button
                onClick={() => {
                  onOpenChangePassword();
                  setIsDropdownOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition-colors duration-150"
              >
                <KeyRound className="w-4 h-4 text-blue-500" />
                <span>Change Password</span>
              </button>
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
        <div className="absolute top-full left-0 w-full bg-gray-800 text-white flex flex-col items-start px-4 py-3 space-y-2 sm:hidden z-30 shadow-lg">
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => {
                setSelected(mod.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2 px-3 rounded-md transition-colors ${
                selected === mod.id
                  ? "bg-[#FFCF3F] text-black font-bold"
                  : "hover:bg-gray-700"
              }`}
            >
              {mod.text}
            </button>
          ))}

          <hr className="border-gray-600 w-full my-2" />

          <button
            onClick={() => {
              onOpenChangePassword();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-md"
          >
            <KeyRound className="w-4 h-4 text-blue-400" />
            <span>Change Password</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-200 hover:bg-red-500 hover:text-white rounded-md"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>

  );
};

export default StudentTopBar;