const {admin} = require("../../../firebase");

const getNotificationCollection = () => {
  return admin.firestore().collection("notification");
};

module.exports = { getNotificationCollection };
