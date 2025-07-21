const admin = require("../../../firebase");

const getAssessmentReportCollection = () => {
  return admin.firestore().collection("assessmentReport");
};

module.exports = { getAssessmentReportCollection };