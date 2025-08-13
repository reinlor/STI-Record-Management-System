import React, { useState } from "react";
import StudentTopBar from './components/StudentTopbar.jsx';
export default function StudentSignup() {
  const [gender, setGender] = useState("");
  const [otherGender, setOtherGender] = useState("");

  return (
    <div className="min-h-screen bg-gray-100">
      <StudentTopBar />

      <div className="flex justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Fill up Basic Information
          </h2>

          <form className="space-y-5">
            {/* Example field */}
            <div>
              <label className="block text-gray-900 font-medium mb-1">
                First Name
              </label>
              <input
                type="text"
                placeholder="e.g. Juan"
                className="w-full border border-gray-400 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-600 focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>

            {/* Middle Name */}
            <div>
              <label className="block text-gray-900 font-medium mb-1">
                Middle Name
              </label>
              <input
                type="text"
                placeholder="e.g. Santos"
                className="w-full border border-gray-400 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-600 focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-gray-900 font-medium mb-1">
                Last Name
              </label>
              <input
                type="text"
                placeholder="e.g. Dela Cruz"
                className="w-full border border-gray-400 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-600 focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>

            {/* Suffix */}
            <div>
              <label className="block text-gray-900 font-medium mb-1">
                Suffix <span className="text-sm text-gray-600">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Jr., III"
                className="w-full border border-gray-400 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-600 focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>

            {/* Student Number */}
            <div>
              <label className="block text-gray-900 font-medium mb-1">
                Student Number
              </label>
              <input
                type="text"
                placeholder="e.g. 202312345"
                className="w-full border border-gray-400 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-600 focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-900 font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. juan@email.com"
                className="w-full border border-gray-400 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-600 focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>

            {/* Grade Level */}
            <div>
              <label className="block text-gray-900 font-medium mb-1">
                Grade/Year Level
              </label>
              <select className="w-full border border-gray-400 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring focus:ring-blue-300" required>
                <option value="" disabled>Select Grade/Year Level</option>
                <option>Grade 11</option>
                <option>Grade 12</option>
                <option>1st Year College</option>
                <option>2nd Year College</option>
                <option>3rd Year College</option>
                <option>4th Year College</option>
              </select>
            </div>

            {/* Program/Strand */}
            <div>
              <label className="block text-gray-900 font-medium mb-1">
                Program Strand
              </label>
              <select className="w-full border border-gray-400 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring focus:ring-blue-300" required>
                <option value="" disabled>Select Program Strand</option>
                <option>Accountancy, Business, and Management</option>
                <option>IT in Mobile App and Web Development</option>
                <option>Computer and Communications Technology</option>
                <option>Tourism Operations</option>
                <option>Culinary Arts</option>
                <option>Bachelor of Science in Computer Science (BSCS)</option>
                <option>Bachelor of Science in Information Technology (BSIT)</option>
                <option>Bachelor of Science in Business Administration (BSBA)</option>
                <option>Bachelor of Science in Accounting Information System (BSAIS)</option>
                <option>Bachelor of Science in Accountancy (BSA)</option>
                <option>Bachelor of Science in Hospitality Management (BSHM)</option>
                <option>Bachelor of Arts in Communication (BACOMM)</option>
                <option>Bachelor of Multimedia Arts (BMMA)</option>
                <option>Bachelor of Science in Tourism Management (BSTM)</option>
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block text-gray-900 font-medium mb-1">
                Section
              </label>
              <select className="w-full border border-gray-400 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring focus:ring-blue-300" required>
                <option value="" disabled>Select Section</option>
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>D</option>
              </select>
            </div>

            {/* Birthdate */}
            <div>
              <label className="block text-gray-900 font-medium mb-1">
                Birthdate
              </label>
              <input
                type="date"
                className="w-full border border-gray-400 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-gray-900 font-medium mb-1">
                Age
              </label>
              <input
                type="number"
                placeholder="e.g. 18"
                min="0"
                className="w-full border border-gray-400 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-600 focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-gray-900 font-medium mb-1">
                Gender
              </label>
              <div className="flex items-center gap-4 text-gray-800">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    onChange={(e) => setGender(e.target.value)}
                    required
                  />
                  Male
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    onChange={(e) => setGender(e.target.value)}
                    required
                  />
                  Female
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    value="Others"
                    onChange={(e) => setGender(e.target.value)}
                    required
                  />
                  Others
                </label>
                {gender === "Others" && (
                  <input
                    type="text"
                    placeholder="Specify gender"
                    value={otherGender}
                    onChange={(e) => setOtherGender(e.target.value)}
                    className="border border-gray-400 rounded-lg px-3 py-1 text-gray-800 placeholder-gray-600 focus:outline-none focus:ring focus:ring-blue-300"
                    required
                  />
                )}
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-gray-900 font-medium mb-1">
                Mobile No.
              </label>
              <input
                type="tel"
                placeholder="e.g. 09123456789"
                maxLength={11}
                pattern="[0-9]{11}"
                className="w-full border border-gray-400 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-600 focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-gray-900 font-medium mb-1">
                Address
              </label>
              <textarea
                placeholder="e.g. 123 Mabini St., Manila"
                rows="2"
                className="w-full border border-gray-400 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-600 focus:outline-none focus:ring focus:ring-blue-300"
                required
              ></textarea>
            </div>

            {/* Emergency Contact Person */}
            <div>
              <label className="block text-gray-900 font-medium mb-1">
                Emergency Contact Person
              </label>
              <input
                type="text"
                placeholder="e.g. Maria Santos"
                className="w-full border border-gray-400 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-600 focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>

            {/* Emergency Contact No */}
            <div>
              <label className="block text-gray-900 font-medium mb-1">
                Contact No.
              </label>
              <input
                type="tel"
                placeholder="e.g. 09123456789"
                maxLength={11}
                pattern="[0-9]{11}"
                className="w-full border border-gray-400 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-600 focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>

            {/* Health Conditions */}
            <div>
              <label className="block text-gray-900 font-medium mb-1">
                Health Condition/s
              </label>
              <textarea
                placeholder="e.g. Asthma, Allergic to peanuts"
                rows="2"
                className="w-full border border-gray-400 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-600 focus:outline-none focus:ring focus:ring-blue-300"
                required
              ></textarea>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
              >
                Continue
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
