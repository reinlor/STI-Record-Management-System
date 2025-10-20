import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import axios from 'axios';

let auth;
let db;

async function initializeFirebase() {
  try {
    const response = await axios.get('/firebase/config');
    const firebaseConfig = response.data;

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    setPersistence(auth, browserLocalPersistence).catch(err => {
      console.error('Failed to set auth persistence:', err);
    });

    return { db, auth }; 
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error; 
  }
}

export { initializeFirebase, auth, db }; 