const dns = require("dns");
dns.setDefaultResultOrder("ipv4first"); // Fixes Google OAuth socket drop on Node v24

const admin = require("firebase-admin");
require("dotenv").config({ path: "/etc/myapp.env" });

const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || "";
const formattedPrivateKey = rawPrivateKey.replace(/\\n/g, "\n");

if (!admin.apps.length) {
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