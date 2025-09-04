const {admin} = require("../../../firebase");

const getAssessmentVersionCollection = () => {
  return admin.firestore().collection("assessmentVersionHistory");
};

module.exports = { getAssessmentVersionCollection };