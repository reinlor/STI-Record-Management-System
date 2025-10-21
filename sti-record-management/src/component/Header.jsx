import React, { useState, useRef, useEffect, useContext } from "react";
import GuidanceNotificationIcon from "../component/GuidanceNotificationIcon.jsx";
import { AuthContext } from "../AuthProvider.jsx";
import ChangePasswordModal from "./ChangePasswordModal.jsx";
import { Settings, LogOut, KeyRound, Menu, X } from "lucide-react";

export default function Header({ className, setSelectedPage }) {
  const { authData, logout } = useContext(AuthContext);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <header className={className}>
        <div className="h-full w-full flex flex-col bg-[#f3f4f6]">
          <div className="flex items-center justify-between p-4 md:p-8 w-full h-19 gap-4 box-border bg-[#1a1a2e] shadow-md relative z-10">
            <h2 className="text-[1.3rem] font-bold m-0 text-white">
              Welcome,{" "}
              <span className="text-[#fef201] font-bold">
                {authData.displayName}
              </span>
            </h2>

            <div className="flex items-center gap-4">
              <GuidanceNotificationIcon setSelected={setSelectedPage} />

              {/* Settings dropdown (PC) */}
              <div ref={containerRef} className="relative hidden sm:block">
                <button
                  className="p-2 text-gray-300 hover:text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F4D03F] rounded-full"
                  onClick={() => setIsDropdownOpen((open) => !open)}
                  aria-expanded={isDropdownOpen}
                  aria-label="User settings menu"
                >
                  <Settings className="w-6 h-6" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-lg shadow-xl py-2 z-30">
                    <button
                      onClick={() => {
                        setIsChangePasswordOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[#39310F] hover:bg-[#E8E9EF] cursor-pointer transition-colors duration-150"
                    >
                      <KeyRound className="w-4 h-4 text-[#0B5793]" />
                      <span>Change Password</span>
                    </button>

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[#39310F] hover:bg-red-500 hover:text-white cursor-pointer transition-colors duration-150"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu */}
              <div className="sm:hidden">
                <button
                  className="p-2 text-gray-300 hover:text-white"
                  onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                  aria-label="Open mobile menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>

                {isMobileMenuOpen && (
                  <div className="absolute top-full right-4 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-30">
                    <button
                      onClick={() => {
                        setIsChangePasswordOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[#607D8D] hover:bg-[#E8E9EF] rounded-md transition-colors"
                    >
                      <KeyRound className="w-4 h-4 text-[#0B5793]" />
                      <span>Change Password</span>
                    </button>

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[#607D8D] hover:bg-red-500 hover:text-white rounded-md transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
}
