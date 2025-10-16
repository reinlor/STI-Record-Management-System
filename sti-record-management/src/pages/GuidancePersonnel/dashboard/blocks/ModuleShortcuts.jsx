import { useNavigate } from "react-router-dom";
import { Gavel, LayoutTemplate, Users, DatabaseBackup } from "lucide-react";

const modules = [
    { title: "Offenses", to: "/guidance/offenses", description: "Manage violation types and sanctions.", icon: <Gavel size={24} className="text-[#0172bd]" /> },
    { title: "Content Management", to: "/guidance/content-management", description: "Update system announcements.", icon: <LayoutTemplate size={24} className="text-[#0172bd]" /> },
    { title: "Users", to: "/guidance/users", description: "Manage user accounts and permissions.", icon: <Users size={24} className="text-[#0172bd]" /> },
    { title: "Backup & Restore", to: "/guidance/backup-and-restore", description: "Secure and restore system data.", icon: <DatabaseBackup size={24} className="text-[#0172bd]" /> },
];

function ModuleShortcuts() {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 className="text-lg font-bold text-[#0172bd] mb-4">Quick Access</h2>
            <div className="space-y-3">
                {modules.map((module) => (
                    <div
                        key={module.title}
                        onClick={() => navigate(module.to)}
                        className="group flex items-center space-x-4 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    >
                        <div className="flex-shrink-0 bg-blue-100 p-2 rounded-lg">
                            {module.icon}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">{module.title}</h3>
                            <p className="text-xs text-gray-500">{module.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ModuleShortcuts;