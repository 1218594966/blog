import fs from "fs";
import path from "path";

const root = process.cwd();
const summary = process.argv.slice(2).join(" ").trim();

if (!summary) {
  console.error('请提供任务摘要，例如：npm run ai:start -- "优化首页结构"');
  process.exit(1);
}

const currentTaskPath = path.join(root, "memory", "current-task.md");
const now = new Date().toISOString().replace("T", " ").slice(0, 16);

const content = `# Current Task

- Status: in_progress
- Started At: ${now}
- Last Updated: ${now}
- Summary: ${summary}

## Required Read Order

1. \`agent.md\`
2. \`memory/current-task.md\`
3. \`memory/project-memory.md\`
4. \`memory/work-log.md\`
5. \`docs/ARCHITECTURE.md\`
6. \`docs/ROADMAP.md\`

## Execution Checklist

- read required context
- inspect relevant code
- implement changes
- validate changes
- run \`npm run ai:finish -- "completed summary"\`
`;

fs.writeFileSync(currentTaskPath, content, "utf8");

console.log("当前任务已初始化：");
console.log(`- Summary: ${summary}`);
console.log(`- Started At: ${now}`);
