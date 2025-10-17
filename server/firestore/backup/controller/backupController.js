const admin = require("firebase-admin");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const db = admin.firestore();

const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    GOOGLE_DRIVE_FOLDER_ID,
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
    console.log("✅ OAuth tokens loaded from file");
} else {
    console.log("⚠️ No tokens found. Visit /backup/auth to authorize first.");
}

const drive = google.drive({ version: "v3", auth: oauth2Client });

exports.authGoogle = async (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/drive.metadata",
        ],
    });


    console.log("🔗 Generated Google Auth URL:", authUrl);
    res.redirect(authUrl);
};


exports.oauth2callback = async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing authorization code");

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
        console.log("✅ Tokens saved to", TOKEN_PATH);
        res.send("Authorization successful! You can now close this tab.");
    } catch (err) {
        console.error("OAuth callback error:", err);
        res.status(500).send("OAuth error: " + err.message);
    }
};

exports.runBackup = async () => {
    try {
        console.log("🟢 Starting Google Drive backup...");

        const collections = await db.listCollections();
        const backupData = {};

        for (const collection of collections) {
            const snapshot = await collection.get();
            backupData[collection.id] = snapshot.docs.map((doc) => ({
                id: doc.id,
                data: doc.data(),
            }));
        }

        const now = new Date();
        const safeIso = now.toISOString().replace(/[:]/g, "-");
        const fileName = `backup-${safeIso}.json`;
        const tempPath = path.join(TMP_DIR, fileName);

        fs.writeFileSync(tempPath, JSON.stringify(backupData, null, 2), "utf8");

        const fileMetadata = {
            name: fileName,
            parents: GOOGLE_DRIVE_FOLDER_ID ? [GOOGLE_DRIVE_FOLDER_ID] : undefined,
        };
        const media = {
            mimeType: "application/json",
            body: fs.createReadStream(tempPath),
        };

        const uploadRes = await drive.files.create({
            resource: fileMetadata,
            media,
            fields: "id, name, webViewLink",
        });

        fs.unlinkSync(tempPath);

        const existingActive = await db.collection("backups").where("status", "==", "active").get();
        if (!existingActive.empty) {
            const batch = db.batch();
            existingActive.forEach((doc) => batch.update(doc.ref, { status: "expired" }));
            await batch.commit();
        }

        const backupDocRef = db.collection("backups").doc();
        await backupDocRef.set({
            fileId: uploadRes.data.id,
            fileName: uploadRes.data.name,
            driveLink: uploadRes.data.webViewLink,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "active",
        });

        await db.collection("backupLogs").add({
            time: admin.firestore.FieldValue.serverTimestamp(),
            status: "success",
            backupId: backupDocRef.id,
            fileId: uploadRes.data.id,
            fileName: uploadRes.data.name,
        });

        console.log("✅ Backup uploaded to Google Drive:", uploadRes.data.webViewLink);
        return { success: true, fileId: uploadRes.data.id, fileName: uploadRes.data.name };
    } catch (error) {
        console.error("❌ Backup failed:", error);
        await db.collection("backupLogs").add({
            time: admin.firestore.FieldValue.serverTimestamp(),
            status: "failed",
            error: error.message,
        });
        return { success: false, error: error.message };
    }
};

exports.backupData = async (req, res) => {
    try {
        const result = await exports.runBackup();
        if (result.success) res.status(200).json(result);
        else res.status(500).json({ error: result.error });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBackupLogs = async (req, res) => {
    try {
        const snapshot = await db.collection("backupLogs").orderBy("time", "desc").limit(200).get();
        const logs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        res.status(200).json({ logs });
    } catch (err) {
        console.error("getBackupLogs error:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.getBackupSchedule = async (req, res) => {
    try {
        const doc = await db.collection("backupSettings").doc("schedule").get();
        if (!doc.exists) return res.status(200).json({ schedule: "none", nextBackup: null });
        const data = doc.data();
        res.status(200).json({ schedule: data.schedule, nextBackup: data.nextBackup });
    } catch (err) {
        console.error("getBackupSchedule error:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.setBackupSchedule = async (req, res) => {
    try {
        const { schedule } = req.body;
        if (!schedule) return res.status(400).json({ error: "Missing schedule" });
        const now = new Date();
        let nextBackup = null;

        switch (schedule) {
            case "3hours": nextBackup = new Date(now.getTime() + 3 * 60 * 60 * 1000); break;
            case "12hours": nextBackup = new Date(now.getTime() + 12 * 60 * 60 * 1000); break;
            case "daily": nextBackup = new Date(now.getTime() + 24 * 60 * 60 * 1000); break;
            case "weekly": nextBackup = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); break;
            case "none": nextBackup = null; break;
            default: return res.status(400).json({ error: "Invalid schedule" });
        }

        await db.collection("backupSettings").doc("schedule").set(
            { schedule, nextBackup: nextBackup ? nextBackup.toISOString() : null },
            { merge: true }
        );

        res.status(200).json({ message: "Schedule updated", schedule, nextBackup });
    } catch (err) {
        console.error("setBackupSchedule error:", err);
        res.status(500).json({ error: err.message });
    }
};