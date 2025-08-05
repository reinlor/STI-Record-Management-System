import Button from '../../../component/Button.jsx';

export default function AddUserModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-0
        bg-slate-900/45
        flex items-center justify-center
        z-50
        transition-opacity duration-200 ease-in
      "
    >
      <form
        className="
          bg-white
          p-10
          rounded-2xl
          min-w-[380px] max-w-[95vw]
          shadow-xl border border-gray-200
          flex flex-col gap-6
        "
      >
        <h2 className="mb-2 text-2xl font-extrabold text-slate-800 tracking-tight">
          Add User
        </h2>

        {/* 🏷️ USER ID */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="id"
            className="font-semibold text-slate-700 text-lg"
          >
            ID
          </label>
          <input
            id="id"
            name="id"
            placeholder="ID"
            className="
              w-full
              px-4 py-3
              border border-gray-300
              rounded-lg
              text-lg
              bg-gray-50
              transition
              focus:outline-none
              focus:border-blue-600
              focus:ring-2 focus:ring-blue-200
              shadow-sm
            "
          />
        </div>

        {/* 🏷️ FIRST NAME */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="firstName"
            className="font-semibold text-slate-700 text-lg"
          >
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            placeholder="First Name"
            className="
              w-full
              px-4 py-3
              border border-gray-300
              rounded-lg
              text-lg
              bg-gray-50
              transition
              focus:outline-none
              focus:border-blue-600
              focus:ring-2 focus:ring-blue-200
              shadow-sm
            "
          />
        </div>

        {/* 🏷️ MIDDLE NAME */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="middleName"
            className="font-semibold text-slate-700 text-lg"
          >
            Middle Name
          </label>
          <input
            id="middleName"
            name="middleName"
            placeholder="Middle Name"
            className="
              w-full
              px-4 py-3
              border border-gray-300
              rounded-lg
              text-lg
              bg-gray-50
              transition
              focus:outline-none
              focus:border-blue-600
              focus:ring-2 focus:ring-blue-200
              shadow-sm
            "
          />
        </div>

        {/* 🏷️ SURNAME */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="surname"
            className="font-semibold text-slate-700 text-lg"
          >
            Last Name
          </label>
          <input
            id="surname"
            name="surname"
            placeholder="Surname"
            className="
              w-full
              px-4 py-3
              border border-gray-300
              rounded-lg
              text-lg
              bg-gray-50
              transition
              focus:outline-none
              focus:border-blue-600
              focus:ring-2 focus:ring-blue-200
              shadow-sm
            "
          />
        </div>

        {/* 🧑 USER ROLE */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="role"
            className="font-semibold text-slate-700 text-lg"
          >
            Role
          </label>
          <select
            id="role"
            name="role"
            defaultValue=""
            className="
              w-full
              px-4 py-3
              border border-gray-300
              rounded-lg
              text-lg
              bg-gray-50 text-gray-700
              appearance-none cursor-pointer
              transition
              focus:outline-none
              focus:border-blue-600
              focus:ring-2 focus:ring-blue-200
              shadow-sm
            "
          >
            <option value="" disabled>Select Role</option>
            <option value="Teacher">Teacher</option>
            <option value="Disciplinary Officer">Disciplinary Officer</option>
            <option value="Guidance Head">Guidance Head</option>
          </select>
        </div>

        {/* 🟢 BUTTON ROW */}
        <div className="flex gap-4 justify-end mt-6">
          <Button
            type="button"
            onClick={onClose}
            className="
              bg-gray-100 text-slate-700
              hover:bg-gray-200 hover:text-slate-900
              px-6 py-3
              rounded-full
              font-bold
              transition-shadow shadow
            "
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="
              bg-gradient-to-r from-blue-600 to-blue-700
              text-white
              px-6 py-3
              rounded-full
              font-bold
              transition-shadow shadow-lg
              hover:from-blue-700 hover:to-blue-600
            "
          >
            Add
          </Button>
        </div>
      </form>
    </div>
  );
}