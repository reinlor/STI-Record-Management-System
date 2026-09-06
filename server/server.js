require("dotenv").config();

const cron = require("node-cron");
const { admin } = require("./firebase");
const app = require("./index");
const { withFirestoreRetry } = require("./middleware/firestore");

const port = Number(process.env.PORT) || 5000;
const host = process.env.HOST || "0.0.0.0";

const server = app.listen(port, host, () => {
  console.log(`Server listening on ${host}:${port}`);
});

function scheduleNextBackup(schedule, now) {
  const next = new Date(now);
  if (schedule === "3hours") next.setHours(next.getHours() + 3);
  else if (schedule === "12hours") next.setHours(next.getHours() + 12);
  else if (schedule === "daily") next.setDate(next.getDate() + 1);
  else if (schedule === "weekly") next.setDate(next.getDate() + 7);
  else return null;
  return next;
}

cron.schedule("* * * * *", async () => {
  try {
    const scheduleSnapshot = await withFirestoreRetry((db) =>
      db.collection("backupSettings").doc("schedule").get()
    );
    if (!scheduleSnapshot.exists) return;

    const { schedule, nextBackup } = scheduleSnapshot.data() || {};
    const now = new Date();
    if (!schedule || schedule === "none" || (nextBackup && now < new Date(nextBackup))) return;

    const { runBackup } = require("./firestore/backup/controller/backupController");
    const result = await runBackup();
    if (!result.success) return console.error("Scheduled backup failed:", result.error);

    const next = scheduleNextBackup(schedule, now);
    if (next) {
      await withFirestoreRetry((db) =>
        db.collection("backupSettings").doc("schedule").update({ nextBackup: next.toISOString() })
      );
    }
  } catch (error) {
    console.error("Scheduled backup error:", error.message);
  }
});

cron.schedule("0 0 * * *", async () => {
  try {
    const { Timestamp } = admin.firestore;
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    await withFirestoreRetry(async (db) => {
      for (const collectionName of ["absentSlips", "incidentReport"]) {
        const snapshot = await db.collection(collectionName)
          .where("status", "==", "Pending")
          .get();
        const batch = db.batch();
        let updatedCount = 0;

        snapshot.forEach((document) => {
          const value = document.data().timeCreated;
          const createdAt = value?.toDate?.() || new Date(value?._seconds * 1000 || value);
          if (!Number.isNaN(createdAt.getTime()) && createdAt <= cutoff) {
            batch.update(document.ref, {
              status: "Inactive",
              processedDate: Timestamp.fromDate(new Date()),
            });
            updatedCount += 1;
          }
        });

        if (updatedCount) await batch.commit();
      }
    });
  } catch (error) {
    console.error("Pending slip cleanup error:", error.message);
  }
});

function shutdown(signal) {
  console.log(`${signal} received; closing server.`);
  server.close(() => process.exit(0));
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  shutdown("uncaughtException");
});

module.exports = server;
