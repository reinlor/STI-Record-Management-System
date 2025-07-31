const firebase = require("firebase-admin");
require("dotenv").config();

// Main Database
const admin = firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

// Archive Database
const archive = firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: process.env.ARCHIVE_FIREBASE_PROJECT_ID,
    privateKey: process.env.ARCHIVE_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.ARCHIVE_FIREBASE_CLIENT_EMAIL,
  }),
  databaseURL: process.env.ARCHIVE_FIREBASE_DATABASE_URL,
}, 'archiveapp');

module.exports = {admin, archive};