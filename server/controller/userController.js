const { getUserCollection } = require("../models/userModel.js");

// Use to get Users
const getUsers = async (req, res) => {
  try {
    const snapshot = await getUserCollection().get();
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch users" });
  }
};

// Use to add a new User
const addUser = async (req, res) => {
  try {
    const { name, pass } = req.body;
    const newUser = { name, pass };
    const docRef = await getUserCollection().add(newUser);
    res.status(201).send({ id: docRef.id, ...newUser });
  } catch (error) {
    res.status(500).send({ error: "Failed to add user" });
  }
};

// Use to delete a User by ID - Hindi kailangan pero pede  mag serve as example
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await getUserCollection().doc(id).delete();
    res.status(200).send({ message: "User deleted successfully!" });
  } catch (error) {
    res.status(500).send({ error: "Failed to delete user" });
  }
};

module.exports = { getUsers, addUser, deleteUser };