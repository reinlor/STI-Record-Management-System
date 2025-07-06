import React, { useEffect, useState } from "react";
import axios from "axios"; // ✅ Axios for HTTP requests

const UserManager = () => {
  // ✅ State to hold the list of users fetched from the backend
  const [users, setUsers] = useState([]);

  // ✅ States to handle form inputs for adding a user
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");

  // ✅ useEffect runs once when the component mounts
  useEffect(() => {
    fetchUsers(); // Call function to load users initially
  }, []);

  // ✅ Function to fetch all users (GET request)
  const fetchUsers = async () => {
    try {
      // Make GET request to backend API
      const res = await axios.get("http://localhost:5000/users");

      // Update the users state with the response data
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // ✅ Function to add a new user (POST request)
  const handleAddUser = async (e) => {
    e.preventDefault(); // Prevent form submission reload

    try {
      // Make POST request to add a user
      const res = await axios.post("http://localhost:5000/users", {
        name,
        pass,
      });

      // Append the newly added user to the existing users state
      setUsers((prev) => [...prev, res.data]);

      // Reset input fields
      setName("");
      setPass("");
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  // ✅ Function to delete a user by ID (DELETE request)
  const handleDeleteUser = async (id) => {
    try {
      // Send DELETE request to backend
      await axios.delete(`http://localhost:5000/users/${id}`);

      // Remove deleted user from UI state
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>User Manager</h1>

      {/* ✅ Form to add a new user */}
      <form onSubmit={handleAddUser}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)} // Update name state on input
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)} // Update password state on input
          required
        />
        <button type="submit">Add User</button>
      </form>

      {/* ✅ Render list of users */}
      <h2>User List:</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <strong>{user.lastName}, {user.firstName}</strong> — <em>{user.studentID}</em>
            <button
              onClick={() => handleDeleteUser(user.id)} // Call delete function
              style={{ marginLeft: "10px" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManager;
