import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { auth } from './firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';


onAuthStateChanged(auth, (user) => {
  if (user) {
    const minimal = {
      uid: user.uid,
      email: user.email,
    };
    try { localStorage.setItem('currentUser', JSON.stringify(minimal)); } catch (e) {  }
  } else {
    try { localStorage.removeItem('currentUser'); } catch (e) {  }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
