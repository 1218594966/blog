import fs from "fs";
import path from "path";

const root = process.cwd();
const files = [
  "AGENTS.md",
  "workflow/agent.md",
  "workflow/memory/current-task.md",
  "workflow/memory/project-memory.md",
  "workflow/memory/work-log.md",
  "workflow/docs/ARCHITECTURE.md",
  "workflow/docs/ROADMAP.md"
];

for (const relativePath of files) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) continue;

  const content = fs.readFileSync(fullPath, "utf8").trim();
  console.log(`\n===== ${relativePath} =====\n`);
  console.log(content);
  console.log("\n");
}
