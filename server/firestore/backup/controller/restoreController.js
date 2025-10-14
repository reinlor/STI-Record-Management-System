const admin = require("firebase-admin");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const db = admin.firestore();

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} = process.env;

const TOKEN_PATH = path.join(__dirname, "tokens.json");
const TMP_DIR = path.join(__dirname, "../../../tmp");

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

if (fs.existsSync(TOKEN_PATH)) {
  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
  oauth2Client.setCredentials(tokens);
  console.log("✅ OAuth tokens loaded for restore");
} else {
  console.log("⚠️ No tokens found. Visit /backup/auth to authorize first.");
}

const drive = google.drive({ version: "v3", auth: oauth2Client });

async function downloadDriveFileToPath(fileId, destPath) {
  const dest = fs.createWriteStream(destPath);
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );

  return new Promise((resolve, reject) => {
    res.data
      .on("end", () => resolve(destPath))
      .on("error", (err) => reject(err))
      .pipe(dest);
  });
}

exports.restoreBackup = async (req, res) => {
  try {
    console.log("🟡 Starting Firestore restore from Google Drive...");

    const latestSnap = await db
      .collection("backups")
      .where("status", "==", "active")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (latestSnap.empty) {
      return res.status(404).json({ error: "No active backup found." });
    }

    const latestDoc = latestSnap.docs[0];
    const { fileId, fileName } = latestDoc.data();

    if (!fileId) {
      return res.status(400).json({ error: "Backup fileId missing in record." });
    }

    const tempFilePath = path.join(TMP_DIR, `restore-${fileName}`);
    console.log("⬇️ Downloading file:", fileName);

    await downloadDriveFileToPath(fileId, tempFilePath);

    const content = fs.readFileSync(tempFilePath, "utf8");
    let backupData;
    try {
      backupData = JSON.parse(content);
    } catch (err) {
      fs.unlinkSync(tempFilePath);
      throw new Error("Invalid JSON backup file: " + err.message);
    }

    const BATCH_LIMIT = 500;
    let batch = db.batch();
    let opCount = 0;
    const commitPromises = [];

    for (const [collectionName, docs] of Object.entries(backupData)) {
      const collectionRef = db.collection(collectionName);

      for (const doc of docs) {
        const docRef = collectionRef.doc(doc.id);
        batch.set(docRef, doc.data);
        opCount++;

        if (opCount >= BATCH_LIMIT) {
          commitPromises.push(batch.commit());
          batch = db.batch();
          opCount = 0;
        }
      }
    }

    if (opCount > 0) commitPromises.push(batch.commit());
    await Promise.all(commitPromises);

    fs.unlinkSync(tempFilePath);

    await db.collection("backupLogs").add({
      time: admin.firestore.FieldValue.serverTimestamp(),
      status: "restored",
      backupId: latestDoc.id,
      fileId,
      fileName,
    });

    console.log("✅ Firestore restore completed successfully!");
    res.status(200).json({
      message: "Restore completed successfully.",
      backupId: latestDoc.id,
      fileName,
    });
  } catch (err) {
    console.error("❌ Restore failed:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAvailableBackups = async (req, res) => {
  try {
    const snapshot = await db.collection("backups").orderBy("createdAt", "desc").get();
    const backups = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.status(200).json({ backups });
  } catch (err) {
    console.error("getAvailableBackups error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getBackupData = async (req, res) => {
  try {
    const { backupId } = req.params;
    const doc = await db.collection("backups").doc(backupId).get();
    if (!doc.exists) return res.status(404).json({ error: "Backup not found" });
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("getBackupData error:", err);
    res.status(500).json({ error: err.message });
  }
};
