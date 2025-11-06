import React, { useEffect, useState, useRef } from "react";
import { FileText, Plus, Download, ExternalLink, Upload } from "lucide-react";
import axios from "axios";

export default function QuickLinksPanel() {
  const [shsHandbook, setShsHandbook] = useState({});
  const [collegeHandbook, setCollegeHandbook] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingShs, setUploadingShs] = useState(false);
  const [uploadingCollege, setUploadingCollege] = useState(false);

  const shsFileInputRef = useRef(null);
  const collegeFileInputRef = useRef(null);

  useEffect(() => {
    const fetchHandbooks = async () => {
      try {
        const [shsRes, collegeRes] = await Promise.all([
          axios.get("/content/shsStudentHandbook/get"),
          axios.get("/content/studentHandbook/get"),
        ]);

        setShsHandbook({
          link: shsRes.data.link,
          fileName: "SHS_Student_Handbook.pdf"
        });
        setCollegeHandbook({
          link: collegeRes.data.link,
          fileName: "Tertiary_Student_Handbook.pdf"
        });
      } catch (err) {
        setError(err.message || "Failed to load handbooks");
      } finally {
        setLoading(false);
      }
    };

    fetchHandbooks();
  }, []);

  const handleUpload = async (file, endpoint, setUploading, setHandbook) => {
    if (!file || file.type !== "application/pdf") {
      alert("Please select a PDF file.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.put(`/content${endpoint}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const getEndpoint = endpoint.replace("/add", "/get");
      const getRes = await axios.get(`/content${getEndpoint}`);
      const data = getRes.data;
      setHandbook({
        link: data.link,
        fileName: file.name || "Student_Handbook.pdf"
      });
    } catch (err) {
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const HandbookBlock = ({ title, handbook, uploading, fileInputRef, endpoint, setUploading, setHandbook }) => (
    <div className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-[#0172bd] flex-shrink-0" />
        <span className="font-semibold text-gray-800">{title}</span>
        <span className="ml-auto bg-[#0172bd] text-white text-xs px-2 py-0.5 rounded-full">PDF</span>
      </div>

      {handbook.link ? (
        <>
          <p className="text-sm text-gray-600 truncate">{handbook.fileName}</p>
          <div className="flex gap-2 mt-2">
            <a
              href={handbook.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-[#0172bd] text-white text-sm rounded-md hover:bg-[#015a9b] transition"
            >
              <ExternalLink size={14} />
              View
            </a>
            <a
              href={handbook.link}
              download
              className="flex items-center gap-1 px-3 py-1.5 bg-[#28a745] text-white text-sm rounded-md hover:bg-[#218838] transition"
            >
              <Download size={14} />
              Download
            </a>
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition disabled:opacity-50 cursor-pointer"
            >
              <Upload size={14} />
              {uploading ? "Uploading..." : "Replace"}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-500 italic">Not uploaded yet</p>
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#28a745] text-white text-sm rounded-md hover:bg-[#218838] transition disabled:opacity-50 cursor-pointer"
          >
            <Upload size={14} />
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={(e) => handleUpload(e.target.files[0], endpoint, setUploading, setHandbook)}
      />
    </div>
  );

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-2xl font-bold text-[#0172bd]">Student Handbooks</h2>
        <FileText className="w-6 h-6 text-[#0172bd]" />
      </div>

      <div className="mt-6 flex-1 flex flex-col">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-y-auto custom-scrollbar flex-1 space-y-3">
          {loading ? (
            <p className="text-center text-gray-500">Loading handbooks…</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : (
            <>
              <HandbookBlock
                title="Senior High Student Handbook"
                handbook={shsHandbook}
                uploading={uploadingShs}
                fileInputRef={shsFileInputRef}
                endpoint="/shsStudentHandbook/add"
                setUploading={setUploadingShs}
                setHandbook={setShsHandbook}
              />
              <HandbookBlock
                title="Tertiary Student Handbook"
                handbook={collegeHandbook}
                uploading={uploadingCollege}
                fileInputRef={collegeFileInputRef}
                endpoint="/studentHandbook/add"
                setUploading={setUploadingCollege}
                setHandbook={setCollegeHandbook}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}