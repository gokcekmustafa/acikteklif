"use strict";
// @ts-nocheck
const API_BASE = "";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80";
const VEHICLE_CONDITION_DEFAULT_STATUS = "ORIGINAL";
const VEHICLE_CONDITION_PARTS = [
    { key: "on_tampon", label: "On Tampon" },
    { key: "kaput", label: "Kaput" },
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
    on_tampon: "M144 66 H256 Q265 66 265 74 V96 Q265 104 256 104 H144 Q135 104 135 96 V74 Q135 66 144 66 Z",
    kaput: "M140 118 Q200 94 260 118 L254 217 Q200 201 146 217 Z",
    tavan: "M151 223 Q200 209 249 223 L255 328 Q200 341 145 328 Z",
    bagaj: "M148 333 Q200 351 252 333 L247 386 Q200 401 153 386 Z",
    arka_tampon: "M142 404 H258 Q267 404 267 412 V434 Q267 442 258 442 H142 Q133 442 133 434 V412 Q133 404 142 404 Z",
    sol_on_camurluk: "M124 138 Q98 130 72 132 L72 224 Q84 220 92 208 Q104 190 126 196 Z",
    sol_on_kapi: "M72 228 L126 208 L129 286 L72 304 Z",
    sol_arka_kapi: "M72 308 L129 288 L124 362 L72 378 Z",
    sol_arka_camurluk: "M72 382 L120 366 L112 430 L72 430 Z",
    sag_on_camurluk: "M276 138 Q302 130 328 132 L328 224 Q316 220 308 208 Q296 190 274 196 Z",
    sag_on_kapi: "M328 228 L274 208 L271 286 L328 304 Z",
    sag_arka_kapi: "M328 308 L271 288 L276 362 L328 378 Z",
    sag_arka_camurluk: "M328 382 L280 366 L288 430 L328 430 Z",
    sol_ayna: "M76 109 H109 Q114 109 111 116 L108 134 H76 Z",
    sag_ayna: "M324 109 H291 Q286 109 289 116 L292 134 H324 Z",
};
const VEHICLE_CONDITION_TEXT_POSITIONS = {
    on_tampon: [200, 82],
    kaput: [200, 162],
    tavan: [200, 274],
    bagaj: [200, 368],
    arka_tampon: [200, 423],
    sol_on_camurluk: [98, 176],
    sol_on_kapi: [96, 256],
    sol_arka_kapi: [96, 332],
    sol_arka_camurluk: [91, 404],
    sag_on_camurluk: [302, 176],
    sag_on_kapi: [304, 256],
    sag_arka_kapi: [304, 332],
    sag_arka_camurluk: [309, 404],
    sol_ayna: [92, 122],
    sag_ayna: [308, 122],
};
const VEHICLE_EXPERTISE_STRUCTURE_FIELDS = [
    { key: "sag_podye", label: "Sağ Podye", legacyKeys: ["sag_sol_podye"] },
    { key: "sol_podye", label: "Sol Podye", legacyKeys: ["sag_sol_podye"] },
    { key: "sag_kilic_saci", label: "Sağ Kılıç Sacı", legacyKeys: ["sag_sol_kilic_saci"] },
    { key: "sol_kilic_saci", label: "Sol Kılıç Sacı", legacyKeys: ["sag_sol_kilic_saci"] },
    { key: "on_ic_direkler", label: "Ön İç Direkler" },
    { key: "orta_ic_direkler_arka_kilit_karsiliklari", label: "Orta İç Direkler ve Arka Kilit Karşılıkları" },
    { key: "on_panel_arka_panel", label: "Ön Panel - Arka Panel" },
    { key: "sag_marsbiyel", label: "Sağ Marşbiyel", legacyKeys: ["sag_sol_marsbiyel"] },
    { key: "sol_marsbiyel", label: "Sol Marşbiyel", legacyKeys: ["sag_sol_marsbiyel"] },
    { key: "sag_ust_direkler_frangart", label: "Sağ Üst Direkler (Frangart)", legacyKeys: ["sag_sol_ust_direkler_frangart"] },
    { key: "sol_ust_direkler_frangart", label: "Sol Üst Direkler (Frangart)", legacyKeys: ["sag_sol_ust_direkler_frangart"] },
];
const VEHICLE_EXPERTISE_MECHANICAL_FIELDS = [
    { key: "motor_alt_ust_yag_kacagi", label: "Motor Alt/Üst Yağ Kaçağı" },
    { key: "sanziman", label: "Şanzıman" },
    { key: "turbo", label: "Turbo" },
    { key: "radyator", label: "Radyatör" },
    { key: "intercooler", label: "Intercooler" },
    { key: "on_arka_takim", label: "Ön ve Arka Takım" },
];
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
    expertiseConditionMap: document.getElementById("expertiseConditionMap"),
    expertiseStructureList: document.getElementById("expertiseStructureList"),
    expertiseMechanicalList: document.getElementById("expertiseMechanicalList"),
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
        if (!button)
            return;
        state.activeTab = String(button.dataset.tab || "basic");
        renderTabs();
    });
    elements.galleryThumbs.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-image-index]");
        if (!button)
            return;
        const index = Number(button.dataset.imageIndex || 0);
        if (!Number.isFinite(index))
            return;
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
    const vehicleConditionMap = normalizeVehicleConditionMap(item.vehicle_condition_map_json || item.vehicle_condition_map || item.vehicleConditionMap || {});
    const vehicleExpertiseMeta = normalizeVehicleExpertiseMeta(item.vehicle_expertise_meta_json || item.vehicle_expertise_meta || item.vehicleExpertiseMeta || {});
    state.item = {
        ...item,
        lot_no: String(item.lot_no || state.lotNo || "").toUpperCase(),
        gallery,
        expertise_files: expertiseFiles,
        document_files: documentFiles,
        vehicle_condition_map: vehicleConditionMap,
        vehicle_expertise_meta: vehicleExpertiseMeta,
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
        .map((src, index) => `
        <button class="thumbBtn ${index === state.activeImageIndex ? "active" : ""}" type="button" data-image-index="${index}">
          <img src="${escapeHtml(src)}" alt="Gorsel ${index + 1}">
        </button>
      `)
        .join("");
}
function setActiveImage(index) {
    if (!state.gallery || state.gallery.length < 1)
        return;
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
        infoRow("Şase No", item.vehicle_chassis_no || "-"),
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
function renderVehicleConditionMap() {
    if (!elements.expertiseConditionMap)
        return;
    const map = normalizeVehicleConditionMap(state.item?.vehicle_condition_map || {});
    const partsMarkup = VEHICLE_CONDITION_PARTS.map((part) => {
        const status = map[part.key] || VEHICLE_CONDITION_DEFAULT_STATUS;
        const statusClass = getVehicleConditionStatusClass(status);
        const pos = VEHICLE_CONDITION_TEXT_POSITIONS[part.key] || [200, 250];
        const path = VEHICLE_CONDITION_PART_PATHS[part.key] || "";
        return `
      <g class="conditionSvgPart ${statusClass}" data-part-key="${part.key}">
        <path d="${path}"></path>
        <text x="${Number(pos[0])}" y="${Number(pos[1])}" text-anchor="middle" dominant-baseline="middle">${escapeHtml(getVehicleConditionStatusCode(status))}</text>
      </g>
    `;
    }).join("");
    elements.expertiseConditionMap.innerHTML = `
    <svg class="conditionSvg" viewBox="26 0 348 500" role="img" aria-label="Arac kaporta durum haritasi">
      <g class="conditionBodyShell">
        <path d="M140 56 Q200 34 260 56 L294 146 L294 354 L260 454 Q200 476 140 454 L106 354 L106 146 Z"></path>
        <path d="M152 224 Q200 210 248 224 L254 328 Q200 342 146 328 Z"></path>
        <path d="M52 118 Q86 100 130 110 L136 438 Q88 452 52 432 Z"></path>
        <path d="M348 118 Q314 100 270 110 L264 438 Q312 452 348 432 Z"></path>
      </g>
      <g class="conditionWheelSet">
        <circle cx="56" cy="195" r="27"></circle>
        <circle cx="56" cy="369" r="27"></circle>
        <circle cx="344" cy="195" r="27"></circle>
        <circle cx="344" cy="369" r="27"></circle>
      </g>
      ${partsMarkup}
    </svg>
  `;
    renderVehicleExpertiseDetails();
}
function renderVehicleExpertiseDetails() {
    const meta = normalizeVehicleExpertiseMeta(state.item?.vehicle_expertise_meta || {});
    const structure = meta.structure || {};
    const mechanical = meta.mechanical || {};
    const tireStatus = normalizeVehicleExpertiseTireStatus(meta.tires?.general) || "IYI";
    if (elements.expertiseStructureList) {
        elements.expertiseStructureList.innerHTML = VEHICLE_EXPERTISE_STRUCTURE_FIELDS.map((field) => {
            const status = normalizeVehicleExpertiseStructureStatus(structure[field.key]) || "ORIGINAL";
            return renderExpertiseStatusRow(field.label, getVehicleExpertiseStructureStatusLabel(status), status.toLowerCase());
        }).join("");
    }
    if (elements.expertiseMechanicalList) {
        const mechanicalRows = VEHICLE_EXPERTISE_MECHANICAL_FIELDS.map((field) => {
            const status = normalizeVehicleExpertiseMechanicalStatus(mechanical[field.key]) || "NORMAL";
            return renderExpertiseStatusRow(field.label, getVehicleExpertiseMechanicalStatusLabel(status), status.toLowerCase());
        });
        mechanicalRows.push(renderExpertiseStatusRow("Lastiklerin Genel Durumu", getVehicleExpertiseTireStatusLabel(tireStatus), tireStatus.toLowerCase()));
        elements.expertiseMechanicalList.innerHTML = mechanicalRows.join("");
    }
}
function renderExpertiseStatusRow(label, value, statusClass) {
    return `
    <li class="expertiseStatusRow">
      <span class="expertiseStatusLabel">${escapeHtml(label)}</span>
      <span class="expertiseStatusValue ${escapeHtml(statusClass)}">${escapeHtml(value)}</span>
    </li>
  `;
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
        if (!normalizedStatus || normalizedStatus === VEHICLE_CONDITION_DEFAULT_STATUS)
            continue;
        out[part.key] = normalizedStatus;
    }
    return out;
}
function normalizeVehicleConditionStatus(input) {
    const raw = String(input || "").trim();
    if (!raw)
        return null;
    const folded = raw
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    if (folded === "ORIGINAL" || folded === "ORIJINAL")
        return "ORIGINAL";
    if (folded === "LOCAL_PAINTED" || folded === "LOKAL BOYALI" || folded === "LOKALBOYALI")
        return "LOCAL_PAINTED";
    if (folded === "PAINTED" || folded === "BOYALI")
        return "PAINTED";
    if (folded === "CHANGED" || folded === "DEGISEN")
        return "CHANGED";
    return null;
}
function getVehicleConditionStatusLabel(status) {
    if (status === "LOCAL_PAINTED")
        return "Lokal Boyalı";
    if (status === "PAINTED")
        return "Boyalı";
    if (status === "CHANGED")
        return "Değişen";
    return "Orijinal";
}
function getVehicleConditionStatusClass(status) {
    if (status === "LOCAL_PAINTED")
        return "local_painted";
    if (status === "PAINTED")
        return "painted";
    if (status === "CHANGED")
        return "changed";
    return "original";
}
function getVehicleConditionStatusCode(status) {
    if (status === "LOCAL_PAINTED")
        return "LB";
    if (status === "PAINTED")
        return "B";
    if (status === "CHANGED")
        return "D";
    return "O";
}
function normalizeVehicleExpertiseMeta(input) {
    const source = parseJsonObject(input);
    const structureSource = parseJsonObject(source.structure || source.structural || {});
    const mechanicalSource = parseJsonObject(source.mechanical || {});
    const tireSource = parseJsonObject(source.tires || {});
    const structure = {};
    for (const field of VEHICLE_EXPERTISE_STRUCTURE_FIELDS) {
        const candidates = [field.key, ...(Array.isArray(field.legacyKeys) ? field.legacyKeys : [])];
        let rawValue = undefined;
        for (const candidateKey of candidates) {
            const valueFromStructure = structureSource[candidateKey];
            const valueFromRoot = source[candidateKey];
            if (valueFromStructure !== undefined && valueFromStructure !== null && String(valueFromStructure).trim() !== "") {
                rawValue = valueFromStructure;
                break;
            }
            if (valueFromRoot !== undefined && valueFromRoot !== null && String(valueFromRoot).trim() !== "") {
                rawValue = valueFromRoot;
                break;
            }
        }
        const normalized = normalizeVehicleExpertiseStructureStatus(rawValue);
        if (!normalized || normalized === "ORIGINAL")
            continue;
        structure[field.key] = normalized;
    }
    const mechanical = {};
    for (const field of VEHICLE_EXPERTISE_MECHANICAL_FIELDS) {
        const legacyKeys = field.key === "intercooler" ? ["interkol"] : [];
        const candidates = [field.key, ...legacyKeys];
        let rawValue = undefined;
        for (const candidateKey of candidates) {
            const valueFromMechanical = mechanicalSource[candidateKey];
            const valueFromRoot = source[candidateKey];
            if (valueFromMechanical !== undefined && valueFromMechanical !== null && String(valueFromMechanical).trim() !== "") {
                rawValue = valueFromMechanical;
                break;
            }
            if (valueFromRoot !== undefined && valueFromRoot !== null && String(valueFromRoot).trim() !== "") {
                rawValue = valueFromRoot;
                break;
            }
        }
        const normalized = normalizeVehicleExpertiseMechanicalStatus(rawValue);
        if (!normalized || normalized === "NORMAL")
            continue;
        mechanical[field.key] = normalized;
    }
    const tireRaw = tireSource.general || tireSource.lastik_genel_durum || source.lastik_genel_durum || source.tireGeneral || source.lastikDurum;
    const tireStatus = normalizeVehicleExpertiseTireStatus(tireRaw);
    const out = {};
    if (Object.keys(structure).length > 0)
        out.structure = structure;
    if (Object.keys(mechanical).length > 0)
        out.mechanical = mechanical;
    if (tireStatus && tireStatus !== "IYI")
        out.tires = { general: tireStatus };
    return out;
}
function normalizeVehicleExpertiseStructureStatus(input) {
    const raw = String(input || "").trim();
    if (!raw)
        return null;
    const folded = raw
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    if (folded === "ORIGINAL" || folded === "ORIJINAL")
        return "ORIGINAL";
    if (folded === "ISLEMLI" || folded === "ISLEM GORMUS" || folded === "DUZELTILMIS" || folded === "DUZELTME")
        return "ISLEMLI";
    if (folded === "DEGISMIS" || folded === "DEGISEN" || folded === "CHANGED")
        return "DEGISMIS";
    return null;
}
function normalizeVehicleExpertiseMechanicalStatus(input) {
    const raw = String(input || "").trim();
    if (!raw)
        return null;
    const folded = raw
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    if (folded === "NORMAL" || folded === "IYI" || folded === "SORUNSUZ" || folded === "YOK")
        return "NORMAL";
    if (folded === "BAKIM_GEREKLI" || folded === "KONTROL_GEREKLI" || folded === "BAKIM" || folded === "KONTROL")
        return "BAKIM_GEREKLI";
    if (folded === "ONARIM_GEREKLI" || folded === "ONARIM" || folded === "ARIZALI" || folded === "KACAK VAR")
        return "ONARIM_GEREKLI";
    return null;
}
function normalizeVehicleExpertiseTireStatus(input) {
    const raw = String(input || "").trim();
    if (!raw)
        return null;
    const folded = raw
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    if (folded === "IYI" || folded === "GOOD")
        return "IYI";
    if (folded === "ORTA" || folded === "MEDIUM")
        return "ORTA";
    if (folded === "ZAYIF" || folded === "KOTU" || folded === "DUSUK")
        return "ZAYIF";
    if (folded === "DEGISTIRILMELI" || folded === "DEGISIM GEREKLI" || folded === "CHANGE_REQUIRED")
        return "DEGISTIRILMELI";
    return null;
}
function getVehicleExpertiseStructureStatusLabel(status) {
    if (status === "ISLEMLI")
        return "İşlemli";
    if (status === "DEGISMIS")
        return "Değişmiş";
    return "Orijinal";
}
function getVehicleExpertiseMechanicalStatusLabel(status) {
    if (status === "BAKIM_GEREKLI")
        return "Bakım Gerekli";
    if (status === "ONARIM_GEREKLI")
        return "Onarım Gerekli";
    return "Sorunsuz";
}
function getVehicleExpertiseTireStatusLabel(status) {
    if (status === "ORTA")
        return "Orta";
    if (status === "ZAYIF")
        return "Zayıf";
    if (status === "DEGISTIRILMELI")
        return "Değiştirilmeli";
    return "İyi";
}
function normalizeGallery(rawInput, fallbackImage) {
    let values = [];
    if (Array.isArray(rawInput)) {
        values = rawInput;
    }
    else if (typeof rawInput === "string") {
        const text = String(rawInput || "").trim();
        if (text.startsWith("[")) {
            try {
                const parsed = JSON.parse(text);
                values = Array.isArray(parsed) ? parsed : [];
            }
            catch {
                values = [];
            }
        }
        else if (text) {
            values = [text];
        }
    }
    const out = values
        .map((value) => String(value || "").trim())
        .filter((value) => value.startsWith("data:image/") || /^https?:\/\//i.test(value))
        .slice(0, 20);
    const fallback = String(fallbackImage || "").trim();
    if (out.length < 1 && fallback)
        out.push(fallback);
    if (out.length < 1)
        out.push(DEFAULT_IMAGE);
    return out;
}
function normalizeFiles(rawInput) {
    let values = [];
    if (Array.isArray(rawInput)) {
        values = rawInput;
    }
    else if (typeof rawInput === "string") {
        const text = String(rawInput || "").trim();
        if (text.startsWith("[")) {
            try {
                const parsed = JSON.parse(text);
                values = Array.isArray(parsed) ? parsed : [];
            }
            catch {
                values = [];
            }
        }
    }
    return values
        .map((row) => {
        const item = row && typeof row === "object" ? row : {};
        const dataUrl = String(item.dataUrl || item.url || "").trim();
        if (!dataUrl)
            return null;
        return {
            name: String(item.name || "Dosya").slice(0, 140),
            type: String(item.type || (dataUrl.startsWith("data:application/pdf") ? "application/pdf" : "image/jpeg")).toLowerCase(),
            dataUrl,
        };
    })
        .filter(Boolean);
}
function parseJsonObject(rawInput) {
    if (rawInput && typeof rawInput === "object" && !Array.isArray(rawInput))
        return rawInput;
    if (typeof rawInput !== "string")
        return {};
    const text = String(rawInput || "").trim();
    if (!text || !text.startsWith("{"))
        return {};
    try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
            return parsed;
    }
    catch {
        return {};
    }
    return {};
}
function splitEquipment(text) {
    const raw = String(text || "").trim();
    if (!raw)
        return [];
    return raw
        .split(/\n|,|;/g)
        .map((line) => String(line || "").trim())
        .filter(Boolean)
        .slice(0, 60);
}
function resolveLotNoFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = String(params.get("lotNo") || "").trim();
    if (fromQuery)
        return fromQuery.toUpperCase();
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
    if (elements.expertiseConditionMap)
        elements.expertiseConditionMap.innerHTML = "";
    if (elements.expertiseStructureList)
        elements.expertiseStructureList.innerHTML = "";
    if (elements.expertiseMechanicalList)
        elements.expertiseMechanicalList.innerHTML = "";
    if (elements.expertiseTireList)
        elements.expertiseTireList.innerHTML = "";
    elements.expertiseFiles.innerHTML = '<div class="empty">Kayıt bulunmuyor.</div>';
    elements.documentFiles.innerHTML = '<div class="empty">Kayıt bulunmuyor.</div>';
    elements.galleryMainImage.src = DEFAULT_IMAGE;
    elements.galleryThumbs.innerHTML = "";
}
function formatDate(value) {
    if (!value)
        return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return "-";
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
    if (value === "ACTIVE")
        return "Yayında";
    if (value === "PASSIVE")
        return "Pasif";
    if (value === "ENDED")
        return "Sonlandırıldı";
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
    }
    catch {
        data = {};
    }
    if (!response.ok || data.ok === false) {
        throw new Error(data.error || `Istek basarisiz (${response.status})`);
    }
    return data;
}
