import React, { createContext, useContext, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from "./firebaseClient";
export const AuthContext = createContext(null);

// axios.post = async (url, data) => {
//   console.log(`Mock Axios POST to ${url} with data:`, data);
//   await new Promise(resolve => setTimeout(resolve, 500));
//   return {
//     data: {
//       user: {
//         role: "Admin", // Mocking a successful response
//         displayName: "Admin User" // Mocking the displayName from the backend
//       }
//     }
//   };
// };

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

  const logout = () => {
    console.log('logging out...')
    signOut(auth);
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthData({
          user: { uid: user.uid, email: user.email },
          displayName: user.displayName,
          role: null, 
          isAuthenticated: true,
          loading: false
        });
      } else {
        setAuthData({
          user: null,
          role: null,
          displayName: null,
          isAuthenticated: false,
          loading: false
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider