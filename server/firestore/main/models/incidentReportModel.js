const {admin} = require("../../../firebase");

const getIncidentReportCollection = () => {
  return admin.firestore().collection("incidentReport");
};

module.exports = { getIncidentReportCollection };