"use strict";
// @ts-nocheck
const API_BASE = "";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80";
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
    state.item = {
        ...item,
        lot_no: String(item.lot_no || state.lotNo || "").toUpperCase(),
        gallery,
        expertise_files: expertiseFiles,
        document_files: documentFiles,
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
    elements.auctionMeta.textContent = `${item.product_group || "Genel"} / ${item.category || "Genel"} | ${item.city || "-"} / ${item.district || "-"} / ${item.neighborhood || "-"}`;
    renderGallery();
    renderTabs();
    renderInfoCards();
    renderDescription();
    renderEquipment();
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
        infoRow("Konum", `${item.city || "-"} / ${item.district || "-"} / ${item.neighborhood || "-"}`),
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
    elements.equipmentList.innerHTML = '<li>Kayıt bulunamadı.</li>';
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
