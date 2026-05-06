// @ts-nocheck
interface TurnstileApi {
  render: (...args: any[]) => any;
  reset: (...args: any[]) => void;
}

interface Window {
  turnstile?: TurnstileApi;
}

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
] as const;
const LABEL_PRODUCT_GROUP = "Ürün Grubu Seçiniz";
const LABEL_ALL_CATEGORIES = "Tüm Kategoriler";
const LABEL_ALL_CITIES = "Tüm İller";
const LABEL_ALL_DISTRICTS = "Tüm İlçeler";
const LABEL_ALL_NEIGHBORHOODS = "Tüm Mahalleler";
const LABEL_ALL_BRANDS = "Tüm Markalar";
const LABEL_ALL_MODELS = "Tüm Modeller";
const VEHICLE_BRAND_MODEL_CATALOG: Record<string, string[]> = {
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

const DEFAULT_LISTING_IMAGE =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80";
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
  const previousDistrict = String(state.filters.district || elements.district.value || "").trim();
  const previousNeighborhood = String(state.filters.neighborhood || elements.neighborhood.value || "").trim();
  const previousBrand = String(state.filters.vehicleBrand || elements.vehicleBrand.value || "").trim();
  const previousModel = String(state.filters.vehicleModel || elements.vehicleModel.value || "").trim();

  if (ONLY_AUTOMOBILE_MODE) {
    refillSelect(elements.productGroup, [AUTOMOBILE_PRODUCT_GROUP], LABEL_PRODUCT_GROUP);
    elements.productGroup.value = AUTOMOBILE_PRODUCT_GROUP;
  } else {
    refillSelect(elements.productGroup, state.filterOptions.productGroups, LABEL_PRODUCT_GROUP);
    if (previousGroup) {
      const matchedGroup = findMatchingOptionValue(state.filterOptions.productGroups, previousGroup);
      if (matchedGroup) elements.productGroup.value = matchedGroup;
    }
  }

  const categoryValues = state.filterOptions.categories;
  refillSelect(elements.category, categoryValues, LABEL_ALL_CATEGORIES);
  const matchedCategory = findMatchingOptionValue(categoryValues, previousCategory);
  elements.category.value = matchedCategory || "";

  refillSelect(elements.city, state.filterOptions.cities, LABEL_ALL_CITIES);
  const matchedCity = findMatchingOptionValue(state.filterOptions.cities, previousCity);
  elements.city.value = matchedCity || "";

  refreshDistrictOptions(previousDistrict);
  refreshNeighborhoodOptions(previousNeighborhood);

  const brandValues = state.filterOptions.vehicleBrands || [];
  refillSelect(elements.vehicleBrand, brandValues, LABEL_ALL_BRANDS);
  const matchedBrand = findMatchingOptionValue(brandValues, previousBrand);
  elements.vehicleBrand.value = matchedBrand || "";
  refreshVehicleModelOptions(previousModel);
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
  if (!city) return [];

  const map = state.filterOptions.districtsByCity || {};
  const direct = map[city];
  if (Array.isArray(direct)) {
    return uniqueTextList(direct);
  }

  const cityKey = normalizeText(city);
  for (const [candidateCity, districts] of Object.entries(map)) {
    if (normalizeText(candidateCity) !== cityKey) continue;
    return uniqueTextList(Array.isArray(districts) ? districts : []);
  }

  return uniqueTextList(
    state.listings
      .filter((item) => normalizeText(item.city) === cityKey)
      .map((item) => String(item.district || "").trim())
  );
}

function getNeighborhoodOptions(cityValue, districtValue) {
  const city = String(cityValue || "").trim();
  if (!city) return [];

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
  if (!brand) return [];

  const map = state.filterOptions.vehicleModelsByBrand || {};
  const direct = map[brand];
  if (Array.isArray(direct)) return uniqueTextList(direct);

  const brandKey = normalizeText(brand);
  for (const [candidateBrand, models] of Object.entries(map)) {
    if (normalizeText(candidateBrand) !== brandKey) continue;
    return uniqueTextList(Array.isArray(models) ? models : []);
  }

  return uniqueTextList(
    state.listings
      .filter((item) => normalizeText(item.vehicleBrand) === brandKey)
      .map((item) => String(item.vehicleModel || "").trim())
  );
}

function buildVehicleFilterOptions() {
  const normalizedCatalog = {};

  for (const [brandRaw, modelsRaw] of Object.entries(VEHICLE_BRAND_MODEL_CATALOG)) {
    const brand = String(brandRaw || "").trim();
    if (!brand) continue;
    normalizedCatalog[brand] = uniqueTextList(Array.isArray(modelsRaw) ? modelsRaw : []);
  }

  for (const item of state.listings || []) {
    const brand = String(item?.vehicleBrand || "").trim();
    const model = String(item?.vehicleModel || "").trim();
    if (!brand) continue;
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
  if (!target) return "";
  if (values.includes(target)) return target;
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
  } catch (error) {
    apiFailed = true;
    console.warn("Auction API fetch failed.", error);
    state.listings = [];
  }

  if (state.listings.length < 1 && apiFailed && shouldUseLocalFallback()) {
    state.listings = enforceListingScope(
      fallbackListings.map((item) => ({
        ...item,
        minIncrement: guessIncrement(item),
        status: "ACTIVE",
      }))
    );
    return;
  }

  if (state.listings.length < 1 && apiFailed) {
    state.listingLoadError =
      `Ihale verisi sunucudan alinamadi. Dogru adresi acin: ${PRIMARY_APP_ORIGIN}`;
  }
}

function enforceListingScope(rows) {
  if (!ONLY_AUTOMOBILE_MODE) return rows;
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
  } catch (error) {
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
  const districtsFromMap = uniqueTextList(
    Object.values(districtsByCity).flatMap((value: any) => (Array.isArray(value) ? value : []))
  );
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
  const districts = uniqueTextList(
    Object.values(districtsByCity).flatMap((value: any) => (Array.isArray(value) ? value : []))
  );
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
    if (!city) continue;
    out[city] = uniqueTextList(Array.isArray(districtsRaw) ? districtsRaw : []);
  }

  for (const cityRaw of cities || []) {
    const city = String(cityRaw || "").trim();
    if (!city) continue;
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
    if (!city) continue;
    out[city] = [];
  }

  for (const item of state.listings || []) {
    const city = String(item?.city || "").trim();
    const district = String(item?.district || "").trim();
    if (!city) continue;
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
  const hasVehicleFields =
    String(item?.vehicleBrand || "").trim().length > 0 || String(item?.vehicleModel || "").trim().length > 0;

  const vehicleGroup =
    group.includes("vasita") ||
    group.includes("arac") ||
    group.includes("otomotiv") ||
    group.includes("otomobil");
  const vehicleCategory =
    category.includes("otomobil") ||
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
    isNew: fallback.isNew ?? false,
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
  } else if (typeof candidates === "string") {
    const text = String(candidates || "").trim();
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
    .map((entry) => String(entry || "").trim())
    .filter((entry) => entry.startsWith("data:image/") || /^https?:\/\//i.test(entry))
    .slice(0, 20);

  if (out.length < 1) {
    const fallback = String(item?.image_url || item?.imageUrl || fallbackImage || DEFAULT_LISTING_IMAGE).trim();
    if (fallback) out.push(fallback);
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
  } catch {
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
    if (!link) return;
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
    const previousDistrict = String(elements.district.value || "").trim();
    const previousNeighborhood = String(elements.neighborhood.value || "").trim();
    refreshDistrictOptions(previousDistrict);
    refreshNeighborhoodOptions(previousNeighborhood);
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
    if (state.auth.user) return;
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
    } else {
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
  } catch {
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
    const turnstileToken = await getTurnstileToken("login", state.turnstile.required);
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
  } catch (error) {
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
    const turnstileToken = await getTurnstileToken("register", state.turnstile.required);
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: { name, email, password, turnstileToken },
    });

    await hydrateAuth();
    setHint(elements.registerFormHint, data.message || "Kayıt başarılı.", "success");
    if (data.debugVerifyToken) {
      setHint(
        elements.registerFormHint,
        `Kayıt başarılı. Doğrulama tokeni: ${data.debugVerifyToken}`,
        "success"
      );
    }
    elements.registerForm.reset();
    resetTurnstile("register");
  } catch (error) {
    resetTurnstile("register");
    setHint(elements.registerFormHint, error.message, "error");
  }
}

async function handleForgotPassword() {
  const fallback = elements.loginIdentity.value.trim();
  const email = prompt("Şifre sıfırlama bağlantısı için e-posta adresinizi girin:", fallback);
  if (!email) return;

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
  } catch (error) {
    setHint(elements.loginFormHint, error.message, "error");
  }
}

async function handleLogout() {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch {
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
    } catch (error) {
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
      } catch (error) {
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
    district: elements.district.value,
    neighborhood: elements.neighborhood.value,
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

function render() {
  const filtered = applyFilters(state.listings.slice());
  const sorted = applySort(filtered);

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
}

function shouldUseLocalFallback() {
  if (typeof window === "undefined") return false;
  const host = String(window.location.hostname || "").toLowerCase();
  if (localFallbackHosts.has(host)) return true;
  const params = new URLSearchParams(window.location.search);
  return params.get("fallback") === "1";
}

function applyFilters(data) {
  const groupFilter = normalizeText(state.filters.productGroup);
  const categoryFilter = normalizeText(state.filters.category);
  const cityFilter = normalizeText(state.filters.city);
  const districtFilter = normalizeText(state.filters.district);
  const neighborhoodFilter = normalizeText(state.filters.neighborhood);
  const brandFilter = normalizeText(state.filters.vehicleBrand);
  const modelFilter = normalizeText(state.filters.vehicleModel);
  const lotNoFilter = normalizeText(state.filters.lotNo);

  return data.filter((item) => {
    if (!passesTabFilter(item, state.tab)) return false;
    if (groupFilter && normalizeText(item.productGroup) !== groupFilter) return false;
    if (categoryFilter && normalizeText(item.category) !== categoryFilter) return false;
    if (cityFilter && normalizeText(item.city) !== cityFilter) return false;
    if (districtFilter && normalizeText(item.district) !== districtFilter) return false;
    if (neighborhoodFilter && normalizeText(item.neighborhood) !== neighborhoodFilter) return false;
    if (brandFilter && normalizeText(item.vehicleBrand) !== brandFilter) return false;
    if (modelFilter && normalizeText(item.vehicleModel) !== modelFilter) return false;

    const minPrice = Number(state.filters.minPrice || 0);
    const maxPrice = Number(state.filters.maxPrice || Number.POSITIVE_INFINITY);
    if (item.startPrice < minPrice || item.startPrice > maxPrice) return false;

    if (lotNoFilter && !normalizeText(item.lotNo).includes(lotNoFilter)) return false;
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
  const bidValue = item.lastBid ? formatMoneyWithoutCents(item.lastBid) : "-";
  const minimumBid = (item.lastBid ?? item.startPrice) + Number(item.minIncrement || guessIncrement(item));
  const bidButtonText = isEnded ? "SONUCLANDI" : "TEKLIF VER";
  const bidButtonAttrs = isEnded ? 'disabled aria-disabled="true"' : "";
  const vehicleBits = [item.vehicleBrand, item.vehicleModel, item.vehicleYear ? String(item.vehicleYear) : "", item.vehicleKm ? `${item.vehicleKm} km` : ""]
    .filter(Boolean)
    .join(" • ");
  const vehicleDetailLine = [item.vehicleModelDetail].filter(Boolean).join(" • ");
  const vehicleHtml =
    vehicleBits || vehicleDetailLine
      ? `<div class="location"><i class="fas fa-car-side"></i> <span>${escapeHtml(
          [vehicleBits, vehicleDetailLine].filter(Boolean).join(" | ")
        )}</span></div>`
      : "";

  return `
    <div class="box1 imgWrap">
      <div class="iContent">
        <div class="imgHead">
          <h3 class="reNo">No: <span>${escapeHtml(item.lotNo)}</span></h3>
          <a href="${escapeHtml(item.detailUrl || buildAuctionDetailUrl(item.lotNo))}" class="mainImg">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}">
          </a>
        </div>
        <div class="reInfo">
          <a href="${escapeHtml(item.detailUrl || buildAuctionDetailUrl(item.lotNo))}" class="headline">
            <h1><span>${escapeHtml(item.title)} (${escapeHtml(item.lotNo)})</span></h1>
          </a>
          <div class="location"><i class="fas fa-map-marker-alt"></i> <span>${escapeHtml(
            `${item.city} / ${item.district} / ${item.neighborhood}`
          )}</span></div>
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
            <div class="tLine1">${formatMoneyWithoutCents(item.startPrice)}</div>
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
        ? `${data.message}\n\nDogrulama tokeni:\n${data.debugVerifyToken}`
        : data.message;
      alert(message);
    } catch (error) {
      alert(error.message);
    }
    return;
  }

  const lotNo = button.dataset.lotNo;
  const minBid = Number(button.dataset.minBid || 0);
  const amountInput = prompt(`İhale ${lotNo} için teklif tutarı girin (min ${formatMoney(minBid)}):`, String(minBid));
  if (!amountInput) return;

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
  } catch (error) {
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
      if (anchor) wrapper.insertBefore(endText, anchor);
      else wrapper.appendChild(endText);
      return;
    }

    const parts = timer.querySelectorAll("li span:first-child");
    if (parts.length !== 4) return;
    parts[0].textContent = remaining.days;
    parts[1].textContent = remaining.hours;
    parts[2].textContent = remaining.minutes;
    parts[3].textContent = remaining.seconds;
  });
}

function debounce(fn, waitMs = 200) {
  let timer: number | null = null;
  return (...args: any[]) => {
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
    if (!value) continue;
    const key = normalizeText(value);
    if (seen.has(key)) continue;
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

function closeModal() {
  elements.signInModal.classList.remove("open");
  elements.signInModal.setAttribute("aria-hidden", "true");
}

function setHint(target, text, type) {
  target.textContent = text || "";
  target.classList.remove("error", "success");
  if (type) target.classList.add(type);
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
  if (item.startPrice >= 3000000) return 10000;
  if (item.startPrice >= 1000000) return 5000;
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
  } catch {
    data = {};
  }

  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `İstek başarısız (${response.status})`);
  }

  return data;
}


async function initTurnstile() {
  const siteKey = String(state.turnstile.siteKey || "").trim();
  if (!siteKey) return;
  if (!elements.loginTurnstile || !elements.registerTurnstile) return;

  const turnstile = await waitForTurnstile(6000);
  if (!turnstile) return;

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
    if (state.turnstile.loginToken) return state.turnstile.loginToken;
    if (required) throw new Error("Lütfen giriş doğrulamasını tamamlayın.");
    return "";
  }

  if (kind === "register") {
    if (state.turnstile.registerToken) return state.turnstile.registerToken;
    if (required) throw new Error("Lütfen kayıt doğrulamasını tamamlayın.");
    return "";
  }

  return "";
}

function resetTurnstile(kind) {
  if (!state.turnstile.enabled || !window.turnstile) return;

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



