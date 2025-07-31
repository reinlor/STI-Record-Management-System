const {admin} = require("../../../firebase");

const getUserCollection = () => {
  return admin.firestore().collection("users");
};

module.exports = { getUserCollection };
