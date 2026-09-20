const fs = require('fs');

const files = [
    'src/components/documents/ManualUploadModal.tsx',
    'src/components/AdminSlide.tsx',
    'src/components/dashboard/RecentGrievances.tsx',
    'src/components/ErrorBoundary.tsx',
    'src/pages/AdminPanel.tsx'
];

for (const file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Remove the bad injection inside the import
        content = content.replace(/import\s+[^{]*\{\s*const\s+\{\s*t\s*\}\s*=\s*useLanguage\(\);\s*/g, 'import { ');
        content = content.replace(/import\s*\{\s*const\s+\{\s*t\s*\}\s*=\s*useLanguage\(\);\s*/g, 'import { ');

        // Ensure we only inject inside the default export function or export function
        // Remove ALL `const { t } = useLanguage();` first just to be safe
        content = content.replace(/\s*const\s+\{\s*t\s*\}\s*=\s*useLanguage\(\);/g, '');
        
        // Inject once inside the main function component
        content = content.replace(/(export\s+(default\s+)?function\s+\w+\s*\([^)]*\)\s*\{)/, '$1\n  const { t } = useLanguage();');
        
        // ErrorBoundary is a class component, so useLanguage hooks can't be used inside it directly.
        // Wait, if it's a class component, we shouldn't inject `useLanguage` inside it!
        if (file.includes('ErrorBoundary.tsx')) {
            content = content.replace(/const\s+\{\s*t\s*\}\s*=\s*useLanguage\(\);/g, '');
            // also remove `t("...")` calls because they won't work in a class component without a HOC.
            content = content.replace(/\{t\("([^"]+)"\)\}/g, '{"$1"}'); // fallback to key for now to fix build
        }

        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed ${file}`);
    }
}
