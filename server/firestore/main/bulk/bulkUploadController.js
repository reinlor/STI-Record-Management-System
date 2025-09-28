const ExcelJS = require('exceljs');
const { getStudentCollection } = require('../models/studentModel');
const { getUserCollection } = require('../models/userModel')
const admin = require("firebase-admin");

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
  'level': 'level',
  'status': 'status',
  'contact type': 'contactType',
  'contact no': 'contactNo',
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
      if (student.sid) rows.push(student);
    });

    let processed = 0;
    const added = [];
    const updated = [];
    const skipped = [];

    const gradeLevel = (grade) => {
      if (!grade) return '';
      const collegeYears = ['1y1', '1y2', '2y2', '3y1', '3y2', '4y1', '4y2'];
      const level = grade.toLowerCase();
      if (!collegeYears.includes(level)) {
        return grade;
      } else {
        return level.replaceAll('y', '.');
      }
    };

    const setAcademicLevel = (programRaw) => {
      const program = (programRaw || '').toLowerCase();
      const availablePrograms = ['bsit', 'bscs', 'bsba', 'bsais', 'bsa', 'bshm', 'bacomm', 'bmma', 'bstm'];
      return availablePrograms.includes(program) ? "Tertiary" : "Senior High School";
    };

    function capitalizeWords(sentence) {
      if (!sentence) return '';
      const lowerSentence = sentence.toLowerCase();
      const words = lowerSentence.split(' ');
      const capitalizedWords = words.map(word => {
        if (word.length === 0) return '';
        return word.charAt(0).toUpperCase() + word.slice(1);
      });
      return capitalizedWords.join(' ');
    }

    for (const student of rows) {
      try {
        const rawSid = student.sid || '';
        const studentId = formatSid(rawSid);
        if (!studentId || !/^\d+$/.test(studentId)) {
          skipped.push(`${rawSid || '(no sid)'} - invalid/missing SID`);
          continue;
        }

        const docRef = getStudentCollection().doc(studentId);
        const existingSnap = await docRef.get();
        const existingData = existingSnap.exists ? existingSnap.data() : null;

        const lastName = capitalizeName(student.lastName || '');
        const firstName = capitalizeName(student.firstName || '');
        const middleName = capitalizeName(student.middleName || '');
        let formattedName = '';
        if (lastName || firstName || middleName) {
          if (!lastName) formattedName = `${firstName}${middleName ? ' ' + middleName : ''}`.trim();
          else if (!firstName && !middleName) formattedName = lastName;
          else formattedName = `${lastName}, ${[firstName, middleName].filter(Boolean).join(' ')}`.trim();
        } else if (existingData && existingData.studentProfile && existingData.studentProfile.name) {
          formattedName = existingData.studentProfile.name;
        }

        const birthdate = student.birthdate ? formatBirthdate(student.birthdate) : undefined;

        const statusRaw = (student.status || '').toString().trim().toLowerCase();
        const hasStatus = statusRaw !== '';
        const disabledForCreateOrUpdate = hasStatus ? (statusRaw === 'inactive') : null;

        const email = (lastName
          ? `${lastName.replaceAll(' ', '').toLowerCase()}.${studentId.slice(5)}@dasmarinas.sti.edu.ph`
          : (existingData && existingData.contactInfo && existingData.contactInfo.email) || `${studentId}@dasmarinas.sti.edu.ph`
        );

        let mobile = '';
        let fatherContact = '';
        let motherContact = '';
        if (typeof student.contactType === 'string' && typeof student.contactNo === 'string') {
          const contactTypes = student.contactType.split(/,\s*/);
          const contactNumbers = student.contactNo.split(/,\s*/);
          const contactMap = {};
          for (let i = 0; i < contactTypes.length; i++) {
            const type = (contactTypes[i] || '').toLowerCase();
            const number = contactNumbers[i] || '';
            contactMap[type] = number;
          }
          mobile = contactMap.mobile || '';
          fatherContact = contactMap.father || '';
          motherContact = contactMap.mother || '';
        }

        // new doc for creation
        const newDoc = {
          sid: studentId,
          isArchived: hasStatus ? (statusRaw !== 'active') : false,
          studentProfile: {
            name: formattedName || '',
            program: student.program || '',
            gender: student.gender || '',
            birthday: birthdate || '',
            section: student.level ? gradeLevel(student.level) : '',
            academicLevel: setAcademicLevel(student.program || ''),
          },
          contactInfo: {
            email: email,
            address: {
              currentAddress: capitalizeWords(student.address) || '',
            },
            contactNo: mobile || '',
          },
          familyBackground: {
            fatherInfo: { contactNo: fatherContact || '' },
            motherInfo: { contactNo: motherContact || '' },
          }
        };

        // For existing documents
        const updateData = {};
        let hadAnyChange = false;

        if (lastName || firstName || middleName) {
          updateData['studentProfile.name'] = formattedName;
          hadAnyChange = true;
        }
        if (student.program) {
          updateData['studentProfile.program'] = student.program;
          updateData['studentProfile.academicLevel'] = setAcademicLevel(student.program);
          hadAnyChange = true;
        }
        if (student.gender) {
          updateData['studentProfile.gender'] = student.gender;
          hadAnyChange = true;
        }
        if (birthdate) {
          updateData['studentProfile.birthday'] = birthdate;
          hadAnyChange = true;
        }
        if (student.level) {
          updateData['studentProfile.section'] = gradeLevel(student.level);
          hadAnyChange = true;
        }
        if (student.address) {
          updateData['contactInfo.address.currentAddress'] = capitalizeWords(student.address);
          hadAnyChange = true;
        }
        if (mobile) {
          updateData['contactInfo.contactNo'] = mobile;
          hadAnyChange = true;
        }
        if (lastName) { 
          updateData['contactInfo.email'] = email;
          hadAnyChange = true;
        }
        if (fatherContact) {
          updateData['familyBackground.fatherInfo.contactNo'] = fatherContact;
          hadAnyChange = true;
        }
        if (motherContact) {
          updateData['familyBackground.motherInfo.contactNo'] = motherContact;
          hadAnyChange = true;
        }
        if (hasStatus) {
          updateData['isArchived'] = (statusRaw !== 'active');
          hadAnyChange = true;
        }

        const ensureFirebaseUser = async () => {
          let firebaseUserExists = false;
          try {
            await admin.auth().getUser(studentId);
            firebaseUserExists = true;
          } catch (e) {
            if (e.code === 'auth/user-not-found' || e.code === 'auth/user-not-found') {
              firebaseUserExists = false;
            } else {
              throw e;
            }
          }

          if (firebaseUserExists) {
            const userUpdate = {};
            if (formattedName) userUpdate.displayName = formattedName;
            if (lastName) userUpdate.email = email;
            if (hasStatus && disabledForCreateOrUpdate !== null) userUpdate.disabled = disabledForCreateOrUpdate;
            if (Object.keys(userUpdate).length > 0) {
              await admin.auth().updateUser(studentId, userUpdate);
            }
            await getUserCollection().doc(studentId).set({
              uid: studentId,
              displayName: formattedName || (existingData && existingData.studentProfile && existingData.studentProfile.name) || '',
              email: email,
              role: "Student",
            }, { merge: true });
          } else {
            const createDisabled = disabledForCreateOrUpdate === true;
            await admin.auth().createUser({
              uid: studentId,
              email,
              password: "student1234",
              displayName: formattedName || '',
              disabled: createDisabled,
            });
            await getUserCollection().doc(studentId).set({
              uid: studentId,
              displayName: formattedName || '',
              email,
              role: "Student",
              isFirstLogin: true
            }, { merge: true });
          }
        };

        if (existingSnap.exists) {
          if (Object.keys(updateData).length > 0) {
            await docRef.update(updateData);
          }
          if (hasStatus) {
            await ensureFirebaseUser();
            updated.push(`${studentId} - ${formattedName || (existingData && existingData.studentProfile && existingData.studentProfile.name) || ''}`);
          } else if (Object.keys(updateData).length > 0) {
            // there were other field updates
            updated.push(`${studentId} - ${formattedName || (existingData && existingData.studentProfile && existingData.studentProfile.name) || ''}`);
          } else {
          }
        } else {
          await docRef.set(newDoc);
          await ensureFirebaseUser();
          added.push(`${studentId} - ${formattedName || ''}`);
        }

        processed++;
      } catch (rowErr) {
        console.error(`Error processing row with sid=${student.sid}:`, rowErr);
        skipped.push(`${student.sid || '(no sid)'} - error: ${rowErr.message || rowErr.toString()}`);
      }
    }

    res.json({
      message: "Bulk upload processed",
      totalRows: rows.length,
      processed,
      added,
      updated,
      skipped
    });
  } catch (err) {
    console.error("Bulk upload error:", err);
    res.status(500).json({ error: err.message });
  }
};



module.exports = { bulkUpload };
