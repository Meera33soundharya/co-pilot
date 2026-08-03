const fs = require('fs');
const path = 'c:/Users/Admin/.copilot/co-pilot/frontend/src/pages/Dashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import OfficerDashboard')) {
    content = content.replace(
        /import type \{ Status, Priority \} from "@\/store\/complaintsStore";/,
        `import type { Status, Priority } from "@/store/complaintsStore";\nimport OfficerDashboard from "./OfficerDashboard";`
    );
}

if (!content.includes('if (isOfficer) return <OfficerDashboard />;')) {
    content = content.replace(
        /export default function Dashboard\(\) \{[\s\S]*?const isCitizen = currentUser\?\.role === "citizen";/,
        `export default function Dashboard() {
    const { complaints, updateStatus, currentUser, notifications } = useComplaints();
    const navigate = useNavigate();

    const isAdmin = !currentUser || currentUser.role === "admin";
    const isOfficer = currentUser?.role === "officer";
    const isCitizen = currentUser?.role === "citizen";

    if (isOfficer) return <OfficerDashboard />;\n`
    );
}

fs.writeFileSync(path, content);
console.log("Updated Dashboard.tsx");
