const admin = require('firebase-admin');
const { getSurveyResponsesCollection } = require('../models/surveyResponseModel');

const normalizeAnswer = (a) => {
    if (typeof a === 'string') return a;
    if (!a) return '(no answer)';
    if (typeof a === 'object') return a.answer ?? JSON.stringify(a);
    return String(a);
};

// controllers/surveyResponseController.js
const submitSurvey = async (req, res) => {
  try {
    const { surveyName, responses, studentId = null, meta = null } = req.body;

    if (!surveyName) return res.status(400).json({ error: "surveyName is required" });
    if (!Array.isArray(responses) || responses.length === 0)
      return res.status(400).json({ error: "responses (array) is required" });

    if (!studentId) {
      return res.status(400).json({ error: "studentId is required to prevent duplicates" });
    }

    // ✅ Check if student already submitted this survey
    const existing = await getSurveyResponsesCollection()
      .where("surveyName", "==", surveyName)
      .where("studentId", "==", studentId)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(400).json({ error: "You have already completed this survey." });
    }

    // compute totalScore if scores are provided
    const numericScores = responses
      .map((r) => (typeof r.score === "number" ? r.score : null))
      .filter((s) => s !== null);
    const totalScore =
      numericScores.length > 0 ? numericScores.reduce((a, b) => a + b, 0) : null;

    const payload = {
      surveyName,
      responses,
      studentId,
      meta,
      totalScore,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await getSurveyResponsesCollection().add(payload);
    return res.status(201).json({ message: "Submission saved", id: docRef.id });
  } catch (err) {
    console.error("submitSurvey:", err);
    return res.status(500).json({ error: err.message });
  }
};


/**
 * GET /exam/summary/getAll
 * Returns a list of surveys with counts of submissions
 */
const getAllSummaries = async (req, res) => {
    try {
        const snapshot = await getSurveyResponsesCollection().get();
        if (snapshot.empty) return res.status(200).json({ summaries: [] });

        const counts = {};
        snapshot.forEach((doc) => {
            const d = doc.data();
            if (!d || !d.surveyName) return;
            counts[d.surveyName] = (counts[d.surveyName] || 0) + 1;
        });

        const summaries = Object.keys(counts).map((k) => ({ surveyName: k, totalSubmissions: counts[k] }));
        return res.status(200).json({ summaries });
    } catch (err) {
        console.error('getAllSummaries:', err);
        return res.status(500).json({ error: err.message });
    }
};

/**
 * GET /exam/summary/get/:surveyName
 * Returns aggregated statistics for one survey
 */
const getSurveySummary = async (req, res) => {
    try {
        const { surveyName } = req.params;
        if (!surveyName) return res.status(400).json({ error: 'surveyName param is required' });

        const qSnap = await getSurveyResponsesCollection().where('surveyName', '==', surveyName).get();
        if (qSnap.empty) return res.status(200).json({ surveyName, totalSubmissions: 0, questions: [] });

        const stats = {}; // question -> { counts: {option: count}, totalResponses, scoreSum, scoreCount }

        qSnap.forEach((doc) => {
            const d = doc.data();
            const responses = d.responses || [];
            responses.forEach((r) => {
                const question = r.question || '(unknown question)';
                const answer = normalizeAnswer(r.selectedAnswer);
                if (!stats[question]) {
                    stats[question] = { counts: {}, totalResponses: 0, scoreSum: 0, scoreCount: 0 };
                }
                stats[question].counts[answer] = (stats[question].counts[answer] || 0) + 1;
                stats[question].totalResponses += 1;
                if (typeof r.score === 'number') {
                    stats[question].scoreSum += r.score;
                    stats[question].scoreCount += 1;
                }
            });
        });

        // format result
        const questions = Object.keys(stats).map((q) => {
            const s = stats[q];
            const counts = s.counts;
            const total = s.totalResponses;
            const percentages = {};
            Object.keys(counts).forEach((k) => {
                percentages[k] = Math.round((counts[k] / total) * 10000) / 100; // 2 decimals %
            });
            const averageScore = s.scoreCount > 0 ? Math.round((s.scoreSum / s.scoreCount) * 100) / 100 : null;
            return {
                question: q,
                totalResponses: total,
                counts,
                percentages,
                averageScore,
            };
        });

        return res.status(200).json({ surveyName, totalSubmissions: qSnap.size, questions });
    } catch (err) {
        console.error('getSurveySummary:', err);
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    submitSurvey,
    getAllSummaries,
    getSurveySummary,
};
