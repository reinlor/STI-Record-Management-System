const {admin} = require("../../../firebase");

const getViolationsCollection = () => {
  return admin.firestore().collection("violations");
};

module.exports = { getViolationsCollection };
