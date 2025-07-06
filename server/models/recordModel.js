const admin = require("../firebase");

const getRecordCollection = () => {
  return admin.firestore().collection("records");
};

module.exports = { getRecordCollection };
