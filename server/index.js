
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");
require("dotenv").config();

const authMiddleware = require("./authentication");
const securityHeaders = require("./securityHeader");
const requestSanitizer = require("./middleware/requestSanitizer");
const errorHandler = require("./middleware/errorHandler");
const { requireGuidanceRole } = require("./middleware/rbac");

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
const emailRoute = require("./modules/email/emailRoute");
const chartDataRoute = require("./firestore/main/routes/chartDataRoute");
const contentManagementRoute = require("./firestore/main/routes/contentManagementRoute");
const incidentReportRoute = require("./firestore/main/routes/incidentReportRoute");
const notificationRoute = require("./firestore/main/routes/notificationRoute");
const surveyResponsesRoute = require("./firestore/main/routes/surveyResponseRoute");
const configRoutes = require("./firestore/main/routes/firebaseClientConfigRoute");
const geminiApi = require('./modules/gemini-api-controller/apiController');
const userController = require("./firestore/main/controller/userController")

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: "no-referrer" },
}));
app.use(securityHeaders);
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false, limit: "2mb" }));
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
});
app.use(requestSanitizer);

const allowedOrigins = new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://sti-gorms.online",
    'https://sti-record-management-system.vercel.app',
    process.env.CLIENT_URL
].filter(Boolean));

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    const error = new Error("Origin is not allowed by CORS");
    error.status = 403;
    return callback(error);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));


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

function deferredRoute(loader) {
  let routePromise;
  return async (req, res, next) => {
    try {
      routePromise ||= Promise.resolve().then(loader);
      const route = await routePromise;
      return route(req, res, next);
    } catch (error) {
      return next(error);
    }
  };
}

// 🚏 Route Mounting

// Public routes (no auth)
safeUseRoute("/firebase", publicLimiter, configRoutes);

// Authenticated routes
app.use("/user", authLimiter, userRoute);
app.use("/reset-password", apiLimiter, userController.resetPassword)
app.use("/student", apiLimiter, authMiddleware, studentRoute);
app.use("/cases", apiLimiter, authMiddleware, studentCaseRoute);
app.use("/slip", apiLimiter, authMiddleware, slipRoute);
app.use("/email", apiLimiter, emailRoute);
app.use("/photo-to-text", apiLimiter, authMiddleware,
  deferredRoute(() => require("./modules/photo-to-text/routes/HTRRoute")));
app.use("/referral", apiLimiter, authMiddleware, referralRouter);
app.use('/api/gemini', apiLimiter, authMiddleware, geminiApi);

// Wellness-related routes
safeUseRoute("/exam", authMiddleware, apiLimiter, assessmentExam);
safeUseRoute("/exam-response", authMiddleware, apiLimiter, surveyResponsesRoute);
safeUseRoute("/report", authMiddleware, apiLimiter, assessmentReport);
safeUseRoute("/wellnessVersion", authMiddleware, apiLimiter, assessmentVersionHistory);
safeUseRoute("/summary", authMiddleware, apiLimiter, surveyResponsesRoute);

// Data & content
safeUseRoute("/content", authMiddleware, requireGuidanceRole, apiLimiter, contentManagementRoute);
safeUseRoute("/chartData", authMiddleware, requireGuidanceRole, apiLimiter, chartDataRoute);
safeUseRoute("/notifications", authMiddleware, requireGuidanceRole, apiLimiter, notificationRoute);
safeUseRoute("/incidentReport", authMiddleware, requireGuidanceRole, apiLimiter, incidentReportRoute);

// File management and misc
safeUseRoute("/upload", authMiddleware, apiLimiter, uploadRoute);
safeUseRoute("/teacher", authMiddleware, apiLimiter, teacherRoute);
safeUseRoute("/counseling", authMiddleware, apiLimiter, counselingRoute);
safeUseRoute("/bulk-upload", authMiddleware, requireGuidanceRole, apiLimiter,
  deferredRoute(() => require("./firestore/main/bulk/bulkUploadRoute")));
safeUseRoute("/batch-update", authMiddleware, requireGuidanceRole, apiLimiter,
  deferredRoute(() => require("./firestore/main/batch/batchUpdateRoute")));

// Reports, summaries, backups
safeUseRoute("/generate", authMiddleware, apiLimiter,
  deferredRoute(() => require("./modules/summary-generation/SummaryRoute")));
safeUseRoute("/backup", authMiddleware, requireGuidanceRole, apiLimiter,
  deferredRoute(() => require("./firestore/backup/routes/backupRoute")));
safeUseRoute("/api/backup", authMiddleware, requireGuidanceRole, apiLimiter,
  deferredRoute(() => require("./firestore/backup/routes/backupRoute")));
safeUseRoute("/api/restore", authMiddleware, requireGuidanceRole, apiLimiter,
  deferredRoute(() => require("./firestore/backup/routes/restoreRoutes")));
safeUseRoute("/restore", authMiddleware, requireGuidanceRole, apiLimiter,
  deferredRoute(() => require("./firestore/backup/routes/restoreRoutes")));

// Global fallback limiter
app.use(globalLimiter);

app.use((req, res) => res.status(404).json({
  error: "Route not found",
  status: 404,
  requestId: req.requestId,
}));
app.use(errorHandler);

module.exports = app;
