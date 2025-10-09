import sys
import json
import re
from typing import Dict, Optional
from datetime import datetime
from PIL import Image
import os

# Try to import pytesseract and handle missing dependency with JSON error output
try:
    import pytesseract
except Exception as e:
    sys.stdout.write(json.dumps({"error": "pytesseract import failed", "detail": str(e)}))
    sys.exit(1)

# Optionally set tesseract_cmd from env var or hardcoded path (only after import)
TESSERACT_PATH = os.getenv("TESSERACT_CMD") or r"C:\Program Files\Tesseract-OCR\tesseract.exe"
if os.path.exists(TESSERACT_PATH):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

def _normalize_to_mmddyyyy(raw: str) -> Optional[str]:
    if not raw:
        return None
    raw = raw.strip()
    raw_clean = re.sub(r"(\d)(st|nd|rd|th)\b", r"\1", raw)
    raw_clean = re.sub(r"\s+at\s+.*$", "", raw_clean, flags=re.IGNORECASE)
    patterns = [
        "%m/%d/%Y", "%d/%m/%Y", "%Y-%m-%d", "%B %d, %Y", "%b %d, %Y",
        "%m-%d-%Y", "%d-%m-%Y"
    ]
    for p in patterns:
        try:
            d = datetime.strptime(raw_clean, p)
            return d.strftime("%m/%d/%Y")
        except Exception:
            continue
    try:
        d = datetime.fromisoformat(raw_clean)
        return d.strftime("%m/%d/%Y")
    except Exception:
        pass
    m = re.search(r"(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})", raw_clean)
    if m:
        mm, dd, yy = m.groups()
        try:
            d = datetime(int(yy), int(mm), int(dd))
            return d.strftime("%m/%d/%Y")
        except Exception:
            pass
    return None

def _normalize_phone(raw: str) -> str:
    if not raw:
        return ""
    s = raw.strip()
    # keep leading +, remove other non-digits
    s = re.sub(r"[^\d\+]", "", s)
    # normalize common local formats: +639XXXXXXXXX or 09XXXXXXXXX or 8-700 style
    if s.startswith("+"):
        return s
    if s.startswith("63") and len(s) >= 11:
        return "+" + s
    if s.startswith("0") and len(s) >= 10:
        # convert 09xxxxxxxxx to +639xxxxxxxxx for PH mobile
        if s.startswith("09") and len(s) == 11:
            return "+63" + s[1:]
        return s
    # fallback: return digits
    return s

def _extract_from_lines(lines):
    out = {}
    for raw in lines:
        line = raw.strip()
        if not line:
            continue
        low = line.lower()

        # student id
        if "student" in low and "id" in low:
            m = re.search(r"([A-Za-z]*\d{5,20})", line.replace(" ", ""))
            if not m:
                m = re.search(r"(\d{5,20})", line)
            if m:
                out["studentId"] = m.group(1)

        # name
        if low.startswith("name") or "name:" in low:
            parts = re.split(r"name[:\s]*", line, flags=re.IGNORECASE)
            if len(parts) > 1 and parts[1].strip():
                out["name"] = parts[1].strip()

        # age
        if "age" in low:
            m = re.search(r"age[:\s]*?(\d{1,3})", low)
            if m:
                out["age"] = m.group(1)

        # date of birth
        if "datebirth" in low or "date of birth" in low or "dob" in low or "birthdate" in low:
            m = re.search(r"(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})", line)
            if m:
                parsed = _normalize_to_mmddyyyy(m.group(1))
                out["datebirth"] = parsed or m.group(1).strip()
            else:
                m2 = re.search(r"([A-Za-z]+\s+\d{1,2},\s*\d{4})", line)
                if m2:
                    parsed = _normalize_to_mmddyyyy(m2.group(1))
                    if parsed:
                        out["datebirth"] = parsed

        # gender
        if "gender" in low or re.match(r"^(male|female|m|f)\b", low):
            m = re.search(r"(male|female|m\b|f\b)", low)
            if m:
                g = m.group(1)
                out["gender"] = "Male" if g.startswith("m") else "Female"

        # email
        em = re.search(r"([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[A-Za-z]{2,})", line)
        if em:
            out["email"] = em.group(1).strip()

        # year level
        if re.search(r"\b(grade\s*\d+|year\s*level[:\s]*\w+|year[:\s]*\w+|college)\b", low, re.IGNORECASE):
            m = re.search(r"(grade\s*\d+|year\s*level[:\s]*\w+|year[:\s]*\w+|college)", low, re.IGNORECASE)
            if m:
                out["yearLevel"] = m.group(0).strip()

        # program
        if re.search(r"\b(BS[A-Za-z0-9]{0,4}|SHS|JHS|BSIT|BSCS|BSBA|BSTM|BSA|BSHM|BSM)\b", line, re.IGNORECASE):
            m = re.search(r"\b(BS[A-Za-z0-9]{0,4}|SHS|JHS|BSIT|BSCS|BSBA|BSTM|BSA|BSHM|BSM)\b", line, re.IGNORECASE)
            if m:
                out["program"] = m.group(0).upper()

        # section
        if "section" in low or re.match(r"^\d+(\.\d+)?\b", low):
            m = re.search(r"section[:\s]*([A-Za-z0-9\.\- ]+)", line, re.IGNORECASE)
            if m:
                out["section"] = m.group(1).strip()
            else:
                m2 = re.search(r"\b([0-9]\.[0-9]|[0-9]{1,2})\b", line)
                if m2:
                    out["section"] = m2.group(1)

        # mobile / phone
        if re.search(r"\b(mobile|mobile no|mobileno|contact|cell|tel|telephone)\b", low):
            m = re.search(r"(\+?\d{2,3}[-\s]?\d{9,12}|\b09\d{9}\b|\b8[-\s]?\d{3}\b|\b\d{7,12}\b)", line)
            if m:
                out["mobileNo"] = _normalize_phone(m.group(1))

        # emergency contact
        if "emergency" in low or "emergency contact" in low:
            m = re.search(r"(\+?\d{2,3}[-\s]?\d{7,12}|\b09\d{9}\b|\b8[-\s]?\d{3}\b|\b\d{3,12}\b)", line)
            if m:
                out["emergencyContact"] = _normalize_phone(m.group(1))
            else:
                # maybe next token is number
                parts = line.split()
                for tok in parts[::-1]:
                    if re.search(r"\d", tok):
                        out["emergencyContact"] = _normalize_phone(tok)
                        break

        # contactNo (other contact)
        if re.search(r"\b(contact no|contactno|contact number|contact:)\b", low):
            m = re.search(r"(\+?\d{2,3}[-\s]?\d{7,12}|\b09\d{9}\b|\b8[-\s]?\d{3}\b|\b\d{3,12}\b)", line)
            if m:
                out["contactNo"] = _normalize_phone(m.group(1))

        # address
        if "address" in low:
            m = re.split(r"address[:\s]*", line, flags=re.IGNORECASE)
            if len(m) > 1 and m[1].strip():
                out["address"] = m[1].strip()
            else:
                # try to collect next few lines in caller if needed (fallback)
                out.setdefault("address", line.strip())

        # health condition / medical
        if re.search(r"\b(health|healthcondition|health condition|medical|allerg)\b", low):
            m = re.search(r"(none|n/a|no known|[A-Za-z0-9 ,\-]+)", line, re.IGNORECASE)
            if m:
                out["healthCondition"] = m.group(0).strip()

    return out

def _regex_fallback(full_text: str) -> Dict[str, str]:
    out = {}
    # student id
    m = re.search(r"\b([A-Za-z]*\d{5,20})\b", full_text)
    if m:
        out["studentId"] = m.group(1)
    # name
    m = re.search(r"Name[:\s]*([A-Z][A-Za-z'\-\. ]{2,80})", full_text)
    if m:
        out["name"] = m.group(1).strip()
    # date
    m = re.search(r"(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})", full_text)
    if m:
        parsed = _normalize_to_mmddyyyy(m.group(1))
        if parsed:
            out["datebirth"] = parsed
    # email
    em = re.search(r"([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[A-Za-z]{2,})", full_text)
    if em:
        out["email"] = em.group(1)
    # age
    m = re.search(r"\bage[:\s]*?(\d{1,3})\b", full_text, re.IGNORECASE)
    if m:
        out["age"] = m.group(1)
    # mobile (common formats)
    m = re.search(r"(\+63\d{10}|\b09\d{9}\b|\b\d{7,12}\b)", full_text)
    if m:
        out["mobileNo"] = _normalize_phone(m.group(1))
    # emergency contact
    m = re.search(r"emerg(?:ency)?[:\s]*?(?:contact[:\s]*)?(\+?\d[\d\-\s]{6,})", full_text, re.IGNORECASE)
    if m:
        out["emergencyContact"] = _normalize_phone(m.group(1))
    # address (simple heuristic: line that contains 'address' plus following text)
    m = re.search(r"address[:\s]*([A-Za-z0-9\.,\-# ]{5,200})", full_text, re.IGNORECASE)
    if m:
        out["address"] = m.group(1).strip()
    # health condition
    m = re.search(r"(HealthCondition|health condition|medical)[:\s]*([A-Za-z0-9 ,\-]+)", full_text, re.IGNORECASE)
    if m:
        out["healthCondition"] = m.group(2).strip()
    return out

def parse_document_free(file_path: str) -> Dict[str, str]:
    try:
        if not os.path.exists(file_path):
            return {"error": f"File not found: {file_path}"}
        image = Image.open(file_path)
        raw_text = pytesseract.image_to_string(image, lang=None)
        lines = [l for l in raw_text.splitlines() if l.strip()]
        extracted = _extract_from_lines(lines)
        fallback = _regex_fallback(raw_text)
        for k, v in fallback.items():
            if k not in extracted:
                extracted[k] = v
        if "datebirth" in extracted:
            parsed = _normalize_to_mmddyyyy(extracted["datebirth"])
            if parsed:
                extracted["datebirth"] = parsed
        # normalize phone fields
        for pkey in ("mobileNo", "emergencyContact", "contactNo"):
            if pkey in extracted:
                extracted[pkey] = _normalize_phone(extracted[pkey])
        # trim strings
        for k, v in list(extracted.items()):
            if isinstance(v, str):
                extracted[k] = v.strip()
        # final map to desired output keys (consistent casing)
        result = {}
        mapping = {
            "studentId": "studentId",
            "name": "name",
            "age": "age",
            "datebirth": "datebirth",
            "gender": "gender",
            "email": "email",
            "yearLevel": "yearLevel",
            "program": "program",
            "section": "section",
            "mobileNo": "mobileNo",
            "emergencyContact": "emergencyContact",
            "contactNo": "contactNo",
            "address": "address",
            "healthCondition": "healthCondition"
        }
        for k, outk in mapping.items():
            if k in extracted:
                result[outk] = extracted[k]
        return result
    except pytesseract.TesseractNotFoundError as te:
        return {"error": "Tesseract binary not found", "detail": str(te)}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: demoHTR.py <file_path>"}))
        sys.exit(1)
    file_path = sys.argv[1]
    result = parse_document_free(file_path)
    print(json.dumps(result, ensure_ascii=False))