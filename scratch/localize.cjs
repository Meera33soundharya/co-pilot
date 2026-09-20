const fs = require('fs');
const path = require('path');

// A simplified dictionary to map English strings to translation keys based on what we saw in index.ts
// This covers the most common ones.
const mapping = {
    // Nav & Common
    'Overview': 'nav.overview',
    'Dashboard': 'nav.dashboard',
    'People': 'nav.people',
    'Field Portal': 'nav.fieldPortal',
    'Complaints': 'nav.complaints',
    'Reports': 'nav.reports',
    'Resolution Reports': 'nav.resolutionReports',
    'Comms & AI': 'nav.commsAi',
    'Announcements': 'nav.announcements',
    'Speech AI': 'nav.speechAi',
    'Meetings': 'nav.meetings',
    'Media Queue': 'nav.mediaQueue',
    'AI Co-Pilot': 'nav.aiCopilot',
    'Documents': 'nav.documents',
    'Schedule': 'nav.schedule',
    'Account': 'nav.account',
    'My Profile': 'nav.myProfile',
    'Settings': 'nav.settings',
    'My Account': 'nav.myAccount',
    'Submit Complaint': 'nav.submitComplaint',
    'Track Complaint': 'nav.trackComplaint',
    'All': 'common.all',
    'New': 'common.new',
    'Unread': 'common.unread',
    'Take Action': 'common.takeAction',
    'Admin Menu': 'common.adminMenu',
    'Citizen Portal': 'common.citizenPortal',
    'View All Complaints': 'common.viewAllComplaints',
    'Open Field Portal': 'common.openFieldPortal',
    'Track My Complaints': 'common.trackMyComplaints',
    'Sign Out': 'common.signOut',
    'Filters': 'common.filters',
    'Priority': 'common.priority',
    'Category': 'common.category',
    'All Categories': 'common.allCategories',
    'View Details': 'common.viewDetails',
    'Categorize': 'common.categorize',
    'Start Work': 'common.startWork',
    'Resolve': 'common.resolve',
    'Notify Citizen': 'common.notifyCitizen',
    'New Complaint': 'common.newComplaint',
    'Close': 'common.close',
    'Back': 'common.back',
    'Save': 'common.save',
    'Cancel': 'common.cancel',
    'Submit': 'common.submit',
    'Assign to': 'common.assignTo',
    'Assign': 'common.assign',
    'Dismiss': 'common.dismiss',

    // Dashboard
    'Open Complaints': 'dashboard.openComplaints',
    'Assigned': 'dashboard.assigned',
    'Resolved': 'dashboard.resolved',
    'Health Score': 'dashboard.healthScore',
    'Urgent Operation Queue': 'dashboard.urgentQueue',
    'Full Log': 'dashboard.fullLog',
    'Complaint Monitor': 'dashboard.complaintMonitor',
    'Assignment & Tracking': 'dashboard.assignmentTracking',
    'AI Executive Briefing': 'dashboard.aiBriefing',
    'Automated Strategic Summary': 'dashboard.automatedSummary',
    'Generate Briefing': 'dashboard.generateBriefing',
    'Constituency Integrity': 'dashboard.constituencyIntegrity',
    'District Health Index': 'dashboard.districtHealthIndex',
    'Stable': 'dashboard.stable',
    'Attention Required': 'dashboard.attentionRequired',
    'Critical Alert': 'dashboard.criticalAlert',
    'Coordinate Mission': 'dashboard.coordinateMission',
    'Review Grievances': 'dashboard.reviewGrievances',
    'Policy Simulator': 'dashboard.policySimulator',
    'Recent alerts': 'dashboard.recentAlerts',
    'Mission Detail': 'dashboard.missionDetail',
    'Case ID': 'dashboard.caseId',
    'Citizen Node': 'dashboard.citizenNode',
    'Sector Ward': 'dashboard.sectorWard',
    'Awaiting Unit': 'dashboard.awaitingUnit',
    'View Mission': 'dashboard.viewMission',
    'Issue': 'dashboard.issue',
    'Ward': 'dashboard.ward',
    'Status': 'dashboard.status',
    'Total Complaints': 'dashboard.totalComplaints',
    'Current User': 'dashboard.currentUser',
    'Filtered View': 'dashboard.filteredView',

    // Grievances
    'No complaints found': 'grievances.noFound',
    'Details': 'grievances.details',
    'AI Suggestion': 'grievances.aiSuggestion',
    'Audit Log': 'grievances.auditLog',
    'Unassigned': 'grievances.unassigned',
    'Citizen': 'grievances.citizen',
    'Department': 'grievances.dept',
    'Contact': 'grievances.contact',
    'Location': 'grievances.location',
    'Evidence': 'grievances.evidence',
    'Resolution Proof': 'grievances.resolutionProof',
    'Resolution Notes': 'grievances.resolutionNotes',

    // Field Portal
    'Live Complaint Tracking': 'field.subtitle',
    'Assigned to Me': 'field.assignedToMe',
    'Update Status': 'field.updateStatus',
    'Citizen Details': 'field.citizenDetails',
    'Complaint Details': 'field.complaintDetails',
    'Assigned To': 'field.assignedTo',
    'Mark Resolved': 'field.resolve',
    'Upload Resolution Proof': 'field.uploadProof',
    'Add Resolution Notes': 'field.resolutionNotes',

    // Reports / Others
    'Generate Report': 'reports.generate',
    'Download': 'reports.download',
    'Date Range': 'reports.dateRange',
    'Pending': 'reports.pending',
    
    'Schedule Meeting': 'meetings.schedule',
    'Upcoming Meetings': 'meetings.upcoming',
    'Past Meetings': 'meetings.past',
    
    'New Announcement': 'announcements.new',
    'Delete All': 'announcements.deleteAll',
    'Pinned Alert': 'announcements.pinnedAlert',
    
    'Upload Document': 'documents.upload',
    
    'My Profile': 'profile.title',
    'Full Name': 'profile.name',
    'Email': 'profile.email',
    'Phone': 'profile.phone',
    'Role': 'profile.role',
    'Save Changes': 'profile.save',
    
    'Language': 'settings.language',
    'Security': 'settings.security',
    'Save Settings': 'settings.save',
    
    'People Management': 'people.title',
    'Add Officer': 'people.addOfficer',
    
    'Ask anything about your constituency...': 'aiCopilot.placeholder',
    'Send': 'aiCopilot.send',
    
    'Start Listening': 'speechAi.startListening',
    'Stop Listening': 'speechAi.stopListening',
    'Processing...': 'speechAi.processing',

    'GovPilot': 'login.title',
    'Governance Intelligence Platform': 'login.subtitle',
    'Welcome back': 'login.welcome',
    'Select your role to continue': 'login.selectRole',
    'District Administrator': 'login.admin',
    'Field Officer': 'login.officer',
    'Enter Portal': 'login.enter',

    // Added a few more common buttons
    'Search by complaint, citizen, ID, ward…': 'common.searchComplaints',
    'Search complaints, wards, officers...': 'common.search',
};

// Also sort by length descending to avoid partial matches
const sortedKeys = Object.keys(mapping).sort((a, b) => b.length - a.length);

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    let modified = false;

    // Check if useLanguage needs to be added
    let needsImport = false;
    let hasT = content.includes('const { t } = useLanguage()') || content.includes('const { language, t } = useLanguage()');

    for (const enStr of sortedKeys) {
        const key = mapping[enStr];
        
        // Match >English Text<
        const jsxRegex = new RegExp(`>\\s*${escapeRegExp(enStr)}\\s*<`, 'g');
        if (jsxRegex.test(content)) {
            content = content.replace(jsxRegex, `>{t("${key}")}<`);
            modified = true;
            needsImport = true;
        }

        // Match placeholder="English Text"
        const attrRegex = new RegExp(`placeholder="${escapeRegExp(enStr)}"`, 'g');
        if (attrRegex.test(content)) {
            content = content.replace(attrRegex, `placeholder={t("${key}")}`);
            modified = true;
            needsImport = true;
        }

        // Match title="English Text"
        const titleRegex = new RegExp(`title="${escapeRegExp(enStr)}"`, 'g');
        if (titleRegex.test(content)) {
            content = content.replace(titleRegex, `title={t("${key}")}`);
            modified = true;
            needsImport = true;
        }
    }

    if (modified && !content.includes('useLanguage')) {
        // Add import
        const importStatement = `import { useLanguage } from "@/context/LanguageContext";\n`;
        // Insert after the last import
        const lines = content.split('\n');
        let lastImportIdx = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) {
                lastImportIdx = i;
            }
        }
        if (lastImportIdx >= 0) {
            lines.splice(lastImportIdx + 1, 0, importStatement);
        } else {
            lines.unshift(importStatement);
        }
        content = lines.join('\n');
    }

    if (modified && !hasT && content.includes('export default function')) {
        // Inject const { t } = useLanguage(); into the main component
        content = content.replace(
            /export default function (\w+)\s*\([^)]*\)\s*\{/,
            (match) => `${match}\n    const { t } = useLanguage();`
        );
    } else if (modified && !hasT && content.includes('export function')) {
        content = content.replace(
            /export function (\w+)\s*\([^)]*\)\s*\{/,
            (match) => `${match}\n    const { t } = useLanguage();`
        );
    } else if (modified && !hasT && content.includes('const ') && content.includes('=> {') && content.includes('export ')) {
        // Try arrow functions exported
        content = content.replace(
            /export const (\w+)\s*=\s*\([^)]*\)\s*=>\s*\{/,
            (match) => `${match}\n    const { t } = useLanguage();`
        );
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^$\{key\}()|[\\]\\]/g, '\\$&'); 
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            // skip the translation file itself
            if (!fullPath.includes('translations')) {
                processFile(fullPath);
            }
        }
    }
}

walkDir(path.join(__dirname, '../src/pages'));
walkDir(path.join(__dirname, '../src/components'));
console.log("Done.");
