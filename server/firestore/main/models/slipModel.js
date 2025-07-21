const admin = require("../../../firebase");

const getLateSlipsCollection = () => {
  return admin.firestore().collection("lateSlips");
};

const getAbsentSlipsCollection = () => {
  return admin.firestore().collection("absentSlips");
};

const getIDPassCollection = () => {
  return admin.firestore().collection("idPassSlips");
};

module.exports = {
  getLateSlipsCollection,
  getAbsentSlipsCollection,
  getIDPassCollection,
};
