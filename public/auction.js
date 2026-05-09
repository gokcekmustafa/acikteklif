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
];
const VEHICLE_CONDITION_PART_PATHS = {
    on_tampon: "M 178 111 L 178 125 L 182 130 L 292 130 L 295 127 L 295 109 L 292 106 L 182 106 Z M 262 123 L 262 120 L 263 119 L 263 118 L 267 114 L 268 114 L 268 113 L 270 111 L 271 111 L 272 110 L 291 110 L 293 112 L 293 116 L 292 117 L 292 120 L 287 125 L 264 125 Z M 182 112 L 184 110 L 203 110 L 204 111 L 205 111 L 212 118 L 212 119 L 213 120 L 213 123 L 211 125 L 188 125 L 187 124 L 187 123 L 186 122 L 185 122 L 184 121 L 184 120 L 183 119 L 183 117 L 182 116 Z",
    kaput: "M 182 154 L 176 229 L 193 224 L 220 219 L 253 219 L 269 223 L 279 224 L 297 229 L 297 211 L 295 206 L 292 157 L 288 150 L 274 146 L 259 144 L 256 142 L 221 142 L 218 144 L 207 145 L 186 150 Z",
    tavan: "M 187 315 L 188 314 L 189 315 L 188 331 L 189 330 L 190 331 L 190 355 L 188 358 L 189 372 L 268 372 L 269 373 L 269 354 L 268 353 L 268 331 L 269 330 L 269 315 L 268 314 L 188 314 Z",
    bagaj: "M 178 447 L 178 457 L 182 459 L 184 459 L 188 461 L 191 461 L 192 462 L 196 462 L 197 463 L 201 463 L 202 464 L 208 464 L 209 465 L 216 465 L 217 466 L 253 466 L 254 465 L 262 465 L 263 464 L 269 464 L 270 463 L 279 462 L 280 461 L 287 460 L 294 457 L 294 447 L 293 446 L 292 440 L 291 439 L 284 440 L 280 442 L 276 442 L 275 443 L 266 444 L 265 445 L 251 446 L 250 447 L 221 447 L 220 446 L 212 446 L 211 445 L 200 444 L 199 443 L 188 441 L 184 439 L 181 439 L 180 440 L 180 443 Z",
    arka_tampon: "M 180 487 L 180 505 L 182 507 L 182 508 L 293 508 L 295 506 L 295 486 L 293 484 L 182 484 L 182 485 Z M 183 493 L 187 489 L 203 489 L 205 491 L 205 492 L 207 494 L 207 499 L 206 500 L 205 500 L 205 501 L 204 502 L 203 502 L 202 503 L 187 503 L 183 499 Z M 269 493 L 273 489 L 288 489 L 292 493 L 292 499 L 288 503 L 272 503 L 271 502 L 271 501 L 269 499 Z",
    sol_on_camurluk: "M 89 145 L 89 147 L 87 149 L 86 149 L 86 170 L 87 170 L 88 171 L 93 171 L 94 172 L 96 172 L 97 173 L 99 173 L 100 174 L 101 174 L 104 177 L 105 177 L 111 183 L 111 184 L 113 186 L 113 187 L 115 189 L 115 190 L 115 153 L 114 152 L 110 152 L 109 151 L 106 151 L 105 150 L 103 150 L 102 149 L 102 145 Z",
    sol_on_kapi: "M 116.3 210 L 111.4 220.7 L 103.6 228.5 L 96.8 231.4 L 86 233.4 L 86 305.5 L 173 323 L 173 311.3 L 171 300.6 L 159.3 265.5 L 150.5 248 L 138.8 230.5 L 122.2 211.9 Z M 133.9 234.4 L 146.6 252.9 L 157.4 273.3 L 166.2 298.6 L 169.1 314.2 L 168.1 317.2 L 135.9 310.3 L 132.9 308.4 Z",
    sol_arka_kapi: "M 86 313 L 86 374.6 L 98.7 377.6 L 105.5 381.5 L 112.4 389.3 L 116.3 399.1 L 116.3 403 L 123.1 403 L 172 382.5 L 172 329.6 L 88 312 Z M 168.1 332.5 L 170 334.5 L 170 377.6 L 168.1 379.5 L 133.9 392.2 L 131.9 390.3 L 131.9 328.6 L 135.8 326.7 Z",
    sol_arka_camurluk: "M 115 419 L 114 420 L 114 421 L 111 424 L 111 425 L 104 432 L 103 432 L 101 434 L 100 434 L 99 435 L 98 435 L 97 436 L 96 436 L 95 437 L 93 437 L 92 438 L 88 438 L 87 439 L 86 439 L 86 460 L 88 460 L 90 462 L 90 463 L 92 465 L 92 466 L 93 467 L 102 467 L 102 466 L 107 461 L 108 461 L 109 460 L 115 460 Z",
    sag_on_camurluk: "M 383 145 L 370 145 L 370 149 L 368 151 L 365 151 L 364 152 L 361 152 L 360 153 L 357 153 L 356 154 L 356 193 L 357 192 L 357 191 L 358 190 L 358 189 L 359 188 L 359 187 L 362 184 L 362 183 L 367 178 L 368 178 L 372 174 L 373 174 L 374 173 L 376 173 L 377 172 L 380 172 L 381 171 L 386 171 L 386 149 L 384 149 L 383 148 Z",
    sag_on_kapi: "M 357.7 210 L 353.8 211 L 338.1 227.5 L 328.3 241.2 L 318.6 258.7 L 304.9 295.7 L 300 320.1 L 301 324 L 324.4 318.2 L 386 306.5 L 386 233.4 L 378.2 232.4 L 368.4 227.5 L 361.6 219.7 Z M 341 233.4 L 342 309.4 L 339.1 311.3 L 305.9 318.2 L 304.9 314.3 L 306.8 303.5 L 317.6 271.4 L 326.4 254.8 Z",
    sag_arka_kapi: "M 386 313 L 364.5 315.9 L 350.8 319.8 L 300 329.6 L 300 381.5 L 345.9 401.1 L 357.7 404 L 357.7 399.1 L 363.5 386.4 L 375.2 377.6 L 386 375.6 Z M 305.9 332.6 L 338.1 326.7 L 342 327.7 L 341 392.3 L 308.8 380.5 L 304.9 377.6 Z",
    sag_arka_camurluk: "M 357 419 L 358 420 L 358 460 L 364 460 L 366 462 L 367 462 L 371 466 L 371 467 L 379 467 L 381 465 L 381 464 L 382 463 L 382 462 L 384 460 L 386 460 L 386 439 L 384 439 L 383 438 L 380 438 L 379 437 L 377 437 L 376 436 L 374 436 L 373 435 L 372 435 L 370 433 L 369 433 L 363 427 L 363 426 L 359 422 L 359 421 L 358 420 L 358 419 Z",
};
const VEHICLE_CONDITION_TEXT_POSITIONS = {
    on_tampon: [236, 118],
    kaput: [237, 185],
    tavan: [229, 343],
    bagaj: [236, 454],
    arka_tampon: [238, 496],
    sol_on_camurluk: [102, 163],
    sol_on_kapi: [114, 269],
    sol_arka_kapi: [116, 353],
    sol_arka_camurluk: [101, 448],
    sag_on_camurluk: [370, 164],
    sag_on_kapi: [358, 269],
    sag_arka_kapi: [356, 353],
    sag_arka_camurluk: [371, 448],
};
const VEHICLE_CONDITION_LAYOUT_MAX_OFFSET = 200;
const VEHICLE_CONDITION_SCALE_MIN = 0.7;
const VEHICLE_CONDITION_SCALE_MAX = 1.7;
const VEHICLE_CONDITION_SCALE_DEFAULT = 1;
const VEHICLE_CONDITION_SCALE_CENTER = [236, 304];
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
    vehicleConditionLayout: createDefaultVehicleConditionLayout(),
    vehicleConditionScale: VEHICLE_CONDITION_SCALE_DEFAULT,
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
    const documentFiles = normalizeFiles(item.document_files || item.document_files_json || []);
    const equipment = splitEquipment(String(item.extra_equipment || ""));
    const vehicleConditionMap = normalizeVehicleConditionMap(item.vehicle_condition_map_json || item.vehicle_condition_map || item.vehicleConditionMap || {});
    const vehicleExpertiseMeta = normalizeVehicleExpertiseMeta(item.vehicle_expertise_meta_json || item.vehicle_expertise_meta || item.vehicleExpertiseMeta || {});
    state.item = {
        ...item,
        lot_no: String(item.lot_no || state.lotNo || "").toUpperCase(),
        gallery,
        document_files: documentFiles,
        vehicle_condition_map: vehicleConditionMap,
        vehicle_expertise_meta: vehicleExpertiseMeta,
        equipment,
    };
    state.vehicleConditionLayout = normalizeVehicleConditionLayout(data.vehicleConditionLayout || item.vehicle_condition_layout || {});
    state.vehicleConditionScale = normalizeVehicleConditionScale(data.vehicleConditionScale);
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
    renderDocumentFiles();
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
    const layout = normalizeVehicleConditionLayout(state.vehicleConditionLayout || {});
    state.vehicleConditionLayout = layout;
    const scale = normalizeVehicleConditionScale(state.vehicleConditionScale);
    state.vehicleConditionScale = scale;
    const partsMarkup = VEHICLE_CONDITION_PARTS.map((part) => {
        const status = map[part.key] || VEHICLE_CONDITION_DEFAULT_STATUS;
        const statusClass = getVehicleConditionStatusClass(status);
        const partClass = `part-${part.key}`;
        const shouldShowCode = status !== VEHICLE_CONDITION_DEFAULT_STATUS;
        const pos = VEHICLE_CONDITION_TEXT_POSITIONS[part.key] || [200, 250];
        const path = VEHICLE_CONDITION_PART_PATHS[part.key] || "";
        const offset = layout[part.key] || { x: 0, y: 0 };
        const transform = offset.x !== 0 || offset.y !== 0 ? ` transform="translate(${offset.x} ${offset.y})"` : "";
        return `
      <g class="conditionSvgPart ${statusClass} ${partClass}" data-part-key="${part.key}"${transform}>
        <path d="${path}" fill-rule="evenodd" clip-rule="evenodd"></path>
        ${shouldShowCode
            ? `<text class="conditionCode ${getVehicleConditionStatusCode(status).length > 1 ? "is-long" : "is-short"}" x="${Number(pos[0])}" y="${Number(pos[1])}" text-anchor="middle" dominant-baseline="middle" text-rendering="geometricPrecision">${escapeHtml(getVehicleConditionStatusCode(status))}</text>`
            : ""}
      </g>
    `;
    }).join("");
    const [scaleCenterX, scaleCenterY] = VEHICLE_CONDITION_SCALE_CENTER;
    const scaleTransform = Math.abs(scale - 1) > 0.001
        ? `transform="translate(${scaleCenterX} ${scaleCenterY}) scale(${scale}) translate(${-scaleCenterX} ${-scaleCenterY})"`
        : "";
    elements.expertiseConditionMap.innerHTML = `
    <svg class="conditionSvg" viewBox="44 84 380 440" role="img" aria-label="Arac kaporta durum haritasi">
      <g class="conditionScaleLayer" ${scaleTransform}>
        <image class="conditionBaseImage" href="/kaporta-base.png" x="0" y="0" width="467" height="551" preserveAspectRatio="xMidYMid meet"></image>
        ${partsMarkup}
      </g>
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
function renderDocumentFiles() {
    const target = elements.documentFiles;
    if (!target)
        return;
    const files = state.item?.document_files || [];
    if (files.length < 1) {
        target.innerHTML = '<div class="empty">Kayıt bulunmuyor.</div>';
        return;
    }
    target.innerHTML = files
        .map((file, index) => {
        const name = escapeHtml(file.name || `Dokuman ${index + 1}`);
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
function createDefaultVehicleConditionLayout() {
    const out = {};
    for (const part of VEHICLE_CONDITION_PARTS) {
        out[part.key] = { x: 0, y: 0 };
    }
    return out;
}
function normalizeVehicleConditionLayoutOffset(input) {
    const value = Number(input);
    if (!Number.isFinite(value))
        return 0;
    const rounded = Math.round(value);
    if (rounded > VEHICLE_CONDITION_LAYOUT_MAX_OFFSET)
        return VEHICLE_CONDITION_LAYOUT_MAX_OFFSET;
    if (rounded < -VEHICLE_CONDITION_LAYOUT_MAX_OFFSET)
        return -VEHICLE_CONDITION_LAYOUT_MAX_OFFSET;
    return rounded;
}
function normalizeVehicleConditionLayout(input) {
    const source = parseJsonObject(input);
    const partsSource = parseJsonObject(source.parts || source.layout || source.offsets || source);
    const out = createDefaultVehicleConditionLayout();
    for (const part of VEHICLE_CONDITION_PARTS) {
        const rawPart = partsSource[part.key];
        let x = 0;
        let y = 0;
        if (Array.isArray(rawPart)) {
            x = normalizeVehicleConditionLayoutOffset(rawPart[0]);
            y = normalizeVehicleConditionLayoutOffset(rawPart[1]);
        }
        else {
            const partSource = parseJsonObject(rawPart);
            x = normalizeVehicleConditionLayoutOffset(partSource.x ?? partSource.dx ?? 0);
            y = normalizeVehicleConditionLayoutOffset(partSource.y ?? partSource.dy ?? 0);
        }
        out[part.key] = { x, y };
    }
    return out;
}
function normalizeVehicleConditionScale(input) {
    const value = Number(input);
    if (!Number.isFinite(value))
        return VEHICLE_CONDITION_SCALE_DEFAULT;
    const rounded = Math.round(value * 100) / 100;
    if (rounded < VEHICLE_CONDITION_SCALE_MIN)
        return VEHICLE_CONDITION_SCALE_MIN;
    if (rounded > VEHICLE_CONDITION_SCALE_MAX)
        return VEHICLE_CONDITION_SCALE_MAX;
    return rounded;
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
