import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, "..");
const SOURCE_DIR = process.env.PROMPT_ASSETS_SOURCE || path.join(ROOT_DIR, "..", "提示词资产");
const TARGET_DIR = path.join(ROOT_DIR, "site", "public", "prompt-assets");
const MANIFEST_PATH = path.join(ROOT_DIR, "site", "content", "prompt-gallery.json");
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function resetDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  ensureDir(dirPath);
}

function cleanText(raw) {
  return String(raw || "").replace(/^\uFEFF/, "").trim();
}

function slugify(name, index) {
  const ascii = name
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const prefix = String(index + 1).padStart(2, "0");
  return ascii ? `${prefix}-${ascii}` : `collection-${prefix}`;
}

function uniqueStrings(values, limit = 4) {
  const result = [];

  for (const value of values) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed || result.includes(trimmed)) continue;
    result.push(trimmed);
    if (result.length >= limit) break;
  }

  return result;
}

function chooseCoverImage(images) {
  return [...images].sort((left, right) => {
    const leftPenalty = /gemini/i.test(left.name) ? 1 : 0;
    const rightPenalty = /gemini/i.test(right.name) ? 1 : 0;

    if (leftPenalty !== rightPenalty) {
      return leftPenalty - rightPenalty;
    }

    return right.size - left.size;
  })[0] || null;
}

function readPromptFile(filePath) {
  const raw = cleanText(fs.readFileSync(filePath, "utf8"));

  try {
    return {
      raw,
      json: JSON.parse(raw)
    };
  } catch {
    return {
      raw,
      json: null
    };
  }
}

function summarizePrompt(folderName, promptJson, images) {
  if (promptJson?.image_type) {
    const moods = Array.isArray(promptJson.atmosphere?.mood)
      ? promptJson.atmosphere.mood.slice(0, 3).join(" / ")
      : "多视图人像表达";

    return {
      title: folderName,
      headline: promptJson.subject?.style || promptJson.image_type || folderName,
      description: `围绕 ${promptJson.image_type || "视觉生成"} 构建的多视图提示词，强调 ${promptJson.photography?.type || "人物摄影"}、${promptJson.composition?.layout || "结构化排版"} 和 ${moods}。`,
      highlights: uniqueStrings([
        promptJson.image_type,
        promptJson.photography?.type,
        promptJson.composition?.layout,
        promptJson.composition?.aspect_ratio,
        promptJson.lighting?.style
      ]),
      metrics: [
        { label: "样例图片", value: `${images.length} 张` },
        { label: "输出比例", value: promptJson.composition?.aspect_ratio || "未注明" },
        { label: "结构模块", value: `${Object.keys(promptJson).length} 项` }
      ]
    };
  }

  if (promptJson?.task?.name) {
    const expressionCount = Array.isArray(promptJson.deconstruction?.expression_set?.expressions)
      ? promptJson.deconstruction.expression_set.expressions.length
      : "多";

    return {
      title: folderName,
      headline: promptJson.task.name,
      description: `以 ${promptJson.visual_specification?.layout?.type || "角色拆解"} 为骨架，组合服装分层、表情集、材质特写和生活化道具，适合概念设计作品集展示。`,
      highlights: uniqueStrings([
        promptJson.task.name,
        promptJson.visual_specification?.layout?.type,
        promptJson.art_style?.type,
        promptJson.output?.format
      ]),
      metrics: [
        { label: "样例图片", value: `${images.length} 张` },
        { label: "表情维度", value: `${expressionCount} 组` },
        { label: "结构模块", value: `${Object.keys(promptJson).length} 项` }
      ]
    };
  }

  return {
    title: folderName,
    headline: folderName,
    description: "一组已同步到项目中的提示词与成图素材。",
    highlights: uniqueStrings([folderName, `${images.length} 张样例图`]),
    metrics: [
      { label: "样例图片", value: `${images.length} 张` },
      { label: "结构模块", value: promptJson ? `${Object.keys(promptJson).length} 项` : "未解析" }
    ]
  };
}

function buildCollection(sourceDirPath, folderName, index) {
  const slug = slugify(folderName, index);
  const targetDirPath = path.join(TARGET_DIR, slug);
  ensureDir(targetDirPath);

  const entries = fs.readdirSync(sourceDirPath, { withFileTypes: true });
  const images = [];
  const promptFiles = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const sourceFilePath = path.join(sourceDirPath, entry.name);
    const extension = path.extname(entry.name).toLowerCase();
    if (IMAGE_EXTENSIONS.has(extension)) {
      const targetFilePath = path.join(targetDirPath, entry.name);
      fs.copyFileSync(sourceFilePath, targetFilePath);
      const stat = fs.statSync(sourceFilePath);
      images.push({
        name: entry.name,
        size: stat.size,
        url: `/prompt-assets/${slug}/${encodeURIComponent(entry.name)}`
      });
      continue;
    }

    if (extension === ".txt") {
      promptFiles.push({
        name: entry.name,
        ...readPromptFile(sourceFilePath)
      });
    }
  }

  const jsonPrompt = promptFiles.find((item) => item.json) || null;
  const textPrompt = promptFiles.find((item) => !item.json) || promptFiles[0] || null;
  const coverImage = chooseCoverImage(images);
  const summary = summarizePrompt(folderName, jsonPrompt?.json, images);

  return {
    id: slug,
    slug,
    folderName,
    title: summary.title,
    headline: summary.headline,
    description: summary.description,
    highlights: summary.highlights,
    metrics: summary.metrics,
    coverImage: coverImage?.url || "",
    images: images.map(({ size, ...image }) => image),
    imageCount: images.length,
    promptText: textPrompt?.raw || "",
    promptTextName: textPrompt?.name || "",
    promptJson: jsonPrompt?.json || null,
    promptJsonRaw: jsonPrompt?.raw || "",
    promptJsonName: jsonPrompt?.name || "",
    updatedAt: new Date().toISOString()
  };
}

function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    throw new Error(`Prompt asset source directory not found: ${SOURCE_DIR}`);
  }

  ensureDir(path.dirname(MANIFEST_PATH));
  resetDir(TARGET_DIR);

  const folders = fs.readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, "zh-CN"));

  const collections = folders.map((folderName, index) => (
    buildCollection(path.join(SOURCE_DIR, folderName), folderName, index)
  ));

  const manifest = {
    generatedAt: new Date().toISOString(),
    collectionCount: collections.length,
    collections
  };

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(`Synced ${collections.length} prompt collections.`);
  console.log(`Manifest written to ${MANIFEST_PATH}`);
}

main();
