const fs = require('fs');
const path = 'c:/Users/Admin/.copilot/co-pilot/frontend/src/components/DashboardLayout.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace OFFICER_NAV
content = content.replace(
    /const OFFICER_NAV: NavGroup\[\] = \[[\s\S]*?\];\n/,
    `const OFFICER_NAV: NavGroup[] = [
    {
        group: "MENU", items: [
            { icon: LayoutDashboard, label: "My Dashboard", path: "/dashboard" },
            { icon: MessageSquare, label: "Grievances", path: "/grievances" },
            { icon: Calendar, label: "Meetings", path: "/meetings" },
            { icon: Calendar, label: "Schedule", path: "/schedule" },
        ]
    }
];\n`
);

// Replace roleCfg for officer
content = content.replace(
    /officer: \{ color: "#2563EB", label: "Field Officer", abbr: "OF" \},/,
    `officer: { color: "#059669", label: "Field Officer", abbr: "FO" },`
);

// Replace role === "admin" with role !== "citizen" globally
content = content.replace(/role === "admin"/g, 'role !== "citizen"');

fs.writeFileSync(path, content);
console.log("Updated DashboardLayout.tsx");
