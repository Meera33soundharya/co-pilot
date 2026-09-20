const fs = require('fs');

// ─── NEW TRANSLATIONS TO ADD ───────────────────────────────────────────────
const newEnKeys = {
  // Settings page
  'settings.pageTitle': 'Officer Settings & Governance',
  'settings.pageSubtitle': 'Manage your professional profile, operational metrics, and communication tools',
  'settings.profileIdentity': 'Profile & Identity',
  'settings.notificationsAlerts': 'Notifications & Alerts',
  'settings.securityAccess': 'Security & Access',
  'settings.performanceMetrics': 'Performance Metrics',
  'settings.identityProtocol': 'Identity & Protocol',
  'settings.officerName': 'Officer Name',
  'settings.mailNode': 'Professional Mail Node',
  'settings.designation': 'Designation / Title',
  'settings.deptWard': 'Department / Ward Assignment',
  'settings.encryptedContact': 'Encrypted Contact',
  'settings.govDivision': 'Governance Division',
  'settings.commitProtocol': 'Commit Protocol',
  'settings.committed': 'Changes Committed',
  'settings.abort': 'Abort',
  'settings.requestCredential': 'Request Credential Update',
  'settings.initializing': 'Initializing...',
  'settings.notifAlertsHeader': 'Notifications & Protocol Alerts',
  'settings.securityHeader': 'Multi-Factor Security Protocol',
  'settings.trustedDevices': 'Trusted Device Management',
  'settings.active': 'ACTIVE',
  'settings.revokeAccess': 'Revoke Access',
  'settings.grievancesResolved': 'Grievances Resolved',
  'settings.avgResolutionTime': 'Avg Resolution Time',
  'settings.satisfactionScore': 'Satisfaction Score',
  'settings.efficiencyTrend': 'Resolution Efficiency Trend',
  'settings.downloadReport': 'Download Full Report',
  // Notification items
  'settings.notif.newGrievance': 'New Grievance Alerts',
  'settings.notif.newGrievanceDesc': 'Notification when a new complaint is geo-assigned to your ward',
  'settings.notif.criticalEscalation': 'Critical Escalations',
  'settings.notif.criticalEscalationDesc': 'Ping when unresolved issues hit the 7-day threshold',
  'settings.notif.sentimentSpike': 'Sentiment Spike Warnings',
  'settings.notif.sentimentSpikeDesc': 'AI-detected trends of citizen dissatisfaction in your area',
  'settings.notif.deptMemo': 'Department Memo',
  'settings.notif.deptMemoDesc': 'Administrative and internal policy updates',
  'settings.notif.maintenance': 'System Maintenance',
  'settings.notif.maintenanceDesc': 'Scheduled down-time for district security patches',
  // Security items
  'settings.security.bio2fa': 'Gov-Bio 2FA Authentication',
  'settings.security.bio2faDesc': 'Require biometric or mobile OTP for all district logins',
  'settings.security.sessionTimeout': 'Forced Session Timeout',
  'settings.security.sessionTimeoutDesc': 'Auto-logout after 20 minutes of inactivity',
  'settings.security.loginAnomaly': 'Login Anomaly Detection',
  'settings.security.loginAnomalyDesc': 'Alert me of login attempts from non-trusted mobile nodes',
};

const newTaKeys = {
  'settings.pageTitle': 'அலுவலர் அமைப்புகள் & நிர்வாகம்',
  'settings.pageSubtitle': 'உங்கள் தொழில்முறை சுயவிவரம், செயல்பாட்டு அளவீடுகள் மற்றும் தொடர்பு கருவிகளை நிர்வகிக்கவும்',
  'settings.profileIdentity': 'சுயவிவரம் & அடையாளம்',
  'settings.notificationsAlerts': 'அறிவிப்புகள் & எச்சரிக்கைகள்',
  'settings.securityAccess': 'பாதுகாப்பு & அணுகல்',
  'settings.performanceMetrics': 'செயல்திறன் அளவீடுகள்',
  'settings.identityProtocol': 'அடையாளம் & நெறிமுறை',
  'settings.officerName': 'அலுவலர் பெயர்',
  'settings.mailNode': 'தொழில்முறை மின்னஞ்சல்',
  'settings.designation': 'பதவி / தலைப்பு',
  'settings.deptWard': 'துறை / வார்டு ஒதுக்கீடு',
  'settings.encryptedContact': 'தொடர்பு எண்',
  'settings.govDivision': 'நிர்வாகப் பிரிவு',
  'settings.commitProtocol': 'மாற்றங்களை சேமி',
  'settings.committed': 'மாற்றங்கள் சேமிக்கப்பட்டன',
  'settings.abort': 'ரத்து செய்',
  'settings.requestCredential': 'சான்றிதழ் புதுப்பிப்பு கோரு',
  'settings.initializing': 'தொடங்குகிறது...',
  'settings.notifAlertsHeader': 'அறிவிப்புகள் & எச்சரிக்கை நெறிமுறைகள்',
  'settings.securityHeader': 'பல-காரணி பாதுகாப்பு நெறிமுறை',
  'settings.trustedDevices': 'நம்பகமான சாதன நிர்வாகம்',
  'settings.active': 'செயலில்',
  'settings.revokeAccess': 'அணுகலை திரும்பப் பெறு',
  'settings.grievancesResolved': 'தீர்க்கப்பட்ட புகார்கள்',
  'settings.avgResolutionTime': 'சராசரி தீர்வு நேரம்',
  'settings.satisfactionScore': 'திருப்தி மதிப்பெண்',
  'settings.efficiencyTrend': 'தீர்வு திறன் போக்கு',
  'settings.downloadReport': 'முழு அறிக்கையை பதிவிறக்கு',
  'settings.notif.newGrievance': 'புதிய புகார் எச்சரிக்கைகள்',
  'settings.notif.newGrievanceDesc': 'உங்கள் வார்டிற்கு புதிய புகார் ஒதுக்கப்படும்போது அறிவிப்பு',
  'settings.notif.criticalEscalation': 'அவசர நிலை அதிகரிப்புகள்',
  'settings.notif.criticalEscalationDesc': '7 நாள் வரம்பை தாண்டிய புகார்களில் எச்சரிக்கை',
  'settings.notif.sentimentSpike': 'குடிமகன் அதிருப்தி எச்சரிக்கைகள்',
  'settings.notif.sentimentSpikeDesc': 'AI கண்டறிந்த குடிமகன் அதிருப்தி போக்குகள்',
  'settings.notif.deptMemo': 'துறை குறிப்பு',
  'settings.notif.deptMemoDesc': 'நிர்வாக மற்றும் உள் கொள்கை புதுப்பிப்புகள்',
  'settings.notif.maintenance': 'கணினி பராமரிப்பு',
  'settings.notif.maintenanceDesc': 'மாவட்ட பாதுகாப்பு இணைப்புகளுக்கான திட்டமிட்ட நேர இடைவெளி',
  'settings.security.bio2fa': 'Gov-Bio இரட்டை சரிபார்ப்பு',
  'settings.security.bio2faDesc': 'அனைத்து மாவட்ட உள்நுழைவுகளுக்கும் OTP தேவை',
  'settings.security.sessionTimeout': 'தளம் நேர வரம்பு',
  'settings.security.sessionTimeoutDesc': '20 நிமிட செயலற்ற நிலையில் தானாக வெளியேறும்',
  'settings.security.loginAnomaly': 'உள்நுழைவு முரண்பாடு கண்டறிதல்',
  'settings.security.loginAnomalyDesc': 'நம்பகமற்ற சாதனங்களில் இருந்து உள்நுழைவு முயற்சிகளை எனக்கு அறிவிக்கவும்',
};

// ─── READ AND UPDATE translations/index.ts ─────────────────────────────────
let translations = fs.readFileSync('src/translations/index.ts', 'utf8');

// Build the new en entries string
let enBlock = Object.entries(newEnKeys).map(([k, v]) => `    '${k}': '${v.replace(/'/g, "\\'")}',`).join('\n');
// Build the new ta entries string
let taBlock = Object.entries(newTaKeys).map(([k, v]) => `    '${k}': '${v.replace(/'/g, "\\'")}',`).join('\n');

// Insert before the closing of en: {...}
translations = translations.replace(
  "    'announcements.postingBtn': 'Posting...',\n  },",
  `    'announcements.postingBtn': 'Posting...',\n${enBlock}\n  },`
);

// Insert before the closing of ta: {...}
translations = translations.replace(
  "    'announcements.postingBtn': 'வெளியிடப்படுகிறது...',\n  },",
  `    'announcements.postingBtn': 'வெளியிடப்படுகிறது...',\n${taBlock}\n  },`
);

fs.writeFileSync('src/translations/index.ts', translations, 'utf8');
console.log('Updated translations/index.ts');
