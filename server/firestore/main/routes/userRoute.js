const express = require("express");
const authMiddleware = require("../../../authentication");
const { 
  getUsers, 
  addUser, 
  updateUser, 
  deleteUser, 
  authenticateUser,
  getUserByID,
  resetPassword,
  logoutUser,
  getSessionUser
} = require("../controller/userController.js");

const router = express.Router();

router.post("/authenticate", authenticateUser);
router.post("/logout", logoutUser);
router.use(authMiddleware);

router.get("/", getUsers);                        // Get all users
router.get("/get/:id", getUserByID);              // Get user by ID
router.post("/create", addUser);                  // Add a user
router.delete("/:id", deleteUser);                // Delete a user by ID
router.put("/update/:uid", updateUser);           // Update a user by UID (changed param to uid + method to PUT)
router.get("/me", getSessionUser);                // get user session

module.exports = router;
