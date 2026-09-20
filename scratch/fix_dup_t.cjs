const fs = require('fs');

// Fix VoiceAssistant.tsx: remove the injected bare `const { t } = useLanguage();`
// keep only the original `const { langTag, t } = useLanguage();`
{
    const file = 'src/components/VoiceAssistant.tsx';
    let c = fs.readFileSync(file, 'utf8');
    // Remove bare injected line (just { t })
    c = c.replace(/\nexport default function VoiceAssistant\(\) \{\n  const \{ t \} = useLanguage\(\);\n    /, '\nexport default function VoiceAssistant() {\n');
    fs.writeFileSync(file, c, 'utf8');
    console.log('Fixed VoiceAssistant.tsx');
}

// Fix CitizenModule.tsx: same pattern - find injected bare { t } and remove it
{
    const file = 'src/pages/CitizenModule.tsx';
    let c = fs.readFileSync(file, 'utf8');
    // Remove any injected bare `const { t } = useLanguage();` that was added by fix_ts.cjs inside any function
    // Pattern: it would be `{\n  const { t } = useLanguage();\n` right after export default function ...() {
    c = c.replace(/(export\s+(default\s+)?function\s+\w+[^{]*\{)\n  const \{ t \} = useLanguage\(\);\n/g, '$1\n');
    fs.writeFileSync(file, c, 'utf8');
    console.log('Fixed CitizenModule.tsx');
}
