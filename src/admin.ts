const API_BASE = "";
const ROLE_MEMBER = "member";
const ROLE_MANAGER = "manager";
const ROLE_ADMIN = "admin";
const MAX_AUCTION_IMAGE_DIMENSION = 1600;
const MAX_AUCTION_IMAGE_BYTES = 300 * 1024;
const MAX_AUCTION_IMAGE_COUNT = 20;
const MAX_AUCTION_FILE_BYTES = 2 * 1024 * 1024;
const MAX_AUCTION_FILE_COUNT = 15;
const MAX_AUCTION_GALLERY_TOTAL_BYTES = 2_400_000;
const MAX_AUCTION_REPORT_TOTAL_BYTES = 3_200_000;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);
const ALLOWED_REPORT_FILE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
]);
const VEHICLE_CONDITION_STATUS_KEYS = ["ORIGINAL", "LOCAL_PAINTED", "PAINTED", "CHANGED"] as const;
const VEHICLE_CONDITION_DEFAULT_STATUS = "ORIGINAL" as const;
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
] as const;
const VEHICLE_CONDITION_PART_PATHS: Record<string, string> = {
  on_tampon: "M 178.0 111.0 L 178.0 129.2 L 180.9 130.0 L 295.0 130.0 L 295.0 108.5 L 293.1 107.7 L 293.1 106.0 L 183.7 106.0 L 183.7 107.7 L 179.9 111.0 Z",
  kaput: "M 188.6 154.7 L 186.7 160.6 L 181.9 229.0 L 189.6 229.0 L 207.8 223.1 L 229.8 220.2 L 260.5 221.2 L 281.7 225.1 L 292.2 229.0 L 297.0 229.0 L 297.0 180.1 L 296.0 179.1 L 295.1 158.6 L 291.2 151.8 L 281.7 147.9 L 264.4 144.9 L 263.4 142.0 L 222.2 142.0 L 221.2 144.9 L 199.1 148.8 L 191.5 151.8 Z",
  tavan: "M 188 314 L 269 314 L 269 373 L 188 373 Z",
  bagaj: "M 178 447 L 178 457 L 182 459 L 184 459 L 188 461 L 191 461 L 192 462 L 196 462 L 197 463 L 201 463 L 202 464 L 208 464 L 209 465 L 216 465 L 217 466 L 253 466 L 254 465 L 262 465 L 263 464 L 269 464 L 270 463 L 279 462 L 280 461 L 287 460 L 294 457 L 294 447 L 293 446 L 292 440 L 291 439 L 284 440 L 280 442 L 276 442 L 275 443 L 266 444 L 265 445 L 251 446 L 250 447 L 221 447 L 220 446 L 212 446 L 211 445 L 200 444 L 199 443 L 188 441 L 184 439 L 181 439 L 180 440 L 180 443 Z",
  arka_tampon: "M 180.0 488.8 L 180.0 506.4 L 183.7 508.0 L 295.0 508.0 L 295.0 487.2 L 292.2 485.6 L 292.2 484.0 L 186.5 484.0 L 185.6 486.4 Z",
  sol_on_camurluk: "M 90.5 145.0 L 89.6 148.8 L 86.0 148.8 L 86.0 172.8 L 96.0 173.7 L 103.2 176.6 L 115.0 190.0 L 115.0 152.7 L 107.8 150.7 L 105.9 148.8 L 105.9 145.0 Z",
  sol_on_kapi: "M 116.3 210 L 111.4 220.7 L 103.6 228.5 L 96.8 231.4 L 86 233.4 L 86 305.5 L 173 323 L 173 311.3 L 171 300.6 L 159.3 265.5 L 150.5 248 L 138.8 230.5 L 122.2 211.9 Z M 133.9 234.4 L 146.6 252.9 L 157.4 273.3 L 166.2 298.6 L 169.1 314.2 L 168.1 317.2 L 135.9 310.3 L 132.9 308.4 Z",
  sol_arka_kapi: "M 86 313 L 86 374.6 L 98.7 377.6 L 105.5 381.5 L 112.4 389.3 L 116.3 399.1 L 116.3 403 L 123.1 403 L 172 382.5 L 172 329.6 L 88 312 Z M 168.1 332.5 L 170 334.5 L 170 377.6 L 168.1 379.5 L 133.9 392.2 L 131.9 390.3 L 131.9 328.6 L 135.8 326.7 Z",
  sol_arka_camurluk: "M 115.0 419.0 L 115.0 421.8 L 112.3 426.4 L 104.1 434.7 L 95.1 439.3 L 86.0 440.2 L 86.0 463.3 L 90.5 463.3 L 93.2 467.0 L 106.8 467.0 L 110.5 463.3 L 115.0 463.3 Z",
  sag_on_camurluk: "M 386.0 145.0 L 371.0 145.0 L 370.0 151.0 L 356.0 155.0 L 356.0 193.0 L 361.0 193.0 L 365.0 186.0 L 374.0 178.0 L 378.0 176.0 L 386.0 175.0 Z",
  sag_on_kapi: "M 357.7 210 L 353.8 211 L 338.1 227.5 L 328.3 241.2 L 318.6 258.7 L 304.9 295.7 L 300 320.1 L 301 324 L 324.4 318.2 L 386 306.5 L 386 233.4 L 378.2 232.4 L 368.4 227.5 L 361.6 219.7 Z M 341 233.4 L 342 309.4 L 339.1 311.3 L 305.9 318.2 L 304.9 314.3 L 306.8 303.5 L 317.6 271.4 L 326.4 254.8 Z",
  sag_arka_kapi: "M 386 313 L 364.5 315.9 L 350.8 319.8 L 300 329.6 L 300 381.5 L 345.9 401.1 L 357.7 404 L 357.7 399.1 L 363.5 386.4 L 375.2 377.6 L 386 375.6 Z M 305.9 332.6 L 338.1 326.7 L 342 327.7 L 341 392.3 L 308.8 380.5 L 304.9 377.6 Z",
  sag_arka_camurluk: "M 359.7 419.0 L 359.7 420.9 L 357.0 421.8 L 357.0 462.3 L 366.1 463.2 L 370.6 467.0 L 383.3 467.0 L 386.0 463.2 L 386.0 439.7 L 378.8 437.8 L 372.4 434.1 Z",
};
const VEHICLE_CONDITION_TEXT_POSITIONS: Record<string, [number, number]> = {
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
const VEHICLE_CONDITION_LAYOUT_MAX_STEP = 20;
const VEHICLE_CONDITION_SCALE_MIN = 0.7;
const VEHICLE_CONDITION_SCALE_MAX = 1.7;
const VEHICLE_CONDITION_SCALE_DEFAULT = 1;
const VEHICLE_CONDITION_SCALE_CENTER: [number, number] = [236, 304];
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
] as const;
const VEHICLE_EXPERTISE_MECHANICAL_FIELDS = [
  { key: "motor_alt_ust_yag_kacagi", label: "Motor Alt/Üst Yağ Kaçağı" },
  { key: "sanziman", label: "Şanzıman" },
  { key: "turbo", label: "Turbo" },
  { key: "radyator", label: "Radyatör" },
  { key: "intercooler", label: "Intercooler" },
  { key: "on_arka_takim", label: "Ön ve Arka Takım" },
] as const;
const VEHICLE_EXPERTISE_STRUCTURE_DEFAULT_STATUS = "ORIGINAL" as const;
const VEHICLE_EXPERTISE_MECHANICAL_DEFAULT_STATUS = "NORMAL" as const;
const VEHICLE_EXPERTISE_TIRE_DEFAULT_STATUS = "IYI" as const;
const VEHICLE_BRAND_MODEL_CATALOG: Record<string, string[]> = {
  "Alfa Romeo": ["159", "Giulia", "Giulietta", "Stelvio", "Tonale"],
  Audi: ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "E-Tron"],
  BMW: ["1 Serisi", "2 Serisi", "3 Serisi", "4 Serisi", "5 Serisi", "7 Serisi", "X1", "X2", "X3", "X4", "X5", "X6", "I4", "IX"],
  BYD: ["Atto 3", "Dolphin", "Han", "Seal", "Seal U"],
  Chery: ["Omoda 5", "Tiggo 7 Pro", "Tiggo 8 Pro"],
  Citroen: ["Berlingo", "C3", "C4", "C4 X", "C5 Aircross", "C-Elysee", "Jumpy"],
  Cupra: ["Ateca", "Born", "Formentor", "Leon"],
  Dacia: ["Duster", "Jogger", "Lodgy", "Logan", "Sandero", "Spring"],
  DS: ["DS 4", "DS 7", "DS 9"],
  Fiat: ["500", "500e", "Doblo", "Egea", "Fiorino", "Linea", "Panda", "Punto"],
  Ford: ["B-Max", "C-Max", "Courier", "EcoSport", "Fiesta", "Focus", "Fusion", "Kuga", "Mondeo", "Mustang", "Puma", "Ranger", "S-Max", "Tourneo", "Transit"],
  Honda: ["Accord", "Civic", "City", "CR-V", "HR-V", "Jazz"],
  Hyundai: ["Accent", "Accent Blue", "Bayon", "Elantra", "Getz", "I10", "I20", "I30", "Ioniq", "Kona", "Santa Fe", "Staria", "Tucson"],
  Isuzu: ["D-Max"],
  Jaguar: ["E-Pace", "F-Pace", "I-Pace", "XE", "XF"],
  Jeep: ["Avenger", "Cherokee", "Compass", "Renegade", "Wrangler"],
  Kia: ["Ceed", "Cerato", "EV6", "Niro", "Picanto", "Rio", "Sorento", "Sportage", "Stonic"],
  "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Velar"],
  Lexus: ["ES", "IS", "NX", "RX", "UX"],
  Maserati: ["Ghibli", "Grecale", "Levante", "Quattroporte"],
  Mazda: ["2", "3", "6", "CX-3", "CX-30", "CX-5", "CX-60", "MX-5"],
  "Mercedes-Benz": ["A Serisi", "B Serisi", "C Serisi", "CLA", "CLS", "E Serisi", "G Serisi", "GLA", "GLB", "GLC", "GLE", "GLS", "S Serisi", "Vito"],
  MG: ["HS", "MG4", "Marvel R", "ZS", "ZS EV"],
  Mini: ["Clubman", "Countryman", "Cooper", "Cooper S"],
  Mitsubishi: ["ASX", "Colt", "Eclipse Cross", "L200", "L300", "Outlander", "Pajero"],
  Nissan: ["Juke", "Leaf", "Micra", "Navara", "Note", "Qashqai", "X-Trail"],
  Opel: ["Astra", "Combo", "Corsa", "Crossland", "Frontera", "Grandland", "Insignia", "Mokka", "Vivaro", "Zafira"],
  Peugeot: ["2008", "3008", "301", "308", "408", "5008", "508", "Partner", "Rifter"],
  Porsche: ["911", "Cayenne", "Macan", "Panamera", "Taycan"],
  Renault: ["Captur", "Clio", "Fluence", "Kadjar", "Kangoo", "Koleos", "Laguna", "Megane", "Scenic", "Symbol", "Talisman", "Toros", "Trafic", "Twingo", "Zoe"],
  Seat: ["Arona", "Ateca", "Ibiza", "Leon", "Tarraco", "Toledo"],
  Skoda: ["Fabia", "Kamiq", "Karoq", "Kodiaq", "Octavia", "Rapid", "Scala", "Superb", "Yeti"],
  Smart: ["Forfour", "Fortwo"],
  Subaru: ["Forester", "Impreza", "Legacy", "Outback", "XV"],
  Suzuki: ["Baleno", "Grand Vitara", "Ignis", "Jimny", "S-Cross", "Swift", "Vitara"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y"],
  Tofas: ["Dogan", "Kartal", "Murat", "Sahin", "Serce"],
  Togg: ["T10F", "T10X"],
  Toyota: ["Auris", "Avensis", "C-HR", "Camry", "Corolla", "Corolla Cross", "Hilux", "Prius", "RAV4", "Yaris", "Yaris Cross"],
  Volkswagen: ["Amarok", "Arteon", "Caddy", "Caravelle", "Golf", "ID.3", "ID.4", "Jetta", "Passat", "Polo", "T-Cross", "T-Roc", "Tiguan", "Touareg", "Transporter"],
  Volvo: ["C40", "S60", "S90", "V40", "V60", "XC40", "XC60", "XC90"],
};

const defaultPermissionDefs = [
  { key: "admin.panel.access", label: "Admin panel erisimi" },
  { key: "bids.place", label: "Teklif verebilir" },
  { key: "users.view", label: "Kullanicilari goruntuleyebilir" },
  { key: "users.block", label: "Kullaniciyi pasife alabilir" },
  { key: "users.permissions", label: "Rol/yetki duzenleyebilir" },
  { key: "users.sessions.revoke", label: "Oturum sonlandirabilir" },
  { key: "auctions.create", label: "Ihale olusturabilir" },
  { key: "auctions.edit", label: "Ihale duzenleyebilir" },
  { key: "auctions.close", label: "Ihale kapatabilir" },
  { key: "reports.view", label: "Raporlari goruntuleyebilir" },
  { key: "data.export", label: "Veri disa aktarabilir" },
  { key: "settings.manage", label: "Sistem ayari yonetebilir" },
];

const state: any = {
  activeTab: "users",
  currentUser: null,
  users: [],
  selectedUserId: "",
  groups: [],
  categories: [],
  auctions: [],
  auctionImageDataUrls: [],
  auctionExpertiseFiles: [],
  auctionDocumentFiles: [],
  auctionVehicleConditionMap: {},
  auctionVehicleConditionSelectedStatus: VEHICLE_CONDITION_DEFAULT_STATUS,
  auctionVehicleConditionLayout: createDefaultVehicleConditionLayout(),
  auctionVehicleConditionScale: VEHICLE_CONDITION_SCALE_DEFAULT,
  auctionVehicleConditionSelectedPart: VEHICLE_CONDITION_PARTS[0]?.key || "",
  auctionVehicleConditionStep: 2,
  auctionVehicleConditionLayoutSaveTimer: null as any,
  auctionVehicleConditionLayoutSaving: false,
  permissionDefs: defaultPermissionDefs,
  filterOrdering: {
    order: {
      productGroups: [],
      categories: [],
      cities: [],
      districts: [],
      neighborhoods: [],
    },
    options: {
      productGroups: [],
      categories: [],
      cities: [],
      districts: [],
      neighborhoods: [],
      districtsByCity: {},
    },
  },
  query: "",
  catalogQuery: "",
  auctionQuery: "",
};

type UploadedFileEntry = {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
};

type VehicleConditionStatusKey = (typeof VEHICLE_CONDITION_STATUS_KEYS)[number];
type VehicleConditionPartKey = (typeof VEHICLE_CONDITION_PARTS)[number]["key"];
type VehicleConditionMap = Record<string, VehicleConditionStatusKey>;
type VehicleConditionOffset = { x: number; y: number };
type VehicleConditionLayout = Record<VehicleConditionPartKey, VehicleConditionOffset>;
type VehicleExpertiseStructureKey = (typeof VEHICLE_EXPERTISE_STRUCTURE_FIELDS)[number]["key"];
type VehicleExpertiseMechanicalKey = (typeof VEHICLE_EXPERTISE_MECHANICAL_FIELDS)[number]["key"];
type VehicleExpertiseStructureStatus = "ORIGINAL" | "ISLEMLI" | "DEGISMIS";
type VehicleExpertiseMechanicalStatus = "NORMAL" | "BAKIM_GEREKLI" | "ONARIM_GEREKLI";
type VehicleExpertiseTireStatus = "IYI" | "ORTA" | "ZAYIF" | "DEGISTIRILMELI";
type VehicleExpertiseMeta = {
  structure?: Partial<Record<VehicleExpertiseStructureKey, VehicleExpertiseStructureStatus>>;
  mechanical?: Partial<Record<VehicleExpertiseMechanicalKey, VehicleExpertiseMechanicalStatus>>;
  tires?: { general?: VehicleExpertiseTireStatus };
};

type SafeActionOptions = {
  onError?: (error: any) => void;
  suppressDefaultErrorStatus?: boolean;
};

type AuctionFieldKey =
  | "lotNo"
  | "title"
  | "groupId"
  | "categoryId"
  | "startsAt"
  | "endsAt"
  | "startPrice"
  | "minIncrement"
  | "images"
  | "expertiseFiles"
  | "documentFiles";

type AuctionFieldBinding = {
  key: AuctionFieldKey;
  label: string;
  element: HTMLElement;
};

type AuctionValidationIssue = {
  key: AuctionFieldKey;
  label: string;
  message: string;
};

const AUCTION_REQUIRED_FIELD_KEYS: AuctionFieldKey[] = [
  "lotNo",
  "title",
  "groupId",
  "categoryId",
  "startsAt",
  "endsAt",
  "startPrice",
  "minIncrement",
];

const elements = {
  refreshBtn: byId("refreshBtn"),
  searchInput: byId("searchInput"),
  sessionBox: byId("sessionBox"),
  statusLine: byId("statusLine"),
  tabs: byId("tabs"),
  panelUsers: byId("panelUsers"),
  panelCatalog: byId("panelCatalog"),
  panelAuctions: byId("panelAuctions"),
  panelReports: byId("panelReports"),
  panelSettings: byId("panelSettings"),
  panelLogs: byId("panelLogs"),
  catalogSearchInput: byId("catalogSearchInput"),
  auctionSearchInput: byId("auctionSearchInput"),
  auctionFormCard: byId("auctionFormCard"),
  auctionModal: byId("auctionModal"),
  auctionListCard: byId("auctionListCard"),
  auctionFormCloseBtn: byId("auctionFormCloseBtn"),
  openAuctionFormBtn: byId("openAuctionFormBtn"),
  userList: byId("userList"),
  userDetail: byId("userDetail"),
  statTotalUsers: byId("statTotalUsers"),
  statManagers: byId("statManagers"),
  statDisabledUsers: byId("statDisabledUsers"),
  statGroups: byId("statGroups"),
  statCategories: byId("statCategories"),
  statAuctions: byId("statAuctions"),

  groupForm: byId("groupForm"),
  groupNameInput: byId("groupNameInput"),
  groupRows: byId("groupRows"),

  categoryForm: byId("categoryForm"),
  categoryGroupSelect: byId("categoryGroupSelect"),
  categoryNameInput: byId("categoryNameInput"),
  categoryRows: byId("categoryRows"),

  auctionForm: byId("auctionForm"),
  auctionIdInput: byId("auctionIdInput"),
  auctionLotNoInput: byId("auctionLotNoInput"),
  auctionTitleInput: byId("auctionTitleInput"),
  auctionGroupSelect: byId("auctionGroupSelect"),
  auctionCategorySelect: byId("auctionCategorySelect"),
  auctionStartPriceInput: byId("auctionStartPriceInput"),
  auctionMinIncrementInput: byId("auctionMinIncrementInput"),
  auctionStatusInput: byId("auctionStatusInput"),
  auctionStartsAtInput: byId("auctionStartsAtInput"),
  auctionEndsAtInput: byId("auctionEndsAtInput"),
  auctionImageDropzone: byId("auctionImageDropzone"),
  auctionImageFileInput: byId("auctionImageFileInput"),
  auctionImagePickBtn: byId("auctionImagePickBtn"),
  auctionImageClearBtn: byId("auctionImageClearBtn"),
  auctionImageMeta: byId("auctionImageMeta"),
  auctionImageGallery: byId("auctionImageGallery"),
  auctionExtraEquipmentInput: byId("auctionExtraEquipmentInput"),
  auctionExpertiseDropzone: byId("auctionExpertiseDropzone"),
  auctionExpertiseFileInput: byId("auctionExpertiseFileInput"),
  auctionExpertisePickBtn: byId("auctionExpertisePickBtn"),
  auctionExpertiseClearBtn: byId("auctionExpertiseClearBtn"),
  auctionExpertiseMeta: byId("auctionExpertiseMeta"),
  auctionExpertiseList: byId("auctionExpertiseList"),
  auctionDocumentDropzone: byId("auctionDocumentDropzone"),
  auctionDocumentFileInput: byId("auctionDocumentFileInput"),
  auctionDocumentPickBtn: byId("auctionDocumentPickBtn"),
  auctionDocumentClearBtn: byId("auctionDocumentClearBtn"),
  auctionDocumentMeta: byId("auctionDocumentMeta"),
  auctionDocumentList: byId("auctionDocumentList"),
  auctionVehicleSection: byId("auctionVehicleSection"),
  auctionCityInput: byId("auctionCityInput"),
  auctionDistrictInput: byId("auctionDistrictInput"),
  auctionNeighborhoodInput: byId("auctionNeighborhoodInput"),
  auctionDescriptionInput: byId("auctionDescriptionInput"),
  auctionVehicleBrandInput: byId("auctionVehicleBrandInput"),
  auctionVehicleModelInput: byId("auctionVehicleModelInput"),
  auctionVehicleModelDetailInput: byId("auctionVehicleModelDetailInput"),
  auctionVehicleYearInput: byId("auctionVehicleYearInput"),
  auctionVehicleKmInput: byId("auctionVehicleKmInput"),
  auctionVehicleFuelTypeInput: byId("auctionVehicleFuelTypeInput"),
  auctionVehicleTransmissionInput: byId("auctionVehicleTransmissionInput"),
  auctionVehicleBodyTypeInput: byId("auctionVehicleBodyTypeInput"),
  auctionVehicleColorInput: byId("auctionVehicleColorInput"),
  auctionVehicleChassisNoInput: byId("auctionVehicleChassisNoInput"),
  auctionVehicleEngineVolumeInput: byId("auctionVehicleEngineVolumeInput"),
  auctionVehicleEnginePowerInput: byId("auctionVehicleEnginePowerInput"),
  auctionVehicleDriveTypeInput: byId("auctionVehicleDriveTypeInput"),
  auctionVehicleConditionToolbar: byId("auctionVehicleConditionToolbar"),
  auctionVehicleConditionResetBtn: byId("auctionVehicleConditionResetBtn"),
  auctionVehicleConditionMap: byId("auctionVehicleConditionMap"),
  auctionVehicleConditionPartSelect: byId("auctionVehicleConditionPartSelect"),
  auctionVehicleConditionStepInput: byId("auctionVehicleConditionStepInput"),
  auctionVehicleConditionOffsetXInput: byId("auctionVehicleConditionOffsetXInput"),
  auctionVehicleConditionOffsetYInput: byId("auctionVehicleConditionOffsetYInput"),
  auctionVehicleConditionScaleInput: byId("auctionVehicleConditionScaleInput"),
  auctionVehicleConditionScaleDownBtn: byId("auctionVehicleConditionScaleDownBtn"),
  auctionVehicleConditionScaleUpBtn: byId("auctionVehicleConditionScaleUpBtn"),
  auctionVehicleConditionScaleResetBtn: byId("auctionVehicleConditionScaleResetBtn"),
  auctionVehicleConditionMoveUpBtn: byId("auctionVehicleConditionMoveUpBtn"),
  auctionVehicleConditionMoveLeftBtn: byId("auctionVehicleConditionMoveLeftBtn"),
  auctionVehicleConditionMoveRightBtn: byId("auctionVehicleConditionMoveRightBtn"),
  auctionVehicleConditionMoveDownBtn: byId("auctionVehicleConditionMoveDownBtn"),
  auctionVehicleConditionResetPartBtn: byId("auctionVehicleConditionResetPartBtn"),
  auctionVehicleConditionResetLayoutBtn: byId("auctionVehicleConditionResetLayoutBtn"),
  auctionVehicleConditionSaveLayoutBtn: byId("auctionVehicleConditionSaveLayoutBtn"),
  expertiseStructureSagPodyeInput: byId("expertiseStructureSagPodyeInput"),
  expertiseStructureSolPodyeInput: byId("expertiseStructureSolPodyeInput"),
  expertiseStructureSagKilicSaciInput: byId("expertiseStructureSagKilicSaciInput"),
  expertiseStructureSolKilicSaciInput: byId("expertiseStructureSolKilicSaciInput"),
  expertiseStructureOnIcDireklerInput: byId("expertiseStructureOnIcDireklerInput"),
  expertiseStructureOrtaIcDireklerInput: byId("expertiseStructureOrtaIcDireklerInput"),
  expertiseStructureOnArkaPanelInput: byId("expertiseStructureOnArkaPanelInput"),
  expertiseStructureSagMarsbiyelInput: byId("expertiseStructureSagMarsbiyelInput"),
  expertiseStructureSolMarsbiyelInput: byId("expertiseStructureSolMarsbiyelInput"),
  expertiseStructureSagUstDireklerInput: byId("expertiseStructureSagUstDireklerInput"),
  expertiseStructureSolUstDireklerInput: byId("expertiseStructureSolUstDireklerInput"),
  expertiseMechanicalYagKacagiInput: byId("expertiseMechanicalYagKacagiInput"),
  expertiseMechanicalSanzimanInput: byId("expertiseMechanicalSanzimanInput"),
  expertiseMechanicalTurboInput: byId("expertiseMechanicalTurboInput"),
  expertiseMechanicalRadyatorInput: byId("expertiseMechanicalRadyatorInput"),
  expertiseMechanicalIntercoolerInput: byId("expertiseMechanicalIntercoolerInput"),
  expertiseMechanicalOnArkaTakimInput: byId("expertiseMechanicalOnArkaTakimInput"),
  expertiseTireGeneralInput: byId("expertiseTireGeneralInput"),
  auctionResetBtn: byId("auctionResetBtn"),
  auctionFormTitle: byId("auctionFormTitle"),
  auctionSaveBtn: byId("auctionSaveBtn"),
  auctionRows: byId("auctionRows"),
  filterOrderForm: byId("filterOrderForm"),
  filterOrderGroups: byId("filterOrderGroups"),
  filterOrderCategories: byId("filterOrderCategories"),
  filterOrderCities: byId("filterOrderCities"),
  filterOrderDistricts: byId("filterOrderDistricts"),
  filterOrderNeighborhoods: byId("filterOrderNeighborhoods"),
  filterOrderResetBtn: byId("filterOrderResetBtn"),
};

const VEHICLE_EXPERTISE_STRUCTURE_INPUTS: Record<VehicleExpertiseStructureKey, HTMLSelectElement> = {
  sag_podye: elements.expertiseStructureSagPodyeInput as HTMLSelectElement,
  sol_podye: elements.expertiseStructureSolPodyeInput as HTMLSelectElement,
  sag_kilic_saci: elements.expertiseStructureSagKilicSaciInput as HTMLSelectElement,
  sol_kilic_saci: elements.expertiseStructureSolKilicSaciInput as HTMLSelectElement,
  on_ic_direkler: elements.expertiseStructureOnIcDireklerInput as HTMLSelectElement,
  orta_ic_direkler_arka_kilit_karsiliklari: elements.expertiseStructureOrtaIcDireklerInput as HTMLSelectElement,
  on_panel_arka_panel: elements.expertiseStructureOnArkaPanelInput as HTMLSelectElement,
  sag_marsbiyel: elements.expertiseStructureSagMarsbiyelInput as HTMLSelectElement,
  sol_marsbiyel: elements.expertiseStructureSolMarsbiyelInput as HTMLSelectElement,
  sag_ust_direkler_frangart: elements.expertiseStructureSagUstDireklerInput as HTMLSelectElement,
  sol_ust_direkler_frangart: elements.expertiseStructureSolUstDireklerInput as HTMLSelectElement,
};

const VEHICLE_EXPERTISE_MECHANICAL_INPUTS: Record<VehicleExpertiseMechanicalKey, HTMLSelectElement> = {
  motor_alt_ust_yag_kacagi: elements.expertiseMechanicalYagKacagiInput as HTMLSelectElement,
  sanziman: elements.expertiseMechanicalSanzimanInput as HTMLSelectElement,
  turbo: elements.expertiseMechanicalTurboInput as HTMLSelectElement,
  radyator: elements.expertiseMechanicalRadyatorInput as HTMLSelectElement,
  intercooler: elements.expertiseMechanicalIntercoolerInput as HTMLSelectElement,
  on_arka_takim: elements.expertiseMechanicalOnArkaTakimInput as HTMLSelectElement,
};

function getAuctionFieldBinding(fieldKey: AuctionFieldKey): AuctionFieldBinding | null {
  if (fieldKey === "lotNo") return { key: fieldKey, label: "Ihale No", element: elements.auctionLotNoInput };
  if (fieldKey === "title") return { key: fieldKey, label: "Ihale Basligi", element: elements.auctionTitleInput };
  if (fieldKey === "groupId") return { key: fieldKey, label: "Urun Grubu", element: elements.auctionGroupSelect };
  if (fieldKey === "categoryId") return { key: fieldKey, label: "Kategori", element: elements.auctionCategorySelect };
  if (fieldKey === "startsAt") return { key: fieldKey, label: "Baslangic Tarihi", element: elements.auctionStartsAtInput };
  if (fieldKey === "endsAt") return { key: fieldKey, label: "Bitis Tarihi", element: elements.auctionEndsAtInput };
  if (fieldKey === "startPrice") return { key: fieldKey, label: "Baslangic Bedeli", element: elements.auctionStartPriceInput };
  if (fieldKey === "minIncrement") return { key: fieldKey, label: "Minimum Artis", element: elements.auctionMinIncrementInput };
  if (fieldKey === "images") return { key: fieldKey, label: "Arac Gorselleri", element: elements.auctionImageDropzone };
  if (fieldKey === "documentFiles")
    return { key: fieldKey, label: "Dokumanlar", element: elements.auctionDocumentDropzone };
  return null;
}

function getAllAuctionFieldBindings(): AuctionFieldBinding[] {
  return AUCTION_REQUIRED_FIELD_KEYS.map((key) => getAuctionFieldBinding(key)).filter(
    (item): item is AuctionFieldBinding => item !== null
  );
}

function ensureVehicleConditionLayoutEditorMarkup() {
  const mapRoot = elements.auctionVehicleConditionMap as HTMLElement | null;
  if (!mapRoot) return;
  const editor = mapRoot.closest(".conditionEditor") as HTMLElement | null;
  if (!editor) return;

  const exists = editor.querySelector("#auctionVehicleConditionPartSelect");
  if (!exists) {
    mapRoot.insertAdjacentHTML(
      "beforebegin",
      `
      <div class="conditionLayoutTools">
        <label class="conditionMiniField">
          <span>Parca</span>
          <select id="auctionVehicleConditionPartSelect"></select>
        </label>
        <label class="conditionMiniField conditionStepField">
          <span>Adim (px)</span>
          <input id="auctionVehicleConditionStepInput" type="number" min="1" max="20" step="1" value="2">
        </label>
        <label class="conditionMiniField conditionScaleField">
          <span>Olcek (%)</span>
          <input id="auctionVehicleConditionScaleInput" type="number" min="70" max="170" step="1" value="100">
        </label>
        <label class="conditionMiniField conditionOffsetField">
          <span>X</span>
          <input id="auctionVehicleConditionOffsetXInput" type="number" readonly value="0">
        </label>
        <label class="conditionMiniField conditionOffsetField">
          <span>Y</span>
          <input id="auctionVehicleConditionOffsetYInput" type="number" readonly value="0">
        </label>
        <div class="conditionMovePad" role="group" aria-label="Parca konumlandirma">
          <button class="miniBtn iconBtn" type="button" id="auctionVehicleConditionMoveUpBtn" title="Yukari" aria-label="Yukari">↑</button>
          <button class="miniBtn iconBtn" type="button" id="auctionVehicleConditionMoveLeftBtn" title="Sola" aria-label="Sola">←</button>
          <button class="miniBtn iconBtn" type="button" id="auctionVehicleConditionMoveRightBtn" title="Saga" aria-label="Saga">→</button>
          <button class="miniBtn iconBtn" type="button" id="auctionVehicleConditionMoveDownBtn" title="Asagi" aria-label="Asagi">↓</button>
        </div>
        <div class="conditionScalePad" role="group" aria-label="Sema olcekleme">
          <button class="miniBtn iconBtn" type="button" id="auctionVehicleConditionScaleDownBtn" title="Olcegi kucult" aria-label="Olcegi kucult">-</button>
          <button class="miniBtn iconBtn" type="button" id="auctionVehicleConditionScaleUpBtn" title="Olcegi buyut" aria-label="Olcegi buyut">+</button>
          <button class="miniBtn" type="button" id="auctionVehicleConditionScaleResetBtn">Olcegi Sifirla</button>
        </div>
        <div class="conditionLayoutActions">
          <button class="miniBtn" type="button" id="auctionVehicleConditionResetPartBtn">Parcayi Sifirla</button>
          <button class="miniBtn" type="button" id="auctionVehicleConditionResetLayoutBtn">Tum Konumlari Sifirla</button>
          <button class="miniBtn success" type="button" id="auctionVehicleConditionSaveLayoutBtn">Konumlari Kaydet</button>
        </div>
      </div>
      `
    );
  }

  elements.auctionVehicleConditionPartSelect = byId("auctionVehicleConditionPartSelect");
  elements.auctionVehicleConditionStepInput = byId("auctionVehicleConditionStepInput");
  elements.auctionVehicleConditionOffsetXInput = byId("auctionVehicleConditionOffsetXInput");
  elements.auctionVehicleConditionOffsetYInput = byId("auctionVehicleConditionOffsetYInput");
  elements.auctionVehicleConditionScaleInput = byId("auctionVehicleConditionScaleInput");
  elements.auctionVehicleConditionScaleDownBtn = byId("auctionVehicleConditionScaleDownBtn");
  elements.auctionVehicleConditionScaleUpBtn = byId("auctionVehicleConditionScaleUpBtn");
  elements.auctionVehicleConditionScaleResetBtn = byId("auctionVehicleConditionScaleResetBtn");
  elements.auctionVehicleConditionMoveUpBtn = byId("auctionVehicleConditionMoveUpBtn");
  elements.auctionVehicleConditionMoveLeftBtn = byId("auctionVehicleConditionMoveLeftBtn");
  elements.auctionVehicleConditionMoveRightBtn = byId("auctionVehicleConditionMoveRightBtn");
  elements.auctionVehicleConditionMoveDownBtn = byId("auctionVehicleConditionMoveDownBtn");
  elements.auctionVehicleConditionResetPartBtn = byId("auctionVehicleConditionResetPartBtn");
  elements.auctionVehicleConditionResetLayoutBtn = byId("auctionVehicleConditionResetLayoutBtn");
  elements.auctionVehicleConditionSaveLayoutBtn = byId("auctionVehicleConditionSaveLayoutBtn");

  const toolbar = editor.querySelector("#auctionVehicleConditionToolbar") as HTMLElement | null;
  if (toolbar && toolbar.nextElementSibling !== mapRoot) {
    mapRoot.insertAdjacentElement("beforebegin", toolbar);
  }
}

init().catch((error: any) => {
  console.error(error);
  setStatus(error.message || "Yonetim paneli yuklenemedi.", "error");
});

async function init() {
  ensureVehicleConditionLayoutEditorMarkup();
  const expertiseUploadBlock = elements.auctionExpertiseDropzone?.closest(".uploadBlock") as HTMLElement | null;
  if (expertiseUploadBlock) expertiseUploadBlock.classList.add("hide");
  const extraEquipmentSection = elements.auctionExtraEquipmentInput?.closest(".formSection") as HTMLElement | null;
  if (extraEquipmentSection) extraEquipmentSection.classList.add("hide");
  markRequiredAuctionLabels();
  setStatus("Veriler yukleniyor...", "warn");
  await bootstrapData();
  bindEvents();
  renderAll();
  setStatus("Yonetim paneli hazir.", "ok");
}

async function bootstrapData() {
  const data = await apiFetch("/api/admin/bootstrap");
  applyBootstrapPayload(data);
}

async function reloadAll() {
  const data = await apiFetch("/api/admin/bootstrap");
  applyBootstrapPayload(data);
}

function applyBootstrapPayload(data: any) {
  state.currentUser = data.user || null;

  if (Array.isArray(data.permissionDefs) && data.permissionDefs.length > 0) {
    state.permissionDefs = data.permissionDefs
      .map((item: any) => ({ key: String(item.key || ""), label: String(item.label || item.key || "") }))
      .filter((item: any) => item.key);
  }

  state.users = Array.isArray(data.users) ? data.users : [];
  state.groups = Array.isArray(data.groups) ? data.groups : [];
  state.categories = Array.isArray(data.categories) ? data.categories : [];
  state.auctions = Array.isArray(data.auctions) ? data.auctions : [];
  state.filterOrdering = normalizeFilterOrderingPayload(data.filterOrdering);
  state.auctionVehicleConditionLayout = normalizeVehicleConditionLayout(data.vehicleConditionLayout || {});
  state.auctionVehicleConditionScale = normalizeVehicleConditionScale(data.vehicleConditionScale);
  if (!isVehicleConditionPartKey(String(state.auctionVehicleConditionSelectedPart || ""))) {
    state.auctionVehicleConditionSelectedPart = VEHICLE_CONDITION_PARTS[0]?.key || "";
  }
  const hasSelectedUser = state.users.some((user: any) => String(user.id || "") === String(state.selectedUserId || ""));
  if (!hasSelectedUser) {
    state.selectedUserId = state.users[0] ? String(state.users[0].id || "") : "";
  }

  const who = state.currentUser
    ? `${state.currentUser.name || "Yonetici"} (${state.currentUser.email || "-"})`
    : "Oturum bulunamadi";
  elements.sessionBox.textContent = who;
}

function bindEvents() {
  elements.refreshBtn.addEventListener("click", async () => {
    await safeAction(elements.refreshBtn, async () => {
      setStatus("Veriler yenileniyor...", "warn");
      await reloadAll();
      renderAll();
      setStatus("Veriler guncellendi.", "ok");
    });
  });

  elements.searchInput.addEventListener("input", () => {
    state.query = String(elements.searchInput.value || "").trim().toLowerCase();
    renderUsers();
  });
  elements.catalogSearchInput.addEventListener("input", () => {
    state.catalogQuery = String(elements.catalogSearchInput.value || "").trim().toLowerCase();
    renderCatalog();
  });
  elements.auctionSearchInput.addEventListener("input", () => {
    state.auctionQuery = String(elements.auctionSearchInput.value || "").trim().toLowerCase();
    renderAuctions();
  });

  elements.tabs.addEventListener("click", (event: any) => {
    const btn = event.target.closest("button[data-tab]");
    if (!btn) return;
    state.activeTab = String(btn.dataset.tab || "users");
    renderTabs();
  });

  bindUserEvents();
  bindCatalogEvents();
  bindAuctionEvents();
  bindSettingsEvents();
}

function bindUserEvents() {
  elements.userList.addEventListener("click", async (event: any) => {
    const target = event.target as HTMLElement;
    const selectItem = target.closest("[data-action='select-user']") as HTMLElement | null;
    if (!selectItem) return;
    const userId = String(selectItem.dataset.userId || "");
    if (!userId) return;
    state.selectedUserId = userId;
    renderUsers();
  });

  elements.userList.addEventListener("keydown", (event: any) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target as HTMLElement;
    const selectItem = target.closest("[data-action='select-user']") as HTMLElement | null;
    if (!selectItem) return;
    event.preventDefault();
    const userId = String(selectItem.dataset.userId || "");
    if (!userId) return;
    state.selectedUserId = userId;
    renderUsers();
  });

  elements.userDetail.addEventListener("click", async (event: any) => {
    const target = event.target as HTMLElement;
    const actionBtn = target.closest("button[data-action]") as HTMLButtonElement | null;
    if (!actionBtn) return;
    const action = String(actionBtn.dataset.action || "");
    const userId = String(actionBtn.dataset.userId || "");
    if (!userId) return;

    if (action === "toggle-status") {
      const disabled = actionBtn.dataset.disabled === "true";
      await safeAction(actionBtn, async () => {
        await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/status`, {
          method: "POST",
          body: { disabled: !disabled },
        });
        await loadUsers();
        renderUsers();
        renderStats();
        setStatus(!disabled ? "Kullanici pasife alindi." : "Kullanici aktif edildi.", "ok");
      });
      return;
    }

    if (action === "revoke-sessions") {
      await safeAction(actionBtn, async () => {
        await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/revoke-sessions`, {
          method: "POST",
          body: {},
        });
        setStatus("Kullanici oturumlari sonlandirildi.", "ok");
      });
      return;
    }

  });

  elements.userDetail.addEventListener("change", async (event: any) => {
    const target = event.target as HTMLElement;
    const roleSelect = target.closest("select[data-action='change-role']") as HTMLSelectElement | null;
    if (roleSelect) {
      const userId = String(roleSelect.dataset.userId || "");
      const role = String(roleSelect.value || "").trim();
      if (!userId || !role) return;

      await safeAction(roleSelect, async () => {
        await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/role`, {
          method: "POST",
          body: { role },
        });
        await loadUsers();
        renderUsers();
        renderStats();
        setStatus("Rol guncellendi.", "ok");
      });
      return;
    }

    const permissionSwitch = target.closest("input[data-action='toggle-permission']") as HTMLInputElement | null;
    if (!permissionSwitch) return;
    const userId = String(permissionSwitch.dataset.userId || "");
    const permissionKey = String(permissionSwitch.dataset.permissionKey || "");
    if (!userId || !permissionKey) return;
    const enabled = permissionSwitch.checked === true;

    await safeAction(permissionSwitch, async () => {
      await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/permissions`, {
        method: "POST",
        body: { permissionKey, enabled },
      });
      await loadUsers();
      renderUsers();
      setStatus("Yetki guncellendi.", "ok");
    }, {
      onError: () => {
        permissionSwitch.checked = !enabled;
      },
    });
  });

  elements.userDetail.addEventListener("submit", async (event: any) => {
    const target = event.target as HTMLElement;
    const form = target.closest("form[data-action='change-password']") as HTMLFormElement | null;
    if (!form) return;
    event.preventDefault();

    const userId = String(form.dataset.userId || "");
    const passwordInput = form.querySelector("input[name='newPassword']") as HTMLInputElement | null;
    const confirmInput = form.querySelector("input[name='confirmPassword']") as HTMLInputElement | null;
    const submitBtn = form.querySelector("button[type='submit']") as HTMLButtonElement | null;

    if (!userId || !passwordInput || !confirmInput || !submitBtn) return;

    const newPassword = String(passwordInput.value || "").trim();
    const confirmPassword = String(confirmInput.value || "").trim();
    if (newPassword.length < 8) {
      setStatus("Sifre en az 8 karakter olmalidir.", "error");
      passwordInput.focus();
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus("Sifre tekrar alani eslesmiyor.", "error");
      confirmInput.focus();
      return;
    }

    await safeAction(submitBtn, async () => {
      await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/password`, {
        method: "POST",
        body: { newPassword },
      });
      passwordInput.value = "";
      confirmInput.value = "";
      setStatus("Kullanici sifresi guncellendi. Aktif oturumlar kapatildi.", "ok");
    });
  });
}

function bindCatalogEvents() {
  elements.groupForm.addEventListener("submit", async (event: any) => {
    event.preventDefault();
    const name = String(elements.groupNameInput.value || "").trim();
    if (!name) {
      setStatus("Urun grubu adi zorunludur.", "error");
      return;
    }

    const sortOrder =
      (state.groups.reduce((max: number, row: any) => Math.max(max, Number(row.sort_order || 0)), 0) || 0) + 10;
    const payload = { name, sortOrder, isActive: true };

    await safeAction(elements.groupForm, async () => {
      await apiFetch("/api/admin/product-groups", { method: "POST", body: payload });
      resetGroupForm();
      await loadCatalog();
      renderCatalog();
      renderStats();
      setStatus("Urun grubu eklendi.", "ok");
    });
  });

  elements.groupRows.addEventListener("click", async (event: any) => {
    const btn = event.target.closest("button[data-action]") as HTMLButtonElement | null;
    if (!btn) return;
    const action = String(btn.dataset.action || "");
    const groupId = String(btn.dataset.id || "");
    const group = state.groups.find((x: any) => x.id === groupId);
    if (!group) return;

    if (action === "move-group-up" || action === "move-group-down") {
      const direction = action === "move-group-up" ? -1 : 1;
      await safeAction(btn, async () => {
        const moved = await moveGroupSortOrder(groupId, direction);
        if (!moved) {
          setStatus(direction < 0 ? "Urun grubu zaten en ustte." : "Urun grubu zaten en altta.", "warn");
          return;
        }
        await loadCatalog();
        renderCatalog();
        setStatus("Urun grubu sirasi guncellendi.", "ok");
      });
      return;
    }

    if (action === "rename-group") {
      const nextName = prompt("Yeni urun grubu adini girin:", String(group.name || "")) || "";
      const name = String(nextName || "").trim();
      if (!name || name === String(group.name || "").trim()) return;
      await safeAction(btn, async () => {
        await apiFetch(`/api/admin/product-groups/${encodeURIComponent(groupId)}`, {
          method: "PUT",
          body: { name },
        });
        await loadCatalog();
        renderCatalog();
        setStatus("Urun grubu adi guncellendi.", "ok");
      });
      return;
    }

    if (action === "toggle-group") {
      await safeAction(btn, async () => {
        await apiFetch(`/api/admin/product-groups/${encodeURIComponent(groupId)}`, {
          method: "PUT",
          body: { isActive: Number(group.is_active || 0) !== 1 },
        });
        await loadCatalog();
        renderCatalog();
        setStatus("Urun grubu durumu guncellendi.", "ok");
      });
      return;
    }

    if (action === "delete-group") {
      if (!confirm(`"${group.name}" urun grubunu silmek istiyor musunuz?`)) return;
      await safeAction(btn, async () => {
        await apiFetch(`/api/admin/product-groups/${encodeURIComponent(groupId)}`, { method: "DELETE" });
        await loadCatalog();
        renderCatalog();
        renderStats();
        setStatus("Urun grubu silindi.", "ok");
      });
    }
  });

  elements.categoryForm.addEventListener("submit", async (event: any) => {
    event.preventDefault();
    const groupId = String(elements.categoryGroupSelect.value || "").trim();
    const name = String(elements.categoryNameInput.value || "").trim();
    if (!groupId || !name) {
      setStatus("Kategori grubu ve adi zorunludur.", "error");
      return;
    }

    const sortOrder =
      (state.categories
        .filter((row: any) => String(row.group_id || "") === groupId)
        .reduce((max: number, row: any) => Math.max(max, Number(row.sort_order || 0)), 0) || 0) + 10;
    const payload = { groupId, name, sortOrder, isActive: true };

    await safeAction(elements.categoryForm, async () => {
      await apiFetch("/api/admin/categories", { method: "POST", body: payload });
      resetCategoryForm();
      await loadCatalog();
      renderCatalog();
      renderStats();
      setStatus("Kategori eklendi.", "ok");
    });
  });

  elements.categoryRows.addEventListener("click", async (event: any) => {
    const btn = event.target.closest("button[data-action]") as HTMLButtonElement | null;
    if (!btn) return;
    const action = String(btn.dataset.action || "");
    const categoryId = String(btn.dataset.id || "");
    const category = state.categories.find((x: any) => x.id === categoryId);
    if (!category) return;

    if (action === "move-category-up" || action === "move-category-down") {
      const direction = action === "move-category-up" ? -1 : 1;
      await safeAction(btn, async () => {
        const moved = await moveCategorySortOrder(categoryId, direction);
        if (!moved) {
          setStatus(direction < 0 ? "Kategori zaten en ustte." : "Kategori zaten en altta.", "warn");
          return;
        }
        await loadCatalog();
        renderCatalog();
        setStatus("Kategori sirasi guncellendi.", "ok");
      });
      return;
    }

    if (action === "rename-category") {
      const nextName = prompt("Yeni kategori adini girin:", String(category.name || "")) || "";
      const name = String(nextName || "").trim();
      if (!name || name === String(category.name || "").trim()) return;
      await safeAction(btn, async () => {
        await apiFetch(`/api/admin/categories/${encodeURIComponent(categoryId)}`, {
          method: "PUT",
          body: { name },
        });
        await loadCatalog();
        renderCatalog();
        setStatus("Kategori adi guncellendi.", "ok");
      });
      return;
    }

    if (action === "toggle-category") {
      await safeAction(btn, async () => {
        await apiFetch(`/api/admin/categories/${encodeURIComponent(categoryId)}`, {
          method: "PUT",
          body: { isActive: Number(category.is_active || 0) !== 1 },
        });
        await loadCatalog();
        renderCatalog();
        setStatus("Kategori durumu guncellendi.", "ok");
      });
      return;
    }

    if (action === "delete-category") {
      if (!confirm(`"${category.name}" kategorisini silmek istiyor musunuz?`)) return;
      await safeAction(btn, async () => {
        await apiFetch(`/api/admin/categories/${encodeURIComponent(categoryId)}`, { method: "DELETE" });
        await loadCatalog();
        renderCatalog();
        renderStats();
        setStatus("Kategori silindi.", "ok");
      });
    }
  });
}

function bindSettingsEvents() {
  if (!elements.filterOrderForm) return;

  elements.filterOrderForm.addEventListener("submit", async (event: any) => {
    event.preventDefault();
    const payload = {
      productGroups: parseOrderListInput(readTextControlValue(elements.filterOrderGroups)),
      categories: parseOrderListInput(readTextControlValue(elements.filterOrderCategories)),
      cities: parseOrderListInput(readTextControlValue(elements.filterOrderCities)),
      districts: parseOrderListInput(readTextControlValue(elements.filterOrderDistricts)),
      neighborhoods: parseOrderListInput(readTextControlValue(elements.filterOrderNeighborhoods)),
    };

    await safeAction(elements.filterOrderForm, async () => {
      const data = await apiFetch("/api/admin/filter-ordering", {
        method: "POST",
        body: payload,
      });
      state.filterOrdering = normalizeFilterOrderingPayload(data);
      renderSettings();
      setStatus("Filtre siralamalari guncellendi.", "ok");
    });
  });

  elements.filterOrderResetBtn.addEventListener("click", () => {
    const normalized = normalizeFilterOrderingPayload(state.filterOrdering);
    fillFilterOrderEditorWithOptions(normalized.options);
    setStatus("Varsayilan liste duzenleme alanina getirildi. Kaydetmek icin butona basin.", "warn");
  });
}

function bindAuctionEvents() {
  elements.openAuctionFormBtn.addEventListener("click", () => {
    resetAuctionForm();
    showAuctionForm();
    setStatus("Yeni ihale penceresi acildi.", "ok");
  });

  elements.auctionFormCloseBtn.addEventListener("click", () => {
    hideAuctionForm();
    setStatus("Ihale penceresi kapatildi.", "ok");
  });

  elements.auctionModal.addEventListener("click", (event: any) => {
    const target = event.target as HTMLElement;
    const closeAction = target.closest("[data-action='close-auction-modal']") as HTMLElement | null;
    if (!closeAction) return;
    hideAuctionForm();
  });

  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    if (elements.auctionModal.classList.contains("hide")) return;
    hideAuctionForm();
  });

  elements.auctionGroupSelect.addEventListener("change", () => {
    fillAuctionCategorySelect();
    renderAuctionVehicleSection();
  });

  elements.auctionCityInput.addEventListener("change", () => {
    elements.auctionDistrictInput.value = "";
    elements.auctionNeighborhoodInput.value = "";
  });

  elements.auctionVehicleBrandInput.addEventListener("change", () => {
    fillAuctionVehicleModelSelect("");
  });

  elements.auctionLotNoInput.addEventListener("input", () => {
    const start = elements.auctionLotNoInput.selectionStart;
    const end = elements.auctionLotNoInput.selectionEnd;
    elements.auctionLotNoInput.value = String(elements.auctionLotNoInput.value || "").toUpperCase();
    if (start !== null && end !== null) {
      elements.auctionLotNoInput.setSelectionRange(start, end);
    }
  });

  elements.auctionVehicleChassisNoInput.addEventListener("input", () => {
    const start = elements.auctionVehicleChassisNoInput.selectionStart;
    const end = elements.auctionVehicleChassisNoInput.selectionEnd;
    elements.auctionVehicleChassisNoInput.value = String(elements.auctionVehicleChassisNoInput.value || "").toUpperCase();
    if (start !== null && end !== null) {
      elements.auctionVehicleChassisNoInput.setSelectionRange(start, end);
    }
  });

  const closeDatePicker = (input: HTMLInputElement) => {
    input.addEventListener("change", () => {
      window.setTimeout(() => input.blur(), 0);
    });
  };
  closeDatePicker(elements.auctionStartsAtInput);
  closeDatePicker(elements.auctionEndsAtInput);

  elements.auctionVehicleConditionToolbar.addEventListener("click", (event: any) => {
    const btn = event.target.closest("button[data-condition-status]") as HTMLButtonElement | null;
    if (!btn) return;
    const nextStatus = normalizeVehicleConditionStatusKey(btn.dataset.conditionStatus);
    if (!nextStatus) return;
    state.auctionVehicleConditionSelectedStatus = nextStatus;
    renderAuctionVehicleConditionMap();
  });

  elements.auctionVehicleConditionMap.addEventListener("click", (event: any) => {
    const partNode = (event.target as Element | null)?.closest("[data-part-key]") as Element | null;
    if (!partNode) return;
    const partKey = String((partNode as any).dataset?.partKey || "").trim();
    if (!isVehicleConditionPartKey(partKey)) return;
    state.auctionVehicleConditionSelectedPart = partKey;
    const selectedStatus = normalizeVehicleConditionStatusKey(state.auctionVehicleConditionSelectedStatus) || VEHICLE_CONDITION_DEFAULT_STATUS;
    setVehicleConditionPartStatus(partKey, selectedStatus);
    renderAuctionVehicleConditionMap();
  });

  elements.auctionVehicleConditionResetBtn.addEventListener("click", () => {
    state.auctionVehicleConditionMap = {};
    renderAuctionVehicleConditionMap();
    setStatus("Kaporta haritasi orijinal duruma cekildi.", "ok");
  });

  if (
    elements.auctionVehicleConditionPartSelect &&
    elements.auctionVehicleConditionStepInput &&
    elements.auctionVehicleConditionScaleInput &&
    elements.auctionVehicleConditionScaleDownBtn &&
    elements.auctionVehicleConditionScaleUpBtn &&
    elements.auctionVehicleConditionScaleResetBtn &&
    elements.auctionVehicleConditionMoveUpBtn &&
    elements.auctionVehicleConditionMoveDownBtn &&
    elements.auctionVehicleConditionMoveLeftBtn &&
    elements.auctionVehicleConditionMoveRightBtn &&
    elements.auctionVehicleConditionResetPartBtn &&
    elements.auctionVehicleConditionResetLayoutBtn &&
    elements.auctionVehicleConditionSaveLayoutBtn
  ) {
    elements.auctionVehicleConditionPartSelect.addEventListener("change", () => {
      const nextPart = String(elements.auctionVehicleConditionPartSelect.value || "");
      if (!isVehicleConditionPartKey(nextPart)) return;
      state.auctionVehicleConditionSelectedPart = nextPart;
      syncVehicleConditionLayoutControls();
      renderAuctionVehicleConditionMap();
    });

    elements.auctionVehicleConditionStepInput.addEventListener("change", () => {
      state.auctionVehicleConditionStep = normalizeVehicleConditionLayoutStep(elements.auctionVehicleConditionStepInput.value);
      syncVehicleConditionLayoutControls();
    });

    elements.auctionVehicleConditionScaleInput.addEventListener("change", () => {
      state.auctionVehicleConditionScale = normalizeVehicleConditionScalePercentInput(
        elements.auctionVehicleConditionScaleInput.value
      );
      renderAuctionVehicleConditionMap();
      syncVehicleConditionLayoutControls();
      queueVehicleConditionLayoutAutosave();
    });

    const moveSelectedPart = (dx: number, dy: number) => {
      const partKey = String(state.auctionVehicleConditionSelectedPart || "");
      if (!isVehicleConditionPartKey(partKey)) return;
      const step = normalizeVehicleConditionLayoutStep(state.auctionVehicleConditionStep);
      state.auctionVehicleConditionStep = step;
      shiftVehicleConditionPartOffset(partKey, dx * step, dy * step);
      renderAuctionVehicleConditionMap();
      syncVehicleConditionLayoutControls();
      queueVehicleConditionLayoutAutosave();
    };

    const shiftScale = (deltaPercent: number) => {
      const currentPercent = Math.round(normalizeVehicleConditionScale(state.auctionVehicleConditionScale) * 100);
      state.auctionVehicleConditionScale = normalizeVehicleConditionScalePercentInput(currentPercent + deltaPercent);
      renderAuctionVehicleConditionMap();
      syncVehicleConditionLayoutControls();
      queueVehicleConditionLayoutAutosave();
    };

    elements.auctionVehicleConditionMoveUpBtn.addEventListener("click", () => moveSelectedPart(0, -1));
    elements.auctionVehicleConditionMoveDownBtn.addEventListener("click", () => moveSelectedPart(0, 1));
    elements.auctionVehicleConditionMoveLeftBtn.addEventListener("click", () => moveSelectedPart(-1, 0));
    elements.auctionVehicleConditionMoveRightBtn.addEventListener("click", () => moveSelectedPart(1, 0));
    elements.auctionVehicleConditionScaleDownBtn.addEventListener("click", () => shiftScale(-2));
    elements.auctionVehicleConditionScaleUpBtn.addEventListener("click", () => shiftScale(2));
    elements.auctionVehicleConditionScaleResetBtn.addEventListener("click", () => {
      state.auctionVehicleConditionScale = VEHICLE_CONDITION_SCALE_DEFAULT;
      renderAuctionVehicleConditionMap();
      syncVehicleConditionLayoutControls();
      queueVehicleConditionLayoutAutosave();
      setStatus("Sema olcegi varsayilan degere getirildi.", "ok");
    });

    elements.auctionVehicleConditionResetPartBtn.addEventListener("click", () => {
      const partKey = String(state.auctionVehicleConditionSelectedPart || "");
      if (!isVehicleConditionPartKey(partKey)) return;
      setVehicleConditionPartOffset(partKey, 0, 0);
      renderAuctionVehicleConditionMap();
      syncVehicleConditionLayoutControls();
      queueVehicleConditionLayoutAutosave();
      setStatus("Secili parcanin konumu sifirlandi.", "ok");
    });

    elements.auctionVehicleConditionResetLayoutBtn.addEventListener("click", () => {
      state.auctionVehicleConditionLayout = createDefaultVehicleConditionLayout();
      renderAuctionVehicleConditionMap();
      syncVehicleConditionLayoutControls();
      queueVehicleConditionLayoutAutosave();
      setStatus("Tum parca konumlari sifirlandi.", "ok");
    });

    elements.auctionVehicleConditionSaveLayoutBtn.addEventListener("click", async () => {
      await safeAction(elements.auctionVehicleConditionSaveLayoutBtn, async () => {
        if (state.auctionVehicleConditionLayoutSaveTimer) {
          window.clearTimeout(state.auctionVehicleConditionLayoutSaveTimer);
          state.auctionVehicleConditionLayoutSaveTimer = null;
        }
        await persistVehicleConditionLayout(false);
      });
    });
  }

  elements.auctionImagePickBtn.addEventListener("click", () => {
    elements.auctionImageFileInput.click();
  });

  bindDropzoneUpload(elements.auctionImageDropzone, elements.auctionImageFileInput, async (files: File[]) => {
    await addAuctionImagesFromFiles(files);
  });

  elements.auctionImageFileInput.addEventListener("change", async () => {
    const files = Array.from(elements.auctionImageFileInput.files || []) as File[];
    if (files.length < 1) return;
    await addAuctionImagesFromFiles(files);
    elements.auctionImageFileInput.value = "";
  });

  elements.auctionImageClearBtn.addEventListener("click", () => {
    clearAuctionImageSelection();
    setStatus("Yuklenen tum gorseller temizlendi.", "ok");
  });

  elements.auctionImageGallery.addEventListener("click", (event: any) => {
    const btn = event.target.closest("button[data-remove-image-index]") as HTMLButtonElement | null;
    if (!btn) return;
    const index = Number(btn.dataset.removeImageIndex || -1);
    if (!Number.isFinite(index) || index < 0) return;
    state.auctionImageDataUrls = state.auctionImageDataUrls.filter((_: string, i: number) => i !== index);
    renderAuctionImageGallery();
  });

  elements.auctionExpertisePickBtn.addEventListener("click", () => {
    elements.auctionExpertiseFileInput.click();
  });

  bindDropzoneUpload(elements.auctionExpertiseDropzone, elements.auctionExpertiseFileInput, async (files: File[]) => {
    await addReportFiles(files, "expertise");
  });

  elements.auctionExpertiseFileInput.addEventListener("change", async () => {
    const files = Array.from(elements.auctionExpertiseFileInput.files || []) as File[];
    if (files.length < 1) return;
    await addReportFiles(files, "expertise");
    elements.auctionExpertiseFileInput.value = "";
  });

  elements.auctionExpertiseClearBtn.addEventListener("click", () => {
    state.auctionExpertiseFiles = [];
    renderAuctionFileList("expertise");
    setStatus("Ekspertiz dosyalari temizlendi.", "ok");
  });

  elements.auctionExpertiseList.addEventListener("click", (event: any) => {
    const btn = event.target.closest("button[data-remove-expertise-index]") as HTMLButtonElement | null;
    if (!btn) return;
    const index = Number(btn.dataset.removeExpertiseIndex || -1);
    if (!Number.isFinite(index) || index < 0) return;
    state.auctionExpertiseFiles = state.auctionExpertiseFiles.filter((_: UploadedFileEntry, i: number) => i !== index);
    renderAuctionFileList("expertise");
  });

  elements.auctionDocumentPickBtn.addEventListener("click", () => {
    elements.auctionDocumentFileInput.click();
  });

  bindDropzoneUpload(elements.auctionDocumentDropzone, elements.auctionDocumentFileInput, async (files: File[]) => {
    await addReportFiles(files, "document");
  });

  elements.auctionDocumentFileInput.addEventListener("change", async () => {
    const files = Array.from(elements.auctionDocumentFileInput.files || []) as File[];
    if (files.length < 1) return;
    await addReportFiles(files, "document");
    elements.auctionDocumentFileInput.value = "";
  });

  elements.auctionDocumentClearBtn.addEventListener("click", () => {
    state.auctionDocumentFiles = [];
    renderAuctionFileList("document");
    setStatus("Dokuman dosyalari temizlendi.", "ok");
  });

  elements.auctionDocumentList.addEventListener("click", (event: any) => {
    const btn = event.target.closest("button[data-remove-document-index]") as HTMLButtonElement | null;
    if (!btn) return;
    const index = Number(btn.dataset.removeDocumentIndex || -1);
    if (!Number.isFinite(index) || index < 0) return;
    state.auctionDocumentFiles = state.auctionDocumentFiles.filter((_: UploadedFileEntry, i: number) => i !== index);
    renderAuctionFileList("document");
  });

  elements.auctionForm.addEventListener("submit", async (event: any) => {
    event.preventDefault();
    clearAuctionFieldErrors();
    const auctionId = String(elements.auctionIdInput.value || "").trim();
    const payload = readAuctionFormPayload();
    const validationIssues = validateAuctionFormPayload(payload);
    if (validationIssues.length > 0) {
      applyAuctionValidationIssues(validationIssues);
      return;
    }

    await safeAction(
      elements.auctionForm,
      async () => {
        if (auctionId) {
          await apiFetch(`/api/admin/auctions/${encodeURIComponent(auctionId)}`, { method: "PUT", body: payload });
        } else {
          await apiFetch("/api/admin/auctions", { method: "POST", body: payload });
        }

        clearAuctionFieldErrors();
        resetAuctionForm();
        await loadAuctions();
        renderAuctions();
        renderStats();
        const message = auctionId ? "Ihale basariyla guncellendi." : "Ihale basariyla eklendi.";
        setStatus(message, "ok");
        hideAuctionForm();
      },
      {
        suppressDefaultErrorStatus: true,
        onError: (error) => {
          handleAuctionSubmitError(error);
        },
      }
    );
  });

  elements.auctionResetBtn.addEventListener("click", () => resetAuctionForm());

  elements.auctionRows.addEventListener("click", async (event: any) => {
    const btn = event.target.closest("button[data-action]") as HTMLButtonElement | null;
    if (!btn) return;
    const action = String(btn.dataset.action || "");
    const auctionId = String(btn.dataset.id || "");
    const auction = state.auctions.find((x: any) => x.id === auctionId);
    if (!auction) return;

    if (action === "edit-auction") {
      fillAuctionForm(auction);
      showAuctionForm();
      state.activeTab = "auctions";
      renderTabs();
      updateFormHeadings();
      setStatus("Ihale duzenleme penceresi acildi.", "ok");
      return;
    }

    if (action === "toggle-auction-status") {
      const nextStatusRaw = String(btn.dataset.nextStatus || "").trim().toUpperCase();
      const nextStatus = nextStatusRaw === "PASSIVE" ? "PASSIVE" : nextStatusRaw === "ACTIVE" ? "ACTIVE" : "";
      if (!nextStatus) return;
      await safeAction(btn, async () => {
        await apiFetch(`/api/admin/auctions/${encodeURIComponent(auctionId)}/status`, {
          method: "POST",
          body: { status: nextStatus },
        });
        await loadAuctions();
        renderAuctions();
        renderStats();
        setStatus(nextStatus === "PASSIVE" ? "Ihale pasife alindi." : "Ihale aktif edildi.", "ok");
      });
      return;
    }

    if (action === "delete-auction") {
      if (!confirm(`"${auction.lot_no}" nolu ihaleyi silmek istiyor musunuz?`)) return;
      await safeAction(btn, async () => {
        await apiFetch(`/api/admin/auctions/${encodeURIComponent(auctionId)}`, { method: "DELETE" });
        await loadAuctions();
        renderAuctions();
        renderStats();
        setStatus("Ihale silindi.", "ok");
      });
    }
  });
}

async function loadUsers() {
  const data = await apiFetch("/api/admin/users");
  state.users = Array.isArray(data.items) ? data.items : [];
}

async function loadCatalog() {
  const data = await apiFetch("/api/admin/catalog");
  state.groups = Array.isArray(data.groups) ? data.groups : [];
  state.categories = Array.isArray(data.categories) ? data.categories : [];
}

async function loadAuctions() {
  const data = await apiFetch("/api/admin/auctions");
  state.auctions = Array.isArray(data.items) ? data.items : [];
}

function renderAll() {
  renderStats();
  renderTabs();
  renderUsers();
  renderCatalog();
  renderAuctions();
  renderSettings();
  syncVehicleConditionLayoutControls();
  refreshAuctionLocationSelects(String(elements.auctionCityInput.value || "").trim());
  refreshAuctionVehicleSelects(
    String(elements.auctionVehicleBrandInput.value || "").trim(),
    String(elements.auctionVehicleModelInput.value || "").trim()
  );
  if (!String(elements.auctionIdInput.value || "").trim()) {
    resetAuctionForm();
  }
  updateFormHeadings();
}

function renderTabs() {
  const buttons = Array.from(elements.tabs.querySelectorAll("button[data-tab]")) as HTMLButtonElement[];
  for (const button of buttons) {
    const tab = String(button.dataset.tab || "");
    button.classList.toggle("active", tab === state.activeTab);
  }

  elements.panelUsers.classList.toggle("hide", state.activeTab !== "users");
  elements.panelCatalog.classList.toggle("hide", state.activeTab !== "catalog");
  elements.panelAuctions.classList.toggle("hide", state.activeTab !== "auctions");
  elements.panelReports.classList.toggle("hide", state.activeTab !== "reports");
  elements.panelSettings.classList.toggle("hide", state.activeTab !== "settings");
  elements.panelLogs.classList.toggle("hide", state.activeTab !== "logs");
  elements.searchInput.parentElement?.classList.toggle("hide", state.activeTab !== "users");
  if (state.activeTab !== "auctions") {
    hideAuctionForm();
  }
}

function renderStats() {
  const totalUsers = state.users.length;
  const managerCount = state.users.filter((x: any) => x.role === ROLE_ADMIN || x.role === ROLE_MANAGER).length;
  const disabledUsers = state.users.filter((x: any) => x.isDisabled === true).length;
  elements.statTotalUsers.textContent = String(totalUsers);
  elements.statManagers.textContent = String(managerCount);
  elements.statDisabledUsers.textContent = String(disabledUsers);
  elements.statGroups.textContent = String(state.groups.length);
  elements.statCategories.textContent = String(state.categories.length);
  elements.statAuctions.textContent = String(state.auctions.length);
}

function renderUsers() {
  const users = filterUsers(state.users, state.query);
  if (users.length < 1) {
    elements.userList.innerHTML = '<div class="emptyState">Filtreye uygun kullanici bulunamadi.</div>';
    elements.userDetail.innerHTML = '<div class="usersDetailEmpty">Kullanici secildiginde yetki ayarlari burada gorunur.</div>';
    return;
  }

  const selectedUserId = String(state.selectedUserId || "");
  const selectedExists = users.some((user: any) => String(user.id || "") === selectedUserId);
  if (!selectedExists) {
    state.selectedUserId = String(users[0].id || "");
  }

  const selected = users.find((user: any) => String(user.id || "") === String(state.selectedUserId || "")) || users[0];
  elements.userList.innerHTML = users
    .map((user: any) => renderUserListItem(user, String(user.id || "") === String(state.selectedUserId || "")))
    .join("");
  elements.userDetail.innerHTML = renderUserDetail(selected);
}

function renderUserListItem(user: any, isSelected: boolean) {
  const status = user.isDisabled ? "Pasif" : "Aktif";
  return `
    <div class="userListItem ${isSelected ? "active" : ""}" data-action="select-user" data-user-id="${escapeHtml(user.id || "")}" role="button" tabindex="0">
      <div class="userLineTop">${escapeHtml(user.name || "Isimsiz")}</div>
      <div class="userLineMeta">${escapeHtml(user.email || "-")}</div>
      <div class="userLineMeta">${escapeHtml(normalizeRole(user.role).toUpperCase())} | ${status}</div>
    </div>
  `;
}

function renderUserDetail(user: any) {
  const permissions = user.permissions || {};
  const role = normalizeRole(user.role);
  const isAdminUser = role === ROLE_ADMIN;
  const roleBadgeClass = `role-${role}`;
  const statusBadge = user.isDisabled
    ? '<span class="badge danger">Pasif</span>'
    : '<span class="badge ok">Aktif</span>';
  const verifiedBadge = user.emailVerified
    ? '<span class="badge ok">E-posta Onayli</span>'
    : '<span class="badge danger">E-posta Onaysiz</span>';
  const statusBtnClass = user.isDisabled ? "miniBtn success" : "miniBtn danger";
  const statusBtnText = user.isDisabled ? "Aktif Et" : "Pasife Al";

  const permissionRows = state.permissionDefs
    .map((perm: any) => {
      const enabled = permissions[perm.key] === true;
      const stateLabel = isAdminUser ? "Sabit" : enabled ? "Acik" : "Kapali";
      return `
        <div class="permissionRow">
          <div class="permissionInfo">
            <div class="permissionLabel">${escapeHtml(perm.label)}</div>
            <div class="permissionMeta">${stateLabel}</div>
          </div>
          <label class="switch ${isAdminUser ? "locked" : ""}">
            <input class="switchInput" type="checkbox" data-action="toggle-permission" data-user-id="${escapeHtml(
              user.id
            )}" data-permission-key="${escapeHtml(perm.key)}" ${enabled ? "checked" : ""} ${isAdminUser ? "disabled" : ""}>
            <span class="switchTrack"><span class="switchThumb"></span></span>
          </label>
        </div>
      `;
    })
    .join("");

  return `
    <div class="userDetailHead">
      <div>
        <div class="nameLine">${escapeHtml(user.name || "Isimsiz")} ${statusBadge} ${verifiedBadge}</div>
        <div class="userEmail">${escapeHtml(user.email || "-")}</div>
        <div class="metaLine">ID: ${escapeHtml(user.id || "-")} | Kayit: ${formatDate(user.createdAt)}</div>
      </div>
      <div class="badges">
        <span class="badge ${roleBadgeClass}">${role.toUpperCase()}</span>
        <select class="roleSelect" data-action="change-role" data-user-id="${escapeHtml(user.id)}" ${
          isAdminUser ? "disabled" : ""
        }>
          <option value="member" ${role === ROLE_MEMBER ? "selected" : ""}>Standart</option>
          <option value="manager" ${role === ROLE_MANAGER ? "selected" : ""}>Yonetici</option>
          <option value="admin" ${role === ROLE_ADMIN ? "selected" : ""}>Admin</option>
        </select>
      </div>
    </div>
    <div class="actionBar">
      <button class="${statusBtnClass}" data-action="toggle-status" data-user-id="${escapeHtml(user.id)}" data-disabled="${
        user.isDisabled ? "true" : "false"
      }">${statusBtnText}</button>
      <button class="miniBtn" data-action="revoke-sessions" data-user-id="${escapeHtml(
        user.id
      )}">Oturumlari Sonlandir</button>
    </div>
    <div class="userSection">
      <h4 class="sectionTitle">Yetkiler</h4>
      <div class="permissionList">${permissionRows}</div>
    </div>
    <div class="userSection">
      <h4 class="sectionTitle">Sifre Islemleri</h4>
      <form class="passwordForm" data-action="change-password" data-user-id="${escapeHtml(user.id)}">
        <div class="passwordGrid">
          <input type="password" name="newPassword" minlength="8" autocomplete="new-password" placeholder="Yeni sifre (min 8)">
          <input type="password" name="confirmPassword" minlength="8" autocomplete="new-password" placeholder="Yeni sifre (tekrar)">
        </div>
        <div class="passwordActions">
          <button class="miniBtn success" type="submit">Sifreyi Degistir</button>
          <span class="passwordHint">Kayit sonrasi kullanicinin aktif oturumlari kapatilir.</span>
        </div>
      </form>
    </div>
  `;
}

function renderCatalog() {
  fillGroupSelect(elements.categoryGroupSelect, true);
  if (!String(elements.categoryGroupSelect.value || "").trim()) {
    const firstActiveGroup = state.groups.find((x: any) => Number(x.is_active || 0) === 1) || state.groups[0] || null;
    if (firstActiveGroup) {
      elements.categoryGroupSelect.value = String(firstActiveGroup.id || "");
    }
  }
  fillGroupSelect(elements.auctionGroupSelect, false);
  ensureAuctionSelectionDefaults();
  fillAuctionCategorySelect();

  const q = String(state.catalogQuery || "").trim().toLowerCase();
  const groupNameById = new Map(state.groups.map((g: any) => [g.id, g.name]));
  const orderedGroups = getOrderedGroups();
  const orderedGroupIndex = new Map<string, number>(orderedGroups.map((group: any, index: number) => [String(group.id || ""), index]));
  const orderedCategories = getOrderedCategories();
  const orderedCategoryIndex = new Map<string, number>(
    orderedCategories.map((category: any, index: number) => [String(category.id || ""), index])
  );
  const groups = state.groups.filter((group: any) => {
    if (!q) return true;
    return String(group.name || "").toLowerCase().includes(q);
  });
  const categories = state.categories.filter((category: any) => {
    if (!q) return true;
    const categoryName = String(category.name || "").toLowerCase();
    const groupName = String(groupNameById.get(category.group_id) || "").toLowerCase();
    return categoryName.includes(q) || groupName.includes(q);
  });

  if (groups.length < 1) {
    elements.groupRows.innerHTML = '<tr><td colspan="3"><div class="emptyState">Filtreye uygun urun grubu bulunamadi.</div></td></tr>';
  } else {
    elements.groupRows.innerHTML = groups
    .map((group: any) => {
      const active = Number(group.is_active || 0) === 1;
      const groupIndex = Number(orderedGroupIndex.get(String(group.id || "")));
      const isFirst = !Number.isFinite(groupIndex) || groupIndex <= 0;
      const isLast = !Number.isFinite(groupIndex) || groupIndex >= orderedGroups.length - 1;
      return `
        <tr>
          <td>${escapeHtml(group.name || "-")}<div class="metaLine">Sira: ${Number(group.sort_order || 0)}</div></td>
          <td><span class="pill ${active ? "ok" : "danger"}">${active ? "Aktif" : "Pasif"}</span></td>
          <td>
            <div class="rowActions auctionRowActions">
              <button class="miniBtn iconBtn" data-action="move-group-up" data-id="${escapeHtml(group.id)}" title="Yukari tasi" ${isFirst ? "disabled" : ""}><i class="fas fa-arrow-up"></i></button>
              <button class="miniBtn iconBtn" data-action="move-group-down" data-id="${escapeHtml(group.id)}" title="Asagi tasi" ${isLast ? "disabled" : ""}><i class="fas fa-arrow-down"></i></button>
              <button class="miniBtn" data-action="rename-group" data-id="${escapeHtml(group.id)}">Adi Duzenle</button>
              <button class="miniBtn" data-action="toggle-group" data-id="${escapeHtml(group.id)}">${
                active ? "Pasif Et" : "Aktif Et"
              }</button>
              <button class="miniBtn danger" data-action="delete-group" data-id="${escapeHtml(group.id)}">Sil</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
  }

  if (categories.length < 1) {
    elements.categoryRows.innerHTML =
      '<tr><td colspan="4"><div class="emptyState">Filtreye uygun kategori bulunamadi.</div></td></tr>';
  } else {
    elements.categoryRows.innerHTML = categories
      .map((category: any) => {
        const active = Number(category.is_active || 0) === 1;
        const categoryIndex = Number(orderedCategoryIndex.get(String(category.id || "")));
        const isFirst = !Number.isFinite(categoryIndex) || categoryIndex <= 0;
        const isLast = !Number.isFinite(categoryIndex) || categoryIndex >= orderedCategories.length - 1;
        return `
          <tr>
            <td>${escapeHtml(category.name || "-")}<div class="metaLine">Sira: ${Number(category.sort_order || 0)}</div></td>
            <td>${escapeHtml(groupNameById.get(category.group_id) || "-")}</td>
            <td><span class="pill ${active ? "ok" : "danger"}">${active ? "Aktif" : "Pasif"}</span></td>
            <td>
              <div class="rowActions">
                <button class="miniBtn iconBtn" data-action="move-category-up" data-id="${escapeHtml(category.id)}" title="Yukari tasi" ${isFirst ? "disabled" : ""}><i class="fas fa-arrow-up"></i></button>
                <button class="miniBtn iconBtn" data-action="move-category-down" data-id="${escapeHtml(category.id)}" title="Asagi tasi" ${isLast ? "disabled" : ""}><i class="fas fa-arrow-down"></i></button>
                <button class="miniBtn" data-action="rename-category" data-id="${escapeHtml(category.id)}">Adi Duzenle</button>
                <button class="miniBtn" data-action="toggle-category" data-id="${escapeHtml(category.id)}">${
                  active ? "Pasif Et" : "Aktif Et"
                }</button>
                <button class="miniBtn danger" data-action="delete-category" data-id="${escapeHtml(category.id)}">Sil</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
  }
}

function renderSettings() {
  if (!elements.filterOrderForm) return;
  const normalized = normalizeFilterOrderingPayload(state.filterOrdering);
  const selected: any = normalized.order || {};
  const options: any = normalized.options || {};

  setTextControlValue(
    elements.filterOrderGroups,
    formatOrderListForEditor(selected.productGroups?.length > 0 ? selected.productGroups : options.productGroups)
  );
  setTextControlValue(
    elements.filterOrderCategories,
    formatOrderListForEditor(selected.categories?.length > 0 ? selected.categories : options.categories)
  );
  setTextControlValue(
    elements.filterOrderCities,
    formatOrderListForEditor(selected.cities?.length > 0 ? selected.cities : options.cities)
  );
  setTextControlValue(
    elements.filterOrderDistricts,
    formatOrderListForEditor(selected.districts?.length > 0 ? selected.districts : options.districts)
  );
  setTextControlValue(
    elements.filterOrderNeighborhoods,
    formatOrderListForEditor(selected.neighborhoods?.length > 0 ? selected.neighborhoods : options.neighborhoods)
  );
}

function fillFilterOrderEditorWithOptions(options: any) {
  const safeOptions = options || {};
  setTextControlValue(elements.filterOrderGroups, formatOrderListForEditor(safeOptions.productGroups || []));
  setTextControlValue(elements.filterOrderCategories, formatOrderListForEditor(safeOptions.categories || []));
  setTextControlValue(elements.filterOrderCities, formatOrderListForEditor(safeOptions.cities || []));
  setTextControlValue(elements.filterOrderDistricts, formatOrderListForEditor(safeOptions.districts || []));
  setTextControlValue(elements.filterOrderNeighborhoods, formatOrderListForEditor(safeOptions.neighborhoods || []));
}

function compareBySortOrderThenName(a: any, b: any) {
  const sortA = Number(a?.sort_order || 0);
  const sortB = Number(b?.sort_order || 0);
  if (sortA !== sortB) return sortA - sortB;
  const nameA = String(a?.name || "");
  const nameB = String(b?.name || "");
  const byName = nameA.localeCompare(nameB, "tr");
  if (byName !== 0) return byName;
  return String(a?.id || "").localeCompare(String(b?.id || ""), "tr");
}

function getOrderedGroups() {
  return [...(Array.isArray(state.groups) ? state.groups : [])].sort(compareBySortOrderThenName);
}

function getOrderedCategories() {
  return [...(Array.isArray(state.categories) ? state.categories : [])].sort(compareBySortOrderThenName);
}

async function moveGroupSortOrder(groupId: string, direction: -1 | 1) {
  const ordered = getOrderedGroups();
  const fromIndex = ordered.findIndex((row: any) => String(row.id || "") === String(groupId || ""));
  if (fromIndex < 0) return false;
  const targetIndex = fromIndex + direction;
  if (targetIndex < 0 || targetIndex >= ordered.length) return false;
  const [moved] = ordered.splice(fromIndex, 1);
  ordered.splice(targetIndex, 0, moved);
  await persistGroupOrder(ordered);
  return true;
}

async function moveCategorySortOrder(categoryId: string, direction: -1 | 1) {
  const ordered = getOrderedCategories();
  const fromIndex = ordered.findIndex((row: any) => String(row.id || "") === String(categoryId || ""));
  if (fromIndex < 0) return false;
  const targetIndex = fromIndex + direction;
  if (targetIndex < 0 || targetIndex >= ordered.length) return false;
  const [moved] = ordered.splice(fromIndex, 1);
  ordered.splice(targetIndex, 0, moved);
  await persistCategoryOrder(ordered);
  return true;
}

async function persistGroupOrder(orderedGroups: any[]) {
  for (let index = 0; index < orderedGroups.length; index += 1) {
    const groupId = String(orderedGroups[index]?.id || "").trim();
    if (!groupId) continue;
    await apiFetch(`/api/admin/product-groups/${encodeURIComponent(groupId)}`, {
      method: "PUT",
      body: { sortOrder: (index + 1) * 10 },
    });
  }
}

async function persistCategoryOrder(orderedCategories: any[]) {
  for (let index = 0; index < orderedCategories.length; index += 1) {
    const categoryId = String(orderedCategories[index]?.id || "").trim();
    if (!categoryId) continue;
    await apiFetch(`/api/admin/categories/${encodeURIComponent(categoryId)}`, {
      method: "PUT",
      body: { sortOrder: (index + 1) * 10 },
    });
  }
}

function formatOrderListForEditor(values: any[]): string {
  if (!Array.isArray(values) || values.length < 1) return "";
  return values.map((item) => String(item || "").trim()).filter(Boolean).join("\n");
}

function parseOrderListInput(raw: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const part of String(raw || "").split(/\r?\n|,/g)) {
    const value = String(part || "").trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

function readTextControlValue(control: any) {
  if (!control || typeof control.value === "undefined") return "";
  return String(control.value || "");
}

function setTextControlValue(control: any, value: string) {
  if (!control || typeof control.value === "undefined") return;
  control.value = String(value || "");
}

function normalizeFilterOrderingPayload(input: any) {
  const empty = {
    productGroups: [],
    categories: [],
    cities: [],
    districts: [],
    neighborhoods: [],
    districtsByCity: {},
  };
  const payload = input && typeof input === "object" ? input : {};
  const order = payload.order && typeof payload.order === "object" ? payload.order : empty;
  const options = payload.options && typeof payload.options === "object" ? payload.options : empty;
  return {
    order: {
      productGroups: Array.isArray(order.productGroups) ? order.productGroups : [],
      categories: Array.isArray(order.categories) ? order.categories : [],
      cities: Array.isArray(order.cities) ? order.cities : [],
      districts: Array.isArray(order.districts) ? order.districts : [],
      neighborhoods: Array.isArray(order.neighborhoods) ? order.neighborhoods : [],
    },
    options: {
      productGroups: Array.isArray(options.productGroups) ? options.productGroups : [],
      categories: Array.isArray(options.categories) ? options.categories : [],
      cities: Array.isArray(options.cities) ? options.cities : [],
      districts: Array.isArray(options.districts) ? options.districts : [],
      neighborhoods: Array.isArray(options.neighborhoods) ? options.neighborhoods : [],
      districtsByCity: normalizeDistrictsByCityMap(options.districtsByCity),
    },
  };
}

function renderAuctions() {
  fillGroupSelect(elements.auctionGroupSelect, false);
  ensureAuctionSelectionDefaults();
  fillAuctionCategorySelect();
  renderAuctionVehicleSection();

  const q = String(state.auctionQuery || "").trim().toLowerCase();
  const auctions = state.auctions.filter((auction: any) => {
    if (!q) return true;
    const haystack = [
      auction.lot_no,
      auction.title,
      auction.product_group,
      auction.category,
      auction.city,
      auction.district,
      auction.neighborhood,
      auction.vehicle_brand,
      auction.vehicle_model,
      auction.vehicle_model_detail,
      auction.vehicle_chassis_no,
      auction.status,
    ]
      .map((item: any) => String(item || "").toLowerCase())
      .join(" ");
    return haystack.includes(q);
  });

  if (auctions.length < 1) {
    elements.auctionRows.innerHTML = '<tr><td colspan="8"><div class="emptyState">Kayitli ihale bulunamadi.</div></td></tr>';
    return;
  }

  elements.auctionRows.innerHTML = auctions
    .map((auction: any) => {
      const statusKey = String(auction.status || "").toUpperCase();
      const statusClass = statusKey === "ACTIVE" ? "ok" : statusKey === "PASSIVE" ? "warn" : "danger";
      const canToggleActivePassive = statusKey === "ACTIVE" || statusKey === "PASSIVE";
      const nextStatus = statusKey === "PASSIVE" ? "ACTIVE" : "PASSIVE";
      const nextStatusLabel = statusKey === "PASSIVE" ? "Aktif Et" : "Pasif Et";
      return `
        <tr>
          <td>${escapeHtml(auction.lot_no || "-")}</td>
          <td>${escapeHtml(auction.title || "-")}</td>
          <td>${escapeHtml(`${auction.product_group || "-"} / ${auction.category || "-"}`)}</td>
          <td>${formatMoney(auction.start_price)}</td>
          <td>${formatDate(auction.starts_at)}</td>
          <td>${formatDate(auction.ends_at)}</td>
          <td><span class="pill ${statusClass}">${escapeHtml(
            formatAuctionStatus(auction.status)
          )}</span></td>
          <td>
            <div class="rowActions auctionRowActions">
              ${
                canToggleActivePassive
                  ? `<button class="miniBtn ${statusKey === "PASSIVE" ? "success" : ""}" data-action="toggle-auction-status" data-id="${escapeHtml(
                      auction.id
                    )}" data-next-status="${escapeHtml(nextStatus)}">${nextStatusLabel}</button>`
                  : ""
              }
              <button class="miniBtn" data-action="edit-auction" data-id="${escapeHtml(auction.id)}">Duzenle</button>
              <button class="miniBtn danger" data-action="delete-auction" data-id="${escapeHtml(auction.id)}">Sil</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function fillGroupSelect(select: HTMLSelectElement, includeEmpty: boolean) {
  const currentValue = String(select.value || "");
  select.innerHTML = "";
  if (includeEmpty) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Urun grubu secin";
    select.appendChild(opt);
  }
  for (const group of state.groups) {
    const option = document.createElement("option");
    option.value = group.id;
    option.textContent = `${group.name}${Number(group.is_active || 0) === 1 ? "" : " (Pasif)"}`;
    select.appendChild(option);
  }
  if (currentValue) select.value = currentValue;
}

function fillAuctionCategorySelect() {
  const groupId = String(elements.auctionGroupSelect.value || "");
  const currentValue = String(elements.auctionCategorySelect.value || "");
  elements.auctionCategorySelect.innerHTML = "";

  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = "Kategori secin";
  elements.auctionCategorySelect.appendChild(emptyOption);

  const rows = state.categories.filter((x: any) => !groupId || x.group_id === groupId);
  for (const category of rows) {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = `${category.name}${Number(category.is_active || 0) === 1 ? "" : " (Pasif)"}`;
    elements.auctionCategorySelect.appendChild(option);
  }
  if (currentValue) elements.auctionCategorySelect.value = currentValue;
  if (!elements.auctionCategorySelect.value) {
    const options = Array.from(elements.auctionCategorySelect.options) as HTMLOptionElement[];
    const first = options.find((opt) => String(opt.value || "").trim().length > 0);
    if (first) elements.auctionCategorySelect.value = String(first.value || "");
  }
}

function refillSimpleSelect(select: HTMLSelectElement, values: string[], placeholder: string) {
  const currentValue = String(select.value || "");
  select.innerHTML = "";
  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = placeholder;
  select.appendChild(emptyOption);

  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  }
  if (currentValue) select.value = currentValue;
}

function normalizeLooseText(value: any): string {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function uniqueTextValues(values: any[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of values || []) {
    const value = String(raw || "").trim();
    if (!value) continue;
    const key = normalizeLooseText(value);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

function findMatchingTextValue(values: string[], targetRaw: any): string {
  const target = String(targetRaw || "").trim();
  if (!target) return "";
  if (values.includes(target)) return target;
  const targetKey = normalizeLooseText(target);
  return values.find((value) => normalizeLooseText(value) === targetKey) || "";
}

function normalizeDistrictsByCityMap(rawMap: any): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  if (!rawMap || typeof rawMap !== "object") return out;
  for (const [cityRaw, districtsRaw] of Object.entries(rawMap)) {
    const city = String(cityRaw || "").trim();
    if (!city) continue;
    out[city] = uniqueTextValues(Array.isArray(districtsRaw) ? districtsRaw : []);
  }
  return out;
}

function getAuctionCityOptions(): string[] {
  const fromOptions = uniqueTextValues(state.filterOrdering?.options?.cities || []);
  const fromAuctions = uniqueTextValues(state.auctions.map((row: any) => row.city));
  return uniqueTextValues([...fromOptions, ...fromAuctions]).sort((a, b) => a.localeCompare(b, "tr"));
}

function getAuctionDistrictOptionsForCity(cityRaw: any): string[] {
  const city = String(cityRaw || "").trim();
  if (!city) return [];
  const cityKey = normalizeLooseText(city);
  const byCity = normalizeDistrictsByCityMap(state.filterOrdering?.options?.districtsByCity || {});

  for (const [candidateCity, districts] of Object.entries(byCity)) {
    if (normalizeLooseText(candidateCity) !== cityKey) continue;
    return uniqueTextValues(Array.isArray(districts) ? districts : []).sort((a, b) => a.localeCompare(b, "tr"));
  }

  const fromAuctions = uniqueTextValues(
    state.auctions
      .filter((row: any) => normalizeLooseText(row.city) === cityKey)
      .map((row: any) => String(row.district || "").trim())
  );
  return fromAuctions.sort((a, b) => a.localeCompare(b, "tr"));
}

function getAuctionVehicleBrands(): string[] {
  const brandsFromCatalog = Object.keys(VEHICLE_BRAND_MODEL_CATALOG);
  const brandsFromAuctions = state.auctions.map((row: any) => String(row.vehicle_brand || "").trim());
  return uniqueTextValues([...brandsFromCatalog, ...brandsFromAuctions]).sort((a, b) => a.localeCompare(b, "tr"));
}

function getAuctionVehicleModelsForBrand(brandRaw: any): string[] {
  const brand = String(brandRaw || "").trim();
  if (!brand) return [];

  const brandKey = normalizeLooseText(brand);
  const modelsFromCatalog = Object.entries(VEHICLE_BRAND_MODEL_CATALOG)
    .filter(([candidate]) => normalizeLooseText(candidate) === brandKey)
    .flatMap(([, models]) => (Array.isArray(models) ? models : []));
  const modelsFromAuctions = state.auctions
    .filter((row: any) => normalizeLooseText(row.vehicle_brand) === brandKey)
    .map((row: any) => String(row.vehicle_model || "").trim());
  return uniqueTextValues([...modelsFromCatalog, ...modelsFromAuctions]).sort((a, b) => a.localeCompare(b, "tr"));
}

function fillAuctionCitySelect(preferredCity = "") {
  const values = getAuctionCityOptions();
  refillSimpleSelect(elements.auctionCityInput, values, "Il seciniz");
  const matched = findMatchingTextValue(values, preferredCity);
  elements.auctionCityInput.value = matched || "";
}

function fillAuctionDistrictSelect(preferredDistrict = "") {
  const cityValue = String(elements.auctionCityInput.value || "").trim();
  const values = getAuctionDistrictOptionsForCity(cityValue);
  const placeholder = cityValue ? "Ilce seciniz" : "Once il seciniz";
  refillSimpleSelect(elements.auctionDistrictInput, values, placeholder);
  elements.auctionDistrictInput.disabled = !cityValue;
  const matched = cityValue ? findMatchingTextValue(values, preferredDistrict) : "";
  elements.auctionDistrictInput.value = matched || "";
}

function fillAuctionVehicleBrandSelect(preferredBrand = "") {
  const values = getAuctionVehicleBrands();
  refillSimpleSelect(elements.auctionVehicleBrandInput, values, "Marka seciniz");
  const matched = findMatchingTextValue(values, preferredBrand);
  elements.auctionVehicleBrandInput.value = matched || "";
}

function fillAuctionVehicleModelSelect(preferredModel = "") {
  const brandValue = String(elements.auctionVehicleBrandInput.value || "").trim();
  const values = getAuctionVehicleModelsForBrand(brandValue);
  refillSimpleSelect(elements.auctionVehicleModelInput, values, "Model seciniz");
  elements.auctionVehicleModelInput.disabled = !brandValue;
  const matched = brandValue ? findMatchingTextValue(values, preferredModel) : "";
  elements.auctionVehicleModelInput.value = matched || "";
}

function refreshAuctionLocationSelects(preferredCity = "") {
  const currentCity = preferredCity || String(elements.auctionCityInput.value || "").trim();
  fillAuctionCitySelect(currentCity);
  fillAuctionDistrictSelect("");
  elements.auctionDistrictInput.value = "";
  elements.auctionNeighborhoodInput.value = "";
}

function refreshAuctionVehicleSelects(preferredBrand = "", preferredModel = "") {
  const currentBrand = preferredBrand || String(elements.auctionVehicleBrandInput.value || "").trim();
  const currentModel = preferredModel || String(elements.auctionVehicleModelInput.value || "").trim();
  fillAuctionVehicleBrandSelect(currentBrand);
  fillAuctionVehicleModelSelect(currentModel);
}

function fillAuctionForm(auction: any) {
  clearAuctionFieldErrors();
  elements.auctionIdInput.value = String(auction.id || "");
  elements.auctionLotNoInput.value = String(auction.lot_no || "");
  elements.auctionTitleInput.value = String(auction.title || "");
  elements.auctionGroupSelect.value = String(auction.product_group_id || "");
  fillAuctionCategorySelect();
  elements.auctionCategorySelect.value = String(auction.category_id || "");
  renderAuctionVehicleSection();
  elements.auctionStartPriceInput.value = String(Number(auction.start_price || 0));
  elements.auctionMinIncrementInput.value = String(Number(auction.min_increment || 1000));
  elements.auctionStatusInput.value = String(auction.status || "ACTIVE");
  elements.auctionStartsAtInput.value = toDateTimeLocal(auction.starts_at || auction.created_at || "");
  elements.auctionEndsAtInput.value = toDateTimeLocal(auction.ends_at);
  state.auctionImageDataUrls = normalizeAuctionImageList(auction.gallery_json || auction.gallery || auction.images || []);
  if (state.auctionImageDataUrls.length < 1) {
    const legacyImage = String(auction.image_url || "").trim();
    if (legacyImage) state.auctionImageDataUrls = [legacyImage];
  }
  renderAuctionImageGallery();
  refreshAuctionLocationSelects(String(auction.city || ""));
  elements.auctionNeighborhoodInput.value = "";
  elements.auctionDescriptionInput.value = String(auction.description || "");
  elements.auctionExtraEquipmentInput.value = String(auction.extra_equipment || auction.extraEquipment || "");
  state.auctionExpertiseFiles = [];
  state.auctionDocumentFiles = normalizeUploadedFileList(auction.document_files_json || auction.documentFiles || []);
  renderAuctionFileList("expertise");
  renderAuctionFileList("document");
  refreshAuctionVehicleSelects(String(auction.vehicle_brand || ""), String(auction.vehicle_model || ""));
  elements.auctionVehicleModelDetailInput.value = String(auction.vehicle_model_detail || "");
  elements.auctionVehicleYearInput.value = String(auction.vehicle_year || "");
  elements.auctionVehicleKmInput.value = String(auction.vehicle_km || "");
  elements.auctionVehicleFuelTypeInput.value = String(auction.vehicle_fuel_type || "");
  elements.auctionVehicleTransmissionInput.value = String(auction.vehicle_transmission || "");
  elements.auctionVehicleBodyTypeInput.value = String(auction.vehicle_body_type || "");
  elements.auctionVehicleColorInput.value = String(auction.vehicle_color || "");
  elements.auctionVehicleChassisNoInput.value = String(auction.vehicle_chassis_no || "");
  elements.auctionVehicleEngineVolumeInput.value = String(auction.vehicle_engine_volume || "");
  elements.auctionVehicleEnginePowerInput.value = String(auction.vehicle_engine_power || "");
  elements.auctionVehicleDriveTypeInput.value = String(auction.vehicle_drive_type || "");
  state.auctionVehicleConditionMap = normalizeVehicleConditionMap(
    auction.vehicle_condition_map_json || auction.vehicle_condition_map || auction.vehicleConditionMap || {}
  );
  state.auctionVehicleConditionSelectedStatus = VEHICLE_CONDITION_DEFAULT_STATUS;
  renderAuctionVehicleConditionMap();
  syncVehicleConditionLayoutControls();
  fillVehicleExpertiseMetaForm(
    normalizeVehicleExpertiseMeta(
      auction.vehicle_expertise_meta_json || auction.vehicle_expertise_meta || auction.vehicleExpertiseMeta || {}
    )
  );
  updateFormHeadings();
}

function readAuctionFormPayload() {
  const startsAtLocal = String(elements.auctionStartsAtInput.value || "").trim();
  const endsAtLocal = String(elements.auctionEndsAtInput.value || "").trim();
  const imageList = normalizeAuctionImageList(state.auctionImageDataUrls || []);
  return {
    lotNo: String(elements.auctionLotNoInput.value || "").trim().toUpperCase(),
    title: String(elements.auctionTitleInput.value || "").trim(),
    groupId: String(elements.auctionGroupSelect.value || "").trim(),
    categoryId: String(elements.auctionCategorySelect.value || "").trim(),
    startPrice: Number(elements.auctionStartPriceInput.value || 0),
    minIncrement: Number(elements.auctionMinIncrementInput.value || 0),
    status: String(elements.auctionStatusInput.value || "ACTIVE"),
    startsAt: toIsoFromDateTimeLocal(startsAtLocal),
    endsAt: toIsoFromDateTimeLocal(endsAtLocal),
    city: String(elements.auctionCityInput.value || "").trim(),
    district: "",
    neighborhood: "",
    description: String(elements.auctionDescriptionInput.value || "").trim(),
    extraEquipment: "",
    vehicleBrand: String(elements.auctionVehicleBrandInput.value || "").trim(),
    vehicleModel: String(elements.auctionVehicleModelInput.value || "").trim(),
    vehicleModelDetail: String(elements.auctionVehicleModelDetailInput.value || "").trim(),
    vehicleYear: Number(elements.auctionVehicleYearInput.value || 0),
    vehicleKm: Number(elements.auctionVehicleKmInput.value || 0),
    vehicleFuelType: String(elements.auctionVehicleFuelTypeInput.value || "").trim(),
    vehicleTransmission: String(elements.auctionVehicleTransmissionInput.value || "").trim(),
    vehicleBodyType: String(elements.auctionVehicleBodyTypeInput.value || "").trim(),
    vehicleColor: String(elements.auctionVehicleColorInput.value || "").trim(),
    vehicleChassisNo: String(elements.auctionVehicleChassisNoInput.value || "").trim(),
    vehicleEngineVolume: String(elements.auctionVehicleEngineVolumeInput.value || "").trim(),
    vehicleEnginePower: String(elements.auctionVehicleEnginePowerInput.value || "").trim(),
    vehicleDriveType: String(elements.auctionVehicleDriveTypeInput.value || "").trim(),
    vehicleConditionMap: normalizeVehicleConditionMap(state.auctionVehicleConditionMap || {}),
    vehicleExpertiseMeta: readVehicleExpertiseMetaFromForm(),
    imageUrl: imageList[0] || "",
    images: imageList,
    expertiseFiles: [],
    documentFiles: normalizeUploadedFileList(state.auctionDocumentFiles || []),
  };
}

function readVehicleExpertiseMetaFromForm(): VehicleExpertiseMeta {
  const structure: Partial<Record<VehicleExpertiseStructureKey, VehicleExpertiseStructureStatus>> = {};
  for (const field of VEHICLE_EXPERTISE_STRUCTURE_FIELDS) {
    const select = VEHICLE_EXPERTISE_STRUCTURE_INPUTS[field.key];
    const normalized = normalizeVehicleExpertiseStructureStatus(select?.value);
    if (!normalized || normalized === VEHICLE_EXPERTISE_STRUCTURE_DEFAULT_STATUS) continue;
    structure[field.key] = normalized;
  }

  const mechanical: Partial<Record<VehicleExpertiseMechanicalKey, VehicleExpertiseMechanicalStatus>> = {};
  for (const field of VEHICLE_EXPERTISE_MECHANICAL_FIELDS) {
    const select = VEHICLE_EXPERTISE_MECHANICAL_INPUTS[field.key];
    const normalized = normalizeVehicleExpertiseMechanicalStatus(select?.value);
    if (!normalized || normalized === VEHICLE_EXPERTISE_MECHANICAL_DEFAULT_STATUS) continue;
    mechanical[field.key] = normalized;
  }

  const tireStatus = normalizeVehicleExpertiseTireStatus(elements.expertiseTireGeneralInput?.value);

  const out: VehicleExpertiseMeta = {};
  if (Object.keys(structure).length > 0) out.structure = structure;
  if (Object.keys(mechanical).length > 0) out.mechanical = mechanical;
  if (tireStatus && tireStatus !== VEHICLE_EXPERTISE_TIRE_DEFAULT_STATUS) out.tires = { general: tireStatus };
  return out;
}

function fillVehicleExpertiseMetaForm(input: any) {
  const meta = normalizeVehicleExpertiseMeta(input);
  const structure = meta.structure || {};
  const mechanical = meta.mechanical || {};
  const tireStatus = normalizeVehicleExpertiseTireStatus(meta.tires?.general) || VEHICLE_EXPERTISE_TIRE_DEFAULT_STATUS;

  for (const field of VEHICLE_EXPERTISE_STRUCTURE_FIELDS) {
    const value = normalizeVehicleExpertiseStructureStatus(structure[field.key]) || VEHICLE_EXPERTISE_STRUCTURE_DEFAULT_STATUS;
    const select = VEHICLE_EXPERTISE_STRUCTURE_INPUTS[field.key];
    if (select) select.value = value;
  }

  for (const field of VEHICLE_EXPERTISE_MECHANICAL_FIELDS) {
    const value = normalizeVehicleExpertiseMechanicalStatus(mechanical[field.key]) || VEHICLE_EXPERTISE_MECHANICAL_DEFAULT_STATUS;
    const select = VEHICLE_EXPERTISE_MECHANICAL_INPUTS[field.key];
    if (select) select.value = value;
  }

  if (elements.expertiseTireGeneralInput) {
    elements.expertiseTireGeneralInput.value = tireStatus;
  }
}

function resetVehicleExpertiseMetaForm() {
  for (const field of VEHICLE_EXPERTISE_STRUCTURE_FIELDS) {
    const select = VEHICLE_EXPERTISE_STRUCTURE_INPUTS[field.key];
    if (select) select.value = VEHICLE_EXPERTISE_STRUCTURE_DEFAULT_STATUS;
  }
  for (const field of VEHICLE_EXPERTISE_MECHANICAL_FIELDS) {
    const select = VEHICLE_EXPERTISE_MECHANICAL_INPUTS[field.key];
    if (select) select.value = VEHICLE_EXPERTISE_MECHANICAL_DEFAULT_STATUS;
  }
  if (elements.expertiseTireGeneralInput) {
    elements.expertiseTireGeneralInput.value = VEHICLE_EXPERTISE_TIRE_DEFAULT_STATUS;
  }
}

function markRequiredAuctionLabels() {
  for (const binding of getAllAuctionFieldBindings()) {
    const wrap = binding.element.closest(".fieldWrap");
    if (wrap) wrap.classList.add("requiredField");
  }
}

function clearAuctionFieldErrors() {
  const wraps = Array.from(elements.auctionForm.querySelectorAll(".fieldWrap.invalid")) as HTMLElement[];
  for (const wrap of wraps) {
    wrap.classList.remove("invalid");
  }
  const uploadBlocks = Array.from(elements.auctionForm.querySelectorAll(".uploadBlock.invalid")) as HTMLElement[];
  for (const block of uploadBlocks) {
    block.classList.remove("invalid");
  }
  const hints = Array.from(elements.auctionForm.querySelectorAll(".fieldError")) as HTMLElement[];
  for (const hint of hints) {
    hint.remove();
  }
  const allKeys: AuctionFieldKey[] = [...AUCTION_REQUIRED_FIELD_KEYS, "images", "documentFiles"];
  for (const key of allKeys) {
    const binding = getAuctionFieldBinding(key);
    if (!binding) continue;
    binding.element.removeAttribute("aria-invalid");
  }
}

function showAuctionFieldError(issue: AuctionValidationIssue) {
  const binding = getAuctionFieldBinding(issue.key);
  if (!binding) return;

  binding.element.setAttribute("aria-invalid", "true");
  const wrap = binding.element.closest(".fieldWrap") as HTMLElement | null;
  const block = binding.element.closest(".uploadBlock") as HTMLElement | null;
  const target = wrap || block;
  if (!target) return;

  target.classList.add("invalid");
  let hint = target.querySelector(".fieldError") as HTMLElement | null;
  if (!hint) {
    hint = document.createElement("small");
    hint.className = "fieldError";
    target.appendChild(hint);
  }
  hint.textContent = issue.message;
}

function validateAuctionFormPayload(payload: any): AuctionValidationIssue[] {
  const issues: AuctionValidationIssue[] = [];
  const seen = new Set<string>();
  const addIssue = (key: AuctionFieldKey, message: string) => {
    if (seen.has(key)) return;
    const binding = getAuctionFieldBinding(key);
    if (!binding) return;
    issues.push({ key, label: binding.label, message });
    seen.add(key);
  };

  if (!String(payload.lotNo || "").trim()) addIssue("lotNo", "Ihale no zorunludur.");
  if (!String(payload.title || "").trim()) addIssue("title", "Ihale basligi zorunludur.");
  if (!String(payload.groupId || "").trim()) addIssue("groupId", "Urun grubu secimi zorunludur.");
  if (!String(payload.categoryId || "").trim()) addIssue("categoryId", "Kategori secimi zorunludur.");

  const startsAt = String(payload.startsAt || "").trim();
  const endsAt = String(payload.endsAt || "").trim();
  const startTime = startsAt ? new Date(startsAt).getTime() : Number.NaN;
  const endTime = endsAt ? new Date(endsAt).getTime() : Number.NaN;

  if (!startsAt) addIssue("startsAt", "Baslangic tarihi zorunludur.");
  else if (Number.isNaN(startTime)) addIssue("startsAt", "Baslangic tarihi gecersiz.");

  if (!endsAt) addIssue("endsAt", "Bitis tarihi zorunludur.");
  else if (Number.isNaN(endTime)) addIssue("endsAt", "Bitis tarihi gecersiz.");

  if (!Number.isNaN(startTime) && !Number.isNaN(endTime) && endTime <= startTime) {
    addIssue("endsAt", "Bitis tarihi, baslangic tarihinden sonra olmalidir.");
  }

  if (!Number.isFinite(Number(payload.startPrice)) || Number(payload.startPrice) <= 0) {
    addIssue("startPrice", "Baslangic bedeli sifirdan buyuk olmalidir.");
  }
  if (!Number.isFinite(Number(payload.minIncrement)) || Number(payload.minIncrement) <= 0) {
    addIssue("minIncrement", "Minimum artis sifirdan buyuk olmalidir.");
  }

  const galleryBytes = getGalleryTotalBytes(payload.images || []);
  if (galleryBytes > MAX_AUCTION_GALLERY_TOTAL_BYTES) {
    addIssue("images", `Gorsellerin toplam boyutu cok buyuk. En fazla ${formatBytes(MAX_AUCTION_GALLERY_TOTAL_BYTES)} olabilir.`);
  }

  const documentBytes = getReportTotalBytes(payload.documentFiles || []);
  if (documentBytes > MAX_AUCTION_REPORT_TOTAL_BYTES) {
    addIssue(
      "documentFiles",
      `Dokumanlarin toplam boyutu cok buyuk. En fazla ${formatBytes(MAX_AUCTION_REPORT_TOTAL_BYTES)} olabilir.`
    );
  }

  return issues;
}

function applyAuctionValidationIssues(issues: AuctionValidationIssue[]) {
  if (!Array.isArray(issues) || issues.length < 1) return;
  clearAuctionFieldErrors();
  for (const issue of issues) {
    showAuctionFieldError(issue);
  }
  const labels = Array.from(new Set(issues.map((issue) => issue.label)));
  setStatus(`Lutfen zorunlu alanlari kontrol edin: ${labels.join(", ")}`, "error");

  const firstBinding = getAuctionFieldBinding(issues[0].key);
  if (firstBinding) {
    firstBinding.element.focus();
    if (typeof (firstBinding.element as HTMLInputElement).select === "function") {
      try {
        (firstBinding.element as HTMLInputElement).select();
      } catch {
        // select her input turunde desteklenmeyebilir
      }
    }
  }
}

function normalizeSearchText(value: string) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("ı", "i");
}

function parseAuctionValidationIssuesFromMessage(messageRaw: string): AuctionValidationIssue[] {
  const message = normalizeSearchText(messageRaw);
  const issues: AuctionValidationIssue[] = [];
  const seen = new Set<string>();
  const addIssue = (key: AuctionFieldKey, issueMessage: string) => {
    if (seen.has(key)) return;
    const binding = getAuctionFieldBinding(key);
    if (!binding) return;
    issues.push({ key, label: binding.label, message: issueMessage });
    seen.add(key);
  };

  if (message.includes("ihale no zorunludur") || message.includes("ihale no") && message.includes("kullaniliyor")) {
    addIssue("lotNo", "Ihale no alanini kontrol edin.");
  }
  if (message.includes("ihale basligi zorunludur")) addIssue("title", "Ihale basligi zorunludur.");
  if (message.includes("baslangic bedeli")) addIssue("startPrice", "Baslangic bedeli alanini kontrol edin.");
  if (message.includes("min artis")) addIssue("minIncrement", "Minimum artis alanini kontrol edin.");
  if (message.includes("baslangic tarihi")) addIssue("startsAt", "Baslangic tarihi alanini kontrol edin.");
  if (message.includes("bitis tarihi")) addIssue("endsAt", "Bitis tarihi alanini kontrol edin.");
  if (message.includes("urun grubu") && message.includes("zorunlu")) addIssue("groupId", "Urun grubu secimi zorunludur.");
  if (message.includes("kategori") && message.includes("zorunlu")) addIssue("categoryId", "Kategori secimi zorunludur.");
  if (message.includes("secilen urun grubu bulunamadi")) addIssue("groupId", "Secilen urun grubu bulunamadi.");
  if (message.includes("secilen kategori bulunamadi")) addIssue("categoryId", "Secilen kategori bulunamadi.");
  if (message.includes("kategori secilen urun grubuna ait degil")) {
    addIssue("groupId", "Urun grubu ile kategori eslesmiyor.");
    addIssue("categoryId", "Urun grubu ile kategori eslesmiyor.");
  }
  if (message.includes("gorsel") && message.includes("toplam boyut")) {
    addIssue("images", "Gorsellerin toplam boyutu fazla. Bir kismini kaldirip tekrar deneyin.");
  }
  if (message.includes("gorsel") && message.includes("cok buyuk")) {
    addIssue("images", "Gorsel boyutu buyuk. Daha kucuk gorseller kullanin.");
  }
  if (message.includes("dokuman") && message.includes("toplam boyut")) {
    addIssue("documentFiles", "Dokumanlarin toplam boyutu fazla.");
  }
  if (message.includes("payload too large") || message.includes("request entity too large") || message.includes("string or blob too big")) {
    addIssue("images", "Yuklenen medya boyutu fazla. Gorsel veya dosya sayisini azaltin.");
  }

  return issues;
}

function handleAuctionSubmitError(error: any) {
  const message = String(error?.message || "Ihale kaydedilemedi. Alanlari kontrol edip tekrar deneyin.");
  const issues = parseAuctionValidationIssuesFromMessage(message);
  if (issues.length > 0) {
    applyAuctionValidationIssues(issues);
    return;
  }
  setStatus(message, "error");
}

function resetGroupForm() {
  elements.groupNameInput.value = "";
}

function resetCategoryForm() {
  elements.categoryNameInput.value = "";
  if (state.groups.length > 0) {
    elements.categoryGroupSelect.value = String(state.groups[0].id || "");
  }
}

function resetAuctionForm() {
  clearAuctionFieldErrors();
  elements.auctionIdInput.value = "";
  elements.auctionLotNoInput.value = "";
  elements.auctionTitleInput.value = "";
  const firstGroup = state.groups.find((x: any) => Number(x.is_active || 0) === 1) || state.groups[0] || null;
  elements.auctionGroupSelect.value = firstGroup ? String(firstGroup.id || "") : "";
  fillAuctionCategorySelect();
  renderAuctionVehicleSection();
  const categoryOptions = Array.from(elements.auctionCategorySelect.options) as HTMLOptionElement[];
  const firstCategory = categoryOptions.find((opt) => String(opt.value || "").trim().length > 0);
  elements.auctionCategorySelect.value = firstCategory ? String(firstCategory.value || "") : "";
  elements.auctionStartPriceInput.value = "";
  elements.auctionMinIncrementInput.value = "1000";
  elements.auctionStatusInput.value = "ACTIVE";
  const now = new Date();
  const startsAt = new Date(now.getTime() + 5 * 60 * 1000);
  const endsAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  elements.auctionStartsAtInput.value = toDateTimeLocal(startsAt.toISOString());
  elements.auctionEndsAtInput.value = toDateTimeLocal(endsAt.toISOString());
  clearAuctionImageSelection();
  refreshAuctionLocationSelects("");
  elements.auctionNeighborhoodInput.value = "";
  elements.auctionDescriptionInput.value = "";
  elements.auctionExtraEquipmentInput.value = "";
  state.auctionExpertiseFiles = [];
  state.auctionDocumentFiles = [];
  renderAuctionFileList("expertise");
  renderAuctionFileList("document");
  refreshAuctionVehicleSelects("", "");
  elements.auctionVehicleModelDetailInput.value = "";
  elements.auctionVehicleYearInput.value = "";
  elements.auctionVehicleKmInput.value = "";
  elements.auctionVehicleFuelTypeInput.value = "";
  elements.auctionVehicleTransmissionInput.value = "";
  elements.auctionVehicleBodyTypeInput.value = "";
  elements.auctionVehicleColorInput.value = "";
  elements.auctionVehicleChassisNoInput.value = "";
  elements.auctionVehicleEngineVolumeInput.value = "";
  elements.auctionVehicleEnginePowerInput.value = "";
  elements.auctionVehicleDriveTypeInput.value = "";
  state.auctionVehicleConditionMap = {};
  state.auctionVehicleConditionSelectedStatus = VEHICLE_CONDITION_DEFAULT_STATUS;
  if (!isVehicleConditionPartKey(String(state.auctionVehicleConditionSelectedPart || ""))) {
    state.auctionVehicleConditionSelectedPart = VEHICLE_CONDITION_PARTS[0]?.key || "";
  }
  state.auctionVehicleConditionStep = normalizeVehicleConditionLayoutStep(state.auctionVehicleConditionStep);
  renderAuctionVehicleConditionMap();
  syncVehicleConditionLayoutControls();
  resetVehicleExpertiseMetaForm();
  updateFormHeadings();
}

function ensureAuctionSelectionDefaults() {
  if (!elements.auctionGroupSelect.value) {
    const firstGroup = state.groups.find((x: any) => Number(x.is_active || 0) === 1) || state.groups[0] || null;
    if (firstGroup) elements.auctionGroupSelect.value = String(firstGroup.id || "");
  }
}

function renderAuctionVehicleSection() {
  const selectedGroupId = String(elements.auctionGroupSelect.value || "");
  const selectedGroup = state.groups.find((x: any) => String(x.id || "") === selectedGroupId);
  const groupName = String(selectedGroup?.name || "").toLowerCase();
  const isVehicleGroup = groupName.includes("vasita") || groupName.includes("otomotiv");
  elements.auctionVehicleSection.classList.toggle("hide", !isVehicleGroup);
}

function showAuctionForm() {
  elements.auctionModal.classList.remove("hide");
  document.body.classList.add("modalOpen");
}

function hideAuctionForm() {
  elements.auctionModal.classList.add("hide");
  document.body.classList.remove("modalOpen");
}

function bindDropzoneUpload(
  dropzone: HTMLElement,
  input: HTMLInputElement,
  onFiles: (files: File[]) => Promise<void> | void
) {
  dropzone.addEventListener("click", () => input.click());
  dropzone.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    input.click();
  });
  dropzone.addEventListener("dragover", (event: DragEvent) => {
    event.preventDefault();
    dropzone.classList.add("dragOver");
  });
  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragOver");
  });
  dropzone.addEventListener("drop", async (event: DragEvent) => {
    event.preventDefault();
    dropzone.classList.remove("dragOver");
    const files = Array.from(event.dataTransfer?.files || []) as File[];
    if (files.length < 1) return;
    await onFiles(files);
  });
}

async function addAuctionImagesFromFiles(files: File[]) {
  if (files.length < 1) return;
  const acceptedCount = Math.max(0, MAX_AUCTION_IMAGE_COUNT - state.auctionImageDataUrls.length);
  if (acceptedCount < 1) {
    setStatus(`En fazla ${MAX_AUCTION_IMAGE_COUNT} gorsel yukleyebilirsiniz.`, "warn");
    return;
  }

  const queue = files.slice(0, acceptedCount);
  let added = 0;
  let skippedForSize = 0;

  setStatus("Gorseller isleniyor...", "warn");
  for (const file of queue) {
    const type = String(file.type || "").toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.has(type)) {
      continue;
    }

    try {
      const dataUrl = await optimizeAuctionImage(file);
      const currentTotal = getGalleryTotalBytes(state.auctionImageDataUrls);
      const nextTotal = currentTotal + estimateStoredValueBytes(dataUrl);
      if (nextTotal > MAX_AUCTION_GALLERY_TOTAL_BYTES) {
        skippedForSize += 1;
        continue;
      }
      state.auctionImageDataUrls.push(dataUrl);
      added += 1;
    } catch (error) {
      console.error(error);
    }
  }

  state.auctionImageDataUrls = normalizeAuctionImageList(state.auctionImageDataUrls);
  renderAuctionImageGallery();
  if (added > 0) {
    const totalBytes = getGalleryTotalBytes(state.auctionImageDataUrls);
    if (skippedForSize > 0) {
      setStatus(
        `${added} gorsel eklendi. ${skippedForSize} dosya toplam boyut siniri nedeniyle atlandi (${formatBytes(
          MAX_AUCTION_GALLERY_TOTAL_BYTES
        )}).`,
        "warn"
      );
    } else {
      setStatus(`${added} gorsel eklendi. Toplam gorsel boyutu: ${formatBytes(totalBytes)}.`, "ok");
    }
  } else {
    if (skippedForSize > 0) {
      setStatus(
        `Gorseller eklenemedi. Toplam gorsel boyutu en fazla ${formatBytes(MAX_AUCTION_GALLERY_TOTAL_BYTES)} olabilir.`,
        "error"
      );
    } else {
      setStatus("Uygun gorsel bulunamadi.", "error");
    }
  }
}

async function addReportFiles(files: File[], mode: "expertise" | "document") {
  if (files.length < 1) return;

  const current = mode === "expertise" ? state.auctionExpertiseFiles : state.auctionDocumentFiles;
  const acceptedCount = Math.max(0, MAX_AUCTION_FILE_COUNT - current.length);
  if (acceptedCount < 1) {
    setStatus(`En fazla ${MAX_AUCTION_FILE_COUNT} dosya yukleyebilirsiniz.`, "warn");
    return;
  }

  let added = 0;
  let skippedForSize = 0;
  for (const file of files.slice(0, acceptedCount)) {
    const type = String(file.type || "").toLowerCase();
    if (!ALLOWED_REPORT_FILE_TYPES.has(type)) {
      continue;
    }
    if (file.size > MAX_AUCTION_FILE_BYTES) {
      continue;
    }
    try {
      const dataUrl = await readGenericFileAsDataUrl(file);
      const currentTotal = getReportTotalBytes(current);
      const nextTotal = currentTotal + estimateStoredValueBytes(dataUrl);
      if (nextTotal > MAX_AUCTION_REPORT_TOTAL_BYTES) {
        skippedForSize += 1;
        continue;
      }
      current.push({
        name: String(file.name || "dosya").slice(0, 140),
        type,
        size: Number(file.size || 0),
        dataUrl,
      });
      added += 1;
    } catch (error) {
      console.error(error);
    }
  }

  if (mode === "expertise") {
    state.auctionExpertiseFiles = normalizeUploadedFileList(current);
  } else {
    state.auctionDocumentFiles = normalizeUploadedFileList(current);
  }
  renderAuctionFileList(mode);

  const label = mode === "expertise" ? "Ekspertiz" : "Dokuman";
  const totalBytes = getReportTotalBytes(mode === "expertise" ? state.auctionExpertiseFiles : state.auctionDocumentFiles);
  if (added > 0) {
    if (skippedForSize > 0) {
      setStatus(
        `${label} dosyalari guncellendi (${added} yeni). ${skippedForSize} dosya toplam boyut siniri nedeniyle atlandi (${formatBytes(
          MAX_AUCTION_REPORT_TOTAL_BYTES
        )}).`,
        "warn"
      );
    } else {
      setStatus(`${label} dosyalari guncellendi (${added} yeni, toplam ${formatBytes(totalBytes)}).`, "ok");
    }
  } else {
    if (skippedForSize > 0) {
      setStatus(
        `${label} dosyalari eklenemedi. Toplam dosya boyutu en fazla ${formatBytes(MAX_AUCTION_REPORT_TOTAL_BYTES)} olabilir.`,
        "warn"
      );
    } else {
      setStatus(`${label} icin uygun dosya bulunamadi.`, "warn");
    }
  }
}

function renderAuctionImageGallery() {
  const rows = normalizeAuctionImageList(state.auctionImageDataUrls || []);
  state.auctionImageDataUrls = rows;
  if (rows.length < 1) {
    elements.auctionImageGallery.innerHTML = "";
    elements.auctionImageMeta.textContent = "Henuz dosya secilmedi.";
    return;
  }

  const totalBytes = getGalleryTotalBytes(rows);
  elements.auctionImageMeta.textContent = `${rows.length} gorsel secili (${formatBytes(
    totalBytes
  )}). Ilk gorsel kart gorseli olarak kullanilacak.`;
  elements.auctionImageGallery.innerHTML = rows
    .map(
      (dataUrl: string, index: number) => `
        <div class="uploadItem">
          <img src="${escapeHtml(dataUrl)}" alt="Gorsel ${index + 1}">
          <div class="uploadItemMeta">
            <strong>Gorsel ${index + 1}</strong>
            <button class="removeTinyBtn" type="button" data-remove-image-index="${index}">Sil</button>
          </div>
        </div>
      `
    )
    .join("");
}

function renderAuctionFileList(mode: "expertise" | "document") {
  const isExpertise = mode === "expertise";
  const rows = normalizeUploadedFileList(isExpertise ? state.auctionExpertiseFiles : state.auctionDocumentFiles);
  const targetList = isExpertise ? elements.auctionExpertiseList : elements.auctionDocumentList;
  const targetMeta = isExpertise ? elements.auctionExpertiseMeta : elements.auctionDocumentMeta;
  const datasetAttr = isExpertise ? "data-remove-expertise-index" : "data-remove-document-index";
  const emptyLabel = isExpertise ? "Henuz ekspertiz dosyasi secilmedi." : "Henuz dokuman secilmedi.";
  if (isExpertise) state.auctionExpertiseFiles = rows;
  else state.auctionDocumentFiles = rows;

  if (rows.length < 1) {
    targetMeta.textContent = emptyLabel;
    targetList.innerHTML = '<div class="fileItemEmpty">Dosya bulunmuyor.</div>';
    return;
  }

  const totalBytes = getReportTotalBytes(rows);
  targetMeta.textContent = `${rows.length} dosya secili (${formatBytes(totalBytes)}).`;
  targetList.innerHTML = rows
    .map((item: UploadedFileEntry, index: number) => {
      const icon = item.type.includes("pdf") ? "fa-file-pdf" : "fa-image";
      return `
        <div class="fileItem">
          <span class="fileItemName">
            <i class="fas ${icon}"></i>
            <span>${escapeHtml(item.name || `dosya-${index + 1}`)}</span>
            <em>${escapeHtml(formatBytes(Number(item.size || estimateDataUrlBytes(item.dataUrl))))}</em>
          </span>
          <button class="removeTinyBtn" type="button" ${datasetAttr}="${index}">Sil</button>
        </div>
      `;
    })
    .join("");
}

function renderAuctionVehicleConditionMap() {
  const selectedStatus =
    normalizeVehicleConditionStatusKey(state.auctionVehicleConditionSelectedStatus) || VEHICLE_CONDITION_DEFAULT_STATUS;
  state.auctionVehicleConditionSelectedStatus = selectedStatus;
  const map = normalizeVehicleConditionMap(state.auctionVehicleConditionMap || {});
  state.auctionVehicleConditionMap = map;
  const layout = normalizeVehicleConditionLayout(state.auctionVehicleConditionLayout || {});
  state.auctionVehicleConditionLayout = layout;
  const scale = normalizeVehicleConditionScale(state.auctionVehicleConditionScale);
  state.auctionVehicleConditionScale = scale;
  if (!isVehicleConditionPartKey(String(state.auctionVehicleConditionSelectedPart || ""))) {
    state.auctionVehicleConditionSelectedPart = VEHICLE_CONDITION_PARTS[0]?.key || "";
  }

  const statusButtons = Array.from(
    elements.auctionVehicleConditionToolbar.querySelectorAll("button[data-condition-status]")
  ) as HTMLButtonElement[];
  for (const button of statusButtons) {
    const key = normalizeVehicleConditionStatusKey(button.dataset.conditionStatus);
    button.classList.toggle("active", key === selectedStatus);
  }

  const partsMarkup = VEHICLE_CONDITION_PARTS.map((part) => {
    const status = map[part.key] || VEHICLE_CONDITION_DEFAULT_STATUS;
    const statusClass = getVehicleConditionStatusClass(status);
    const partClass = `part-${part.key}`;
    const shouldShowCode = status !== VEHICLE_CONDITION_DEFAULT_STATUS;
    const code = shouldShowCode ? getVehicleConditionStatusCode(status) : "";
    const pos = VEHICLE_CONDITION_TEXT_POSITIONS[part.key] || [200, 250];
    const path = VEHICLE_CONDITION_PART_PATHS[part.key] || "";
    const offset = layout[part.key] || { x: 0, y: 0 };
    const transform = offset.x !== 0 || offset.y !== 0 ? ` transform="translate(${offset.x} ${offset.y})"` : "";
    const selectedClass = part.key === state.auctionVehicleConditionSelectedPart ? "is-layout-selected" : "";
    return `
      <g class="conditionSvgPart ${statusClass} ${selectedClass} ${partClass}" data-part-key="${part.key}" role="button" aria-label="${escapeHtml(
      part.label
    )} ${escapeHtml(getVehicleConditionStatusLabel(status))}"${transform}>
        <path d="${path}" fill-rule="evenodd" clip-rule="evenodd"></path>
        ${shouldShowCode
          ? `<text class="conditionCode ${code.length > 1 ? "is-long" : "is-short"}" x="${Number(pos[0])}" y="${Number(
              pos[1]
            )}" text-anchor="middle" dominant-baseline="middle" text-rendering="geometricPrecision">${escapeHtml(
              code
            )}</text>`
          : ""}
      </g>
    `;
  }).join("");

  const [scaleCenterX, scaleCenterY] = VEHICLE_CONDITION_SCALE_CENTER;
  const scaleTransform =
    Math.abs(scale - 1) > 0.001
      ? `transform="translate(${scaleCenterX} ${scaleCenterY}) scale(${scale}) translate(${-scaleCenterX} ${-scaleCenterY})"`
      : "";

  elements.auctionVehicleConditionMap.innerHTML = `
    <svg class="conditionSvg conditionSvgInteractive" viewBox="44 84 380 440" role="img" aria-label="Arac kaporta durum haritasi">
      <g class="conditionScaleLayer" ${scaleTransform}>
        <image class="conditionBaseImage" href="/kaporta-base.png" x="0" y="0" width="467" height="551" preserveAspectRatio="xMidYMid meet"></image>
        ${partsMarkup}
      </g>
    </svg>
  `;
  syncVehicleConditionLayoutControls();
}

function getVehicleConditionStatusLabel(status: VehicleConditionStatusKey) {
  if (status === "LOCAL_PAINTED") return "Lokal Boyalı";
  if (status === "PAINTED") return "Boyalı";
  if (status === "CHANGED") return "Değişen";
  return "Orijinal";
}

function getVehicleConditionStatusClass(status: VehicleConditionStatusKey) {
  if (status === "LOCAL_PAINTED") return "local_painted";
  if (status === "PAINTED") return "painted";
  if (status === "CHANGED") return "changed";
  return "original";
}

function getVehicleConditionStatusCode(status: VehicleConditionStatusKey) {
  if (status === "LOCAL_PAINTED") return "LB";
  if (status === "PAINTED") return "B";
  if (status === "CHANGED") return "D";
  return "O";
}

function normalizeVehicleConditionMap(input: any): VehicleConditionMap {
  const source = parseJsonObjectMaybe(input);
  const out: VehicleConditionMap = {};
  for (const part of VEHICLE_CONDITION_PARTS) {
    const normalizedStatus = normalizeVehicleConditionStatusKey(source[part.key]);
    if (!normalizedStatus || normalizedStatus === VEHICLE_CONDITION_DEFAULT_STATUS) continue;
    out[part.key] = normalizedStatus;
  }
  return out;
}

function createDefaultVehicleConditionLayout(): VehicleConditionLayout {
  const out: Record<string, VehicleConditionOffset> = {};
  for (const part of VEHICLE_CONDITION_PARTS) {
    out[part.key] = { x: 0, y: 0 };
  }
  return out as VehicleConditionLayout;
}

function normalizeVehicleConditionLayoutOffset(input: any) {
  const value = Number(input);
  if (!Number.isFinite(value)) return 0;
  const rounded = Math.round(value);
  if (rounded > VEHICLE_CONDITION_LAYOUT_MAX_OFFSET) return VEHICLE_CONDITION_LAYOUT_MAX_OFFSET;
  if (rounded < -VEHICLE_CONDITION_LAYOUT_MAX_OFFSET) return -VEHICLE_CONDITION_LAYOUT_MAX_OFFSET;
  return rounded;
}

function normalizeVehicleConditionLayout(input: any): VehicleConditionLayout {
  const source = parseJsonObjectMaybe(input);
  const partsSource = parseJsonObjectMaybe(source.parts || source.layout || source.offsets || source);
  const out = createDefaultVehicleConditionLayout();

  for (const part of VEHICLE_CONDITION_PARTS) {
    const rawPart = partsSource[part.key];
    let x = 0;
    let y = 0;

    if (Array.isArray(rawPart)) {
      x = normalizeVehicleConditionLayoutOffset(rawPart[0]);
      y = normalizeVehicleConditionLayoutOffset(rawPart[1]);
    } else {
      const partSource = parseJsonObjectMaybe(rawPart);
      x = normalizeVehicleConditionLayoutOffset(partSource.x ?? partSource.dx ?? 0);
      y = normalizeVehicleConditionLayoutOffset(partSource.y ?? partSource.dy ?? 0);
    }

    out[part.key] = { x, y };
  }

  return out;
}

function serializeVehicleConditionLayout(input: any) {
  const layout = normalizeVehicleConditionLayout(input);
  const out: Record<string, { x: number; y: number }> = {};
  for (const part of VEHICLE_CONDITION_PARTS) {
    const row = layout[part.key] || { x: 0, y: 0 };
    out[part.key] = {
      x: normalizeVehicleConditionLayoutOffset(row.x),
      y: normalizeVehicleConditionLayoutOffset(row.y),
    };
  }
  return out;
}

function normalizeVehicleConditionLayoutStep(input: any) {
  const value = Number(input);
  if (!Number.isFinite(value)) return 1;
  const rounded = Math.round(value);
  if (rounded < 1) return 1;
  if (rounded > VEHICLE_CONDITION_LAYOUT_MAX_STEP) return VEHICLE_CONDITION_LAYOUT_MAX_STEP;
  return rounded;
}

function normalizeVehicleConditionScale(input: any) {
  const value = Number(input);
  if (!Number.isFinite(value)) return VEHICLE_CONDITION_SCALE_DEFAULT;
  const rounded = Math.round(value * 100) / 100;
  if (rounded < VEHICLE_CONDITION_SCALE_MIN) return VEHICLE_CONDITION_SCALE_MIN;
  if (rounded > VEHICLE_CONDITION_SCALE_MAX) return VEHICLE_CONDITION_SCALE_MAX;
  return rounded;
}

function normalizeVehicleConditionScalePercentInput(input: any) {
  const value = Number(input);
  if (!Number.isFinite(value)) return VEHICLE_CONDITION_SCALE_DEFAULT;
  const asScale = value / 100;
  return normalizeVehicleConditionScale(asScale);
}

function setVehicleConditionPartOffset(partKey: VehicleConditionPartKey, x: number, y: number) {
  const nextLayout = normalizeVehicleConditionLayout(state.auctionVehicleConditionLayout || {});
  nextLayout[partKey] = {
    x: normalizeVehicleConditionLayoutOffset(x),
    y: normalizeVehicleConditionLayoutOffset(y),
  };
  state.auctionVehicleConditionLayout = nextLayout;
}

function shiftVehicleConditionPartOffset(partKey: VehicleConditionPartKey, deltaX: number, deltaY: number) {
  const layout = normalizeVehicleConditionLayout(state.auctionVehicleConditionLayout || {});
  const current = layout[partKey] || { x: 0, y: 0 };
  setVehicleConditionPartOffset(partKey, current.x + Number(deltaX || 0), current.y + Number(deltaY || 0));
}

function syncVehicleConditionLayoutControls() {
  const select = elements.auctionVehicleConditionPartSelect as HTMLSelectElement;
  if (!select) return;
  if (select.options.length !== VEHICLE_CONDITION_PARTS.length) {
    select.innerHTML = VEHICLE_CONDITION_PARTS.map(
      (part) => `<option value="${escapeHtml(part.key)}">${escapeHtml(part.label)}</option>`
    ).join("");
  }

  let selectedPart = String(state.auctionVehicleConditionSelectedPart || "");
  if (!isVehicleConditionPartKey(selectedPart)) {
    selectedPart = VEHICLE_CONDITION_PARTS[0]?.key || "";
    state.auctionVehicleConditionSelectedPart = selectedPart;
  }
  if (select.value !== selectedPart) {
    select.value = selectedPart;
  }

  const step = normalizeVehicleConditionLayoutStep(state.auctionVehicleConditionStep);
  state.auctionVehicleConditionStep = step;
  if (elements.auctionVehicleConditionStepInput) {
    elements.auctionVehicleConditionStepInput.value = String(step);
  }

  const scale = normalizeVehicleConditionScale(state.auctionVehicleConditionScale);
  state.auctionVehicleConditionScale = scale;
  if (elements.auctionVehicleConditionScaleInput) {
    elements.auctionVehicleConditionScaleInput.value = String(Math.round(scale * 100));
  }

  const layout = normalizeVehicleConditionLayout(state.auctionVehicleConditionLayout || {});
  state.auctionVehicleConditionLayout = layout;
  const row = isVehicleConditionPartKey(selectedPart) ? layout[selectedPart] || { x: 0, y: 0 } : { x: 0, y: 0 };
  if (elements.auctionVehicleConditionOffsetXInput) {
    elements.auctionVehicleConditionOffsetXInput.value = String(normalizeVehicleConditionLayoutOffset(row.x));
  }
  if (elements.auctionVehicleConditionOffsetYInput) {
    elements.auctionVehicleConditionOffsetYInput.value = String(normalizeVehicleConditionLayoutOffset(row.y));
  }
}

async function persistVehicleConditionLayout(silent = false) {
  if (state.auctionVehicleConditionLayoutSaving) return;
  state.auctionVehicleConditionLayoutSaving = true;
  try {
    const data = await apiFetch("/api/admin/vehicle-condition-layout", {
      method: "POST",
      body: {
        layout: serializeVehicleConditionLayout(state.auctionVehicleConditionLayout),
        scale: normalizeVehicleConditionScale(state.auctionVehicleConditionScale),
      },
    });
    state.auctionVehicleConditionLayout = normalizeVehicleConditionLayout(data.layout || {});
    state.auctionVehicleConditionScale = normalizeVehicleConditionScale(data.scale);
    renderAuctionVehicleConditionMap();
    syncVehicleConditionLayoutControls();
    if (!silent) {
      setStatus("Kaporta sema konumlari kaydedildi.", "ok");
    }
  } catch (error: any) {
    console.error(error);
    if (!silent) {
      setStatus(error?.message || "Kaporta sema konumlari kaydedilemedi.", "error");
    }
  } finally {
    state.auctionVehicleConditionLayoutSaving = false;
  }
}

function queueVehicleConditionLayoutAutosave() {
  if (state.auctionVehicleConditionLayoutSaveTimer) {
    window.clearTimeout(state.auctionVehicleConditionLayoutSaveTimer);
  }
  state.auctionVehicleConditionLayoutSaveTimer = window.setTimeout(async () => {
    state.auctionVehicleConditionLayoutSaveTimer = null;
    await persistVehicleConditionLayout(true);
  }, 450);
}

function setVehicleConditionPartStatus(partKey: VehicleConditionPartKey, status: VehicleConditionStatusKey) {
  const nextMap = normalizeVehicleConditionMap(state.auctionVehicleConditionMap || {});
  if (status === VEHICLE_CONDITION_DEFAULT_STATUS) {
    delete nextMap[partKey];
  } else {
    nextMap[partKey] = status;
  }
  state.auctionVehicleConditionMap = nextMap;
}

function normalizeVehicleConditionStatusKey(input: any): VehicleConditionStatusKey | null {
  const raw = String(input || "").trim();
  if (!raw) return null;
  const folded = raw
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (folded === "ORIGINAL" || folded === "ORIJINAL") return "ORIGINAL";
  if (
    folded === "LOCAL_PAINTED" ||
    folded === "LOKAL BOYALI" ||
    folded === "LOKALBOYALI"
  ) {
    return "LOCAL_PAINTED";
  }
  if (folded === "PAINTED" || folded === "BOYALI") return "PAINTED";
  if (folded === "CHANGED" || folded === "DEGISEN") return "CHANGED";
  return null;
}

function normalizeVehicleExpertiseMeta(input: any): VehicleExpertiseMeta {
  const source = parseJsonObjectMaybe(input);
  const structureSource = parseJsonObjectMaybe(source.structure || source.structural || {});
  const mechanicalSource = parseJsonObjectMaybe(source.mechanical || {});
  const tireSource = parseJsonObjectMaybe(source.tires || {});

  const structure: Partial<Record<VehicleExpertiseStructureKey, VehicleExpertiseStructureStatus>> = {};
  for (const field of VEHICLE_EXPERTISE_STRUCTURE_FIELDS) {
    const candidates = [field.key, ...(Array.isArray((field as any).legacyKeys) ? (field as any).legacyKeys : [])];
    let rawValue: any = undefined;
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
    if (!normalized || normalized === VEHICLE_EXPERTISE_STRUCTURE_DEFAULT_STATUS) continue;
    structure[field.key] = normalized;
  }

  const mechanical: Partial<Record<VehicleExpertiseMechanicalKey, VehicleExpertiseMechanicalStatus>> = {};
  for (const field of VEHICLE_EXPERTISE_MECHANICAL_FIELDS) {
    const legacyKeys = field.key === "intercooler" ? ["interkol"] : [];
    const candidates = [field.key, ...legacyKeys];
    let rawValue: any = undefined;
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
    if (!normalized || normalized === VEHICLE_EXPERTISE_MECHANICAL_DEFAULT_STATUS) continue;
    mechanical[field.key] = normalized;
  }

  const tireRaw =
    tireSource.general || tireSource.lastik_genel_durum || source.lastik_genel_durum || source.tireGeneral || source.lastikDurum;
  const tireStatus = normalizeVehicleExpertiseTireStatus(tireRaw);

  const out: VehicleExpertiseMeta = {};
  if (Object.keys(structure).length > 0) out.structure = structure;
  if (Object.keys(mechanical).length > 0) out.mechanical = mechanical;
  if (tireStatus && tireStatus !== VEHICLE_EXPERTISE_TIRE_DEFAULT_STATUS) out.tires = { general: tireStatus };
  return out;
}

function normalizeVehicleExpertiseStructureStatus(input: any): VehicleExpertiseStructureStatus | null {
  const raw = String(input || "").trim();
  if (!raw) return null;
  const folded = raw
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (folded === "ORIGINAL" || folded === "ORIJINAL") return "ORIGINAL";
  if (
    folded === "ISLEMLI" ||
    folded === "ISLEM GORMUS" ||
    folded === "DUZELTILMIS" ||
    folded === "DUZELTME"
  ) {
    return "ISLEMLI";
  }
  if (folded === "DEGISMIS" || folded === "DEGISEN" || folded === "CHANGED") return "DEGISMIS";
  return null;
}

function normalizeVehicleExpertiseMechanicalStatus(input: any): VehicleExpertiseMechanicalStatus | null {
  const raw = String(input || "").trim();
  if (!raw) return null;
  const folded = raw
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (folded === "NORMAL" || folded === "IYI" || folded === "SORUNSUZ" || folded === "YOK") return "NORMAL";
  if (
    folded === "BAKIM_GEREKLI" ||
    folded === "BAKIM GEREKLI" ||
    folded === "KONTROL_GEREKLI" ||
    folded === "KONTROL GEREKLI" ||
    folded === "BAKIM" ||
    folded === "KONTROL"
  ) {
    return "BAKIM_GEREKLI";
  }
  if (
    folded === "ONARIM_GEREKLI" ||
    folded === "ONARIM GEREKLI" ||
    folded === "ONARIM" ||
    folded === "ARIZALI" ||
    folded === "KACAK VAR" ||
    folded === "KACAK_VAR"
  ) {
    return "ONARIM_GEREKLI";
  }
  return null;
}

function normalizeVehicleExpertiseTireStatus(input: any): VehicleExpertiseTireStatus | null {
  const raw = String(input || "").trim();
  if (!raw) return null;
  const folded = raw
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (folded === "IYI" || folded === "GOOD") return "IYI";
  if (folded === "ORTA" || folded === "MEDIUM") return "ORTA";
  if (folded === "ZAYIF" || folded === "KOTU" || folded === "DUSUK") return "ZAYIF";
  if (
    folded === "DEGISTIRILMELI" ||
    folded === "DEGISIM GEREKLI" ||
    folded === "CHANGE_REQUIRED"
  ) {
    return "DEGISTIRILMELI";
  }
  return null;
}

function isVehicleConditionPartKey(input: string): input is VehicleConditionPartKey {
  return VEHICLE_CONDITION_PARTS.some((part) => part.key === input);
}

function normalizeAuctionImageList(input: any) {
  const values = parseJsonArrayMaybe(input);
  const out: string[] = [];
  for (const value of values) {
    const item = String(value || "").trim();
    if (!item) continue;
    if (!(item.startsWith("data:image/") || /^https?:\/\//i.test(item))) continue;
    out.push(item);
    if (out.length >= MAX_AUCTION_IMAGE_COUNT) break;
  }
  return out;
}

function normalizeUploadedFileList(input: any) {
  const values = parseJsonArrayMaybe(input);
  const out: UploadedFileEntry[] = [];
  for (const raw of values) {
    const obj = typeof raw === "object" && raw ? raw : {};
    const dataUrl = String(obj.dataUrl || obj.url || "").trim();
    if (!dataUrl) continue;
    if (!(dataUrl.startsWith("data:") || /^https?:\/\//i.test(dataUrl))) continue;
    const type = String(obj.type || "").trim().toLowerCase();
    const guessedType = type || (dataUrl.startsWith("data:application/pdf") ? "application/pdf" : "image/jpeg");
    const entry: UploadedFileEntry = {
      name: String(obj.name || "dosya").slice(0, 140),
      type: guessedType,
      size: Number(obj.size || 0),
      dataUrl,
    };
    out.push(entry);
    if (out.length >= MAX_AUCTION_FILE_COUNT) break;
  }
  return out;
}

function estimateStoredValueBytes(value: string) {
  const text = String(value || "").trim();
  if (!text) return 0;
  if (text.startsWith("data:")) return estimateDataUrlBytes(text);
  return Math.min(text.length, 4096);
}

function getGalleryTotalBytes(input: any) {
  const items = normalizeAuctionImageList(input);
  return items.reduce((sum: number, item: string) => sum + estimateStoredValueBytes(item), 0);
}

function getReportTotalBytes(input: any) {
  const files = normalizeUploadedFileList(input);
  return files.reduce((sum: number, item: UploadedFileEntry) => sum + estimateStoredValueBytes(item.dataUrl), 0);
}

function parseJsonArrayMaybe(input: any) {
  if (Array.isArray(input)) return input;
  if (typeof input === "string") {
    const text = String(input || "").trim();
    if (!text) return [];
    if (text.startsWith("[")) {
      try {
        const parsed = JSON.parse(text);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [text];
  }
  return [];
}

function parseJsonObjectMaybe(input: any) {
  if (input && typeof input === "object" && !Array.isArray(input)) return input;
  if (typeof input === "string") {
    const text = String(input || "").trim();
    if (!text || !text.startsWith("{")) return {};
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    } catch {
      return {};
    }
  }
  return {};
}

function clearAuctionImageSelection() {
  state.auctionImageDataUrls = [];
  renderAuctionImageGallery();
}

async function readGenericFileAsDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Dosya okunamadi."));
    reader.readAsDataURL(file);
  });
}

async function optimizeAuctionImage(file: File) {
  const image = await readImageFile(file);
  let width = image.naturalWidth || image.width || 1;
  let height = image.naturalHeight || image.height || 1;
  const largest = Math.max(width, height);
  if (largest > MAX_AUCTION_IMAGE_DIMENSION) {
    const ratio = MAX_AUCTION_IMAGE_DIMENSION / largest;
    width = Math.max(1, Math.round(width * ratio));
    height = Math.max(1, Math.round(height * ratio));
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Tarayici gorsel isleme destegi vermiyor.");

  let bestDataUrl = "";
  let bestApproxSize = Number.POSITIVE_INFINITY;
  let currentWidth = width;
  let currentHeight = height;

  for (let scaleStep = 0; scaleStep < 6; scaleStep += 1) {
    canvas.width = currentWidth;
    canvas.height = currentHeight;
    context.clearRect(0, 0, currentWidth, currentHeight);
    context.drawImage(image, 0, 0, currentWidth, currentHeight);

    for (let quality = 0.9; quality >= 0.5; quality -= 0.1) {
      const dataUrl = canvas.toDataURL("image/jpeg", Number(quality.toFixed(2)));
      const approxSize = estimateDataUrlBytes(dataUrl);
      if (approxSize < bestApproxSize) {
        bestApproxSize = approxSize;
        bestDataUrl = dataUrl;
      }
      if (approxSize <= MAX_AUCTION_IMAGE_BYTES) {
        return dataUrl;
      }
    }

    currentWidth = Math.max(420, Math.round(currentWidth * 0.82));
    currentHeight = Math.max(320, Math.round(currentHeight * 0.82));
  }

  if (!bestDataUrl) throw new Error("Gorsel donusturulemedi.");
  return bestDataUrl;
}

async function readImageFile(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Dosya gorsel olarak okunamadi."));
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function estimateDataUrlBytes(dataUrl: string) {
  const body = String(dataUrl || "").split(",")[1] || "";
  return Math.ceil((body.length * 3) / 4);
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function filterUsers(users: any[], query: string) {
  if (!query) return users;
  return users.filter((user: any) => {
    const email = String(user.email || "").toLowerCase();
    const name = String(user.name || "").toLowerCase();
    return email.includes(query) || name.includes(query);
  });
}

function normalizeRole(role: string) {
  const value = String(role || "").toLowerCase();
  if (value === ROLE_ADMIN) return ROLE_ADMIN;
  if (value === ROLE_MANAGER) return ROLE_MANAGER;
  return ROLE_MEMBER;
}

function updateFormHeadings() {
  const isEditingAuction = String(elements.auctionIdInput.value || "").trim().length > 0;

  elements.auctionFormTitle.textContent = isEditingAuction ? "Ihale Duzenle" : "Ihale Ekle";

  elements.auctionSaveBtn.textContent = isEditingAuction ? "Guncelle" : "Kaydet";
}

function setStatus(text: string, kind: "ok" | "error" | "warn" | "") {
  elements.statusLine.className = "statusLine";
  if (kind) elements.statusLine.classList.add(kind);
  elements.statusLine.textContent = text || "";
}

async function safeAction(control: HTMLElement, handler: () => Promise<void>, options: SafeActionOptions = {}) {
  const prevDisabled = (control as HTMLButtonElement | HTMLSelectElement | HTMLInputElement).disabled === true;
  control.classList.add("busy");
  (control as HTMLButtonElement | HTMLSelectElement | HTMLInputElement).disabled = true;
  try {
    await handler();
  } catch (error: any) {
    console.error(error);
    if (typeof options.onError === "function") {
      options.onError(error);
    }
    if (!options.suppressDefaultErrorStatus) {
      setStatus(error.message || "Islem sirasinda hata olustu.", "error");
    }
  } finally {
    (control as HTMLButtonElement | HTMLSelectElement | HTMLInputElement).disabled = prevDisabled;
    control.classList.remove("busy");
  }
}

function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function formatMoney(value: any) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatAuctionStatus(status: string) {
  const value = String(status || "").toUpperCase();
  if (value === "ACTIVE") return "Yayında";
  if (value === "PASSIVE") return "Pasif";
  if (value === "ENDED") return "Sonlandırıldı";
  return value || "-";
}

function toDateTimeLocal(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function toIsoFromDateTimeLocal(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

function escapeHtml(value: any) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function byId(id: string) {
  return document.getElementById(id) as any;
}

async function apiFetch(path: string, options: { method?: string; body?: any } = {}) {
  const method = options.method || "GET";
  const body = options.body ?? null;
  const init: RequestInit = {
    method,
    credentials: "same-origin",
    headers: {},
  };

  if (body !== null) {
    (init.headers as Record<string, string>)["content-type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, init);
  let data: any = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || data.ok === false) {
    const error: any = new Error(data.error || `Istek basarisiz (${response.status})`);
    error.status = response.status;
    error.payload = data;
    error.path = path;
    throw error;
  }
  return data;
}
