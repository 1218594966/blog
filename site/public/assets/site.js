let siteContent = window.__INITIAL_SITE_CONTENT__ || null;
let phrases = [];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let currentProjectFilter = "全部";
let testimonialOffset = 0;
let testimonialAutoScroll = null;
let aiPublicConfig = null;
let aiConversation = [];
let promptGallery = null;
let promptCarouselIntervals = [];

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

window.addEventListener("load", () => {
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }
}, { once: true });

const els = {
  scrollProgress: document.getElementById("scrollProgress"),
  loader: document.getElementById("loader"),
  loaderLogo: document.getElementById("loaderLogo"),
  loaderPercent: document.querySelector(".loader-percent"),
  cursorDot: document.getElementById("cursorDot"),
  cursorRing: document.getElementById("cursorRing"),
  nav: document.getElementById("nav"),
  navLogo: document.getElementById("navLogo"),
  navLinks: document.getElementById("navLinks"),
  hamburger: document.getElementById("hamburger"),
  heroLabel: document.getElementById("heroLabel"),
  heroPrefix: document.getElementById("heroPrefix"),
  heroHighlight: document.getElementById("heroHighlight"),
  heroSuffix: document.getElementById("heroSuffix"),
  heroTags: document.getElementById("heroTags"),
  typed: document.getElementById("typed"),
  statsBar: document.getElementById("statsBar"),
  marqueeTrack: document.getElementById("marqueeTrack"),
  focusGrid: document.getElementById("focusGrid"),
  aboutImagePlaceholder: document.getElementById("aboutImagePlaceholder"),
  aboutHeading: document.getElementById("aboutHeading"),
  aboutParagraphs: document.getElementById("aboutParagraphs"),
  aboutHighlights: document.getElementById("aboutHighlights"),
  skillsGrid: document.getElementById("skillsGrid"),
  projectFilters: document.getElementById("projectFilters"),
  projectsGrid: document.getElementById("projectsGrid"),
  promptGallerySection: document.getElementById("prompt-gallery"),
  promptCollections: document.getElementById("promptCollections"),
  aiLabSection: document.getElementById("ai-lab"),
  aiSectionTitle: document.getElementById("aiSectionTitle"),
  aiSectionDescription: document.getElementById("aiSectionDescription"),
  aiModelSelect: document.getElementById("aiModelSelect"),
  aiRefreshModels: document.getElementById("aiRefreshModels"),
  aiStatusText: document.getElementById("aiStatusText"),
  aiChatMessages: document.getElementById("aiChatMessages"),
  aiChatForm: document.getElementById("aiChatForm"),
  aiChatInput: document.getElementById("aiChatInput"),
  aiClearChat: document.getElementById("aiClearChat"),
  aiSendBtn: document.getElementById("aiSendBtn"),
  testimonialsTrack: document.getElementById("testimonialsTrack"),
  testPrev: document.getElementById("testPrev"),
  testNext: document.getElementById("testNext"),
  contactHeading: document.getElementById("contactHeading"),
  contactDescription: document.getElementById("contactDescription"),
  contactDetails: document.getElementById("contactDetails"),
  socialLinks: document.getElementById("socialLinks"),
  contactForm: document.getElementById("contactForm"),
  contactName: document.getElementById("contactName"),
  contactEmailField: document.getElementById("contactEmailField"),
  contactProjectType: document.getElementById("contactProjectType"),
  contactMessage: document.getElementById("contactMessage"),
  contactSubmitText: document.getElementById("contactSubmitText"),
  contactFormStatus: document.getElementById("contactFormStatus"),
  footerLogo: document.getElementById("footerLogo"),
  footerText: document.getElementById("footerText"),
  footerPrivacy: document.getElementById("footerPrivacy"),
  footerTerms: document.getElementById("footerTerms"),
  footerRss: document.getElementById("footerRss"),
  backToTop: document.getElementById("backToTop"),
  modalOverlay: document.getElementById("modalOverlay"),
  modalClose: document.getElementById("modalClose"),
  modalBody: document.getElementById("modalBody"),
  particleCanvas: document.getElementById("particleCanvas")
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    entry.target.querySelectorAll(".skill-fill").forEach((bar) => {
      bar.style.width = `${bar.dataset.width}%`;
    });
    observer.unobserve(entry.target);
  });
}, { threshold: 0.15 });

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (typeof text === "string") element.textContent = text;
  return element;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeBackground(value, fallback = "linear-gradient(135deg,#1f1f32,#d4a853)") {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;

  if (/^[#(),.%\-\w\s]+$/.test(raw)) {
    return raw;
  }

  return fallback;
}

function repeatItems(items) {
  return [...items, ...items];
}

function stripExtension(fileName) {
  return String(fileName ?? "").replace(/\.[^.]+$/, "");
}

function getPromptImages(collection) {
  return Array.isArray(collection?.images) ? collection.images.filter(Boolean) : [];
}

function getDefaultPromptImageIndex(collection) {
  const images = getPromptImages(collection);
  if (!images.length) return 0;

  const highlightedIndex = images.findIndex((image) => /仙金系列公主/i.test(image.name || ""));
  if (highlightedIndex >= 0) return highlightedIndex;

  const coverIndex = images.findIndex((image) => image.url === collection?.coverImage);
  return coverIndex >= 0 ? coverIndex : 0;
}

function getPrimaryPromptImage(collection) {
  const images = getPromptImages(collection);
  if (!images.length) return collection?.coverImage || "";
  return images[getDefaultPromptImageIndex(collection)]?.url || collection?.coverImage || "";
}

function clearPromptCarouselIntervals() {
  promptCarouselIntervals.forEach((stopTimer) => {
    if (typeof stopTimer === "function") {
      stopTimer();
    }
  });
  promptCarouselIntervals = [];
}

function getPromptDisplayName(item) {
  const rawName = stripExtension(item?.image?.name);
  if (!rawName || /^Gemini_/i.test(rawName) || /Generated_Image/i.test(rawName)) {
    return item?.collection?.headline || item?.collection?.title || "Prompt Work";
  }

  return rawName;
}

function setAiStatus(message, isError = false) {
  if (!els.aiStatusText) return;
  els.aiStatusText.textContent = message || "";
  els.aiStatusText.style.color = isError ? "#f6b8b8" : "";
}

function showModalContent({ coverMarkup = "", category = "", title = "", bodyMarkup = "", tags = [] }) {
  if (!els.modalBody || !els.modalOverlay) return;

  const safeCategory = escapeHtml(category);
  const safeTitle = escapeHtml(title);
  const safeTags = Array.isArray(tags) && tags.length
    ? tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")
    : "";

  els.modalBody.innerHTML = `
    ${coverMarkup}
    <div class="project-category modal-category">${safeCategory}</div>
    <h2>${safeTitle}</h2>
    <div class="modal-body-copy">${bodyMarkup}</div>
    ${safeTags ? `<div class="project-tags modal-tags">${safeTags}</div>` : ""}
  `;
  els.modalOverlay.classList.add("active");
}

function openModal(title, category, detail, tags, visual) {
  const detailMarkup = Array.isArray(detail)
    ? detail.map((item) => `<p>${escapeHtml(item)}</p>`).join("")
    : `<p>${escapeHtml(detail)}</p>`;
  const background = safeBackground(visual?.color);
  const emoji = escapeHtml(visual?.emoji || "");

  showModalContent({
    coverMarkup: `<div class="modal-visual" style="background:${background}">${emoji}</div>`,
    category,
    title,
    bodyMarkup: `<div class="modal-copy-stack">${detailMarkup}</div>`,
    tags
  });
}

function openPromptJsonModal(collection, activeImage = null) {
  const jsonContent = collection?.promptJsonRaw || "";
  if (!jsonContent) return;
  const modalImage = activeImage?.url || getPrimaryPromptImage(collection);

  showModalContent({
    coverMarkup: modalImage
      ? `<img class="modal-cover-image" src="${modalImage}" alt="${escapeHtml(collection.headline || collection.title)}">`
      : "",
    category: `${collection.folderName} · ${activeImage?.name ? stripExtension(activeImage.name) : "JSON 结构"}`,
    title: collection.headline || collection.title,
    bodyMarkup: `
      <p class="prompt-modal-description">${escapeHtml(collection.description || "")}</p>
      <div class="prompt-code-heading">${escapeHtml(collection.promptJsonName || "JSON 提示词")}</div>
      <pre class="prompt-code-block">${escapeHtml(jsonContent)}</pre>
    `,
    tags: collection.highlights || []
  });
}

function observeReveals() {
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

function renderNavigation() {
  if (!els.navLinks) return;
  els.navLinks.innerHTML = "";

  const navigationItems = [...siteContent.navigation];

  if (promptGallery?.collections?.length) {
    navigationItems.splice(Math.min(3, navigationItems.length), 0, {
      label: "提示词展廊",
      href: "#prompt-gallery"
    });
  }

  navigationItems.push(
    { label: "工具中心", href: "/tools" },
    { label: "项目中心", href: "/projects" },
    { label: "实验区", href: "/lab" }
  );

  navigationItems
    .filter((item) => {
      if (!item?.href) return false;
      if (!item.href.startsWith("#")) return true;
      return Boolean(document.querySelector(item.href));
    })
    .forEach((item) => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = item.href;
    link.textContent = item.label;
    li.appendChild(link);
    els.navLinks.appendChild(li);
    });
}

function renderHero() {
  document.documentElement.lang = siteContent.site.language || "zh-CN";
  document.title = `${siteContent.site.name} | ${siteContent.site.titleSuffix}`;

  const metaDescription = document.querySelector('meta[name="description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');

  if (metaDescription) metaDescription.setAttribute("content", siteContent.site.description || "");
  if (ogTitle) ogTitle.setAttribute("content", `${siteContent.site.name} | ${siteContent.site.titleSuffix}`);
  if (ogDescription) ogDescription.setAttribute("content", siteContent.site.description || "");

  if (els.loaderLogo) els.loaderLogo.textContent = siteContent.site.logo;
  if (els.navLogo) els.navLogo.textContent = siteContent.site.logo;
  if (els.heroLabel) els.heroLabel.textContent = siteContent.hero.label;
  if (els.heroPrefix) els.heroPrefix.textContent = `${siteContent.hero.headlinePrefix} `;
  if (els.heroHighlight) els.heroHighlight.textContent = siteContent.hero.headlineHighlight;
  if (els.heroSuffix) els.heroSuffix.textContent = siteContent.hero.headlineSuffix;

  if (els.heroTags) {
    els.heroTags.innerHTML = "";
    siteContent.hero.tags.forEach((tag) => {
      els.heroTags.appendChild(createElement("span", "hero-tag", tag));
    });
  }

  phrases = siteContent.hero.typedPhrases || [];
}

function renderStats() {
  if (!els.statsBar) return;
  els.statsBar.innerHTML = "";

  siteContent.stats.forEach((item) => {
    const stat = createElement("div", "stat-item");
    stat.innerHTML = `
      <div class="stat-number">${escapeHtml(item.value)}</div>
      <div class="stat-label">${escapeHtml(item.label)}</div>
    `;
    els.statsBar.appendChild(stat);
  });
}

function renderMarquee() {
  if (!els.marqueeTrack) return;

  const heroTags = Array.isArray(siteContent?.hero?.tags) ? siteContent.hero.tags : [];
  const projectCategories = Array.isArray(siteContent?.projects)
    ? siteContent.projects.map((project) => project?.category)
    : [];
  const promptHighlights = Array.isArray(promptGallery?.collections)
    ? promptGallery.collections.flatMap((collection) => collection?.highlights || [])
    : [];

  const items = repeatItems([
    ...heroTags,
    ...projectCategories,
    ...promptHighlights
  ].filter(Boolean));

  els.marqueeTrack.innerHTML = "";
  items.forEach((item) => {
    els.marqueeTrack.appendChild(createElement("span", "marquee-item", item));
  });
}

function renderFocuses() {
  if (!els.focusGrid) return;
  els.focusGrid.innerHTML = "";

  (siteContent.focuses || []).forEach((item, index) => {
    const card = createElement("article", "focus-card reveal");
    card.style.transitionDelay = `${index * 0.08}s`;
    card.innerHTML = `
      <div class="focus-meta">${escapeHtml(item.meta)}</div>
      <h3 class="focus-title">${escapeHtml(item.title)}</h3>
      <p class="focus-desc">${escapeHtml(item.desc)}</p>
    `;
    els.focusGrid.appendChild(card);
  });

  observeReveals();
}

function renderAbout() {
  if (els.aboutImagePlaceholder) els.aboutImagePlaceholder.textContent = siteContent.site.logo;
  if (els.aboutHeading) els.aboutHeading.textContent = siteContent.about.heading;

  if (els.aboutParagraphs) {
    els.aboutParagraphs.innerHTML = "";
    siteContent.about.paragraphs.forEach((paragraph) => {
      els.aboutParagraphs.appendChild(createElement("p", "", paragraph));
    });
  }

  if (els.aboutHighlights) {
    els.aboutHighlights.innerHTML = "";
    siteContent.about.highlights.forEach((tag) => {
      els.aboutHighlights.appendChild(createElement("span", "highlight-tag", tag));
    });
  }

  if (els.skillsGrid) {
    els.skillsGrid.innerHTML = "";
    siteContent.about.skills.forEach((skill) => {
      const skillItem = createElement("div", "skill-item");
      skillItem.innerHTML = `
        <div class="skill-header">
          <span class="skill-name">${escapeHtml(skill.name)}</span>
          <span class="skill-percent">${escapeHtml(skill.percent)}%</span>
        </div>
        <div class="skill-bar">
          <div class="skill-fill" data-width="${escapeHtml(skill.percent)}"></div>
        </div>
      `;
      els.skillsGrid.appendChild(skillItem);
    });
  }
}

function getProjectCategories() {
  return ["全部", ...new Set(siteContent.projects.map((project) => project.category))];
}

function renderProjectFilters() {
  if (!els.projectFilters) return;
  els.projectFilters.innerHTML = "";

  getProjectCategories().forEach((category) => {
    const button = createElement(
      "button",
      `filter-btn${category === currentProjectFilter ? " active" : ""}`,
      category
    );
    button.type = "button";
    button.dataset.filter = category;
    button.addEventListener("click", () => {
      currentProjectFilter = category;
      renderProjectFilters();
      renderProjects();
    });
    els.projectFilters.appendChild(button);
  });
}

function renderProjects() {
  if (!els.projectsGrid) return;
  els.projectsGrid.innerHTML = "";

  const projects = siteContent.projects.filter((project) => (
    currentProjectFilter === "全部" || project.category === currentProjectFilter
  ));

  projects.forEach((project, index) => {
    const card = createElement("article", "project-card reveal");
    card.style.transitionDelay = `${index * 0.08}s`;
    const tags = Array.isArray(project.tags)
      ? project.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")
      : "";
    card.innerHTML = `
      <div class="project-thumb">
        <div class="project-thumb-bg" style="background:${safeBackground(project.color)}">${escapeHtml(project.emoji)}</div>
        <div class="project-thumb-overlay"></div>
      </div>
      <div class="project-info">
        <div class="project-category">${escapeHtml(project.category)}</div>
        <div class="project-name">${escapeHtml(project.title)}</div>
        <div class="project-desc">${escapeHtml(project.desc)}</div>
        <div class="project-tags">${tags}</div>
        <a href="#" class="project-link">查看详情 →</a>
      </div>
    `;

    const link = card.querySelector(".project-link");
    link?.addEventListener("click", (event) => {
      event.preventDefault();
      openModal(project.title, project.category, project.detail, project.tags, {
        color: project.color,
        emoji: project.emoji
      });
    });

    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });

    els.projectsGrid.appendChild(card);
  });

  observeReveals();
}

function renderPromptGallery() {
  if (!els.promptGallerySection || !els.promptCollections) return;

  clearPromptCarouselIntervals();

  const collections = Array.isArray(promptGallery?.collections)
    ? [...promptGallery.collections]
    : [];

  if (!collections.length) {
    els.promptGallerySection.style.display = "none";
    return;
  }

  els.promptGallerySection.style.display = "";
  els.promptCollections.innerHTML = "";
  const galleryItems = [];
  collections.forEach((collection) => {
    getPromptImages(collection).forEach((image, imageIndex) => {
      galleryItems.push({
        collection,
        image,
        imageIndex,
        readableName: stripExtension(image.name),
        jsonRaw: collection.promptJsonRaw || JSON.stringify(collection.promptJson || {}, null, 2)
      });
    });
  });

  if (!galleryItems.length) {
    els.promptGallerySection.style.display = "none";
    return;
  }

  const highlightedIndex = galleryItems.findIndex((item) => /仙金系列公主/i.test(item.image.name || ""));
  const initialIndex = highlightedIndex >= 0 ? highlightedIndex : 0;
  const loopItems = [...galleryItems, ...galleryItems];
  const gallery = createElement("section", "prompt-unified-gallery reveal");

  gallery.innerHTML = `
    <div class="prompt-flow-layout">
      <div class="prompt-flow-left">
        <div class="prompt-flow-window">
          <div class="prompt-flow-ribbon" data-prompt-track>
            ${loopItems.map((item, renderIndex) => `
              <button type="button" class="prompt-flow-card" data-prompt-card="${renderIndex}" data-prompt-index="${renderIndex % galleryItems.length}">
                <div class="prompt-flow-card-media">
                  <img src="${item.image.url}" alt="${escapeHtml(getPromptDisplayName(item))}" loading="lazy">
                </div>
              </button>
            `).join("")}
          </div>
        </div>
      </div>
      <div class="prompt-flow-right">
        <div class="prompt-json-panel" data-json-panel>
          <div class="prompt-json-head">
            <div>
              <div class="prompt-panel-label">JSON 结构</div>
              <div class="prompt-json-title" data-prompt-json-title></div>
            </div>
            <button type="button" class="prompt-panel-action" data-prompt-action="json">全屏查看</button>
          </div>
          <pre class="prompt-code-block" data-prompt-code></pre>
        </div>
      </div>
    </div>
  `;

  const track = gallery.querySelector("[data-prompt-track]");
  const cards = Array.from(gallery.querySelectorAll("[data-prompt-card]"));
  const jsonTitle = gallery.querySelector("[data-prompt-json-title]");
  const codeBlock = gallery.querySelector("[data-prompt-code]");
  const jsonPanel = gallery.querySelector("[data-json-panel]");
  let activeIndex = initialIndex;

  function applyActiveItem(nextIndex, options = {}) {
    if (!galleryItems.length || !codeBlock) return;
    const { animateCode = true } = options;
    activeIndex = (nextIndex + galleryItems.length) % galleryItems.length;

    const activeItem = galleryItems[activeIndex];
    cards.forEach((card) => {
      card.classList.toggle("is-active", Number(card.getAttribute("data-prompt-index")) === activeIndex);
    });

    if (jsonTitle) {
      jsonTitle.textContent = [
        activeItem.collection.folderName || activeItem.collection.title || "",
        getPromptDisplayName(activeItem)
      ].filter(Boolean).join(" · ");
    }

    if (jsonPanel) {
      jsonPanel.style.setProperty("--prompt-shift", `${activeIndex}`);
    }

    codeBlock.textContent = activeItem.jsonRaw || "暂无 JSON 提示词。";
    if (animateCode) {
      codeBlock.classList.remove("is-animating");
      void codeBlock.offsetWidth;
      codeBlock.classList.add("is-animating");
    }
  }

  gallery.querySelector("[data-prompt-action='json']")?.addEventListener("click", () => {
    const activeItem = galleryItems[activeIndex];
    openPromptJsonModal(activeItem.collection, activeItem.image);
  });

  gallery.querySelectorAll("[data-prompt-card]").forEach((slideButton) => {
    slideButton.addEventListener("mouseenter", () => {
      const cardIndex = Number(slideButton.getAttribute("data-prompt-index"));
      applyActiveItem(Number.isFinite(cardIndex) ? cardIndex : activeIndex);
    });

    slideButton.addEventListener("click", () => {
      const cardIndex = Number(slideButton.getAttribute("data-prompt-index"));
      const activeItem = galleryItems[Number.isFinite(cardIndex) ? cardIndex : activeIndex];
      showModalContent({
        coverMarkup: `<img class="modal-cover-image" src="${activeItem.image.url}" alt="${escapeHtml(getPromptDisplayName(activeItem))}">`,
        category: `${activeItem.collection.folderName} · 样例图`,
        title: getPromptDisplayName(activeItem),
        bodyMarkup: `<p class="prompt-modal-description">${escapeHtml(activeItem.collection.description || "")}</p>`,
        tags: activeItem.collection.highlights || []
      });
    });
  });

  if (track) {
    const loopDuration = Math.max(26, galleryItems.length * 4.8);
    track.style.setProperty("--prompt-loop-duration", `${loopDuration}s`);
  }

  applyActiveItem(initialIndex, { animateCode: false });

  if (galleryItems.length > 1) {
    const loopDuration = Math.max(26, galleryItems.length * 4.8);
    const rotationDelay = Math.max(3200, Math.round((loopDuration * 1000) / galleryItems.length));
    const timerId = window.setInterval(() => {
      applyActiveItem(activeIndex + 1);
    }, rotationDelay);

    promptCarouselIntervals.push(() => window.clearInterval(timerId));
  }

  els.promptCollections.appendChild(gallery);

  observeReveals();
}

function renderTestimonials() {
  if (!els.testimonialsTrack) return;
  els.testimonialsTrack.innerHTML = "";
  testimonialOffset = 0;

  siteContent.testimonials.forEach((item) => {
    const card = createElement("div", "testimonial-card");
    card.innerHTML = `
      <div class="testimonial-quote">"</div>
      <div class="testimonial-text">${escapeHtml(item.text)}</div>
      <div class="testimonial-author">
        <div class="testimonial-avatar">${escapeHtml(item.initial)}</div>
        <div>
          <div class="testimonial-name">${escapeHtml(item.name)}</div>
          <div class="testimonial-role">${escapeHtml(item.role)}</div>
        </div>
      </div>
    `;
    els.testimonialsTrack.appendChild(card);
  });
}

function renderContact() {
  if (els.contactHeading) els.contactHeading.textContent = siteContent.contact.heading;
  if (els.contactDescription) els.contactDescription.textContent = siteContent.contact.description;

  if (els.contactDetails) {
    const items = [
      { icon: "@", label: "邮箱", value: siteContent.contact.email },
      { icon: "T", label: "电话", value: siteContent.contact.phone },
      { icon: "L", label: "地址", value: siteContent.contact.location }
    ];

    els.contactDetails.innerHTML = "";
    items.forEach((item) => {
      const row = createElement("div", "contact-detail-item");
      const icon = createElement("div", "contact-detail-icon", item.icon);
      const text = createElement("span", "", `${item.label}：${item.value}`);
      const copyButton = createElement("button", "contact-detail-copy", "复制");
      copyButton.type = "button";
      copyButton.setAttribute("data-copy", item.value || "");

      row.appendChild(icon);
      row.appendChild(text);
      row.appendChild(copyButton);
      els.contactDetails.appendChild(row);
    });
  }

  if (els.socialLinks) {
    els.socialLinks.innerHTML = "";
    siteContent.contact.socials.forEach((item) => {
      const link = createElement("a", "social-link", item.short);
      link.href = item.href;
      link.title = item.label;
      link.setAttribute("aria-label", item.label);
      link.target = item.href.startsWith("http") ? "_blank" : "_self";
      link.rel = item.href.startsWith("http") ? "noreferrer" : "";
      els.socialLinks.appendChild(link);
    });
  }
}

function renderFooter() {
  if (els.footerLogo) els.footerLogo.textContent = siteContent.site.name;
  if (els.footerText) els.footerText.textContent = siteContent.footer.copyright;
  if (els.footerPrivacy) els.footerPrivacy.textContent = siteContent.footer.privacy;
  if (els.footerTerms) els.footerTerms.textContent = siteContent.footer.terms;
  if (els.footerRss) els.footerRss.textContent = siteContent.footer.rss;
}

function renderAiMessages() {
  if (!els.aiChatMessages) return;
  els.aiChatMessages.innerHTML = "";

  if (!aiConversation.length) {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "ai-chat-message assistant";
    emptyMessage.innerHTML = `
      <div class="ai-chat-role">AI 助手</div>
      <div>这里已经接上 OpenAI 兼容模型。你可以直接发问题，我会按当前配置的模型来回答。</div>
    `;
    els.aiChatMessages.appendChild(emptyMessage);
    return;
  }

  aiConversation.forEach((item) => {
    const wrapper = document.createElement("div");
    wrapper.className = `ai-chat-message ${item.role}`;

    const role = document.createElement("div");
    role.className = "ai-chat-role";
    role.textContent = item.role === "user" ? "我" : "AI 助手";

    const content = document.createElement("div");
    content.textContent = item.content;

    wrapper.appendChild(role);
    wrapper.appendChild(content);
    els.aiChatMessages.appendChild(wrapper);
  });

  els.aiChatMessages.scrollTop = els.aiChatMessages.scrollHeight;
}

function applyAiSectionConfig() {
  if (!els.aiLabSection) return;

  if (!aiPublicConfig?.enabled) {
    els.aiLabSection.style.display = "none";
    return;
  }

  els.aiLabSection.style.display = "";
  if (els.aiSectionTitle) {
    const titleText = aiPublicConfig.sectionTitle || "AI 对话";
    els.aiSectionTitle.innerHTML = "";
    if (titleText.includes("实验")) {
      els.aiSectionTitle.textContent = titleText;
    } else {
      els.aiSectionTitle.append(document.createTextNode(titleText));
      const emphasis = document.createElement("em");
      emphasis.textContent = "实验";
      els.aiSectionTitle.appendChild(document.createTextNode(" "));
      els.aiSectionTitle.appendChild(emphasis);
    }
  }
  if (els.aiSectionDescription) {
    els.aiSectionDescription.textContent = aiPublicConfig.sectionDescription || "";
  }
  if (els.aiChatInput) {
    els.aiChatInput.placeholder = aiPublicConfig.placeholder || "想问点什么？";
  }
  if (!aiPublicConfig?.configured) {
    setAiStatus("AI 区域尚未配置接口，暂时只展示静态面板。");
  }
}

async function loadAiPublicConfig() {
  const response = await fetch("/api/ai/public-config");
  if (!response.ok) {
    throw new Error("读取 AI 区配置失败");
  }

  aiPublicConfig = await response.json();
  applyAiSectionConfig();
}

async function refreshAiModels(showStatus = true) {
  if (!els.aiModelSelect) return;

  if (!aiPublicConfig?.configured) {
    els.aiModelSelect.innerHTML = '<option value="">尚未配置模型</option>';
    setAiStatus("AI 区域尚未配置接口，请先在后台填写 Base URL 和 API Key。");
    return;
  }

  if (showStatus) {
    setAiStatus("正在读取模型列表...");
  }

  const response = await fetch("/api/ai/models");
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    els.aiModelSelect.innerHTML = '<option value="">暂无可用模型</option>';
    setAiStatus(result.error || "模型列表读取失败", true);
    return;
  }

  const models = Array.isArray(result.models) ? result.models : [];
  els.aiModelSelect.innerHTML = "";

  if (!models.length) {
    els.aiModelSelect.innerHTML = '<option value="">暂无可用模型</option>';
    setAiStatus(result.message || "接口返回了空模型列表。", true);
    return;
  }

  models.forEach((modelId) => {
    const option = document.createElement("option");
    option.value = modelId;
    option.textContent = modelId;
    els.aiModelSelect.appendChild(option);
  });

  const selectedModel = models.includes(result.selectedModel) ? result.selectedModel : models[0];
  els.aiModelSelect.value = selectedModel;
  setAiStatus(`已自动读取 ${models.length} 个模型。`);
}

function renderAll() {
  renderNavigation();
  renderHero();
  renderStats();
  renderMarquee();
  renderFocuses();
  renderAbout();
  renderProjectFilters();
  renderProjects();
  renderPromptGallery();
  renderTestimonials();
  renderContact();
  renderFooter();
}

function startLoader() {
  if (!els.loader || !els.loaderPercent) return;
  let loadProgress = 0;
  const interval = setInterval(() => {
    loadProgress += Math.random() * 18 + 5;
    if (loadProgress >= 100) {
      loadProgress = 100;
      clearInterval(interval);
      window.setTimeout(() => {
        els.loader.classList.add("hidden");
      }, 400);
    }
    els.loaderPercent.textContent = `${Math.floor(loadProgress)}%`;
  }, 180);
}

function startTypingEffect() {
  if (!phrases.length || !els.typed) return;
  const current = phrases[phraseIndex];

  if (isDeleting) {
    els.typed.textContent = current.substring(0, charIndex - 1);
    charIndex -= 1;
  } else {
    els.typed.textContent = current.substring(0, charIndex + 1);
    charIndex += 1;
  }

  let delay = isDeleting ? 30 : 55;

  if (!isDeleting && charIndex === current.length) {
    delay = 1800;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    delay = 400;
  }

  window.setTimeout(startTypingEffect, delay);
}

function setupCursor() {
  if (!els.cursorDot || !els.cursorRing) return;

  const canUseCustomCursor = window.matchMedia(
    "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
  ).matches;

  if (!canUseCustomCursor) return;

  document.body.classList.add("has-custom-cursor");
  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;

  document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    els.cursorDot.style.left = `${mouseX}px`;
    els.cursorDot.style.top = `${mouseY}px`;
  });

  document.addEventListener("mouseover", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("a, button, .project-card, .filter-btn, .social-link")) {
      els.cursorRing.classList.add("hovering");
    }
  });

  document.addEventListener("mouseout", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("a, button, .project-card, .filter-btn, .social-link")) {
      els.cursorRing.classList.remove("hovering");
    }
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    els.cursorRing.style.left = `${ringX}px`;
    els.cursorRing.style.top = `${ringY}px`;
    requestAnimationFrame(animateRing);
  }

  animateRing();
}

function setupParticles() {
  const canvas = els.particleCanvas;
  const ctx = canvas?.getContext("2d");

  if (!canvas || !ctx) return;

  const particles = [];
  const mouse = { x: 0, y: 0 };
  const particleCount = 80;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1
    };
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(212, 168, 83, ${0.06 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => {
      const dx = particle.x - mouse.x;
      const dy = particle.y - mouse.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 120) {
        const force = (120 - dist) / 120;
        particle.x += dx * force * 0.02;
        particle.y += dy * force * 0.02;
      }

      particle.x += particle.speedX;
      particle.y += particle.speedY;

      if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 168, 83, ${particle.opacity})`;
      ctx.fill();
    });

    drawLines();
    requestAnimationFrame(animate);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  });

  for (let index = 0; index < particleCount; index += 1) {
    particles.push(createParticle());
  }

  animate();
}

function setupTestimonials() {
  if (!els.testimonialsTrack || !els.testPrev || !els.testNext) return;

  function moveTestimonials(direction) {
    const firstCard = els.testimonialsTrack.querySelector(".testimonial-card");
    const wrapper = els.testimonialsTrack.parentElement;
    if (!firstCard || !wrapper) return;

    const cardWidth = firstCard.offsetWidth + 24;
    const maxScroll = Math.max(0, els.testimonialsTrack.scrollWidth - wrapper.offsetWidth);
    testimonialOffset += direction * cardWidth;
    testimonialOffset = Math.max(0, Math.min(testimonialOffset, maxScroll));
    els.testimonialsTrack.style.transform = `translateX(-${testimonialOffset}px)`;
  }

  function stopAutoScroll() {
    if (testimonialAutoScroll) {
      clearInterval(testimonialAutoScroll);
      testimonialAutoScroll = null;
    }
  }

  function startAutoScroll() {
    const wrapper = els.testimonialsTrack.parentElement;
    if (!wrapper) return;

    stopAutoScroll();
    testimonialAutoScroll = setInterval(() => {
      const maxScroll = Math.max(0, els.testimonialsTrack.scrollWidth - wrapper.offsetWidth);
      if (testimonialOffset >= maxScroll) {
        testimonialOffset = 0;
        els.testimonialsTrack.style.transform = "translateX(0)";
      } else {
        moveTestimonials(1);
      }
    }, 4000);
  }

  els.testPrev.addEventListener("click", () => moveTestimonials(-1));
  els.testNext.addEventListener("click", () => moveTestimonials(1));

  const wrapper = els.testimonialsTrack.parentElement;
  if (wrapper) {
    wrapper.addEventListener("mouseenter", stopAutoScroll);
    wrapper.addEventListener("mouseleave", startAutoScroll);
  }

  window.addEventListener("resize", () => {
    testimonialOffset = 0;
    els.testimonialsTrack.style.transform = "translateX(0)";
  });

  startAutoScroll();
}

function setupNav() {
  if (!els.nav || !els.navLinks || !els.backToTop || !els.hamburger) return;

  window.addEventListener("scroll", () => {
    els.nav.classList.toggle("scrolled", window.scrollY > 50);
    els.backToTop.classList.toggle("visible", window.scrollY > 600);

    if (els.scrollProgress) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
      els.scrollProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }

    const sections = document.querySelectorAll("section[id]");
    let current = "";
    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 200) {
        current = section.id;
      }
    });

    els.navLinks.querySelectorAll("a").forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
  });

  els.backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  els.hamburger.addEventListener("click", () => {
    if (els.navLinks.style.display === "flex") {
      els.navLinks.style.display = "none";
    } else {
      els.navLinks.style.display = "flex";
      els.navLinks.style.flexDirection = "column";
      els.navLinks.style.position = "absolute";
      els.navLinks.style.top = "72px";
      els.navLinks.style.left = "0";
      els.navLinks.style.right = "0";
      els.navLinks.style.background = "var(--glass)";
      els.navLinks.style.backdropFilter = "blur(20px)";
      els.navLinks.style.padding = "20px";
      els.navLinks.style.gap = "16px";
      els.navLinks.style.borderBottom = "1px solid var(--glass-border)";
    }
  });

  els.navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 900) {
        els.navLinks.style.display = "none";
      }
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      [
        "display",
        "flexDirection",
        "position",
        "top",
        "left",
        "right",
        "background",
        "backdropFilter",
        "padding",
        "gap",
        "borderBottom"
      ].forEach((property) => {
        els.navLinks.style[property] = "";
      });
    }
  });

  window.dispatchEvent(new Event("scroll"));
}

function setupModal() {
  if (!els.modalClose || !els.modalOverlay) return;

  els.modalClose.addEventListener("click", () => {
    els.modalOverlay.classList.remove("active");
  });

  els.modalOverlay.addEventListener("click", (event) => {
    if (event.target === els.modalOverlay) {
      els.modalOverlay.classList.remove("active");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      els.modalOverlay.classList.remove("active");
    }
  });
}

function setupCopyActions() {
  if (!els.contactDetails) return;

  els.contactDetails.addEventListener("click", async (event) => {
    const target = event.target instanceof Element ? event.target.closest("[data-copy]") : null;
    if (!target) return;

    const copyValue = target.getAttribute("data-copy");
    if (!copyValue) return;

    try {
      await navigator.clipboard.writeText(copyValue);
      target.textContent = "已复制";
      window.setTimeout(() => {
        target.textContent = "复制";
      }, 1400);
    } catch (error) {
      console.error(error);
      target.textContent = "复制失败";
      window.setTimeout(() => {
        target.textContent = "复制";
      }, 1400);
    }
  });
}

function setupForm() {
  if (!els.contactForm || !els.contactSubmitText || !els.contactFormStatus) return;

  els.contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
      name: els.contactName?.value?.trim() || "",
      email: els.contactEmailField?.value?.trim() || "",
      projectType: els.contactProjectType?.value?.trim() || "",
      message: els.contactMessage?.value?.trim() || ""
    };

    els.contactSubmitText.disabled = true;
    els.contactFormStatus.textContent = "正在发送留言...";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "留言发送失败");
      }

      els.contactForm.reset();
      els.contactFormStatus.textContent = result.message || "留言发送成功。";
    } catch (error) {
      console.error(error);
      els.contactFormStatus.textContent = error.message || "留言发送失败，请稍后重试。";
    } finally {
      els.contactSubmitText.disabled = false;
    }
  });
}

async function loadPromptGallery() {
  try {
    const response = await fetch("/api/prompt-gallery");
    if (!response.ok) {
      throw new Error("提示词展廊加载失败");
    }

    promptGallery = await response.json();
    return promptGallery;
  } catch (error) {
    console.error(error);
    promptGallery = null;
    return null;
  }
}

async function loadContent() {
  if (siteContent) {
    return siteContent;
  }

  const response = await fetch("/api/content");
  if (!response.ok) {
    throw new Error("站点内容加载失败");
  }
  siteContent = await response.json();
}

function setupAiLab() {
  if (!els.aiChatForm || !els.aiChatInput || !els.aiSendBtn || !els.aiClearChat || !els.aiRefreshModels) return;

  renderAiMessages();

  els.aiRefreshModels.addEventListener("click", () => {
    refreshAiModels().catch((error) => {
      console.error(error);
      setAiStatus(error.message || "模型列表读取失败", true);
    });
  });

  els.aiClearChat.addEventListener("click", () => {
    aiConversation = [];
    renderAiMessages();
    setAiStatus("对话已清空。");
  });

  els.aiChatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = els.aiChatInput.value.trim();
    if (!input) return;

    aiConversation.push({ role: "user", content: input });
    renderAiMessages();
    els.aiChatInput.value = "";
    els.aiSendBtn.disabled = true;
    setAiStatus("正在请求模型回答...");

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: aiConversation,
          model: els.aiModelSelect?.value || ""
        })
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "模型请求失败");
      }

      aiConversation.push({
        role: "assistant",
        content: result.text || "模型已返回结果，但没有解析到文本内容。"
      });
      renderAiMessages();
      setAiStatus(`当前使用模型：${els.aiModelSelect?.value || aiPublicConfig?.model || "未指定"}`);
    } catch (error) {
      console.error(error);
      aiConversation.push({
        role: "assistant",
        content: `出错了：${error.message || "模型请求失败"}`
      });
      renderAiMessages();
      setAiStatus(error.message || "模型请求失败", true);
    } finally {
      els.aiSendBtn.disabled = false;
    }
  });
}

async function init() {
  try {
    await Promise.all([loadContent(), loadAiPublicConfig(), loadPromptGallery()]);
    renderAll();
    startLoader();
    setupCursor();
    setupParticles();
    setupNav();
    setupModal();
    setupCopyActions();
    setupForm();
    setupAiLab();
    setupTestimonials();
    observeReveals();
    if (aiPublicConfig?.enabled && aiPublicConfig?.configured) {
      refreshAiModels(false).catch((error) => {
        console.error(error);
        setAiStatus(error.message || "模型列表读取失败", true);
      });
    }
    window.setTimeout(startTypingEffect, 2600);
  } catch (error) {
    console.error(error);
    alert("站点初始化失败，请检查 /api/content 接口或内容文件。");
  }
}

init();
