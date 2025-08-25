const {admin} = require("../../../firebase");

const getViolationsCollection = () => {
  return admin.firestore().collection("studentCases");
};

module.exports = { getViolationsCollection };
