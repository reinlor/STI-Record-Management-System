const { admin } = require("../../../firebase");

const getChartDataCollection = () => {
    return admin.firestore().collection("chartData");
};

module.exports = { getChartDataCollection };
