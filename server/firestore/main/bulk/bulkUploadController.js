// bulkUploadController.js
const ExcelJS = require('exceljs');
const Joi = require('joi');
const { getStudentCollection } = require('../models/studentModel');
const { getUserCollection } = require('../models/userModel')
const { getNotificationCollection } = require('../models/notificationModel')
const admin = require("firebase-admin");

const EXPECTED_SID_LENGTH = 11;

// Expand allowed header map to cover all fields you mentioned in specification
const allowedHeaderMap = {
  'student id': 'sid',
  'sid': 'sid',
  'school email': 'schoolEmail',
  'email': 'schoolEmail',
  'last name': 'lastName',
  'first name': 'firstName',
  'middle name': 'middleName',
  'name suffix': 'nameSuffix',
  'birthdate': 'birthdate',
  'birth date': 'birthdate',
  'date of birth': 'birthdate',
  'birthday': 'birthdate',
  'birth date (dd/mm/yyyy)': 'birthdate',
  'educational level': 'educationalLevel',
  'education level': 'educationalLevel',
  'level': 'educationalLevel',
  'grade & section': 'gradeSection',
  'grade and section': 'gradeSection',
  'section': 'gradeSection',
  'program/strand': 'program',
  'program and strand': 'program',
  'program or strand': 'program',
  'program': 'program',
  'strand': 'program',
  'nationality': 'nationality',
  'gender': 'gender',
  'religion': 'religion',
  'status': 'status',
  'archive student': 'archiveStudent',
  'active student': 'activeStudent',
  'address': 'address',
  'current address': 'currentAddress',
  'permanent address': 'permanentAddress',
  'provincial address': 'provincialAddress',
  'mobile phone no': 'mobilePhoneNo',
  'mobile no': 'mobilePhoneNo',
  'mobile': 'mobilePhoneNo',
  'home no': 'homeNo',
  'home phone': 'homeNo',
  'contact no': 'mobilePhoneNo',
  'contact type': 'contactType',
  'contact no(s)': 'contactNo',
  'contact nos': 'contactNo',
  'father name': 'fatherName',
  'father no': 'fatherNo',
  'mother name': 'motherName',
  'mother no': 'motherNo',
  'guardian name': 'guardianName',
  'guardian relation': 'guardianRelation',
  'guardian no': 'guardianNo',
  'birthdate': 'birthdate',
  'date of birth': 'birthdate',
  'birthday': 'birthdate',
  'emergency contact name': 'emergencyContactName',
  'emergency contact no': 'emergencyContactNo',
};

const requiredHeaders = [
  'student id',
  'school email',
  'last name',
  'first name',
  'educational level',
  'grade and section',
  'program and strand'
];


const normalizeHeader = (raw) => {
  if (!raw) return '';
  return String(raw)
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[&/\\]/g, ' and ')
    .replace(/\s+or\s+/g, ' and ')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};



const cellValueToString = (value) => {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value;
  if (typeof value === 'string') return value.replace(/^"+|"+$/g, '').trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
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

  // Excel sometimes gives SID as float like "12345.0"
  if (/^\d+\.\d+$/.test(s)) {
    s = String(Math.trunc(Number(s)));
  }

  const digitsOnly = s.replace(/\D/g, '');
  if (!digitsOnly) return '';

  // If the digits length is exactly 6 we will prefix with '02000' to satisfy '02000XXXXXX'
  if (digitsOnly.length === 6) {
    return '02000' + digitsOnly;
  }

  // If it's already 11 digits and begins with 02000 keep
  if (digitsOnly.length === EXPECTED_SID_LENGTH) {
    return digitsOnly;
  }

  // fallback: pad to 11
  if (digitsOnly.length < EXPECTED_SID_LENGTH) {
    return digitsOnly.padStart(EXPECTED_SID_LENGTH, '0');
  }

  // if longer than expected, keep digitsOnly (but this probably should be considered invalid by your rules)
  return digitsOnly;
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
    // Excel serial date
    const excelEpoch = new Date(1900, 0, raw - 1);
    const year = excelEpoch.getFullYear();
    const month = String(excelEpoch.getMonth() + 1).padStart(2, '0');
    const day = String(excelEpoch.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (typeof raw === 'string') {
    const str = raw.trim();

    // ✅ detect dd/mm/yyyy or d/m/yyyy
    const ddmmyyyy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (ddmmyyyy) {
      const [, d, m, y] = ddmmyyyy;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    // yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

    // fallback for things like '15-10-03' or month names
    const parts = str.split(/[\/\-]/).map(p => p.trim());
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        // dd-mm-yyyy or mm-dd-yyyy detection
        const [a, b, c] = parts;
        // if first part > 12, it’s definitely day first (dd-mm-yyyy)
        if (parseInt(a) > 12) return `${c}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`;
        // fallback assume month-day-year
        return `${c}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`;
      }
    }

    // fallback: try JS Date
    const d = new Date(str);
    if (!isNaN(d)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return '';
  }
  return '';
};


const capitalizeName = (name) => {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const capitalizeWords = (sentence) => {
  if (!sentence) return '';
  const lower = String(sentence).toLowerCase();
  return lower.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

// Map educational level input to standardized values
const normalizeEducationalLevel = (raw) => {
  if (!raw) return '';
  const r = String(raw).trim().toLowerCase();
  if (['tertiary', 'college', 't'].includes(r)) return 'Tertiary';
  if (['senior high school', 'senior high', 'shs'].includes(r)) return 'Senior High School';
  return ''; // invalid
};

const formatPhoneNumber = (raw) => {
  const num = String(raw || '').replace(/\D/g, '');
  if (num.startsWith('09') && num.length === 11) return '09' + num.slice(2);
  if (num.length === 10 && num.startsWith('9')) return '09' + num.slice(1);
  if (num.length === 11 && num.startsWith('09')) return num;
  return ''; // Invalid format
}

// Joi schema for final student object (enough to validate main shape)
const studentJoiSchema = Joi.object({
  sid: Joi.string().pattern(/^\d+$/).length(EXPECTED_SID_LENGTH).required(),
  isArchived: Joi.boolean().required(),
  studentProfile: Joi.object({
    firstName: Joi.string().allow('').required(),
    lastName: Joi.string().allow('').required(),
    middleName: Joi.string().allow('').required(),
    suffix: Joi.string().allow('').required(),
    academicLevel: Joi.string().valid('Tertiary', 'Senior High School').required(),
    section: Joi.string().allow('').required(),
    program: Joi.string().allow('').required(),
    nationality: Joi.string().allow('').required(),
    gender: Joi.string().allow('').required(),
    religion: Joi.string().allow('').required(),
    status: Joi.string().allow('').required(),
  }).required(),
  contactInfo: Joi.object({
    address: Joi.object({
      currentAddress: Joi.string().allow(''),
      permanentAddress: Joi.string().allow(''),
      provincialAddress: Joi.string().allow(''),
    }).required(),
    contactNo: Joi.string().allow(''),
    homeNo: Joi.string().allow(''),
    email: Joi.string().email().allow(''),
  }).required(),
  familyBackground: Joi.object({
    fatherInfo: Joi.object({
      name: Joi.string().allow(''),
      contactNo: Joi.string().allow(''),
    }).required(),
    motherInfo: Joi.object({
      name: Joi.string().allow(''),
      contactNo: Joi.string().allow(''),
    }).required(),
    guardian: Joi.object({
      name: Joi.string().allow(''),
      relation: Joi.string().allow(''),
      contactNo: Joi.string().allow(''),
    }).required(),
    emergency: Joi.object({
      name: Joi.string().allow(''),
      contactNo: Joi.string().allow(''),
    }).required()
  }).required()
});

const bulkUpload = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.worksheets[0];
    if (!worksheet) return res.status(400).json({ error: "No worksheet found in file" });

    // header row index (same as your original, adjust if different)
    const HEADER_ROW_INDEX = 5;
    const headerRow = worksheet.getRow(HEADER_ROW_INDEX);
    const headerIndexToField = {};
    const seenHeaders = new Set();

    headerRow.eachCell((cell, colNumber) => {
      const raw = cell.value ? cellValueToString(cell.value) : '';
      const normalized = normalizeHeader(raw);

      if (!normalized || normalized.length === 0) return;

      console.log('Header raw:', raw, '→ normalized:', normalized);

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

      const entry = {};
      let hasValue = false;

      Object.keys(headerIndexToField).forEach(col => {
        const field = headerIndexToField[col];
        const cell = row.getCell(Number(col));
        const value = cellValueToString(cell ? cell.value : '');
        if (value) hasValue = true;
        entry[field] = value;
      });

      if (hasValue) rows.push(entry);
    });


    let processed = 0;
    const added = [];
    const updated = [];
    const skipped = [];

    for (const studentRow of rows) {
      try {
        // Basic required checks for row-level required headers (we require those exist)
        const rawSid = studentRow.sid || '';
        const studentId = formatSid(rawSid);

        if (!studentId || !/^\d+$/.test(studentId)) {
          skipped.push(`${rawSid || '(no sid)'} - invalid/missing SID`);
          continue;
        }

        // Educational Level handling
        const eduNormalized = normalizeEducationalLevel(studentRow.educationalLevel);
        if (!eduNormalized) {
          skipped.push(`${studentId} - invalid/missing Educational Level ('${studentRow.educationalLevel || ''}')`);
          continue;
        }

        // Active Student logic: random => treat as 'yes' (active)
        const activeRaw = (studentRow.activeStudent || '').toString().trim().toLowerCase();
        const isActive = activeRaw === 'no' ? false : true; // anything other than explicit 'no' => active
        // Archive Student column: Yes -> archived
        const archiveRaw = (studentRow.archiveStudent || '').toString().trim().toLowerCase();
        const archiveFlag = archiveRaw === 'yes' ? true : (archiveRaw === 'no' ? false : null);

        // final isArchived: if either indicates archived, set true; if Archive column explicitly provided, use that; 
        // if active is false -> archived true
        let isArchived = false;
        if (archiveFlag !== null) {
          isArchived = archiveFlag;
        }
        if (!isActive) isArchived = true;

        // Names
        const lastName = capitalizeName(studentRow.lastName || '');
        const firstName = capitalizeName(studentRow.firstName || '');
        const middleName = capitalizeName(studentRow.middleName || '');
        const nameSuffix = (studentRow.nameSuffix || '').toString().trim();

        // Format display name for users collection: "Last, First Middle Suffix"
        const nameParts = [firstName, middleName].filter(Boolean).join(' ');
        const displayName = `${lastName}${nameParts ? ', ' + nameParts : ''}${nameSuffix ? ' ' + nameSuffix : ''}`.trim();

        // Section (grade & section)
        const section = (studentRow.gradeSection || '').toString().trim();

        // Program
        const program = (studentRow.program || '').toString().trim();

        // Contact info
        const schoolEmailFromRow = (studentRow.schoolEmail || '').toString().trim();
        // If no email provided in row, we still fallback to a generated email (but schoolEmail is required by header enforcement)
        let emailCandidate = schoolEmailFromRow;
        if (!emailCandidate) {
          // fallback: lastname + . + last6sid
          const tail = studentId.slice(-6);
          emailCandidate = lastName ? `${lastName.replace(/\s/g, '').toLowerCase()}.${tail}@dasmarinas.sti.edu.ph` : `${studentId}@dasmarinas.sti.edu.ph`;
        }

        // Addresses & contacts
        const currentAddress = capitalizeWords(studentRow.currentAddress || studentRow.address || '');
        const permanentAddress = capitalizeWords(studentRow.permanentAddress || '');
        const provincialAddress = capitalizeWords(studentRow.provincialAddress || '');
        const mobileNo = formatPhoneNumber(studentRow.mobilePhoneNo || studentRow.contactNo || '');
        const homeNo = formatPhoneNumber(studentRow.homeNo || '');

        // Emergency contact
        const emergencyName = capitalizeName(studentRow.emergencyContactName || '');
        const emergencyNo = formatPhoneNumber(studentRow.emergencyContactNo || '');

        // Family
        const fatherName = capitalizeName(studentRow.fatherName || '');
        const fatherContact = formatPhoneNumber(studentRow.fatherNo || '');
        const motherName = capitalizeName(studentRow.motherName || '');
        const motherContact = formatPhoneNumber(studentRow.motherNo || '');
        const guardianName = capitalizeName(studentRow.guardianName || '');
        const guardianRelation = (studentRow.guardianRelation || '').toString().trim();
        const guardianContact = formatPhoneNumber(studentRow.guardianNo || '');

        // Status/religion/nationality/gender fields
        const status = (studentRow.status || '').toString().trim();
        const religion = (studentRow.religion || '').toString().trim();
        const nationality = (studentRow.nationality || '').toString().trim();
        const gender = (studentRow.gender || '').toString().trim();

        // Birthdate if present
        const birthdate = studentRow.birthdate ? formatBirthdate(studentRow.birthdate) : '';

        // Build canonical student object to validate with Joi
        const studentObj = {
          sid: studentId,
          isArchived: Boolean(isArchived),
          studentProfile: {
            firstName: firstName,
            lastName: lastName,
            middleName: middleName,
            suffix: nameSuffix,
            academicLevel: eduNormalized,
            section: section,
            program: program,
            nationality: nationality,
            gender: gender,
            religion: religion,
            status: status,
          },
          contactInfo: {
            address: {
              currentAddress: currentAddress,
              permanentAddress: permanentAddress,
              provincialAddress: provincialAddress,
            },
            contactNo: mobileNo,
            homeNo: homeNo,
            email: emailCandidate,
          },
          familyBackground: {
            fatherInfo: { name: fatherName, contactNo: fatherContact },
            motherInfo: { name: motherName, contactNo: motherContact },
            guardian: { name: guardianName, relation: guardianRelation, contactNo: guardianContact },
            emergency: { name: emergencyName, contactNo: emergencyNo }
          }
        };

        // Validate against Joi; if fails, skip this row
        const { error } = studentJoiSchema.validate(studentObj);
        if (error) {
          skipped.push(`${studentId} - validation failed: ${error.message}`);
          continue;
        }

        const docRef = getStudentCollection().doc(studentId);
        const existingSnap = await docRef.get();
        const existingData = existingSnap.exists ? existingSnap.data() : null;

        // If existing record has different email -> keep existing (ignore incoming)
        let finalEmail = studentObj.contactInfo.email;
        if (existingData && existingData.contactInfo && existingData.contactInfo.email) {
          finalEmail = existingData.contactInfo.email;
        }

        // newDoc (used if creating)
        const newDoc = {
          sid: studentId,
          isArchived: studentObj.isArchived,
          studentProfile: {
            firstName: studentObj.studentProfile.firstName,
            lastName: studentObj.studentProfile.lastName,
            middleName: studentObj.studentProfile.middleName,
            suffix: studentObj.studentProfile.suffix,
            academicLevel: studentObj.studentProfile.academicLevel,
            section: studentObj.studentProfile.section,
            program: studentObj.studentProfile.program,
            nationality: studentObj.studentProfile.nationality,
            gender: studentObj.studentProfile.gender,
            religion: studentObj.studentProfile.religion,
            status: studentObj.studentProfile.status,
            birthday: birthdate || ''
          },
          contactInfo: {
            email: finalEmail,
            address: {
              currentAddress: studentObj.contactInfo.address.currentAddress,
              permanentAddress: studentObj.contactInfo.address.permanentAddress,
              provincialAddress: studentObj.contactInfo.address.provincialAddress,
            },
            contactNo: studentObj.contactInfo.contactNo,
            homeNo: studentObj.contactInfo.homeNo,
          },
          familyBackground: {
            fatherInfo: { name: studentObj.familyBackground.fatherInfo.name, contactNo: studentObj.familyBackground.fatherInfo.contactNo },
            motherInfo: { name: studentObj.familyBackground.motherInfo.name, contactNo: studentObj.familyBackground.motherInfo.contactNo },
            guardian: { name: studentObj.familyBackground.guardian.name, relation: studentObj.familyBackground.guardian.relation, contactNo: studentObj.familyBackground.guardian.contactNo },
            emergency: { name: emergencyName, contactNo: emergencyNo }
          }
        };

        // Build updateData only for provided fields (so we don't overwrite other keys)
        const updateData = {};
        const pushIfPresent = (keyPath, value) => {
          if (value !== undefined && value !== null && String(value).trim() !== '') {
            updateData[keyPath] = value;
          }
        };

        // Only set name parts if provided in row
        pushIfPresent('studentProfile.firstName', newDoc.studentProfile.firstName);
        pushIfPresent('studentProfile.lastName', newDoc.studentProfile.lastName);
        pushIfPresent('studentProfile.middleName', newDoc.studentProfile.middleName);
        pushIfPresent('studentProfile.suffix', newDoc.studentProfile.suffix);
        pushIfPresent('studentProfile.academicLevel', newDoc.studentProfile.academicLevel);
        pushIfPresent('studentProfile.section', newDoc.studentProfile.section);
        pushIfPresent('studentProfile.program', newDoc.studentProfile.program);
        pushIfPresent('studentProfile.nationality', newDoc.studentProfile.nationality);
        pushIfPresent('studentProfile.gender', newDoc.studentProfile.gender);
        pushIfPresent('studentProfile.religion', newDoc.studentProfile.religion);
        pushIfPresent('studentProfile.status', newDoc.studentProfile.status);
        pushIfPresent('studentProfile.birthday', newDoc.studentProfile.birthday);

        pushIfPresent('contactInfo.address.currentAddress', newDoc.contactInfo.address.currentAddress);
        pushIfPresent('contactInfo.address.permanentAddress', newDoc.contactInfo.address.permanentAddress);
        pushIfPresent('contactInfo.address.provincialAddress', newDoc.contactInfo.address.provincialAddress);

        // contact numbers
        pushIfPresent('contactInfo.contactNo', newDoc.contactInfo.contactNo);
        pushIfPresent('contactInfo.homeNo', newDoc.contactInfo.homeNo);

        // email: only update if there was no existing email (we already enforced that finalEmail = existingEmail if exists)
        if (!existingData || !(existingData.contactInfo && existingData.contactInfo.email)) {
          pushIfPresent('contactInfo.email', newDoc.contactInfo.email);
        }

        // Emergency
        pushIfPresent('familyBackground.emergency.name', newDoc.familyBackground.emergency.name);
        pushIfPresent('familyBackground.emergency.contactNo', newDoc.familyBackground.emergency.contactNo);

        // family
        pushIfPresent('familyBackground.fatherInfo.name', newDoc.familyBackground.fatherInfo.name);
        pushIfPresent('familyBackground.fatherInfo.contactNo', newDoc.familyBackground.fatherInfo.contactNo);
        pushIfPresent('familyBackground.motherInfo.name', newDoc.familyBackground.motherInfo.name);
        pushIfPresent('familyBackground.motherInfo.contactNo', newDoc.familyBackground.motherInfo.contactNo);
        pushIfPresent('familyBackground.guardian.name', newDoc.familyBackground.guardian.name);
        pushIfPresent('familyBackground.guardian.relation', newDoc.familyBackground.guardian.relation);
        pushIfPresent('familyBackground.guardian.contactNo', newDoc.familyBackground.guardian.contactNo);

        // isArchived field (only update if provided in row or active change)
        pushIfPresent('isArchived', Boolean(newDoc.isArchived));

        // Firebase user ensuring function
        const ensureFirebaseUser = async (wasExistingStudent) => {
          // Check if a firebase auth user exists by UID
          let firebaseUserExists = false;
          try {
            await admin.auth().getUser(studentId);
            firebaseUserExists = true;
          } catch (e) {
            if (e.code === 'auth/user-not-found') firebaseUserExists = false;
            else throw e;
          }

          if (firebaseUserExists) {
            // If a user exists in auth, update only allowed fields.
            // IMPORTANT: Do not update email if existingData has an email (we must keep existing)
            const userUpdate = {};
            if (displayName) userUpdate.displayName = displayName;
            if (!existingData || !(existingData.contactInfo && existingData.contactInfo.email)) {
              // Only update email if Firestore had no email (unlikely because School Email required)
              if (finalEmail) userUpdate.email = finalEmail;
            }
            // disabled based on active/isArchived
            if (typeof isActive === 'boolean') {
              userUpdate.disabled = !isActive;
            }

            if (Object.keys(userUpdate).length > 0) {
              await admin.auth().updateUser(studentId, userUpdate);
            }

            // Update users collection (merge)
            const userDoc = {
              uid: studentId,
              displayName: displayName || '',
              role: "Student",
            };
            // Keep existing email on user doc if it exists
            if (!existingData || !(existingData.contactInfo && existingData.contactInfo.email)) {
              userDoc.email = finalEmail || '';
            }
            await getUserCollection().doc(studentId).set(userDoc, { merge: true });

          } else {
            // create new auth user
            const createDisabled = !isActive;
            await admin.auth().createUser({
              uid: studentId,
              email: finalEmail || `${studentId}@dasmarinas.sti.edu.ph`,
              password: "student1234",
              displayName: displayName || '',
              disabled: createDisabled,
            });

            // create user doc
            await getUserCollection().doc(studentId).set({
              uid: studentId,
              displayName: displayName || '',
              email: finalEmail || '',
              role: "Student",
              isFirstLogin: true
            }, { merge: true });
          }
        };

        // Save to Firestore: create vs update
        // Compare only the fields that would be updated
        let hasChanges = false;
        if (existingData) {
          // Compare each field in updateData with existingData
          for (const keyPath in updateData) {
            // Support nested keys like 'studentProfile.firstName'
            const keys = keyPath.split('.');
            let existingValue = existingData;
            for (const k of keys) {
              if (existingValue && typeof existingValue === 'object') {
                existingValue = existingValue[k];
              } else {
                existingValue = undefined;
                break;
              }
            }
            if (existingValue !== updateData[keyPath]) {
              hasChanges = true;
              break;
            }
          }
        }

        if (existingSnap.exists) {
          if (hasChanges) {
            await docRef.update(updateData);
            await ensureFirebaseUser(true);
            updated.push(`${studentId} - ${displayName || ''}`);
          } else {
            // No changes, flag as skipped
            skipped.push(`${studentId} - no changes`);
          }
        } else {
          await docRef.set(newDoc);
          await ensureFirebaseUser(false);
          added.push(`${studentId} - ${displayName || ''}`);
        }

        processed++;
      } catch (rowErr) {
        console.error(`Error processing row with sid=${studentRow.sid}:`, rowErr);
        skipped.push(`${studentRow.sid || '(no sid)'} - error: ${rowErr.message || rowErr.toString()}`);
      }
    }

    // Notification
    const notifCollection = getNotificationCollection();
    const adminDoc = notifCollection.doc('records');
    const adminDocData = await adminDoc.get();

    let existingAdminNotification = [];
    if (adminDocData.exists && adminDocData.data()['data']) {
      existingAdminNotification = adminDocData.data()['data'];
    }

    const newAdminNotification = {
      date: new Date(),
      from: 'Admin',
      notifID: `adminRecord-${existingAdminNotification.length + 1}`,
      type: 'Creation',
      subject: `Admin has uploaded an excel, initiating bulk upload updates!`
    }

    const updatedAdminNotifications = [...existingAdminNotification, newAdminNotification]
    const updateAdminPayload = {
      data: updatedAdminNotifications
    }

    await adminDoc.set(updateAdminPayload, { merge: true });

    return res.json({
      message: "Bulk upload processed",
      totalRows: rows.length,
      processed,
      added,
      updated,
      skipped
    });
  } catch (err) {
    console.error("Bulk upload error:", err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
};

module.exports = { bulkUpload };
