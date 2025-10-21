const fs = require('fs');
const { TextractClient, AnalyzeDocumentCommand } = require('@aws-sdk/client-textract');
const { getStudentCollection } = require('../../../firestore/main/models/studentModel');

const REGION = process.env.AWS_REGION || 'us-east-1';
const textractClient = new TextractClient({ region: REGION });

const setDeep = (obj, path, value) => {
  const keys = path.split('.');
  let cur = obj;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) cur[k] = value;
    else {
      if (!cur[k]) cur[k] = {};
      cur = cur[k];
    }
  });
};

// PascalCase para sa mga names
const toPascalCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

// Date normalization (Para tumugma sa intended na date format sa firestore)
const normalizeDate = (raw) => {
  if (!raw) return '';
  let str = raw
    .trim()
    .replace(/(\d)(st|nd|rd|th)/gi, '$1')
    .replace(/[,]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\./g, ' ')
    .trim();

  const monthNames = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ];

  const named =
    str.match(/([A-Za-z]+)\s*(\d{1,2})\s*(\d{2,4})/) ||
    str.match(/(\d{1,2})\s*([A-Za-z]+)\s*(\d{2,4})/);
  if (named) {
    let [_, a, b, c] = named;
    const monthIdxA = monthNames.findIndex(m => a.slice(0, 3).toLowerCase() === m);
    const monthIdxB = monthNames.findIndex(m => b.slice(0, 3).toLowerCase() === m);
    let dd, mm;
    if (monthIdxA >= 0) { mm = monthIdxA + 1; dd = b; }
    else if (monthIdxB >= 0) { mm = monthIdxB + 1; dd = a; }
    const yyyy = c.length === 2 ? `20${c}` : c;
    return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
  }

  const num = str.match(/(\d{1,2})[\/\-\.\s](\d{1,2})[\/\-\.\s](\d{2,4})/);
  if (num) {
    let [_, a, b, c] = num;
    let yyyy = c.length === 2 ? `20${c}` : c;
    let mm = parseInt(a), dd = parseInt(b);
    if (mm > 12 && dd <= 12) [mm, dd] = [dd, mm];
    return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
  }

  const tryDate = new Date(str);
  if (!isNaN(tryDate)) {
    const yyyy = tryDate.getFullYear();
    const mm = String(tryDate.getMonth() + 1).padStart(2, '0');
    const dd = String(tryDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  const yearOnly = str.match(/\b(19|20)\d{2}\b/);
  if (yearOnly) {
    const parsed = `${yearOnly[0]}-01-01`;
    return parsed;
  }

  console.warn('  Unrecognized birthday format:', raw);
  return '';
};

// Roman to integer for year
const romanToInt = (s) => {
  if (!s) return 0;
  s = s.toUpperCase();
  const map = { I: 1, V: 5, X: 10 };
  let num = 0;
  for (let i = 0; i < s.length; i++) {
    if (i < s.length - 1 && map[s[i]] < map[s[i + 1]]) {
      num -= map[s[i]];
    } else {
      num += map[s[i]];
    }
  }
  return num;
};

// Name Splitter (Pascal Case)
const splitNameSmart = (fullNameRaw) => {
  if (!fullNameRaw) return {};
  let name = fullNameRaw.trim().replace(/\s+/g, ' ');

  const formatPart = (val) => toPascalCase(val.replace(/\./g, '').trim());

  if (name.includes(',')) {
    const [last, rest] = name.split(',', 2);
    const parts = rest.trim().split(' ');
    const first = formatPart(parts[0] || '');
    const middle = formatPart(parts.length > 2 ? parts.slice(1, -1).join(' ') : parts[1] || '');
    const suffix = formatPart(parts.length > 1 ? parts.at(-1) : '');
    return {
      firstName: first,
      middleName: middle,
      lastName: formatPart(last),
      suffix
    };
  }

  const parts = name.split(' ');
  let first = '', middle = '', last = '', suffix = '';
  if (parts.length === 2) [first, last] = parts;
  else if (parts.length === 3) [first, middle, last] = parts;
  else if (parts.length >= 4) {
    [first, middle, last, suffix] = [parts[0], parts.slice(1, -2).join(' '), parts.at(-2), parts.at(-1)];
  } else first = name;

  return {
    firstName: formatPart(first),
    middleName: formatPart(middle),
    lastName: formatPart(last),
    suffix: formatPart(suffix)
  };
};

// Phone normalization
const normalizePhone = (raw) => {
  if (!raw) return '';
  let s = String(raw).trim().replace(/[^\d]/g, '');
  if (s.startsWith('63')) s = '0' + s.slice(2);
  if (!s.startsWith('0') && s.length === 10) s = '0' + s;
  if (s.length > 11) s = s.slice(0, 11);
  return s;
};

// Normalize Program + Section
const normalizeProgramAndSection = (sectionValue = '') => {
  if (!sectionValue) return { program: '', section: '' };

  const raw = sectionValue.trim().toUpperCase();
  const programCodes = [
    'BSIT', 'BSCS', 'BSHM', 'BSTM', 'BSBA', 'BSA', 'BSN',
    'ICT', 'STEM', 'ABM', 'HUMSS', 'GAS', 'TVL'
  ];

  const programMatch = programCodes.find(code => raw.startsWith(code) || raw.includes(` ${code} `));
  if (programMatch) {
    const sectionPart = raw.replace(programMatch, '').trim().replace(/^[-–—.]+/, '').trim();
    return { program: programMatch, section: toPascalCase(sectionPart || '') };
  }

  return { program: '', section: toPascalCase(raw) };
};

const buildBlockMap = (blocks) => {
  const map = {};
  blocks.forEach((b) => { if (b.Id) map[b.Id] = b; });
  return map;
};

const getTextForBlock = (block, blockMap) => {
  if (!block || !block.Relationships) return '';
  let text = '';
  for (const rel of block.Relationships) {
    if (rel.Type === 'CHILD') {
      for (const cid of rel.Ids) {
        const child = blockMap[cid];
        if (!child) continue;
        if (child.BlockType === 'WORD' && child.Text) text += (text ? ' ' : '') + child.Text;
        else if (child.BlockType === 'SELECTION_ELEMENT' && child.SelectionStatus === 'SELECTED') text += (text ? ' ' : '') + 'X';
        else if (child.BlockType === 'LINE' && child.Text) text += (text ? ' ' : '') + child.Text;
      }
    }
  }
  return text.trim();
};

const parseKeyValuePairs = (blocks) => {
  const blockMap = buildBlockMap(blocks);
  const keyMap = {}, valueMap = {};
  blocks.forEach((b) => {
    if (b.BlockType === 'KEY_VALUE_SET') {
      if (b.EntityTypes?.includes('KEY')) keyMap[b.Id] = b;
      if (b.EntityTypes?.includes('VALUE')) valueMap[b.Id] = b;
    }
  });
  const kv = {};
  Object.entries(keyMap).forEach(([kid, kblock]) => {
    const keyText = getTextForBlock(kblock, blockMap);
    let valueText = '';
    if (kblock.Relationships) {
      for (const rel of kblock.Relationships) {
        if (rel.Type === 'VALUE') {
          for (const vid of rel.Ids) {
            const vblock = valueMap[vid] || blockMap[vid];
            const vtext = getTextForBlock(vblock, blockMap);
            if (vtext) valueText += (valueText ? ' ' : '') + vtext;
          }
        }
      }
    }
    if (keyText) kv[keyText] = (valueText || '').trim();
  });
  return kv;
};

// Mapping ng mga fields
const FIELD_MAPPINGS = [
  { patterns: [/student\s*id/i, /\bsid\b/i, /id\s*no/i, /student no/i], path: 'sid' },
  { patterns: [/^(?:student\s*)?name\s*[:\-]?\s*$/i, /\bfull\s*name\b/i], path: 'studentProfile.name' },
  { patterns: [/surname/i], path: 'studentProfile.lastName' },
  { patterns: [/first name/i], path: 'studentProfile.firstName' },
  { patterns: [/m\.i\./i], path: 'studentProfile.middleName' },
  { patterns: [/nickname/i, /alias/i], path: 'studentProfile.nickname' },
  { patterns: [/section/i], path: 'studentProfile.section' },
  { patterns: [/academic\s*level|year\s*level/i], path: 'studentProfile.academicLevel' },
  { patterns: [/nationality/i], path: 'studentProfile.nationality' },
  { patterns: [/gender/i], path: 'studentProfile.gender' },
  { patterns: [/status(?! of parent)/i], path: 'studentProfile.status' },
  { patterns: [/birthday|birthdate|date[\s\-_:]*of[\s\-_:]*birth[:.]?|dob/i], path: 'studentProfile.birthday' },
  { patterns: [/religion/i], path: 'studentProfile.religion' },
  { patterns: [/program|course|degree/i], path: 'studentProfile.program' },
  { patterns: [/email/i], path: 'contactInfo.email' },
  { patterns: [/contact\s*no|contact number|mobile|cellular number/i], path: 'contactInfo.contactNo' },
  { patterns: [/present address/i], path: 'contactInfo.address.currentAddress' },
  { patterns: [/permanent address/i], path: 'contactInfo.address.permanentAddress' },
  { patterns: [/provincial address/i], path: 'contactInfo.address.provincialAddress' },
  { patterns: [/name\s*of\s*father/i, /father's name/i], path: 'familyBackground.fatherInfo.name' },
  { patterns: [/name\s*of\s*mother/i, /mother's name/i], path: 'familyBackground.motherInfo.name' },
  { patterns: [/guardian.*name/i, /name of guardian/i], path: 'familyBackground.guardian.name' },
  { patterns: [/contact number of parent\/s or guardian\/s/i], path: 'familyBackground.guardian.contactNo' },
  { patterns: [/in case of emergency, please contact/i], path: 'familyBackground.emergency.name' },
  { patterns: [/contact #/i, /emergency contact/i], path: 'familyBackground.emergency.contactNo' },
];

const mapToStudentSchema = (mergedKV, allLines) => {
  const out = {
    sid: '',
    studentProfile: {},
    contactInfo: { address: {} },
    familyBackground: { fatherInfo: {}, motherInfo: {}, guardian: {}, emergency: {}, siblings: [], statusOfParent: '' },
    _extra: {}
  };

  for (const [rawKey, rawVal] of Object.entries(mergedKV)) {
    const key = rawKey.trim();
    const val = (rawVal || '').trim();
    let matched = false;

    for (const map of FIELD_MAPPINGS) {
      for (const pat of map.patterns) {
        if (pat.test(key)) {
          let finalVal = val;
          if (map.path.endsWith('birthday')) {
            const norm = normalizeDate(val);
            finalVal = norm;
          }
          if (map.path.includes('contactNo')) finalVal = normalizePhone(val);
          setDeep(out, map.path, finalVal);
          matched = true;
          break;
        }
      }
      if (matched) break;
    }
    if (!matched) out._extra[key] = val;
  }

  const joined = allLines.join('\n');
  if (!out.contactInfo.email) {
    const em = joined.match(/([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[A-Za-z]{2,})/);
    if (em) out.contactInfo.email = em[1];
  }

  // Handle multiple emails
  const email1 = mergedKV['Email add 1']?.trim();
  const email2 = mergedKV['Email add 2']?.trim();
  const emails = [];
  if (email1) emails.push(email1);
  if (email2) emails.push(email2);
  if (emails.length > 0) {
    out.contactInfo.email = emails[0];
    if (emails.length > 1) {
      out._extra.emails = emails;
    }
  }

  if (!out.studentProfile.name) {
    const nm = joined.match(/Name[:\s\-]*([A-Z][A-Za-z'\-\. ]{2,80})/i);
    if (nm) out.studentProfile.name = nm[1].trim();
  }

  // Split name only if direct fields are not set
  if (out.studentProfile.name && (!out.studentProfile.firstName || !out.studentProfile.lastName)) {
    Object.assign(out.studentProfile, splitNameSmart(out.studentProfile.name));
  }
  delete out.studentProfile.name; // Not needed in final schema

  out.studentProfile.nickname = toPascalCase(out.studentProfile.nickname);
  out.familyBackground.fatherInfo.name = toPascalCase(out.familyBackground.fatherInfo.name);
  out.familyBackground.motherInfo.name = toPascalCase(out.familyBackground.motherInfo.name);
  out.familyBackground.guardian.name = toPascalCase(out.familyBackground.guardian.name);
  out.familyBackground.emergency.name = toPascalCase(out.familyBackground.emergency.name);

  // Normalize gender
  let gender = out.studentProfile.gender?.toUpperCase() || '';
  if (gender === 'F' || gender === 'FEMALE') out.studentProfile.gender = 'Female';
  else if (gender === 'M' || gender === 'MALE') out.studentProfile.gender = 'Male';

  // program and section
  const secData = normalizeProgramAndSection(out.studentProfile.section || '');
  if (!out.studentProfile.program) out.studentProfile.program = secData.program;
  out.studentProfile.section = secData.section;

  // Section logic with year and semester
  const yearRaw = mergedKV['Year'] || '';
  let yearNum = 0;
  if (/^\d+$/.test(yearRaw)) {
    yearNum = parseInt(yearRaw);
  } else {
    yearNum = romanToInt(yearRaw);
  }
  let sem = 0;
  if (mergedKV['1st'] === 'X') sem = 1;
  else if (mergedKV['2nd'] === 'X') sem = 2;
  if (yearNum > 0 && sem > 0) {
    out.studentProfile.section = `${yearNum}.${sem}`;
  }

  // Status of parents
  const statusOptions = ['Married', 'Divorced', 'Separated', 'Widowed/Widower', 'Remarried', 'Single Parent'];
  for (const opt of statusOptions) {
    if (mergedKV[opt] === 'X') {
      out.familyBackground.statusOfParent = opt;
      break;
    }
  }

  // Parse family from lines
  const familyIdx = allLines.findIndex(l => l.toLowerCase().includes('family background'));
  if (familyIdx !== -1) {
    const familyLines = allLines.slice(familyIdx);
    // Father
    const fatherNameIdx = familyLines.findIndex(l => l.toLowerCase().includes("father's name"));
    if (fatherNameIdx !== -1) {
      const fatherName = familyLines[fatherNameIdx + 1]?.trim();
      if (fatherName) out.familyBackground.fatherInfo.name = toPascalCase(fatherName);
      let nrIdx = fatherNameIdx + 2; // skip age
      while (nrIdx < familyLines.length && !familyLines[nrIdx].toLowerCase().includes('nationality/religion')) nrIdx++;
      if (nrIdx < familyLines.length) {
        const nrVal = familyLines[nrIdx + 1]?.trim() || '';
        const [nat, rel] = nrVal.split('/').map(s => s.trim());
        out.familyBackground.fatherInfo.nationality = toPascalCase(nat);
        out.familyBackground.fatherInfo.religion = toPascalCase(rel);
        let occIdx = nrIdx + 2;
        while (occIdx < familyLines.length && !familyLines[occIdx].toLowerCase().includes('occupation')) occIdx++;
        if (occIdx < familyLines.length) {
          const occVal = familyLines[occIdx + 1]?.trim() || '';
          out.familyBackground.fatherInfo.occupation = toPascalCase(occVal);
        }
      }
    }
    // Mother
    const motherNameIdx = familyLines.findIndex(l => l.toLowerCase().includes("mother's name"));
    if (motherNameIdx !== -1) {
      const motherName = familyLines[motherNameIdx + 1]?.trim();
      if (motherName) out.familyBackground.motherInfo.name = toPascalCase(motherName);
      let nrIdx = motherNameIdx + 2;
      while (nrIdx < familyLines.length && !familyLines[nrIdx].toLowerCase().includes('nationality/religion')) nrIdx++;
      if (nrIdx < familyLines.length) {
        const nrVal = familyLines[nrIdx + 1]?.trim() || '';
        const [nat, rel] = nrVal.split('/').map(s => s.trim());
        out.familyBackground.motherInfo.nationality = toPascalCase(nat);
        out.familyBackground.motherInfo.religion = toPascalCase(rel);
        let occIdx = nrIdx + 2;
        while (occIdx < familyLines.length && !familyLines[occIdx].toLowerCase().includes('occupation')) occIdx++;
        if (occIdx < familyLines.length) {
          const occVal = familyLines[occIdx + 1]?.trim() || '';
          out.familyBackground.motherInfo.occupation = toPascalCase(occVal);
        }
      }
    }
    // Siblings
    const siblingIdx = familyLines.findIndex(l => l.toLowerCase().includes('sibling order'));
    if (siblingIdx !== -1) {
      const nameHeaderIdx = familyLines.findIndex((l, i) => i > siblingIdx && l.toLowerCase().includes('name'));
      if (nameHeaderIdx !== -1) {
        let siblings = [];
        let i = nameHeaderIdx + 1;
        while (i < familyLines.length && !familyLines[i].toLowerCase().includes('in case of emergency') && familyLines[i].trim()) {
          const line = familyLines[i].trim();
          if (/^[a-zA-Z\s\.'\-]+$/.test(line) && line.length > 2) {
            siblings.push(toPascalCase(line));
          }
          i++;
        }
        out.familyBackground.siblings = siblings;
      }
    }
  }

  delete out.studentProfile.age;

  return out;
};

// Upload Controller Function (puro utilities/helper lang nasa taas)
exports.ocrUpload = async (req, res) => {
  try {
    if (!req.files || !req.files.length)
      return res.status(400).json({ error: 'No files uploaded (field name: files)' });

    const mergedKV = {};
    const allLines = [];

    for (const f of req.files) {
      const bytes = fs.readFileSync(f.path);
      const cmd = new AnalyzeDocumentCommand({
        Document: { Bytes: bytes },
        FeatureTypes: ['FORMS'],
      });

      const resp = await textractClient.send(cmd);
      const blocks = resp.Blocks || [];
      const kv = parseKeyValuePairs(blocks);
      Object.assign(mergedKV, kv);
      blocks.forEach(b => { if (b.BlockType === 'LINE' && b.Text) allLines.push(b.Text); });
      try { fs.unlinkSync(f.path); } catch { }
    }

    const parsed = mapToStudentSchema(mergedKV, allLines);

    if (!parsed.sid || parsed.sid.trim() === "") {
      const studentCol = getStudentCollection();
      const snapshot = await studentCol.get();
      const studentRecordCount = snapshot.size + 1;
      parsed.sid = `prd-${String(studentRecordCount).padStart(3, '0')}`;
    }

    if ((!parsed.contactInfo.email || parsed.contactInfo.email.trim() === "") && parsed.sid.startsWith('prd'))
      parsed.contactInfo.email = `${parsed.sid}@dasmarinas.sti.edu.ph`;

    return res.json({ success: true, ocr: parsed, raw: { kv: mergedKV, lines: allLines } });
  } catch (err) {
    console.error('Textract error', err);
    return res.status(500).json({ error: err.message || err.toString() });
  }
};