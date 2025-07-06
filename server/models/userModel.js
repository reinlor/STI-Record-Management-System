// Import the initialized Firebase Admin SDK instance
const admin = require("../firebase"); // This gives access to Firestore and Auth services

/**
 * Returns the Firestore collection named "users"
 * This is a helper function used to interact with the "users" collection
 */
const getUserCollection = () => {
  // Access Firestore and return the "users" collection reference
  return admin.firestore().collection("users");
};

// Export the function so other files (like controllers) can use it
module.exports = { getUserCollection };
