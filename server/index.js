const express = require("express");
const cors = require("cors");
require("dotenv").config();
const userRoute = require("./firestore/main/routes/userRoute");
const studentRoute = require("./firestore/main/routes/studentRoute");
const uploadRoute = require("./firestore/main/routes/uploadRoute");
const violationRoute = require("./firestore/main/routes/violationRoute");
const counselingRoute = require("./firestore/main/routes/counselingRoute");
const slipRoute = require("./firestore/main/routes/slipRoute");
const teacherRoute = require("./firestore/main/routes/teacherRoute");
const referralRouter = require("./firestore/main/routes/referralRoute");
const assessmentExam = require("./firestore/main/routes/assessmentExamRoute");
const assessmentReport = require("./firestore/main/routes/assessmentReportRoute")

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/user", userRoute);                   
app.use("/student", studentRoute);             
app.use("/upload", uploadRoute);                
app.use("/violation", violationRoute);          
app.use("/counseling", counselingRoute);       
app.use("/slip", slipRoute); 
app.use("/teacher", teacherRoute);
app.use("/referral", referralRouter);        
app.use("/exam", assessmentExam);
app.use("/report", assessmentReport);             
 
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
