const fs = require('fs');

const fixMissingT = [
    'src/components/AdminSlide.tsx',
    'src/components/dashboard/RecentGrievances.tsx',
    'src/components/documents/ManualUploadModal.tsx',
    'src/components/ErrorBoundary.tsx',
    'src/pages/AdminPanel.tsx'
];

for (const file of fixMissingT) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        // Let's just add it inside the first component function body.
        if (!content.includes('const { t } = useLanguage();')) {
            content = content.replace(/\{/, '{\n  const { t } = useLanguage();\n');
        }
        fs.writeFileSync(file, content, 'utf8');
    }
}

const fixDuplicateT = [
    'src/components/DashboardLayout.tsx',
    'src/components/VoiceAssistant.tsx',
    'src/pages/CitizenModule.tsx'
];

for (const file of fixDuplicateT) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        // If it appears multiple times, replace all but the first.
        let parts = content.split('const { t } = useLanguage();');
        if (parts.length > 2) {
            // Rejoin the first two normally, and strip from the rest
            content = parts[0] + 'const { t } = useLanguage();' + parts.slice(1).join('');
        }
        
        // Let's just remove `const { t } = useLanguage();` globally if it's duplicated, and insert it once.
        let clean = content.replace(/const \{ t \} = useLanguage\(\);/g, '');
        // insert once in the first function
        clean = clean.replace(/export (default )?function (\w+)\s*\([^)]*\)\s*\{/, (m) => m + '\n  const { t } = useLanguage();');
        
        fs.writeFileSync(file, clean, 'utf8');
    }
}
