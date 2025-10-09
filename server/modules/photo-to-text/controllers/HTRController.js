const fs = require('fs');
const { TextractClient, AnalyzeDocumentCommand } = require('@aws-sdk/client-textract');
const { getStudentCollection } = require('../../../firestore/main/models/studentModel')

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

const normalizeDate = (raw) => {
  if (!raw) return '';
  raw = raw.trim().replace(/(\d)(st|nd|rd|th)/g, '$1');
  // try JS parse
  const t = Date.parse(raw);
  if (!isNaN(t)) {
    const d = new Date(t);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${mm}/${dd}/${d.getFullYear()}`;
  }
  // fallback regex mm/dd/yyyy or dd/mm/yyyy
  const m = raw.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    let [_, a, b, c] = m;
    if (c.length === 2) c = '20' + c;
    const mm = parseInt(a), dd = parseInt(b);
    // heuristic: if month > 12 then swap
    if (mm > 12 && dd <= 12) return `${String(dd).padStart(2, '0')}/${String(mm).padStart(2, '0')}/${c}`;
    return `${String(mm).padStart(2, '0')}/${String(dd).padStart(2, '0')}/${c}`;
  }
  return raw;
};

const normalizePhone = (raw) => {
  if (!raw) return '';
  let s = String(raw).trim().replace(/[^\d]/g, '');

  // remove country code and convert to local 09 format
  if (s.startsWith('63')) {
    s = '0' + s.slice(2);
  }

  if (!s.startsWith('0') && s.length === 10) {
    s = '0' + s;
  }

  // keep only first 11 digits
  if (s.length > 11) s = s.slice(0, 11);

  return s;
};

// Textract parsing helpers
const buildBlockMap = (blocks) => {
  const map = {};
  blocks.forEach((b) => {
    if (b.Id) map[b.Id] = b;
  });
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
        if (child.BlockType === 'WORD' && child.Text) {
          text += (text ? ' ' : '') + child.Text;
        } else if (child.BlockType === 'SELECTION_ELEMENT') {
          if (child.SelectionStatus === 'SELECTED') text += (text ? ' ' : '') + 'X';
        } else if (child.BlockType === 'LINE' && child.Text) {
          text += (text ? ' ' : '') + child.Text;
        }
      }
    }
  }
  return text.trim();
};

const parseKeyValuePairs = (blocks) => {
  const blockMap = buildBlockMap(blocks);
  const keyMap = {};
  const valueMap = {};
  blocks.forEach((b) => {
    if (b.BlockType === 'KEY_VALUE_SET') {
      if (b.EntityTypes && b.EntityTypes.includes('KEY')) keyMap[b.Id] = b;
      if (b.EntityTypes && b.EntityTypes.includes('VALUE')) valueMap[b.Id] = b;
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

// mapping of common key names to schema paths
const FIELD_MAPPINGS = [
  { patterns: [/student\s*id/i, /\bsid\b/i, /id\s*no/i], path: 'sid' },
  { patterns: [/^(?:student\s*)?name\s*[:\-]?\s*$/i, /\bfull\s*name\b/i], path: 'studentProfile.name' },

  { patterns: [/nickname/i, /alias/i], path: 'studentProfile.nickname' },
  { patterns: [/section/i], path: 'studentProfile.section' },
  { patterns: [/academic\s*level|year\s*level|year\s*level/i], path: 'studentProfile.academicLevel' },
  { patterns: [/age\b/i], path: 'studentProfile.age' },
  { patterns: [/nationality/i], path: 'studentProfile.nationality' },
  { patterns: [/gender/i], path: 'studentProfile.gender' },
  { patterns: [/status(?! of parent)/i], path: 'studentProfile.status' },
  { patterns: [/birth(place)?|birthplace|place of birth/i], path: 'studentProfile.birthPlace' },
  { patterns: [/birthday|birthdate|date of birth|dob/i], path: 'studentProfile.birthday' },
  { patterns: [/religion/i], path: 'studentProfile.religion' },
  { patterns: [/program|section|course|degree/i], path: 'studentProfile.program' },

  { patterns: [/email/i], path: 'contactInfo.email' },
  { patterns: [/contact\s*no|contactno|contact number|mobile no|mobile/i], path: 'contactInfo.contactNo' },
  { patterns: [/home\s*no|home phone|homephone/i], path: 'contactInfo.homeNo' },
  { patterns: [/work\s*no|work phone|workphone/i], path: 'contactInfo.workNo' },
  { patterns: [/permanent\s*address/i], path: 'contactInfo.address.permanentAddress' },
  { patterns: [/current\s*address/i], path: 'contactInfo.address.currentAddress' },
  { patterns: [/provincial\s*address/i], path: 'contactInfo.address.provincialAddress' },
  { patterns: [/address/i], path: 'contactInfo.address.currentAddress' },

  // Family Background
  { patterns: [/name\s*of\s*father/i, /\bfather'?s\s*name\b/i, /\bfather\b/i], path: 'familyBackground.fatherInfo.name' },
  { patterns: [/name\s*of\s*mother/i, /\bmother'?s\s*name\b/i, /\bmother\b/i], path: 'familyBackground.motherInfo.name' },
  { patterns: [/guardian.*name/i, /\bguardian\b/i], path: 'familyBackground.guardian.name' },

  { patterns: [/emergency contact|emergency.*phone|emergency.*contact/i], path: 'familyBackground.emergency.contactNo' },
];

const mapToStudentSchema = (mergedKV, allLines) => {
  const out = {
    sid: '',
    studentProfile: {},
    contactInfo: { address: {} },
    familyBackground: { fatherInfo: {}, motherInfo: {}, guardian: {}, emergency: {} },
    educationalBackground: {},
    workExperience: {},
    interests: {},
    health: {},
    lifeCircumstances: {},
    _extra: {},
  };

  // map key-value pairs
  for (const [rawKey, rawVal] of Object.entries(mergedKV)) {
    const key = rawKey.trim();
    const val = (rawVal || '').trim();
    let matched = false;

    for (const map of FIELD_MAPPINGS) {
      for (const pat of map.patterns) {
        if (pat.test(key)) {
          let finalVal = val;

          if (map.path.endsWith('birthday')) finalVal = normalizeDate(val);
          if (map.path.includes('contactNo') || map.path.includes('mobile') || map.path.includes('phone')) finalVal = normalizePhone(val);
          if (map.path.endsWith('.age')) finalVal = parseInt(val) || val;

          setDeep(out, map.path, finalVal);
          matched = true;
          break;
        }
      }
      if (matched) break;
    }

    if (!matched) out._extra[key] = val;
  }

  // fallback regex search through lines if essential fields missing
  const joined = allLines.join('\n');

  if (!out.contactInfo.email) {
    const em = joined.match(/([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[A-Za-z]{2,})/);
    if (em) out.contactInfo.email = em[1];
  }

  if (!out.contactInfo.contactNo) {
    const ph = joined.match(/(09\d{9})/);
    if (ph) out.contactInfo.contactNo = normalizePhone(ph[1]);
  }

  if (!out.studentProfile.birthday) {
    const d = joined.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
    if (d) out.studentProfile.birthday = normalizeDate(d[1]);
  }

  if (!out.studentProfile.name) {
    const nm = joined.match(/Name[:\s\-]*([A-Z][A-Za-z'\-\. ]{2,80})/i);
    if (nm) out.studentProfile.name = nm[1].trim();
  }

  out.sid = out.sid || (out._extra['student id'] || '');
  return out;
};



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
      blocks.forEach((b) => {
        if (b.BlockType === 'LINE' && b.Text) allLines.push(b.Text);
      });

      try { fs.unlinkSync(f.path); } catch (e) { }
    }

    const parsed = mapToStudentSchema(mergedKV, allLines);

    // 🔹 Generate SID if empty
    if (!parsed.sid || parsed.sid.trim() === "") {
      const studentCol = getStudentCollection();
      const snapshot = await studentCol.get();
      const studentRecordCount = snapshot.size + 1;
      parsed.sid = `prd-${String(studentRecordCount).padStart(3, '0')}`;
    }

    // 🔹 Generate STI email if SID starts with prd and email missing
    if ((!parsed.contactInfo.email || parsed.contactInfo.email.trim() === "") && parsed.sid.startsWith('prd')) {
      parsed.contactInfo.email = `${parsed.sid}@dasmarinas.sti.edu.ph`;
    }

    return res.json({ success: true, ocr: parsed, raw: { kv: mergedKV, lines: allLines } });
  } catch (err) {
    console.error('Textract error', err);
    return res.status(500).json({ error: err.message || err.toString() });
  }
};

