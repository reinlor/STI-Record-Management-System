import UserRow from './UserRow.jsx';

export default function UserTable({
    users,
    selectedUsers,
    onCheck,
    onCheckAll,
    openDropdownId,
    setOpenDropdownId
}) {
    const allChecked = users.length > 0 && selectedUsers.length === users.length;

    return (
        <div className="overflow-x-auto rounded-xl shadow-sm border border-slate-200 bg-white mt-4">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="bg-slate-100 text-slate-700">
                        <th className="py-3 px-4 text-left font-semibold align-middle">
                            <div className="flex items-center justify-center">
                                <input
                                type="checkbox"
                                checked={allChecked}
                                onChange={onCheckAll}
                                className="w-5 h-5 accent-blue-600 rounded focus:ring-2 focus:ring-blue-300 transition"
                            />
                            </div>
                        </th>
                        <th className="py-3 px-4 text-left font-semibold">ID</th>
                        <th className="py-3 px-4 text-left font-semibold">Name</th>
                        <th className="py-3 px-4 text-left font-semibold">Role</th>
                        <th className="py-3 px-4 text-left font-semibold">Options</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, idx) => (
                        <UserRow
                            key={user.id}
                            user={user}
                            isChecked={selectedUsers.includes(user.id)}
                            onCheck={onCheck}
                            openDropdownId={openDropdownId}
                            setOpenDropdownId={setOpenDropdownId}
                            rowIndex={idx}
                            totalRows={users.length}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}