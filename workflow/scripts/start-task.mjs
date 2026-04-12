import fs from "fs";
import path from "path";

const root = process.cwd();
const summary = process.argv.slice(2).join(" ").trim();

if (!summary) {
  console.error('请提供任务摘要，例如：npm run ai:start -- "优化首页结构"');
  process.exit(1);
}

const currentTaskPath = path.join(root, "workflow", "memory", "current-task.md");
const now = new Date().toISOString().replace("T", " ").slice(0, 16);

const content = `# Current Task

- Status: in_progress
- Started At: ${now}
- Last Updated: ${now}
- Summary: ${summary}

## Required Read Order

1. \`workflow/agent.md\`
2. \`workflow/memory/current-task.md\`
3. \`workflow/memory/project-memory.md\`
4. \`workflow/memory/work-log.md\`
5. \`workflow/docs/ARCHITECTURE.md\`
6. \`workflow/docs/ROADMAP.md\`
`;

fs.writeFileSync(currentTaskPath, content, "utf8");

console.log("当前任务已初始化：");
console.log(`- Summary: ${summary}`);
console.log(`- Started At: ${now}`);
