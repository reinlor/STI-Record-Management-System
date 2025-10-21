import React from "react";
import { Bell } from "lucide-react";

export default function AnnouncementPanel({
  announcements,
  newAnnouncement,
  setNewAnnouncement,
  handlePostAnnouncement,
}) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col h-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold text-[#0172bd]">Announcement</h2>
        <Bell className="w-7 h-7 text-[#0172bd] ml-2 mt-1 mb-5" />
      </div>

      {/* New announcement input */}
      <div className="space-y-4 flex flex-col">
        <input
          type="text"
          placeholder="Title of announcement"
          value={newAnnouncement.title}
          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0172bd]"
        />
        <textarea
          placeholder="Body of announcement"
          value={newAnnouncement.body}
          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, body: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0172bd] resizable-y min-h-[150px]"
        ></textarea>

        <button
          onClick={handlePostAnnouncement}
          className="self-end px-6 py-2 bg-[#0172bd] text-white font-semibold rounded-lg hover:bg-blue-500 transition duration-150 ease-in-out"
        >
          Post
        </button>
      </div>

      {/* Past announcements */}
      <div className="mt-6">
        <h3 className="text-xl font-bold text-[#0172bd] mb-2">Past Announcements</h3>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-y-auto custom-scrollbar max-h-[250px]">
          {announcements.length > 0 ? (
            announcements.map((ann, index) => (
              <div
                key={index}
                className={`p-4 bg-white rounded-lg shadow-sm ${index !== 0 ? "mt-2" : ""}`}
              >
                <h4 className="font-bold text-[#0172bd]">{ann.title}</h4>
                <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                  {ann.description || ann.body}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No past announcements.</p>
          )}
        </div>
      </div>
    </div>
  );
}