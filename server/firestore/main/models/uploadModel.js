const admin = require("../../../firebase");

const getUploadCollection = () => {
  return admin.firestore().collection("uploads");
};

module.exports = { getUploadCollection };