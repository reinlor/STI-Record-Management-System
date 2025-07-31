const { getUserCollection } = require("../models/userModel.js");
const admin = require("../../../firebase");

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

// Controller Function to create user (Not final since microsoft login gamit ng)
const addUser = async (req, res) => {
  try {
    const newStudent = req.body;
    const uid = newStudent.uid;

    await getUserCollection().doc(uid).set(newStudent);
    
    res.status(201).json({ 
      message: "Student registered successfully", 
      id: uid 
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

    const doc = await studentRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Student not found" });
    }

    await studentRef.set(updates, { merge: true });

    res.status(200).json({ 
      message: "Student updated successfully",
      id: uid,
      updates: updates
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Controller Function to delete user (Papalitan ng archiving sa mga later dates)
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

const loginUser = async (req, res) => {
  try {
    const { uid, password } = req.body;

    const snapshot = await getUserCollection().where("uid", "==", uid).get();

    if(snapshot.empty){
      return res.status(404).send({error: "User not found"});
    }

    const userPassword = snapshot.docs[0].data().password;

    if(password !== userPassword){
      return res.status(401).json({error: "Invalid password"})
    }

    else{
      return res.status(200).json({
        message: "Login Successful",
        user: snapshot.docs[0].data()
      })
    }

  } catch (error) {
    res.status(500).send({error: "Failed to login user"})
  }
}

module.exports = { getUsers, addUser, deleteUser, updateUser, loginUser };
