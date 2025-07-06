const express = require("express");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const registerRoute = require("./routes/registerRoute");
const uploadRoute = require("./routes/uploadRoute");
const recordRoute = require("./routes/recordRoute");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/user", userRoutes);
app.use("/register", registerRoute);
app.use("/upload", uploadRoute);
app.use("/record", recordRoute);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
