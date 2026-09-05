
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const cron = require("node-cron");
const axios = require("axios");

const authMiddleware = require("./authentication");
const securityHeaders = require("./securityHeader");
const { admin } = require("./firebase");
const db = admin.firestore();
const { Timestamp } = admin.firestore;
const backupController = require("./firestore/backup/controller/backupController");

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
const restoreRoutes = require("./firestore/backup/routes/restoreRoutes");
const configRoutes = require("./firestore/main/routes/firebaseClientConfigRoute");
const surveySummary = require("./firestore/main/routes/surveyResponseRoute");
const geminiApi = require('./modules/gemini-api-controller/apiController');
const userController = require("./firestore/main/controller/userController")

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://sti-gorms.online",
  "https://sti-record-management-system.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.options("*", cors(corsOptions));


// Authentication limiter
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 40,
  message: "Too many login attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Public route limiter (for /firebase/config)
const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many requests to public endpoint.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Main API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 1000 : 10000,
  message: "Too many requests, please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Global fallback limiter (very lenient)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: "Too many requests globally.",
});

// Safe Route Mount Helper
function safeUseRoute(path, ...middlewares) {
  try {
    if (typeof path !== "string" || !path.startsWith("/")) {
      throw new Error(`Invalid route path: ${path}`);
    }
    console.log(`🔍 Attempting to mount route: ${path}`);
    app.use(path, ...middlewares);
    console.log(`✅ Successfully mounted route: ${path}`);
  } catch (err) {
    console.error(`❌ Error mounting route at '${path}':`, err.message);
    console.warn(`⚠️ Skipping problematic route: ${path}`);
  }
}

// 🚏 Route Mounting

// Public routes (no auth)
safeUseRoute("/firebase", publicLimiter, configRoutes);

// Authenticated routes
app.use("/user", authLimiter, authMiddleware, userRoute);
app.use("/reset-password", apiLimiter, userController.resetPassword)
app.use("/student", apiLimiter, authMiddleware, studentRoute);
app.use("/cases", apiLimiter, authMiddleware, studentCaseRoute);
app.use("/slip", apiLimiter, authMiddleware, slipRoute);
app.use("/email", apiLimiter, emailRoute);
app.use("/photo-to-text", apiLimiter, authMiddleware, demoOCRRoute);
app.use("/referral", apiLimiter, authMiddleware, referralRouter);
app.use('/api/gemini', geminiApi);

// Wellness-related routes
safeUseRoute("/exam", authMiddleware, apiLimiter, assessmentExam);
safeUseRoute("/exam-response", authMiddleware, apiLimiter, surveyResponsesRoute);
safeUseRoute("/report", authMiddleware, apiLimiter, assessmentReport);
safeUseRoute("/wellnessVersion", authMiddleware, apiLimiter, assessmentVersionHistory);
safeUseRoute("/summary", authMiddleware, apiLimiter, surveyResponsesRoute);

// Data & content
safeUseRoute("/content", authMiddleware, apiLimiter, contentManagementRoute);
safeUseRoute("/chartData", authMiddleware, apiLimiter, chartDataRoute);
safeUseRoute("/notifications", authMiddleware, apiLimiter, notificationRoute);
safeUseRoute("/incidentReport", authMiddleware, apiLimiter, incidentReportRoute);

// File management and misc
safeUseRoute("/upload", apiLimiter, uploadRoute);
safeUseRoute("/teacher", apiLimiter, teacherRoute);
safeUseRoute("/counseling", apiLimiter, counselingRoute);
safeUseRoute("/bulk-upload", apiLimiter, bulkUploadRoute);
safeUseRoute("/batch-update", apiLimiter, batchUpdateRoute);

// Reports, summaries, backups
safeUseRoute("/generate", authMiddleware, apiLimiter, summaryRoute);
safeUseRoute("/backup", apiLimiter, backupRoute);
safeUseRoute("/api/backup", apiLimiter, backupRoute);
safeUseRoute("/api/restore", apiLimiter, restoreRoutes);
safeUseRoute("/restore", apiLimiter, restoreRoutes);

// Global fallback limiter
app.use(globalLimiter);

// Server Startup
app.listen(PORT, () => {
  console.log(`✅ Server running at PORT: ${PORT}`);
});

// CRON SCHEDULERS

cron.schedule("* * * * *", async () => {
  try {
    console.log("cron: checking backup schedule...");
    const scheduleDoc = await db.collection("backupSettings").doc("schedule").get();
    if (!scheduleDoc.exists) return;

    const { schedule, nextBackup } = scheduleDoc.data() || {};
    if (!schedule || schedule === "none") return;

    const now = new Date();
    let next = nextBackup ? new Date(nextBackup) : null;

    if (!next || now >= next) {
      console.log(`cron: Running backup (${schedule})`);
      const result = await backupController.runBackup();

      if (result.success) {
        const newNext = new Date();
        switch (schedule) {
          case "3hours": newNext.setHours(now.getHours() + 3); break;
          case "12hours": newNext.setHours(now.getHours() + 12); break;
          case "daily": newNext.setDate(now.getDate() + 1); break;
          case "weekly": newNext.setDate(now.getDate() + 7); break;
          default: return;
        }
        await db.collection("backupSettings").doc("schedule").update({ nextBackup: newNext.toISOString() });
        console.log("cron: backup success, next at", newNext.toISOString());
      } else {
        console.error("cron: backup failed:", result.error);
      }
    }
  } catch (err) {
    console.error("cron: unexpected error", err);
  }
});

cron.schedule("0 0 * * *", async () => {
  console.log("🕓 Cron: Checking for outdated pending slips...");
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const collections = ["absentSlips", "incidentReport"];

    for (const name of collections) {
      const ref = db.collection(name);
      const snapshot = await ref
        .where("status", "==", "Pending")
        .get();

      if (snapshot.empty) continue;

      const batch = db.batch();
      let updatedCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const timeCreated = data.timeCreated;

        let createdDate;
        if (timeCreated instanceof Timestamp) {
          createdDate = timeCreated.toDate();
        } else if (typeof timeCreated === 'string') {
          createdDate = new Date(timeCreated);
          if (isNaN(createdDate.getTime())) {
            console.warn(`Invalid date string for doc ${doc.id}: ${timeCreated}`);
            return;
          }
        } else if (timeCreated && typeof timeCreated === 'object' && '_seconds' in timeCreated && '_nanoseconds' in timeCreated) {
          createdDate = new Date(timeCreated._seconds * 1000 + timeCreated._nanoseconds / 1e6);
        } else {
          console.warn(`Unsupported timeCreated format for doc ${doc.id}`);
          return;
        }

        if (createdDate <= sevenDaysAgo) {
          batch.update(doc.ref, { status: "Inactive", processedDate: Timestamp.fromDate(new Date()) });
          updatedCount++;
        }
      });

      if (updatedCount > 0) await batch.commit();
      console.log(`🧾 ${name}: Marked ${updatedCount} slips as Inactive.`);
    }
  } catch (err) {
    console.error("❌ Cron error updating slips:", err);
  }
});
