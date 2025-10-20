const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require("dotenv").config();
const authMiddleware = require('./authentication');
const securityHeaders = require('./securityHeader');

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
const configRoutes = require("./firestore/main/routes/firebaseClientConfigRoute");

const backupController = require("./firestore/backup/controller/backupController");

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "127.0.0.1";

// Security Middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes gar
  max: 100, // 100 requests per windowMs 😏
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// custom security headers
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  app.use(securityHeaders);
}

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many authentication attempts, try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests, slow down.',
  standardHeaders: true,
  legacyHeaders: false
});


// Routes
app.use('/user', authLimiter, authMiddleware, userRoute);
app.use("/student", authMiddleware, studentRoute);
app.use("/upload", authMiddleware, uploadRoute);
app.use("/cases", authMiddleware, studentCaseRoute);
app.use("/counseling", authMiddleware, counselingRoute);
app.use("/slip", authMiddleware, slipRoute);
app.use("/teacher", authMiddleware, teacherRoute);
app.use("/referral", authMiddleware, referralRouter);
app.use("/exam", authMiddleware, assessmentExam);
app.use('/exam', authMiddleware, surveyResponsesRoute);
app.use("/report", authMiddleware, assessmentReport);
app.use("/email", authMiddleware, emailRoute);
app.use("/bulk-upload", authMiddleware, bulkUploadRoute);
app.use("/batch-update", authMiddleware, batchUpdateRoute);
app.use("/chartData", authMiddleware, chartDataRoute);
app.use("/wellnessVersion", authMiddleware, assessmentVersionHistory);
app.use('/photo-to-text', authMiddleware, demoOCRRoute);
app.use("/content", authMiddleware, contentManagementRoute);
app.use("/incidentReport", authMiddleware, incidentReportRoute);
app.use("/notifications", authMiddleware, notificationRoute);
app.use("/generate", authMiddleware, summaryRoute);
app.use("/backup", backupRoute);
app.use("/api/backup", backupRoutes);
app.use('/api/restore', authMiddleware, restoreRoutes);
app.use('/restore', authMiddleware, restoreRoutes);
app.use('/firebase', configRoutes);

app.use([
  '/student', '/upload', '/cases', '/counseling', '/slip', '/teacher', '/referral',
  '/exam', '/report', '/backup', '/email', '/bulk-upload', '/batch-update',
  '/chartData', '/wellnessVersion', '/photo-to-text', '/content',
  '/incidentReport', '/notifications', '/generate', '/api/backup', '/api/restore', '/restore'
], apiLimiter);

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://${HOST}:${PORT}`);
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

cron.schedule("0 0 * * *", async () => {
  console.log("🕓 Cron: Checking for outdated pending slips...");

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const processCollection = async (collectionName) => {
      const ref = db.collection(collectionName);
      const snapshot = await ref.where("status", "==", "Pending").get();

      if (snapshot.empty) {
        console.log(`✅ ${collectionName}: No pending documents found.`);
        return 0;
      }

      const batch = db.batch();
      let updatedCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();

        const createdAt = data.timeCreated
          ? (data.timeCreated.toDate
            ? data.timeCreated.toDate()
            : new Date(data.timeCreated))
          : null;

        if (createdAt && createdAt <= sevenDaysAgo) {
          batch.update(doc.ref, { 
            status: "Inactive" , 
            processedDate: new Date()
          });
          updatedCount++;
        }
      });

      if (updatedCount > 0) {
        await batch.commit();
      }

      console.log(`🧾 ${collectionName}: Marked ${updatedCount} slips as Inactive.`);
      return updatedCount;
    };

    const absentCount = await processCollection("absentSlips");
    const incidentCount = await processCollection("incidentReport");

    console.log(
      `✅ Cron done: ${absentCount + incidentCount} total records marked as Inactive.`
    );
  } catch (err) {
    console.error("❌ Cron error updating slips:", err);
  }
});