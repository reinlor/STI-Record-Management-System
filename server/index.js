const express = require("express");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const registerRoute = require("./routes/registerRoute");
const uploadRoute = require("./routes/uploadRoute");
const violationRoute = require("./routes/violationRoute");
const counselingRoute = require("./routes/counselingRoute");
const slipRoute = require("./routes/slipRoute");
const teacherRoute = require("./routes/teacherRoute");
const referralRouter = require("./routes/referralRoute");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/user", userRoutes);
app.use("/register", registerRoute);
app.use("/upload", uploadRoute);
app.use("/violation", violationRoute);
app.use("/counseling", counselingRoute);
app.use("/slip", slipRoute);
app.use("/teacher", teacherRoute);
app.use("/referral", referralRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
