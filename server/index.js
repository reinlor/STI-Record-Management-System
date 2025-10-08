const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const userRoute = require("./firestore/main/routes/userRoute");
const studentRoute = require("./firestore/main/routes/studentRoute");
const uploadRoute = require("./firestore/main/routes/uploadRoute");
const studentCaseRoute = require("./firestore/main/routes/studentCasesRoute");
const counselingRoute = require("./firestore/main/routes/counselingRoute");
const slipRoute = require("./firestore/main/routes/slipRoute");
const teacherRoute = require("./firestore/main/routes/teacherRoute");
const referralRouter = require("./firestore/main/routes/referralRoute");
const assessmentExam = require("./firestore/main/routes/assessmentExamRoute");
const assessmentReport = require("./firestore/main/routes/assessmentReportRoute");
const assessmentVersionHistory = require("./firestore/main/routes/assessmentVersionHistoryRoute")
const backupRoute = require("./firestore/backup/routes/backupRoute");
const emailRoute = require("./modules/email/emailRoute");
const bulkUploadRoute = require("./firestore/main/bulk/bulkUploadRoute");
const batchUpdateRoute = require("./firestore/main/batch/batchUpdateRoute");
const chartDataRoute = require("./firestore/main/routes/chartDataRoute");
const demoOCRRoute = require("./modules/photo-to-text/routes/demoHTRRoute")
const contentManagementRoute = require("./firestore/main/routes/contentManagementRoute");
const incidentReportRoute = require("./firestore/main/routes/incidentReportRoute");
const notificationRoute = require("./firestore/main/routes/notificationRoute")
const surveyResponsesRoute = require("./firestore/main/routes/surveyResponseRoute")
const summaryRoute = require("./modules/summary-generation/SummaryRoute")


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/user", userRoute);
app.use("/student", studentRoute);
app.use("/upload", uploadRoute);
app.use("/cases", studentCaseRoute);
app.use("/counseling", counselingRoute);
app.use("/slip", slipRoute);
app.use("/teacher", teacherRoute);
app.use("/referral", referralRouter);
app.use("/exam", assessmentExam);
app.use('/exam', surveyResponsesRoute);
app.use("/report", assessmentReport);
app.use("/backup", backupRoute);
app.use("/email", emailRoute);
app.use("/bulk-upload", bulkUploadRoute);
app.use("/batch-update", batchUpdateRoute);
app.use("/chartData", chartDataRoute);
app.use("/wellnessVersion", assessmentVersionHistory)
app.use('/photo-to-text', demoOCRRoute);
app.use("/content", contentManagementRoute)
app.use("/incidentReport", incidentReportRoute);
app.use("/notifications", notificationRoute);
app.use("/generate", summaryRoute)

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});