const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.ocrUpload = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded (field name: file)' });

    const filePath = req.file.path;
    // script is one level up from controllers/
    const scriptPath = path.resolve(__dirname, '..', 'demoHTR.py');

    if (!fs.existsSync(scriptPath)) {
      return res.status(500).json({ error: `OCR script not found: ${scriptPath}` });
    }
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ error: `Uploaded file not found on disk: ${filePath}` });
    }

    const pythonCmd = process.env.PYTHON || 'python';

    execFile(pythonCmd, [scriptPath, filePath], { maxBuffer: 50 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        console.error('OCR script error:', err, stderr);
        return res.status(500).json({ error: stderr || err.message });
      }
      try {
        const parsed = JSON.parse(stdout || '{}');
        return res.json({ success: true, ocr: parsed });
      } catch (e) {
        console.error('Invalid JSON from OCR script', e, 'stdout:', stdout);
        return res.status(500).json({ error: 'Invalid OCR output', raw: stdout });
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};