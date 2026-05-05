"use strict";
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
const state = {
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
    permissionDefs: defaultPermissionDefs,
    query: "",
    catalogQuery: "",
    auctionQuery: "",
};
const AUCTION_REQUIRED_FIELD_KEYS = [
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
    auctionVehicleEngineVolumeInput: byId("auctionVehicleEngineVolumeInput"),
    auctionVehicleEnginePowerInput: byId("auctionVehicleEnginePowerInput"),
    auctionVehicleDriveTypeInput: byId("auctionVehicleDriveTypeInput"),
    auctionResetBtn: byId("auctionResetBtn"),
    auctionFormTitle: byId("auctionFormTitle"),
    auctionSaveBtn: byId("auctionSaveBtn"),
    auctionRows: byId("auctionRows"),
};
function getAuctionFieldBinding(fieldKey) {
    if (fieldKey === "lotNo")
        return { key: fieldKey, label: "Ihale No", element: elements.auctionLotNoInput };
    if (fieldKey === "title")
        return { key: fieldKey, label: "Ihale Basligi", element: elements.auctionTitleInput };
    if (fieldKey === "groupId")
        return { key: fieldKey, label: "Urun Grubu", element: elements.auctionGroupSelect };
    if (fieldKey === "categoryId")
        return { key: fieldKey, label: "Kategori", element: elements.auctionCategorySelect };
    if (fieldKey === "startsAt")
        return { key: fieldKey, label: "Baslangic Tarihi", element: elements.auctionStartsAtInput };
    if (fieldKey === "endsAt")
        return { key: fieldKey, label: "Bitis Tarihi", element: elements.auctionEndsAtInput };
    if (fieldKey === "startPrice")
        return { key: fieldKey, label: "Baslangic Bedeli", element: elements.auctionStartPriceInput };
    if (fieldKey === "minIncrement")
        return { key: fieldKey, label: "Minimum Artis", element: elements.auctionMinIncrementInput };
    if (fieldKey === "images")
        return { key: fieldKey, label: "Arac Gorselleri", element: elements.auctionImageDropzone };
    if (fieldKey === "expertiseFiles")
        return { key: fieldKey, label: "Ekspertiz Dosyalari", element: elements.auctionExpertiseDropzone };
    if (fieldKey === "documentFiles")
        return { key: fieldKey, label: "Dokumanlar", element: elements.auctionDocumentDropzone };
    return null;
}
function getAllAuctionFieldBindings() {
    return AUCTION_REQUIRED_FIELD_KEYS.map((key) => getAuctionFieldBinding(key)).filter((item) => item !== null);
}
init().catch((error) => {
    console.error(error);
    setStatus(error.message || "Yonetim paneli yuklenemedi.", "error");
});
async function init() {
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
function applyBootstrapPayload(data) {
    state.currentUser = data.user || null;
    if (Array.isArray(data.permissionDefs) && data.permissionDefs.length > 0) {
        state.permissionDefs = data.permissionDefs
            .map((item) => ({ key: String(item.key || ""), label: String(item.label || item.key || "") }))
            .filter((item) => item.key);
    }
    state.users = Array.isArray(data.users) ? data.users : [];
    state.groups = Array.isArray(data.groups) ? data.groups : [];
    state.categories = Array.isArray(data.categories) ? data.categories : [];
    state.auctions = Array.isArray(data.auctions) ? data.auctions : [];
    const hasSelectedUser = state.users.some((user) => String(user.id || "") === String(state.selectedUserId || ""));
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
    elements.tabs.addEventListener("click", (event) => {
        const btn = event.target.closest("button[data-tab]");
        if (!btn)
            return;
        state.activeTab = String(btn.dataset.tab || "users");
        renderTabs();
    });
    bindUserEvents();
    bindCatalogEvents();
    bindAuctionEvents();
}
function bindUserEvents() {
    elements.userList.addEventListener("click", async (event) => {
        const target = event.target;
        const selectBtn = target.closest("button[data-action='select-user']");
        if (!selectBtn)
            return;
        const userId = String(selectBtn.dataset.userId || "");
        if (!userId)
            return;
        state.selectedUserId = userId;
        renderUsers();
    });
    elements.userDetail.addEventListener("click", async (event) => {
        const target = event.target;
        const actionBtn = target.closest("button[data-action]");
        if (!actionBtn)
            return;
        const action = String(actionBtn.dataset.action || "");
        const userId = String(actionBtn.dataset.userId || "");
        if (!userId)
            return;
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
        if (action === "toggle-permission") {
            const permissionKey = String(actionBtn.dataset.permissionKey || "");
            const enabled = actionBtn.dataset.enabled === "true";
            await safeAction(actionBtn, async () => {
                await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/permissions`, {
                    method: "POST",
                    body: { permissionKey, enabled: !enabled },
                });
                await loadUsers();
                renderUsers();
                setStatus("Yetki guncellendi.", "ok");
            });
        }
    });
    elements.userDetail.addEventListener("change", async (event) => {
        const target = event.target;
        const roleSelect = target.closest("select[data-action='change-role']");
        if (!roleSelect)
            return;
        const userId = String(roleSelect.dataset.userId || "");
        const role = String(roleSelect.value || "").trim();
        if (!userId || !role)
            return;
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
    });
}
function bindCatalogEvents() {
    elements.groupForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const name = String(elements.groupNameInput.value || "").trim();
        if (!name) {
            setStatus("Urun grubu adi zorunludur.", "error");
            return;
        }
        const sortOrder = (state.groups.reduce((max, row) => Math.max(max, Number(row.sort_order || 0)), 0) || 0) + 10;
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
    elements.groupRows.addEventListener("click", async (event) => {
        const btn = event.target.closest("button[data-action]");
        if (!btn)
            return;
        const action = String(btn.dataset.action || "");
        const groupId = String(btn.dataset.id || "");
        const group = state.groups.find((x) => x.id === groupId);
        if (!group)
            return;
        if (action === "rename-group") {
            const nextName = prompt("Yeni urun grubu adini girin:", String(group.name || "")) || "";
            const name = String(nextName || "").trim();
            if (!name || name === String(group.name || "").trim())
                return;
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
            if (!confirm(`"${group.name}" urun grubunu silmek istiyor musunuz?`))
                return;
            await safeAction(btn, async () => {
                await apiFetch(`/api/admin/product-groups/${encodeURIComponent(groupId)}`, { method: "DELETE" });
                await loadCatalog();
                renderCatalog();
                renderStats();
                setStatus("Urun grubu silindi.", "ok");
            });
        }
    });
    elements.categoryForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const groupId = String(elements.categoryGroupSelect.value || "").trim();
        const name = String(elements.categoryNameInput.value || "").trim();
        if (!groupId || !name) {
            setStatus("Kategori grubu ve adi zorunludur.", "error");
            return;
        }
        const sortOrder = (state.categories
            .filter((row) => String(row.group_id || "") === groupId)
            .reduce((max, row) => Math.max(max, Number(row.sort_order || 0)), 0) || 0) + 10;
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
    elements.categoryRows.addEventListener("click", async (event) => {
        const btn = event.target.closest("button[data-action]");
        if (!btn)
            return;
        const action = String(btn.dataset.action || "");
        const categoryId = String(btn.dataset.id || "");
        const category = state.categories.find((x) => x.id === categoryId);
        if (!category)
            return;
        if (action === "rename-category") {
            const nextName = prompt("Yeni kategori adini girin:", String(category.name || "")) || "";
            const name = String(nextName || "").trim();
            if (!name || name === String(category.name || "").trim())
                return;
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
            if (!confirm(`"${category.name}" kategorisini silmek istiyor musunuz?`))
                return;
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
function bindAuctionEvents() {
    elements.openAuctionFormBtn.addEventListener("click", () => {
        showAuctionForm();
        resetAuctionForm();
        setStatus("Yeni ihale formu acildi.", "ok");
    });
    elements.auctionFormCloseBtn.addEventListener("click", () => {
        hideAuctionForm();
        setStatus("Ihale formu kapatildi.", "ok");
    });
    elements.auctionGroupSelect.addEventListener("change", () => {
        fillAuctionCategorySelect();
        renderAuctionVehicleSection();
    });
    elements.auctionLotNoInput.addEventListener("input", () => {
        const start = elements.auctionLotNoInput.selectionStart;
        const end = elements.auctionLotNoInput.selectionEnd;
        elements.auctionLotNoInput.value = String(elements.auctionLotNoInput.value || "").toUpperCase();
        if (start !== null && end !== null) {
            elements.auctionLotNoInput.setSelectionRange(start, end);
        }
    });
    const closeDatePicker = (input) => {
        input.addEventListener("change", () => {
            window.setTimeout(() => input.blur(), 0);
        });
    };
    closeDatePicker(elements.auctionStartsAtInput);
    closeDatePicker(elements.auctionEndsAtInput);
    elements.auctionImagePickBtn.addEventListener("click", () => {
        elements.auctionImageFileInput.click();
    });
    bindDropzoneUpload(elements.auctionImageDropzone, elements.auctionImageFileInput, async (files) => {
        await addAuctionImagesFromFiles(files);
    });
    elements.auctionImageFileInput.addEventListener("change", async () => {
        const files = Array.from(elements.auctionImageFileInput.files || []);
        if (files.length < 1)
            return;
        await addAuctionImagesFromFiles(files);
        elements.auctionImageFileInput.value = "";
    });
    elements.auctionImageClearBtn.addEventListener("click", () => {
        clearAuctionImageSelection();
        setStatus("Yuklenen tum gorseller temizlendi.", "ok");
    });
    elements.auctionImageGallery.addEventListener("click", (event) => {
        const btn = event.target.closest("button[data-remove-image-index]");
        if (!btn)
            return;
        const index = Number(btn.dataset.removeImageIndex || -1);
        if (!Number.isFinite(index) || index < 0)
            return;
        state.auctionImageDataUrls = state.auctionImageDataUrls.filter((_, i) => i !== index);
        renderAuctionImageGallery();
    });
    elements.auctionExpertisePickBtn.addEventListener("click", () => {
        elements.auctionExpertiseFileInput.click();
    });
    bindDropzoneUpload(elements.auctionExpertiseDropzone, elements.auctionExpertiseFileInput, async (files) => {
        await addReportFiles(files, "expertise");
    });
    elements.auctionExpertiseFileInput.addEventListener("change", async () => {
        const files = Array.from(elements.auctionExpertiseFileInput.files || []);
        if (files.length < 1)
            return;
        await addReportFiles(files, "expertise");
        elements.auctionExpertiseFileInput.value = "";
    });
    elements.auctionExpertiseClearBtn.addEventListener("click", () => {
        state.auctionExpertiseFiles = [];
        renderAuctionFileList("expertise");
        setStatus("Ekspertiz dosyalari temizlendi.", "ok");
    });
    elements.auctionExpertiseList.addEventListener("click", (event) => {
        const btn = event.target.closest("button[data-remove-expertise-index]");
        if (!btn)
            return;
        const index = Number(btn.dataset.removeExpertiseIndex || -1);
        if (!Number.isFinite(index) || index < 0)
            return;
        state.auctionExpertiseFiles = state.auctionExpertiseFiles.filter((_, i) => i !== index);
        renderAuctionFileList("expertise");
    });
    elements.auctionDocumentPickBtn.addEventListener("click", () => {
        elements.auctionDocumentFileInput.click();
    });
    bindDropzoneUpload(elements.auctionDocumentDropzone, elements.auctionDocumentFileInput, async (files) => {
        await addReportFiles(files, "document");
    });
    elements.auctionDocumentFileInput.addEventListener("change", async () => {
        const files = Array.from(elements.auctionDocumentFileInput.files || []);
        if (files.length < 1)
            return;
        await addReportFiles(files, "document");
        elements.auctionDocumentFileInput.value = "";
    });
    elements.auctionDocumentClearBtn.addEventListener("click", () => {
        state.auctionDocumentFiles = [];
        renderAuctionFileList("document");
        setStatus("Dokuman dosyalari temizlendi.", "ok");
    });
    elements.auctionDocumentList.addEventListener("click", (event) => {
        const btn = event.target.closest("button[data-remove-document-index]");
        if (!btn)
            return;
        const index = Number(btn.dataset.removeDocumentIndex || -1);
        if (!Number.isFinite(index) || index < 0)
            return;
        state.auctionDocumentFiles = state.auctionDocumentFiles.filter((_, i) => i !== index);
        renderAuctionFileList("document");
    });
    elements.auctionForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearAuctionFieldErrors();
        const auctionId = String(elements.auctionIdInput.value || "").trim();
        const payload = readAuctionFormPayload();
        const validationIssues = validateAuctionFormPayload(payload);
        if (validationIssues.length > 0) {
            applyAuctionValidationIssues(validationIssues);
            return;
        }
        await safeAction(elements.auctionForm, async () => {
            if (auctionId) {
                await apiFetch(`/api/admin/auctions/${encodeURIComponent(auctionId)}`, { method: "PUT", body: payload });
            }
            else {
                await apiFetch("/api/admin/auctions", { method: "POST", body: payload });
            }
            clearAuctionFieldErrors();
            resetAuctionForm();
            await loadAuctions();
            renderAuctions();
            renderStats();
            const message = auctionId ? "Ihale guncellendi." : "Ihale eklendi.";
            setStatus(message, "ok");
            alert(`${message} Kaydetme basarili.`);
            hideAuctionForm();
            elements.auctionListCard.scrollIntoView({ behavior: "smooth", block: "start" });
        }, {
            suppressDefaultErrorStatus: true,
            onError: (error) => {
                handleAuctionSubmitError(error);
            },
        });
    });
    elements.auctionResetBtn.addEventListener("click", () => resetAuctionForm());
    elements.auctionRows.addEventListener("click", async (event) => {
        const btn = event.target.closest("button[data-action]");
        if (!btn)
            return;
        const action = String(btn.dataset.action || "");
        const auctionId = String(btn.dataset.id || "");
        const auction = state.auctions.find((x) => x.id === auctionId);
        if (!auction)
            return;
        if (action === "edit-auction") {
            fillAuctionForm(auction);
            showAuctionForm();
            state.activeTab = "auctions";
            renderTabs();
            updateFormHeadings();
            return;
        }
        if (action === "delete-auction") {
            if (!confirm(`"${auction.lot_no}" nolu ihaleyi silmek istiyor musunuz?`))
                return;
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
    if (!String(elements.auctionIdInput.value || "").trim()) {
        resetAuctionForm();
    }
    updateFormHeadings();
}
function renderTabs() {
    const buttons = Array.from(elements.tabs.querySelectorAll("button[data-tab]"));
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
}
function renderStats() {
    const totalUsers = state.users.length;
    const managerCount = state.users.filter((x) => x.role === ROLE_ADMIN || x.role === ROLE_MANAGER).length;
    const disabledUsers = state.users.filter((x) => x.isDisabled === true).length;
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
    const selectedExists = users.some((user) => String(user.id || "") === selectedUserId);
    if (!selectedExists) {
        state.selectedUserId = String(users[0].id || "");
    }
    const selected = users.find((user) => String(user.id || "") === String(state.selectedUserId || "")) || users[0];
    elements.userList.innerHTML = users
        .map((user) => renderUserListItem(user, String(user.id || "") === String(state.selectedUserId || "")))
        .join("");
    elements.userDetail.innerHTML = renderUserDetail(selected);
}
function renderUserListItem(user, isSelected) {
    const status = user.isDisabled ? "Pasif" : "Aktif";
    return `
    <button class="userListItem ${isSelected ? "active" : ""}" data-action="select-user" data-user-id="${escapeHtml(user.id || "")}" type="button">
      <div class="userLineTop">${escapeHtml(user.name || "Isimsiz")}</div>
      <div class="userLineMeta">${escapeHtml(user.email || "-")}</div>
      <div class="userLineMeta">${escapeHtml(normalizeRole(user.role).toUpperCase())} | ${status}</div>
    </button>
  `;
}
function renderUserDetail(user) {
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
    const permissionButtons = state.permissionDefs
        .map((perm) => {
        const enabled = permissions[perm.key] === true;
        const cls = `${enabled ? "permBtn on" : "permBtn off"}${isAdminUser ? " locked" : ""}`;
        const lockBadge = isAdminUser ? " (Sabit)" : "";
        const stateLabel = enabled ? "Acik" : "Kapali";
        return `<button class="${cls}" data-action="toggle-permission" data-user-id="${escapeHtml(user.id)}" data-permission-key="${escapeHtml(perm.key)}" data-enabled="${enabled ? "true" : "false"}" ${isAdminUser ? "disabled" : ""}>${escapeHtml(perm.label)}: ${stateLabel}${lockBadge}</button>`;
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
        <select class="roleSelect" data-action="change-role" data-user-id="${escapeHtml(user.id)}" ${isAdminUser ? "disabled" : ""}>
          <option value="member" ${role === ROLE_MEMBER ? "selected" : ""}>Standart</option>
          <option value="manager" ${role === ROLE_MANAGER ? "selected" : ""}>Yonetici</option>
          <option value="admin" ${role === ROLE_ADMIN ? "selected" : ""}>Admin</option>
        </select>
      </div>
    </div>
    <div class="actionBar">
      <button class="${statusBtnClass}" data-action="toggle-status" data-user-id="${escapeHtml(user.id)}" data-disabled="${user.isDisabled ? "true" : "false"}">${statusBtnText}</button>
      <button class="miniBtn" data-action="revoke-sessions" data-user-id="${escapeHtml(user.id)}">Oturumlari Sonlandir</button>
    </div>
    <div class="permGrid">${permissionButtons}</div>
  `;
}
function renderCatalog() {
    fillGroupSelect(elements.categoryGroupSelect, true);
    if (!String(elements.categoryGroupSelect.value || "").trim()) {
        const firstActiveGroup = state.groups.find((x) => Number(x.is_active || 0) === 1) || state.groups[0] || null;
        if (firstActiveGroup) {
            elements.categoryGroupSelect.value = String(firstActiveGroup.id || "");
        }
    }
    fillGroupSelect(elements.auctionGroupSelect, false);
    ensureAuctionSelectionDefaults();
    fillAuctionCategorySelect();
    const q = String(state.catalogQuery || "").trim().toLowerCase();
    const groupNameById = new Map(state.groups.map((g) => [g.id, g.name]));
    const groups = state.groups.filter((group) => {
        if (!q)
            return true;
        return String(group.name || "").toLowerCase().includes(q);
    });
    const categories = state.categories.filter((category) => {
        if (!q)
            return true;
        const categoryName = String(category.name || "").toLowerCase();
        const groupName = String(groupNameById.get(category.group_id) || "").toLowerCase();
        return categoryName.includes(q) || groupName.includes(q);
    });
    if (groups.length < 1) {
        elements.groupRows.innerHTML = '<tr><td colspan="3"><div class="emptyState">Filtreye uygun urun grubu bulunamadi.</div></td></tr>';
    }
    else {
        elements.groupRows.innerHTML = groups
            .map((group) => {
            const active = Number(group.is_active || 0) === 1;
            return `
        <tr>
          <td>${escapeHtml(group.name || "-")}<div class="metaLine">Sira: ${Number(group.sort_order || 0)}</div></td>
          <td><span class="pill ${active ? "ok" : "danger"}">${active ? "Aktif" : "Pasif"}</span></td>
          <td>
            <div class="rowActions">
              <button class="miniBtn" data-action="rename-group" data-id="${escapeHtml(group.id)}">Adi Duzenle</button>
              <button class="miniBtn" data-action="toggle-group" data-id="${escapeHtml(group.id)}">${active ? "Pasif Et" : "Aktif Et"}</button>
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
    }
    else {
        elements.categoryRows.innerHTML = categories
            .map((category) => {
            const active = Number(category.is_active || 0) === 1;
            return `
          <tr>
            <td>${escapeHtml(category.name || "-")}<div class="metaLine">Sira: ${Number(category.sort_order || 0)}</div></td>
            <td>${escapeHtml(groupNameById.get(category.group_id) || "-")}</td>
            <td><span class="pill ${active ? "ok" : "danger"}">${active ? "Aktif" : "Pasif"}</span></td>
            <td>
              <div class="rowActions">
                <button class="miniBtn" data-action="rename-category" data-id="${escapeHtml(category.id)}">Adi Duzenle</button>
                <button class="miniBtn" data-action="toggle-category" data-id="${escapeHtml(category.id)}">${active ? "Pasif Et" : "Aktif Et"}</button>
                <button class="miniBtn danger" data-action="delete-category" data-id="${escapeHtml(category.id)}">Sil</button>
              </div>
            </td>
          </tr>
        `;
        })
            .join("");
    }
}
function renderAuctions() {
    fillGroupSelect(elements.auctionGroupSelect, false);
    ensureAuctionSelectionDefaults();
    fillAuctionCategorySelect();
    renderAuctionVehicleSection();
    const q = String(state.auctionQuery || "").trim().toLowerCase();
    const auctions = state.auctions.filter((auction) => {
        if (!q)
            return true;
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
            auction.status,
        ]
            .map((item) => String(item || "").toLowerCase())
            .join(" ");
        return haystack.includes(q);
    });
    if (auctions.length < 1) {
        elements.auctionRows.innerHTML = '<tr><td colspan="8"><div class="emptyState">Kayitli ihale bulunamadi.</div></td></tr>';
        return;
    }
    elements.auctionRows.innerHTML = auctions
        .map((auction) => {
        return `
        <tr>
          <td>${escapeHtml(auction.lot_no || "-")}</td>
          <td>${escapeHtml(auction.title || "-")}</td>
          <td>${escapeHtml(`${auction.product_group || "-"} / ${auction.category || "-"}`)}</td>
          <td>${formatMoney(auction.start_price)}</td>
          <td>${formatDate(auction.starts_at)}</td>
          <td>${formatDate(auction.ends_at)}</td>
          <td><span class="pill ${String(auction.status || "").toUpperCase() === "ACTIVE" ? "ok" : "danger"}">${escapeHtml(formatAuctionStatus(auction.status))}</span></td>
          <td>
            <div class="rowActions">
              <button class="miniBtn" data-action="edit-auction" data-id="${escapeHtml(auction.id)}">Duzenle</button>
              <button class="miniBtn danger" data-action="delete-auction" data-id="${escapeHtml(auction.id)}">Sil</button>
            </div>
          </td>
        </tr>
      `;
    })
        .join("");
}
function fillGroupSelect(select, includeEmpty) {
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
    if (currentValue)
        select.value = currentValue;
}
function fillAuctionCategorySelect() {
    const groupId = String(elements.auctionGroupSelect.value || "");
    const currentValue = String(elements.auctionCategorySelect.value || "");
    elements.auctionCategorySelect.innerHTML = "";
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Kategori secin";
    elements.auctionCategorySelect.appendChild(emptyOption);
    const rows = state.categories.filter((x) => !groupId || x.group_id === groupId);
    for (const category of rows) {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = `${category.name}${Number(category.is_active || 0) === 1 ? "" : " (Pasif)"}`;
        elements.auctionCategorySelect.appendChild(option);
    }
    if (currentValue)
        elements.auctionCategorySelect.value = currentValue;
    if (!elements.auctionCategorySelect.value) {
        const options = Array.from(elements.auctionCategorySelect.options);
        const first = options.find((opt) => String(opt.value || "").trim().length > 0);
        if (first)
            elements.auctionCategorySelect.value = String(first.value || "");
    }
}
function fillAuctionForm(auction) {
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
        if (legacyImage)
            state.auctionImageDataUrls = [legacyImage];
    }
    renderAuctionImageGallery();
    elements.auctionCityInput.value = String(auction.city || "");
    elements.auctionDistrictInput.value = String(auction.district || "");
    elements.auctionNeighborhoodInput.value = String(auction.neighborhood || "");
    elements.auctionDescriptionInput.value = String(auction.description || "");
    elements.auctionExtraEquipmentInput.value = String(auction.extra_equipment || auction.extraEquipment || "");
    state.auctionExpertiseFiles = normalizeUploadedFileList(auction.expertise_files_json || auction.expertiseFiles || []);
    state.auctionDocumentFiles = normalizeUploadedFileList(auction.document_files_json || auction.documentFiles || []);
    renderAuctionFileList("expertise");
    renderAuctionFileList("document");
    elements.auctionVehicleBrandInput.value = String(auction.vehicle_brand || "");
    elements.auctionVehicleModelInput.value = String(auction.vehicle_model || "");
    elements.auctionVehicleModelDetailInput.value = String(auction.vehicle_model_detail || "");
    elements.auctionVehicleYearInput.value = String(auction.vehicle_year || "");
    elements.auctionVehicleKmInput.value = String(auction.vehicle_km || "");
    elements.auctionVehicleFuelTypeInput.value = String(auction.vehicle_fuel_type || "");
    elements.auctionVehicleTransmissionInput.value = String(auction.vehicle_transmission || "");
    elements.auctionVehicleBodyTypeInput.value = String(auction.vehicle_body_type || "");
    elements.auctionVehicleColorInput.value = String(auction.vehicle_color || "");
    elements.auctionVehicleEngineVolumeInput.value = String(auction.vehicle_engine_volume || "");
    elements.auctionVehicleEnginePowerInput.value = String(auction.vehicle_engine_power || "");
    elements.auctionVehicleDriveTypeInput.value = String(auction.vehicle_drive_type || "");
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
        district: String(elements.auctionDistrictInput.value || "").trim(),
        neighborhood: String(elements.auctionNeighborhoodInput.value || "").trim(),
        description: String(elements.auctionDescriptionInput.value || "").trim(),
        extraEquipment: String(elements.auctionExtraEquipmentInput.value || "").trim(),
        vehicleBrand: String(elements.auctionVehicleBrandInput.value || "").trim(),
        vehicleModel: String(elements.auctionVehicleModelInput.value || "").trim(),
        vehicleModelDetail: String(elements.auctionVehicleModelDetailInput.value || "").trim(),
        vehicleYear: Number(elements.auctionVehicleYearInput.value || 0),
        vehicleKm: Number(elements.auctionVehicleKmInput.value || 0),
        vehicleFuelType: String(elements.auctionVehicleFuelTypeInput.value || "").trim(),
        vehicleTransmission: String(elements.auctionVehicleTransmissionInput.value || "").trim(),
        vehicleBodyType: String(elements.auctionVehicleBodyTypeInput.value || "").trim(),
        vehicleColor: String(elements.auctionVehicleColorInput.value || "").trim(),
        vehicleEngineVolume: String(elements.auctionVehicleEngineVolumeInput.value || "").trim(),
        vehicleEnginePower: String(elements.auctionVehicleEnginePowerInput.value || "").trim(),
        vehicleDriveType: String(elements.auctionVehicleDriveTypeInput.value || "").trim(),
        imageUrl: imageList[0] || "",
        images: imageList,
        expertiseFiles: normalizeUploadedFileList(state.auctionExpertiseFiles || []),
        documentFiles: normalizeUploadedFileList(state.auctionDocumentFiles || []),
    };
}
function markRequiredAuctionLabels() {
    for (const binding of getAllAuctionFieldBindings()) {
        const wrap = binding.element.closest(".fieldWrap");
        if (wrap)
            wrap.classList.add("requiredField");
    }
}
function clearAuctionFieldErrors() {
    const wraps = Array.from(elements.auctionForm.querySelectorAll(".fieldWrap.invalid"));
    for (const wrap of wraps) {
        wrap.classList.remove("invalid");
    }
    const uploadBlocks = Array.from(elements.auctionForm.querySelectorAll(".uploadBlock.invalid"));
    for (const block of uploadBlocks) {
        block.classList.remove("invalid");
    }
    const hints = Array.from(elements.auctionForm.querySelectorAll(".fieldError"));
    for (const hint of hints) {
        hint.remove();
    }
    const allKeys = [...AUCTION_REQUIRED_FIELD_KEYS, "images", "expertiseFiles", "documentFiles"];
    for (const key of allKeys) {
        const binding = getAuctionFieldBinding(key);
        if (!binding)
            continue;
        binding.element.removeAttribute("aria-invalid");
    }
}
function showAuctionFieldError(issue) {
    const binding = getAuctionFieldBinding(issue.key);
    if (!binding)
        return;
    binding.element.setAttribute("aria-invalid", "true");
    const wrap = binding.element.closest(".fieldWrap");
    const block = binding.element.closest(".uploadBlock");
    const target = wrap || block;
    if (!target)
        return;
    target.classList.add("invalid");
    let hint = target.querySelector(".fieldError");
    if (!hint) {
        hint = document.createElement("small");
        hint.className = "fieldError";
        target.appendChild(hint);
    }
    hint.textContent = issue.message;
}
function validateAuctionFormPayload(payload) {
    const issues = [];
    const seen = new Set();
    const addIssue = (key, message) => {
        if (seen.has(key))
            return;
        const binding = getAuctionFieldBinding(key);
        if (!binding)
            return;
        issues.push({ key, label: binding.label, message });
        seen.add(key);
    };
    if (!String(payload.lotNo || "").trim())
        addIssue("lotNo", "Ihale no zorunludur.");
    if (!String(payload.title || "").trim())
        addIssue("title", "Ihale basligi zorunludur.");
    if (!String(payload.groupId || "").trim())
        addIssue("groupId", "Urun grubu secimi zorunludur.");
    if (!String(payload.categoryId || "").trim())
        addIssue("categoryId", "Kategori secimi zorunludur.");
    const startsAt = String(payload.startsAt || "").trim();
    const endsAt = String(payload.endsAt || "").trim();
    const startTime = startsAt ? new Date(startsAt).getTime() : Number.NaN;
    const endTime = endsAt ? new Date(endsAt).getTime() : Number.NaN;
    if (!startsAt)
        addIssue("startsAt", "Baslangic tarihi zorunludur.");
    else if (Number.isNaN(startTime))
        addIssue("startsAt", "Baslangic tarihi gecersiz.");
    if (!endsAt)
        addIssue("endsAt", "Bitis tarihi zorunludur.");
    else if (Number.isNaN(endTime))
        addIssue("endsAt", "Bitis tarihi gecersiz.");
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
    const expertiseBytes = getReportTotalBytes(payload.expertiseFiles || []);
    if (expertiseBytes > MAX_AUCTION_REPORT_TOTAL_BYTES) {
        addIssue("expertiseFiles", `Ekspertiz dosyalarinin toplam boyutu cok buyuk. En fazla ${formatBytes(MAX_AUCTION_REPORT_TOTAL_BYTES)} olabilir.`);
    }
    const documentBytes = getReportTotalBytes(payload.documentFiles || []);
    if (documentBytes > MAX_AUCTION_REPORT_TOTAL_BYTES) {
        addIssue("documentFiles", `Dokumanlarin toplam boyutu cok buyuk. En fazla ${formatBytes(MAX_AUCTION_REPORT_TOTAL_BYTES)} olabilir.`);
    }
    return issues;
}
function applyAuctionValidationIssues(issues) {
    if (!Array.isArray(issues) || issues.length < 1)
        return;
    clearAuctionFieldErrors();
    for (const issue of issues) {
        showAuctionFieldError(issue);
    }
    const labels = Array.from(new Set(issues.map((issue) => issue.label)));
    setStatus(`Lutfen zorunlu alanlari kontrol edin: ${labels.join(", ")}`, "error");
    const firstBinding = getAuctionFieldBinding(issues[0].key);
    if (firstBinding) {
        firstBinding.element.focus();
        if (typeof firstBinding.element.select === "function") {
            try {
                firstBinding.element.select();
            }
            catch {
                // select her input turunde desteklenmeyebilir
            }
        }
    }
}
function normalizeSearchText(value) {
    return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replaceAll("ı", "i");
}
function parseAuctionValidationIssuesFromMessage(messageRaw) {
    const message = normalizeSearchText(messageRaw);
    const issues = [];
    const seen = new Set();
    const addIssue = (key, issueMessage) => {
        if (seen.has(key))
            return;
        const binding = getAuctionFieldBinding(key);
        if (!binding)
            return;
        issues.push({ key, label: binding.label, message: issueMessage });
        seen.add(key);
    };
    if (message.includes("ihale no zorunludur") || message.includes("ihale no") && message.includes("kullaniliyor")) {
        addIssue("lotNo", "Ihale no alanini kontrol edin.");
    }
    if (message.includes("ihale basligi zorunludur"))
        addIssue("title", "Ihale basligi zorunludur.");
    if (message.includes("baslangic bedeli"))
        addIssue("startPrice", "Baslangic bedeli alanini kontrol edin.");
    if (message.includes("min artis"))
        addIssue("minIncrement", "Minimum artis alanini kontrol edin.");
    if (message.includes("baslangic tarihi"))
        addIssue("startsAt", "Baslangic tarihi alanini kontrol edin.");
    if (message.includes("bitis tarihi"))
        addIssue("endsAt", "Bitis tarihi alanini kontrol edin.");
    if (message.includes("urun grubu") && message.includes("zorunlu"))
        addIssue("groupId", "Urun grubu secimi zorunludur.");
    if (message.includes("kategori") && message.includes("zorunlu"))
        addIssue("categoryId", "Kategori secimi zorunludur.");
    if (message.includes("secilen urun grubu bulunamadi"))
        addIssue("groupId", "Secilen urun grubu bulunamadi.");
    if (message.includes("secilen kategori bulunamadi"))
        addIssue("categoryId", "Secilen kategori bulunamadi.");
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
    if (message.includes("ekspertiz") && message.includes("toplam boyut")) {
        addIssue("expertiseFiles", "Ekspertiz dosyalarinin toplam boyutu fazla.");
    }
    if (message.includes("dokuman") && message.includes("toplam boyut")) {
        addIssue("documentFiles", "Dokumanlarin toplam boyutu fazla.");
    }
    if (message.includes("payload too large") || message.includes("request entity too large") || message.includes("string or blob too big")) {
        addIssue("images", "Yuklenen medya boyutu fazla. Gorsel veya dosya sayisini azaltin.");
    }
    return issues;
}
function handleAuctionSubmitError(error) {
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
    const firstGroup = state.groups.find((x) => Number(x.is_active || 0) === 1) || state.groups[0] || null;
    elements.auctionGroupSelect.value = firstGroup ? String(firstGroup.id || "") : "";
    fillAuctionCategorySelect();
    renderAuctionVehicleSection();
    const categoryOptions = Array.from(elements.auctionCategorySelect.options);
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
    elements.auctionCityInput.value = "";
    elements.auctionDistrictInput.value = "";
    elements.auctionNeighborhoodInput.value = "";
    elements.auctionDescriptionInput.value = "";
    elements.auctionExtraEquipmentInput.value = "";
    state.auctionExpertiseFiles = [];
    state.auctionDocumentFiles = [];
    renderAuctionFileList("expertise");
    renderAuctionFileList("document");
    elements.auctionVehicleBrandInput.value = "";
    elements.auctionVehicleModelInput.value = "";
    elements.auctionVehicleModelDetailInput.value = "";
    elements.auctionVehicleYearInput.value = "";
    elements.auctionVehicleKmInput.value = "";
    elements.auctionVehicleFuelTypeInput.value = "";
    elements.auctionVehicleTransmissionInput.value = "";
    elements.auctionVehicleBodyTypeInput.value = "";
    elements.auctionVehicleColorInput.value = "";
    elements.auctionVehicleEngineVolumeInput.value = "";
    elements.auctionVehicleEnginePowerInput.value = "";
    elements.auctionVehicleDriveTypeInput.value = "";
    updateFormHeadings();
}
function ensureAuctionSelectionDefaults() {
    if (!elements.auctionGroupSelect.value) {
        const firstGroup = state.groups.find((x) => Number(x.is_active || 0) === 1) || state.groups[0] || null;
        if (firstGroup)
            elements.auctionGroupSelect.value = String(firstGroup.id || "");
    }
}
function renderAuctionVehicleSection() {
    const selectedGroupId = String(elements.auctionGroupSelect.value || "");
    const selectedGroup = state.groups.find((x) => String(x.id || "") === selectedGroupId);
    const groupName = String(selectedGroup?.name || "").toLowerCase();
    const isVehicleGroup = groupName.includes("vasita") || groupName.includes("otomotiv");
    elements.auctionVehicleSection.classList.toggle("hide", !isVehicleGroup);
}
function showAuctionForm() {
    elements.auctionFormCard.classList.remove("hide");
}
function hideAuctionForm() {
    elements.auctionFormCard.classList.add("hide");
}
function bindDropzoneUpload(dropzone, input, onFiles) {
    dropzone.addEventListener("click", () => input.click());
    dropzone.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ")
            return;
        event.preventDefault();
        input.click();
    });
    dropzone.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropzone.classList.add("dragOver");
    });
    dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragOver");
    });
    dropzone.addEventListener("drop", async (event) => {
        event.preventDefault();
        dropzone.classList.remove("dragOver");
        const files = Array.from(event.dataTransfer?.files || []);
        if (files.length < 1)
            return;
        await onFiles(files);
    });
}
async function addAuctionImagesFromFiles(files) {
    if (files.length < 1)
        return;
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
        }
        catch (error) {
            console.error(error);
        }
    }
    state.auctionImageDataUrls = normalizeAuctionImageList(state.auctionImageDataUrls);
    renderAuctionImageGallery();
    if (added > 0) {
        const totalBytes = getGalleryTotalBytes(state.auctionImageDataUrls);
        if (skippedForSize > 0) {
            setStatus(`${added} gorsel eklendi. ${skippedForSize} dosya toplam boyut siniri nedeniyle atlandi (${formatBytes(MAX_AUCTION_GALLERY_TOTAL_BYTES)}).`, "warn");
        }
        else {
            setStatus(`${added} gorsel eklendi. Toplam gorsel boyutu: ${formatBytes(totalBytes)}.`, "ok");
        }
    }
    else {
        if (skippedForSize > 0) {
            setStatus(`Gorseller eklenemedi. Toplam gorsel boyutu en fazla ${formatBytes(MAX_AUCTION_GALLERY_TOTAL_BYTES)} olabilir.`, "error");
        }
        else {
            setStatus("Uygun gorsel bulunamadi.", "error");
        }
    }
}
async function addReportFiles(files, mode) {
    if (files.length < 1)
        return;
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
        }
        catch (error) {
            console.error(error);
        }
    }
    if (mode === "expertise") {
        state.auctionExpertiseFiles = normalizeUploadedFileList(current);
    }
    else {
        state.auctionDocumentFiles = normalizeUploadedFileList(current);
    }
    renderAuctionFileList(mode);
    const label = mode === "expertise" ? "Ekspertiz" : "Dokuman";
    const totalBytes = getReportTotalBytes(mode === "expertise" ? state.auctionExpertiseFiles : state.auctionDocumentFiles);
    if (added > 0) {
        if (skippedForSize > 0) {
            setStatus(`${label} dosyalari guncellendi (${added} yeni). ${skippedForSize} dosya toplam boyut siniri nedeniyle atlandi (${formatBytes(MAX_AUCTION_REPORT_TOTAL_BYTES)}).`, "warn");
        }
        else {
            setStatus(`${label} dosyalari guncellendi (${added} yeni, toplam ${formatBytes(totalBytes)}).`, "ok");
        }
    }
    else {
        if (skippedForSize > 0) {
            setStatus(`${label} dosyalari eklenemedi. Toplam dosya boyutu en fazla ${formatBytes(MAX_AUCTION_REPORT_TOTAL_BYTES)} olabilir.`, "warn");
        }
        else {
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
    elements.auctionImageMeta.textContent = `${rows.length} gorsel secili (${formatBytes(totalBytes)}). Ilk gorsel kart gorseli olarak kullanilacak.`;
    elements.auctionImageGallery.innerHTML = rows
        .map((dataUrl, index) => `
        <div class="uploadItem">
          <img src="${escapeHtml(dataUrl)}" alt="Gorsel ${index + 1}">
          <div class="uploadItemMeta">
            <strong>Gorsel ${index + 1}</strong>
            <button class="removeTinyBtn" type="button" data-remove-image-index="${index}">Sil</button>
          </div>
        </div>
      `)
        .join("");
}
function renderAuctionFileList(mode) {
    const isExpertise = mode === "expertise";
    const rows = normalizeUploadedFileList(isExpertise ? state.auctionExpertiseFiles : state.auctionDocumentFiles);
    const targetList = isExpertise ? elements.auctionExpertiseList : elements.auctionDocumentList;
    const targetMeta = isExpertise ? elements.auctionExpertiseMeta : elements.auctionDocumentMeta;
    const datasetAttr = isExpertise ? "data-remove-expertise-index" : "data-remove-document-index";
    const emptyLabel = isExpertise ? "Henuz ekspertiz dosyasi secilmedi." : "Henuz dokuman secilmedi.";
    if (isExpertise)
        state.auctionExpertiseFiles = rows;
    else
        state.auctionDocumentFiles = rows;
    if (rows.length < 1) {
        targetMeta.textContent = emptyLabel;
        targetList.innerHTML = '<div class="fileItemEmpty">Dosya bulunmuyor.</div>';
        return;
    }
    const totalBytes = getReportTotalBytes(rows);
    targetMeta.textContent = `${rows.length} dosya secili (${formatBytes(totalBytes)}).`;
    targetList.innerHTML = rows
        .map((item, index) => {
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
function normalizeAuctionImageList(input) {
    const values = parseJsonArrayMaybe(input);
    const out = [];
    for (const value of values) {
        const item = String(value || "").trim();
        if (!item)
            continue;
        if (!(item.startsWith("data:image/") || /^https?:\/\//i.test(item)))
            continue;
        out.push(item);
        if (out.length >= MAX_AUCTION_IMAGE_COUNT)
            break;
    }
    return out;
}
function normalizeUploadedFileList(input) {
    const values = parseJsonArrayMaybe(input);
    const out = [];
    for (const raw of values) {
        const obj = typeof raw === "object" && raw ? raw : {};
        const dataUrl = String(obj.dataUrl || obj.url || "").trim();
        if (!dataUrl)
            continue;
        if (!(dataUrl.startsWith("data:") || /^https?:\/\//i.test(dataUrl)))
            continue;
        const type = String(obj.type || "").trim().toLowerCase();
        const guessedType = type || (dataUrl.startsWith("data:application/pdf") ? "application/pdf" : "image/jpeg");
        const entry = {
            name: String(obj.name || "dosya").slice(0, 140),
            type: guessedType,
            size: Number(obj.size || 0),
            dataUrl,
        };
        out.push(entry);
        if (out.length >= MAX_AUCTION_FILE_COUNT)
            break;
    }
    return out;
}
function estimateStoredValueBytes(value) {
    const text = String(value || "").trim();
    if (!text)
        return 0;
    if (text.startsWith("data:"))
        return estimateDataUrlBytes(text);
    return Math.min(text.length, 4096);
}
function getGalleryTotalBytes(input) {
    const items = normalizeAuctionImageList(input);
    return items.reduce((sum, item) => sum + estimateStoredValueBytes(item), 0);
}
function getReportTotalBytes(input) {
    const files = normalizeUploadedFileList(input);
    return files.reduce((sum, item) => sum + estimateStoredValueBytes(item.dataUrl), 0);
}
function parseJsonArrayMaybe(input) {
    if (Array.isArray(input))
        return input;
    if (typeof input === "string") {
        const text = String(input || "").trim();
        if (!text)
            return [];
        if (text.startsWith("[")) {
            try {
                const parsed = JSON.parse(text);
                return Array.isArray(parsed) ? parsed : [];
            }
            catch {
                return [];
            }
        }
        return [text];
    }
    return [];
}
function clearAuctionImageSelection() {
    state.auctionImageDataUrls = [];
    renderAuctionImageGallery();
}
async function readGenericFileAsDataUrl(file) {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Dosya okunamadi."));
        reader.readAsDataURL(file);
    });
}
async function optimizeAuctionImage(file) {
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
    if (!context)
        throw new Error("Tarayici gorsel isleme destegi vermiyor.");
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
    if (!bestDataUrl)
        throw new Error("Gorsel donusturulemedi.");
    return bestDataUrl;
}
async function readImageFile(file) {
    const objectUrl = URL.createObjectURL(file);
    try {
        return await new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error("Dosya gorsel olarak okunamadi."));
            image.src = objectUrl;
        });
    }
    finally {
        URL.revokeObjectURL(objectUrl);
    }
}
function estimateDataUrlBytes(dataUrl) {
    const body = String(dataUrl || "").split(",")[1] || "";
    return Math.ceil((body.length * 3) / 4);
}
function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0)
        return "0 B";
    if (bytes < 1024)
        return `${Math.round(bytes)} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
function filterUsers(users, query) {
    if (!query)
        return users;
    return users.filter((user) => {
        const email = String(user.email || "").toLowerCase();
        const name = String(user.name || "").toLowerCase();
        return email.includes(query) || name.includes(query);
    });
}
function normalizeRole(role) {
    const value = String(role || "").toLowerCase();
    if (value === ROLE_ADMIN)
        return ROLE_ADMIN;
    if (value === ROLE_MANAGER)
        return ROLE_MANAGER;
    return ROLE_MEMBER;
}
function updateFormHeadings() {
    const isEditingAuction = String(elements.auctionIdInput.value || "").trim().length > 0;
    elements.auctionFormTitle.textContent = isEditingAuction ? "Ihale Duzenle" : "Ihale Ekle";
    elements.auctionSaveBtn.textContent = isEditingAuction ? "Guncelle" : "Kaydet";
}
function setStatus(text, kind) {
    elements.statusLine.className = "statusLine";
    if (kind)
        elements.statusLine.classList.add(kind);
    elements.statusLine.textContent = text || "";
}
async function safeAction(control, handler, options = {}) {
    const prevDisabled = control.disabled === true;
    control.classList.add("busy");
    control.disabled = true;
    try {
        await handler();
    }
    catch (error) {
        console.error(error);
        if (typeof options.onError === "function") {
            options.onError(error);
        }
        if (!options.suppressDefaultErrorStatus) {
            setStatus(error.message || "Islem sirasinda hata olustu.", "error");
        }
    }
    finally {
        control.disabled = prevDisabled;
        control.classList.remove("busy");
    }
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
function formatAuctionStatus(status) {
    const value = String(status || "").toUpperCase();
    if (value === "ACTIVE")
        return "Yayinda";
    if (value === "ENDED")
        return "Sonlandirildi";
    return value || "-";
}
function toDateTimeLocal(value) {
    if (!value)
        return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return "";
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
}
function toIsoFromDateTimeLocal(value) {
    if (!value)
        return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return "";
    return date.toISOString();
}
function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
function byId(id) {
    return document.getElementById(id);
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
        const error = new Error(data.error || `Istek basarisiz (${response.status})`);
        error.status = response.status;
        error.payload = data;
        error.path = path;
        throw error;
    }
    return data;
}
