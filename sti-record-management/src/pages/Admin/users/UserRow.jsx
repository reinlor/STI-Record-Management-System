import Button from '../../../component/Button.jsx';

export default function UserRow({
    user,
    isChecked,
    onCheck,
    openDropdownId,
    setOpenDropdownId,
    rowIndex,
    totalRows
    }) {
        
    const handleOptionsClick = () => {
        setOpenDropdownId(openDropdownId === user.id ? null : user.id);
    };

    // Determine if the dropdown should flip up. Kasi pag flip down, baka mag-overlap sa table footer.
    const flipUp = rowIndex >= totalRows - 2;

    return (
        <tr className="border-b border-slate-200 hover:bg-slate-50 transition">
        <td className="py-3 px-4 align-middle">
            <div className="flex items-center justify-center">
            <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onCheck(user.id)}
                className="w-5 h-5 accent-blue-600 rounded focus:ring-2 focus:ring-blue-300 transition"
            />
            </div>
        </td>

        <td className="py-3 px-4 align-middle">{user.id}</td>
        <td className="py-3 px-4 align-middle">{user.name}</td>
        <td className="py-3 px-4 align-middle">{user.role}</td>

        <td className="py-3 px-4 align-middle relative overflow-visible">
            <Button
            className="
                bg-slate-50 border border-slate-200 text-slate-600 text-xl
                px-3 py-2 rounded-lg flex items-center justify-center
                shadow-sm hover:bg-slate-200 focus:outline-none focus:bg-slate-200
                transition
            "
            onClick={handleOptionsClick}
            aria-label="Options"
            >
            ⋮
            </Button>

            {openDropdownId === user.id && (
            <div
                className={`
                absolute right-0 z-30 min-w-[150px] flex flex-col py-2 px-2
                bg-white border border-slate-200 rounded-xl shadow-xl
                ${flipUp ? 'bottom-full mb-2' : 'top-full mt-2'}
                `}
            >
                <button
                className="
                    w-full text-left px-4 py-2 text-base text-slate-700
                    rounded-lg hover:bg-blue-50 transition flex items-center gap-2
                "
                onClick={() => {
                    setOpenDropdownId(null);
                    alert('Edit user');
                }}
                >
                <span className="text-yellow-500">✏️</span> Edit
                </button>

                <button
                className="
                    w-full text-left px-4 py-2 text-base text-red-600
                    rounded-lg hover:bg-red-50 transition flex items-center gap-2
                "
                onClick={() => {
                    setOpenDropdownId(null);
                    alert('Archive user');
                }}
                >
                <span className="text-slate-600">🗄️</span> Archive
                </button>
            </div>
            )}
        </td>
        </tr>
    );
}