import fs from "fs";
import path from "path";

const root = process.cwd();
const summary = process.argv.slice(2).join(" ").trim();

if (!summary) {
  console.error('请提供本次任务摘要，例如：npm run ai:finish -- "完成首页文案调整"');
  process.exit(1);
}

const now = new Date();
const date = now.toISOString().slice(0, 10);
const time = now.toISOString().replace("T", " ").slice(0, 16);

const currentTaskPath = path.join(root, "workflow", "memory", "current-task.md");
const memoryPath = path.join(root, "workflow", "memory", "project-memory.md");
const logPath = path.join(root, "workflow", "memory", "work-log.md");

for (const filePath of [currentTaskPath, memoryPath, logPath]) {
  if (!fs.existsSync(filePath)) {
    console.error(`找不到文件：${filePath}`);
    process.exit(1);
  }
}

const currentTask = `# Current Task

- Status: completed
- Started At: archived in work-log
- Last Updated: ${time}
- Summary: ${summary}

## Required Read Order

1. \`workflow/agent.md\`
2. \`workflow/memory/current-task.md\`
3. \`workflow/memory/project-memory.md\`
4. \`workflow/memory/work-log.md\`
5. \`workflow/docs/ARCHITECTURE.md\`
6. \`workflow/docs/ROADMAP.md\`
`;

fs.writeFileSync(currentTaskPath, currentTask, "utf8");

let memoryText = fs.readFileSync(memoryPath, "utf8");
const latestBlock = [
  "<!-- LAST_TASK_START -->",
  `- Date: ${date}`,
  `- Summary: ${summary}`,
  "<!-- LAST_TASK_END -->"
].join("\n");

memoryText = memoryText.replace(
  /<!-- LAST_TASK_START -->[\s\S]*?<!-- LAST_TASK_END -->/,
  latestBlock
);

fs.writeFileSync(memoryPath, memoryText, "utf8");

let logText = fs.readFileSync(logPath, "utf8").trimEnd();
logText += `\n\n## ${time}\n\n- ${summary}\n`;
fs.writeFileSync(logPath, `${logText}\n`, "utf8");

console.log("任务记忆已更新：");
console.log(`- 完成摘要：${summary}`);
console.log(`- 完成时间：${time}`);
