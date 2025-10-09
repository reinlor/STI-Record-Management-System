import React, { createContext, useState, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebaseClient";
import axios from "axios";

export const AuthContext = createContext(null);

const SESSION_TIMEOUT = 5 * 60 * 1000;

const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState({
    user: null,
    role: null,
    uid: null,
    displayName: null,
    isAuthenticated: false,
    loading: true,
  });

  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const activityTimer = useRef(null);

  const resetInactivityTimer = () => {
    clearTimeout(activityTimer.current);
    activityTimer.current = setTimeout(() => {
      console.warn("User inactive for too long — logging out.");
      setShowTimeoutModal(true);
      logout();
    }, SESSION_TIMEOUT);
  };

  const setupActivityListeners = () => {
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });
    resetInactivityTimer();
  };

  const cleanupActivityListeners = () => {
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => {
      window.removeEventListener(event, resetInactivityTimer);
    });
    clearTimeout(activityTimer.current);
  };

  const login = (userData, userRole, displayName) => {
    setAuthData({
      user: userData,
      role: userRole,
      displayName,
      isAuthenticated: true,
      loading: false,
    });
    setupActivityListeners();
  };

  const logout = async () => {
    try {
      await signOut(auth);
      await axios.post("/user/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    }

    cleanupActivityListeners();
    setAuthData({
      user: null,
      role: null,
      uid: null,
      displayName: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get("/user/me", { withCredentials: true });
        const userData = response.data.user;

        setAuthData({
          user: userData,
          role: userData.role,
          displayName: userData.displayName,
          isAuthenticated: true,
          loading: false,
        });
        setupActivityListeners();
      } catch (error) {
        console.error("Session check failed:", error);
        setAuthData({
          user: null,
          role: null,
          displayName: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    };

    checkSession();
    return cleanupActivityListeners;
  }, []);

  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {children}

      {/* Timeout Modal */}
      {showTimeoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-[90%] max-w-sm text-center animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Login Timeout
            </h2>
            <p className="text-gray-600 mb-6">
              Your session has expired due to inactivity. Please log in again.
            </p>
            <button
              onClick={() => setShowTimeoutModal(false)}
              className="bg-[#0172b9] text-white px-4 py-2 rounded-lg hover:bg-[#025f98] transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
 