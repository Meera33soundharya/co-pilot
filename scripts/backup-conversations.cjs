const fs = require('fs');
const path = require('path');
const readline = require('readline');

const BRAIN_DIR = 'C:/Users/Admin/.gemini/antigravity-ide/brain';
const BACKUP_ROOT = path.join(__dirname, '..', 'backups', 'conversations');
const READABLE_DIR = path.join(BACKUP_ROOT, 'readable');
const RAW_DIR = path.join(BACKUP_ROOT, 'raw');
const ARTIFACTS_DIR = path.join(BACKUP_ROOT, 'artifacts');

[BACKUP_ROOT, READABLE_DIR, RAW_DIR, ARTIFACTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_').substring(0, 50);
}

function formatDate(d) {
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
}

function cleanVal(v) {
  if (typeof v !== 'string') return v || '';
  let str = v.trim();
  if (str.startsWith('"') && str.endsWith('"')) {
    try {
      str = JSON.parse(str);
    } catch {
      str = str.slice(1, -1);
    }
  }
  return str;
}

async function parseTranscript(transcriptPath) {
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const messages = [];
  const filesTouched = new Set();
  let firstUserRequest = '';
  let workspaceMatch = false;

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);

      // check if conversation relates to co-pilot
      if (!workspaceMatch && JSON.stringify(obj).includes('co-pilot')) {
        workspaceMatch = true;
      }

      if (obj.type === 'USER_INPUT') {
        let content = obj.content || '';
        const match = content.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
        const req = match ? match[1].trim() : content.trim();

        if (!firstUserRequest && req) {
          firstUserRequest = req.replace(/\r?\n/g, ' ').substring(0, 100);
        }

        messages.push({
          role: 'User',
          time: obj.created_at,
          content: req
        });
      } else if (obj.type === 'PLANNER_RESPONSE') {
        const text = (obj.content || '').trim();
        const toolCalls = [];

        if (Array.isArray(obj.tool_calls)) {
          for (const tc of obj.tool_calls) {
            const toolName = tc.name ? tc.name.replace('default_api:', '') : 'tool';
            const args = tc.args || tc.arguments || {};
            const targetFile = cleanVal(args.TargetFile || args.AbsolutePath || args.SearchPath || '');
            const command = cleanVal(args.CommandLine || '');
            const action = cleanVal(args.toolAction || '');
            const summary = cleanVal(args.toolSummary || '');

            if (targetFile && !targetFile.includes('.gemini')) {
              filesTouched.add(targetFile);
            }

            toolCalls.push({
              name: toolName,
              target: targetFile,
              command: command ? command.substring(0, 140) : '',
              action,
              summary
            });
          }
        }

        if (text || toolCalls.length > 0) {
          messages.push({
            role: 'Assistant',
            time: obj.created_at,
            content: text,
            tools: toolCalls
          });
        }
      }
    } catch (e) {}
  }

  return { messages, filesTouched: Array.from(filesTouched), firstUserRequest, workspaceMatch };
}

async function runBackup() {
  console.log('🚀 Starting comprehensive conversation backup...');
  console.log(`Source: ${BRAIN_DIR}`);
  console.log(`Destination: ${BACKUP_ROOT}\n`);

  const entries = fs.readdirSync(BRAIN_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== 'tempmediaStorage');

  const conversationList = [];

  for (const entry of entries) {
    const convoId = entry.name;
    const convoDir = path.join(BRAIN_DIR, convoId);
    const transcriptPath = path.join(convoDir, '.system_generated', 'logs', 'transcript.jsonl');
    const fullTranscriptPath = path.join(convoDir, '.system_generated', 'logs', 'transcript_full.jsonl');

    if (!fs.existsSync(transcriptPath)) continue;

    const stats = fs.statSync(transcriptPath);
    const parsed = await parseTranscript(transcriptPath);

    // Only backup conversations that relate to co-pilot or have user messages
    if (!parsed.workspaceMatch && parsed.messages.length === 0) continue;

    const dateStr = formatDate(stats.mtime);
    const safeTitle = sanitizeFilename(parsed.firstUserRequest || 'conversation');
    const readableFilename = `${dateStr}_${convoId.substring(0, 8)}_${safeTitle}.md`;

    // 1. Generate Clean Readable Markdown
    let md = `# Conversation Backup: ${parsed.firstUserRequest || convoId}\n\n`;
    md += `- **Conversation ID**: \`${convoId}\`\n`;
    md += `- **Date**: ${stats.mtime.toLocaleString()}\n`;
    md += `- **Total Messages**: ${parsed.messages.length}\n`;
    md += `- **Raw Logs Folder**: [View Raw Logs](../raw/${convoId}/)\n`;
    if (parsed.filesTouched.length > 0) {
      md += `- **Files Modified / Touched** (${parsed.filesTouched.length}):\n`;
      parsed.filesTouched.forEach(f => {
        md += `  - \`${f}\`\n`;
      });
    }
    md += `\n---\n\n`;

    for (const msg of parsed.messages) {
      const timestamp = msg.time ? new Date(msg.time).toLocaleString() : '';
      if (msg.role === 'User') {
        md += `### 👤 User (${timestamp})\n\n`;
        md += `${msg.content}\n\n`;
      } else {
        md += `### 🤖 Assistant (${timestamp})\n\n`;
        if (msg.content) {
          md += `${msg.content}\n\n`;
        }
        if (msg.tools && msg.tools.length > 0) {
          md += `<details><summary>🔧 <b>Actions Taken (${msg.tools.length})</b></summary>\n\n`;
          for (const t of msg.tools) {
            let act = `- **${t.name}**`;
            if (t.summary) act += ` *[${t.summary}]*`;
            if (t.target) act += ` → \`${t.target}\``;
            if (t.command) act += ` \`${t.command}\``;
            md += `${act}\n`;
          }
          md += `\n</details>\n\n`;
        }
      }
      md += `---\n\n`;
    }

    fs.writeFileSync(path.join(READABLE_DIR, readableFilename), md, 'utf8');

    // 2. Backup Raw Logs
    const targetRawDir = path.join(RAW_DIR, convoId);
    if (!fs.existsSync(targetRawDir)) fs.mkdirSync(targetRawDir, { recursive: true });
    fs.copyFileSync(transcriptPath, path.join(targetRawDir, 'transcript.jsonl'));
    if (fs.existsSync(fullTranscriptPath)) {
      fs.copyFileSync(fullTranscriptPath, path.join(targetRawDir, 'transcript_full.jsonl'));
    }

    // 3. Backup any user-facing artifacts or markdown files in the root of the brain folder
    const brainFiles = fs.readdirSync(convoDir, { withFileTypes: true });
    for (const bf of brainFiles) {
      if (bf.isFile() && (bf.name.endsWith('.md') || bf.name.endsWith('.txt') || bf.name.endsWith('.json'))) {
        const targetArtifactDir = path.join(ARTIFACTS_DIR, convoId);
        if (!fs.existsSync(targetArtifactDir)) fs.mkdirSync(targetArtifactDir, { recursive: true });
        fs.copyFileSync(path.join(convoDir, bf.name), path.join(targetArtifactDir, bf.name));
      }
    }

    conversationList.push({
      id: convoId,
      date: stats.mtime,
      readableFile: readableFilename,
      userPrompt: parsed.firstUserRequest || 'No initial prompt',
      messageCount: parsed.messages.length,
      filesCount: parsed.filesTouched.length
    });
  }

  // Sort newest first
  conversationList.sort((a, b) => b.date - a.date);

  // 4. Generate Master INDEX.md
  let indexMd = `# 📂 Conversation Backups Archive\n\n`;
  indexMd += `> **Backup Date:** ${new Date().toLocaleString()}  \n`;
  indexMd += `> **Total Conversations Archived:** ${conversationList.length}  \n`;
  indexMd += `> **Location:** \`backups/conversations/\`  \n\n`;
  indexMd += `### 📁 Directory Layout\n`;
  indexMd += `- **\`readable/\`**: Fully formatted, readable Markdown transcripts of each chat session.\n`;
  indexMd += `- **\`raw/\`**: Complete raw JSONL transcript logs (\`transcript.jsonl\` and \`transcript_full.jsonl\`) for programmatic recovery or tool analysis.\n`;
  indexMd += `- **\`artifacts/\`**: Saved session plans, notes, and generated artifacts.\n\n`;
  indexMd += `### 🔄 How to Run Fresh Backups\n`;
  indexMd += `You can refresh and update this archive at any time by running:\n`;
  indexMd += `\`\`\`bash\nnpm run backup:conversations\n\`\`\`\n\n`;
  indexMd += `## 📜 Conversations Index (Chronological, Newest First)\n\n`;
  indexMd += `| Date & Time | Summary / First Request | Messages | Files Modified | Readable Transcript | Raw Logs |\n`;
  indexMd += `| :--- | :--- | :---: | :---: | :--- | :--- |\n`;

  for (const c of conversationList) {
    const dateFormatted = c.date.toISOString().replace('T', ' ').substring(0, 16);
    const titleEscaped = c.userPrompt.replace(/\|/g, '\\|');
    indexMd += `| ${dateFormatted} | ${titleEscaped} | ${c.messageCount} | ${c.filesCount} | [📖 Read](readable/${encodeURIComponent(c.readableFile)}) | [📁 Raw Logs](raw/${c.id}) |\n`;
  }

  fs.writeFileSync(path.join(BACKUP_ROOT, 'INDEX.md'), indexMd, 'utf8');
  fs.writeFileSync(path.join(BACKUP_ROOT, 'README.md'), indexMd, 'utf8');

  console.log(`\n✅ Backup complete!`);
  console.log(`Archived ${conversationList.length} conversations to ${BACKUP_ROOT}`);
  console.log(`Index generated: ${path.join(BACKUP_ROOT, 'INDEX.md')}`);
}

runBackup().catch(err => {
  console.error('Backup failed:', err);
  process.exit(1);
});
