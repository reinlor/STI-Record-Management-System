const admin = require("../../../firebase");

const getStudentCollection = () => {
  return admin.firestore().collection("students");
};

module.exports = { getStudentCollection };
