const { getAssessmentExamCollection } = require("../../main/models/assessmentExamModel");
const { getAssessmentReportCollection } = require("../../main/models/assessmentReportModel");
const { getChartDataCollection } = require("../../main/models/chartDataModel");
const { getReferralFormCollection } = require("../../main/models/referralModel")
const {
  getAbsentSlipsCollection,
  getIDPassCollection,
  getLateSlipsCollection,
  getUniformPassCollection
} = require("../../main/models/slipModel")
const { getViolationsCollection } = require("../../main/models/studentCasesModel")
const { getStudentCollection } = require("../../main/models/studentModel");
const { getUserCollection } = require("../../main/models/userModel");

const exportData = async (req, res) => {
  const obj = req.body

  try {
    const studentsSnap = obj?.studentRecord ? await getStudentCollection().get() : null;
    const usersSnap = obj?.users ? await getUserCollection().get() : null;

    const wellnessSnap = obj?.wellness ? await getAssessmentExamCollection().get() : null;
    const wellnessReportSnap = obj?.wellness ? await getAssessmentReportCollection().get() : null;
    const chartDataSnap = obj?.chartData ? await getChartDataCollection().get() : null;
    const referralSnap = obj?.referralForm ? await getReferralFormCollection().get() : null;
    const absentSlipSnap = obj?.requestSlip ? await getAbsentSlipsCollection().get() : null;
    const idPassSnap = obj?.requestSlip ? await getIDPassCollection().get() : null;
    const lateSlipSnap = obj?.requestSlip ? await getLateSlipsCollection().get() : null;
    const uniformPassSnap = obj?.requestSlip ? await getUniformPassCollection().get() : null;
    const studentCaseSnap = obj?.studentCase ? await getViolationsCollection().get() : null;

    const data = {
      students: studentsSnap ? studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) : null,
      users: usersSnap ? usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) : null,
      absentSlips: absentSlipSnap ? absentSlipSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) : null,
      assessmentExams: wellnessSnap ? wellnessSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) : null,
      assessmentReports: wellnessReportSnap ? wellnessReportSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) : null,
      chartData: chartDataSnap ? chartDataSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) : null,
      idPassSlip: idPassSnap ? idPassSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) : null,
      lateSlip: lateSlipSnap ? lateSlipSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) : null,
      referralForm: referralSnap ? referralSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) : null,
      studentCases: studentCaseSnap ? studentCaseSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) : null,
      uniformPass: uniformPassSnap ? uniformPassSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) : null,
    };

    res.setHeader('Content-Disposition', 'attachment; filename=backup.json');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 2));
  } catch (error) {
    res.status(500).send({ error: "Backup failed", details: error.message });
  }
};

const importData = async (req, res) => {
  try {
    const backup = req.file;
    if (!backup) return res.status(400).send({ error: "No file uploaded" });

    const data = JSON.parse(backup.buffer.toString());
    const promises = [];

    const collectionsToImport = {
      students: getStudentCollection(),
      users: getUserCollection(),
      absentSlips: getAbsentSlipsCollection(),
      assessmentExams: getAssessmentExamCollection(),
      assessmentReports: getAssessmentReportCollection(),
      chartData: getChartDataCollection(),
      idPassSlip: getIDPassCollection(),
      lateSlip: getLateSlipsCollection(),
      referralForm: getReferralFormCollection(),
      studentCases: getViolationsCollection(),
      uniformPass: getUniformPassCollection(),
    };
    for (const [key, collection] of Object.entries(collectionsToImport)) {
      if (data[key] && Array.isArray(data[key])) {
        for (const docData of data[key]) {
          promises.push(collection.doc(docData.id).set(docData));
        }
      }
    }

    await Promise.all(promises);

    res.status(200).send({ message: "Restore successful" });
  } catch (error) {
    res.status(500).send({ error: "Restore failed", details: error.message });
  }
};

module.exports = { exportData, importData };
