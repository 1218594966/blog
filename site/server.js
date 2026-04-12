const express = require("express");
const fs = require("fs");
const path = require("path");
const { createHmac, randomUUID, timingSafeEqual } = require("crypto");

const ROOT_DIR = path.join(__dirname, "..");

loadEnvFile();

const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const EXTENSIONS_DIR = path.join(ROOT_DIR, "extensions");
const ADMIN_LOGIN_PATH = path.join(PUBLIC_DIR, "admin-login.html");
const DEFAULT_CONTENT_PATH = path.join(__dirname, "content", "site-content.json");
const DEFAULT_MESSAGES_PATH = path.join(__dirname, "content", "messages.json");
const DEFAULT_AI_CONFIG_PATH = path.join(__dirname, "content", "ai-config.json");
const STORAGE_DIR = path.join(ROOT_DIR, "storage");
const CONTENT_PATH = path.join(STORAGE_DIR, "site-content.json");
const MESSAGES_PATH = path.join(STORAGE_DIR, "messages.json");
const AI_CONFIG_PATH = path.join(STORAGE_DIR, "ai-config.json");
const AI_PRIVATE_CONFIG_PATH = path.join(STORAGE_DIR, "ai-config.private.json");
const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "change-this-password";
const DEFAULT_SESSION_SECRET = "change-this-session-secret";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET || DEFAULT_SESSION_SECRET;
const SESSION_COOKIE_NAME = "personblog_admin";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

const rateLimitBuckets = new Map();

function loadEnvFile() {
  const envPath = path.join(ROOT_DIR, ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function safeEqualStrings(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || "unknown";
}

function cleanupRateLimitBucket(bucket, windowMs, now) {
  bucket.timestamps = bucket.timestamps.filter((timestamp) => now - timestamp < windowMs);
}

function createRateLimit({ keyPrefix, limit, windowMs, message }) {
  return (req, res, next) => {
    const now = Date.now();
    const key = `${keyPrefix}:${getClientIp(req)}`;
    const bucket = rateLimitBuckets.get(key) || { timestamps: [] };

    cleanupRateLimitBucket(bucket, windowMs, now);

    if (bucket.timestamps.length >= limit) {
      const retryAfterSeconds = Math.ceil(windowMs / 1000);
      res.set("Retry-After", String(retryAfterSeconds));

      if (req.path.startsWith("/api/")) {
        return res.status(429).json({ error: message });
      }

      return res.status(429).send(message);
    }

    bucket.timestamps.push(now);
    rateLimitBuckets.set(key, bucket);
    return next();
  };
}

function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((accumulator, item) => {
      const separatorIndex = item.indexOf("=");
      if (separatorIndex === -1) return accumulator;
      const key = item.slice(0, separatorIndex);
      const value = item.slice(separatorIndex + 1);
      accumulator[key] = decodeURIComponent(value);
      return accumulator;
    }, {});
}

function signSessionPayload(payload) {
  return createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
}

function createSessionToken() {
  const payload = `admin:${Date.now()}`;
  const signature = signSessionPayload(payload);
  return `${Buffer.from(payload, "utf8").toString("base64url")}.${signature}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== "string") return false;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;

  let payload = "";
  try {
    payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
  } catch {
    return false;
  }

  const expectedSignature = signSessionPayload(payload);
  if (!safeEqualStrings(signature, expectedSignature)) return false;

  const [role, timestampValue] = payload.split(":");
  const timestamp = Number(timestampValue);
  if (role !== "admin" || Number.isNaN(timestamp)) return false;

  const sessionAge = Date.now() - timestamp;
  return sessionAge >= 0 && sessionAge <= SESSION_MAX_AGE_SECONDS * 1000;
}

function isAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie || "");
  return verifySessionToken(cookies[SESSION_COOKIE_NAME]);
}

function isSecureRequest(req) {
  if (req.secure) return true;
  return String(req.headers["x-forwarded-proto"] || "").toLowerCase() === "https";
}

function setAdminSession(req, res) {
  const token = createSessionToken();
  const cookieParts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax"
  ];

  if (isSecureRequest(req)) {
    cookieParts.push("Secure");
  }

  res.setHeader(
    "Set-Cookie",
    cookieParts.join("; ")
  );
}

function clearAdminSession(req, res) {
  const cookieParts = [
    `${SESSION_COOKIE_NAME}=`,
    "Max-Age=0",
    "Path=/",
    "HttpOnly",
    "SameSite=Lax"
  ];

  if (isSecureRequest(req)) {
    cookieParts.push("Secure");
  }

  res.setHeader(
    "Set-Cookie",
    cookieParts.join("; ")
  );
}

function requireAdminAuth(req, res, next) {
  if (isAuthenticated(req)) {
    return next();
  }

  if (req.path.startsWith("/api/")) {
    return res.status(401).json({ error: "请先登录后台" });
  }

  return res.redirect("/admin-login");
}

app.use((req, res, next) => {
  const protectedStaticPaths = new Set([
    "/admin.html",
    "/assets/admin.js",
    "/assets/admin.css"
  ]);

  if (protectedStaticPaths.has(req.path) && !isAuthenticated(req)) {
    return res.redirect("/admin-login");
  }

  return next();
});

app.get(["/", "/index.html"], (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.type("html").send(renderIndexHtml());
});

app.get("/tools", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(EXTENSIONS_DIR, "tools", "index.html"));
});

app.get("/projects", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(EXTENSIONS_DIR, "projects", "index.html"));
});

app.get("/lab", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(EXTENSIONS_DIR, "lab", "index.html"));
});

app.use(express.static(PUBLIC_DIR));

function ensureJsonFile(filePath, fallbackValue, seedFilePath) {
  const dirPath = path.dirname(filePath);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    if (seedFilePath && fs.existsSync(seedFilePath)) {
      fs.copyFileSync(seedFilePath, filePath);
      return;
    }

    fs.writeFileSync(filePath, `${JSON.stringify(fallbackValue, null, 2)}\n`, "utf8");
  }
}

function readJson(filePath, fallbackValue, seedFilePath) {
  ensureJsonFile(filePath, fallbackValue, seedFilePath);
  const raw = fs.readFileSync(filePath, "utf8").trim();

  if (!raw) {
    return fallbackValue;
  }

  return JSON.parse(raw);
}

function writeJson(filePath, data) {
  ensureJsonFile(filePath, data);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function serializeForInlineScript(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function renderIndexHtml() {
  const templatePath = path.join(PUBLIC_DIR, "index.html");
  const template = fs.readFileSync(templatePath, "utf8");
  const content = readJson(CONTENT_PATH, {}, DEFAULT_CONTENT_PATH);
  const siteName = content?.site?.name || "PersonBlog";
  const siteLogo = content?.site?.logo || "PB";
  const siteTitleSuffix = content?.site?.titleSuffix || "个人主页";
  const siteDescription = content?.site?.description || "";
  const siteTitle = `${siteName} | ${siteTitleSuffix}`;

  return template
    .replaceAll("__SITE_TITLE__", escapeHtml(siteTitle))
    .replaceAll("__SITE_DESCRIPTION__", escapeHtml(siteDescription))
    .replaceAll("__SITE_LOGO__", escapeHtml(siteLogo))
    .replaceAll("__SITE_NAME__", escapeHtml(siteName))
    .replace("__INITIAL_SITE_CONTENT_JSON__", serializeForInlineScript(content));
}

function defaultPrivateAiConfig() {
  return {
    apiKey: ""
  };
}

function ensureRuntimeStorage() {
  readJson(CONTENT_PATH, {}, DEFAULT_CONTENT_PATH);
  readJson(MESSAGES_PATH, [], DEFAULT_MESSAGES_PATH);
  readJson(AI_CONFIG_PATH, defaultAiConfig(), DEFAULT_AI_CONFIG_PATH);
  readJson(AI_PRIVATE_CONFIG_PATH, defaultPrivateAiConfig());
  migrateLegacyAiApiKey();
}

function validateContentShape(data) {
  const requiredKeys = [
    "site",
    "navigation",
    "hero",
    "stats",
    "about",
    "projects",
    "experience",
    "blog",
    "testimonials",
    "contact",
    "footer"
  ];

  return requiredKeys.every((key) => Object.prototype.hasOwnProperty.call(data, key));
}

function normalizeMessagePayload(body) {
  return {
    name: typeof body.name === "string" ? body.name.trim() : "",
    email: typeof body.email === "string" ? body.email.trim() : "",
    projectType: typeof body.projectType === "string" ? body.projectType.trim() : "",
    message: typeof body.message === "string" ? body.message.trim() : ""
  };
}

function defaultAiConfig() {
  return {
    enabled: true,
    sectionTitle: "AI 对话",
    sectionDescription: "这里可以接入 OpenAI 兼容模型。配置好接口地址后，网站会自动读取模型列表并支持直接对话。",
    baseUrl: "",
    apiKey: "",
    model: "",
    systemPrompt: "你是一位友好、清晰、务实的中文 AI 助手。",
    placeholder: "想问点什么？比如：帮我总结一下最近值得关注的 AI 工具趋势。",
    temperature: 0.7,
    maxTokens: 800
  };
}

function readAiConfig() {
  const publicConfig = readJson(AI_CONFIG_PATH, defaultAiConfig(), DEFAULT_AI_CONFIG_PATH);
  const privateConfig = readJson(AI_PRIVATE_CONFIG_PATH, defaultPrivateAiConfig());

  return {
    ...defaultAiConfig(),
    ...publicConfig,
    apiKey: typeof privateConfig.apiKey === "string" ? privateConfig.apiKey.trim() : ""
  };
}

function writeAiConfig(config) {
  const nextConfig = {
    ...defaultAiConfig(),
    ...config,
    apiKey: typeof config.apiKey === "string" ? config.apiKey.trim() : ""
  };

  const publicConfig = {
    enabled: Boolean(nextConfig.enabled),
    sectionTitle: nextConfig.sectionTitle,
    sectionDescription: nextConfig.sectionDescription,
    baseUrl: nextConfig.baseUrl,
    apiKey: "",
    model: nextConfig.model,
    systemPrompt: nextConfig.systemPrompt,
    placeholder: nextConfig.placeholder,
    temperature: nextConfig.temperature,
    maxTokens: nextConfig.maxTokens
  };

  writeJson(AI_CONFIG_PATH, publicConfig);
  writeJson(AI_PRIVATE_CONFIG_PATH, { apiKey: nextConfig.apiKey });
}

function migrateLegacyAiApiKey() {
  const publicConfig = readJson(AI_CONFIG_PATH, defaultAiConfig(), DEFAULT_AI_CONFIG_PATH);
  const privateConfig = readJson(AI_PRIVATE_CONFIG_PATH, defaultPrivateAiConfig());
  const legacyKey = typeof publicConfig.apiKey === "string" ? publicConfig.apiKey.trim() : "";

  if (!legacyKey) {
    return;
  }

  if (!privateConfig.apiKey) {
    writeJson(AI_PRIVATE_CONFIG_PATH, { apiKey: legacyKey });
  }

  writeJson(AI_CONFIG_PATH, {
    ...defaultAiConfig(),
    ...publicConfig,
    apiKey: ""
  });
}

function normalizeAiBaseUrl(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";

  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("模型接口地址不是有效的 URL");
  }

  let pathname = url.pathname.replace(/\/+$/, "");

  if (!pathname || pathname === "") {
    pathname = "/v1";
  }

  if (pathname.endsWith("/chat/completions")) {
    pathname = pathname.slice(0, -"/chat/completions".length);
  } else if (pathname.endsWith("/models")) {
    pathname = pathname.slice(0, -"/models".length);
  }

  if (!pathname || pathname === "") {
    pathname = "/v1";
  }

  url.pathname = pathname;
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/+$/, "");
}

function buildAiHeaders(apiKey) {
  const headers = {
    "Content-Type": "application/json"
  };

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  return headers;
}

function sanitizeAiConfigForClient(config) {
  return {
    enabled: Boolean(config.enabled),
    sectionTitle: config.sectionTitle || defaultAiConfig().sectionTitle,
    sectionDescription: config.sectionDescription || defaultAiConfig().sectionDescription,
    model: config.model || "",
    placeholder: config.placeholder || defaultAiConfig().placeholder
  };
}

async function fetchAiModels(baseUrl, apiKey) {
  const normalizedBaseUrl = normalizeAiBaseUrl(baseUrl);
  const response = await fetch(`${normalizedBaseUrl}/models`, {
    method: "GET",
    headers: buildAiHeaders(apiKey)
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error?.message || result.error || "获取模型列表失败");
  }

  const models = Array.isArray(result.data)
    ? result.data
      .map((item) => item?.id)
      .filter((item) => typeof item === "string" && item.trim())
    : [];

  return {
    baseUrl: normalizedBaseUrl,
    models
  };
}

function buildAiMessages(systemPrompt, messages) {
  const normalizedMessages = Array.isArray(messages)
    ? messages
      .filter((item) => item && typeof item.role === "string" && typeof item.content === "string")
      .map((item) => ({
        role: item.role,
        content: item.content.trim()
      }))
      .filter((item) => item.content)
    : [];

  if (systemPrompt) {
    return [
      { role: "system", content: systemPrompt },
      ...normalizedMessages
    ];
  }

  return normalizedMessages;
}

function extractAssistantText(payload) {
  const content = payload?.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item?.text === "string" ? item.text : ""))
      .join("")
      .trim();
  }

  return "";
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/api/content", (_req, res) => {
  try {
    res.json(readJson(CONTENT_PATH, {}, DEFAULT_CONTENT_PATH));
  } catch (error) {
    res.status(500).json({ error: "读取内容失败", detail: error.message });
  }
});

app.get("/api/ai/config", requireAdminAuth, (_req, res) => {
  try {
    return res.json(readAiConfig());
  } catch (error) {
    return res.status(500).json({ error: "读取 AI 配置失败", detail: error.message });
  }
});

app.get("/api/ai/public-config", (_req, res) => {
  try {
    const config = readAiConfig();
    return res.json(sanitizeAiConfigForClient(config));
  } catch (error) {
    return res.status(500).json({ error: "读取 AI 配置失败", detail: error.message });
  }
});

app.put("/api/ai/config", requireAdminAuth, createRateLimit({
  keyPrefix: "ai-config-save",
  limit: 20,
  windowMs: 60 * 1000,
  message: "保存过于频繁，请稍后再试"
}), (req, res) => {
  try {
    const incoming = req.body;
    const nextConfig = {
      ...defaultAiConfig(),
      ...incoming,
      baseUrl: incoming.baseUrl ? normalizeAiBaseUrl(incoming.baseUrl) : "",
      apiKey: typeof incoming.apiKey === "string" ? incoming.apiKey.trim() : "",
      model: typeof incoming.model === "string" ? incoming.model.trim() : "",
      systemPrompt: typeof incoming.systemPrompt === "string" ? incoming.systemPrompt.trim() : defaultAiConfig().systemPrompt,
      placeholder: typeof incoming.placeholder === "string" ? incoming.placeholder.trim() : defaultAiConfig().placeholder,
      sectionTitle: typeof incoming.sectionTitle === "string" ? incoming.sectionTitle.trim() : defaultAiConfig().sectionTitle,
      sectionDescription: typeof incoming.sectionDescription === "string" ? incoming.sectionDescription.trim() : defaultAiConfig().sectionDescription,
      temperature: Number.isFinite(Number(incoming.temperature)) ? Number(incoming.temperature) : defaultAiConfig().temperature,
      maxTokens: Number.isFinite(Number(incoming.maxTokens)) ? Number(incoming.maxTokens) : defaultAiConfig().maxTokens,
      enabled: Boolean(incoming.enabled)
    };

    writeAiConfig(nextConfig);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "保存 AI 配置失败", detail: error.message });
  }
});

app.post("/api/ai/models/test", requireAdminAuth, createRateLimit({
  keyPrefix: "ai-models-test",
  limit: 20,
  windowMs: 60 * 1000,
  message: "读取模型列表过于频繁，请稍后再试"
}), async (req, res) => {
  try {
    const baseUrl = typeof req.body.baseUrl === "string" ? req.body.baseUrl : "";
    const apiKey = typeof req.body.apiKey === "string" ? req.body.apiKey.trim() : "";
    const result = await fetchAiModels(baseUrl, apiKey);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message || "获取模型列表失败" });
  }
});

app.get("/api/ai/models", createRateLimit({
  keyPrefix: "ai-models-public",
  limit: 30,
  windowMs: 60 * 1000,
  message: "读取模型列表过于频繁，请稍后再试"
}), async (_req, res) => {
  try {
    const config = readAiConfig();
    if (!config.enabled) {
      return res.status(400).json({ error: "AI 对话区当前未启用" });
    }

    if (!config.baseUrl || !config.apiKey) {
      return res.status(400).json({ error: "AI 接口尚未配置完整" });
    }

    const result = await fetchAiModels(config.baseUrl, config.apiKey);
    return res.json({
      ...result,
      selectedModel: config.model || ""
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "获取模型列表失败" });
  }
});

app.put("/api/content", requireAdminAuth, createRateLimit({
  keyPrefix: "content-save",
  limit: 20,
  windowMs: 60 * 1000,
  message: "保存过于频繁，请稍后再试"
}), (req, res) => {
  try {
    const nextContent = req.body;

    if (!nextContent || typeof nextContent !== "object" || Array.isArray(nextContent)) {
      return res.status(400).json({ error: "提交内容格式不正确" });
    }

    if (!validateContentShape(nextContent)) {
      return res.status(400).json({ error: "站点内容缺少必要字段，保存已取消" });
    }

    writeJson(CONTENT_PATH, nextContent);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "保存内容失败", detail: error.message });
  }
});

app.get("/api/messages", requireAdminAuth, (_req, res) => {
  try {
    const messages = readJson(MESSAGES_PATH, [], DEFAULT_MESSAGES_PATH);
    return res.json([...messages].reverse());
  } catch (error) {
    return res.status(500).json({ error: "读取留言失败", detail: error.message });
  }
});

app.post("/api/contact", createRateLimit({
  keyPrefix: "contact-submit",
  limit: 6,
  windowMs: 10 * 60 * 1000,
  message: "提交过于频繁，请稍后再试"
}), (req, res) => {
  try {
    const payload = normalizeMessagePayload(req.body);

    if (!payload.name || !payload.email || !payload.message) {
      return res.status(400).json({ error: "请完整填写姓名、邮箱和留言内容" });
    }

    const messages = readJson(MESSAGES_PATH, [], DEFAULT_MESSAGES_PATH);
    messages.push({
      id: randomUUID(),
      ...payload,
      createdAt: new Date().toISOString()
    });
    writeJson(MESSAGES_PATH, messages);

    return res.json({ ok: true, message: "留言已收到，我会尽快联系你。" });
  } catch (error) {
    return res.status(500).json({ error: "留言提交失败", detail: error.message });
  }
});

app.post("/api/ai/chat", createRateLimit({
  keyPrefix: "ai-chat",
  limit: 20,
  windowMs: 60 * 1000,
  message: "AI 对话请求过于频繁，请稍后再试"
}), async (req, res) => {
  try {
    const config = readAiConfig();
    const requestedModel = typeof req.body.model === "string" ? req.body.model.trim() : "";
    const finalModel = requestedModel || config.model;
    if (!config.enabled) {
      return res.status(400).json({ error: "AI 对话区当前未启用" });
    }

    if (!config.baseUrl || !config.apiKey || !finalModel) {
      return res.status(400).json({ error: "AI 对话尚未配置完整，请先在后台填写接口地址、密钥和模型。" });
    }

    const messages = buildAiMessages(config.systemPrompt, req.body.messages);
    if (!messages.length) {
      return res.status(400).json({ error: "至少需要一条有效消息" });
    }

    const response = await fetch(`${normalizeAiBaseUrl(config.baseUrl)}/chat/completions`, {
      method: "POST",
      headers: buildAiHeaders(config.apiKey),
      body: JSON.stringify({
        model: finalModel,
        messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens
      })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(500).json({
        error: result.error?.message || result.error || "模型调用失败"
      });
    }

    const text = extractAssistantText(result);
    return res.json({
      ok: true,
      text: text || "模型已返回结果，但没有解析到可显示的文本内容。",
      raw: result
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "模型调用失败" });
  }
});

app.get("/admin-login", (req, res) => {
  if (isAuthenticated(req)) {
    return res.redirect("/admin");
  }

  return res.sendFile(ADMIN_LOGIN_PATH);
});

app.post("/admin-login", createRateLimit({
  keyPrefix: "admin-login",
  limit: 10,
  windowMs: 10 * 60 * 1000,
  message: "登录尝试过于频繁，请稍后再试"
}), (req, res) => {
  const username = typeof req.body.username === "string" ? req.body.username : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!safeEqualStrings(username, ADMIN_USERNAME) || !safeEqualStrings(password, ADMIN_PASSWORD)) {
    return res.redirect("/admin-login?error=1");
  }

  setAdminSession(req, res);
  return res.redirect("/admin");
});

app.post("/admin-logout", requireAdminAuth, (req, res) => {
  clearAdminSession(req, res);
  return res.redirect("/admin-login");
});

app.get("/admin", requireAdminAuth, (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "admin.html"));
});

app.get(/^(?!\/api\/).*/, (req, res) => {
  if (req.path.endsWith(".html")) {
    return res.status(404).sendFile(path.join(PUBLIC_DIR, "404.html"));
  }

  res.status(404).sendFile(path.join(PUBLIC_DIR, "404.html"));
});

ensureRuntimeStorage();

app.listen(PORT, () => {
  console.log(`Site running at http://localhost:${PORT}`);
  console.log(`Runtime storage: ${STORAGE_DIR}`);
  if (!process.env.ADMIN_USERNAME) {
    console.log(`Default admin username is ${DEFAULT_ADMIN_USERNAME}. Set ADMIN_USERNAME in .env before production use.`);
  }
  if (!process.env.ADMIN_PASSWORD) {
    console.log(`Default admin password is ${DEFAULT_ADMIN_PASSWORD}. Set ADMIN_PASSWORD in .env before production use.`);
  }
  if (!process.env.SESSION_SECRET) {
    console.log("Default SESSION_SECRET is in use. Set SESSION_SECRET in .env before production use.");
  }
});
