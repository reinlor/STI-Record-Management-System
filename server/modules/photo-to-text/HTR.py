# # Minimal Document AI OCR + KV extraction helper
# # Requires: pip install google-cloud-documentai, python-dotenv
# # Authenticate with GOOGLE_APPLICATION_CREDENTIALS env var or ADC.

# import re
# from typing import Dict, Optional
# from google.cloud import documentai_v1 as documentai
# from datetime import datetime
# from dotenv import load_dotenv  # <-- Add this line
# import os # <-- Add this line

# # Load environment variables from .env file
# load_dotenv()

# # The rest of your code goes here.
# # Note that os.environ['GOOGLE_APPLICATION_CREDENTIALS'] is now available,
# # and the Document AI client will automatically pick it up.

# TARGET_KEYS = {
#     "studentid": ["student id", "studentid", "sid", "id no", "id"],
#     "name": ["name", "full name"],
#     "age": ["age"],
#     "datebirth": ["date of birth", "dob", "birthdate", "date of birth (dd/mm/yyyy)"],
#     # Mga iba pang keys
# }

# def _get_text_from_anchor(doc_text: str, text_anchor) -> str:
#     """
#     Extract text from a Document.text using a text_anchor object returned by Document AI.
#     """
#     if not text_anchor:
#         return ""
#     pieces = []
#     for segment in getattr(text_anchor, "text_segments", []):
#         start = int(segment.start_index) if segment.start_index else 0
#         end = int(segment.end_index) if segment.end_index else len(doc_text)
#         pieces.append(doc_text[start:end])
#     return " ".join(pieces).strip()


# def _map_field_name_to_key(field_name: str) -> Optional[str]:
#     if not field_name:
#         return None
#     n = field_name.lower()
#     for target, variants in TARGET_KEYS.items():
#         for v in variants:
#             if v in n:
#                 return target
#     return None


# def _regex_fallback(text: str) -> Dict[str, str]:
#     """
#     Fallback extraction using regex on raw text when form fields are not found.
#     """
#     out = {}
#     # student ID: sequence of 6-15 digits/letters (adjust as needed)
#     m = re.search(r"\b((?:S|s)?\d{6,15})\b", text)
#     if m:
#         out["studentid"] = m.group(1)

#     # DOB patterns common: mm/dd/yyyy or dd/mm/yyyy or yyyy-mm-dd or verbose 'August 31, 2025'
#     date_patterns = [
#         r"\b(0[1-9]|1[0-2])[\/\-](0[1-9]|[12]\d|3[01])[\/\-](\d{4})\b",  # mm/dd/yyyy or mm-dd-yyyy
#         r"\b(0[1-9]|[12]\d|3[01])[\/\-](0[1-9]|1[0-2])[\/\-](\d{4})\b",  # dd/mm/yyyy
#         r"\b(\d{4})[\/\-](0[1-9]|1[0-2])[\/\-](0[1-9]|[12]\d|3[01])\b",  # yyyy-mm-dd
#         r"\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s*\d{4}\b",
#     ]
#     for p in date_patterns:
#         mm = re.search(p, text, re.IGNORECASE)
#         if mm:
#             out["datebirth"] = mm.group(0)
#             break

#     # age: number followed by 'years' or 'yrs' or 'age'
#     m = re.search(r"\bage[:\s]*?(\d{1,3})\b", text, re.IGNORECASE) or re.search(r"\b(\d{1,3})\s*(?:years|yrs)\b", text, re.IGNORECASE)
#     if m:
#         out["age"] = m.group(1)

#     # name: heuristic - look for "Name: ..." or uppercase words near 'Name'
#     m = re.search(r"\bName[:\s]+([A-Z][A-Za-z'\-\. ]{2,80})", text)
#     if m:
#         out["name"] = m.group(1).strip()

#     return out


# def parse_document_ai(file_path: str, project_id: str, location: str, processor_id: str, mime_type: str = "image/jpeg") -> Dict[str, str]:
#     """
#     Send file to Document AI and extract key/value pairs for TARGET_KEYS.
#     Returns a dict with keys like 'studentid','name','age','datebirth' (values are strings).
#     """
#     client = documentai.DocumentProcessorServiceClient()
#     name = client.processor_path(project_id, location, processor_id)

#     # read file bytes
#     with open(file_path, "rb") as f:
#         content = f.read()

#     request = {
#         "name": name,
#         "raw_document": {"content": content, "mime_type": mime_type},
#     }

#     result = client.process_document(request=request)
#     doc = result.document
#     doc_text = doc.text or ""

#     extracted = {}

#     # Try form fields (preferred)
#     # Document AI stores form fields under doc.pages[].form_fields in many processors,
#     # and also in doc.form_fields depending on processor version.
#     form_fields = []
#     if getattr(doc, "form_fields", None):
#         form_fields = list(doc.form_fields)
#     else:
#         for p in doc.pages:
#             if getattr(p, "form_fields", None):
#                 form_fields.extend(list(p.form_fields))

#     for f in form_fields:
#         name_text = _get_text_from_anchor(doc_text, f.field_name.text_anchor) if getattr(f, "field_name", None) else ""
#         value_text = _get_text_from_anchor(doc_text, f.field_value.text_anchor) if getattr(f, "field_value", None) else ""
#         mapped = _map_field_name_to_key(name_text)
#         if mapped:
#             extracted[mapped] = value_text

#     # Entities (some processors annotate entities)
#     for ent in getattr(doc, "entities", []) or []:
#         ent_type = (ent.type_ or "").lower()
#         ent_text = _get_text_from_anchor(doc_text, ent.text_anchor)
#         # map by simple rules
#         if "name" in ent_type and "name" not in extracted:
#             extracted.setdefault("name", ent_text)
#         if ("date" in ent_type or "birth" in ent_type) and "datebirth" not in extracted:
#             extracted.setdefault("datebirth", ent_text)
#         if "age" in ent_type and "age" not in extracted:
#             extracted.setdefault("age", ent_text)

#     # Fallback: regex search on full text
#     if not extracted:
#         fallback = _regex_fallback(doc_text)
#         extracted.update(fallback)

#     # Normalize some fields: convert Firestore-like timestamps or verbose dates to ISO or MM/DD/YYYY
#     if "datebirth" in extracted:
#         parsed = _normalize_to_mmddyyyy(extracted["datebirth"])
#         if parsed:
#             extracted["datebirth"] = parsed

#     # Trim whitespace
#     for k, v in list(extracted.items()):
#         if isinstance(v, str):
#             extracted[k] = v.strip()

#     return extracted


# def _normalize_to_mmddyyyy(raw: str) -> Optional[str]:
#     """Try to parse many date formats into MM/DD/YYYY. Returns string or None."""
#     if not raw:
#         return None
#     raw = raw.strip()
#     # Try many common formats
#     patterns = [
#         "%m/%d/%Y", "%d/%m/%Y", "%Y-%m-%d", "%B %d, %Y", "%b %d, %Y",
#         "%m-%d-%Y", "%d-%m-%Y"
#     ]
#     # Remove ordinal suffixes e.g., 1st, 2nd
#     raw_clean = re.sub(r"(\d)(st|nd|rd|th)\b", r"\1", raw)
#     # remove "at ..." timezone stuff
#     raw_clean = re.sub(r"\s+at\s+.*$", "", raw_clean, flags=re.IGNORECASE)
#     # attempt parse
#     for p in patterns:
#         try:
#             d = datetime.strptime(raw_clean, p)
#             return d.strftime("%m/%d/%Y")
#         except Exception:
#             continue
#     # last resort: try Date.parse like behavior via datetime.fromisoformat or dateutil if available
#     try:
#         # ISO-like
#         d = datetime.fromisoformat(raw_clean)
#         return d.strftime("%m/%d/%Y")
#     except Exception:
#         pass

#     return None


# # Example usage:
# if __name__ == "__main__":
#     # Example CLI usage (set env var GOOGLE_APPLICATION_CREDENTIALS)
#     # python HTR.py /path/to/image.jpg my-project us processors/processor-id
#     import sys
#     if len(sys.argv) < 5:
#         print("Usage: python HTR.py <file> <project_id> <location> <processor_id> [mime_type]")
#         sys.exit(1)
#     file_path = sys.argv[1]
#     project_id = sys.argv[2]
#     location = sys.argv[3]
#     processor_id = sys.argv[4]
#     mime = sys.argv[5] if len(sys.argv) > 5 else "image/jpeg"
    
#     # You no longer need to manually set the environment variable in the CLI,
#     # as the dotenv library will handle it.
#     kv = parse_document_ai(file_path, project_id, location, processor_id, mime_type=mime)
#     print(kv)