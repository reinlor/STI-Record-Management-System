const {admin} = require("../../../firebase");

const getAssessmentReportCollection = () => {
  return admin.firestore().collection("assessmentReports");
};

module.exports = { getAssessmentReportCollection };