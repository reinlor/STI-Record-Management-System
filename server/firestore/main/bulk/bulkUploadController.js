const ExcelJS = require('exceljs');
const { getStudentCollection } = require('../models/studentModel');

const bulkUpload = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.worksheets[0];

    const headerRow = worksheet.getRow(1);
    const keys = [];
    headerRow.eachCell((cell) => {
      keys.push(cell.value);
    });

    const rows = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return
      const rowData = {};
      keys.forEach((key, idx) => {
        rowData[key] = row.getCell(idx + 1).value;
      });
      rows.push(rowData);
    });

    for (const student of rows) {
      if (student.sid) {
        const studentId = String(student.sid);

        await getStudentCollection().doc(studentId).set(student);
      } else {
        console.warn("Skipping a student record due to missing 'sid':", student);
      }
    }

    res.json({ message: "Bulk upload successful", count: rows.length });
  } catch (err) {
    console.error("Bulk upload error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { bulkUpload };