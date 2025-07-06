import { useState } from "react";
import axios from "axios"; // For making HTTP requests

// Register component
const Register = () => {
  // React state to store form values
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    gender: "Male", // Default gender
    role: "Student", // Default role
    studentID: "", // For student identification
  });

  // Updates form state whenever an input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handles form submission
  const handleRegister = async (e) => {
    e.preventDefault(); // Prevents page refresh on form submit
    try {
      // Sends a POST request to your backend API with form data
      const res = await axios.post("http://localhost:5000/register", form);

      // If successful, show UID returned by server
      alert(`Registered! UID: ${res.data.uid}`);
    } catch (err) {
      // Show error message if registration fails
      alert(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      {/* Input for first name */}
      <input
        name="firstName"
        onChange={handleChange}
        placeholder="First Name"
      />

      {/* Input for last name */}
      <input name="lastName" onChange={handleChange} placeholder="Last Name" />

      {/* Input for student ID */}
      <input
        name="studentID"
        onChange={handleChange}
        placeholder="Student ID"
      />

      {/* Input for email */}
      <input name="email" onChange={handleChange} placeholder="Email" />

      {/* Input for password (hidden characters) */}
      <input
        name="password"
        type="password"
        onChange={handleChange}
        placeholder="Password"
      />

      {/* Gender selection dropdown */}
      <select name="gender" onChange={handleChange}>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>

      {/* Role selection dropdown */}
      <select name="role" onChange={handleChange}>
        <option value="Student">Student</option>
        <option value="Teacher">Teacher</option>
        <option value="Admin">Admin</option>
      </select>

      {/* Submit button to trigger registration */}
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
