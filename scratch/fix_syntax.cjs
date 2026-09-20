const fs = require('fs');

const filesToFix = [
    'src/pages/PeopleManagement.tsx',
    'src/pages/Profile.tsx',
    'src/pages/Reports.tsx',
    'src/pages/reports/ExecutiveSummary.tsx'
];

for (const file of filesToFix) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        // The script injected:
        // import {
        // import { useLanguage } from "@/context/LanguageContext";
        // 
        
        content = content.replace(
            /import \{\s*import \{ useLanguage \} from "@\/context\/LanguageContext";/g,
            'import { useLanguage } from "@/context/LanguageContext";\nimport {'
        );

        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed ${file}`);
    }
}
