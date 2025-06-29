const express = require("express");
const { getUsers, addUser, deleteUser } = require("../controller/userController.js");

const router = express.Router();

router.get("/", getUsers); // http://localhost:5000/users - Get all users
router.post("/", addUser); // http://localhost:5000/users - din pero POST request 
router.delete("/:id", deleteUser); // http://localhost:5000/users/:id - Delete ng user

module.exports = router;