const ExcelJS = require('exceljs');
const { getStudentCollection } = require('../models/studentModel');

const allowedHeaderMap = {
  'student id': 'sid',
  'sid': 'sid',
  'last name': 'lastName',
  'first name': 'firstName',
  'middle name': 'middleName',
  'address': 'address',
  'gender': 'gender',
  'program': 'program',
  'birthdate': 'birthdate',
  'birthday': 'birthdate',
  'date of birth': 'birthdate',
};

const requiredHeaders = ['student id', 'last name', 'first name'];

const EXPECTED_SID_LENGTH = 11;

const normalizeHeader = (raw) => {
  if (raw === null || raw === undefined) return '';
  return String(raw).trim().toLowerCase();
};

const cellValueToString = (value) => {
  if (value === null || value === undefined) return '';

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string') {
    return value.replace(/^"+|"+$/g, '').trim();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) return value.map(v => cellValueToString(v)).join(' ');
    if (value.richText) return value.richText.map(rt => rt.text).join('');
    if (value.text) return String(value.text).trim();
    if (value.result) return String(value.result).trim();

    return '';
  }

  return String(value).trim();
};

const formatSid = (rawSid) => {
  if (rawSid === null || rawSid === undefined) return '';
  let s = String(rawSid).trim();

  if (/^\d+\.\d+$/.test(s)) {
    s = String(Math.trunc(Number(s)));
  }

  const digitsOnly = s.replace(/\D/g, '');
  if (!digitsOnly) return s;

  if (/^\d+$/.test(digitsOnly)) {
    if (digitsOnly.length >= EXPECTED_SID_LENGTH) return digitsOnly;
    return digitsOnly.padStart(EXPECTED_SID_LENGTH, '0');
  }

  return s;
};

const formatBirthdate = (raw) => {
  if (!raw) return '';

  if (raw instanceof Date) {
    const year = raw.getFullYear();
    const month = String(raw.getMonth() + 1).padStart(2, '0');
    const day = String(raw.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  if (typeof raw === 'number') {
    const excelEpoch = new Date(1900, 0, raw - 1); 
    const year = excelEpoch.getFullYear();
    const month = String(excelEpoch.getMonth() + 1).padStart(2, '0');
    const day = String(excelEpoch.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  if (typeof raw === 'string') {
    const str = raw.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }

    const parts = str.split(/[\/\-]/).map(p => p.trim());
    if (parts.length === 3) {
      let [a, b, c] = parts;

      if (a.length === 4) {
        // yyyy-mm-dd
        return `${a}-${b.padStart(2, '0')}-${c.padStart(2, '0')}`;
      }
      if (c.length === 4) {
        return `${c}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`;
      }
    }

    const d = new Date(str);
    if (!isNaN(d)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return str;
  }

  return String(raw);
};


const capitalizeName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const bulkUpload = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.worksheets[0];
    if (!worksheet) return res.status(400).json({ error: "No worksheet found in file" });

    const HEADER_ROW_INDEX = 5;
    const headerRow = worksheet.getRow(HEADER_ROW_INDEX);
    const headerIndexToField = {};
    const seenHeaders = new Set();

    headerRow.eachCell((cell, colNumber) => {
      const normalized = normalizeHeader(cell.value);
      if (allowedHeaderMap[normalized]) {
        headerIndexToField[colNumber] = allowedHeaderMap[normalized];
        seenHeaders.add(normalized);
      }
    });

    const missing = requiredHeaders.filter(h => !seenHeaders.has(h));
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required columns: ${missing.join(', ')}` });
    }

    const rows = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber <= HEADER_ROW_INDEX) return;

      const student = {};
      Object.keys(headerIndexToField).forEach(col => {
        const field = headerIndexToField[col];
        const cell = row.getCell(Number(col));
        student[field] = cellValueToString(cell ? cell.value : '');
      });

      if (!student.sid) return;
      rows.push(student);
    });

    const validRows = rows.filter(r => {
      const sid = formatSid(r.sid || '');
      return sid && /^\d+$/.test(sid);
    });

    let processed = 0;
    let skipped = 0;

    for (const student of rows) {
      const rawSid = student.sid || '';
      const studentId = formatSid(rawSid);

      if (!studentId) {
        console.warn("Skipping student due to missing ID:", student);
        continue;
      }

      const docRef = getStudentCollection().doc(studentId);
      const existingDoc = await docRef.get();

      if (existingDoc.exists) {
        skipped++;
        console.log(`Skipping existing student with SID: ${studentId}`);
        continue;
      }

      const lastName = capitalizeName(student.lastName || '');
      const firstName = capitalizeName(student.firstName || '');
      const middleName = capitalizeName(student.middleName || '');

      const formattedName = (() => {
        if (!lastName && !firstName && !middleName) return '';
        if (!lastName) return `${firstName}${middleName ? ' ' + middleName : ''}`.trim();
        if (!firstName && !middleName) return lastName;
        return `${lastName}, ${[firstName, middleName].filter(Boolean).join(' ')}`.trim();
      })();

      const birthdate = formatBirthdate(student.birthdate);
      const email = `${lastName.replaceAll(' ', '').toLowerCase()}.${studentId.slice(5)}@dasmarinas.sti.edu.ph`

      const doc = {
        sid: studentId,
        isArchived: false,
        studentProfile: {
          name: formattedName,
          program: student.program || '',
          gender: student.gender || '',
          birthday: birthdate || '',
        },
        contactInfo: {
          email: email,
          currentAddress: student.address || '',
        },
      };

      await docRef.set(doc);
      processed++;
    }

    res.json({ message: "Bulk upload processed", totalRows: validRows.length, processed, skipped });
  } catch (err) {
    console.error("Bulk upload error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { bulkUpload };
