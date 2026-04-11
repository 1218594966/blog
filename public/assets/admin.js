let contentState = null;
let aiConfigState = null;
let aiModelsDebounce = null;

const fields = {
  siteName: document.getElementById("siteName"),
  siteLogo: document.getElementById("siteLogo"),
  siteTitleSuffix: document.getElementById("siteTitleSuffix"),
  siteLanguage: document.getElementById("siteLanguage"),
  siteDescription: document.getElementById("siteDescription"),
  heroLabel: document.getElementById("heroLabel"),
  heroPrefix: document.getElementById("heroPrefix"),
  heroHighlight: document.getElementById("heroHighlight"),
  heroSuffix: document.getElementById("heroSuffix"),
  heroTyped: document.getElementById("heroTyped"),
  heroTags: document.getElementById("heroTags"),
  aboutHeading: document.getElementById("aboutHeading"),
  aboutParagraphs: document.getElementById("aboutParagraphs"),
  aboutHighlights: document.getElementById("aboutHighlights"),
  contactHeading: document.getElementById("contactHeading"),
  contactDescription: document.getElementById("contactDescription"),
  contactEmail: document.getElementById("contactEmail"),
  contactPhone: document.getElementById("contactPhone"),
  contactLocation: document.getElementById("contactLocation"),
  aiEnabled: document.getElementById("aiEnabled"),
  aiBaseUrl: document.getElementById("aiBaseUrl"),
  aiApiKey: document.getElementById("aiApiKey"),
  aiModel: document.getElementById("aiModel"),
  aiSectionTitle: document.getElementById("aiSectionTitle"),
  aiSectionDescription: document.getElementById("aiSectionDescription"),
  aiTemperature: document.getElementById("aiTemperature"),
  aiMaxTokens: document.getElementById("aiMaxTokens"),
  aiSystemPrompt: document.getElementById("aiSystemPrompt"),
  aiPlaceholder: document.getElementById("aiPlaceholder"),
  aiStatus: document.getElementById("aiStatus"),
  refreshAiModelsBtn: document.getElementById("refreshAiModelsBtn"),
  rawJson: document.getElementById("rawJson"),
  refreshBtn: document.getElementById("refreshBtn"),
  refreshMessagesBtn: document.getElementById("refreshMessagesBtn"),
  saveBtn: document.getElementById("saveBtn"),
  saveStatus: document.getElementById("saveStatus"),
  messagesList: document.getElementById("messagesList")
};

const repeaterConfigs = {
  focuses: {
    containerId: "focusesEditor",
    path: "focuses",
    itemTitle: (index) => `关注卡片 ${index + 1}`,
    createItem: () => ({
      title: "新的关注方向",
      desc: "请写下你最近在研究或好奇的 AI 主题。",
      meta: "新的标签"
    }),
    fields: [
      { key: "title", label: "标题", type: "text" },
      { key: "desc", label: "说明", type: "textarea", rows: 4 },
      { key: "meta", label: "顶部标签", type: "text" }
    ]
  },
  navigation: {
    containerId: "navigationEditor",
    path: "navigation",
    itemTitle: (index) => `导航项 ${index + 1}`,
    createItem: () => ({ label: "新导航", href: "#hero" }),
    fields: [
      { key: "label", label: "显示文字", type: "text" },
      { key: "href", label: "跳转锚点", type: "text" }
    ]
  },
  stats: {
    containerId: "statsEditor",
    path: "stats",
    itemTitle: (index) => `指标 ${index + 1}`,
    createItem: () => ({ value: "0", label: "新指标" }),
    fields: [
      { key: "value", label: "数值", type: "text" },
      { key: "label", label: "名称", type: "text" }
    ]
  },
  skills: {
    containerId: "skillsEditor",
    path: "about.skills",
    itemTitle: (index) => `技能 ${index + 1}`,
    createItem: () => ({ name: "新技能", percent: 80 }),
    fields: [
      { key: "name", label: "技能名称", type: "text" },
      { key: "percent", label: "百分比", type: "number", min: 0, max: 100 }
    ]
  },
  projects: {
    containerId: "projectsEditor",
    path: "projects",
    itemTitle: (index) => `项目 ${index + 1}`,
    createItem: () => ({
      category: "AI 研究",
      title: "新的研究主题",
      desc: "请填写这项内容的简短介绍",
      detail: "请填写更完整的说明、过程或想法",
      tags: ["标签一", "标签二"],
      emoji: "✦",
      color: "linear-gradient(135deg,#d4a853,#6f4df6)"
    }),
    fields: [
      { key: "category", label: "项目分类", type: "text" },
      { key: "title", label: "项目标题", type: "text" },
      { key: "desc", label: "项目简介", type: "textarea", rows: 3 },
      { key: "detail", label: "项目详情", type: "textarea", rows: 5 },
      { key: "tags", label: "项目标签", type: "list" },
      { key: "emoji", label: "图形符号", type: "text" },
      { key: "color", label: "渐变背景", type: "text" }
    ]
  },
  experience: {
    containerId: "experienceEditor",
    path: "experience",
    itemTitle: (index) => `经历 ${index + 1}`,
    createItem: () => ({
      year: "2026",
      role: "新的阶段标题",
      company: "时间或场景",
      desc: "请填写这一阶段的变化或关注重点"
    }),
    fields: [
      { key: "year", label: "年份", type: "text" },
      { key: "role", label: "职位", type: "text" },
      { key: "company", label: "公司或地点", type: "text" },
      { key: "desc", label: "经历说明", type: "textarea", rows: 4 }
    ]
  },
  blog: {
    containerId: "blogEditor",
    path: "blog",
    itemTitle: (index) => `文章 ${index + 1}`,
    createItem: () => ({
      date: "2026-04-10",
      tag: "文章分类",
      title: "新文章标题",
      excerpt: "请填写文章摘要",
      detail: "请填写文章详情",
      emoji: "✍",
      color: "linear-gradient(135deg,#1f1f32,#d4a853)"
    }),
    fields: [
      { key: "date", label: "发布日期", type: "text" },
      { key: "tag", label: "文章标签", type: "text" },
      { key: "title", label: "文章标题", type: "text" },
      { key: "excerpt", label: "文章摘要", type: "textarea", rows: 3 },
      { key: "detail", label: "文章详情", type: "textarea", rows: 5 },
      { key: "emoji", label: "图形符号", type: "text" },
      { key: "color", label: "渐变背景", type: "text" }
    ]
  },
  testimonials: {
    containerId: "testimonialsEditor",
    path: "testimonials",
    itemTitle: (index) => `评价 ${index + 1}`,
    createItem: () => ({
      text: "请填写别人对你的印象或交流反馈",
      name: "新名字",
      role: "朋友 / 同学 / 交流对象",
      initial: "新"
    }),
    fields: [
      { key: "text", label: "反馈内容", type: "textarea", rows: 4 },
      { key: "name", label: "姓名", type: "text" },
      { key: "role", label: "身份", type: "text" },
      { key: "initial", label: "头像文字", type: "text" }
    ]
  },
  socials: {
    containerId: "socialsEditor",
    path: "contact.socials",
    itemTitle: (index) => `社交入口 ${index + 1}`,
    createItem: () => ({
      label: "新平台",
      short: "新",
      href: "#"
    }),
    fields: [
      { key: "label", label: "平台名称", type: "text" },
      { key: "short", label: "圆形缩写", type: "text" },
      { key: "href", label: "链接地址", type: "text" }
    ]
  }
};

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

function arrayToTextarea(value) {
  return (value || []).join("\n");
}

function textareaToArray(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getByPath(source, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], source);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function updateRawJson() {
  if (!contentState) return;
  fields.rawJson.value = JSON.stringify(contentState, null, 2);
}

function setAiStatus(message, isError = false) {
  if (!fields.aiStatus) return;
  fields.aiStatus.textContent = message || "";
  fields.aiStatus.style.color = isError ? "#f6b8b8" : "";
}

function renderAiModelOptions(models, selectedModel) {
  if (!fields.aiModel) return;

  fields.aiModel.innerHTML = "";
  const optionValues = Array.isArray(models) ? models : [];

  if (!optionValues.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "请先读取模型列表";
    fields.aiModel.appendChild(option);
    fields.aiModel.value = "";
    return;
  }

  optionValues.forEach((modelId) => {
    const option = document.createElement("option");
    option.value = modelId;
    option.textContent = modelId;
    fields.aiModel.appendChild(option);
  });

  fields.aiModel.value = optionValues.includes(selectedModel) ? selectedModel : optionValues[0];
}

function fillForm(data) {
  fields.siteName.value = data.site.name;
  fields.siteLogo.value = data.site.logo;
  fields.siteTitleSuffix.value = data.site.titleSuffix;
  fields.siteLanguage.value = data.site.language;
  fields.siteDescription.value = data.site.description || "";
  fields.heroLabel.value = data.hero.label;
  fields.heroPrefix.value = data.hero.headlinePrefix;
  fields.heroHighlight.value = data.hero.headlineHighlight;
  fields.heroSuffix.value = data.hero.headlineSuffix;
  fields.heroTyped.value = arrayToTextarea(data.hero.typedPhrases);
  fields.heroTags.value = arrayToTextarea(data.hero.tags);
  fields.aboutHeading.value = data.about.heading;
  fields.aboutParagraphs.value = arrayToTextarea(data.about.paragraphs);
  fields.aboutHighlights.value = arrayToTextarea(data.about.highlights);
  fields.contactHeading.value = data.contact.heading;
  fields.contactDescription.value = data.contact.description;
  fields.contactEmail.value = data.contact.email;
  fields.contactPhone.value = data.contact.phone;
  fields.contactLocation.value = data.contact.location;
  updateRawJson();
}

function fillAiForm(data) {
  aiConfigState = {
    ...defaultAiConfig(),
    ...data
  };

  fields.aiEnabled.value = String(Boolean(aiConfigState.enabled));
  fields.aiBaseUrl.value = aiConfigState.baseUrl || "";
  fields.aiApiKey.value = aiConfigState.apiKey || "";
  fields.aiSectionTitle.value = aiConfigState.sectionTitle || "";
  fields.aiSectionDescription.value = aiConfigState.sectionDescription || "";
  fields.aiTemperature.value = aiConfigState.temperature ?? 0.7;
  fields.aiMaxTokens.value = aiConfigState.maxTokens ?? 800;
  fields.aiSystemPrompt.value = aiConfigState.systemPrompt || "";
  fields.aiPlaceholder.value = aiConfigState.placeholder || "";
  renderAiModelOptions(aiConfigState.model ? [aiConfigState.model] : [], aiConfigState.model || "");
}

function syncBasicFieldsToState() {
  if (!contentState) return;

  contentState.site.name = fields.siteName.value.trim();
  contentState.site.logo = fields.siteLogo.value.trim();
  contentState.site.titleSuffix = fields.siteTitleSuffix.value.trim();
  contentState.site.language = fields.siteLanguage.value.trim();
  contentState.site.description = fields.siteDescription.value.trim();

  contentState.hero.label = fields.heroLabel.value.trim();
  contentState.hero.headlinePrefix = fields.heroPrefix.value.trim();
  contentState.hero.headlineHighlight = fields.heroHighlight.value.trim();
  contentState.hero.headlineSuffix = fields.heroSuffix.value.trim();
  contentState.hero.typedPhrases = textareaToArray(fields.heroTyped.value);
  contentState.hero.tags = textareaToArray(fields.heroTags.value);

  contentState.about.heading = fields.aboutHeading.value.trim();
  contentState.about.paragraphs = textareaToArray(fields.aboutParagraphs.value);
  contentState.about.highlights = textareaToArray(fields.aboutHighlights.value);

  contentState.contact.heading = fields.contactHeading.value.trim();
  contentState.contact.description = fields.contactDescription.value.trim();
  contentState.contact.email = fields.contactEmail.value.trim();
  contentState.contact.phone = fields.contactPhone.value.trim();
  contentState.contact.location = fields.contactLocation.value.trim();

  updateRawJson();
}

function syncAiFieldsToState() {
  if (!aiConfigState) return;

  aiConfigState.enabled = fields.aiEnabled.value === "true";
  aiConfigState.baseUrl = fields.aiBaseUrl.value.trim();
  aiConfigState.apiKey = fields.aiApiKey.value.trim();
  aiConfigState.model = fields.aiModel.value.trim();
  aiConfigState.sectionTitle = fields.aiSectionTitle.value.trim();
  aiConfigState.sectionDescription = fields.aiSectionDescription.value.trim();
  aiConfigState.systemPrompt = fields.aiSystemPrompt.value.trim();
  aiConfigState.placeholder = fields.aiPlaceholder.value.trim();
  aiConfigState.temperature = Number(fields.aiTemperature.value || 0.7);
  aiConfigState.maxTokens = Number(fields.aiMaxTokens.value || 800);
}

function renderRepeater(repeaterKey) {
  const config = repeaterConfigs[repeaterKey];
  const container = document.getElementById(config.containerId);
  const items = getByPath(contentState, config.path);

  if (!container || !Array.isArray(items)) return;

  container.innerHTML = "";

  if (!items.length) {
    container.innerHTML = '<div class="empty-state">当前还没有内容，点击右上角按钮就可以新增。</div>';
    return;
  }

  items.forEach((item, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "repeater-item";

    const fieldsMarkup = config.fields.map((field) => {
      const value = item[field.key];
      const inputValue = escapeHtml(Array.isArray(value) ? arrayToTextarea(value) : value ?? "");

      if (field.type === "textarea" || field.type === "list") {
        const rows = field.rows || 4;
        return `
          <label>${field.label}
            <textarea
              rows="${rows}"
              data-repeater="${repeaterKey}"
              data-index="${index}"
              data-field="${field.key}"
              data-type="${field.type}"
            >${inputValue}</textarea>
          </label>
        `;
      }

      return `
        <label>${field.label}
          <input
            type="${field.type || "text"}"
            value="${inputValue}"
            data-repeater="${repeaterKey}"
            data-index="${index}"
            data-field="${field.key}"
            ${field.min !== undefined ? `min="${field.min}"` : ""}
            ${field.max !== undefined ? `max="${field.max}"` : ""}
          >
        </label>
      `;
    }).join("");

    wrapper.innerHTML = `
      <div class="repeater-item-header">
        <div class="repeater-item-title">${escapeHtml(config.itemTitle(index, item))}</div>
        <button
          type="button"
          class="repeater-remove"
          data-remove-repeater="${repeaterKey}"
          data-remove-index="${index}"
        >
          删除
        </button>
      </div>
      <div class="repeater-item-grid">${fieldsMarkup}</div>
    `;

    container.appendChild(wrapper);
  });
}

function renderAllRepeaters() {
  Object.keys(repeaterConfigs).forEach(renderRepeater);
}

function renderMessages(messages) {
  if (!fields.messagesList) return;

  if (!messages.length) {
    fields.messagesList.innerHTML = '<div class="empty-state">还没有收到留言，访客提交后会显示在这里。</div>';
    return;
  }

  fields.messagesList.innerHTML = messages.map((message) => `
    <article class="message-card">
      <div class="message-card-header">
        <div>
          <div class="message-card-name">${escapeHtml(message.name)}</div>
          <div class="message-card-meta">${escapeHtml(message.email)}</div>
        </div>
        <div class="message-card-extra">${new Date(message.createdAt).toLocaleString("zh-CN")}</div>
      </div>
      <div class="message-card-extra">项目类型：${escapeHtml(message.projectType || "未填写")}</div>
      <div class="message-card-content">${escapeHtml(message.message)}</div>
    </article>
  `).join("");
}

async function fetchMessages() {
  const response = await fetch("/api/messages");
  if (!response.ok) {
    throw new Error("读取留言失败");
  }

  const messages = await response.json();
  renderMessages(messages);
}

async function fetchContent() {
  const response = await fetch("/api/content");
  if (!response.ok) {
    throw new Error("读取内容失败");
  }

  contentState = await response.json();
  fillForm(contentState);
  renderAllRepeaters();
}

async function fetchAiConfig() {
  const response = await fetch("/api/ai/config");
  if (!response.ok) {
    throw new Error("读取 AI 配置失败");
  }

  const config = await response.json();
  fillAiForm(config);

  if (config.baseUrl && config.apiKey) {
    await refreshAiModels(false).catch((error) => {
      console.error(error);
      setAiStatus(error.message || "读取模型列表失败", true);
    });
  } else {
    setAiStatus("请先填写接口地址和 API Key，再读取模型列表。");
  }
}

async function refreshAll() {
  await Promise.all([fetchContent(), fetchMessages(), fetchAiConfig()]);
}

async function refreshAiModels(showStatus = true) {
  syncAiFieldsToState();

  if (!aiConfigState.baseUrl || !aiConfigState.apiKey) {
    renderAiModelOptions([], "");
    setAiStatus("请先填写接口地址和 API Key。", true);
    return;
  }

  if (showStatus) {
    setAiStatus("正在根据接口地址读取模型列表...");
  }

  try {
    const response = await fetch("/api/ai/models/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        baseUrl: aiConfigState.baseUrl,
        apiKey: aiConfigState.apiKey
      })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "读取模型列表失败");
    }

    renderAiModelOptions(result.models, aiConfigState.model || result.models[0] || "");
    aiConfigState.baseUrl = result.baseUrl;
    aiConfigState.model = fields.aiModel.value;
    fields.aiBaseUrl.value = result.baseUrl;
    setAiStatus(result.models.length ? `已读取 ${result.models.length} 个模型。` : "接口返回了空模型列表。");
  } catch (error) {
    console.error(error);
    renderAiModelOptions([], "");
    setAiStatus(error.message || "读取模型列表失败", true);
  }
}

function scheduleAiModelsRefresh() {
  window.clearTimeout(aiModelsDebounce);
  aiModelsDebounce = window.setTimeout(() => {
    refreshAiModels().catch((error) => {
      console.error(error);
      setAiStatus(error.message || "读取模型列表失败", true);
    });
  }, 700);
}

async function saveAll() {
  try {
    fields.saveStatus.textContent = "保存中...";
    syncBasicFieldsToState();
    syncAiFieldsToState();

    let nextContent;

    try {
      nextContent = JSON.parse(fields.rawJson.value);
    } catch {
      nextContent = contentState;
    }

    const [contentResponse, aiResponse] = await Promise.all([
      fetch("/api/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(nextContent)
      }),
      fetch("/api/ai/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(aiConfigState)
      })
    ]);

    const contentResult = await contentResponse.json();
    const aiResult = await aiResponse.json();

    if (!contentResponse.ok) {
      throw new Error(contentResult.error || "站点内容保存失败");
    }

    if (!aiResponse.ok) {
      throw new Error(aiResult.error || "AI 配置保存失败");
    }

    contentState = nextContent;
    fillForm(contentState);
    renderAllRepeaters();
    setAiStatus("AI 配置已保存。");
    fields.saveStatus.textContent = "保存成功";

    window.setTimeout(() => {
      fields.saveStatus.textContent = "";
    }, 2200);
  } catch (error) {
    console.error(error);
    fields.saveStatus.textContent = error.message || "保存失败，请检查配置";
  }
}

[
  fields.siteName,
  fields.siteLogo,
  fields.siteTitleSuffix,
  fields.siteLanguage,
  fields.siteDescription,
  fields.heroLabel,
  fields.heroPrefix,
  fields.heroHighlight,
  fields.heroSuffix,
  fields.heroTyped,
  fields.heroTags,
  fields.aboutHeading,
  fields.aboutParagraphs,
  fields.aboutHighlights,
  fields.contactHeading,
  fields.contactDescription,
  fields.contactEmail,
  fields.contactPhone,
  fields.contactLocation
].forEach((field) => {
  field.addEventListener("input", syncBasicFieldsToState);
});

[
  fields.aiEnabled,
  fields.aiSectionTitle,
  fields.aiSectionDescription,
  fields.aiTemperature,
  fields.aiMaxTokens,
  fields.aiSystemPrompt,
  fields.aiPlaceholder,
  fields.aiModel
].forEach((field) => {
  field.addEventListener("input", syncAiFieldsToState);
  field.addEventListener("change", syncAiFieldsToState);
});

[fields.aiBaseUrl, fields.aiApiKey].forEach((field) => {
  field.addEventListener("input", () => {
    syncAiFieldsToState();
    scheduleAiModelsRefresh();
  });
});

document.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;

  const repeaterKey = target.dataset.repeater;
  if (!repeaterKey || !contentState) return;

  const config = repeaterConfigs[repeaterKey];
  const list = getByPath(contentState, config.path);
  const index = Number(target.dataset.index);
  const fieldKey = target.dataset.field;
  const valueType = target.dataset.type;

  if (!Array.isArray(list) || !list[index]) return;

  let nextValue = target.value;
  if (valueType === "list") {
    nextValue = textareaToArray(target.value);
  } else if (target.type === "number") {
    nextValue = Number(target.value || 0);
  }

  list[index][fieldKey] = nextValue;
  updateRawJson();
});

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const addButton = target.closest("[data-add-repeater]");
  if (addButton && contentState) {
    const repeaterKey = addButton.getAttribute("data-add-repeater");
    const config = repeaterConfigs[repeaterKey];
    const list = getByPath(contentState, config.path);
    list.push(config.createItem());
    renderRepeater(repeaterKey);
    updateRawJson();
    return;
  }

  const removeButton = target.closest("[data-remove-repeater]");
  if (removeButton && contentState) {
    const repeaterKey = removeButton.getAttribute("data-remove-repeater");
    const index = Number(removeButton.getAttribute("data-remove-index"));
    const config = repeaterConfigs[repeaterKey];
    const list = getByPath(contentState, config.path);
    list.splice(index, 1);
    renderRepeater(repeaterKey);
    updateRawJson();
  }
});

fields.refreshBtn.addEventListener("click", () => {
  refreshAll().catch((error) => {
    console.error(error);
    fields.saveStatus.textContent = "重新载入失败";
  });
});

fields.refreshMessagesBtn.addEventListener("click", () => {
  fetchMessages().catch((error) => {
    console.error(error);
    fields.saveStatus.textContent = "刷新留言失败";
  });
});

fields.refreshAiModelsBtn.addEventListener("click", () => {
  refreshAiModels().catch((error) => {
    console.error(error);
    setAiStatus(error.message || "读取模型列表失败", true);
  });
});

fields.saveBtn.addEventListener("click", saveAll);

refreshAll().catch((error) => {
  console.error(error);
  fields.saveStatus.textContent = "后台初始化失败";
});
