const { admin } = require("../../../firebase.js");

const getContentManagementCollection = () => {
    return admin.firestore().collection("content");
}

module.exports = { getContentManagementCollection };