/**
 * VERIFACT AI — CLIENT WORKSPACE ENGINE
 * Modular Frontend Application Logic
 */

const API_BASE = "http://127.0.0.1:8000";
let selectedLang = "en";
let inputMode = "text";

// -------------------------------------------------------------
// THEME MANAGEMENT (WHITE MODE DEFAULT)
// -------------------------------------------------------------
function getStoredTheme() {
  return localStorage.getItem("vf_theme") || "light"; // WHITE MODE DEFAULT!
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("vf_theme", theme);
  
  const themeIcon = document.getElementById("themeIcon");
  const themeLabel = document.getElementById("themeLabel");

  if (themeIcon && themeLabel) {
    if (theme === "dark") {
      themeIcon.textContent = "🌙";
      themeLabel.textContent = "Dark Mode";
    } else {
      themeIcon.textContent = "☀️";
      themeLabel.textContent = "White Mode";
    }
  }

  updateTabStyles();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  applyTheme(next);
}

function updateTabStyles() {
  setLanguage(selectedLang);
  setInputMode(inputMode);
  if (typeof window.setBackgroundPattern === "function") {
    window.setBackgroundPattern(localStorage.getItem("vf_bg_pattern") || "grid");
  }
}

// -------------------------------------------------------------
// CHARACTER COUNT & SHORTCUTS
// -------------------------------------------------------------
function updateCharCount() {
  const input = document.getElementById("newsInput");
  const countEl = document.getElementById("charCount");
  if (input && countEl) {
    countEl.textContent = `${input.value.length} chars`;
  }
}

document.addEventListener("keydown", function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    verifyNews();
  }
});

// -------------------------------------------------------------
// BACKEND API STATUS
// -------------------------------------------------------------
async function initDashboard() {
  applyTheme(getStoredTheme());
  if (typeof window.setBackgroundPattern === "function") {
    window.setBackgroundPattern(localStorage.getItem("vf_bg_pattern") || "grid");
  }

  // Setup drag-and-drop feedback for image forensics
  const dropzone = document.getElementById("imageDropzone");
  const fileInput = document.getElementById("imageFileInput");
  if (dropzone && fileInput) {
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("border-violet-500", "bg-violet-50/50");
    });
    dropzone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      dropzone.classList.remove("border-violet-500", "bg-violet-50/50");
    });
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("border-violet-500", "bg-violet-50/50");
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        previewSelectedImage();
      }
    });
  }

  const dot = document.getElementById("statusDot");
  const text = document.getElementById("statusText");

  try {
    const res = await fetch(`${API_BASE}/openapi.json`);
    if (!res.ok) throw new Error("API unreachable");
    if (dot) dot.className = "w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
    if (text) text.textContent = "Engine Online (/predict & /predict-image)";
  } catch (err) {
    if (dot) dot.className = "w-2 h-2 rounded-full bg-zinc-400";
    if (text) text.textContent = "Engine Offline (Run python run.py)";
  }
}

function setLanguage(lang) {
  selectedLang = lang;
  const btnEn = document.getElementById("btnEn");
  const btnBn = document.getElementById("btnBn");
  const input = document.getElementById("newsInput");

  const activeStyle = "background: var(--tab-active-bg); color: var(--tab-active-text); box-shadow: var(--tab-active-shadow); font-weight: 600;";
  const inactiveStyle = "background: transparent; color: var(--tab-inactive-text); box-shadow: none; font-weight: 500;";

  if (btnEn && btnBn) {
    if (lang === "en") {
      btnEn.style = activeStyle;
      btnBn.style = inactiveStyle;
      if (input) input.placeholder = "Paste an English news headline, claim, or article paragraph here...";
    } else {
      btnBn.style = activeStyle;
      btnEn.style = inactiveStyle;
      if (input) input.placeholder = "বাংলা সংবাদ শিরোনাম, দাবি অথবা অনুচ্ছেদ এখানে লিখুন...";
    }
  }
}

function setInputMode(mode) {
  inputMode = mode;
  const tabText = document.getElementById("tabText");
  const tabUrl = document.getElementById("tabUrl");
  const tabImage = document.getElementById("tabImage");

  const textContainer = document.getElementById("textInputContainer");
  const urlContainer = document.getElementById("urlInputContainer");
  const imageContainer = document.getElementById("imageInputContainer");
  const langSelector = document.getElementById("langSelector");
  const btnLabel = document.getElementById("btnLabel");

  const activeStyle = "background: var(--tab-active-bg); color: var(--tab-active-text); box-shadow: var(--tab-active-shadow); font-weight: 600;";
  const inactiveStyle = "background: transparent; color: var(--tab-inactive-text); box-shadow: none; font-weight: 500;";

  if (tabText) tabText.style = mode === "text" ? activeStyle : inactiveStyle;
  if (tabUrl) tabUrl.style = mode === "url" ? activeStyle : inactiveStyle;
  if (tabImage) tabImage.style = mode === "image" ? activeStyle : inactiveStyle;

  if (textContainer) textContainer.classList.toggle("hidden", mode !== "text");
  if (urlContainer) urlContainer.classList.toggle("hidden", mode !== "url");
  if (imageContainer) imageContainer.classList.toggle("hidden", mode !== "image");
  if (langSelector) langSelector.classList.toggle("hidden", mode === "image");

  if (btnLabel) {
    btnLabel.textContent = mode === "image" ? "Analyze Image Forensics" : "Analyze & Verify Claim";
  }
}

function previewSelectedImage() {
  const fileInput = document.getElementById("imageFileInput");
  const wrapper = document.getElementById("imagePreviewWrapper");
  const preview = document.getElementById("imagePreview");
  const fileInfo = document.getElementById("imageFileInfo");

  if (fileInput && fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    const sizeKb = (file.size / 1024).toFixed(1);
    if (fileInfo) fileInfo.textContent = `${file.name} (${sizeKb} KB)`;
    if (preview) preview.src = URL.createObjectURL(file);
    if (wrapper) wrapper.classList.remove("hidden");
  } else {
    if (preview) preview.src = "";
    if (fileInfo) fileInfo.textContent = "";
    if (wrapper) wrapper.classList.add("hidden");
  }
}

function clearImagePreview() {
  const fileInput = document.getElementById("imageFileInput");
  const preview = document.getElementById("imagePreview");
  const wrapper = document.getElementById("imagePreviewWrapper");
  const fileInfo = document.getElementById("imageFileInfo");

  if (fileInput) fileInput.value = "";
  if (preview) preview.src = "";
  if (fileInfo) fileInfo.textContent = "";
  if (wrapper) wrapper.classList.add("hidden");
}

function loadSample(lang) {
  setInputMode("text");
  setLanguage(lang);
  const input = document.getElementById("newsInput");
  if (input) {
    if (lang === "en") {
      input.value = "NASA scientists confirm discovery of definitive evidence of subterranean water ice reserves on the Moon ahead of upcoming manned lunar explorations.";
    } else {
      input.value = "বাংলাদেশ ব্যাংক নতুন মুদ্রানীতি ঘোষণা করেছে এবং মূল্যস্ফীতি নিয়ন্ত্রণে নীতিগত সুদের হার ৫০ ভিত্তি পয়েন্ট বাড়ানোর সিদ্ধান্ত নিয়েছে।";
    }
  }
  updateCharCount();
}

function clearAll() {
  const textInput = document.getElementById("newsInput");
  const urlInput = document.getElementById("newsUrlInput");
  const resultSec = document.getElementById("resultSection");
  const errBox = document.getElementById("errorBox");

  if (textInput) textInput.value = "";
  if (urlInput) urlInput.value = "";
  clearImagePreview();
  if (resultSec) resultSec.classList.add("hidden");
  if (errBox) errBox.classList.add("hidden");
  updateCharCount();
}

async function verifyNews() {
  const errorBox = document.getElementById("errorBox");
  const resultSection = document.getElementById("resultSection");
  const verifyBtn = document.getElementById("verifyBtn");
  const btnLabel = document.getElementById("btnLabel");
  const btnSpinner = document.getElementById("btnSpinner");

  if (errorBox) errorBox.classList.add("hidden");

  const textVal = document.getElementById("newsInput") ? document.getElementById("newsInput").value.trim() : "";
  const urlVal = document.getElementById("newsUrlInput") ? document.getElementById("newsUrlInput").value.trim() : "";
  const fileInput = document.getElementById("imageFileInput");
  const imageFile = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;

  if (inputMode === "text" && !textVal) {
    if (errorBox) {
      errorBox.textContent = "Please enter a news claim or article text before verifying.";
      errorBox.classList.remove("hidden");
    }
    return;
  }
  if (inputMode === "url" && !urlVal) {
    if (errorBox) {
      errorBox.textContent = "Please enter a valid article URL before verifying.";
      errorBox.classList.remove("hidden");
    }
    return;
  }
  if (inputMode === "image" && !imageFile) {
    if (errorBox) {
      errorBox.textContent = "Please select an image file before analyzing.";
      errorBox.classList.remove("hidden");
    }
    return;
  }

  if (verifyBtn) verifyBtn.disabled = true;
  if (btnLabel) btnLabel.textContent = "Analyzing...";
  if (btnSpinner) btnSpinner.classList.remove("hidden");

  try {
    if (inputMode === "image") {
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch(`${API_BASE}/predict-image?quality=90`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail ? (typeof data.detail === "object" ? JSON.stringify(data.detail) : data.detail) : "Image analysis failed.");
      }

      renderImageResults(data);
      if (resultSection) resultSection.classList.remove("hidden");
    } else {
      const payload = {
        text: inputMode === "text" ? textVal : null,
        url: inputMode === "url" ? urlVal : null,
        language: selectedLang
      };

      const response = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail ? (typeof data.detail === "object" ? JSON.stringify(data.detail) : data.detail) : "Verification request failed.");
      }

      renderResults(data);
      if (resultSection) resultSection.classList.remove("hidden");
    }
  } catch (err) {
    if (errorBox) {
      errorBox.textContent = `Error: ${err.message}. Ensure your FastAPI server is running at ${API_BASE}.`;
      errorBox.classList.remove("hidden");
    }
  } finally {
    if (verifyBtn) verifyBtn.disabled = false;
    if (btnLabel) btnLabel.textContent = inputMode === "image" ? "Analyze Image Forensics" : "Analyze & Verify Claim";
    if (btnSpinner) btnSpinner.classList.add("hidden");
  }
}

function renderImageResults(data) {
  const rawJson = document.getElementById("rawJson");
  const langBadge = document.getElementById("langBadge");
  const verdictSubtitle = document.getElementById("verdictSubtitle");
  const evidenceHeading = document.getElementById("evidenceHeading");
  const sourceBadge = document.getElementById("sourceBadge");

  if (rawJson) rawJson.textContent = JSON.stringify(data, null, 2);
  if (langBadge) langBadge.textContent = data.features?.format || "IMAGE";
  if (verdictSubtitle) verdictSubtitle.textContent = `Mode: ${data.mode || "heuristic_baseline"}`;
  if (evidenceHeading) evidenceHeading.textContent = "Error Level Analysis (ELA) Forensic Metrics";
  if (sourceBadge) sourceBadge.textContent = data.filename || "Uploaded Image";

  const verdictStr = String(data.verdict || "UNKNOWN").toUpperCase();
  const isSuspicious = verdictStr.includes("SUSPICIOUS") || verdictStr.includes("FAKE") || verdictStr.includes("EDITED");

  const verdictTitle = document.getElementById("verdictTitle");
  const verdictCard = document.getElementById("verdictCard");
  const confidenceBar = document.getElementById("confidenceBar");
  const confidenceLevel = document.getElementById("confidenceLevel");

  if (verdictTitle) verdictTitle.textContent = data.verdict || "ANALYZED";
  if (isSuspicious) {
    if (verdictTitle) verdictTitle.className = "text-xl font-black mt-3.5 tracking-tight text-amber-600 dark:text-amber-400";
    if (verdictCard) verdictCard.style.borderLeft = "5px solid #f59e0b";
    if (confidenceBar) confidenceBar.style.background = "#f59e0b";
    if (confidenceLevel) confidenceLevel.textContent = "High Local Compression Discrepancy";
    if (langBadge) langBadge.className = "text-[10px] font-mono px-2.5 py-0.5 rounded-full badge-amber font-bold";
  } else {
    if (verdictTitle) verdictTitle.className = "text-xl font-black mt-3.5 tracking-tight text-emerald-700 dark:text-emerald-400";
    if (verdictCard) verdictCard.style.borderLeft = "5px solid #10b981";
    if (confidenceBar) confidenceBar.style.background = "#10b981";
    if (confidenceLevel) confidenceLevel.textContent = "Uniform Error Level Spectrum";
    if (langBadge) langBadge.className = "text-[10px] font-mono px-2.5 py-0.5 rounded-full badge-emerald font-bold";
  }

  let conf = Number(data.confidence ?? 0.5);
  if (conf <= 1) conf = Math.round(conf * 100);
  else conf = Math.round(conf);
  
  const confText = document.getElementById("confidenceText");
  if (confText) confText.textContent = `${conf}%`;
  if (confidenceBar) confidenceBar.style.width = `${Math.min(Math.max(conf, 5), 100)}%`;

  const f = data.features || {};
  const matchesContainer = document.getElementById("matchesContainer");
  if (matchesContainer) {
    matchesContainer.innerHTML = `
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div class="p-3.5 rounded-xl mono-card-subtle border border-indigo-200/50 dark:border-indigo-800/40">
          <div class="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">ela_mean</div>
          <div class="text-base font-extrabold mt-1" style="color: var(--text-main);">${f.ela_mean ?? "-"}</div>
          <span class="text-[9px]" style="color: var(--text-muted);">&lt; 4.5 typical</span>
        </div>
        <div class="p-3.5 rounded-xl mono-card-subtle border border-purple-200/50 dark:border-purple-800/40">
          <div class="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">ela_std</div>
          <div class="text-base font-extrabold mt-1" style="color: var(--text-main);">${f.ela_std ?? "-"}</div>
          <span class="text-[9px]" style="color: var(--text-muted);">Standard deviation</span>
        </div>
        <div class="p-3.5 rounded-xl mono-card-subtle border border-amber-200/50 dark:border-amber-800/40">
          <div class="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">ela_max</div>
          <div class="text-base font-extrabold mt-1" style="color: var(--text-main);">${f.ela_max ?? "-"}</div>
          <span class="text-[9px]" style="color: var(--text-muted);">Max delta pixel</span>
        </div>
        <div class="p-3.5 rounded-xl mono-card-subtle border border-sky-200/50 dark:border-sky-800/40">
          <div class="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400">high_error_ratio</div>
          <div class="text-base font-extrabold mt-1" style="color: var(--text-main);">${f.high_error_ratio ?? "-"}</div>
          <span class="text-[9px]" style="color: var(--text-muted);">Anomaly ratio</span>
        </div>
      </div>
      <div class="p-4 rounded-xl mono-card-subtle text-xs space-y-1.5 font-mono">
        <div><span style="color: var(--text-subtle);">Dimensions & Format:</span> ${f.width ?? "?"}x${f.height ?? "?"} (${f.format ?? "UNKNOWN"}, quality=${f.quality ?? 90})</div>
        <div><span style="color: var(--text-subtle);">Content-Type:</span> ${data.content_type || "N/A"}</div>
      </div>
      <p class="text-xs rounded-xl p-3.5 font-mono pill-theme leading-relaxed">
        ${data.note || "Baseline ELA forensic analysis completed."}
      </p>
    `;
  }
}

function renderResults(data) {
  const verdictSubtitle = document.getElementById("verdictSubtitle");
  const evidenceHeading = document.getElementById("evidenceHeading");
  const rawJson = document.getElementById("rawJson");
  const langBadge = document.getElementById("langBadge");

  if (verdictSubtitle) verdictSubtitle.textContent = "Classification & Retrieval Assessment";
  if (evidenceHeading) evidenceHeading.textContent = "Hybrid Fact Retrieval & Pattern Analysis";
  if (rawJson) rawJson.textContent = JSON.stringify(data, null, 2);
  if (langBadge) langBadge.textContent = data.language || (selectedLang === "bn" ? "Bangla" : "English");

  const rawLabel = String(data.prediction ?? "UNKNOWN").toUpperCase();
  const isFake = rawLabel.includes("FAKE") || rawLabel.includes("FALSE") || rawLabel === "0";

  const verdictTitle = document.getElementById("verdictTitle");
  const verdictCard = document.getElementById("verdictCard");
  const confidenceBar = document.getElementById("confidenceBar");
  const confidenceLevel = document.getElementById("confidenceLevel");

  if (isFake) {
    if (verdictTitle) {
      verdictTitle.textContent = "FAKE / MISLEADING";
      verdictTitle.className = "text-2xl font-black mt-3.5 tracking-tight text-rose-600 dark:text-rose-400";
    }
    if (verdictCard) verdictCard.style.borderLeft = "5px solid #f43f5e";
    if (confidenceBar) confidenceBar.style.background = "#f43f5e";
    if (confidenceLevel) {
      confidenceLevel.textContent = "Linguistic & Empirical Anomaly Detected";
      confidenceLevel.className = "text-[10px] font-mono mt-1 text-rose-600 dark:text-rose-400 font-semibold";
    }
    if (langBadge) langBadge.className = "text-[10px] font-mono px-2.5 py-0.5 rounded-full badge-amber font-bold";
  } else {
    if (verdictTitle) {
      verdictTitle.textContent = "REAL / AUTHENTIC";
      verdictTitle.className = "text-2xl font-black mt-3.5 tracking-tight text-emerald-700 dark:text-emerald-400";
    }
    if (verdictCard) verdictCard.style.borderLeft = "5px solid #10b981";
    if (confidenceBar) confidenceBar.style.background = "#10b981";
    if (confidenceLevel) {
      confidenceLevel.textContent = "Corroborated by Verified Records";
      confidenceLevel.className = "text-[10px] font-mono mt-1 text-emerald-600 dark:text-emerald-400 font-semibold";
    }
    if (langBadge) langBadge.className = "text-[10px] font-mono px-2.5 py-0.5 rounded-full badge-emerald font-bold";
  }

  let conf = Number(data.confidence ?? 85);
  if (conf <= 1) conf = Math.round(conf * 100);
  else conf = Math.round(conf);

  const confText = document.getElementById("confidenceText");
  if (confText) confText.textContent = `${conf}%`;
  if (confidenceBar) confidenceBar.style.width = `${Math.min(Math.max(conf, 5), 100)}%`;

  const matchesContainer = document.getElementById("matchesContainer");
  if (matchesContainer) {
    matchesContainer.innerHTML = "";

    if (Array.isArray(data.explanations) && data.explanations.length > 0) {
      const expBox = document.createElement("div");
      expBox.className = "p-4 rounded-xl mono-card-subtle space-y-2";
      expBox.innerHTML = `
        <div class="text-[11px] font-bold uppercase tracking-wider font-mono flex items-center gap-2" style="color: var(--text-main);">
          <span class="w-1.5 h-1.5 rounded-full" style="background: var(--text-main);"></span>
          Detected Linguistic & Stylistic Patterns
        </div>
        <ul class="list-disc list-inside text-xs space-y-1.5 pl-1 leading-relaxed" style="color: var(--text-secondary);">
          ${data.explanations.map(item => `<li>${item}</li>`).join("")}
        </ul>
      `;
      matchesContainer.appendChild(expBox);
    }

    const matches = data.actual_news_matches || [];
    if (Array.isArray(matches) && matches.length > 0) {
      matches.forEach(item => {
        const card = document.createElement("div");
        card.className = "p-4 rounded-xl mono-card-subtle space-y-1.5 transition hover:translate-y-[-1px]";
        if (typeof item === "string") {
          card.textContent = item;
        } else {
          const title = item.title || item.headline || "Verified Historical Match";
          const snippet = item.content || item.text || item.snippet || JSON.stringify(item);
          const score = item.similarity_score ? ` (Match: ${Math.round(item.similarity_score * 100)}%)` : "";
          card.innerHTML = `<div class="font-bold text-xs" style="color: var(--text-main);">${title}${score}</div><p class="text-xs leading-relaxed" style="color: var(--text-secondary);">${snippet}</p>`;
        }
        matchesContainer.appendChild(card);
      });
    } else {
      const emptyNote = document.createElement("p");
      emptyNote.className = "text-xs font-mono p-2";
      emptyNote.style.color = "var(--text-muted)";
      emptyNote.textContent = isFake
        ? "No matching verified article found in local corpus."
        : "Claim verified as authentic by the bilingual ML classification pipeline.";
      matchesContainer.appendChild(emptyNote);
    }
  }

  const srcBadge = document.getElementById("sourceBadge");
  if (srcBadge) srcBadge.textContent = `${data.language || "Bilingual"} Hybrid Engine`;

  // Render ground-truth verified sources links
  const linksList = document.getElementById("linksList");
  const linksContainer = document.getElementById("linksContainer");
  if (linksList && linksContainer) {
    linksList.innerHTML = "";
    const urls = [];
    if (Array.isArray(data.sources)) {
      data.sources.forEach(s => urls.push(s));
    }
    if (Array.isArray(data.actual_news_matches)) {
      data.actual_news_matches.forEach(m => {
        if (m && m.url) urls.push({ url: m.url, title: m.title || m.headline || m.url });
      });
    }
    if (urls.length > 0) {
      urls.forEach(u => {
        const urlStr = typeof u === "string" ? u : (u.url || "#");
        const titleStr = typeof u === "string" ? u : (u.title || urlStr);
        const li = document.createElement("li");
        li.innerHTML = `<a href="${urlStr}" target="_blank" rel="noopener noreferrer" class="text-sky-600 dark:text-sky-400 hover:opacity-80 transition inline-flex items-center gap-1.5 break-all">
          <svg class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          ${titleStr}
        </a>`;
        linksList.appendChild(li);
      });
      linksContainer.classList.remove("hidden");
    } else {
      linksContainer.classList.add("hidden");
    }
  }
}

function copyJsonPayload(e) {
  if (e) e.stopPropagation();
  const rawJson = document.getElementById("rawJson");
  const code = rawJson ? rawJson.textContent : "";
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById("copyJsonBtnText");
    if (btn) {
      btn.textContent = "Copied!";
      setTimeout(() => { btn.textContent = "Copy JSON"; }, 2000);
    }
  });
}

// Auto-initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initDashboard);
