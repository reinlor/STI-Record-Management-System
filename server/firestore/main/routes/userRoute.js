const express = require("express");
const { 
  getUsers, 
  addUser, 
  updateUser, 
  deleteUser, 
  authenticateUser 
} = require("../controller/userController.js");

const router = express.Router();

router.get("/", getUsers);                      // Get all users
router.post("/create", addUser);                // Add a user
router.delete("/:id", deleteUser);              // Delete a user by ID
router.put("/update/:uid", updateUser);         // Update a user by UID (changed param to uid + method to PUT)
router.post("/authenticate", authenticateUser); // Authenticate user (changed to POST)

module.exports = router;
