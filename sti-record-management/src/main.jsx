import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { auth } from './firebaseClient';
import { onAuthStateChanged, onIdTokenChanged } from 'firebase/auth';
import axios from 'axios';

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const token = await user.getIdToken();
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const minimal = { uid: user.uid, email: user.email };
    localStorage.setItem("currentUser", JSON.stringify(minimal));
  } else {
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("currentUser");
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
