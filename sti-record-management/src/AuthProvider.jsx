import React, { createContext, useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from "./firebaseClient";
import axios from "axios";
export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState({
    user: null,
    role: null,
    uid: null,
    displayName: null,
    isAuthenticated: false,
    loading: true,
  });

  const login = (userData, userRole, displayName) => {
    setAuthData({
      user: userData,
      role: userRole,
      displayName: displayName,
      isAuthenticated: true,
      loading: false,
    });
  };

  const logout = async () => {
    try {
      console.log("logging out...");

      await signOut(auth);

      await axios.post("/user/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    }

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
  }, []);


  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider