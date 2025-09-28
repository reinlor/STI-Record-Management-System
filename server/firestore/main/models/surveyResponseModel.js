const admin = require('firebase-admin');
const SURVEY_RESPONSES_COLLECTION = 'surveyResponses';

function getSurveyResponsesCollection() {
    return admin.firestore().collection(SURVEY_RESPONSES_COLLECTION);
}

module.exports = { getSurveyResponsesCollection };