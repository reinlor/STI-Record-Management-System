import React, { createContext, useState, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebaseClient";
import axios from "axios";

export const AuthContext = createContext(null);

const SESSION_TIMEOUT = 30 * 60 * 1000;

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
  const logoutTimer = useRef(null);

  const startLogoutTimer = () => {
    clearTimeout(logoutTimer.current);
    logoutTimer.current = setTimeout(() => {
      console.warn("Session expired. Logging out...");
      setShowTimeoutModal(true);
      logout();
    }, SESSION_TIMEOUT);
  };

  const login = (userData, userRole, displayName) => {
    setAuthData({
      user: userData,
      role: userRole,
      displayName,
      isAuthenticated: true,
      loading: false,
    });
    startLogoutTimer();
  };

  const logout = async () => {
    try {
      await signOut(auth);
      await axios.post("/user/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    }

    clearTimeout(logoutTimer.current);
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
        startLogoutTimer();
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

    return () => clearTimeout(logoutTimer.current);
  }, []);

  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {children}

      {showTimeoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-[90%] max-w-sm text-center">
            <h2 className="text-xl font-semibold mb-4">Login Timeout</h2>
            <p className="text-gray-600 mb-6">
              Your session has expired. Please log in again.
            </p>
            <button
              onClick={() => setShowTimeoutModal(false)}
              className="bg-[#0172B9] text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
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
