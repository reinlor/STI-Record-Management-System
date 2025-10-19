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

  console.warn('⚠️ Unrecognized birthday format:', raw);
  return '';
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
  { patterns: [/student\s*id/i, /\bsid\b/i, /id\s*no/i], path: 'sid' },
  { patterns: [/^(?:student\s*)?name\s*[:\-]?\s*$/i, /\bfull\s*name\b/i], path: 'studentProfile.name' },
  { patterns: [/nickname/i, /alias/i], path: 'studentProfile.nickname' },
  { patterns: [/section/i], path: 'studentProfile.section' },
  { patterns: [/academic\s*level|year\s*level/i], path: 'studentProfile.academicLevel' },
  { patterns: [/nationality/i], path: 'studentProfile.nationality' },
  { patterns: [/gender/i], path: 'studentProfile.gender' },
  { patterns: [/status(?! of parent)/i], path: 'studentProfile.status' },
  { patterns: [/\bbirth\s*place\b|\bplace\s*of\s*birth\b/i], path: 'studentProfile.birthPlace' },
  { patterns: [/birthday|birthdate|date[\s\-_:]*of[\s\-_:]*birth[:.]?|dob/i], path: 'studentProfile.birthday' },
  { patterns: [/religion/i], path: 'studentProfile.religion' },
  { patterns: [/program|course|degree/i], path: 'studentProfile.program' },
  { patterns: [/email/i], path: 'contactInfo.email' },
  { patterns: [/contact\s*no|contact number|mobile/i], path: 'contactInfo.contactNo' },
  { patterns: [/address/i], path: 'contactInfo.address.currentAddress' },
  { patterns: [/name\s*of\s*father/i], path: 'familyBackground.fatherInfo.name' },
  { patterns: [/name\s*of\s*mother/i], path: 'familyBackground.motherInfo.name' },
  { patterns: [/guardian.*name/i], path: 'familyBackground.guardian.name' },
  { patterns: [/emergency contact/i], path: 'familyBackground.emergency.contactNo' },
];

const mapToStudentSchema = (mergedKV, allLines) => {
  const out = {
    sid: '',
    studentProfile: {},
    contactInfo: { address: {} },
    familyBackground: { fatherInfo: {}, motherInfo: {}, guardian: {}, emergency: {} },
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

  if (!out.studentProfile.name) {
    const nm = joined.match(/Name[:\s\-]*([A-Z][A-Za-z'\-\. ]{2,80})/i);
    if (nm) out.studentProfile.name = nm[1].trim();
  }

  // PascalCase
  if (out.studentProfile.name)
    Object.assign(out.studentProfile, splitNameSmart(out.studentProfile.name));
  out.studentProfile.nickname = toPascalCase(out.studentProfile.nickname);
  out.familyBackground.fatherInfo.name = toPascalCase(out.familyBackground.fatherInfo.name);
  out.familyBackground.motherInfo.name = toPascalCase(out.familyBackground.motherInfo.name);
  out.familyBackground.guardian.name = toPascalCase(out.familyBackground.guardian.name);

  // program and section
  const secData = normalizeProgramAndSection(out.studentProfile.section || '');
  if (!out.studentProfile.program) out.studentProfile.program = secData.program;
  out.studentProfile.section = secData.section;

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
