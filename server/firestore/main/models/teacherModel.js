const admin = require("../../../firebase");

const getTeacherCollection = () => {
  return admin.firestore().collection("teachers");
};

module.exports = { getTeacherCollection };
