"use strict";
const API_BASE = "";
const ROLE_MEMBER = "member";
const ROLE_MANAGER = "manager";
const ROLE_ADMIN = "admin";
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
    groups: [],
    categories: [],
    auctions: [],
    permissionDefs: defaultPermissionDefs,
    query: "",
    catalogQuery: "",
    auctionQuery: "",
};
const elements = {
    refreshBtn: byId("refreshBtn"),
    searchInput: byId("searchInput"),
    sessionBox: byId("sessionBox"),
    statusLine: byId("statusLine"),
    tabs: byId("tabs"),
    panelUsers: byId("panelUsers"),
    panelCatalog: byId("panelCatalog"),
    panelAuctions: byId("panelAuctions"),
    catalogSearchInput: byId("catalogSearchInput"),
    auctionSearchInput: byId("auctionSearchInput"),
    userList: byId("userList"),
    statTotalUsers: byId("statTotalUsers"),
    statManagers: byId("statManagers"),
    statDisabledUsers: byId("statDisabledUsers"),
    statGroups: byId("statGroups"),
    statCategories: byId("statCategories"),
    statAuctions: byId("statAuctions"),
    groupForm: byId("groupForm"),
    groupIdInput: byId("groupIdInput"),
    groupNameInput: byId("groupNameInput"),
    groupSortInput: byId("groupSortInput"),
    groupActiveInput: byId("groupActiveInput"),
    groupResetBtn: byId("groupResetBtn"),
    groupFormTitle: byId("groupFormTitle"),
    groupSaveBtn: byId("groupSaveBtn"),
    groupRows: byId("groupRows"),
    categoryForm: byId("categoryForm"),
    categoryIdInput: byId("categoryIdInput"),
    categoryGroupSelect: byId("categoryGroupSelect"),
    categoryNameInput: byId("categoryNameInput"),
    categorySortInput: byId("categorySortInput"),
    categoryActiveInput: byId("categoryActiveInput"),
    categoryResetBtn: byId("categoryResetBtn"),
    categoryFormTitle: byId("categoryFormTitle"),
    categorySaveBtn: byId("categorySaveBtn"),
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
    auctionEndsAtInput: byId("auctionEndsAtInput"),
    auctionImageUrlInput: byId("auctionImageUrlInput"),
    auctionCityInput: byId("auctionCityInput"),
    auctionDistrictInput: byId("auctionDistrictInput"),
    auctionNeighborhoodInput: byId("auctionNeighborhoodInput"),
    auctionResetBtn: byId("auctionResetBtn"),
    auctionFormTitle: byId("auctionFormTitle"),
    auctionSaveBtn: byId("auctionSaveBtn"),
    auctionRows: byId("auctionRows"),
};
init().catch((error) => {
    console.error(error);
    setStatus(error.message || "Yonetim paneli yuklenemedi.", "error");
});
async function init() {
    setStatus("Veriler yukleniyor...", "warn");
    await bootstrapData();
    bindEvents();
    renderAll();
    setStatus("Yonetim paneli hazir.", "ok");
}
async function bootstrapData() {
    const me = await apiFetch("/api/admin/me");
    state.currentUser = me.user || null;
    const permissionDefs = await apiFetch("/api/admin/permission-keys");
    if (Array.isArray(permissionDefs.items) && permissionDefs.items.length > 0) {
        state.permissionDefs = permissionDefs.items
            .map((item) => ({ key: String(item.key || ""), label: String(item.label || item.key || "") }))
            .filter((item) => item.key);
    }
    await reloadAll();
}
async function reloadAll() {
    await Promise.all([loadUsers(), loadCatalog(), loadAuctions()]);
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
    elements.userList.addEventListener("change", async (event) => {
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
            setStatus("Rol guncellendi.", "ok");
        });
    });
}
function bindCatalogEvents() {
    elements.groupForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const groupId = String(elements.groupIdInput.value || "").trim();
        const payload = {
            name: String(elements.groupNameInput.value || "").trim(),
            sortOrder: Number(elements.groupSortInput.value || 0),
            isActive: elements.groupActiveInput.checked === true,
        };
        if (!payload.name) {
            setStatus("Urun grubu adi zorunludur.", "error");
            return;
        }
        await safeAction(elements.groupForm, async () => {
            if (groupId) {
                await apiFetch(`/api/admin/product-groups/${encodeURIComponent(groupId)}`, { method: "PUT", body: payload });
            }
            else {
                await apiFetch("/api/admin/product-groups", { method: "POST", body: payload });
            }
            resetGroupForm();
            await loadCatalog();
            renderCatalog();
            renderStats();
            setStatus(groupId ? "Urun grubu guncellendi." : "Urun grubu eklendi.", "ok");
        });
    });
    elements.groupResetBtn.addEventListener("click", () => resetGroupForm());
    elements.groupRows.addEventListener("click", async (event) => {
        const btn = event.target.closest("button[data-action]");
        if (!btn)
            return;
        const action = String(btn.dataset.action || "");
        const groupId = String(btn.dataset.id || "");
        const group = state.groups.find((x) => x.id === groupId);
        if (!group)
            return;
        if (action === "edit-group") {
            elements.groupIdInput.value = group.id;
            elements.groupNameInput.value = group.name || "";
            elements.groupSortInput.value = String(group.sort_order ?? 0);
            elements.groupActiveInput.checked = Number(group.is_active || 0) === 1;
            updateFormHeadings();
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
        const categoryId = String(elements.categoryIdInput.value || "").trim();
        const payload = {
            groupId: String(elements.categoryGroupSelect.value || "").trim(),
            name: String(elements.categoryNameInput.value || "").trim(),
            sortOrder: Number(elements.categorySortInput.value || 0),
            isActive: elements.categoryActiveInput.checked === true,
        };
        if (!payload.groupId || !payload.name) {
            setStatus("Kategori grubu ve adi zorunludur.", "error");
            return;
        }
        await safeAction(elements.categoryForm, async () => {
            if (categoryId) {
                await apiFetch(`/api/admin/categories/${encodeURIComponent(categoryId)}`, { method: "PUT", body: payload });
            }
            else {
                await apiFetch("/api/admin/categories", { method: "POST", body: payload });
            }
            resetCategoryForm();
            await loadCatalog();
            renderCatalog();
            renderStats();
            setStatus(categoryId ? "Kategori guncellendi." : "Kategori eklendi.", "ok");
        });
    });
    elements.categoryResetBtn.addEventListener("click", () => resetCategoryForm());
    elements.categoryRows.addEventListener("click", async (event) => {
        const btn = event.target.closest("button[data-action]");
        if (!btn)
            return;
        const action = String(btn.dataset.action || "");
        const categoryId = String(btn.dataset.id || "");
        const category = state.categories.find((x) => x.id === categoryId);
        if (!category)
            return;
        if (action === "edit-category") {
            elements.categoryIdInput.value = category.id;
            elements.categoryGroupSelect.value = category.group_id || "";
            elements.categoryNameInput.value = category.name || "";
            elements.categorySortInput.value = String(category.sort_order ?? 0);
            elements.categoryActiveInput.checked = Number(category.is_active || 0) === 1;
            updateFormHeadings();
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
    elements.auctionGroupSelect.addEventListener("change", () => {
        fillAuctionCategorySelect();
    });
    elements.auctionForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const auctionId = String(elements.auctionIdInput.value || "").trim();
        const payload = readAuctionFormPayload();
        await safeAction(elements.auctionForm, async () => {
            if (auctionId) {
                await apiFetch(`/api/admin/auctions/${encodeURIComponent(auctionId)}`, { method: "PUT", body: payload });
            }
            else {
                await apiFetch("/api/admin/auctions", { method: "POST", body: payload });
            }
            resetAuctionForm();
            await loadAuctions();
            renderAuctions();
            renderStats();
            setStatus(auctionId ? "Ihale guncellendi." : "Ihale eklendi.", "ok");
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
        return;
    }
    elements.userList.innerHTML = users.map(renderUserCard).join("");
}
function renderUserCard(user) {
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
        return `<button class="${cls}" data-action="toggle-permission" data-user-id="${escapeHtml(user.id)}" data-permission-key="${escapeHtml(perm.key)}" data-enabled="${enabled ? "true" : "false"}" ${isAdminUser ? "disabled" : ""}>${escapeHtml(perm.label)}${lockBadge}</button>`;
    })
        .join("");
    return `
    <article class="userCard">
      <div class="userHead">
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
    </article>
  `;
}
function renderCatalog() {
    fillGroupSelect(elements.categoryGroupSelect, true);
    fillGroupSelect(elements.auctionGroupSelect, true);
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
              <button class="miniBtn" data-action="edit-group" data-id="${escapeHtml(group.id)}">Duzenle</button>
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
                <button class="miniBtn" data-action="edit-category" data-id="${escapeHtml(category.id)}">Duzenle</button>
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
    fillGroupSelect(elements.auctionGroupSelect, true);
    fillAuctionCategorySelect();
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
            auction.status,
        ]
            .map((item) => String(item || "").toLowerCase())
            .join(" ");
        return haystack.includes(q);
    });
    if (auctions.length < 1) {
        elements.auctionRows.innerHTML = '<tr><td colspan="7"><div class="emptyState">Kayitli ihale bulunamadi.</div></td></tr>';
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
          <td>${formatDate(auction.ends_at)}</td>
          <td><span class="pill ${String(auction.status || "").toUpperCase() === "ACTIVE" ? "ok" : "danger"}">${escapeHtml(auction.status || "-")}</span></td>
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
}
function fillAuctionForm(auction) {
    elements.auctionIdInput.value = String(auction.id || "");
    elements.auctionLotNoInput.value = String(auction.lot_no || "");
    elements.auctionTitleInput.value = String(auction.title || "");
    elements.auctionGroupSelect.value = String(auction.product_group_id || "");
    fillAuctionCategorySelect();
    elements.auctionCategorySelect.value = String(auction.category_id || "");
    elements.auctionStartPriceInput.value = String(Number(auction.start_price || 0));
    elements.auctionMinIncrementInput.value = String(Number(auction.min_increment || 1000));
    elements.auctionStatusInput.value = String(auction.status || "ACTIVE");
    elements.auctionEndsAtInput.value = toDateTimeLocal(auction.ends_at);
    elements.auctionImageUrlInput.value = String(auction.image_url || "");
    elements.auctionCityInput.value = String(auction.city || "");
    elements.auctionDistrictInput.value = String(auction.district || "");
    elements.auctionNeighborhoodInput.value = String(auction.neighborhood || "");
    updateFormHeadings();
}
function readAuctionFormPayload() {
    const endsAtLocal = String(elements.auctionEndsAtInput.value || "").trim();
    return {
        lotNo: String(elements.auctionLotNoInput.value || "").trim().toUpperCase(),
        title: String(elements.auctionTitleInput.value || "").trim(),
        groupId: String(elements.auctionGroupSelect.value || "").trim(),
        categoryId: String(elements.auctionCategorySelect.value || "").trim(),
        startPrice: Number(elements.auctionStartPriceInput.value || 0),
        minIncrement: Number(elements.auctionMinIncrementInput.value || 0),
        status: String(elements.auctionStatusInput.value || "ACTIVE"),
        endsAt: toIsoFromDateTimeLocal(endsAtLocal),
        city: String(elements.auctionCityInput.value || "").trim(),
        district: String(elements.auctionDistrictInput.value || "").trim(),
        neighborhood: String(elements.auctionNeighborhoodInput.value || "").trim(),
        imageUrl: String(elements.auctionImageUrlInput.value || "").trim(),
    };
}
function resetGroupForm() {
    elements.groupIdInput.value = "";
    elements.groupNameInput.value = "";
    elements.groupSortInput.value = "0";
    elements.groupActiveInput.checked = true;
    updateFormHeadings();
}
function resetCategoryForm() {
    elements.categoryIdInput.value = "";
    elements.categoryNameInput.value = "";
    elements.categorySortInput.value = "0";
    elements.categoryActiveInput.checked = true;
    if (state.groups.length > 0) {
        elements.categoryGroupSelect.value = String(state.groups[0].id || "");
    }
    updateFormHeadings();
}
function resetAuctionForm() {
    elements.auctionIdInput.value = "";
    elements.auctionLotNoInput.value = "";
    elements.auctionTitleInput.value = "";
    elements.auctionGroupSelect.value = "";
    fillAuctionCategorySelect();
    elements.auctionCategorySelect.value = "";
    elements.auctionStartPriceInput.value = "";
    elements.auctionMinIncrementInput.value = "1000";
    elements.auctionStatusInput.value = "ACTIVE";
    elements.auctionEndsAtInput.value = "";
    elements.auctionImageUrlInput.value = "";
    elements.auctionCityInput.value = "";
    elements.auctionDistrictInput.value = "";
    elements.auctionNeighborhoodInput.value = "";
    updateFormHeadings();
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
    const isEditingGroup = String(elements.groupIdInput.value || "").trim().length > 0;
    const isEditingCategory = String(elements.categoryIdInput.value || "").trim().length > 0;
    const isEditingAuction = String(elements.auctionIdInput.value || "").trim().length > 0;
    elements.groupFormTitle.textContent = isEditingGroup ? "Urun Grubu Duzenle" : "Urun Grubu Ekle";
    elements.categoryFormTitle.textContent = isEditingCategory ? "Kategori Duzenle" : "Kategori Ekle";
    elements.auctionFormTitle.textContent = isEditingAuction ? "Ihale Duzenle" : "Ihale Ekle";
    elements.groupSaveBtn.textContent = isEditingGroup ? "Guncelle" : "Kaydet";
    elements.categorySaveBtn.textContent = isEditingCategory ? "Guncelle" : "Kaydet";
    elements.auctionSaveBtn.textContent = isEditingAuction ? "Guncelle" : "Kaydet";
}
function setStatus(text, kind) {
    elements.statusLine.className = "statusLine";
    if (kind)
        elements.statusLine.classList.add(kind);
    elements.statusLine.textContent = text || "";
}
async function safeAction(control, handler) {
    const prevDisabled = control.disabled === true;
    control.classList.add("busy");
    control.disabled = true;
    try {
        await handler();
    }
    catch (error) {
        console.error(error);
        setStatus(error.message || "Islem sirasinda hata olustu.", "error");
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
        throw new Error(data.error || `Istek basarisiz (${response.status})`);
    }
    return data;
}
