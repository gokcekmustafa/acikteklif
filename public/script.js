"use strict";
const API_BASE = "";
const PRIMARY_APP_ORIGIN = "https://acik-teklif-pazari.gokcek.workers.dev";
const PERMISSION_ADMIN_PANEL_ACCESS = "admin.panel.access";
const PERMISSION_BIDS_PLACE = "bids.place";
const ONLY_AUTOMOBILE_MODE = true;
const AUTOMOBILE_PRODUCT_GROUP = "Vasıta";
const AUTOMOBILE_CATEGORY = "Otomobil";
const DEFAULT_TURKEY_CITIES = [
    "Adana",
    "Adiyaman",
    "Afyonkarahisar",
    "Agri",
    "Aksaray",
    "Amasya",
    "Ankara",
    "Antalya",
    "Ardahan",
    "Artvin",
    "Aydin",
    "Balikesir",
    "Bartin",
    "Batman",
    "Bayburt",
    "Bilecik",
    "Bingol",
    "Bitlis",
    "Bolu",
    "Burdur",
    "Bursa",
    "Canakkale",
    "Cankiri",
    "Corum",
    "Denizli",
    "Diyarbakir",
    "Duzce",
    "Edirne",
    "Elazig",
    "Erzincan",
    "Erzurum",
    "Eskisehir",
    "Gaziantep",
    "Giresun",
    "Gumushane",
    "Hakkari",
    "Hatay",
    "Igdir",
    "Isparta",
    "Istanbul",
    "Izmir",
    "Kahramanmaras",
    "Karabuk",
    "Karaman",
    "Kars",
    "Kastamonu",
    "Kayseri",
    "Kirikkale",
    "Kirklareli",
    "Kirsehir",
    "Kilis",
    "Kocaeli",
    "Konya",
    "Kutahya",
    "Malatya",
    "Manisa",
    "Mardin",
    "Mersin",
    "Mugla",
    "Mus",
    "Nevsehir",
    "Nigde",
    "Ordu",
    "Osmaniye",
    "Rize",
    "Sakarya",
    "Samsun",
    "Siirt",
    "Sinop",
    "Sivas",
    "Sanliurfa",
    "Sirnak",
    "Tekirdag",
    "Tokat",
    "Trabzon",
    "Tunceli",
    "Usak",
    "Van",
    "Yalova",
    "Yozgat",
    "Zonguldak",
];
const LABEL_PRODUCT_GROUP = "Ürün Grubu Seçiniz";
const LABEL_ALL_CATEGORIES = "Tüm Kategoriler";
const LABEL_ALL_CITIES = "Tüm İller";
const LABEL_ALL_DISTRICTS = "Tüm İlçeler";
const LABEL_ALL_NEIGHBORHOODS = "Tüm Mahalleler";
const LABEL_ALL_BRANDS = "Tüm Markalar";
const LABEL_ALL_MODELS = "Tüm Modeller";
const NEW_LISTING_WINDOW_DAYS = 30;
const VEHICLE_BRAND_MODEL_CATALOG = {
    "Alfa Romeo": ["159", "Giulia", "Giulietta", "Stelvio", "Tonale"],
    "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "E-Tron"],
    "BMW": ["1 Serisi", "2 Serisi", "3 Serisi", "4 Serisi", "5 Serisi", "7 Serisi", "X1", "X2", "X3", "X4", "X5", "X6", "I4", "IX"],
    "BYD": ["Atto 3", "Dolphin", "Han", "Seal", "Seal U"],
    "Chery": ["Omoda 5", "Tiggo 7 Pro", "Tiggo 8 Pro"],
    "Citroen": ["Berlingo", "C3", "C4", "C4 X", "C5 Aircross", "C-Elysee", "Jumpy"],
    "Cupra": ["Ateca", "Born", "Formentor", "Leon"],
    "Dacia": ["Duster", "Jogger", "Lodgy", "Logan", "Sandero", "Spring"],
    "DS": ["DS 4", "DS 7", "DS 9"],
    "Fiat": ["500", "500e", "Doblo", "Egea", "Fiorino", "Linea", "Panda", "Punto"],
    "Ford": ["B-Max", "C-Max", "Courier", "EcoSport", "Fiesta", "Focus", "Fusion", "Kuga", "Mondeo", "Mustang", "Puma", "Ranger", "S-Max", "Tourneo", "Transit"],
    "Honda": ["Accord", "Civic", "City", "CR-V", "HR-V", "Jazz"],
    "Hyundai": ["Accent", "Accent Blue", "Bayon", "Elantra", "Getz", "I10", "I20", "I30", "Ioniq", "Kona", "Santa Fe", "Staria", "Tucson"],
    "Isuzu": ["D-Max"],
    "Jaguar": ["E-Pace", "F-Pace", "I-Pace", "XE", "XF"],
    "Jeep": ["Avenger", "Cherokee", "Compass", "Renegade", "Wrangler"],
    "Kia": ["Ceed", "Cerato", "EV6", "Niro", "Picanto", "Rio", "Sorento", "Sportage", "Stonic"],
    "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Velar"],
    "Lexus": ["ES", "IS", "NX", "RX", "UX"],
    "Maserati": ["Ghibli", "Grecale", "Levante", "Quattroporte"],
    "Mazda": ["2", "3", "6", "CX-3", "CX-30", "CX-5", "CX-60", "MX-5"],
    "Mercedes-Benz": ["A Serisi", "B Serisi", "C Serisi", "CLA", "CLS", "E Serisi", "G Serisi", "GLA", "GLB", "GLC", "GLE", "GLS", "S Serisi", "Vito"],
    "MG": ["HS", "MG4", "Marvel R", "ZS", "ZS EV"],
    "Mini": ["Clubman", "Countryman", "Cooper", "Cooper S"],
    "Mitsubishi": ["ASX", "Colt", "Eclipse Cross", "L200", "L300", "Outlander", "Pajero"],
    "Nissan": ["Juke", "Leaf", "Micra", "Navara", "Note", "Qashqai", "X-Trail"],
    "Opel": ["Astra", "Combo", "Corsa", "Crossland", "Frontera", "Grandland", "Insignia", "Mokka", "Vivaro", "Zafira"],
    "Peugeot": ["2008", "3008", "301", "308", "408", "5008", "508", "Partner", "Rifter"],
    "Porsche": ["911", "Cayenne", "Macan", "Panamera", "Taycan"],
    "Renault": ["Captur", "Clio", "Fluence", "Kadjar", "Kangoo", "Koleos", "Laguna", "Megane", "Scenic", "Symbol", "Talisman", "Toros", "Trafic", "Twingo", "Zoe"],
    "Seat": ["Arona", "Ateca", "Ibiza", "Leon", "Tarraco", "Toledo"],
    "Skoda": ["Fabia", "Kamiq", "Karoq", "Kodiaq", "Octavia", "Rapid", "Scala", "Superb", "Yeti"],
    "Smart": ["Forfour", "Fortwo"],
    "Subaru": ["Forester", "Impreza", "Legacy", "Outback", "XV"],
    "Suzuki": ["Baleno", "Grand Vitara", "Ignis", "Jimny", "S-Cross", "Swift", "Vitara"],
    "Tesla": ["Model 3", "Model S", "Model X", "Model Y"],
    "Tofas": ["Dogan", "Kartal", "Murat", "Sahin", "Serce"],
    "Togg": ["T10F", "T10X"],
    "Toyota": ["Auris", "Avensis", "C-HR", "Camry", "Corolla", "Corolla Cross", "Hilux", "Prius", "RAV4", "Yaris", "Yaris Cross"],
    "Volkswagen": ["Amarok", "Arteon", "Caddy", "Caravelle", "Golf", "ID.3", "ID.4", "Jetta", "Passat", "Polo", "T-Cross", "T-Roc", "Tiguan", "Touareg", "Transporter"],
    "Volvo": ["C40", "S60", "S90", "V40", "V60", "XC40", "XC60", "XC90"]
};
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
const localFallbackHosts = new Set(["localhost", "127.0.0.1", "::1"]);
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
        vehicleBrand: "",
        vehicleModel: "",
        minPrice: "",
        maxPrice: "",
        lotNo: "",
    },
    filterOptions: {
        productGroups: [],
        categories: [],
        cities: [],
        districts: [],
        neighborhoods: [],
        vehicleBrands: [],
        vehicleModelsByBrand: {},
        districtsByCity: {},
    },
    auth: {
        user: null,
        requireEmailVerification: false,
    },
    turnstile: {
        siteKey: META_TURNSTILE_SITE_KEY || "",
        required: false,
        enabled: false,
        loginWidgetId: null,
        registerWidgetId: null,
        loginToken: "",
        registerToken: "",
    },
    listingLoadError: "",
    myBids: [],
    favorites: [],
    favoriteLotNoSet: new Set(),
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
    vehicleBrand: document.getElementById("vehicleBrand"),
    vehicleModel: document.getElementById("vehicleModel"),
    minPrice: document.getElementById("minPrice"),
    maxPrice: document.getElementById("maxPrice"),
    lotNo: document.getElementById("lotNo"),
    clearFilters: document.getElementById("clearFilters"),
    searchBtn: document.getElementById("searchBtn"),
    backToTop: document.getElementById("backToTop"),
    cookieBanner: document.getElementById("cookieBanner"),
    cookieAccept: document.getElementById("cookieAccept"),
    signInModal: document.getElementById("signInModal"),
    registerModal: document.getElementById("registerModal"),
    profileModal: document.getElementById("profileModal"),
    myBidsModal: document.getElementById("myBidsModal"),
    favoritesModal: document.getElementById("favoritesModal"),
    openSignInModal: document.getElementById("openSignInModal"),
    openRegisterModal: document.getElementById("openRegisterModal"),
    openRegisterModalFromLogin: document.getElementById("openRegisterModalFromLogin"),
    openSignInModalFromRegister: document.getElementById("openSignInModalFromRegister"),
    openProfileModal: document.getElementById("openProfileModal"),
    openMyBidsModal: document.getElementById("openMyBidsModal"),
    openFavoritesModal: document.getElementById("openFavoritesModal"),
    closeSignInModal: document.getElementById("closeSignInModal"),
    closeRegisterModal: document.getElementById("closeRegisterModal"),
    closeProfileModal: document.getElementById("closeProfileModal"),
    closeMyBidsModal: document.getElementById("closeMyBidsModal"),
    closeFavoritesModal: document.getElementById("closeFavoritesModal"),
    loginForm: document.getElementById("loginForm"),
    loginIdentity: document.getElementById("loginIdentity"),
    loginPassword: document.getElementById("loginPassword"),
    loginFormHint: document.getElementById("loginFormHint"),
    registerForm: document.getElementById("registerForm"),
    registerName: document.getElementById("registerName"),
    registerIdentityNo: document.getElementById("registerIdentityNo"),
    registerPhone: document.getElementById("registerPhone"),
    registerAddress: document.getElementById("registerAddress"),
    registerEmail: document.getElementById("registerEmail"),
    registerPassword: document.getElementById("registerPassword"),
    profileForm: document.getElementById("profileForm"),
    profileName: document.getElementById("profileName"),
    profileIdentityNo: document.getElementById("profileIdentityNo"),
    profilePhone: document.getElementById("profilePhone"),
    profileAddress: document.getElementById("profileAddress"),
    profileEmail: document.getElementById("profileEmail"),
    profileFormHint: document.getElementById("profileFormHint"),
    myBidsRows: document.getElementById("myBidsRows"),
    myBidsEmpty: document.getElementById("myBidsEmpty"),
    myBidsSummary: document.getElementById("myBidsSummary"),
    favoritesRows: document.getElementById("favoritesRows"),
    favoritesEmpty: document.getElementById("favoritesEmpty"),
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
    await loadFilterOptions();
    hydrateFilterOptions();
    applyInitialFilters();
    bindEvents();
    await hydrateAuth();
    await handleUrlActions();
    render();
    updateCountdowns();
    setInterval(updateCountdowns, 1000);
}
function hydrateFilterOptions() {
    const previousGroup = String(state.filters.productGroup || elements.productGroup.value || "").trim();
    const previousCategory = String(state.filters.category || elements.category.value || "").trim();
    const previousCity = String(state.filters.city || elements.city.value || "").trim();
    const previousBrand = String(state.filters.vehicleBrand || elements.vehicleBrand.value || "").trim();
    const previousModel = String(state.filters.vehicleModel || elements.vehicleModel.value || "").trim();
    if (ONLY_AUTOMOBILE_MODE) {
        refillSelect(elements.productGroup, [AUTOMOBILE_PRODUCT_GROUP], LABEL_PRODUCT_GROUP);
        elements.productGroup.value = AUTOMOBILE_PRODUCT_GROUP;
    }
    else {
        refillSelect(elements.productGroup, state.filterOptions.productGroups, LABEL_PRODUCT_GROUP);
        if (previousGroup) {
            const matchedGroup = findMatchingOptionValue(state.filterOptions.productGroups, previousGroup);
            if (matchedGroup)
                elements.productGroup.value = matchedGroup;
        }
    }
    const categoryValues = state.filterOptions.categories;
    refillSelect(elements.category, categoryValues, LABEL_ALL_CATEGORIES);
    const matchedCategory = findMatchingOptionValue(categoryValues, previousCategory);
    elements.category.value = matchedCategory || "";
    refillSelect(elements.city, state.filterOptions.cities, LABEL_ALL_CITIES);
    const matchedCity = findMatchingOptionValue(state.filterOptions.cities, previousCity);
    elements.city.value = matchedCity || "";
    refreshDistrictOptions("");
    refreshNeighborhoodOptions("");
    const brandValues = state.filterOptions.vehicleBrands || [];
    refillSelect(elements.vehicleBrand, brandValues, LABEL_ALL_BRANDS);
    const matchedBrand = findMatchingOptionValue(brandValues, previousBrand);
    elements.vehicleBrand.value = matchedBrand || "";
    refreshVehicleModelOptions(previousModel);
    updateFilterOptionCountLabels();
}
function refreshDistrictOptions(preferredDistrict = "") {
    const cityValue = String(elements.city.value || "").trim();
    const districtOptions = getDistrictOptionsForCity(cityValue);
    const placeholder = LABEL_ALL_DISTRICTS;
    refillSelect(elements.district, districtOptions, placeholder);
    elements.district.disabled = !cityValue;
    const matchedDistrict = cityValue ? findMatchingOptionValue(districtOptions, preferredDistrict) : "";
    elements.district.value = matchedDistrict || "";
}
function refreshNeighborhoodOptions(preferredNeighborhood = "") {
    const cityValue = String(elements.city.value || "").trim();
    const districtValue = String(elements.district.value || "").trim();
    const neighborhoodOptions = getNeighborhoodOptions(cityValue, districtValue);
    const placeholder = LABEL_ALL_NEIGHBORHOODS;
    refillSelect(elements.neighborhood, neighborhoodOptions, placeholder);
    elements.neighborhood.disabled = !cityValue;
    const matchedNeighborhood = cityValue ? findMatchingOptionValue(neighborhoodOptions, preferredNeighborhood) : "";
    elements.neighborhood.value = matchedNeighborhood || "";
}
function getDistrictOptionsForCity(cityValue) {
    const city = String(cityValue || "").trim();
    if (!city)
        return [];
    const map = state.filterOptions.districtsByCity || {};
    const direct = map[city];
    if (Array.isArray(direct)) {
        return uniqueTextList(direct);
    }
    const cityKey = normalizeText(city);
    for (const [candidateCity, districts] of Object.entries(map)) {
        if (normalizeText(candidateCity) !== cityKey)
            continue;
        return uniqueTextList(Array.isArray(districts) ? districts : []);
    }
    return uniqueTextList(state.listings
        .filter((item) => normalizeText(item.city) === cityKey)
        .map((item) => String(item.district || "").trim()));
}
function getNeighborhoodOptions(cityValue, districtValue) {
    const city = String(cityValue || "").trim();
    if (!city)
        return [];
    const cityKey = normalizeText(city);
    const districtKey = normalizeText(districtValue);
    const values = state.listings
        .filter((item) => normalizeText(item.city) === cityKey)
        .filter((item) => !districtKey || normalizeText(item.district) === districtKey)
        .map((item) => String(item.neighborhood || "").trim());
    return uniqueTextList(values);
}
function refreshVehicleModelOptions(preferredModel = "") {
    const brandValue = String(elements.vehicleBrand.value || "").trim();
    const modelValues = getVehicleModelsForBrand(brandValue);
    refillSelect(elements.vehicleModel, modelValues, LABEL_ALL_MODELS);
    elements.vehicleModel.disabled = !brandValue;
    const matchedModel = brandValue ? findMatchingOptionValue(modelValues, preferredModel) : "";
    elements.vehicleModel.value = matchedModel || "";
}
function getVehicleModelsForBrand(brandValue) {
    const brand = String(brandValue || "").trim();
    if (!brand)
        return [];
    const map = state.filterOptions.vehicleModelsByBrand || {};
    const direct = map[brand];
    if (Array.isArray(direct))
        return uniqueTextList(direct);
    const brandKey = normalizeText(brand);
    for (const [candidateBrand, models] of Object.entries(map)) {
        if (normalizeText(candidateBrand) !== brandKey)
            continue;
        return uniqueTextList(Array.isArray(models) ? models : []);
    }
    return uniqueTextList(state.listings
        .filter((item) => normalizeText(item.vehicleBrand) === brandKey)
        .map((item) => String(item.vehicleModel || "").trim()));
}
function buildVehicleFilterOptions() {
    const normalizedCatalog = {};
    for (const [brandRaw, modelsRaw] of Object.entries(VEHICLE_BRAND_MODEL_CATALOG)) {
        const brand = String(brandRaw || "").trim();
        if (!brand)
            continue;
        normalizedCatalog[brand] = uniqueTextList(Array.isArray(modelsRaw) ? modelsRaw : []);
    }
    for (const item of state.listings || []) {
        const brand = String(item?.vehicleBrand || "").trim();
        const model = String(item?.vehicleModel || "").trim();
        if (!brand)
            continue;
        if (!Object.prototype.hasOwnProperty.call(normalizedCatalog, brand)) {
            normalizedCatalog[brand] = [];
        }
        normalizedCatalog[brand].push(model);
    }
    const vehicleModelsByBrand = {};
    const vehicleBrands = uniqueTextList(Object.keys(normalizedCatalog)).sort((a, b) => a.localeCompare(b, "tr"));
    for (const brand of vehicleBrands) {
        vehicleModelsByBrand[brand] = uniqueTextList(normalizedCatalog[brand] || []).sort((a, b) => a.localeCompare(b, "tr"));
    }
    return {
        vehicleBrands,
        vehicleModelsByBrand,
    };
}
function findMatchingOptionValue(values, targetValue) {
    const target = String(targetValue || "").trim();
    if (!target)
        return "";
    if (values.includes(target))
        return target;
    const targetKey = normalizeText(target);
    return values.find((value) => normalizeText(value) === targetKey) || "";
}
function applyInitialFilters() {
    if (ONLY_AUTOMOBILE_MODE) {
        state.filters.productGroup = AUTOMOBILE_PRODUCT_GROUP;
        elements.productGroup.value = AUTOMOBILE_PRODUCT_GROUP;
        state.filters.category = "";
        elements.category.value = "";
    }
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
    state.listingLoadError = "";
    let apiFailed = false;
    try {
        const data = await apiFetch("/api/auctions");
        const items = Array.isArray(data.items) ? data.items : [];
        state.listings = enforceListingScope(items.map((item, index) => toListingModel(item, index)));
    }
    catch (error) {
        apiFailed = true;
        console.warn("Auction API fetch failed.", error);
        state.listings = [];
    }
    if (state.listings.length < 1 && apiFailed && shouldUseLocalFallback()) {
        state.listings = enforceListingScope(fallbackListings.map((item) => ({
            ...item,
            minIncrement: guessIncrement(item),
            status: "ACTIVE",
        })));
        return;
    }
    if (state.listings.length < 1 && apiFailed) {
        state.listingLoadError =
            `Ihale verisi sunucudan alinamadi. Dogru adresi acin: ${PRIMARY_APP_ORIGIN}`;
    }
}
function enforceListingScope(rows) {
    if (!ONLY_AUTOMOBILE_MODE)
        return rows;
    return rows
        .filter((item) => isAutomobileCandidate(item))
        .map((item) => ({
        ...item,
        productGroup: AUTOMOBILE_PRODUCT_GROUP,
    }));
}
async function loadFilterOptions() {
    try {
        const data = await apiFetch("/api/filter-options");
        applyFilterOptionsPayload(data);
    }
    catch (error) {
        console.warn("Filter options fetch failed.", error);
        applyFallbackFilterOptions();
    }
}
function applyFilterOptionsPayload(data) {
    const options = data?.options || {};
    const productGroups = uniqueTextList(options.productGroups);
    const categories = uniqueTextList(options.categories);
    const citiesFromApi = uniqueTextList(options.cities);
    const fallbackCities = uniqueTextList([...DEFAULT_TURKEY_CITIES, ...uniqueValues("city")]);
    const cities = citiesFromApi.length > 0 ? citiesFromApi : fallbackCities;
    const neighborhoods = uniqueTextList(options.neighborhoods);
    const districtsByCity = normalizeDistrictMap(options.districtsByCity, cities);
    const districtsFromApi = uniqueTextList(options.districts);
    const districtsFromMap = uniqueTextList(Object.values(districtsByCity).flatMap((value) => (Array.isArray(value) ? value : [])));
    const districts = uniqueTextList([...districtsFromApi, ...districtsFromMap]);
    const vehicleFilters = buildVehicleFilterOptions();
    state.filterOptions = {
        productGroups: productGroups.length > 0 ? productGroups : uniqueValues("productGroup"),
        categories: categories.length > 0 ? categories : uniqueValues("category"),
        cities,
        districts: districts.length > 0 ? districts : uniqueValues("district"),
        neighborhoods: neighborhoods.length > 0 ? neighborhoods : uniqueValues("neighborhood"),
        vehicleBrands: vehicleFilters.vehicleBrands,
        vehicleModelsByBrand: vehicleFilters.vehicleModelsByBrand,
        districtsByCity: Object.keys(districtsByCity).length > 0 ? districtsByCity : buildDistrictMapFromListings(cities),
    };
}
function applyFallbackFilterOptions() {
    const cities = uniqueTextList([...DEFAULT_TURKEY_CITIES, ...uniqueValues("city")]);
    const districtsByCity = buildDistrictMapFromListings(cities);
    const districts = uniqueTextList(Object.values(districtsByCity).flatMap((value) => (Array.isArray(value) ? value : [])));
    const vehicleFilters = buildVehicleFilterOptions();
    state.filterOptions = {
        productGroups: uniqueValues("productGroup"),
        categories: uniqueValues("category"),
        cities,
        districts,
        neighborhoods: uniqueValues("neighborhood"),
        vehicleBrands: vehicleFilters.vehicleBrands,
        vehicleModelsByBrand: vehicleFilters.vehicleModelsByBrand,
        districtsByCity,
    };
}
function normalizeDistrictMap(rawMap, cities) {
    const source = rawMap && typeof rawMap === "object" ? rawMap : {};
    const out = {};
    for (const [cityRaw, districtsRaw] of Object.entries(source)) {
        const city = String(cityRaw || "").trim();
        if (!city)
            continue;
        out[city] = uniqueTextList(Array.isArray(districtsRaw) ? districtsRaw : []);
    }
    for (const cityRaw of cities || []) {
        const city = String(cityRaw || "").trim();
        if (!city)
            continue;
        if (!Object.prototype.hasOwnProperty.call(out, city)) {
            out[city] = [];
        }
    }
    return out;
}
function buildDistrictMapFromListings(cities) {
    const out = {};
    for (const cityRaw of cities || []) {
        const city = String(cityRaw || "").trim();
        if (!city)
            continue;
        out[city] = [];
    }
    for (const item of state.listings || []) {
        const city = String(item?.city || "").trim();
        const district = String(item?.district || "").trim();
        if (!city)
            continue;
        if (!Object.prototype.hasOwnProperty.call(out, city)) {
            out[city] = [];
        }
        out[city].push(district);
    }
    for (const [city, districts] of Object.entries(out)) {
        out[city] = uniqueTextList(Array.isArray(districts) ? districts : []);
    }
    return out;
}
function isAutomobileCandidate(item) {
    const group = normalizeText(item?.productGroup);
    const category = normalizeText(item?.category);
    const hasVehicleFields = String(item?.vehicleBrand || "").trim().length > 0 || String(item?.vehicleModel || "").trim().length > 0;
    const vehicleGroup = group.includes("vasita") ||
        group.includes("arac") ||
        group.includes("otomotiv") ||
        group.includes("otomobil");
    const vehicleCategory = category.includes("otomobil") ||
        category.includes("otomotiv") ||
        category.includes("arac") ||
        category.includes("suv") ||
        category.includes("sedan") ||
        category.includes("hatchback") ||
        category.includes("coupe");
    return vehicleGroup || vehicleCategory || hasVehicleFields;
}
function normalizeText(value) {
    return String(value || "")
        .toLocaleLowerCase("tr-TR")
        .replaceAll("ı", "i")
        .replaceAll("ç", "c")
        .replaceAll("ğ", "g")
        .replaceAll("ö", "o")
        .replaceAll("ş", "s")
        .replaceAll("ü", "u");
}
function normalizeLotNoKey(value) {
    return String(value || "").trim().toUpperCase();
}
function parseDateMs(value) {
    const raw = String(value || "").trim();
    if (!raw)
        return Number.NaN;
    const direct = Date.parse(raw);
    if (Number.isFinite(direct))
        return direct;
    const normalized = raw.replace(" ", "T");
    const normalizedParsed = Date.parse(normalized);
    if (Number.isFinite(normalizedParsed))
        return normalizedParsed;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(normalized)) {
        const utcParsed = Date.parse(`${normalized}Z`);
        if (Number.isFinite(utcParsed))
            return utcParsed;
    }
    return Number.NaN;
}
function isWithinLastDays(value, days) {
    const timestamp = parseDateMs(value);
    if (!Number.isFinite(timestamp))
        return false;
    const now = Date.now();
    const windowMs = Math.max(1, Number(days) || 0) * 24 * 60 * 60 * 1000;
    return timestamp >= now - windowMs;
}
function readBooleanValue(...values) {
    for (const value of values) {
        if (typeof value === "boolean")
            return value;
        if (typeof value === "number") {
            if (value === 1)
                return true;
            if (value === 0)
                return false;
            continue;
        }
        const raw = String(value ?? "").trim();
        if (!raw)
            continue;
        const folded = raw.toLocaleLowerCase("tr-TR");
        if (["1", "true", "evet", "yes"].includes(folded))
            return true;
        if (["0", "false", "hayir", "hayır", "no"].includes(folded))
            return false;
    }
    return null;
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
    const createdAt = String(item?.created_at ||
        item?.createdAt ||
        item?.starts_at ||
        item?.startsAt ||
        fallback.createdAt ||
        new Date().toISOString());
    const productGroup = String(item?.product_group || item?.productGroup || fallback.productGroup || "Genel");
    const category = String(item?.category || fallback.category || "Genel");
    const city = String(item?.city || fallback.city || "Belirtilmemiş");
    const district = String(item?.district || fallback.district || "-");
    const neighborhood = String(item?.neighborhood || fallback.neighborhood || "-");
    const gallery = extractGalleryFromItem(item, fallback.image);
    const image = String(gallery[0] || item?.image_url || item?.imageUrl || fallback.image || DEFAULT_LISTING_IMAGE);
    const vehicleBrand = String(item?.vehicle_brand || item?.vehicleBrand || "");
    const vehicleModel = String(item?.vehicle_model || item?.vehicleModel || "");
    const vehicleModelDetail = String(item?.vehicle_model_detail || item?.vehicleModelDetail || "");
    const vehicleYear = Number(item?.vehicle_year || item?.vehicleYear || 0);
    const vehicleKm = Number(item?.vehicle_km || item?.vehicleKm || 0);
    const detailUrl = buildAuctionDetailUrl(lotNo || fallback.lotNo || `LOT${String(index + 1).padStart(3, "0")}`);
    const isNewExplicit = readBooleanValue(item?.is_new, item?.isNew, item?.new);
    const isNewComputed = isWithinLastDays(createdAt, NEW_LISTING_WINDOW_DAYS);
    const isFavorite = readBooleanValue(item?.is_favorite, item?.isFavorite) === true;
    const isAutoBidEnabled = readBooleanValue(item?.user_auto_bid_enabled, item?.userAutoBidEnabled) === true;
    const autoBidMaxRaw = item?.user_auto_bid_max ?? item?.userAutoBidMax ?? null;
    const autoBidMax = autoBidMaxRaw === null || autoBidMaxRaw === undefined ? null : Number(autoBidMaxRaw);
    return {
        id: item?.id || fallback.id || lotNo || String(index + 1),
        lotNo: lotNo || fallback.lotNo || `LOT${String(index + 1).padStart(3, "0")}`,
        title: String(item?.title || fallback.title || "İhale"),
        productGroup,
        category,
        city,
        district,
        neighborhood,
        startPrice: Number.isFinite(startPrice) ? startPrice : 0,
        lastBid: Number.isFinite(currentBid) ? currentBid : null,
        hasOffer: Number.isFinite(currentBid) && currentBid > 0,
        isNew: isNewExplicit ?? fallback.isNew ?? isNewComputed,
        isOpportunity: fallback.isOpportunity ?? false,
        priceDropped: fallback.priceDropped ?? false,
        endAt,
        image,
        gallery,
        detailUrl,
        createdAt,
        status,
        minIncrement,
        vehicleBrand,
        vehicleModel,
        vehicleModelDetail,
        vehicleYear: Number.isFinite(vehicleYear) && vehicleYear > 0 ? vehicleYear : null,
        vehicleKm: Number.isFinite(vehicleKm) && vehicleKm >= 0 ? vehicleKm : null,
        isFavorite,
        isAutoBidEnabled,
        autoBidMax: Number.isFinite(autoBidMax) ? autoBidMax : null,
    };
}
function buildAuctionDetailUrl(lotNo) {
    const value = String(lotNo || "").trim().toUpperCase();
    return value ? `/ilan/${encodeURIComponent(value)}` : "/auction.html";
}
function extractGalleryFromItem(item, fallbackImage) {
    const candidates = item?.gallery || item?.images || item?.gallery_json || [];
    let values = [];
    if (Array.isArray(candidates)) {
        values = candidates;
    }
    else if (typeof candidates === "string") {
        const text = String(candidates || "").trim();
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
        .map((entry) => String(entry || "").trim())
        .filter((entry) => entry.startsWith("data:image/") || /^https?:\/\//i.test(entry))
        .slice(0, 20);
    if (out.length < 1) {
        const fallback = String(item?.image_url || item?.imageUrl || fallbackImage || DEFAULT_LISTING_IMAGE).trim();
        if (fallback)
            out.push(fallback);
    }
    return out;
}
async function hydrateTurnstileConfig() {
    try {
        const data = await apiFetch("/api/config");
        const runtimeKey = String(data.turnstileSiteKey || "").trim();
        state.auth.requireEmailVerification = data.requireEmailVerification === true;
        state.turnstile.required = data.requireTurnstile === true;
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
    const applyFiltersAndRender = () => {
        readFiltersFromForm();
        render();
    };
    const applyFiltersAndRenderDebounced = debounce(applyFiltersAndRender, 220);
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
    elements.productGroup.addEventListener("change", () => {
        applyFiltersAndRender();
    });
    elements.category.addEventListener("change", () => {
        applyFiltersAndRender();
    });
    elements.vehicleBrand.addEventListener("change", () => {
        const previousModel = String(elements.vehicleModel.value || "").trim();
        refreshVehicleModelOptions(previousModel);
        applyFiltersAndRender();
    });
    elements.vehicleModel.addEventListener("change", () => {
        applyFiltersAndRender();
    });
    elements.city.addEventListener("change", () => {
        refreshDistrictOptions("");
        refreshNeighborhoodOptions("");
        applyFiltersAndRender();
    });
    elements.district.addEventListener("change", () => {
        const previousNeighborhood = String(elements.neighborhood.value || "").trim();
        refreshNeighborhoodOptions(previousNeighborhood);
        applyFiltersAndRender();
    });
    elements.neighborhood.addEventListener("change", () => {
        applyFiltersAndRender();
    });
    const debouncedFilterInputs = [elements.minPrice, elements.maxPrice, elements.lotNo];
    for (const inputElement of debouncedFilterInputs) {
        inputElement.addEventListener("input", () => {
            applyFiltersAndRenderDebounced();
        });
        inputElement.addEventListener("change", () => {
            applyFiltersAndRender();
        });
    }
    elements.searchBtn.addEventListener("click", (event) => {
        event.preventDefault();
        applyFiltersAndRender();
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
        openModal(elements.signInModal);
        closeModalElement(elements.registerModal);
        closeModalElement(elements.profileModal);
        closeModalElement(elements.myBidsModal);
        closeModalElement(elements.favoritesModal);
        elements.mainMenu.classList.remove("open");
    });
    elements.openRegisterModal.addEventListener("click", (event) => {
        event.preventDefault();
        if (state.auth.user)
            return;
        openModal(elements.registerModal);
        closeModalElement(elements.signInModal);
        closeModalElement(elements.profileModal);
        closeModalElement(elements.myBidsModal);
        closeModalElement(elements.favoritesModal);
        elements.mainMenu.classList.remove("open");
    });
    elements.openRegisterModalFromLogin.addEventListener("click", (event) => {
        event.preventDefault();
        if (state.auth.user)
            return;
        closeModalElement(elements.signInModal);
        openModal(elements.registerModal);
    });
    elements.openSignInModalFromRegister.addEventListener("click", (event) => {
        event.preventDefault();
        if (state.auth.user)
            return;
        closeModalElement(elements.registerModal);
        openModal(elements.signInModal);
    });
    elements.openProfileModal.addEventListener("click", async (event) => {
        event.preventDefault();
        if (!state.auth.user)
            return;
        closeModalElement(elements.myBidsModal);
        closeModalElement(elements.favoritesModal);
        await openProfileEditor();
        elements.mainMenu.classList.remove("open");
    });
    elements.openMyBidsModal.addEventListener("click", async (event) => {
        event.preventDefault();
        if (!state.auth.user)
            return;
        closeModalElement(elements.profileModal);
        closeModalElement(elements.favoritesModal);
        await openMyBidsModal();
        elements.mainMenu.classList.remove("open");
    });
    elements.openFavoritesModal.addEventListener("click", async (event) => {
        event.preventDefault();
        if (!state.auth.user)
            return;
        closeModalElement(elements.profileModal);
        closeModalElement(elements.myBidsModal);
        await openFavoritesModal();
        elements.mainMenu.classList.remove("open");
    });
    elements.closeSignInModal.addEventListener("click", (event) => {
        event.preventDefault();
        closeModalElement(elements.signInModal);
    });
    elements.closeRegisterModal.addEventListener("click", (event) => {
        event.preventDefault();
        closeModalElement(elements.registerModal);
    });
    elements.closeProfileModal.addEventListener("click", (event) => {
        event.preventDefault();
        closeModalElement(elements.profileModal);
    });
    elements.closeMyBidsModal.addEventListener("click", (event) => {
        event.preventDefault();
        closeModalElement(elements.myBidsModal);
    });
    elements.closeFavoritesModal.addEventListener("click", (event) => {
        event.preventDefault();
        closeModalElement(elements.favoritesModal);
    });
    elements.signInModal.addEventListener("click", (event) => {
        if (event.target === elements.signInModal) {
            closeModalElement(elements.signInModal);
        }
    });
    elements.registerModal.addEventListener("click", (event) => {
        if (event.target === elements.registerModal) {
            closeModalElement(elements.registerModal);
        }
    });
    elements.profileModal.addEventListener("click", (event) => {
        if (event.target === elements.profileModal) {
            closeModalElement(elements.profileModal);
        }
    });
    elements.myBidsModal.addEventListener("click", (event) => {
        if (event.target === elements.myBidsModal) {
            closeModalElement(elements.myBidsModal);
        }
    });
    elements.favoritesModal.addEventListener("click", (event) => {
        if (event.target === elements.favoritesModal) {
            closeModalElement(elements.favoritesModal);
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
    elements.profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await handleProfileSave();
    });
    elements.forgotPassBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        await handleForgotPassword();
    });
    elements.logoutBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        await handleLogout();
    });
    elements.favoritesRows.addEventListener("click", async (event) => {
        const button = event.target.closest("button[data-action='remove-favorite']");
        if (!button)
            return;
        const lotNo = String(button.dataset.lotNo || "").trim().toUpperCase();
        if (!lotNo)
            return;
        try {
            await removeFavorite(lotNo, true);
        }
        catch (error) {
            alert(error.message || "Favori silinemedi.");
        }
    });
    elements.myBidsRows.addEventListener("click", async (event) => {
        const trigger = event.target.closest("button[data-action]");
        if (!trigger)
            return;
        const action = String(trigger.dataset.action || "");
        const lotNo = normalizeLotNoKey(trigger.dataset.lotNo || "");
        if (!lotNo)
            return;
        try {
            if (action === "set-auto-bid") {
                await handleAutoBidConfig(trigger);
                await openMyBidsModal();
                return;
            }
            if (action === "disable-auto-bid") {
                await disableAutoBid(lotNo);
                await openMyBidsModal();
                return;
            }
            if (action === "retract-bid") {
                await retractBid(lotNo);
                await openMyBidsModal();
            }
        }
        catch (error) {
            alert(error.message || "Islem tamamlanamadi.");
        }
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
    if (state.auth.user) {
        await syncFavoriteFlagsFromServer();
    }
    else {
        state.favoriteLotNoSet = new Set();
        state.favorites = [];
    }
    updateAuthUi();
}
function updateAuthUi() {
    const user = state.auth.user;
    if (!user) {
        elements.authStatus.textContent = "Misafir";
        elements.openSignInModal.classList.remove("hide");
        elements.openRegisterModal.classList.remove("hide");
        elements.openMyBidsModal.classList.add("hide");
        elements.openFavoritesModal.classList.add("hide");
        elements.openProfileModal.classList.add("hide");
        elements.adminPanelLink.classList.add("hide");
        elements.logoutBtn.classList.add("hide");
        state.favoriteLotNoSet = new Set();
        for (const item of state.listings) {
            item.isFavorite = false;
        }
        return;
    }
    elements.authStatus.textContent = user.name || user.email || "Uye";
    elements.openSignInModal.classList.add("hide");
    elements.openRegisterModal.classList.add("hide");
    elements.openMyBidsModal.classList.remove("hide");
    elements.openFavoritesModal.classList.remove("hide");
    elements.openProfileModal.classList.remove("hide");
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
        const turnstileToken = await getTurnstileToken("login", state.turnstile.required);
        const data = await apiFetch("/api/auth/login", {
            method: "POST",
            body: { email, password, turnstileToken },
        });
        state.auth.user = data.user;
        await syncFavoriteFlagsFromServer();
        updateAuthUi();
        render();
        setHint(elements.loginFormHint, data.message || "Giriş başarılı.", "success");
        elements.loginForm.reset();
        resetTurnstile("login");
        closeAuthModals();
    }
    catch (error) {
        resetTurnstile("login");
        setHint(elements.loginFormHint, error.message, "error");
    }
}
async function handleRegister() {
    const name = elements.registerName.value.trim();
    const tcIdentityNo = elements.registerIdentityNo.value.trim();
    const phone = elements.registerPhone.value.trim();
    const address = elements.registerAddress.value.trim();
    const email = elements.registerEmail.value.trim();
    const password = elements.registerPassword.value;
    if (!name || !tcIdentityNo || !phone || !address || !email || !password) {
        setHint(elements.registerFormHint, "Isim Soyisim, TC kimlik no, telefon, adres, e-posta ve sifre zorunludur.", "error");
        return;
    }
    try {
        const turnstileToken = await getTurnstileToken("register", state.turnstile.required);
        const data = await apiFetch("/api/auth/register", {
            method: "POST",
            body: { name, tcIdentityNo, phone, address, email, password, turnstileToken },
        });
        await hydrateAuth();
        setHint(elements.registerFormHint, data.message || "Kayit basarili.", "success");
        if (data.debugVerifyToken) {
            setHint(elements.registerFormHint, `Kayit basarili. Dogrulama tokeni: ${data.debugVerifyToken}`, "success");
        }
        elements.registerForm.reset();
        resetTurnstile("register");
        closeAuthModals();
    }
    catch (error) {
        resetTurnstile("register");
        setHint(elements.registerFormHint, error.message, "error");
    }
}
async function openProfileEditor() {
    setHint(elements.profileFormHint, "Profil bilgileri yukleniyor...", "");
    openModal(elements.profileModal);
    try {
        const data = await apiFetch("/api/auth/profile");
        const profile = data.profile || {};
        elements.profileName.value = String(profile.name || state.auth.user?.name || "");
        elements.profileIdentityNo.value = String(profile.tcIdentityNo || "");
        elements.profilePhone.value = String(profile.phone || "");
        elements.profileAddress.value = String(profile.address || "");
        elements.profileEmail.value = String(profile.email || state.auth.user?.email || "");
        setHint(elements.profileFormHint, "", "");
    }
    catch (error) {
        setHint(elements.profileFormHint, error.message, "error");
    }
}
async function handleProfileSave() {
    const name = elements.profileName.value.trim();
    const tcIdentityNo = elements.profileIdentityNo.value.trim();
    const phone = elements.profilePhone.value.trim();
    const address = elements.profileAddress.value.trim();
    if (!name || !tcIdentityNo || !phone || !address) {
        setHint(elements.profileFormHint, "Isim Soyisim, TC kimlik no, telefon ve adres zorunludur.", "error");
        return;
    }
    try {
        const data = await apiFetch("/api/auth/profile", {
            method: "PUT",
            body: { name, tcIdentityNo, phone, address },
        });
        if (state.auth.user) {
            state.auth.user.name = String(data.profile?.name || name);
        }
        updateAuthUi();
        setHint(elements.profileFormHint, data.message || "Profiliniz guncellendi.", "success");
        closeModalElement(elements.profileModal);
    }
    catch (error) {
        setHint(elements.profileFormHint, error.message, "error");
    }
}
async function openMyBidsModal() {
    if (!state.auth.user)
        return;
    elements.myBidsSummary.textContent = "Teklifleriniz yukleniyor...";
    elements.myBidsRows.innerHTML = "";
    elements.myBidsEmpty.classList.add("hide");
    openModal(elements.myBidsModal);
    try {
        const data = await apiFetch("/api/auth/my-bids");
        state.myBids = Array.isArray(data.items) ? data.items : [];
        renderMyBidsModal();
    }
    catch (error) {
        elements.myBidsSummary.textContent = error.message || "Teklifleriniz yuklenemedi.";
        state.myBids = [];
        renderMyBidsModal();
    }
}
function renderMyBidsModal() {
    const rows = Array.isArray(state.myBids) ? state.myBids : [];
    const total = rows.length;
    const winCount = rows.filter((item) => item?.isWinner).length;
    const leadingCount = rows.filter((item) => item?.isLeading).length;
    elements.myBidsSummary.textContent = `Toplam ${formatOptionCount(total)} ihale. Kazanilan: ${formatOptionCount(winCount)}, Guncel lider olunan: ${formatOptionCount(leadingCount)}.`;
    if (rows.length < 1) {
        elements.myBidsRows.innerHTML = "";
        elements.myBidsEmpty.classList.remove("hide");
        return;
    }
    elements.myBidsEmpty.classList.add("hide");
    elements.myBidsRows.innerHTML = rows
        .map((row) => {
        const status = resolveMyBidStatus(row);
        const detailUrl = buildAuctionDetailUrl(row.lotNo);
        const myMaxBid = row.myMaxBid === null || row.myMaxBid === undefined ? "-" : `${formatMoneyWithoutCents(row.myMaxBid)} TL`;
        const currentBid = row.currentBid === null || row.currentBid === undefined ? "-" : `${formatMoneyWithoutCents(row.currentBid)} TL`;
        const autoText = row.autoBidEnabled && row.autoBidMax
            ? `Oto: ${formatMoneyWithoutCents(row.autoBidMax)} TL`
            : "Oto: Kapali";
        return `
        <tr>
          <td>
            <div class="userTableTitle">${escapeHtml(row.title || "-")}</div>
            <div class="userTableSub">No: ${escapeHtml(row.lotNo || "-")} | ${escapeHtml(row.city || "-")} | ${escapeHtml(autoText)}</div>
          </td>
          <td>${escapeHtml(myMaxBid)}</td>
          <td>${escapeHtml(currentBid)}</td>
          <td><span class="statusChip ${status.className}">${escapeHtml(status.label)}</span></td>
          <td>
            <div class="rowActionWrap">
              <button class="miniActionBtn" type="button" data-action="set-auto-bid" data-lot-no="${escapeHtml(row.lotNo || "")}" data-min-bid="${Number((row.currentBid ?? row.startPrice ?? 0) + Number(row.minIncrement || 0))}" data-auto-max="${Number(row.autoBidMax || 0)}">
                ${row.autoBidEnabled ? "Oto Teklif Guncelle" : "Oto Teklif Ac"}
              </button>
              ${row.autoBidEnabled
            ? `<button class="miniActionBtn warn" type="button" data-action="disable-auto-bid" data-lot-no="${escapeHtml(row.lotNo || "")}">Oto Teklif Kapat</button>`
            : ""}
              ${row.canRetract
            ? `<button class="miniActionBtn danger" type="button" data-action="retract-bid" data-lot-no="${escapeHtml(row.lotNo || "")}">Teklifi Geri Cek</button>`
            : ""}
              <a class="miniActionBtn" href="${escapeHtml(detailUrl)}">Ihaleye Git</a>
            </div>
          </td>
        </tr>
      `;
    })
        .join("");
}
function resolveMyBidStatus(row) {
    if (row?.isWinner)
        return { label: "Kazandiniz", className: "success" };
    if (row?.isLeading)
        return { label: "Guncel lider sizsiniz", className: "info" };
    if (row?.isEnded)
        return { label: "Kazanamadiniz", className: "danger" };
    const currentBid = Number(row?.currentBid || 0);
    const myMaxBid = Number(row?.myMaxBid || 0);
    if (currentBid > 0 && myMaxBid > 0 && currentBid > myMaxBid) {
        return { label: "Uzerinize cikildi", className: "warn" };
    }
    return { label: "Teklifiniz kayitli", className: "neutral" };
}
async function openFavoritesModal() {
    if (!state.auth.user)
        return;
    elements.favoritesRows.innerHTML = '<div class="panelHint">Favoriler yukleniyor...</div>';
    elements.favoritesEmpty.classList.add("hide");
    openModal(elements.favoritesModal);
    await refreshFavoritesList();
    renderFavoritesModal();
}
async function refreshFavoritesList() {
    if (!state.auth.user) {
        state.favorites = [];
        state.favoriteLotNoSet = new Set();
        return;
    }
    const data = await apiFetch("/api/auth/favorites");
    const items = Array.isArray(data.items) ? data.items : [];
    state.favorites = items;
    state.favoriteLotNoSet = new Set(items.map((item) => String(item?.lotNo || "").trim().toUpperCase()).filter((value) => !!value));
    for (const listing of state.listings) {
        const lotNoKey = normalizeLotNoKey(listing.lotNo);
        listing.isFavorite = state.favoriteLotNoSet.has(lotNoKey);
    }
}
async function syncFavoriteFlagsFromServer() {
    try {
        await refreshFavoritesList();
    }
    catch (error) {
        console.warn("Favori listesi yuklenemedi.", error);
        state.favorites = [];
        state.favoriteLotNoSet = new Set();
        for (const listing of state.listings) {
            listing.isFavorite = false;
        }
    }
}
function renderFavoritesModal() {
    const rows = Array.isArray(state.favorites) ? state.favorites : [];
    if (rows.length < 1) {
        elements.favoritesRows.innerHTML = "";
        elements.favoritesEmpty.classList.remove("hide");
        return;
    }
    elements.favoritesEmpty.classList.add("hide");
    elements.favoritesRows.innerHTML = rows
        .map((row) => {
        const detailUrl = buildAuctionDetailUrl(row.lotNo);
        const currentBid = row.currentBid === null || row.currentBid === undefined ? "-" : `${formatMoneyWithoutCents(row.currentBid)} TL`;
        return `
        <article class="favoriteItem">
          <a href="${escapeHtml(detailUrl)}" class="favoriteThumb">
            <img src="${escapeHtml(row.imageUrl || DEFAULT_LISTING_IMAGE)}" alt="${escapeHtml(row.title || "Ihale")}">
          </a>
          <div class="favoriteBody">
            <a href="${escapeHtml(detailUrl)}" class="favoriteTitle">${escapeHtml(row.title || "-")}</a>
            <div class="favoriteMeta">No: ${escapeHtml(row.lotNo || "-")} | ${escapeHtml(row.city || "-")}</div>
            <div class="favoriteMeta">${escapeHtml(row.productGroup || "-")} / ${escapeHtml(row.category || "-")}</div>
            <div class="favoritePriceLine">
              <span>Baslangic: ${escapeHtml(formatMoneyWithoutCents(row.startPrice || 0))} TL</span>
              <span>Guncel: ${escapeHtml(currentBid)}</span>
            </div>
          </div>
          <button class="miniActionBtn danger" type="button" data-action="remove-favorite" data-lot-no="${escapeHtml(row.lotNo || "")}">
            Favoriden Sil
          </button>
        </article>
      `;
    })
        .join("");
}
async function handleFavoriteToggle(button) {
    const lotNo = normalizeLotNoKey(button?.dataset?.lotNo || "");
    if (!lotNo)
        return;
    if (!state.auth.user) {
        setHint(elements.loginFormHint, "Favori eklemek icin giris yapmalisiniz.", "error");
        openModal(elements.signInModal);
        return;
    }
    const isActive = button.classList.contains("isActive");
    try {
        if (isActive) {
            await removeFavorite(lotNo);
            return;
        }
        await addFavorite(lotNo);
    }
    catch (error) {
        alert(error.message || "Favori islemi tamamlanamadi.");
    }
}
async function addFavorite(lotNo) {
    const key = normalizeLotNoKey(lotNo);
    if (!key)
        return;
    const data = await apiFetch("/api/auth/favorites", {
        method: "POST",
        body: { lotNo: key },
    });
    await refreshFavoritesList();
    render();
    if (elements.favoritesModal.classList.contains("open")) {
        renderFavoritesModal();
    }
    setHint(elements.loginFormHint, data.message || "Favorilere eklendi.", "success");
}
async function removeFavorite(lotNo, keepModalOpen = false) {
    const key = normalizeLotNoKey(lotNo);
    if (!key)
        return;
    const data = await apiFetch(`/api/auth/favorites/${encodeURIComponent(key)}`, { method: "DELETE" });
    await refreshFavoritesList();
    render();
    if (keepModalOpen || elements.favoritesModal.classList.contains("open")) {
        renderFavoritesModal();
    }
    setHint(elements.loginFormHint, data.message || "Favorilerden kaldirildi.", "success");
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
            message += `\n\nSifirlama tokeni:\n${data.debugResetToken}`;
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
    state.myBids = [];
    state.favorites = [];
    state.favoriteLotNoSet = new Set();
    for (const item of state.listings) {
        item.isFavorite = false;
    }
    closeAuthModals();
    closeModalElement(elements.profileModal);
    closeModalElement(elements.myBidsModal);
    closeModalElement(elements.favoritesModal);
    updateAuthUi();
    render();
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
        productGroup: ONLY_AUTOMOBILE_MODE ? AUTOMOBILE_PRODUCT_GROUP : elements.productGroup.value,
        category: elements.category.value,
        city: elements.city.value,
        district: "",
        neighborhood: "",
        vehicleBrand: elements.vehicleBrand.value,
        vehicleModel: elements.vehicleModel.value,
        minPrice: elements.minPrice.value,
        maxPrice: elements.maxPrice.value,
        lotNo: elements.lotNo.value.trim(),
    };
}
function clearFilters() {
    const categoryValues = state.filterOptions.categories;
    state.filters = {
        productGroup: ONLY_AUTOMOBILE_MODE ? AUTOMOBILE_PRODUCT_GROUP : "",
        category: "",
        city: "",
        district: "",
        neighborhood: "",
        vehicleBrand: "",
        vehicleModel: "",
        minPrice: "",
        maxPrice: "",
        lotNo: "",
    };
    elements.productGroup.value = ONLY_AUTOMOBILE_MODE ? AUTOMOBILE_PRODUCT_GROUP : "";
    refillSelect(elements.category, categoryValues, LABEL_ALL_CATEGORIES);
    elements.category.value = "";
    elements.city.value = "";
    elements.vehicleBrand.value = "";
    refreshVehicleModelOptions("");
    refreshDistrictOptions("");
    refreshNeighborhoodOptions("");
    elements.minPrice.value = "";
    elements.maxPrice.value = "";
    elements.lotNo.value = "";
}
function buildCountScopeFilters(filterKey) {
    const next = {
        productGroup: String(state.filters.productGroup || ""),
        category: String(state.filters.category || ""),
        city: String(state.filters.city || ""),
        district: "",
        neighborhood: "",
        vehicleBrand: String(state.filters.vehicleBrand || ""),
        vehicleModel: String(state.filters.vehicleModel || ""),
        minPrice: String(state.filters.minPrice || ""),
        maxPrice: String(state.filters.maxPrice || ""),
        lotNo: String(state.filters.lotNo || ""),
    };
    next[filterKey] = "";
    if (filterKey === "productGroup")
        next.category = "";
    if (filterKey === "city")
        next.district = "";
    if (filterKey === "vehicleBrand") {
        next.vehicleModel = "";
    }
    return next;
}
function getFilterOptionValue(item, filterKey) {
    if (filterKey === "productGroup")
        return String(item.productGroup || "").trim();
    if (filterKey === "category")
        return String(item.category || "").trim();
    if (filterKey === "city")
        return String(item.city || "").trim();
    if (filterKey === "district")
        return String(item.district || "").trim();
    if (filterKey === "neighborhood")
        return String(item.neighborhood || "").trim();
    if (filterKey === "vehicleBrand")
        return String(item.vehicleBrand || "").trim();
    if (filterKey === "vehicleModel")
        return String(item.vehicleModel || "").trim();
    return "";
}
function getFilterOptionCountMap(filterKey) {
    const scopedFilters = buildCountScopeFilters(filterKey);
    const scopedRows = applyFilters(state.listings.slice(), scopedFilters);
    const counts = new Map();
    for (const item of scopedRows) {
        const value = getFilterOptionValue(item, filterKey);
        if (!value)
            continue;
        const key = normalizeText(value);
        counts.set(key, Number(counts.get(key) || 0) + 1);
    }
    return counts;
}
function formatOptionCount(value) {
    return new Intl.NumberFormat("tr-TR").format(Number(value || 0));
}
function applyCountsToSelectOptions(selectElement, counts) {
    if (!selectElement)
        return;
    const options = Array.from(selectElement.options || []);
    for (const option of options) {
        const rawValue = String(option.value || "").trim();
        if (!rawValue)
            continue;
        const count = Number(counts.get(normalizeText(rawValue)) || 0);
        option.textContent = `${rawValue} (${formatOptionCount(count)})`;
    }
}
function updateFilterOptionCountLabels() {
    const countMaps = {
        productGroup: getFilterOptionCountMap("productGroup"),
        category: getFilterOptionCountMap("category"),
        city: getFilterOptionCountMap("city"),
        vehicleBrand: getFilterOptionCountMap("vehicleBrand"),
        vehicleModel: getFilterOptionCountMap("vehicleModel"),
    };
    applyCountsToSelectOptions(elements.productGroup, countMaps.productGroup);
    applyCountsToSelectOptions(elements.category, countMaps.category);
    applyCountsToSelectOptions(elements.city, countMaps.city);
    applyCountsToSelectOptions(elements.vehicleBrand, countMaps.vehicleBrand);
    applyCountsToSelectOptions(elements.vehicleModel, countMaps.vehicleModel);
}
function render() {
    const filtered = applyFilters(state.listings.slice());
    const sorted = applySort(filtered);
    updateFilterOptionCountLabels();
    elements.listingBoxes.innerHTML = sorted.map(renderCard).join("");
    if (sorted.length < 1) {
        const message = state.listingLoadError || "Seçiminize uygun ihale yok.";
        elements.emptyState.innerHTML = `<i class="fas fa-circle-info"></i> ${escapeHtml(message)}`;
    }
    elements.emptyState.classList.toggle("hide", sorted.length > 0);
    elements.listingBoxes.querySelectorAll(".bidBtn").forEach((button) => {
        button.addEventListener("click", async () => {
            await handleBid(button);
        });
    });
    elements.listingBoxes.querySelectorAll(".favoriteToggle").forEach((button) => {
        button.addEventListener("click", async (event) => {
            event.preventDefault();
            await handleFavoriteToggle(button);
        });
    });
    elements.listingBoxes.querySelectorAll(".autoBidBtn").forEach((button) => {
        button.addEventListener("click", async (event) => {
            event.preventDefault();
            await handleAutoBidConfig(button);
        });
    });
}
function shouldUseLocalFallback() {
    if (typeof window === "undefined")
        return false;
    const host = String(window.location.hostname || "").toLowerCase();
    if (localFallbackHosts.has(host))
        return true;
    const params = new URLSearchParams(window.location.search);
    return params.get("fallback") === "1";
}
function applyFilters(data, filters = state.filters) {
    const groupFilter = normalizeText(filters.productGroup);
    const categoryFilter = normalizeText(filters.category);
    const cityFilter = normalizeText(filters.city);
    const brandFilter = normalizeText(filters.vehicleBrand);
    const modelFilter = normalizeText(filters.vehicleModel);
    const lotNoFilter = normalizeText(filters.lotNo);
    return data.filter((item) => {
        if (!passesTabFilter(item, state.tab))
            return false;
        if (groupFilter && normalizeText(item.productGroup) !== groupFilter)
            return false;
        if (categoryFilter && normalizeText(item.category) !== categoryFilter)
            return false;
        if (cityFilter && normalizeText(item.city) !== cityFilter)
            return false;
        if (brandFilter && normalizeText(item.vehicleBrand) !== brandFilter)
            return false;
        if (modelFilter && normalizeText(item.vehicleModel) !== modelFilter)
            return false;
        const minPrice = Number(filters.minPrice || 0);
        const maxPrice = Number(filters.maxPrice || Number.POSITIVE_INFINITY);
        if (item.startPrice < minPrice || item.startPrice > maxPrice)
            return false;
        if (lotNoFilter && !normalizeText(item.lotNo).includes(lotNoFilter))
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
    const bidValue = item.lastBid ? `${formatMoneyWithoutCents(item.lastBid)} TL` : "-";
    const startPriceValue = `${formatMoneyWithoutCents(item.startPrice)} TL`;
    const minimumBid = (item.lastBid ?? item.startPrice) + Number(item.minIncrement || guessIncrement(item));
    const bidButtonText = isEnded ? "SONUCLANDI" : "TEKLIF VER";
    const bidButtonAttrs = isEnded ? 'disabled aria-disabled="true"' : "";
    const vehicleBits = [item.vehicleBrand, item.vehicleModel, item.vehicleYear ? String(item.vehicleYear) : "", item.vehicleKm ? `${item.vehicleKm} km` : ""]
        .filter(Boolean)
        .join(" • ");
    const vehicleDetailLine = [item.vehicleModelDetail].filter(Boolean).join(" • ");
    const vehicleHtml = vehicleBits || vehicleDetailLine
        ? `<div class="location"><i class="fas fa-car-side"></i> <span>${escapeHtml([vehicleBits, vehicleDetailLine].filter(Boolean).join(" | "))}</span></div>`
        : "";
    const favoriteActive = item.isFavorite === true;
    const favoriteIconClass = favoriteActive ? "fas fa-heart" : "far fa-heart";
    const favoriteButtonClass = favoriteActive ? "favoriteToggle isActive" : "favoriteToggle";
    const favoriteAriaLabel = favoriteActive ? "Favorilerden kaldir" : "Favorilere ekle";
    const autoBidText = item.isAutoBidEnabled
        ? `OTO TEKLIF (${formatMoneyWithoutCents(item.autoBidMax || 0)} TL)`
        : "OTO TEKLIF";
    const autoBidDisabledAttrs = isEnded ? 'disabled aria-disabled="true"' : "";
    return `
    <div class="box1 imgWrap">
      <div class="iContent">
        <div class="imgHead">
          <h3 class="reNo">No: <span>${escapeHtml(item.lotNo)}</span></h3>
          <button class="${favoriteButtonClass}" type="button" data-lot-no="${escapeHtml(item.lotNo)}" aria-label="${favoriteAriaLabel}">
            <i class="${favoriteIconClass}"></i>
          </button>
          <a href="${escapeHtml(item.detailUrl || buildAuctionDetailUrl(item.lotNo))}" class="mainImg">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}">
          </a>
        </div>
        <div class="reInfo">
          <a href="${escapeHtml(item.detailUrl || buildAuctionDetailUrl(item.lotNo))}" class="headline">
            <h1><span>${escapeHtml(item.title)} (${escapeHtml(item.lotNo)})</span></h1>
          </a>
          <div class="location"><i class="fas fa-map-marker-alt"></i> <span>${escapeHtml(item.city || "-")}</span></div>
          <h2 class="type"><i class="far fa-car"></i> <span>${escapeHtml(`${item.productGroup} / ${item.category}`)}</span></h2>
          ${vehicleHtml}
          <div class="counterWrap">
            <span class="cText">Kalan Süre</span>
            ${countdownHtml}
            ${item.hasOffer ? '<span class="offerAlarm"><i class="fas fa-bell"></i> Teklif Var</span>' : ""}
          </div>
        </div>
        <div class="addBid">
          <div class="adTopLine">
            <div class="tLine1">${startPriceValue}</div>
            <div class="tLine2">Başlangıç Bedeli</div>
          </div>
          <div class="adBottomLine">
            <button class="bidBtn" data-lot-no="${escapeHtml(item.lotNo)}" data-min-bid="${minimumBid}" ${bidButtonAttrs}>${bidButtonText}</button>
            <button class="autoBidBtn ${item.isAutoBidEnabled ? "active" : ""}" data-lot-no="${escapeHtml(item.lotNo)}" data-min-bid="${minimumBid}" data-auto-max="${Number(item.autoBidMax || 0)}" ${autoBidDisabledAttrs}>${autoBidText}</button>
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
        openModal(elements.signInModal);
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
                ? `${data.message}\n\nDogrulama tokeni:\n${data.debugVerifyToken}`
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
async function handleAutoBidConfig(button) {
    const lotNo = normalizeLotNoKey(button?.dataset?.lotNo || "");
    if (!lotNo)
        return;
    if (!state.auth.user) {
        setHint(elements.loginFormHint, "Otomatik teklif icin giris yapmalisiniz.", "error");
        openModal(elements.signInModal);
        return;
    }
    const minBid = Number(button?.dataset?.minBid || 0);
    const existingMax = Number(button?.dataset?.autoMax || 0);
    const defaultValue = Number.isFinite(existingMax) && existingMax > 0 ? String(existingMax) : String(minBid || 0);
    const amountInput = prompt(`${lotNo} icin otomatik teklif ust limitini girin (en az ${formatMoneyWithoutCents(minBid)} TL):`, defaultValue);
    if (!amountInput)
        return;
    const maxAmount = Number(String(amountInput).replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(maxAmount) || maxAmount <= 0) {
        alert("Gecerli bir ust limit girin.");
        return;
    }
    const data = await apiFetch("/api/auth/auto-bids", {
        method: "POST",
        body: { lotNo, maxAmount },
    });
    await loadListings();
    await syncFavoriteFlagsFromServer();
    render();
    setHint(elements.loginFormHint, data.message || "Otomatik teklif kaydedildi.", "success");
}
async function disableAutoBid(lotNo) {
    const key = normalizeLotNoKey(lotNo);
    if (!key)
        return;
    const data = await apiFetch(`/api/auth/auto-bids/${encodeURIComponent(key)}`, { method: "DELETE" });
    await loadListings();
    await syncFavoriteFlagsFromServer();
    render();
    setHint(elements.loginFormHint, data.message || "Otomatik teklif kapatildi.", "success");
}
async function retractBid(lotNo) {
    const key = normalizeLotNoKey(lotNo);
    if (!key)
        return;
    const confirmed = confirm(`${key} ihalesindeki son aktif teklifinizi geri cekmek istiyor musunuz?`);
    if (!confirmed)
        return;
    const data = await apiFetch("/api/bids/retract", {
        method: "POST",
        body: { lotNo: key },
    });
    await loadListings();
    await syncFavoriteFlagsFromServer();
    render();
    setHint(elements.loginFormHint, data.message || "Teklif geri cekildi.", "success");
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
function debounce(fn, waitMs = 200) {
    let timer = null;
    return (...args) => {
        if (timer !== null) {
            window.clearTimeout(timer);
        }
        timer = window.setTimeout(() => {
            timer = null;
            fn(...args);
        }, waitMs);
    };
}
function uniqueTextList(values) {
    const out = [];
    const seen = new Set();
    for (const raw of values || []) {
        const value = String(raw || "").trim();
        if (!value)
            continue;
        const key = normalizeText(value);
        if (seen.has(key))
            continue;
        seen.add(key);
        out.push(value);
    }
    return out;
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
function formatMoneyWithoutCents(value) {
    return new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
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
function openModal(modalElement) {
    if (!modalElement)
        return;
    modalElement.classList.add("open");
    modalElement.setAttribute("aria-hidden", "false");
}
function closeModalElement(modalElement) {
    if (!modalElement)
        return;
    modalElement.classList.remove("open");
    modalElement.setAttribute("aria-hidden", "true");
}
function closeAuthModals() {
    closeModalElement(elements.signInModal);
    closeModalElement(elements.registerModal);
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
