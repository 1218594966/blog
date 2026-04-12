import fs from "fs";
import path from "path";

const root = process.cwd();
const files = [
  "agent.md",
  "memory/project-memory.md",
  "memory/work-log.md",
  "docs/ARCHITECTURE.md",
  "docs/ROADMAP.md"
];

for (const relativePath of files) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) continue;

  const content = fs.readFileSync(fullPath, "utf8").trim();
  console.log(`\n===== ${relativePath} =====\n`);
  console.log(content);
  console.log("\n");
}
