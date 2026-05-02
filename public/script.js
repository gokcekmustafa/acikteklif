"use strict";
const API_BASE = "";
const PERMISSION_ADMIN_PANEL_ACCESS = "admin.panel.access";
const PERMISSION_BIDS_PLACE = "bids.place";
const META_TURNSTILE_SITE_KEY = document
    .querySelector('meta[name="turnstile-site-key"]')
    ?.getAttribute("content")
    ?.trim();
const fallbackListings = [
    {
        id: 1,
        lotNo: "34AT001",
        title: "Sedan 1.6 Dizel Otomatik",
        productGroup: "Vasıta",
        category: "Otomotiv",
        city: "İstanbul",
        district: "Ümraniye",
        neighborhood: "Finans Mah.",
        startPrice: 810000,
        lastBid: 840000,
        hasOffer: true,
        isNew: true,
        isOpportunity: false,
        priceDropped: false,
        endAt: addTime(0, 8, 15, 0),
        image: "https://images.unsplash.com/photo-1549925862-990bcf84c6f0?auto=format&fit=crop&w=900&q=80",
        createdAt: addTime(-3, 0, 0, 0),
    },
    {
        id: 2,
        lotNo: "34AT002",
        title: "Panelvan 2.0 Manuel",
        productGroup: "Vasıta",
        category: "Ticari Araç",
        city: "Ankara",
        district: "Çubuk",
        neighborhood: "Cumhuriyet Mah.",
        startPrice: 1150000,
        lastBid: null,
        hasOffer: false,
        isNew: true,
        isOpportunity: true,
        priceDropped: false,
        endAt: addTime(1, 5, 30, 0),
        image: "https://images.unsplash.com/photo-1562141961-f18f9c3b4f0f?auto=format&fit=crop&w=900&q=80",
        createdAt: addTime(-5, 0, 0, 0),
    },
    {
        id: 3,
        lotNo: "06AT103",
        title: "Arazi Aracı 4x4",
        productGroup: "Vasıta",
        category: "SUV",
        city: "Ankara",
        district: "Yenimahalle",
        neighborhood: "Çamlıca Mah.",
        startPrice: 1950000,
        lastBid: 2010000,
        hasOffer: true,
        isNew: false,
        isOpportunity: false,
        priceDropped: true,
        endAt: addTime(-1, 0, 0, 0),
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
        createdAt: addTime(-50, 0, 0, 0),
    },
    {
        id: 4,
        lotNo: "35AT044",
        title: "Dizüstü Bilgisayar Seti (20 Adet)",
        productGroup: "Elektronik",
        category: "Bilgisayar",
        city: "İzmir",
        district: "Bornova",
        neighborhood: "Kazımdirik Mah.",
        startPrice: 420000,
        lastBid: 468000,
        hasOffer: true,
        isNew: true,
        isOpportunity: true,
        priceDropped: true,
        endAt: addTime(0, 2, 10, 0),
        image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
        createdAt: addTime(-2, 0, 0, 0),
    },
    {
        id: 5,
        lotNo: "16AT211",
        title: "Ofis Mobilya Paketi",
        productGroup: "Ofis Ekipmanları",
        category: "Mobilya",
        city: "Bursa",
        district: "Nilüfer",
        neighborhood: "Odunluk Mah.",
        startPrice: 270000,
        lastBid: null,
        hasOffer: false,
        isNew: false,
        isOpportunity: true,
        priceDropped: false,
        endAt: addTime(0, 18, 0, 0),
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80",
        createdAt: addTime(-12, 0, 0, 0),
    },
    {
        id: 6,
        lotNo: "34AT330",
        title: "Depolama Raf Sistemi",
        productGroup: "Sanayi Ekipmanları",
        category: "Depo",
        city: "İstanbul",
        district: "Tuzla",
        neighborhood: "Aydınlı Mah.",
        startPrice: 890000,
        lastBid: 910000,
        hasOffer: true,
        isNew: false,
        isOpportunity: false,
        priceDropped: false,
        endAt: addTime(2, 1, 0, 0),
        image: "https://images.unsplash.com/photo-1565799557186-1f8d4fe81694?auto=format&fit=crop&w=900&q=80",
        createdAt: addTime(-15, 0, 0, 0),
    },
    {
        id: 7,
        lotNo: "07AT510",
        title: "Deniz Manzaralı 2+1 Daire",
        productGroup: "Gayrimenkul",
        category: "Konut",
        city: "Antalya",
        district: "Muratpaşa",
        neighborhood: "Lara Mah.",
        startPrice: 3650000,
        lastBid: 3880000,
        hasOffer: true,
        isNew: false,
        isOpportunity: false,
        priceDropped: true,
        endAt: addTime(4, 3, 0, 0),
        image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
        createdAt: addTime(-60, 0, 0, 0),
    },
    {
        id: 8,
        lotNo: "34AT777",
        title: "Beyaz Eşya Toplu Satış (15 Kalem)",
        productGroup: "Beyaz Eşya",
        category: "Toplu Ürün",
        city: "İstanbul",
        district: "Kağıthane",
        neighborhood: "Merkez Mah.",
        startPrice: 540000,
        lastBid: null,
        hasOffer: false,
        isNew: true,
        isOpportunity: true,
        priceDropped: false,
        endAt: addTime(0, 10, 20, 0),
        image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80",
        createdAt: addTime(-1, 0, 0, 0),
    },
];
const DEFAULT_LISTING_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80";
const fallbackListingByLotNo = new Map(fallbackListings.map((item) => [item.lotNo, item]));
const state = {
    tab: "ALL",
    order: "DEFAULT",
    listings: [],
    filters: {
        productGroup: "",
        category: "",
        city: "",
        district: "",
        neighborhood: "",
        minPrice: "",
        maxPrice: "",
        lotNo: "",
    },
    auth: {
        user: null,
        requireEmailVerification: false,
    },
    turnstile: {
        siteKey: META_TURNSTILE_SITE_KEY || "",
        enabled: false,
        loginWidgetId: null,
        registerWidgetId: null,
        loginToken: "",
        registerToken: "",
    },
};
const elements = {
    listingBoxes: document.getElementById("listingBoxes"),
    emptyState: document.getElementById("emptyState"),
    sortTabs: document.getElementById("sortTabs"),
    sortMobile: document.getElementById("selectedSortTypeId"),
    order: document.getElementById("selectOrder"),
    productGroup: document.getElementById("productGroup"),
    category: document.getElementById("category"),
    city: document.getElementById("city"),
    district: document.getElementById("district"),
    neighborhood: document.getElementById("neighborhood"),
    minPrice: document.getElementById("minPrice"),
    maxPrice: document.getElementById("maxPrice"),
    lotNo: document.getElementById("lotNo"),
    clearFilters: document.getElementById("clearFilters"),
    searchBtn: document.getElementById("searchBtn"),
    backToTop: document.getElementById("backToTop"),
    cookieBanner: document.getElementById("cookieBanner"),
    cookieAccept: document.getElementById("cookieAccept"),
    signInModal: document.getElementById("signInModal"),
    openSignInModal: document.getElementById("openSignInModal"),
    closeSignInModal: document.getElementById("closeSignInModal"),
    loginForm: document.getElementById("loginForm"),
    loginIdentity: document.getElementById("loginIdentity"),
    loginPassword: document.getElementById("loginPassword"),
    loginFormHint: document.getElementById("loginFormHint"),
    registerForm: document.getElementById("registerForm"),
    registerName: document.getElementById("registerName"),
    registerEmail: document.getElementById("registerEmail"),
    registerPassword: document.getElementById("registerPassword"),
    loginTurnstile: document.getElementById("loginTurnstile"),
    registerTurnstile: document.getElementById("registerTurnstile"),
    registerFormHint: document.getElementById("registerFormHint"),
    forgotPassBtn: document.getElementById("forgotPassBtn"),
    menuOpenBtn: document.getElementById("menuOpenBtn"),
    menuCloseBtn: document.getElementById("menuCloseBtn"),
    mainMenu: document.getElementById("mainMenu"),
    authStatus: document.getElementById("authStatus"),
    adminPanelLink: document.getElementById("adminPanelLink"),
    logoutBtn: document.getElementById("logoutBtn"),
};
init().catch((error) => {
    console.error(error);
    alert("Başlatma sırasında bir hata oluştu.");
});
async function init() {
    await hydrateTurnstileConfig();
    await initTurnstile();
    await loadListings();
    hydrateFilterOptions();
    bindEvents();
    await hydrateAuth();
    await handleUrlActions();
    render();
    updateCountdowns();
    setInterval(updateCountdowns, 1000);
}
function hydrateFilterOptions() {
    refillSelect(elements.productGroup, uniqueValues("productGroup"), "Urun Grubu Seciniz");
    refillSelect(elements.category, uniqueValues("category"), "Kategori Seciniz");
    refillSelect(elements.city, uniqueValues("city"), "Il Seciniz");
    refillSelect(elements.district, uniqueValues("district"), "Ilce Seciniz");
    refillSelect(elements.neighborhood, uniqueValues("neighborhood"), "Mahalle Seciniz");
}
function refillSelect(selectElement, values, placeholder) {
    selectElement.innerHTML = "";
    const option = document.createElement("option");
    option.value = "";
    option.textContent = placeholder;
    selectElement.appendChild(option);
    fillSelect(selectElement, values);
}
async function loadListings() {
    try {
        const data = await apiFetch("/api/auctions");
        const items = Array.isArray(data.items) ? data.items : [];
        state.listings = items.map((item, index) => toListingModel(item, index));
    }
    catch (error) {
        console.warn("Auction API fetch failed, using fallback list.", error);
        state.listings = [];
    }
    if (state.listings.length < 1) {
        state.listings = fallbackListings.map((item) => ({
            ...item,
            minIncrement: guessIncrement(item),
            status: "ACTIVE",
        }));
    }
}
function toListingModel(item, index) {
    const lotNo = String(item?.lot_no || item?.lotNo || "").trim().toUpperCase();
    const fallback = fallbackListingByLotNo.get(lotNo) || {};
    const startPrice = Number(item?.start_price ?? item?.startPrice ?? fallback.startPrice ?? 0);
    const currentBidRaw = item?.current_bid ?? item?.currentBid ?? fallback.lastBid ?? null;
    const currentBid = currentBidRaw === null || currentBidRaw === undefined ? null : Number(currentBidRaw);
    const minIncrementRaw = item?.min_increment ?? item?.minIncrement ?? fallback.minIncrement ?? guessIncrement({ startPrice });
    const minIncrement = Number.isFinite(Number(minIncrementRaw)) ? Number(minIncrementRaw) : guessIncrement({ startPrice });
    const endAt = String(item?.ends_at || item?.endAt || fallback.endAt || addTime(0, 1, 0, 0));
    const status = String(item?.status || fallback.status || "ACTIVE").toUpperCase();
    const createdAt = String(item?.created_at || item?.createdAt || fallback.createdAt || new Date().toISOString());
    return {
        id: item?.id || fallback.id || lotNo || String(index + 1),
        lotNo: lotNo || fallback.lotNo || `LOT${String(index + 1).padStart(3, "0")}`,
        title: String(item?.title || fallback.title || "Ihale"),
        productGroup: fallback.productGroup || "Genel",
        category: fallback.category || "Genel",
        city: fallback.city || "Belirtilmemis",
        district: fallback.district || "-",
        neighborhood: fallback.neighborhood || "-",
        startPrice: Number.isFinite(startPrice) ? startPrice : 0,
        lastBid: Number.isFinite(currentBid) ? currentBid : null,
        hasOffer: Number.isFinite(currentBid) && currentBid > 0,
        isNew: fallback.isNew ?? false,
        isOpportunity: fallback.isOpportunity ?? false,
        priceDropped: fallback.priceDropped ?? false,
        endAt,
        image: fallback.image || DEFAULT_LISTING_IMAGE,
        createdAt,
        status,
        minIncrement,
    };
}
async function hydrateTurnstileConfig() {
    try {
        const data = await apiFetch("/api/config");
        const runtimeKey = String(data.turnstileSiteKey || "").trim();
        state.auth.requireEmailVerification = data.requireEmailVerification === true;
        if (runtimeKey) {
            state.turnstile.siteKey = runtimeKey;
        }
    }
    catch {
        // ignore and fallback to meta value
    }
    state.turnstile.siteKey = state.turnstile.siteKey || "";
}
function bindEvents() {
    elements.sortTabs.addEventListener("click", (event) => {
        const link = event.target.closest("a[data-sort-type]");
        if (!link)
            return;
        event.preventDefault();
        state.tab = link.dataset.sortType;
        elements.sortMobile.value = state.tab;
        setActiveTab();
        render();
    });
    elements.sortMobile.addEventListener("change", () => {
        state.tab = elements.sortMobile.value;
        setActiveTab();
        render();
    });
    elements.order.addEventListener("change", () => {
        state.order = elements.order.value;
        render();
    });
    elements.searchBtn.addEventListener("click", (event) => {
        event.preventDefault();
        readFiltersFromForm();
        render();
    });
    elements.clearFilters.addEventListener("click", (event) => {
        event.preventDefault();
        clearFilters();
        render();
    });
    elements.cookieAccept.addEventListener("click", (event) => {
        event.preventDefault();
        elements.cookieBanner.classList.add("hide");
    });
    elements.openSignInModal.addEventListener("click", (event) => {
        event.preventDefault();
        if (state.auth.user)
            return;
        elements.signInModal.classList.add("open");
        elements.signInModal.setAttribute("aria-hidden", "false");
        elements.mainMenu.classList.remove("open");
    });
    elements.closeSignInModal.addEventListener("click", (event) => {
        event.preventDefault();
        closeModal();
    });
    elements.signInModal.addEventListener("click", (event) => {
        if (event.target === elements.signInModal) {
            closeModal();
        }
    });
    elements.loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await handleLogin();
    });
    elements.registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await handleRegister();
    });
    elements.forgotPassBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        await handleForgotPassword();
    });
    elements.logoutBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        await handleLogout();
    });
    elements.menuOpenBtn.addEventListener("click", (event) => {
        event.preventDefault();
        elements.mainMenu.classList.add("open");
    });
    elements.menuCloseBtn.addEventListener("click", (event) => {
        event.preventDefault();
        elements.mainMenu.classList.remove("open");
    });
    window.addEventListener("scroll", () => {
        if (window.scrollY > 320) {
            elements.backToTop.classList.add("visible");
        }
        else {
            elements.backToTop.classList.remove("visible");
        }
    });
    elements.backToTop.addEventListener("click", (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}
async function hydrateAuth() {
    try {
        const data = await apiFetch("/api/auth/me");
        state.auth.user = data.authenticated ? data.user : null;
    }
    catch {
        state.auth.user = null;
    }
    updateAuthUi();
}
function updateAuthUi() {
    const user = state.auth.user;
    if (!user) {
        elements.authStatus.textContent = "Misafir";
        elements.openSignInModal.classList.remove("hide");
        elements.adminPanelLink.classList.add("hide");
        elements.logoutBtn.classList.add("hide");
        return;
    }
    const verifiedText = state.auth.requireEmailVerification
        ? (user.emailVerified ? "doğrulanmış" : "doğrulanmamış")
        : "doğrulama kapalı";
    elements.authStatus.textContent = `${user.name} (${verifiedText})`;
    elements.openSignInModal.classList.add("hide");
    const canOpenAdmin = user.permissions?.[PERMISSION_ADMIN_PANEL_ACCESS] === true;
    elements.adminPanelLink.classList.toggle("hide", !canOpenAdmin);
    elements.logoutBtn.classList.remove("hide");
}
async function handleLogin() {
    const email = elements.loginIdentity.value.trim();
    const password = elements.loginPassword.value;
    if (!email || !password) {
        setHint(elements.loginFormHint, "E-posta ve şifre zorunludur.", "error");
        return;
    }
    try {
        const turnstileToken = await getTurnstileToken("login");
        const data = await apiFetch("/api/auth/login", {
            method: "POST",
            body: { email, password, turnstileToken },
        });
        state.auth.user = data.user;
        updateAuthUi();
        setHint(elements.loginFormHint, data.message || "Giriş başarılı.", "success");
        elements.loginForm.reset();
        resetTurnstile("login");
        closeModal();
    }
    catch (error) {
        resetTurnstile("login");
        setHint(elements.loginFormHint, error.message, "error");
    }
}
async function handleRegister() {
    const name = elements.registerName.value.trim();
    const email = elements.registerEmail.value.trim();
    const password = elements.registerPassword.value;
    if (!name || !email || !password) {
        setHint(elements.registerFormHint, "Ad Soyad, e-posta ve şifre zorunludur.", "error");
        return;
    }
    try {
        const turnstileToken = await getTurnstileToken("register");
        const data = await apiFetch("/api/auth/register", {
            method: "POST",
            body: { name, email, password, turnstileToken },
        });
        await hydrateAuth();
        setHint(elements.registerFormHint, data.message || "Kayıt başarılı.", "success");
        if (data.debugVerifyToken) {
            setHint(elements.registerFormHint, `Kayıt başarılı. Demo doğrulama token: ${data.debugVerifyToken}`, "success");
        }
        elements.registerForm.reset();
        resetTurnstile("register");
    }
    catch (error) {
        resetTurnstile("register");
        setHint(elements.registerFormHint, error.message, "error");
    }
}
async function handleForgotPassword() {
    const fallback = elements.loginIdentity.value.trim();
    const email = prompt("Şifre sıfırlama bağlantısı için e-posta adresinizi girin:", fallback);
    if (!email)
        return;
    try {
        const turnstileToken = await getTurnstileToken("login", false);
        const data = await apiFetch("/api/auth/password/forgot", {
            method: "POST",
            body: { email, turnstileToken },
        });
        let message = data.message || "Sıfırlama e-postası gönderildi.";
        if (data.debugResetToken) {
            message += `\n\nDemo reset token:\n${data.debugResetToken}`;
        }
        setHint(elements.loginFormHint, message, "success");
    }
    catch (error) {
        setHint(elements.loginFormHint, error.message, "error");
    }
}
async function handleLogout() {
    try {
        await apiFetch("/api/auth/logout", { method: "POST" });
    }
    catch {
        // noop
    }
    state.auth.user = null;
    updateAuthUi();
    setHint(elements.loginFormHint, "Çıkış yaptınız.", "success");
}
async function handleUrlActions() {
    const params = new URLSearchParams(window.location.search);
    const verifyToken = params.get("verify");
    const resetToken = params.get("reset");
    if (verifyToken) {
        try {
            const data = await apiFetch("/api/auth/verify/confirm", {
                method: "POST",
                body: { token: verifyToken },
            });
            await hydrateAuth();
            alert(data.message || "E-posta doğrulandı.");
        }
        catch (error) {
            alert(error.message);
        }
        params.delete("verify");
        rewriteUrlWithoutParams(params);
    }
    if (resetToken) {
        const newPassword = prompt("Yeni şifrenizi girin (en az 8 karakter):", "");
        if (newPassword) {
            try {
                const data = await apiFetch("/api/auth/password/reset", {
                    method: "POST",
                    body: { token: resetToken, newPassword },
                });
                alert(data.message || "Şifre güncellendi.");
            }
            catch (error) {
                alert(error.message);
            }
        }
        params.delete("reset");
        rewriteUrlWithoutParams(params);
    }
}
function rewriteUrlWithoutParams(params) {
    const query = params.toString();
    const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", next);
}
function setActiveTab() {
    const links = elements.sortTabs.querySelectorAll("a[data-sort-type]");
    links.forEach((link) => {
        link.classList.toggle("active", link.dataset.sortType === state.tab);
    });
}
function fillSelect(selectElement, values) {
    values.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        selectElement.appendChild(option);
    });
}
function uniqueValues(key) {
    return [...new Set(state.listings.map((item) => item[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "tr"));
}
function readFiltersFromForm() {
    state.filters = {
        productGroup: elements.productGroup.value,
        category: elements.category.value,
        city: elements.city.value,
        district: elements.district.value,
        neighborhood: elements.neighborhood.value,
        minPrice: elements.minPrice.value,
        maxPrice: elements.maxPrice.value,
        lotNo: elements.lotNo.value.trim(),
    };
}
function clearFilters() {
    state.filters = {
        productGroup: "",
        category: "",
        city: "",
        district: "",
        neighborhood: "",
        minPrice: "",
        maxPrice: "",
        lotNo: "",
    };
    elements.productGroup.value = "";
    elements.category.value = "";
    elements.city.value = "";
    elements.district.value = "";
    elements.neighborhood.value = "";
    elements.minPrice.value = "";
    elements.maxPrice.value = "";
    elements.lotNo.value = "";
}
function render() {
    const filtered = applyFilters(state.listings.slice());
    const sorted = applySort(filtered);
    elements.listingBoxes.innerHTML = sorted.map(renderCard).join("");
    elements.emptyState.classList.toggle("hide", sorted.length > 0);
    elements.listingBoxes.querySelectorAll(".bidBtn").forEach((button) => {
        button.addEventListener("click", async () => {
            await handleBid(button);
        });
    });
}
function applyFilters(data) {
    return data.filter((item) => {
        if (!passesTabFilter(item, state.tab))
            return false;
        if (state.filters.productGroup && item.productGroup !== state.filters.productGroup)
            return false;
        if (state.filters.category && item.category !== state.filters.category)
            return false;
        if (state.filters.city && item.city !== state.filters.city)
            return false;
        if (state.filters.district && item.district !== state.filters.district)
            return false;
        if (state.filters.neighborhood && item.neighborhood !== state.filters.neighborhood)
            return false;
        const minPrice = Number(state.filters.minPrice || 0);
        const maxPrice = Number(state.filters.maxPrice || Number.POSITIVE_INFINITY);
        if (item.startPrice < minPrice || item.startPrice > maxPrice)
            return false;
        if (state.filters.lotNo && !item.lotNo.toLowerCase().includes(state.filters.lotNo.toLowerCase()))
            return false;
        return true;
    });
}
function passesTabFilter(item, tab) {
    switch (tab) {
        case "HAVE_OFFER":
            return item.hasOffer;
        case "ADDED_NEW":
            return item.isNew;
        case "OPPORTUNITIES":
            return item.isOpportunity;
        case "FALL_IN_PRICE":
            return item.priceDropped;
        default:
            return true;
    }
}
function applySort(data) {
    if (state.order === "PRICE_ASC") {
        return data.sort((a, b) => a.startPrice - b.startPrice);
    }
    if (state.order === "PRICE_DESC") {
        return data.sort((a, b) => b.startPrice - a.startPrice);
    }
    return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
function renderCard(item) {
    const remaining = getRemaining(item.endAt);
    const isEnded = item.status === "ENDED" || remaining.totalSeconds <= 0;
    const countdownHtml = isEnded
        ? '<div class="counterEndText">İhale Sonuçlanmıştır</div>'
        : `
      <ul class="remaningTime" data-end-at="${item.endAt}">
        <li><span>${remaining.days}</span><span>Gün</span></li>
        <li><span>${remaining.hours}</span><span>Saat</span></li>
        <li><span>${remaining.minutes}</span><span>Dakika</span></li>
        <li><span>${remaining.seconds}</span><span>Saniye</span></li>
      </ul>
    `;
    const bidLabel = item.lastBid ? "SON TEKLİF" : "İLK TEKLİF BEKLENİYOR";
    const bidValue = item.lastBid ? formatMoney(item.lastBid) : "-";
    const minimumBid = (item.lastBid ?? item.startPrice) + Number(item.minIncrement || guessIncrement(item));
    const bidButtonText = isEnded ? "SONUCLANDI" : "TEKLIF VER";
    const bidButtonAttrs = isEnded ? 'disabled aria-disabled="true"' : "";
    return `
    <div class="box1 imgWrap">
      <div class="iContent">
        <div class="imgHead">
          <h3 class="reNo">No: <span>${escapeHtml(item.lotNo)}</span></h3>
          <a href="#" class="mainImg">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}">
          </a>
        </div>
        <div class="reInfo">
          <a href="#" class="headline">
            <h1><span>${escapeHtml(item.title)} (${escapeHtml(item.lotNo)})</span></h1>
          </a>
          <div class="location"><i class="fas fa-map-marker-alt"></i> <span>${escapeHtml(`${item.city} / ${item.district} / ${item.neighborhood}`)}</span></div>
          <h2 class="type"><i class="far fa-car"></i> <span>${escapeHtml(`${item.productGroup} / ${item.category}`)}</span></h2>
          <div class="counterWrap">
            <span class="cText">Kalan Süre</span>
            ${countdownHtml}
            ${item.hasOffer ? '<span class="offerAlarm"><i class="fas fa-bell"></i> Teklif Var</span>' : ""}
          </div>
        </div>
        <div class="addBid">
          <div class="adTopLine">
            <div class="tLine1">${formatMoney(item.startPrice)}</div>
            <div class="tLine2">Başlangıç Bedeli</div>
          </div>
          <div class="adBottomLine">
            <button class="bidBtn" data-lot-no="${escapeHtml(item.lotNo)}" data-min-bid="${minimumBid}" ${bidButtonAttrs}>${bidButtonText}</button>
            <div class="bLine1">${bidValue}</div>
            <div class="bLine2">${bidLabel}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}
async function handleBid(button) {
    if (!state.auth.user) {
        setHint(elements.loginFormHint, "Teklif verebilmek için giriş yapmalısınız.", "error");
        elements.signInModal.classList.add("open");
        elements.signInModal.setAttribute("aria-hidden", "false");
        return;
    }
    if (state.auth.user.permissions?.[PERMISSION_BIDS_PLACE] === false) {
        alert("Teklif verme yetkiniz pasif. Lütfen yöneticiyle iletişime geçin.");
        return;
    }
    if (state.auth.requireEmailVerification && !state.auth.user.emailVerified) {
        try {
            const data = await apiFetch("/api/auth/verify/request", { method: "POST" });
            const message = data.debugVerifyToken
                ? `${data.message}\n\nDemo doğrulama token:\n${data.debugVerifyToken}`
                : data.message;
            alert(message);
        }
        catch (error) {
            alert(error.message);
        }
        return;
    }
    const lotNo = button.dataset.lotNo;
    const minBid = Number(button.dataset.minBid || 0);
    const amountInput = prompt(`İhale ${lotNo} için teklif tutarı girin (min ${formatMoney(minBid)}):`, String(minBid));
    if (!amountInput)
        return;
    const amount = Number(String(amountInput).replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Geçerli bir teklif tutarı girin.");
        return;
    }
    try {
        const data = await apiFetch("/api/bids", {
            method: "POST",
            body: { lotNo, amount },
        });
        const listing = state.listings.find((x) => x.lotNo === lotNo);
        if (listing) {
            listing.lastBid = data.amount;
            listing.hasOffer = true;
        }
        await loadListings();
        render();
        alert(data.message || "Teklifiniz alındı.");
    }
    catch (error) {
        alert(error.message);
    }
}
function updateCountdowns() {
    const timers = document.querySelectorAll(".remaningTime[data-end-at]");
    timers.forEach((timer) => {
        const remaining = getRemaining(timer.dataset.endAt);
        if (remaining.totalSeconds <= 0) {
            const wrapper = timer.closest(".counterWrap");
            timer.remove();
            const endText = document.createElement("div");
            endText.className = "counterEndText";
            endText.textContent = "İhale Sonuçlanmıştır";
            const anchor = wrapper.querySelector(".offerAlarm");
            if (anchor)
                wrapper.insertBefore(endText, anchor);
            else
                wrapper.appendChild(endText);
            return;
        }
        const parts = timer.querySelectorAll("li span:first-child");
        if (parts.length !== 4)
            return;
        parts[0].textContent = remaining.days;
        parts[1].textContent = remaining.hours;
        parts[2].textContent = remaining.minutes;
        parts[3].textContent = remaining.seconds;
    });
}
function getRemaining(endAt) {
    const now = Date.now();
    const target = new Date(endAt).getTime();
    const totalSeconds = Math.floor((target - now) / 1000);
    if (totalSeconds <= 0) {
        return { totalSeconds: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { totalSeconds, days, hours, minutes, seconds };
}
function formatMoney(value) {
    return new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
}
function addTime(days, hours, minutes, seconds) {
    const current = new Date();
    current.setDate(current.getDate() + days);
    current.setHours(current.getHours() + hours);
    current.setMinutes(current.getMinutes() + minutes);
    current.setSeconds(current.getSeconds() + seconds);
    return current.toISOString();
}
function closeModal() {
    elements.signInModal.classList.remove("open");
    elements.signInModal.setAttribute("aria-hidden", "true");
}
function setHint(target, text, type) {
    target.textContent = text || "";
    target.classList.remove("error", "success");
    if (type)
        target.classList.add(type);
}
function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
function guessIncrement(item) {
    if (item.startPrice >= 3000000)
        return 10000;
    if (item.startPrice >= 1000000)
        return 5000;
    return 1000;
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
        throw new Error(data.error || `İstek başarısız (${response.status})`);
    }
    return data;
}
async function initTurnstile() {
    const siteKey = String(state.turnstile.siteKey || "").trim();
    if (!siteKey)
        return;
    if (!elements.loginTurnstile || !elements.registerTurnstile)
        return;
    const turnstile = await waitForTurnstile(6000);
    if (!turnstile)
        return;
    state.turnstile.loginWidgetId = turnstile.render("#loginTurnstile", {
        sitekey: siteKey,
        action: "login",
        theme: "auto",
        size: "flexible",
        callback: (token) => {
            state.turnstile.loginToken = token || "";
        },
        "expired-callback": () => {
            state.turnstile.loginToken = "";
        },
        "error-callback": () => {
            state.turnstile.loginToken = "";
        },
    });
    state.turnstile.registerWidgetId = turnstile.render("#registerTurnstile", {
        sitekey: siteKey,
        action: "register",
        theme: "auto",
        size: "flexible",
        callback: (token) => {
            state.turnstile.registerToken = token || "";
        },
        "expired-callback": () => {
            state.turnstile.registerToken = "";
        },
        "error-callback": () => {
            state.turnstile.registerToken = "";
        },
    });
    state.turnstile.enabled = true;
}
async function waitForTurnstile(timeoutMs) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
        if (window.turnstile && typeof window.turnstile.render === "function") {
            return window.turnstile;
        }
        await sleep(60);
    }
    return null;
}
async function getTurnstileToken(kind, required = true) {
    if (!state.turnstile.enabled) {
        if (required) {
            throw new Error("Güvenlik doğrulaması yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.");
        }
        return "";
    }
    if (kind === "login") {
        if (state.turnstile.loginToken)
            return state.turnstile.loginToken;
        if (required)
            throw new Error("Lütfen giriş doğrulamasını tamamlayın.");
        return "";
    }
    if (kind === "register") {
        if (state.turnstile.registerToken)
            return state.turnstile.registerToken;
        if (required)
            throw new Error("Lütfen kayıt doğrulamasını tamamlayın.");
        return "";
    }
    return "";
}
function resetTurnstile(kind) {
    if (!state.turnstile.enabled || !window.turnstile)
        return;
    if (kind === "login" && state.turnstile.loginWidgetId !== null) {
        state.turnstile.loginToken = "";
        window.turnstile.reset(state.turnstile.loginWidgetId);
    }
    if (kind === "register" && state.turnstile.registerWidgetId !== null) {
        state.turnstile.registerToken = "";
        window.turnstile.reset(state.turnstile.registerWidgetId);
    }
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
