import fs from "fs";
import path from "path";

const root = process.cwd();
const summary = process.argv.slice(2).join(" ").trim();

if (!summary) {
  console.error('请提供本次任务摘要，例如：npm run ai:checkpoint -- "完成首页文案调整"');
  process.exit(1);
}

const now = new Date();
const date = now.toISOString().slice(0, 10);
const time = now.toISOString().replace("T", " ").slice(0, 16);

const memoryPath = path.join(root, "memory", "project-memory.md");
const logPath = path.join(root, "memory", "work-log.md");

if (!fs.existsSync(memoryPath) || !fs.existsSync(logPath)) {
  console.error("找不到记忆文件，请先确认 memory 目录已初始化。");
  process.exit(1);
}

let memoryText = fs.readFileSync(memoryPath, "utf8");
const latestBlock = [
  "<!-- LAST_TASK_START -->",
  `- 时间：${date}`,
  `- 摘要：${summary}`,
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

console.log("项目记忆已更新：");
console.log(`- 最近一次任务：${summary}`);
console.log(`- 工作记录时间：${time}`);
