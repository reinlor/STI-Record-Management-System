const { getUserCollection } = require("../models/userModel.js");
const { admin } = require("../../../firebase");

// Controller Function to retrieve all users
const getUsers = async (req, res) => {
  try {
    const snapshot = await getUserCollection().get();

    const users = snapshot.docs.map((doc) => ({
      ...doc.data(),
    }));

    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch users" });
  }
};

// Controller function for retrieving teacher data by ID
const getUserByID = async (req, res) => {
  try {
    const { id } = req.params;
    const userRef = getUserCollection().doc(id);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: "Teacher not found"
      });
    }

    res.status(200).json({
      id: doc.id,
      ...doc.data()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
}

// Controller Function to create user
const addUser = async (req, res) => {
  try {
    const { displayName, email, password, role, uid, ...additionalUserData } = req.body;

    if (!uid || !email || !password) {
      return res.status(400).json({ error: "Missing required fields: uid, email, and password." });
    }

    const userRecord = await admin.auth().createUser({
      uid: uid,
      email: email,
      password: password,
      displayName: displayName,
    });

    const accountID = userRecord.uid;

    if (!accountID) {
      return res
        .status(400)
        .json({ error: "Failed to create user in Firebase Auth" });
    }

    await getUserCollection()
      .doc(accountID)
      .set({
        uid: accountID,
        displayName: displayName,
        email: email,
        role: role,
        ...additionalUserData,
      });

    res.status(201).json({
      message: "User registered successfully",
      uid: accountID,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Controller Function to update user
const updateUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No update data provided" });
    }
    const studentRef = getUserCollection().doc(uid);

    if (updates.isArchived){
      await admin.auth().updateUser(uid, { disabled: true });
    } else {
      await admin.auth().updateUser(uid, { disabled: false });
    }

    const doc = await studentRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Student not found" });
    }

    await studentRef.set(updates, { merge: true });

    res.status(200).json({
      message: "Student updated successfully",
      id: uid,
      updates: updates,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Controller Function to delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userDocRef = getUserCollection().doc(id);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(404).send({ error: "User not found" });
    }

    const { _id } = userDoc.data();

    if (!_id) {
      return res.status(400).send({ error: "UID missing in user document" });
    }

    try {
      await admin.auth().deleteUser(_id);
    } catch (authError) {
      if (authError.code !== "auth/user-not-found") {
        throw authError;
      }
    }

    await userDocRef.delete();

    res.status(200).send({ message: `User ${id} deleted successfully.` });
  } catch (error) {
    res.status(500).send({ error: "Failed to delete user" });
  }
};

// Controller function used to authenticate user logins
const authenticateUser = async (req, res) => {
  try {
    const idToken = req.body.idToken;
    if (!idToken) {
      return res.status(401).json({ error: "No token provided" });
    }

    const expiresIn = 1000 * 60 * 60 * 24; // 1 day

    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const userDoc = await getUserCollection().doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found in Firestore" });
    }

    res.cookie("session", sessionCookie, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: expiresIn,
    });

    return res.status(200).json({
      message: "Authenticated",
      user: userDoc.data(),
    });

  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};


// Controller function to verify session cookies
const requireAuth = async (req, res, next) => {
  try {
    const sessionCookie = req.cookies.session || "";
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    req.user = decodedClaims;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

// Controller function to logout and clear user logins
const logoutUser = (req, res) => {
  res.clearCookie("session");
  res.status(200).json({ message: "Logged out" });
};

// Controller function to get login sessions
const getSessionUser = async (req, res) => {
  try {
    const sessionCookie = req.cookies.session || "";
    if (!sessionCookie) {
      return res.status(401).json({ error: "Unauthorized - No cookie" });
    }

    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    const userDoc = await getUserCollection().doc(decodedClaims.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user: userDoc.data() });
  } catch (error) {
    console.error("Session check error:", error);
    return res.status(401).json({ error: "Unauthorized - Invalid/expired cookie" });
  }
};


const resetPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const link = await admin.auth().generatePasswordResetLink(email);
    res.status(200).json(link);
  } catch (error) {
    console.error("Error sending password reset link:", error);
    res.status(500).json({ error: "Failed to send password reset link" });
  }
};

module.exports = {
  getUsers,
  addUser,
  deleteUser,
  updateUser,
  authenticateUser,
  requireAuth,
  getUserByID,
  resetPassword,
  logoutUser,
  getSessionUser
};
