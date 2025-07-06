// Import the function that returns the "Users" collection from Firestore
const { getUserCollection } = require("../models/userModel.js");
const admin = require("../firebase.js");

/**
 * GET all users from Firestore
 * URL: GET /users
 */
const getUsers = async (req, res) => {
  try {
    // Fetch all documents in the "Users" collection
    const snapshot = await getUserCollection().get();

    // Transform the documents into an array of user objects with their IDs
    const users = snapshot.docs.map((doc) => ({
      id: doc.id, // Include the Firestore document ID
      ...doc.data(), // Spread the document data (e.g., name, pass)
    }));

    // Respond with status 200 and the list of users
    res.status(200).send(users);
  } catch (error) {
    // If something goes wrong, respond with status 500 and an error message
    res.status(500).send({ error: "Failed to fetch users" });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, gender, email, password, role, studentID, uid } =
    req.body;

  try {
    // Get the document reference
    const userDocRef = getUserCollection().doc(id);

    // Check if the document exists
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Perform the update
    await userDocRef.update({
      firstName,
      lastName,
      gender,
      email,
      password,
      role,
      studentID,
      uid,
    });

    return res
      .status(200)
      .json({ message: `User Account: ${id} updated successfully.` });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
};

/**
 * DELETE a user by ID
 * URL: DELETE /users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userDoc = await getUserCollection().doc(id).get();

    if (!userDoc.exists) {
      return res.status(404).send({ error: "User not found" });
    }

    const { uid } = userDoc.data();
    console.log("✅ Retrieved UID:", uid);

    // Delete the user in Firebase Authentication
    await admin.auth().deleteUser(uid);

    // Then delete Firestore record
    await getUserCollection().doc(id).delete();

    return res.status(200).send({ message: `User ID: ${id} deleted.` });
  } catch (error) {
    console.error("❌ Error in deleteUser:", error);
    res.status(500).send({ error: "Failed to delete user" });
  }
};

// Export the controller functions so they can be used in routes
module.exports = { getUsers, deleteUser, updateUser };
