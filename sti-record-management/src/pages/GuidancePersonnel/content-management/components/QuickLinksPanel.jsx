import React from "react";
import { FileText, Plus, Link2 } from "lucide-react";

export default function QuickLinksPanel({ quickLinks, setIsQuickLinkModalOpen }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-2xl font-bold text-[#0172bd]">Quick Links & Resources</h2>
        <FileText className="w-6 h-6 text-[#0172bd]" />
      </div>

      {/* Add Quick Link button */}
      <button
        onClick={() => setIsQuickLinkModalOpen(true)}
        className="w-full px-6 py-2 bg-[#28a745] text-white font-semibold rounded-lg hover:bg-green-500 transition duration-150 ease-in-out flex items-center justify-center gap-2 mb-4"
      >
        <Plus size={18} />
        <span>Add Quick Link</span>
      </button>

      {/* Uploaded resources */}
      <div className="mt-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-[#0172bd] mb-2">Uploaded Resources</h3>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-y-auto custom-scrollbar flex-1">
          {quickLinks.length > 0 ? (
            quickLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-4 bg-white rounded-lg shadow-sm mb-2 hover:bg-gray-100 transition"
              >
                <FileText className="text-[#0172bd] flex-shrink-0" />
                <span className="font-medium text-gray-800 break-all">
                  {link.title} ({link.fileName})
                </span>
                <Link2 size={16} className="text-gray-400 flex-shrink-0 ml-auto" />
              </a>
            ))
          ) : (
            <p className="text-gray-500 text-center">No resources uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
