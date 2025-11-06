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

  { patterns: [/^surname$/i, /last name/i], path: 'studentProfile.lastName' },
  { patterns: [/^first name$/i], path: 'studentProfile.firstName' },
  { patterns: [/^m\.i\.|middle initial|middle name/i], path: 'studentProfile.middleName' },
  { patterns: [/^nickname$/i], path: 'studentProfile.nickname' },
  { patterns: [/^student no\.?|student number|id no\.?/i], path: 'sid' },
  { patterns: [/^year$/i], path: 'studentProfile.section' },
  { patterns: [/^program$/i, /course/i, /strand/i], path: 'studentProfile.program' },
  { patterns: [/^gender$/i], path: 'studentProfile.gender' },
  { patterns: [/^status$/i], path: 'studentProfile.status' },
  { patterns: [/^religion$/i], path: 'studentProfile.religion' },
  { patterns: [/^birthday$/i, /birthdate/i, /date of birth/i], path: 'studentProfile.birthday' },
  { patterns: [/^nationality$/i], path: 'studentProfile.nationality' },
  { patterns: [/^cellular number$/i, /cellphone/i, /mobile/i], path: 'contactInfo.contactNo' },
  { patterns: [/^email add 1$/i, /email$/i], path: 'contactInfo.email' },
  { patterns: [/^home number$/i, /home phone/i], path: 'contactInfo.homeNo' },
  { patterns: [/^present address$/i], path: 'contactInfo.address.currentAddress' },
  { patterns: [/^permanent address$/i], path: 'contactInfo.address.permanentAddress' },
  { patterns: [/^provincial address$/i], path: 'contactInfo.address.provincialAddress' },
  { patterns: [/^father'?s name$/i], path: 'familyBackground.fatherInfo.name' },
  { patterns: [/^mother'?s name$/i], path: 'familyBackground.motherInfo.name' },
  { patterns: [/^company$/i], path: 'familyBackground.spouse.company' }, // Adjusted to spouse for married students
  { patterns: [/^monthly family income$/i], path: 'familyBackground.monthlyIncome' },
  { patterns: [/^status of parent\/s$/i], path: 'familyBackground.statusOfParent' },
  { patterns: [/^sibling order$/i], path: 'familyBackground.siblings' },
  { patterns: [/^name of spouse$/i], path: 'familyBackground.spouse.name' },
  { patterns: [/^occupation$/i], path: 'familyBackground.spouse.occupation' }, // Adjusted to spouse
  // { patterns: [/^age$/i], path: 'familyBackground.fatherInfo.age' },
  { patterns: [/^contact number:?$/i], path: 'familyBackground.emergency.contactNo' },
  { patterns: [/^in case of emergency, please contact:?$/i], path: 'familyBackground.emergency.name' },
  { patterns: [/^contact number:?$/i, /emergency contact/i], path: 'familyBackground.emergency.contactNo' },

  // New patterns added for better coverage of parent, spouse, and sibling variations
  { patterns: [/^educational attainment$/i, /education/i], path: 'familyBackground.fatherInfo.educationalAttainment' },
  { patterns: [/nationality \/ religion/i, /nationality.*religion/i], path: 'familyBackground.motherInfo.nationalityReligion' },
  { patterns: [/^name$/i, /sibling name/i], path: 'familyBackground.siblings.0.name' },
  { patterns: [/^course \/ occupation$/i, /course.*occupation/i], path: 'familyBackground.siblings.0.courseOccupation' },
  { patterns: [/^school \/ company$/i, /school.*company/i], path: 'familyBackground.siblings.0.schoolCompany' },
  { patterns: [/^age:?$/i], path: 'familyBackground.spouse.age' }, // For spouse age with optional colon
  { patterns: [/^contact number$/i], path: 'familyBackground.spouse.contactNo' }, // Without colon for spouse
  { patterns: [/^contact number:$/i], path: 'familyBackground.emergency.contactNo' }, // With colon for emergency
  { patterns: [/^email add 2$/i], path: 'contactInfo.email2' }, // For secondary email if present
  { patterns: [/academic year/i, /school year/i], path: 'studentProfile.academicYear' },
  { patterns: [/interview date/i, /date of interview/i], path: '_extra.interviewDate' },
  { patterns: [/time started/i], path: '_extra.timeStarted' },
  { patterns: [/time ended/i], path: '_extra.timeEnded' },
];

const mapToStudentSchema = (mergedKV, allLines) => {
  const out = {
    sid: '',
    studentProfile: {},
    contactInfo: { address: {} },
    familyBackground: { 
      fatherInfo: { age: '', nationality: '', religion: '', educationalAttainment: '', occupation: '', company: '' }, 
      motherInfo: { age: '', nationality: '', religion: '', educationalAttainment: '', occupation: '', company: '' }, 
      guardian: {}, 
      emergency: {}, 
      siblings: [], 
      statusOfParent: '', 
      spouse: {} 
    },
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
          // Only set if the value is non-empty to avoid overwriting with blanks
          if (finalVal.trim()) {
            setDeep(out, map.path, finalVal);
          }
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
  const email2 = mergedKV['Email add 2']?.trim() || out.contactInfo.email2;
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
  } else if (yearRaw && !out.studentProfile.section) {
    out.studentProfile.section = yearRaw.replace('-', '.');
  }

  // Status of parents
  const statusOptions = ['Married', 'Divorced', 'Separated', 'Widowed/Widower', 'Remarried', 'Single Parent'];
  for (const opt of statusOptions) {
    if (mergedKV[opt] === 'X') {
      out.familyBackground.statusOfParent = opt;
      break;
    }
  }

  // Spouse working status
  if (mergedKV['Yes'] === 'X') {
    out.familyBackground.spouse.working = true;
  } else if (mergedKV['No'] === 'X') {
    out.familyBackground.spouse.working = false;
  }

  // Parse family from lines
  const familyIdx = allLines.findIndex(l => l.toLowerCase().includes('family background'));
  if (familyIdx !== -1) {
    const familyLines = allLines.slice(familyIdx + 1); // Skip the header line

    // Parse father and mother names
    const fatherNameIdx = familyLines.findIndex(l => l.toLowerCase().includes("father's name"));
    if (fatherNameIdx !== -1) {
      out.familyBackground.fatherInfo.name = toPascalCase(familyLines[fatherNameIdx + 1] || '');
    }

    const motherNameIdx = familyLines.findIndex(l => l.toLowerCase().includes("mother's name"));
    if (motherNameIdx !== -1) {
      out.familyBackground.motherInfo.name = toPascalCase(familyLines[motherNameIdx + 1] || '');
    }

    // // Parse ages
    // const firstAgeIdx = familyLines.findIndex(l => l.toLowerCase().includes('age'));
    // if (firstAgeIdx !== -1) {
    //   out.familyBackground.fatherInfo.age = familyLines[firstAgeIdx + 1] || '';
    // }

    // const secondAgeIdx = familyLines.findIndex((l, i) => i > firstAgeIdx && l.toLowerCase().includes('age'));
    // if (secondAgeIdx !== -1) {
    //   out.familyBackground.motherInfo.age = familyLines[secondAgeIdx + 1] || '';
    // }

    // Parse nationality/religion
    const firstNatIdx = familyLines.findIndex(l => l.toLowerCase().includes('nationality / religion'));
    if (firstNatIdx !== -1) {
      const nrVal = familyLines[firstNatIdx + 1] || '';
      const [nat, rel] = nrVal.split('/').map(s => toPascalCase(s.trim()));
      out.familyBackground.fatherInfo.nationality = nat;
      out.familyBackground.fatherInfo.religion = rel;
    }

    const secondNatIdx = familyLines.findIndex((l, i) => i > firstNatIdx && l.toLowerCase().includes('nationality / religion'));
    if (secondNatIdx !== -1) {
      const nrVal = familyLines[secondNatIdx + 1] || '';
      const [nat, rel] = nrVal.split('/').map(s => toPascalCase(s.trim()));
      out.familyBackground.motherInfo.nationality = nat;
      out.familyBackground.motherInfo.religion = rel;
    }

    // Parse educational attainment
    const firstEdIdx = familyLines.findIndex(l => l.toLowerCase().includes('educational attainment'));
    if (firstEdIdx !== -1) {
      out.familyBackground.fatherInfo.educationalAttainment = toPascalCase(familyLines[firstEdIdx + 1] || '');
    }

    const secondEdIdx = familyLines.findIndex((l, i) => i > firstEdIdx && l.toLowerCase().includes('educational attainment'));
    if (secondEdIdx !== -1) {
      out.familyBackground.motherInfo.educationalAttainment = toPascalCase(familyLines[secondEdIdx + 1] || '');
    }

    // Parse occupation
    const firstOccIdx = familyLines.findIndex(l => l.toLowerCase().includes('occupation'));
    if (firstOccIdx !== -1) {
      out.familyBackground.fatherInfo.occupation = toPascalCase(familyLines[firstOccIdx + 1] || '');
    }

    const secondOccIdx = familyLines.findIndex((l, i) => i > firstOccIdx && l.toLowerCase().includes('occupation'));
    if (secondOccIdx !== -1) {
      out.familyBackground.motherInfo.occupation = toPascalCase(familyLines[secondOccIdx + 1] || '');
    }

    // Parse company
    const firstCompIdx = familyLines.findIndex(l => l.toLowerCase().includes('company'));
    if (firstCompIdx !== -1) {
      out.familyBackground.fatherInfo.company = toPascalCase(familyLines[firstCompIdx + 1] || '');
    }

    const secondCompIdx = familyLines.findIndex((l, i) => i > firstCompIdx && l.toLowerCase().includes('company'));
    if (secondCompIdx !== -1) {
      out.familyBackground.motherInfo.company = toPascalCase(familyLines[secondCompIdx + 1] || '');
    }

    // Siblings - only names
    const siblingIdx = familyLines.findIndex(l => l.toLowerCase().includes('sibling order'));
    if (siblingIdx !== -1) {
      const nameHeaderIdx = familyLines.findIndex((l, i) => i > siblingIdx && l.toLowerCase().includes('name'));
      if (nameHeaderIdx !== -1) {
        let i = nameHeaderIdx + 1;
        while (i < familyLines.length && !familyLines[i].toLowerCase().includes('in case of emergency') && familyLines[i].trim()) {
          const line = familyLines[i].trim();
          if (/^[a-zA-Z\s\.'\-]+$/.test(line) && line.length > 2 && line.includes(' ')) {
            out.familyBackground.siblings.push(toPascalCase(line));
          }
          i++;
        }
      }
    }

    // Emergency contact from lines if not set
    const emergIdx = familyLines.findIndex(l => l.toLowerCase().includes('in case of emergency, please contact'));
    if (emergIdx !== -1 && !out.familyBackground.emergency.name) {
      const emergLine = familyLines[emergIdx];
      const emergName = emergLine.split(':')[1]?.trim() || familyLines[emergIdx + 1]?.trim() || '';
      out.familyBackground.emergency.name = toPascalCase(emergName);
    }

    const contactIdx = familyLines.findIndex((l, i) => i > emergIdx && l.toLowerCase().includes('contact number'));
    if (contactIdx !== -1 && !out.familyBackground.emergency.contactNo) {
      const contactLine = familyLines[contactIdx];
      const emergContact = contactLine.split(':')[1]?.trim() || familyLines[contactIdx + 1]?.trim() || '';
      out.familyBackground.emergency.contactNo = normalizePhone(emergContact);
    }
  }

  // Handle nationality/religion from KV if captured (split for mother or father)
  if (out.familyBackground.motherInfo.nationalityReligion) {
    const [nat, rel] = out.familyBackground.motherInfo.nationalityReligion.split('/').map(s => toPascalCase(s.trim()));
    out.familyBackground.motherInfo.nationality = nat || out.familyBackground.motherInfo.nationality;
    out.familyBackground.motherInfo.religion = rel || out.familyBackground.motherInfo.religion;
    delete out.familyBackground.motherInfo.nationalityReligion;
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