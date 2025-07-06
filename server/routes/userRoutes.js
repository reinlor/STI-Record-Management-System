// Import Express to use its routing features
const express = require("express");

// Import controller functions that handle the logic for each route
const { getUsers, updateUser, deleteUser } = require("../controller/userController.js");

// Create a new router instance
const router = express.Router();

/**
 * Route: GET /
 * Description: Fetches all users from the database
 * Example usage: http://localhost:5000/users
 */
router.get("/", getUsers);

/**
 * Route: DELETE /:id
 * Description: Deletes a specific user by ID from the database
 * Example usage: http://localhost:5000/users/abc123
 * Note: ":id" is a dynamic route parameter representing the user’s document ID
 */
router.delete("/:id", deleteUser);

router.post("/update/:id", updateUser);

// Export the router so it can be used in your main server file (e.g., index.js)
module.exports = router;
