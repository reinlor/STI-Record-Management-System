import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { initializeFirebase } from './firebaseClient';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Set axios defaults before any requests
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.headers.common["Accept"] = "application/json";

// Initialize app with error boundary
const root = createRoot(document.getElementById('root'));

async function startApp() {
  try {
    const { auth } = await initializeFirebase();

    // Set up auth state listener
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          localStorage.setItem("currentUser", JSON.stringify({
            uid: user.uid,
            email: user.email
          }));
        } catch (err) {
          console.warn('Failed to get ID token:', err);
        }
      } else {
        delete axios.defaults.headers.common["Authorization"];
        localStorage.removeItem("currentUser");
      }
    });

    // Render once Firebase is ready
    root.render(
      <StrictMode>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
        />
      </StrictMode>
    );
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // Show error state
    root.render(
      <div>Failed to initialize application. Please refresh the page.</div>
    );
  }
}

// Start the app
startApp();