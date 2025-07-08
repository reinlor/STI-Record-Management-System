const admin = require("../firebase");

const getReferralFormCollection = () => {
  return admin.firestore().collection("referralForm");
};

module.exports = { getReferralFormCollection };
