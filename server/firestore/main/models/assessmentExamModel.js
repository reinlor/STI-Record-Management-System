const {admin} = require("../../../firebase");

const getAssessmentExamCollection = () => {
  return admin.firestore().collection("assessmentExams");
};

module.exports = { getAssessmentExamCollection };