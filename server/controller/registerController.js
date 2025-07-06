const admin = require("../firebase");
const { getUserCollection } = require("../models/userModel.js");

// Controller function to handle registration
const registerUser = async (req, res) => {
  const { email, password, firstName, lastName, gender, role, studentID } = req.body;

  try {
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`
    });

    // Store additional user data in Firestore
    await getUserCollection().doc(studentID).set({
      email,
      firstName,
      lastName,
      gender,
      role,
      password,
      studentID,
      uid: userRecord.uid,
    });

    res.status(201).json({ message: "User registered", uid: studentID });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerUser };
