const {admin} = require("../../../firebase");

const getAbsentSlipsCollection = () => {
  return admin.firestore().collection("absentSlips");
};

module.exports = {
  getAbsentSlipsCollection,
};
