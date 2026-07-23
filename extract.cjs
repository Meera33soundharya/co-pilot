const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Admin/.gemini/antigravity-ide/brain/e1c8e201-196d-4312-be55-cf2b88220510/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');
let code = null;
for (let i = lines.length - 1; i >= 0; i--) {
    let line = lines[i];
    if (line.includes('write_to_file') && line.includes('MediaQueue.tsx') && line.includes('CodeContent')) {
        try {
            const obj = JSON.parse(line);
            if (obj.tool_calls) {
                for (const tc of obj.tool_calls) {
                    if (tc.name === 'default_api:write_to_file' && tc.arguments.TargetFile.includes('MediaQueue.tsx')) {
                        code = tc.arguments.CodeContent;
                        break;
                    }
                }
            }
        } catch(e) {}
    }
    if (code && code.length > 1000) break;
}
if (code) {
    fs.writeFileSync('C:/Users/Admin/OneDrive/Desktop/co-pilot/src/pages/MediaQueue.tsx', code, 'utf8');
    console.log('Successfully recovered MediaQueue.tsx!');
} else {
    console.log('Failed to recover.');
}
