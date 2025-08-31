const express = require("express");
const router = express.Router();
const { getChartDataCollection } = require("../models/chartDataModel");


const getAllChartData = async (req, res) => {
  const snapshot = await getChartDataCollection().get();

  try {
    const charts = snapshot.docs.map((chart) => ({
      id: chart.id,
      ...chart.data(),
    }));

    res.status(200).send(charts);
  } catch (error) {
    res
      .status(404)
      .send({ error: `Failed to retrieve all chart data` });
  }
};

router.get("/retrieve", getAllChartData);
module.exports = router;
