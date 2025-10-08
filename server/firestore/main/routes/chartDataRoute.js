const express = require("express");
const router = express.Router();

const { getChartDataCollection } = require("../models/chartDataModel");

const { getStudentCollection } = require("../models/studentModel");
const { getViolationsCollection } = require("../models/studentCasesModel");
const { getAbsentSlipsCollection } = require("../models/slipModel");
const { getIncidentReportCollection } = require("../models/incidentReportModel");
const { getReferralFormCollection } = require("../models/referralModel");

// Retrieve all chart data
const getAllChartData = async (req, res) => {
  try {
    const snapshot = await getChartDataCollection().get();

    const charts = snapshot.docs.map((chart) => ({
      id: chart.id,
      ...chart.data(),
    }));

    res.status(200).send(charts);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).send({ error: `Failed to retrieve chart data` });
  }
};

// Retrieve chart count data
const getDataCount = async (req, res) => {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const studentSnap = await getStudentCollection().get();
    const studentCount = studentSnap.size;

    const caseSnap = await getViolationsCollection().get();
    const caseCount = caseSnap.size;

    const absentSnap = await getAbsentSlipsCollection().where("status", "==", "Pending").get();
    const incidentSnap = await getIncidentReportCollection().where("status", "==", "Pending").get();
    const pendingSlips = absentSnap.size + incidentSnap.size;

    const parseDateSafe = (value) => {
      if (!value) return null;

      try {
        if (typeof value === "object" && value._seconds) {
          return new Date(value._seconds * 1000);
        }

        if (value.toDate && typeof value.toDate === "function") {
          return value.toDate();
        }

        const cleaned = String(value).replace(/\u202F/g, " ").trim();
        const parsed = new Date(cleaned);
        return isNaN(parsed.getTime()) ? null : parsed;
      } catch {
        return null;
      }
    };

    const todaySlips =
      absentSnap.docs.filter((doc) => {
        const data = doc.data();
        const createdAt = parseDateSafe(data.timeCreated);
        if (!createdAt) return false;
        const createdStr = createdAt.toISOString().split("T")[0];
        return createdStr === todayStr;
      }).length +
      incidentSnap.docs.filter((doc) => {
        const data = doc.data();
        const createdAt = parseDateSafe(data.timeCreated);
        if (!createdAt) return false;
        const createdStr = createdAt.toISOString().split("T")[0];
        return createdStr === todayStr;
      }).length;

    const referralSnap = await getReferralFormCollection().where("status", "==", "Pending").get();
    const pendingForms = referralSnap.size;

    const todayForms = referralSnap.docs.filter((doc) => {
      const data = doc.data();
      if (!data.preparedDate) return false;
      return data.preparedDate === todayStr;
    }).length;

    res.status(200).json({
      students: studentCount,
      cases: caseCount,
      pendingSlips,
      pendingForms,
      today: {
        pendingSlips: todaySlips,
        pendingForms: todayForms,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard counters:", error);
    res.status(500).send({ error: "Failed to fetch dashboard counters" });
  }
};


router.get("/retrieve", getAllChartData);
router.get("/counters", getDataCount);

module.exports = router;
