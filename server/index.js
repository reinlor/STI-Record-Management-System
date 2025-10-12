// filepath: c:\Users\eneil\Desktop\Mga System Ni Eneil\Record Management System\server\index.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { admin } = require("./firebase");
const db = admin.firestore();

const cron = require('node-cron');
const axios = require('axios');

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
const assessmentVersionHistory = require("./firestore/main/routes/assessmentVersionHistoryRoute");
const backupRoute = require("./firestore/backup/routes/backupRoute");
const emailRoute = require("./modules/email/emailRoute");
const bulkUploadRoute = require("./firestore/main/bulk/bulkUploadRoute");
const batchUpdateRoute = require("./firestore/main/batch/batchUpdateRoute");
const chartDataRoute = require("./firestore/main/routes/chartDataRoute");
const demoOCRRoute = require("./modules/photo-to-text/routes/HTRRoute");
const contentManagementRoute = require("./firestore/main/routes/contentManagementRoute");
const incidentReportRoute = require("./firestore/main/routes/incidentReportRoute");
const notificationRoute = require("./firestore/main/routes/notificationRoute");
const surveyResponsesRoute = require("./firestore/main/routes/surveyResponseRoute");
const summaryRoute = require("./modules/summary-generation/SummaryRoute");
const backupRoutes = require("./firestore/backup/routes/backupRoute");
const restoreRoutes = require("./firestore/backup/routes/restoreRoutes");

const backupController = require("./firestore/backup/controller/backupController");

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
app.use("/wellnessVersion", assessmentVersionHistory);
app.use('/photo-to-text', demoOCRRoute);
app.use("/content", contentManagementRoute);
app.use("/incidentReport", incidentReportRoute);
app.use("/notifications", notificationRoute);
app.use("/generate", summaryRoute);
app.use("/backup", backupRoute);
app.use("/api/backup", backupRoutes);
app.use('/api/restore', restoreRoutes);
app.use('/restore', restoreRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Cron Scheduler
cron.schedule('* * * * *', async () => {
  try {
    console.log('cron: checking backup schedule...');
    const scheduleDoc = await db.collection('backupSettings').doc('schedule').get();

    if (!scheduleDoc.exists) {
      // Balik if walang schedule
      return;
    }

    const { schedule, nextBackup } = scheduleDoc.data() || {};

    if (!schedule || schedule === 'none') {
      // Balik pag wala o naka set manual
      return;
    }

    if (!nextBackup) {
      const now = new Date();
      let newNext = new Date();
      switch (schedule) {
        case '3hours': newNext.setHours(now.getHours() + 3); break;
        case '12hours': newNext.setHours(now.getHours() + 12); break;
        case 'daily': newNext.setDate(now.getDate() + 1); break;
        case 'weekly': newNext.setDate(now.getDate() + 7); break;
        default: newNext = null;
      }
      if (newNext) {
        await db.collection('backupSettings').doc('schedule').update({ nextBackup: newNext.toISOString() });
        console.log('cron: nextBackup initialized to', newNext.toISOString());
      }
      return;
    }

    const next = new Date(nextBackup);
    const now = new Date();

    if (now >= next) {
      console.log(`cron: time reached. Running backup (schedule ${schedule})`);
      const result = await backupController.runBackup();
      if (result.success) {
        const newNext = new Date();
        switch (schedule) {
          case '3hours':
            newNext.setHours(newNext.getHours() + 3);
            break;
          case '12hours':
            newNext.setHours(newNext.getHours() + 12);
            break;
          case 'daily':
            newNext.setDate(newNext.getDate() + 1);
            break;
          case 'weekly':
            newNext.setDate(newNext.getDate() + 7);
            break;
          default:
            await db.collection('backupSettings').doc('schedule').update({ nextBackup: null });
            console.log('cron: unknown schedule, set nextBackup null');
            return;
        }

        await db.collection('backupSettings').doc('schedule').update({
          nextBackup: newNext.toISOString(),
        });

        console.log('cron: backup success, next scheduled at', newNext.toISOString());
      } else {
        console.error('cron: backup failed:', result.error);
      }
    } else {
    }
  } catch (err) {
    console.error('cron: unexpected error', err);
  }
});