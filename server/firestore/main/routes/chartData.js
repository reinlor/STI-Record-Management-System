const express = require("express");
const router = express.Router();
const getStudentCollection = require("../models/StudentCollection");
const getStudentCaseCollection = require("../models/StudentCaseCollection");
const getRequestSlipCollection = require("../models/RequestSlipCollection");
const getReferralFormCollection = require("../models/ReferralFormCollection");

router.get("/counters", async (req, res) => {
    try {
        const studentSnap = await getStudentCollection().where("isArchived", "==", false).get();
        const caseSnap = await getStudentCaseCollection().get();
        const slipSnap = await getRequestSlipCollection().where("status", "==", "Pending").get();
        const formSnap = await getReferralFormCollection().where("status", "==", "Pending").get();

        // --- Student Demographics ---
        let shsCount = 0;
        let tertiaryCount = 0;
        studentSnap.docs.forEach(doc => {
            const academicLevel = doc.data()?.studentProfile?.academicLevel;
            if (academicLevel === 'SHS') {
                shsCount++;
            } else if (academicLevel === 'Tertiary') {
                tertiaryCount++;
            }
        });

        // Count on-going cases
        const onGoingCases = caseSnap.docs.filter(doc => doc.data().status === 'On-going').length;

        // Today's pending slips
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todaySlipsSnap = await getRequestSlipCollection()
            .where("status", "==", "Pending")
            .where("timeCreated", ">=", todayStart)
            .where("timeCreated", "<=", todayEnd)
            .get();

        const todayFormsSnap = await getReferralFormCollection()
            .where("status", "==", "Pending")
            .where("createdAt", ">=", todayStart)
            .where("createdAt", "<=", todayEnd)
            .get();

        res.json({
            students: studentSnap.size,
            shsCount,
            tertiaryCount,
            cases: caseSnap.size,
            pendingSlips: slipSnap.size,
            pendingForms: formSnap.size,
            onGoingCases: onGoingCases,
            today: {
                pendingSlips: todaySlipsSnap.size,
                pendingForms: todayFormsSnap.size,
            },
        });
    } catch (error) {
        console.error("Error fetching counters:", error);
        res.status(500).send("Error fetching counters");
    }
});

module.exports = router;