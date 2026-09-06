const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const admin = require("firebase-admin");
require("dotenv").config();

const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || "";
const formattedPrivateKey = rawPrivateKey.replace(/\\n/g, "\n");

if (!admin.apps.length) {
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !formattedPrivateKey) {
    throw new Error("Firebase Admin credentials are not configured");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: formattedPrivateKey,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

module.exports = { admin };