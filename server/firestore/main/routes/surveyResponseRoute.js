const express = require("express");
const router = express.Router();
const controller = require("../controller/surveyResponseController");
const { getSurveyResponsesCollection } = require("../models/surveyResponseModel"); // <-- add this

router.post("/submit", controller.submitSurvey);
router.get("/summary/getAll", controller.getAllSummaries);
router.get("/summary/get/:surveyName", controller.getSurveySummary);

// ✅ Check if a student has already answered
router.get("/check/:surveyName/:studentId", async (req, res) => {
  const { surveyName, studentId } = req.params;
  try {
    const snapshot = await getSurveyResponsesCollection()
      .where("surveyName", "==", surveyName)
      .where("studentId", "==", studentId)
      .limit(1)
      .get();

    return res.json({ hasAnswered: !snapshot.empty });
  } catch (err) {
    console.error("check survey error:", err);
    return res.status(500).json({ error: "Failed to check survey status" });
  }
});

module.exports = router;

