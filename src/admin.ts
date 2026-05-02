const API_BASE = "";
const ROLE_MEMBER = "member";
const ROLE_MANAGER = "manager";
const ROLE_ADMIN = "admin";

const defaultPermissionDefs = [
  { key: "admin.panel.access", label: "Admin panel erişimi" },
  { key: "bids.place", label: "Teklif verebilir" },
  { key: "users.view", label: "Kullanıcıları görüntüleyebilir" },
  { key: "users.block", label: "Kullanıcıyı pasife alabilir" },
  { key: "users.permissions", label: "Rol/yetki düzenleyebilir" },
  { key: "users.sessions.revoke", label: "Oturum sonlandırabilir" },
  { key: "auctions.create", label: "İhale oluşturabilir" },
  { key: "auctions.edit", label: "İhale düzenleyebilir" },
  { key: "auctions.close", label: "İhale kapatabilir" },
  { key: "reports.view", label: "Raporları görüntüleyebilir" },
  { key: "data.export", label: "Veri dışa aktarabilir" },
  { key: "settings.manage", label: "Sistem ayarı yönetebilir" },
];

const state: {
  currentUser: any;
  users: any[];
  permissionDefs: { key: string; label: string }[];
  query: string;
} = {
  currentUser: null,
  users: [],
  permissionDefs: defaultPermissionDefs,
  query: "",
};

const elements = {
  statTotal: document.getElementById("statTotal") as HTMLElement,
  statAdmin: document.getElementById("statAdmin") as HTMLElement,
  statDisabled: document.getElementById("statDisabled") as HTMLElement,
  searchInput: document.getElementById("searchInput") as HTMLInputElement,
  refreshBtn: document.getElementById("refreshBtn") as HTMLButtonElement,
  sessionBox: document.getElementById("sessionBox") as HTMLElement,
  statusLine: document.getElementById("statusLine") as HTMLElement,
  userList: document.getElementById("userList") as HTMLElement,
};

init().catch((error) => {
  console.error(error);
  setStatus(error.message || "Yönetim paneli yüklenemedi.", "error");
});

async function init() {
  setStatus("Yönetim verileri yükleniyor...", "warn");
  await bootstrapData();
  bindEvents();
  render();
  setStatus("Yönetim paneli hazır.", "ok");
}

async function bootstrapData() {
  const me = await apiFetch("/api/admin/me");
  state.currentUser = me.user || null;

  const permissionDefs = await apiFetch("/api/admin/permission-keys");
  if (Array.isArray(permissionDefs.items) && permissionDefs.items.length > 0) {
    state.permissionDefs = permissionDefs.items
      .map((item: any) => ({ key: String(item.key || ""), label: String(item.label || item.key || "") }))
      .filter((item: any) => item.key);
  }

  await loadUsers();
  const who = state.currentUser
    ? `${state.currentUser.name || "Yönetici"} (${state.currentUser.email || "-"})`
    : "Oturum bulunamadı";
  elements.sessionBox.textContent = who;
}

function bindEvents() {
  elements.searchInput.addEventListener("input", () => {
    state.query = String(elements.searchInput.value || "").trim().toLowerCase();
    render();
  });

  elements.refreshBtn.addEventListener("click", async () => {
    await safeAction(elements.refreshBtn, async () => {
      setStatus("Kullanıcı listesi yenileniyor...", "warn");
      await loadUsers();
      render();
      setStatus("Liste güncellendi.", "ok");
    });
  });

  elements.userList.addEventListener("click", async (event) => {
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
        render();
        setStatus(!disabled ? "Kullanıcı pasife alındı." : "Kullanıcı tekrar aktif edildi.", "ok");
      });
      return;
    }

    if (action === "revoke-sessions") {
      await safeAction(actionBtn, async () => {
        await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/revoke-sessions`, {
          method: "POST",
          body: {},
        });
        setStatus("Kullanıcının aktif oturumları sonlandırıldı.", "ok");
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
        render();
        setStatus("Yetki güncellendi.", "ok");
      });
    }
  });

  elements.userList.addEventListener("change", async (event) => {
    const target = event.target as HTMLElement;
    const roleSelect = target.closest("select[data-action='change-role']") as HTMLSelectElement | null;
    if (!roleSelect) return;

    const userId = String(roleSelect.dataset.userId || "");
    const role = String(roleSelect.value || "").trim();
    if (!userId || !role) return;

    await safeAction(roleSelect, async () => {
      await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/role`, {
        method: "POST",
        body: { role },
      });
      await loadUsers();
      render();
      setStatus("Rol güncellendi.", "ok");
    });
  });
}

async function loadUsers() {
  const data = await apiFetch("/api/admin/users");
  state.users = Array.isArray(data.items) ? data.items : [];
}

function render() {
  const users = filterUsers(state.users, state.query);
  renderStats(state.users);

  if (users.length < 1) {
    elements.userList.innerHTML = '<div class="emptyState">Filtreye uygun kullanıcı bulunamadı.</div>';
    return;
  }

  elements.userList.innerHTML = users.map(renderUserCard).join("");
}

function renderStats(users: any[]) {
  const total = users.length;
  const adminCount = users.filter((x) => x.role === ROLE_ADMIN || x.role === ROLE_MANAGER).length;
  const disabledCount = users.filter((x) => x.isDisabled === true).length;
  elements.statTotal.textContent = String(total);
  elements.statAdmin.textContent = String(adminCount);
  elements.statDisabled.textContent = String(disabledCount);
}

function renderUserCard(user: any) {
  const permissions = user.permissions || {};
  const role = normalizeRole(user.role);
  const roleBadgeClass = `role-${role}`;
  const statusBadge = user.isDisabled
    ? '<span class="badge danger">Pasif</span>'
    : '<span class="badge ok">Aktif</span>';
  const verifiedBadge = user.emailVerified
    ? '<span class="badge ok">E-posta Onaylı</span>'
    : '<span class="badge danger">E-posta Onaysız</span>';
  const statusBtnClass = user.isDisabled ? "miniBtn success" : "miniBtn danger";
  const statusBtnText = user.isDisabled ? "Aktif Et" : "Pasife Al";

  const permissionButtons = state.permissionDefs
    .map((perm) => {
      const enabled = permissions[perm.key] === true;
      const cls = enabled ? "permBtn on" : "permBtn off";
      return `<button class="${cls}" data-action="toggle-permission" data-user-id="${escapeHtml(
        user.id
      )}" data-permission-key="${escapeHtml(perm.key)}" data-enabled="${enabled ? "true" : "false"}">${escapeHtml(
        perm.label
      )}</button>`;
    })
    .join("");

  return `
    <article class="userCard">
      <div class="userHead">
        <div>
          <div class="nameLine">${escapeHtml(user.name || "İsimsiz")} ${statusBadge} ${verifiedBadge}</div>
          <div class="userEmail">${escapeHtml(user.email || "-")}</div>
          <div class="metaLine">ID: ${escapeHtml(user.id || "-")} | Kayıt: ${formatDate(user.createdAt)}</div>
        </div>
        <div class="badges">
          <span class="badge ${roleBadgeClass}">${role.toUpperCase()}</span>
          <select class="roleSelect" data-action="change-role" data-user-id="${escapeHtml(user.id)}">
            <option value="member" ${role === ROLE_MEMBER ? "selected" : ""}>Standart</option>
            <option value="manager" ${role === ROLE_MANAGER ? "selected" : ""}>Yönetici</option>
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
        )}">Oturumları Sonlandır</button>
      </div>

      <div class="permGrid">${permissionButtons}</div>
    </article>
  `;
}

function filterUsers(users: any[], query: string) {
  if (!query) return users;
  return users.filter((user) => {
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

function setStatus(text: string, kind: "ok" | "error" | "warn" | "") {
  elements.statusLine.className = "statusLine";
  if (kind) elements.statusLine.classList.add(kind);
  elements.statusLine.textContent = text || "";
}

async function safeAction(control: HTMLElement, handler: () => Promise<void>) {
  const prevDisabled = (control as HTMLButtonElement | HTMLSelectElement).disabled === true;
  control.classList.add("busy");
  (control as HTMLButtonElement | HTMLSelectElement).disabled = true;
  try {
    await handler();
  } catch (error: any) {
    console.error(error);
    setStatus(error.message || "İşlem sırasında bir hata oluştu.", "error");
  } finally {
    (control as HTMLButtonElement | HTMLSelectElement).disabled = prevDisabled;
    control.classList.remove("busy");
  }
}

function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function escapeHtml(value: any) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
    throw new Error(data.error || `İstek başarısız (${response.status})`);
  }
  return data;
}
