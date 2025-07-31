const express = require("express");
const { getUsers, addUser, updateUser, deleteUser, loginUser } = require("../controller/userController.js");
const router = express.Router();

router.get("/", getUsers);                    // For retrieving all user
router.post("/create", addUser)               // For adding a user
router.delete("/:id", deleteUser);            // For deleting a user by ID (Turn into archiving sa later dates)
router.post("/update/:id", updateUser);       // For updating a user by ID
router.post("/login", loginUser);             // For logging in a user

module.exports = router;
