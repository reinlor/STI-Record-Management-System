const {admin} = require("../../../firebase");

const getCounselingsCollection = () => {
  return admin.firestore().collection("counselings");
};

module.exports = { getCounselingsCollection };
