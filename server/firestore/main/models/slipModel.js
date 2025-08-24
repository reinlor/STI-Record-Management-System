const {admin} = require("../../../firebase");

const getLateSlipsCollection = () => {
  return admin.firestore().collection("lateSlips");
};

const getAbsentSlipsCollection = () => {
  return admin.firestore().collection("absentSlips");
};

const getIDPassCollection = () => {
  return admin.firestore().collection("idPassSlips");
};

const getUniformPassCollection = () => {
  return admin.firestore().collection("uniformPasses");
};

module.exports = {
  getLateSlipsCollection,
  getAbsentSlipsCollection,
  getIDPassCollection,
  getUniformPassCollection,
};
