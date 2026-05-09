// @ts-nocheck
const API_BASE = "";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80";
const VEHICLE_CONDITION_DEFAULT_STATUS = "ORIGINAL";
const VEHICLE_CONDITION_PARTS = [
  { key: "on_tampon", label: "On Tampon" },
  { key: "kaput", label: "Motor Kaputu" },
  { key: "sol_on_camurluk", label: "Sol On Camurluk" },
  { key: "sag_on_camurluk", label: "Sag On Camurluk" },
  { key: "sol_on_kapi", label: "Sol On Kapi" },
  { key: "sag_on_kapi", label: "Sag On Kapi" },
  { key: "tavan", label: "Tavan" },
  { key: "sol_arka_kapi", label: "Sol Arka Kapi" },
  { key: "sag_arka_kapi", label: "Sag Arka Kapi" },
  { key: "sol_arka_camurluk", label: "Sol Arka Camurluk" },
  { key: "sag_arka_camurluk", label: "Sag Arka Camurluk" },
  { key: "bagaj", label: "Bagaj" },
  { key: "arka_tampon", label: "Arka Tampon" },
  { key: "sol_ayna", label: "Sol Ayna" },
  { key: "sag_ayna", label: "Sag Ayna" },
];
const VEHICLE_CONDITION_PART_PATHS = {
  on_tampon: "M108 84 H212 Q218 84 218 90 V108 Q218 114 212 114 H108 Q102 114 102 108 V90 Q102 84 108 84 Z",
  kaput: "M100 126 Q160 98 220 126 L212 208 Q160 188 108 208 Z",
  tavan: "M116 210 Q160 188 204 210 L210 302 Q160 322 110 302 Z",
  bagaj: "M112 308 Q160 326 208 308 L202 350 Q160 364 118 350 Z",
  arka_tampon: "M108 366 H212 Q218 366 218 372 V390 Q218 396 212 396 H108 Q102 396 102 390 V372 Q102 366 108 366 Z",
  sol_on_camurluk: "M54 132 L94 138 L104 200 L54 216 Z",
  sol_on_kapi: "M54 216 L104 202 L106 258 L54 274 Z",
  sol_arka_kapi: "M54 274 L106 260 L100 316 L54 330 Z",
  sol_arka_camurluk: "M54 330 L100 318 L90 372 L54 372 Z",
  sag_on_camurluk: "M266 132 L226 138 L216 200 L266 216 Z",
  sag_on_kapi: "M266 216 L216 202 L214 258 L266 274 Z",
  sag_arka_kapi: "M266 274 L214 260 L220 316 L266 330 Z",
  sag_arka_camurluk: "M266 330 L220 318 L230 372 L266 372 Z",
  sol_ayna: "M56 116 H88 V138 H56 Z",
  sag_ayna: "M264 116 H232 V138 H264 Z",
};
const VEHICLE_CONDITION_TEXT_POSITIONS = {
  on_tampon: [160, 100],
  kaput: [160, 159],
  tavan: [160, 256],
  bagaj: [160, 336],
  arka_tampon: [160, 382],
  sol_on_camurluk: [75, 174],
  sol_on_kapi: [76, 242],
  sol_arka_kapi: [76, 302],
  sol_arka_camurluk: [74, 353],
  sag_on_camurluk: [245, 174],
  sag_on_kapi: [244, 242],
  sag_arka_kapi: [244, 302],
  sag_arka_camurluk: [246, 353],
  sol_ayna: [72, 129],
  sag_ayna: [248, 129],
};

const state = {
  lotNo: "",
  item: null,
  gallery: [],
  activeImageIndex: 0,
  activeTab: "basic",
};

const elements = {
  auctionTitle: document.getElementById("auctionTitle"),
  auctionMeta: document.getElementById("auctionMeta"),
  galleryMainImage: document.getElementById("galleryMainImage"),
  galleryThumbs: document.getElementById("galleryThumbs"),
  galleryPrevBtn: document.getElementById("galleryPrevBtn"),
  galleryNextBtn: document.getElementById("galleryNextBtn"),
  tabNav: document.getElementById("tabNav"),
  basicInfoGrid: document.getElementById("basicInfoGrid"),
  auctionInfoGrid: document.getElementById("auctionInfoGrid"),
  descriptionBox: document.getElementById("descriptionBox"),
  equipmentList: document.getElementById("equipmentList"),
  expertiseConditionMap: document.getElementById("expertiseConditionMap"),
  paintedPartsList: document.getElementById("paintedPartsList"),
  changedPartsList: document.getElementById("changedPartsList"),
  expertiseFiles: document.getElementById("expertiseFiles"),
  documentFiles: document.getElementById("documentFiles"),
};

init().catch((error) => {
  console.error(error);
  showPageError(error?.message || "Sayfa yüklenemedi.");
});

async function init() {
  state.lotNo = resolveLotNoFromUrl();
  if (!state.lotNo) {
    showPageError("İhale no bulunamadı.");
    return;
  }

  bindEvents();
  await loadAuctionDetail();
  renderAll();
}

function bindEvents() {
  elements.tabNav.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-tab]");
    if (!button) return;
    state.activeTab = String(button.dataset.tab || "basic");
    renderTabs();
  });

  elements.galleryThumbs.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-image-index]");
    if (!button) return;
    const index = Number(button.dataset.imageIndex || 0);
    if (!Number.isFinite(index)) return;
    setActiveImage(index);
  });

  elements.galleryPrevBtn.addEventListener("click", () => {
    setActiveImage(state.activeImageIndex - 1);
  });

  elements.galleryNextBtn.addEventListener("click", () => {
    setActiveImage(state.activeImageIndex + 1);
  });
}

async function loadAuctionDetail() {
  const data = await apiFetch(`/api/auctions/${encodeURIComponent(state.lotNo)}`);
  const item = data.item || {};
  const gallery = normalizeGallery(item.gallery || item.gallery_json || [], item.image_url);
  const expertiseFiles = normalizeFiles(item.expertise_files || item.expertise_files_json || []);
  const documentFiles = normalizeFiles(item.document_files || item.document_files_json || []);
  const equipment = splitEquipment(String(item.extra_equipment || ""));
  const vehicleConditionMap = normalizeVehicleConditionMap(
    item.vehicle_condition_map_json || item.vehicle_condition_map || item.vehicleConditionMap || {}
  );

  state.item = {
    ...item,
    lot_no: String(item.lot_no || state.lotNo || "").toUpperCase(),
    gallery,
    expertise_files: expertiseFiles,
    document_files: documentFiles,
    vehicle_condition_map: vehicleConditionMap,
    equipment,
  };
  state.gallery = gallery;
  state.activeImageIndex = 0;
}

function renderAll() {
  const item = state.item;
  if (!item) {
    showPageError("İhale verisi bulunamadı.");
    return;
  }

  elements.auctionTitle.textContent = `${item.title || "İhale"} (${item.lot_no || "-"})`;
  elements.auctionMeta.textContent = `${item.product_group || "Genel"} / ${item.category || "Genel"} | ${item.city || "-"}`;

  renderGallery();
  renderTabs();
  renderInfoCards();
  renderDescription();
  renderEquipment();
  renderVehicleConditionMap();
  renderFileBlocks("expertise");
  renderFileBlocks("document");
}

function renderTabs() {
  const tabButtons = Array.from(elements.tabNav.querySelectorAll("button[data-tab]"));
  for (const button of tabButtons) {
    const tab = String(button.dataset.tab || "");
    button.classList.toggle("active", tab === state.activeTab);
  }

  const panels = Array.from(document.querySelectorAll(".tabPanel[data-panel]"));
  for (const panel of panels) {
    const key = String(panel.getAttribute("data-panel") || "");
    panel.classList.toggle("hide", key !== state.activeTab);
  }
}

function renderGallery() {
  if (!state.gallery || state.gallery.length < 1) {
    state.gallery = [DEFAULT_IMAGE];
  }
  setActiveImage(state.activeImageIndex);
  elements.galleryThumbs.innerHTML = state.gallery
    .map(
      (src, index) => `
        <button class="thumbBtn ${index === state.activeImageIndex ? "active" : ""}" type="button" data-image-index="${index}">
          <img src="${escapeHtml(src)}" alt="Gorsel ${index + 1}">
        </button>
      `
    )
    .join("");
}

function setActiveImage(index) {
  if (!state.gallery || state.gallery.length < 1) return;
  const total = state.gallery.length;
  const nextIndex = ((Number(index) % total) + total) % total;
  state.activeImageIndex = nextIndex;
  elements.galleryMainImage.src = state.gallery[nextIndex] || DEFAULT_IMAGE;
  const thumbButtons = Array.from(elements.galleryThumbs.querySelectorAll("button[data-image-index]"));
  for (const button of thumbButtons) {
    const itemIndex = Number(button.dataset.imageIndex || -1);
    button.classList.toggle("active", itemIndex === nextIndex);
  }
}

function renderInfoCards() {
  const item = state.item || {};

  const basicRows = [
    infoRow("Konum", `${item.city || "-"}`),
    infoRow("Kategori", `${item.product_group || "-"} / ${item.category || "-"}`),
    infoRow("Marka", item.vehicle_brand || "-"),
    infoRow("Model", item.vehicle_model || "-"),
    infoRow("Model Yılı", item.vehicle_year ? String(item.vehicle_year) : "-"),
    infoRow("Model Detayı", item.vehicle_model_detail || "-"),
    infoRow("Kilometre", item.vehicle_km !== null && item.vehicle_km !== undefined ? `${item.vehicle_km}` : "-"),
    infoRow("Renk", item.vehicle_color || "-"),
    infoRow("Yakıt Tipi", item.vehicle_fuel_type || "-"),
    infoRow("Şanzıman", item.vehicle_transmission || "-"),
    infoRow("Kasa Tipi", item.vehicle_body_type || "-"),
    infoRow("Motor Hacmi", item.vehicle_engine_volume || "-"),
    infoRow("Motor Gücü", item.vehicle_engine_power || "-"),
    infoRow("Çekiş Türü", item.vehicle_drive_type || "-"),
  ];
  elements.basicInfoGrid.innerHTML = basicRows.join("");

  const auctionRows = [
    infoRow("İhale No", item.lot_no || "-"),
    infoRow("Durum", formatStatus(item.status)),
    infoRow("Başlangıç Tarihi", formatDate(item.starts_at)),
    infoRow("Bitiş Tarihi", formatDate(item.ends_at)),
    infoRow("Başlangıç Bedeli", formatMoney(item.start_price)),
    infoRow("Minimum Artış", formatMoney(item.min_increment)),
    infoRow("Son Teklif", item.current_bid ? formatMoney(item.current_bid) : "-"),
    infoRow("Teklif Sayısı", String(item.bid_count || 0)),
  ];
  elements.auctionInfoGrid.innerHTML = auctionRows.join("");
}

function renderDescription() {
  const text = String(state.item?.description || "").trim();
  elements.descriptionBox.textContent = text || "Açıklama girilmemiş.";
}

function renderEquipment() {
  const rows = Array.isArray(state.item?.equipment) ? state.item.equipment : [];
  if (rows.length < 1) {
    elements.equipmentList.innerHTML = '<li>Ek donanım bilgisi girilmemiş.</li>';
    return;
  }
  elements.equipmentList.innerHTML = rows.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
}

function renderVehicleConditionMap() {
  if (!elements.expertiseConditionMap) return;
  const map = normalizeVehicleConditionMap(state.item?.vehicle_condition_map || {});
  const paintedRows = [];
  const changedRows = [];

  const partsMarkup = VEHICLE_CONDITION_PARTS.map((part) => {
    const status = map[part.key] || VEHICLE_CONDITION_DEFAULT_STATUS;
    if (status === "PAINTED" || status === "LOCAL_PAINTED") {
      paintedRows.push(status === "LOCAL_PAINTED" ? `${part.label} (Lokal)` : part.label);
    } else if (status === "CHANGED") {
      changedRows.push(part.label);
    }
    const statusClass = getVehicleConditionStatusClass(status);
    const pos = VEHICLE_CONDITION_TEXT_POSITIONS[part.key] || [160, 160];
    const path = VEHICLE_CONDITION_PART_PATHS[part.key] || "";
    return `
      <g class="conditionSvgPart ${statusClass}" data-part-key="${part.key}">
        <path d="${path}"></path>
        <text x="${Number(pos[0])}" y="${Number(pos[1])}" text-anchor="middle" dominant-baseline="middle">${escapeHtml(
      getVehicleConditionStatusCode(status)
    )}</text>
      </g>
    `;
  }).join("");

  elements.expertiseConditionMap.innerHTML = `
    <svg class="conditionSvg" viewBox="0 0 320 430" role="img" aria-label="Arac kaporta durum haritasi">
      <g class="conditionBase">
        <path d="M92 76 Q160 46 228 76 L248 182 L248 322 L228 406 Q160 426 92 406 L72 322 L72 182 Z"></path>
        <path d="M114 206 Q160 188 206 206 L212 304 Q160 324 108 304 Z"></path>
        <circle cx="58" cy="178" r="24"></circle>
        <circle cx="58" cy="310" r="24"></circle>
        <circle cx="262" cy="178" r="24"></circle>
        <circle cx="262" cy="310" r="24"></circle>
      </g>
      ${partsMarkup}
    </svg>
  `;

  renderConditionList(elements.paintedPartsList, paintedRows);
  renderConditionList(elements.changedPartsList, changedRows);
}

function renderFileBlocks(mode) {
  const isExpertise = mode === "expertise";
  const target = isExpertise ? elements.expertiseFiles : elements.documentFiles;
  const files = isExpertise ? state.item?.expertise_files || [] : state.item?.document_files || [];
  if (files.length < 1) {
    target.innerHTML = '<div class="empty">Kayıt bulunmuyor.</div>';
    return;
  }

  target.innerHTML = files
    .map((file, index) => {
      const name = escapeHtml(file.name || `${isExpertise ? "Ekspertiz" : "Dokuman"} ${index + 1}`);
      const href = escapeHtml(file.dataUrl || "");
      const isImage = String(file.type || "").toLowerCase().startsWith("image/");
      const icon = isImage ? "fa-image" : "fa-file-pdf";
      return `
        <article class="fileCard">
          ${isImage ? `<img src="${href}" alt="${name}">` : ""}
          <div class="fileName">${name}</div>
          <a class="fileLink" href="${href}" target="_blank" rel="noopener noreferrer">
            <i class="fas ${icon}"></i> Dosyayi Ac
          </a>
        </article>
      `;
    })
    .join("");
}

function normalizeVehicleConditionMap(input) {
  const source = parseJsonObject(input);
  const out = {};
  for (const part of VEHICLE_CONDITION_PARTS) {
    const normalizedStatus = normalizeVehicleConditionStatus(source[part.key]);
    if (!normalizedStatus || normalizedStatus === VEHICLE_CONDITION_DEFAULT_STATUS) continue;
    out[part.key] = normalizedStatus;
  }
  return out;
}

function normalizeVehicleConditionStatus(input) {
  const raw = String(input || "").trim();
  if (!raw) return null;
  const folded = raw
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (folded === "ORIGINAL" || folded === "ORIJINAL") return "ORIGINAL";
  if (folded === "LOCAL_PAINTED" || folded === "LOKAL BOYALI" || folded === "LOKALBOYALI") return "LOCAL_PAINTED";
  if (folded === "PAINTED" || folded === "BOYALI") return "PAINTED";
  if (folded === "CHANGED" || folded === "DEGISEN") return "CHANGED";
  return null;
}

function getVehicleConditionStatusLabel(status) {
  if (status === "LOCAL_PAINTED") return "Lokal Boyali";
  if (status === "PAINTED") return "Boyali";
  if (status === "CHANGED") return "Degisen";
  return "Orijinal";
}

function getVehicleConditionStatusClass(status) {
  if (status === "LOCAL_PAINTED") return "local_painted";
  if (status === "PAINTED") return "painted";
  if (status === "CHANGED") return "changed";
  return "original";
}

function getVehicleConditionStatusCode(status) {
  if (status === "LOCAL_PAINTED") return "LB";
  if (status === "PAINTED") return "B";
  if (status === "CHANGED") return "D";
  return "O";
}

function renderConditionList(target, rows) {
  if (!target) return;
  if (!Array.isArray(rows) || rows.length < 1) {
    target.innerHTML = "<li>Yok</li>";
    return;
  }
  target.innerHTML = rows.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function normalizeGallery(rawInput, fallbackImage) {
  let values = [];
  if (Array.isArray(rawInput)) {
    values = rawInput;
  } else if (typeof rawInput === "string") {
    const text = String(rawInput || "").trim();
    if (text.startsWith("[")) {
      try {
        const parsed = JSON.parse(text);
        values = Array.isArray(parsed) ? parsed : [];
      } catch {
        values = [];
      }
    } else if (text) {
      values = [text];
    }
  }

  const out = values
    .map((value) => String(value || "").trim())
    .filter((value) => value.startsWith("data:image/") || /^https?:\/\//i.test(value))
    .slice(0, 20);

  const fallback = String(fallbackImage || "").trim();
  if (out.length < 1 && fallback) out.push(fallback);
  if (out.length < 1) out.push(DEFAULT_IMAGE);
  return out;
}

function normalizeFiles(rawInput) {
  let values = [];
  if (Array.isArray(rawInput)) {
    values = rawInput;
  } else if (typeof rawInput === "string") {
    const text = String(rawInput || "").trim();
    if (text.startsWith("[")) {
      try {
        const parsed = JSON.parse(text);
        values = Array.isArray(parsed) ? parsed : [];
      } catch {
        values = [];
      }
    }
  }

  return values
    .map((row) => {
      const item = row && typeof row === "object" ? row : {};
      const dataUrl = String(item.dataUrl || item.url || "").trim();
      if (!dataUrl) return null;
      return {
        name: String(item.name || "Dosya").slice(0, 140),
        type: String(item.type || (dataUrl.startsWith("data:application/pdf") ? "application/pdf" : "image/jpeg")).toLowerCase(),
        dataUrl,
      };
    })
    .filter(Boolean);
}

function parseJsonObject(rawInput) {
  if (rawInput && typeof rawInput === "object" && !Array.isArray(rawInput)) return rawInput;
  if (typeof rawInput !== "string") return {};
  const text = String(rawInput || "").trim();
  if (!text || !text.startsWith("{")) return {};
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  } catch {
    return {};
  }
  return {};
}

function splitEquipment(text) {
  const raw = String(text || "").trim();
  if (!raw) return [];
  return raw
    .split(/\n|,|;/g)
    .map((line) => String(line || "").trim())
    .filter(Boolean)
    .slice(0, 60);
}

function resolveLotNoFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = String(params.get("lotNo") || "").trim();
  if (fromQuery) return fromQuery.toUpperCase();

  const pathMatch = window.location.pathname.match(/^\/ilan\/([^/]+)\/?$/i);
  if (pathMatch) {
    return decodeURIComponent(String(pathMatch[1] || "")).trim().toUpperCase();
  }
  return "";
}

function infoRow(label, value) {
  return `<div class="infoCard"><small>${escapeHtml(label)}</small><strong>${escapeHtml(value || "-")}</strong></div>`;
}

function showPageError(message) {
  elements.auctionTitle.textContent = "İhale Detayı";
  elements.auctionMeta.textContent = "Kayıt yüklenemedi.";
  elements.descriptionBox.innerHTML = `<div class="empty">${escapeHtml(message || "Bir hata oluştu.")}</div>`;
  elements.basicInfoGrid.innerHTML = "";
  elements.auctionInfoGrid.innerHTML = "";
  elements.equipmentList.innerHTML = '<li>Kayıt bulunamadı.</li>';
  if (elements.expertiseConditionMap) elements.expertiseConditionMap.innerHTML = "";
  if (elements.paintedPartsList) elements.paintedPartsList.innerHTML = "";
  if (elements.changedPartsList) elements.changedPartsList.innerHTML = "";
  elements.expertiseFiles.innerHTML = '<div class="empty">Kayıt bulunmuyor.</div>';
  elements.documentFiles.innerHTML = '<div class="empty">Kayıt bulunmuyor.</div>';
  elements.galleryMainImage.src = DEFAULT_IMAGE;
  elements.galleryThumbs.innerHTML = "";
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function formatMoney(value) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatStatus(status) {
  const value = String(status || "").toUpperCase();
  if (value === "ACTIVE") return "Yayında";
  if (value === "ENDED") return "Sonlandırıldı";
  return value || "-";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function apiFetch(path, options = {}) {
  const method = options.method || "GET";
  const body = options.body ?? null;
  const init = {
    method,
    credentials: "same-origin",
    headers: {},
  };

  if (body !== null) {
    init.headers["content-type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, init);
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `Istek basarisiz (${response.status})`);
  }
  return data;
}
