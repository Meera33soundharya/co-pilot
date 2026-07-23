const fs = require('fs');
const lines = fs.readFileSync('c:/Users/Admin/.gemini/antigravity-ide/brain/e1c8e201-196d-4312-be55-cf2b88220510/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n').filter(Boolean);
for (let i = lines.length - 1; i >= 0; i--) {
    try {
        const obj = JSON.parse(lines[i]);
        if (obj.tool_calls) {
            for (const tc of obj.tool_calls) {
                if (tc.name === 'default_api:write_to_file' && tc.arguments.TargetFile.includes('MediaQueue.tsx')) {
                    fs.writeFileSync('c:/Users/Admin/OneDrive/Desktop/co-pilot/src/pages/MediaQueue.tsx', tc.arguments.CodeContent);
                    console.log('Restored MediaQueue.tsx!');
                    process.exit(0);
                }
            }
        }
    } catch(e){}
}
console.log('Not found');
