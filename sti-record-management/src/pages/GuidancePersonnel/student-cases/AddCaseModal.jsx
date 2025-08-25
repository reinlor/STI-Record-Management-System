import React from "react";
import close from '../../../assets/close.png';
import closeB from '../../../assets/closeblack.png';
import check from '../../../assets/check.png';
import upload from '../../../assets/upload.png';

export default function AddCaseModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-[90vw] max-w-5xl p-6 relative overflow-y-auto max-h-[90vh] outline-solid outline-2 outline-gray-300">

        <div className='flex items-center '>
          {/* Close button */}
          <button
            onClick={() => onClose()}
            className="absolute mb-3 right-5 text-2xl text-gray-700 hover:text-black"
          >
            <img src={closeB} alt="closeb" className="w-7 h-7 object-cover rounded " />
          </button>

          <h2 className="text-2xl font-bold mb-4">Add New Case</h2>
        </div>

        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Name:</label>
              <input className="w-full border rounded px-2 py-1 mt-1" />
            </div>

            <div>
              <label className="font-semibold">Student Number:</label>
              <input className="w-full border rounded px-2 py-1 mt-1" />
            </div>

            <div>
              <label className="font-semibold">Date of Incident:</label>
              <input type="date" className="w-full border rounded px-2 py-1 mt-1" />
            </div>

            <div>
              <label className="font-semibold">Time of Incident:</label>
              <input type="time" className="w-full border rounded px-2 py-1 mt-1" />
            </div>

            <div>
              <label className="font-semibold">Violation Type/ Category:</label>
              <select className="w-full border rounded px-2 py-1 mt-1">
                <option>Select</option>
              </select>
            </div>

            <div>
              <label className="font-semibold">Case Status:</label>
              <select className="w-full border rounded px-2 py-1 mt-1">
                <option>Select</option>
              </select>
            </div>

          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Detailed Description:</label>
              <textarea className="w-full border rounded px-2 py-1 mt-1" rows={3} placeholder="Description" />
            </div>

            <div>
              <label className="font-semibold">Actions Taken:</label>
              <textarea className="w-full border rounded px-2 py-1 mt-1" rows={3} placeholder="Actions Taken" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Counselor’s Note:</label>
              <textarea className="w-full border rounded px-2 py-1 mt-1" rows={2} placeholder="Description" />
            </div>

            <div>

              <label className="font-semibold">Proof:</label>

              {/* Upload Button */}
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  className="border rounded px-2 py-1 flex items-center gap-2"
                >
                  Upload
                  <img src={upload} alt="upload" className="w-5 h-5 object-cover rounded " />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            {/* Cancel Button */}
            <button
              type="button"
              className="text-left bg-red-500 text-white px-3 py-2 w-30 rounded-full flex items-center gap-7"
              onClick={onClose}
            >
              Cancel
              <img src={close} alt="close" className="w-5 h-5 object-cover rounded " />
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              className="text-left bg-green-500 text-white px-3 py-2 w-25 rounded-full flex items-center gap-5 "
            >
              Add
              <img src={check} alt="check" className="w-5 h-5 object-cover rounded" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}