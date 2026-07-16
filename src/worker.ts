import { TURKEY_CITIES, TURKEY_DISTRICTS_BY_CITY } from "./turkey-geo";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const EMAIL_VERIFY_TTL_SECONDS = 60 * 60 * 24;
const PASSWORD_RESET_TTL_SECONDS = 60 * 60;
const PBKDF2_ITERATIONS = 100000;
const MIN_PASSWORD_LENGTH = 8;

const USER_ROLES = {
  MEMBER: "member",
  MANAGER: "manager",
  ADMIN: "admin",
} as const;

const PERMISSIONS = {
  ADMIN_PANEL_ACCESS: "admin.panel.access",
  BIDS_PLACE: "bids.place",
  USERS_VIEW: "users.view",
  USERS_BLOCK: "users.block",
  USERS_PERMISSIONS: "users.permissions",
  USERS_SESSIONS_REVOKE: "users.sessions.revoke",
  AUCTIONS_CREATE: "auctions.create",
  AUCTIONS_EDIT: "auctions.edit",
  AUCTIONS_CLOSE: "auctions.close",
  REPORTS_VIEW: "reports.view",
  DATA_EXPORT: "data.export",
  SETTINGS_MANAGE: "settings.manage",
} as const;

const ALL_PERMISSION_KEYS: string[] = Object.values(PERMISSIONS);
const MANAGER_DEFAULT_PERMISSIONS = new Set<string>([
  PERMISSIONS.ADMIN_PANEL_ACCESS,
  PERMISSIONS.BIDS_PLACE,
  PERMISSIONS.USERS_VIEW,
  PERMISSIONS.REPORTS_VIEW,
]);
const ADMIN_DEFAULT_PERMISSIONS = new Set<string>(ALL_PERMISSION_KEYS);
const DEFAULT_CATALOG_GROUPS = [
  { id: "grp-vasita", name: "Vasita", sortOrder: 10 },
  { id: "grp-elektronik", name: "Elektronik", sortOrder: 20 },
  { id: "grp-ofis", name: "Ofis Ekipmanlari", sortOrder: 30 },
  { id: "grp-sanayi", name: "Sanayi Ekipmanlari", sortOrder: 40 },
  { id: "grp-gayrimenkul", name: "Gayrimenkul", sortOrder: 50 },
  { id: "grp-beyaz", name: "Beyaz Esya", sortOrder: 60 },
  { id: "grp-genel", name: "Genel", sortOrder: 999 },
] as const;
const FALLBACK_CATALOG_GROUP_ID = "grp-genel";
const SCHEMA_WARM_TTL_MS = 15 * 60 * 1000;
const MAX_GALLERY_IMAGE_COUNT = 20;
const MAX_GALLERY_IMAGE_DATA_URL_LENGTH = 1_200_000;
const MAX_ATTACHMENT_COUNT = 15;
const MAX_ATTACHMENT_DATA_URL_LENGTH = 2_700_000;
const MAX_GALLERY_TOTAL_DATA_URL_LENGTH = 2_400_000;
const MAX_ATTACHMENT_TOTAL_DATA_URL_LENGTH = 3_200_000;
const MAX_VEHICLE_CONDITION_JSON_LENGTH = 5000;
const MAX_VEHICLE_EXPERTISE_META_JSON_LENGTH = 12000;
const FILTER_ORDER_SETTING_KEY = "filter_option_order";
const VEHICLE_CONDITION_LAYOUT_SETTING_KEY = "vehicle_condition_layout_v1";
const VEHICLE_CONDITION_LAYOUT_MAX_OFFSET = 200;
const VEHICLE_CONDITION_SCALE_SETTING_KEY = "vehicle_condition_scale_v1";
const VEHICLE_CONDITION_SCALE_MIN = 0.7;
const VEHICLE_CONDITION_SCALE_MAX = 1.7;
const DEFAULT_TURKEY_CITIES = TURKEY_CITIES as readonly string[];
const VEHICLE_CONDITION_PART_KEYS = [
  "on_tampon",
  "kaput",
  "sol_on_camurluk",
  "sag_on_camurluk",
  "sol_on_kapi",
  "sag_on_kapi",
  "tavan",
  "sol_arka_kapi",
  "sag_arka_kapi",
  "sol_arka_camurluk",
  "sag_arka_camurluk",
  "bagaj",
  "arka_tampon",
  "sol_ayna",
  "sag_ayna",
] as const;
const VEHICLE_EXPERTISE_STRUCTURE_KEYS = [
  "sag_podye",
  "sol_podye",
  "sag_kilic_saci",
  "sol_kilic_saci",
  "on_ic_direkler",
  "orta_ic_direkler_arka_kilit_karsiliklari",
  "on_panel_arka_panel",
  "sag_marsbiyel",
  "sol_marsbiyel",
  "sag_ust_direkler_frangart",
  "sol_ust_direkler_frangart",
] as const;
const VEHICLE_EXPERTISE_MECHANICAL_KEYS = [
  "motor_alt_ust_yag_kacagi",
  "sanziman",
  "turbo",
  "radyator",
  "intercooler",
  "on_arka_takim",
] as const;
const VEHICLE_EXPERTISE_STRUCTURE_LEGACY_KEYS: Record<string, string[]> = {
  sag_podye: ["sag_sol_podye"],
  sol_podye: ["sag_sol_podye"],
  sag_kilic_saci: ["sag_sol_kilic_saci"],
  sol_kilic_saci: ["sag_sol_kilic_saci"],
  sag_marsbiyel: ["sag_sol_marsbiyel"],
  sol_marsbiyel: ["sag_sol_marsbiyel"],
  sag_ust_direkler_frangart: ["sag_sol_ust_direkler_frangart"],
  sol_ust_direkler_frangart: ["sag_sol_ust_direkler_frangart"],
};

type RuntimeSchemaState = {
  adminReadyAt: number;
  marketplaceReadyAt: number;
  legacyRepairReadyAt: number;
  inflightAdmin: Promise<void> | null;
  inflightMarketplace: Promise<void> | null;
  inflightLegacyRepair: Promise<void> | null;
};

interface TurnstileVerifyResponse {
  success: boolean;
  action?: string;
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      if (url.pathname.startsWith("/api/")) {
        return await handleApi(request, env, url);
      }

      if (!env.ASSETS) {
        return json(
          { ok: false, error: "Static asset binding bulunamadı. wrangler.toml içinde [assets] binding kontrol edin." },
          500
        );
      }

      if (url.pathname === "/admin") {
        const rewrittenRequest = new Request(new URL("/admin.html", url).toString(), request);
        const adminResponse = await env.ASSETS.fetch(rewrittenRequest);
        return withNoStoreHeaders(adminResponse);
      }
      const listingMatch = url.pathname.match(/^\/ilan\/([^/]+)\/?$/i);
      if (listingMatch) {
        const lotNo = decodeURIComponent(String(listingMatch[1] || "")).trim().toUpperCase();
        const listingUrl = new URL("/auction.html", url);
        if (lotNo) listingUrl.searchParams.set("lotNo", lotNo);
        const listingResponse = await env.ASSETS.fetch(new Request(listingUrl.toString(), request));
        return withNoStoreHeaders(listingResponse);
      }

      const assetResponse = await env.ASSETS.fetch(request);
      if (isAdminAssetPath(url.pathname)) {
        return withNoStoreHeaders(assetResponse);
      }
      return assetResponse;
    } catch (error) {
      console.error("Unhandled error:", error);
      return json({ ok: false, error: "Sunucu hatası oluştu." }, 500);
    }
  },
};

async function handleApi(request, env, url) {
  const method = request.method.toUpperCase();
  const path = url.pathname;

  if (!env.DB) {
    return json({ ok: false, error: "D1 binding bulunamadı. wrangler.toml içindeki DB binding'i kontrol edin." }, 500);
  }

  if (method === "GET" && path === "/api/health") {
    return json({ ok: true, service: "kamutas-api" });
  }

  if (method === "GET" && path === "/api/config") {
    return json({
      ok: true,
      release: "2026-05-05-auction-detail-media",
      turnstileSiteKey: String(env.TURNSTILE_SITE_KEY || "").trim(),
      requireTurnstile: isTurnstileRequired(env),
      requireEmailVerification: isEmailVerificationRequired(env),
    });
  }

  if (method === "GET" && path === "/api/auth/me") {
    const cfgError = requireSessionPepper(env);
    if (cfgError) return cfgError;

    const session = await getSession(request, env);
    if (!session) return json({ ok: true, authenticated: false, user: null });
    await ensureUserRole(env, session.user.id, session.user.email);
    await ensureMarketplaceSchemaWarm(env);
    const access = await getUserAccess(env, session.user.id, session.user.email);
    const membership = await getUserActiveMembershipSafe(env, session.user.id);
    return json({
      ok: true,
      authenticated: true,
      hasActiveMembership: !!membership,
      activeMembership: membership ? {
        planName: membership.plan_name,
        expiresAt: membership.expires_at,
      } : null,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        emailVerified: !!session.user.email_verified_at,
        role: access.role,
        permissions: access.permissions,
      },
    });
  }

  if (method === "GET" && path === "/api/auth/profile") {
    const cfgError = requireSessionPepper(env);
    if (cfgError) return cfgError;
    await ensureAdminSchemaWarm(env);

    const session = await getSession(request, env);
    if (!session) return json({ ok: false, error: "Profil bilgileri icin giris yapmalisiniz." }, 401);

    const profile = await env.DB.prepare(
      `SELECT id, email, name, tc_identity_no, phone, address, email_verified_at
       FROM users
       WHERE id = ?
       LIMIT 1`
    )
      .bind(session.user.id)
      .first();

    if (!profile) return json({ ok: false, error: "Profil bilgileri bulunamadi." }, 404);

    return json({
      ok: true,
      profile: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        tcIdentityNo: String(profile.tc_identity_no || ""),
        phone: String(profile.phone || ""),
        address: String(profile.address || ""),
        emailVerified: !!profile.email_verified_at,
      },
    });
  }

  if (method === "PUT" && path === "/api/auth/profile") {
    const cfgError = requireSessionPepper(env);
    if (cfgError) return cfgError;
    await ensureAdminSchemaWarm(env);

    const session = await getSession(request, env);
    if (!session) return json({ ok: false, error: "Profil guncellemek icin giris yapmalisiniz." }, 401);

    const body = await readJson(request);
    const name = sanitizeName(body.name);
    const tcIdentityNo = normalizeTcIdentityNo(body.tcIdentityNo);
    const phone = sanitizePhone(body.phone);
    const address = sanitizeAddress(body.address);

    if (!String(name || "").trim()) return json({ ok: false, error: "Isim Soyisim zorunludur." }, 400);
    if (!isValidTcIdentityNo(tcIdentityNo)) return json({ ok: false, error: "TC kimlik no 11 haneli olmalidir." }, 400);
    if (!isValidPhone(phone)) return json({ ok: false, error: "Telefon numarasi gecersiz." }, 400);
    if (!address) return json({ ok: false, error: "Adres zorunludur." }, 400);

    await env.DB.prepare(
      `UPDATE users
       SET name = ?, tc_identity_no = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
      .bind(name, tcIdentityNo, phone, address, session.user.id)
      .run();

    const row = await env.DB.prepare(
      "SELECT id, email, name, tc_identity_no, phone, address FROM users WHERE id = ? LIMIT 1"
    )
      .bind(session.user.id)
      .first();

    return json({
      ok: true,
      message: "Profiliniz guncellendi.",
      profile: {
        id: row?.id || session.user.id,
        email: row?.email || session.user.email,
        name: row?.name || name,
        tcIdentityNo: String(row?.tc_identity_no || tcIdentityNo),
        phone: String(row?.phone || phone),
        address: String(row?.address || address),
      },
    });
  }

  if (method === "POST" && path === "/api/auth/register") {
    const cfgError = requireSessionPepper(env);
    if (cfgError) return cfgError;
    await ensureAdminSchemaWarm(env);

    const ip = getClientIp(request);
    const limited = await checkRateLimit(env, `register:${ip}`, 8, 10 * 60);
    if (limited) return json({ ok: false, error: "Çok fazla deneme yaptınız. Lütfen sonra tekrar deneyin." }, 429);

    const body = await readJson(request);
    const turnstileError = await ensureTurnstileRequired(env, request, body, "register");
    if (turnstileError) return turnstileError;

    const email = normalizeEmail(body.email);
    const name = sanitizeName(body.name);
    const tcIdentityNo = normalizeTcIdentityNo(body.tcIdentityNo);
    const phone = sanitizePhone(body.phone);
    const address = sanitizeAddress(body.address);
    const accountType = String(body.accountType || "").toLowerCase().trim();
    const password = String(body.password || "");

    if (!String(body.name || "").trim()) return json({ ok: false, error: "Isim Soyisim zorunludur." }, 400);
    if (!isValidTcIdentityNo(tcIdentityNo)) return json({ ok: false, error: "TC kimlik no 11 haneli olmalidir." }, 400);
    if (!isValidPhone(phone)) return json({ ok: false, error: "Telefon numarasi gecersiz." }, 400);
    if (!address) return json({ ok: false, error: "Adres zorunludur." }, 400);
    if (accountType !== "bireysel" && accountType !== "ticari") {
      return json({ ok: false, error: "Hesap türü (Bireysel/Ticari) seçilmelidir." }, 400);
    }

    if (!isValidEmail(email)) return json({ ok: false, error: "Geçerli bir e-posta girin." }, 400);
    if (password.length < MIN_PASSWORD_LENGTH) {
      return json({ ok: false, error: `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalıdır.` }, 400);
    }

    if (body.acceptedAgreement !== true) {
      return json({ ok: false, error: "Üyelik sözleşmesini kabul etmelisiniz." }, 400);
    }

    const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) return json({ ok: false, error: "Bu e-posta ile kayıtlı bir kullanıcı zaten var." }, 409);

    const userId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const requireEmailVerification = isEmailVerificationRequired(env);

    await env.DB.prepare(
      `INSERT INTO users (
        id, email, name, password_hash, tc_identity_no, phone, address, account_type, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    )
      .bind(userId, email, name, passwordHash, tcIdentityNo, phone, address, accountType)
      .run();
    await ensureUserRole(env, userId, email);

    await env.DB.prepare(
      `INSERT INTO accepted_legal_agreements (id, user_id, agreement_type, agreement_version, accepted_at, ip_address)
       VALUES (?, ?, 'membership', '1.0', CURRENT_TIMESTAMP, ?)`
    ).bind(crypto.randomUUID(), userId, ip).run();

    if (requireEmailVerification) {
      const verifyToken = await createEmailVerifyToken(env, userId);
      if (verifyToken) {
        const verifyUrl = `${getBaseUrl(request, env)}/?verify=${encodeURIComponent(verifyToken)}`;
        await sendAuthEmail(
          env,
          email,
          "E-posta Doğrulama",
          `Hesabınızı doğrulamak için bu bağlantıyı açın: ${verifyUrl}`
        );
      }
    }

    const headers = new Headers({ "content-type": "application/json; charset=utf-8" });

    return new Response(
      JSON.stringify({
        ok: true,
        message: "Üyelik başvurunuz alınmıştır. En kısa sürede onay süreci tamamlanacaktır.",
      }),
      { status: 201, headers }
    );
  }

  if (method === "POST" && path === "/api/auth/login") {
    const cfgError = requireSessionPepper(env);
    if (cfgError) return cfgError;
    const db = env.DB.withSession("first-primary");

    const ip = getClientIp(request);
    const limited = await checkRateLimit(env, `login:${ip}`, 20, 10 * 60);
    if (limited) return json({ ok: false, error: "Çok fazla deneme yaptınız. Lütfen sonra tekrar deneyin." }, 429);

    const body = await readJson(request);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    if (!isValidEmail(email) || !password) return json({ ok: false, error: "E-posta ve şifre zorunludur." }, 400);

    const bootstrapLogin = matchesBootstrapAdminCredentials(env, email, password);
    if (bootstrapLogin) {
      const forced = await forceBootstrapAdminLogin(env, request, db, email, password);
      if (forced?.ok) return forced.response;
    }

    if (bootstrapLogin) {
      await ensureSingleBootstrapAdminUser(env, email, password, db);
    }
    await ensureBootstrapAdminUser(env, db);
    if (!bootstrapLogin) {
      const turnstileError = await ensureTurnstileRequired(env, request, body, "login");
      if (turnstileError) return turnstileError;
    }

    let user = await db.prepare(
      "SELECT id, email, name, password_hash, email_verified_at, disabled_at, status FROM users WHERE email = ?"
    )
      .bind(email)
      .first();

    if (!user && bootstrapLogin) {
      await ensureBootstrapAdminUser(env, db);
      user = await db.prepare(
        "SELECT id, email, name, password_hash, email_verified_at, disabled_at, status FROM users WHERE email = ?"
      )
        .bind(email)
        .first();
    }

    if (!user) return json({ ok: false, error: "E-posta veya şifre hatalı." }, 401);
    if (user.status === "pending") {
      return json({ ok: false, error: "Üyeliğiniz onay sürecindedir. Onaylandıktan sonra giriş yapabilirsiniz." }, 403);
    }
    if (user.disabled_at) return json({ ok: false, error: "Hesabınız pasif durumdadır. Yöneticinizle iletişime geçin." }, 403);

    let passOk = await verifyPassword(password, user.password_hash);
    if (!passOk && bootstrapLogin) {
      passOk = true;
    }
    if (!passOk) return json({ ok: false, error: "E-posta veya şifre hatalı." }, 401);
    await ensureUserRole(env, user.id, user.email, db);
    const access = await getUserAccess(env, user.id, user.email, db);

    const { cookie, expiresAt } = await createSession(env, request, user.id, db);
    const headers = new Headers({ "content-type": "application/json; charset=utf-8" });
    headers.append("set-cookie", cookie);

    return new Response(
      JSON.stringify({
        ok: true,
        message: "Giriş başarılı.",
        expiresAt,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: !!user.email_verified_at,
          role: access.role,
          permissions: access.permissions,
        },
      }),
      { status: 200, headers }
    );
  }

  if (method === "POST" && path === "/api/auth/logout") {
    const cfgError = requireSessionPepper(env);
    if (cfgError) return cfgError;

    const session = await getSession(request, env);
    if (session) {
      await env.DB.prepare("UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE id = ?").bind(session.session.id).run();
    }

    const headers = new Headers({ "content-type": "application/json; charset=utf-8" });
    headers.append("set-cookie", clearSessionCookie());
    return new Response(JSON.stringify({ ok: true, message: "Çıkış yapıldı." }), { status: 200, headers });
  }

  if (method === "POST" && path === "/api/auth/verify/request") {
    if (!isEmailVerificationRequired(env)) {
      return json({ ok: true, message: "Bu ortamda e-posta dogrulama zorunlu degil." });
    }

    const cfgError = requireSessionPepper(env);
    if (cfgError) return cfgError;

    const body = await readJson(request);
    const session = await getSession(request, env);
    let targetUser = null;

    if (session) {
      targetUser = session.user;
    } else if (body.email) {
      const email = normalizeEmail(body.email);
      targetUser = await env.DB.prepare("SELECT id, email, name, email_verified_at FROM users WHERE email = ?").bind(email).first();
    }

    if (!targetUser) {
      return json({ ok: true, message: "Eğer hesap varsa doğrulama e-postası gönderilecektir." });
    }

    if (targetUser.email_verified_at) {
      return json({ ok: true, message: "E-posta zaten doğrulanmış." });
    }

    const token = await createEmailVerifyToken(env, targetUser.id);
    const verifyUrl = `${getBaseUrl(request, env)}/?verify=${encodeURIComponent(token)}`;
    await sendAuthEmail(
      env,
      targetUser.email,
      "E-posta Doğrulama",
      `Hesabınızı doğrulamak için bu bağlantıyı açın: ${verifyUrl}`
    );

    return json({
      ok: true,
      message: "Doğrulama e-postası gönderildi.",
      debugVerifyToken: shouldExposeDebugToken(env) ? token : undefined,
    });
  }

  if (method === "POST" && path === "/api/auth/verify/confirm") {
    const body = await readJson(request);
    const token = String(body.token || "");
    if (!token) return json({ ok: false, error: "Doğrulama token zorunludur." }, 400);

    const tokenHash = await sha256Hex(token);
    const row = await env.DB.prepare(
      "SELECT id, user_id, expires_at, consumed_at FROM email_verification_tokens WHERE token_hash = ?"
    )
      .bind(tokenHash)
      .first();

    if (!row || row.consumed_at || new Date(row.expires_at).getTime() < Date.now()) {
      return json({ ok: false, error: "Doğrulama bağlantısı geçersiz veya süresi dolmuş." }, 400);
    }

    await env.DB.batch([
      env.DB.prepare(
        "UPDATE users SET email_verified_at = COALESCE(email_verified_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      ).bind(row.user_id),
      env.DB.prepare("UPDATE email_verification_tokens SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(row.id),
    ]);

    return json({ ok: true, message: "E-posta başarıyla doğrulandı." });
  }

  if (method === "POST" && path === "/api/auth/password/forgot") {
    const body = await readJson(request);

    const email = normalizeEmail(body.email);
    if (!isValidEmail(email)) return json({ ok: true, message: "Eğer hesap varsa sıfırlama e-postası gönderilecektir." });

    const user = await env.DB.prepare("SELECT id, email FROM users WHERE email = ?").bind(email).first();
    if (!user) return json({ ok: true, message: "Eğer hesap varsa sıfırlama e-postası gönderilecektir." });

    const token = await createPasswordResetToken(env, user.id);
    const resetUrl = `${getBaseUrl(request, env)}/?reset=${encodeURIComponent(token)}`;
    await sendAuthEmail(
      env,
      user.email,
      "Şifre Sıfırlama",
      `Şifrenizi sıfırlamak için bu bağlantıyı açın: ${resetUrl}`
    );

    return json({
      ok: true,
      message: "Eğer hesap varsa sıfırlama e-postası gönderilecektir.",
      debugResetToken: shouldExposeDebugToken(env) ? token : undefined,
    });
  }

  if (method === "POST" && path === "/api/auth/password/reset") {
    const body = await readJson(request);

    const token = String(body.token || "");
    const newPassword = String(body.newPassword || "");

    if (!token) return json({ ok: false, error: "Reset token zorunludur." }, 400);
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return json({ ok: false, error: `Yeni şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalıdır.` }, 400);
    }

    const tokenHash = await sha256Hex(token);
    const row = await env.DB.prepare("SELECT id, user_id, expires_at, consumed_at FROM password_reset_tokens WHERE token_hash = ?")
      .bind(tokenHash)
      .first();

    if (!row || row.consumed_at || new Date(row.expires_at).getTime() < Date.now()) {
      return json({ ok: false, error: "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş." }, 400);
    }

    const passwordHash = await hashPassword(newPassword);
    await env.DB.batch([
      env.DB.prepare("UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(passwordHash, row.user_id),
      env.DB.prepare("UPDATE password_reset_tokens SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(row.id),
      env.DB.prepare("UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL").bind(row.user_id),
    ]);

    return json({ ok: true, message: "Şifreniz güncellendi. Lütfen tekrar giriş yapın." });
  }

  if (method === "GET" && path === "/api/auctions") {
    const items = await getPublicAuctionsListSafe(env);
    const session = await getSessionSafe(request, env);
    if (!session) {
      return json({ ok: true, items });
    }

    const favoriteLotNos = await getUserFavoriteLotNoSetSafe(env, session.user.id);
    const autoBidMap = await getUserAutoBidMapSafe(env, session.user.id);
    const withFavorites = items.map((row: any) => {
      const lotNo = String(row?.lot_no || "").trim().toUpperCase();
      const autoBid = autoBidMap.get(lotNo) || null;
      return {
        ...row,
        is_favorite: favoriteLotNos.has(lotNo) ? 1 : 0,
        user_auto_bid_enabled: autoBid?.isActive ? 1 : 0,
        user_auto_bid_max: autoBid?.maxAmount ?? null,
      };
    });
    return json({ ok: true, items: withFavorites });
  }
  if (method === "GET" && path === "/api/filter-options") {
    return json({ ok: true, ...(await getPublicFilterOptionsSafe(env)) });
  }
  if (method === "GET" && path === "/api/initial-data") {
    const items = await getPublicAuctionsListSafe(env);
    const filterOptions = await getPublicFilterOptions(env, items);
    const session = await getSessionSafe(request, env);
    let withFavorites = items;
    if (session) {
      const favoriteLotNos = await getUserFavoriteLotNoSetSafe(env, session.user.id);
      const autoBidMap = await getUserAutoBidMapSafe(env, session.user.id);
      withFavorites = items.map((row: any) => {
        const lotNo = String(row?.lot_no || "").trim().toUpperCase();
        const autoBid = autoBidMap.get(lotNo) || null;
        return {
          ...row,
          is_favorite: favoriteLotNos.has(lotNo) ? 1 : 0,
          user_auto_bid_enabled: autoBid?.isActive ? 1 : 0,
          user_auto_bid_max: autoBid?.maxAmount ?? null,
        };
      });
    }
    return json({ ok: true, items: withFavorites, filterOptions });
  }
  const auctionDetailMatch = path.match(/^\/api\/auctions\/([^/]+)$/);
  if (method === "GET" && auctionDetailMatch) {
    const lotNo = decodeURIComponent(String(auctionDetailMatch[1] || "")).trim().toUpperCase();
    if (!lotNo) return json({ ok: false, error: "Ihale no zorunludur." }, 400);
    await ensureMarketplaceSchemaWarm(env);
    const session = await getSessionSafe(request, env);
    if (!session) {
      return json({ ok: false, requiresMembership: true, error: "İlan detaylarını görmek için giriş yapmalısınız." }, 403);
    }
    const membership = await getUserActiveMembershipSafe(env, session.user.id);
    if (!membership) {
      return json({ ok: false, requiresMembership: true, error: "İhale detaylarını görmek için premium üyelik gerekli" }, 403);
    }
    const detail = await getPublicAuctionDetailByLotNoSafe(env, lotNo);
    if (!detail) return json({ ok: false, error: "Ihale bulunamadi." }, 404);
    return json({
      ok: true,
      item: detail,
      vehicleConditionLayout: await getVehicleConditionLayoutSafe(env),
      vehicleConditionScale: await getVehicleConditionScaleSafe(env),
    });
  }

  if (method === "GET" && path === "/api/membership-plans") {
    await ensureMarketplaceSchemaWarm(env);
    const plans = await env.DB.prepare(
      "SELECT id, name, description, price, currency, duration_days, features_json, sort_order FROM membership_plans WHERE is_active = 1 ORDER BY sort_order ASC, price ASC"
    ).all();
    return json({ ok: true, items: plans.results || [] });
  }

  if (method === "GET" && path === "/api/content-settings") {
    const data = await getAppSettingJson(env, "homepage_content", {});
    return json({ ok: true, items: data });
  }

  if (method === "POST" && path === "/api/bids") {
    const cfgError = requireSessionPepper(env);
    if (cfgError) return cfgError;
    await ensureMarketplaceSchemaWarm(env);

    const session = await getSession(request, env);
    if (!session) return json({ ok: false, error: "Teklif verebilmek için giriş yapmalısınız." }, 401);
    const access = await getUserAccess(env, session.user.id, session.user.email);
    if (!access.permissions[PERMISSIONS.BIDS_PLACE]) {
      return json({ ok: false, error: "Teklif verme yetkiniz kapatılmış. Lütfen yöneticiyle iletişime geçin." }, 403);
    }
    if (isEmailVerificationRequired(env) && !session.user.email_verified_at) {
      return json({ ok: false, error: "Teklif verebilmek için önce e-posta adresinizi doğrulayın." }, 403);
    }

    const limited = await checkRateLimit(env, `bid:${session.user.id}`, 30, 60);
    if (limited) return json({ ok: false, error: "Çok sık teklif verdiniz. Lütfen biraz bekleyin." }, 429);

    const body = await readJson(request);
    const lotNo = String(body.lotNo || "").trim().toUpperCase();
    const amount = Number(body.amount || 0);
    if (!lotNo) return json({ ok: false, error: "İhale numarası zorunludur." }, 400);
    if (!Number.isFinite(amount) || amount <= 0) return json({ ok: false, error: "Geçerli bir teklif tutarı girin." }, 400);

    const auction = await env.DB.prepare(
      "SELECT id, lot_no, title, start_price, current_bid, min_increment, ends_at, status FROM auctions WHERE lot_no = ?"
    )
      .bind(lotNo)
      .first();

    if (!auction) return json({ ok: false, error: "İhale bulunamadı." }, 404);
    if (auction.status !== "ACTIVE") return json({ ok: false, error: "Bu ihale aktif değil." }, 409);
    if (new Date(auction.ends_at).getTime() <= Date.now()) return json({ ok: false, error: "İhalenin süresi sona erdi." }, 409);

    const floor = auction.current_bid ?? auction.start_price;
    const minimumRequired = Number(floor) + Number(auction.min_increment || 0);
    if (amount < minimumRequired) {
      return json({ ok: false, error: `Teklif en az ${formatMoney(minimumRequired)} olmalıdır.` }, 400);
    }

    const latestActiveBid = await env.DB.prepare(
      `SELECT user_id
       FROM bids
       WHERE auction_id = ?
         AND COALESCE(is_retracted, 0) = 0
       ORDER BY created_at DESC, rowid DESC
       LIMIT 1`
    )
      .bind(auction.id)
      .first();
    if (String(latestActiveBid?.user_id || "") === session.user.id) {
      return json(
        {
          ok: false,
          error: "Ayni ihaleye baska bir teklif gelmeden tekrar teklif veremezsiniz.",
        },
        409
      );
    }

    const updateResult = await env.DB.prepare(
      `UPDATE auctions
       SET current_bid = ?, current_bid_user_id = ?, bid_count = bid_count + 1, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'ACTIVE' AND ends_at > CURRENT_TIMESTAMP AND (current_bid IS NULL OR current_bid < ?)`
    )
      .bind(amount, session.user.id, auction.id, amount)
      .run();

    const changed = updateResult.meta?.changes || 0;
    if (changed < 1) {
      return json({ ok: false, error: "Teklif işlenirken fiyat değişti. Lütfen güncel fiyatla tekrar deneyin." }, 409);
    }

    await env.DB.prepare(
      `INSERT INTO bids (
         id, auction_id, user_id, amount, created_at, bid_source, is_retracted, retracted_at, retracted_reason
       ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 'MANUAL', 0, NULL, NULL)`
    )
      .bind(crypto.randomUUID(), auction.id, session.user.id, amount)
      .run();

    await runAutoBidEngine(env, auction.id);
    const refreshedAuction = await env.DB.prepare(
      "SELECT current_bid, current_bid_user_id, bid_count FROM auctions WHERE id = ? LIMIT 1"
    )
      .bind(auction.id)
      .first();

    return json({
      ok: true,
      message: "Teklifiniz alındı.",
      lotNo,
      amount,
      currentBid:
        refreshedAuction?.current_bid === null || refreshedAuction?.current_bid === undefined
          ? null
          : Number(refreshedAuction.current_bid),
      currentBidUserId: String(refreshedAuction?.current_bid_user_id || ""),
      bidCount: Number(refreshedAuction?.bid_count || 0),
    });
  }

  if (method === "POST" && path === "/api/bids/retract") {
    const cfgError = requireSessionPepper(env);
    if (cfgError) return cfgError;
    await ensureMarketplaceSchemaWarm(env);

    const session = await getSession(request, env);
    if (!session) return json({ ok: false, error: "Teklif geri cekmek icin giris yapmalisiniz." }, 401);

    const body = await readJson(request);
    const lotNo = String(body?.lotNo || "").trim().toUpperCase();
    if (!lotNo) return json({ ok: false, error: "Ihale no zorunludur." }, 400);

    const auction = await env.DB.prepare(
      `SELECT id, lot_no, status, ends_at
       FROM auctions
       WHERE UPPER(TRIM(lot_no)) = UPPER(TRIM(?))
       LIMIT 1`
    )
      .bind(lotNo)
      .first();

    if (!auction?.id) return json({ ok: false, error: "Ihale bulunamadi." }, 404);
    if (String(auction.status || "").toUpperCase() !== "ACTIVE") {
      return json({ ok: false, error: "Sadece aktif ihalelerde teklif geri cekebilirsiniz." }, 409);
    }
    const endsAtMs = Date.parse(String(auction.ends_at || ""));
    if (Number.isFinite(endsAtMs) && endsAtMs <= Date.now()) {
      return json({ ok: false, error: "Suresi biten ihalede teklif geri cekilemez." }, 409);
    }

    const latestMyBid = await env.DB.prepare(
      `SELECT id, amount
       FROM bids
       WHERE auction_id = ?
         AND user_id = ?
         AND COALESCE(is_retracted, 0) = 0
       ORDER BY created_at DESC, rowid DESC
       LIMIT 1`
    )
      .bind(auction.id, session.user.id)
      .first();
    if (!latestMyBid?.id) {
      return json({ ok: false, error: "Geri cekilecek aktif teklifiniz bulunamadi." }, 404);
    }

    const retractResult = await env.DB.prepare(
      `UPDATE bids
       SET is_retracted = 1,
           retracted_at = CURRENT_TIMESTAMP,
           retracted_reason = 'USER_REQUEST'
       WHERE id = ?
         AND user_id = ?
         AND COALESCE(is_retracted, 0) = 0`
    )
      .bind(String(latestMyBid.id || ""), session.user.id)
      .run();
    if (Number(retractResult.meta?.changes || 0) < 1) {
      return json({ ok: false, error: "Teklif geri cekilemedi. Lutfen tekrar deneyin." }, 409);
    }

    await env.DB.prepare(
      `UPDATE auction_auto_bids
       SET is_active = 0, updated_at = CURRENT_TIMESTAMP
       WHERE auction_id = ? AND user_id = ?`
    )
      .bind(auction.id, session.user.id)
      .run();

    await recomputeAuctionBidSnapshot(env, auction.id);
    await runAutoBidEngine(env, auction.id);

    const refreshedAuction = await env.DB.prepare(
      "SELECT current_bid, current_bid_user_id, bid_count FROM auctions WHERE id = ? LIMIT 1"
    )
      .bind(auction.id)
      .first();

    return json({
      ok: true,
      message: "Teklifiniz geri cekildi.",
      lotNo: String(auction.lot_no || lotNo),
      withdrawnAmount: Number(latestMyBid.amount || 0),
      currentBid:
        refreshedAuction?.current_bid === null || refreshedAuction?.current_bid === undefined
          ? null
          : Number(refreshedAuction.current_bid),
      currentBidUserId: String(refreshedAuction?.current_bid_user_id || ""),
      bidCount: Number(refreshedAuction?.bid_count || 0),
    });
  }

  if (method === "GET" && path === "/api/auth/my-bids") {
    const cfgError = requireSessionPepper(env);
    if (cfgError) return cfgError;
    await ensureMarketplaceSchemaWarm(env);

    const session = await getSession(request, env);
    if (!session) return json({ ok: false, error: "Tekliflerinizi gormek icin giris yapmalisiniz." }, 401);

    return json({
      ok: true,
      items: await getUserBidSummaryListSafe(env, session.user.id),
    });
  }

  if (method === "GET" && path === "/api/auth/favorites") {
    const cfgError = requireSessionPepper(env);
    if (cfgError) return cfgError;
    await ensureMarketplaceSchemaWarm(env);

    const session = await getSession(request, env);
    if (!session) return json({ ok: false, error: "Favoriler icin giris yapmalisiniz." }, 401);

    return json({
      ok: true,
      items: await getUserFavoritesListSafe(env, session.user.id),
    });
  }

  if (method === "POST" && path === "/api/auth/favorites") {
    const cfgError = requireSessionPepper(env);
    if (cfgError) return cfgError;
    await ensureMarketplaceSchemaWarm(env);

    const session = await getSession(request, env);
    if (!session) return json({ ok: false, error: "Favori eklemek icin giris yapmalisiniz." }, 401);

    const body = await readJson(request);
    const lotNo = String(body?.lotNo || "").trim().toUpperCase();
    if (!lotNo) return json({ ok: false, error: "Ihale no zorunludur." }, 400);

    const auction = await env.DB.prepare(
      `SELECT id, lot_no, status
       FROM auctions
       WHERE UPPER(TRIM(lot_no)) = UPPER(TRIM(?))
       LIMIT 1`
    )
      .bind(lotNo)
      .first();

    if (!auction?.id) return json({ ok: false, error: "Ihale bulunamadi." }, 404);
    if (String(auction.status || "").toUpperCase() === "PASSIVE") {
      return json({ ok: false, error: "Pasif ihaleler favorilere eklenemez." }, 409);
    }

    await env.DB.prepare(
      `INSERT INTO auction_favorites (user_id, auction_id, created_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, auction_id) DO NOTHING`
    )
      .bind(session.user.id, auction.id)
      .run();

    return json({
      ok: true,
      lotNo,
      message: "Ihale favorilere eklendi.",
    });
  }

  const favoriteDeleteMatch = path.match(/^\/api\/auth\/favorites\/([^/]+)$/);
  if (favoriteDeleteMatch && method === "DELETE") {
    const cfgError = requireSessionPepper(env);
    if (cfgError) return cfgError;
    await ensureMarketplaceSchemaWarm(env);

    const session = await getSession(request, env);
    if (!session) return json({ ok: false, error: "Favori silmek icin giris yapmalisiniz." }, 401);

    const lotNo = decodeURIComponent(String(favoriteDeleteMatch[1] || ""))
      .trim()
      .toUpperCase();
    if (!lotNo) return json({ ok: false, error: "Ihale no zorunludur." }, 400);

    await env.DB.prepare(
      `DELETE FROM auction_favorites
       WHERE user_id = ?
         AND auction_id IN (
           SELECT id
           FROM auctions
           WHERE UPPER(TRIM(lot_no)) = UPPER(TRIM(?))
         )`
    )
      .bind(session.user.id, lotNo)
      .run();

    return json({
      ok: true,
      lotNo,
      message: "Ihale favorilerden kaldirildi.",
    });
  }

  if (method === "POST" && path === "/api/auth/auto-bids") {
    const cfgError = requireSessionPepper(env);
    if (cfgError) return cfgError;
    await ensureMarketplaceSchemaWarm(env);

    const session = await getSession(request, env);
    if (!session) return json({ ok: false, error: "Otomatik teklif icin giris yapmalisiniz." }, 401);
    const access = await getUserAccess(env, session.user.id, session.user.email);
    if (!access.permissions[PERMISSIONS.BIDS_PLACE]) {
      return json({ ok: false, error: "Otomatik teklif yetkiniz kapali." }, 403);
    }

    const body = await readJson(request);
    const lotNo = String(body?.lotNo || "").trim().toUpperCase();
    const maxAmount = Number(body?.maxAmount || 0);
    if (!lotNo) return json({ ok: false, error: "Ihale no zorunludur." }, 400);
    if (!Number.isFinite(maxAmount) || maxAmount <= 0) {
      return json({ ok: false, error: "Gecerli bir ust limit girin." }, 400);
    }

    const auction = await env.DB.prepare(
      `SELECT id, lot_no, status, ends_at, start_price, current_bid, min_increment
       FROM auctions
       WHERE UPPER(TRIM(lot_no)) = UPPER(TRIM(?))
       LIMIT 1`
    )
      .bind(lotNo)
      .first();
    if (!auction?.id) return json({ ok: false, error: "Ihale bulunamadi." }, 404);
    if (String(auction.status || "").toUpperCase() !== "ACTIVE") {
      return json({ ok: false, error: "Sadece aktif ihalelerde otomatik teklif acilabilir." }, 409);
    }
    const endsAtMs = Date.parse(String(auction.ends_at || ""));
    if (Number.isFinite(endsAtMs) && endsAtMs <= Date.now()) {
      return json({ ok: false, error: "Suresi biten ihale icin otomatik teklif acilamaz." }, 409);
    }

    const floor = auction.current_bid ?? auction.start_price;
    const minimumRequired = Number(floor || 0) + Number(auction.min_increment || 0);
    if (maxAmount < minimumRequired) {
      return json({ ok: false, error: `Ust limit en az ${formatMoney(minimumRequired)} olmalidir.` }, 400);
    }

    await env.DB.prepare(
      `INSERT INTO auction_auto_bids (auction_id, user_id, max_amount, is_active, created_at, updated_at)
       VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT(auction_id, user_id)
       DO UPDATE SET
         max_amount = excluded.max_amount,
         is_active = 1,
         updated_at = CURRENT_TIMESTAMP`
    )
      .bind(auction.id, session.user.id, maxAmount)
      .run();

    await runAutoBidEngine(env, auction.id);
    const refreshedAuction = await env.DB.prepare(
      "SELECT current_bid, current_bid_user_id, bid_count FROM auctions WHERE id = ? LIMIT 1"
    )
      .bind(auction.id)
      .first();

    return json({
      ok: true,
      lotNo: String(auction.lot_no || lotNo),
      maxAmount,
      message: "Otomatik teklif limiti kaydedildi.",
      currentBid:
        refreshedAuction?.current_bid === null || refreshedAuction?.current_bid === undefined
          ? null
          : Number(refreshedAuction.current_bid),
      currentBidUserId: String(refreshedAuction?.current_bid_user_id || ""),
      bidCount: Number(refreshedAuction?.bid_count || 0),
    });
  }

  const autoBidDeleteMatch = path.match(/^\/api\/auth\/auto-bids\/([^/]+)$/);
  if (autoBidDeleteMatch && method === "DELETE") {
    const cfgError = requireSessionPepper(env);
    if (cfgError) return cfgError;
    await ensureMarketplaceSchemaWarm(env);

    const session = await getSession(request, env);
    if (!session) return json({ ok: false, error: "Otomatik teklif kapatmak icin giris yapmalisiniz." }, 401);

    const lotNo = decodeURIComponent(String(autoBidDeleteMatch[1] || ""))
      .trim()
      .toUpperCase();
    if (!lotNo) return json({ ok: false, error: "Ihale no zorunludur." }, 400);

    const auction = await env.DB.prepare(
      "SELECT id FROM auctions WHERE UPPER(TRIM(lot_no)) = UPPER(TRIM(?)) LIMIT 1"
    )
      .bind(lotNo)
      .first();
    if (!auction?.id) return json({ ok: false, error: "Ihale bulunamadi." }, 404);

    await env.DB.prepare(
      `UPDATE auction_auto_bids
       SET is_active = 0, updated_at = CURRENT_TIMESTAMP
       WHERE auction_id = ? AND user_id = ?`
    )
      .bind(auction.id, session.user.id)
      .run();

    return json({
      ok: true,
      lotNo,
      message: "Otomatik teklif kapatildi.",
    });
  }

  if (path.startsWith("/api/admin/")) {
    const cfgError = requireSessionPepper(env);
    if (cfgError) return cfgError;

    await ensureAdminSchemaWarm(env);
    if (method !== "GET") {
      await ensureMarketplaceSchemaWarm(env);
    }

    const session = await getSession(request, env);
    if (!session) return json({ ok: false, error: "Yönetim paneli için giriş yapmalısınız." }, 401);

    await ensureUserRole(env, session.user.id, session.user.email);
    const actorAccess = await getUserAccess(env, session.user.id, session.user.email);
    if (!actorAccess.permissions[PERMISSIONS.ADMIN_PANEL_ACCESS]) {
      return json({ ok: false, error: "Yönetim paneline erişim yetkiniz yok." }, 403);
    }

    if (method === "GET" && path === "/api/admin/me") {
      return json({
        ok: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: actorAccess.role,
          permissions: actorAccess.permissions,
        },
      });
    }

    if (method === "GET" && path === "/api/admin/permission-keys") {
      return json({
        ok: true,
        items: ALL_PERMISSION_KEYS.map((key) => ({
          key,
          label: permissionLabel(key),
        })),
      });
    }

    const canManageCatalog =
      actorAccess.permissions[PERMISSIONS.AUCTIONS_EDIT] || actorAccess.permissions[PERMISSIONS.AUCTIONS_CREATE];

    if (method === "GET" && path === "/api/admin/bootstrap") {
      const users = actorAccess.permissions[PERMISSIONS.USERS_VIEW] ? await getAdminUsersList(env) : [];
      const catalog = canManageCatalog ? await getCatalogSnapshotSafe(env) : { groups: [], categories: [] };
      const auctions = canManageCatalog ? await getAdminAuctionsListSafe(env) : [];
      const filterOrdering = actorAccess.permissions[PERMISSIONS.SETTINGS_MANAGE]
        ? await getPublicFilterOptionsSafe(env)
        : { order: emptyFilterOrderOption(), options: emptyFilterOrderOption() };
      const vehicleConditionLayout = await getVehicleConditionLayoutSafe(env);
      const vehicleConditionScale = await getVehicleConditionScaleSafe(env);

      return json({
        ok: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: actorAccess.role,
          permissions: actorAccess.permissions,
        },
        permissionDefs: ALL_PERMISSION_KEYS.map((key) => ({
          key,
          label: permissionLabel(key),
        })),
        users,
        groups: catalog.groups,
        categories: catalog.categories,
        auctions,
        filterOrdering,
        vehicleConditionLayout,
        vehicleConditionScale,
      });
    }

    if (method === "GET" && path === "/api/admin/catalog") {
      if (!canManageCatalog) {
        return json({ ok: false, error: "Katalog yönetim yetkiniz yok." }, 403);
      }
      return json({ ok: true, ...(await getCatalogSnapshotSafe(env)) });
    }

    if (method === "GET" && path === "/api/admin/filter-ordering") {
      if (!actorAccess.permissions[PERMISSIONS.SETTINGS_MANAGE]) {
        return json({ ok: false, error: "Filtre ayarlarini goruntuleme yetkiniz yok." }, 403);
      }
      return json({ ok: true, ...(await getPublicFilterOptionsSafe(env)) });
    }

    if (method === "POST" && path === "/api/admin/filter-ordering") {
      if (!actorAccess.permissions[PERMISSIONS.SETTINGS_MANAGE]) {
        return json({ ok: false, error: "Filtre ayari guncelleme yetkiniz yok." }, 403);
      }
      const body = await readJson(request);
      const normalized = normalizeFilterOptionOrder(body || {});
      await setAppSettingJsonSafe(env, FILTER_ORDER_SETTING_KEY, normalized, session.user.id);
      await writeAdminAuditLog(env, session.user.id, null, "filters.ordering.update", {
        keys: Object.keys(normalized || {}),
      });
      return json({
        ok: true,
        message: "Filtre siralamasi guncellendi.",
        ...(await getPublicFilterOptionsSafe(env)),
      });
    }

    if (method === "GET" && path === "/api/admin/vehicle-condition-layout") {
      return json({
        ok: true,
        layout: await getVehicleConditionLayoutSafe(env),
        scale: await getVehicleConditionScaleSafe(env),
      });
    }

    if (method === "POST" && path === "/api/admin/vehicle-condition-layout") {
      if (!actorAccess.permissions[PERMISSIONS.SETTINGS_MANAGE]) {
        return json({ ok: false, error: "Sema ayari guncelleme yetkiniz yok." }, 403);
      }
      const body = await readJson(request);
      const source = parseJsonObjectFromUnknown(body);
      const hasLayoutPayload =
        source.layout !== undefined ||
        source.parts !== undefined ||
        source.offsets !== undefined ||
        VEHICLE_CONDITION_PART_KEYS.some((partKey) => source[partKey] !== undefined);
      const hasScalePayload = source.scale !== undefined;

      const layout = hasLayoutPayload
        ? normalizeVehicleConditionLayoutInput(source.layout ?? source)
        : await getVehicleConditionLayoutSafe(env);
      const scale = hasScalePayload
        ? normalizeVehicleConditionScale(source.scale)
        : await getVehicleConditionScaleSafe(env);
      await setAppSettingJsonSafe(env, VEHICLE_CONDITION_LAYOUT_SETTING_KEY, layout, session.user.id);
      await setAppSettingJsonSafe(env, VEHICLE_CONDITION_SCALE_SETTING_KEY, scale, session.user.id);
      await writeAdminAuditLog(env, session.user.id, null, "vehicle_condition_layout.update", {
        partCount: Object.keys(layout || {}).length,
        scale,
      });
      return json({
        ok: true,
        message: "Kaporta sema konumlari guncellendi.",
        layout,
        scale,
      });
    }

    if (method === "POST" && path === "/api/admin/product-groups") {
      if (!canManageCatalog) {
        return json({ ok: false, error: "Ürün grubu ekleme yetkiniz yok." }, 403);
      }

      const body = await readJson(request);
      const name = String(body.name || "").trim();
      if (!name) return json({ ok: false, error: "Ürün grubu adı zorunludur." }, 400);

      const id = crypto.randomUUID();
      const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
      const isActive = body.isActive === false ? 0 : 1;

      try {
        await env.DB.prepare(
          `INSERT INTO product_groups (id, name, sort_order, is_active, created_at, updated_at)
           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        )
          .bind(id, name.slice(0, 120), sortOrder, isActive)
          .run();
      } catch {
        return json({ ok: false, error: "Bu isimde ürün grubu zaten var." }, 409);
      }

      await writeAdminAuditLog(env, session.user.id, null, "product_group.create", { id, name });
      return json({ ok: true, message: "Ürün grubu eklendi.", id });
    }

    const groupMatch = path.match(/^\/api\/admin\/product-groups\/([^/]+)$/);
    if (groupMatch && method === "PUT") {
      if (!canManageCatalog) {
        return json({ ok: false, error: "Ürün grubu güncelleme yetkiniz yok." }, 403);
      }

      const groupId = decodeURIComponent(String(groupMatch[1] || ""));
      const body = await readJson(request);
      const updates: string[] = [];
      const values: unknown[] = [];

      if (typeof body.name === "string") {
        const name = String(body.name || "").trim();
        if (!name) return json({ ok: false, error: "Ürün grubu adı boş olamaz." }, 400);
        updates.push("name = ?");
        values.push(name.slice(0, 120));
      }
      if (body.sortOrder !== undefined) {
        const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
        updates.push("sort_order = ?");
        values.push(sortOrder);
      }
      if (body.isActive !== undefined) {
        updates.push("is_active = ?");
        values.push(body.isActive === true ? 1 : 0);
      }

      if (updates.length < 1) return json({ ok: false, error: "Güncellenecek alan yok." }, 400);
      updates.push("updated_at = CURRENT_TIMESTAMP");
      values.push(groupId);

      try {
        const result = await env.DB.prepare(`UPDATE product_groups SET ${updates.join(", ")} WHERE id = ?`)
          .bind(...values)
          .run();
        if ((result.meta?.changes || 0) < 1) return json({ ok: false, error: "Ürün grubu bulunamadı." }, 404);
      } catch {
        return json({ ok: false, error: "Ürün grubu güncellenemedi. Aynı isimde kayıt olabilir." }, 409);
      }

      await writeAdminAuditLog(env, session.user.id, null, "product_group.update", { groupId });
      return json({ ok: true, message: "Ürün grubu güncellendi." });
    }

    if (groupMatch && method === "DELETE") {
      if (!canManageCatalog) {
        return json({ ok: false, error: "Ürün grubu silme yetkiniz yok." }, 403);
      }

      const groupId = decodeURIComponent(String(groupMatch[1] || ""));
      const existingGroup = await env.DB.prepare("SELECT id, name FROM product_groups WHERE id = ?")
        .bind(groupId)
        .first();
      if (!existingGroup?.id) return json({ ok: false, error: "Ürün grubu bulunamadı." }, 404);

      const groupCategories = await env.DB.prepare("SELECT id FROM categories WHERE group_id = ?").bind(groupId).all();

      for (const row of groupCategories.results || []) {
        const categoryId = String(row.id || "");
        if (!categoryId) continue;
        await env.DB.prepare(
          `UPDATE auctions
           SET category_id = NULL,
               updated_at = CURRENT_TIMESTAMP
           WHERE category_id = ?`
        )
          .bind(categoryId)
          .run();
      }

      await env.DB.prepare("DELETE FROM categories WHERE group_id = ?").bind(groupId).run();

      await env.DB.prepare(
        `UPDATE auctions
         SET product_group_id = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE product_group_id = ?`
      )
        .bind(groupId)
        .run();

      const deleted = await env.DB.prepare("DELETE FROM product_groups WHERE id = ?").bind(groupId).run();
      if ((deleted.meta?.changes || 0) < 1) return json({ ok: false, error: "Ürün grubu bulunamadı." }, 404);

      await writeAdminAuditLog(env, session.user.id, null, "product_group.delete", { groupId });
      return json({ ok: true, message: "Ürün grubu silindi." });
    }

    if (method === "POST" && path === "/api/admin/categories") {
      if (!canManageCatalog) {
        return json({ ok: false, error: "Kategori ekleme yetkiniz yok." }, 403);
      }

      const body = await readJson(request);
      const groupId = String(body.groupId || "").trim();
      const name = String(body.name || "").trim();
      if (!groupId) return json({ ok: false, error: "Ürün grubu seçmelisiniz." }, 400);
      if (!name) return json({ ok: false, error: "Kategori adı zorunludur." }, 400);

      const group = await env.DB.prepare("SELECT id FROM product_groups WHERE id = ?").bind(groupId).first();
      if (!group) return json({ ok: false, error: "Seçilen ürün grubu bulunamadı." }, 404);

      const id = crypto.randomUUID();
      const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
      const isActive = body.isActive === false ? 0 : 1;

      try {
        await insertCategoryRecord(env, {
          id,
          groupId,
          name: name.slice(0, 120),
          sortOrder,
          isActive,
        });
      } catch (error) {
        const message = String((error as any)?.message || "");
        if (message.toLowerCase().includes("unique") || message.toLowerCase().includes("constraint")) {
          return json({ ok: false, error: "Kategori eklenemedi. Aynı isimde bir kategori zaten var." }, 409);
        }
        return json({ ok: false, error: "Kategori eklenemedi. Lütfen tekrar deneyin." }, 500);
      }

      await writeAdminAuditLog(env, session.user.id, null, "category.create", { id, groupId, name });
      return json({ ok: true, message: "Kategori eklendi.", id });
    }

    const categoryMatch = path.match(/^\/api\/admin\/categories\/([^/]+)$/);
    if (categoryMatch && method === "PUT") {
      if (!canManageCatalog) {
        return json({ ok: false, error: "Kategori güncelleme yetkiniz yok." }, 403);
      }

      const categoryId = decodeURIComponent(String(categoryMatch[1] || ""));
      const body = await readJson(request);
      const updates: string[] = [];
      const values: unknown[] = [];

      if (body.groupId !== undefined) {
        const groupId = String(body.groupId || "").trim();
        if (!groupId) return json({ ok: false, error: "Geçerli ürün grubu seçin." }, 400);
        const group = await env.DB.prepare("SELECT id FROM product_groups WHERE id = ?").bind(groupId).first();
        if (!group) return json({ ok: false, error: "Seçilen ürün grubu bulunamadı." }, 404);
        updates.push("group_id = ?");
        values.push(groupId);
      }

      if (typeof body.name === "string") {
        const name = String(body.name || "").trim();
        if (!name) return json({ ok: false, error: "Kategori adı boş olamaz." }, 400);
        updates.push("name = ?");
        values.push(name.slice(0, 120));
        if (await tableHasColumn(env, "categories", "slug")) {
          const slug = await buildUniqueCategorySlug(env, name, categoryId);
          updates.push("slug = ?");
          values.push(slug);
        }
      }
      if (body.sortOrder !== undefined) {
        const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
        updates.push("sort_order = ?");
        values.push(sortOrder);
      }
      if (body.isActive !== undefined) {
        updates.push("is_active = ?");
        values.push(body.isActive === true ? 1 : 0);
      }

      if (updates.length < 1) return json({ ok: false, error: "Güncellenecek alan yok." }, 400);
      updates.push("updated_at = CURRENT_TIMESTAMP");
      values.push(categoryId);

      try {
        const result = await env.DB.prepare(`UPDATE categories SET ${updates.join(", ")} WHERE id = ?`).bind(...values).run();
        if ((result.meta?.changes || 0) < 1) return json({ ok: false, error: "Kategori bulunamadı." }, 404);
      } catch {
        return json({ ok: false, error: "Kategori güncellenemedi. Aynı isimde kayıt olabilir." }, 409);
      }

      await writeAdminAuditLog(env, session.user.id, null, "category.update", { categoryId });
      return json({ ok: true, message: "Kategori güncellendi." });
    }

    if (categoryMatch && method === "DELETE") {
      if (!canManageCatalog) {
        return json({ ok: false, error: "Kategori silme yetkiniz yok." }, 403);
      }

      const categoryId = decodeURIComponent(String(categoryMatch[1] || ""));
      const categoryRow = await env.DB.prepare("SELECT id, name, group_id FROM categories WHERE id = ?")
        .bind(categoryId)
        .first();
      if (!categoryRow) return json({ ok: false, error: "Kategori bulunamadı." }, 404);

      await env.DB.prepare(
        `UPDATE auctions
         SET category_id = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE category_id = ?`
      )
        .bind(categoryId)
        .run();

      const deleted = await env.DB.prepare("DELETE FROM categories WHERE id = ?").bind(categoryId).run();
      if ((deleted.meta?.changes || 0) < 1) return json({ ok: false, error: "Kategori bulunamadı." }, 404);

      await writeAdminAuditLog(env, session.user.id, null, "category.delete", { categoryId });
      return json({ ok: true, message: "Kategori silindi." });
    }

    if (method === "GET" && path === "/api/admin/auctions") {
      if (!canManageCatalog) {
        return json({ ok: false, error: "İhale görüntüleme yetkiniz yok." }, 403);
      }
      return json({ ok: true, items: await getAdminAuctionsListSafe(env) });
    }

    if (method === "POST" && path === "/api/admin/auctions") {
      if (!actorAccess.permissions[PERMISSIONS.AUCTIONS_CREATE] && !actorAccess.permissions[PERMISSIONS.AUCTIONS_EDIT]) {
        return json({ ok: false, error: "İhale ekleme yetkiniz yok." }, 403);
      }

      const body = await readJson(request);
      const validation = await validateAuctionPayload(env, body);
      if (validation.error) return json({ ok: false, error: validation.error }, 400);

      const existingByLotNo = await findAuctionIdByLotNo(env, validation.lotNo);
      if (existingByLotNo?.id) {
        try {
          await updateAuctionRecord(env, String(existingByLotNo.id), validation);
        } catch (error) {
          console.error("Admin auction upsert update failed:", error);
          const mapped = mapAuctionMutationError(error, "İhale kaydedilemedi. Lütfen alanları kontrol edip tekrar deneyin.");
          return json({ ok: false, error: mapped.error }, mapped.status);
        }

        await writeAdminAuditLog(env, session.user.id, null, "auction.create.upsert", { lotNo: validation.lotNo });
        return json({ ok: true, message: "Bu ihale no zaten vardi, mevcut kayit guncellendi." });
      }

      try {
        await env.DB.prepare(
          `INSERT INTO auctions (
            id, lot_no, title, start_price, current_bid, current_bid_user_id, min_increment, bid_count, starts_at, ends_at, status,
            product_group_id, category_id, city, district, neighborhood, image_url, gallery_json, description, extra_equipment,
            expertise_files_json, document_files_json,
            vehicle_brand, vehicle_model, vehicle_model_detail, vehicle_year, vehicle_km, vehicle_fuel_type,
            vehicle_transmission, vehicle_body_type, vehicle_color, vehicle_chassis_no, vehicle_engine_volume, vehicle_engine_power, vehicle_drive_type,
            vehicle_condition_map_json, vehicle_expertise_meta_json,
            machine_brand, machine_model, machine_year, machine_hours, machine_type, machine_weight, machine_power, machine_attrs_json,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, NULL, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        )
          .bind(
            crypto.randomUUID(),
            validation.lotNo,
            validation.title,
            validation.startPrice,
            null,
            validation.minIncrement,
            validation.startsAt,
            validation.endsAt,
            validation.status,
            validation.groupId,
            validation.categoryId,
            validation.city,
            validation.district,
            validation.neighborhood,
            validation.imageUrl,
            validation.galleryJson,
            validation.description,
            validation.extraEquipment,
            validation.expertiseFilesJson,
            validation.documentFilesJson,
            validation.vehicleBrand,
            validation.vehicleModel,
            validation.vehicleModelDetail,
            validation.vehicleYear,
            validation.vehicleKm,
            validation.vehicleFuelType,
            validation.vehicleTransmission,
            validation.vehicleBodyType,
            validation.vehicleColor,
            validation.vehicleChassisNo,
            validation.vehicleEngineVolume,
            validation.vehicleEnginePower,
            validation.vehicleDriveType,
            validation.vehicleConditionMapJson,
            validation.vehicleExpertiseMetaJson,
            validation.machineBrand || "",
            validation.machineModel || "",
            validation.machineYear || 0,
            validation.machineHours || 0,
            validation.machineType || "",
            validation.machineWeight || 0,
            validation.machinePower || "",
            validation.machineAttrsJson || ""
          )
          .run();
      } catch (error) {
        console.error("Admin auction create failed:", error);
        if (isAuctionLotNoUniqueConstraintError(error)) {
          const conflictingLot = await findAuctionIdByLotNo(env, validation.lotNo);
          if (conflictingLot?.id) {
            try {
              await updateAuctionRecord(env, String(conflictingLot.id), validation);
              await writeAdminAuditLog(env, session.user.id, null, "auction.create.upsert", { lotNo: validation.lotNo });
              return json({ ok: true, message: "Bu ihale no zaten vardi, mevcut kayit guncellendi." });
            } catch (upsertError) {
              console.error("Admin auction create conflict upsert failed:", upsertError);
              const mapped = mapAuctionMutationError(upsertError, "İhale kaydedilemedi. Lütfen alanları kontrol edip tekrar deneyin.");
              return json({ ok: false, error: mapped.error }, mapped.status);
            }
          }
          return json({ ok: false, error: "İhale oluşturulamadı. Bu ihale no başka bir ihalede kullanılıyor." }, 409);
        }
        const mapped = mapAuctionMutationError(error, "İhale oluşturulamadı. Lütfen alanları kontrol edip tekrar deneyin.");
        return json({ ok: false, error: mapped.error }, mapped.status);
      }

      await writeAdminAuditLog(env, session.user.id, null, "auction.create", { lotNo: validation.lotNo });
      return json({ ok: true, message: "İhale eklendi." });
    }

    const auctionMatch = path.match(/^\/api\/admin\/auctions\/([^/]+)$/);
    const auctionStatusMatch = path.match(/^\/api\/admin\/auctions\/([^/]+)\/status$/);
    const auctionBidsMatch = path.match(/^\/api\/admin\/auctions\/([^/]+)\/bids$/);
    if (auctionBidsMatch && method === "GET") {
      if (actorAccess.role !== USER_ROLES.ADMIN) {
        return json({ ok: false, error: "Bu alani sadece superadmin goruntuleyebilir." }, 403);
      }
      if (!canManageCatalog) {
        return json({ ok: false, error: "Ihale tekliflerini goruntuleme yetkiniz yok." }, 403);
      }

      const auctionId = decodeURIComponent(String(auctionBidsMatch[1] || ""));
      const bidHistory = await getAdminAuctionBidHistory(env, auctionId);
      if (!bidHistory) return json({ ok: false, error: "Ihale bulunamadi." }, 404);
      return json({ ok: true, ...bidHistory });
    }

    if (auctionStatusMatch && method === "POST") {
      if (!actorAccess.permissions[PERMISSIONS.AUCTIONS_EDIT] && !actorAccess.permissions[PERMISSIONS.AUCTIONS_CLOSE]) {
        return json({ ok: false, error: "İhale durumunu değiştirme yetkiniz yok." }, 403);
      }

      const auctionId = decodeURIComponent(String(auctionStatusMatch[1] || ""));
      const body = await readJson(request);
      const statusRaw = String(body.status || "").trim().toUpperCase();
      const status = statusRaw === "PASSIVE" ? "PASSIVE" : statusRaw === "ACTIVE" ? "ACTIVE" : "";
      if (!status) {
        return json({ ok: false, error: "Geçersiz ihale durumu." }, 400);
      }

      const result = await env.DB.prepare(
        `UPDATE auctions
         SET status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      )
        .bind(status, auctionId)
        .run();
      if ((result.meta?.changes || 0) < 1) {
        return json({ ok: false, error: "İhale bulunamadı." }, 404);
      }

      await writeAdminAuditLog(env, session.user.id, null, "auction.status", { auctionId, status });
      return json({ ok: true, message: status === "PASSIVE" ? "İhale pasife alındı." : "İhale aktif edildi." });
    }

    if (auctionMatch && method === "PUT") {
      if (!actorAccess.permissions[PERMISSIONS.AUCTIONS_EDIT]) {
        return json({ ok: false, error: "İhale düzenleme yetkiniz yok." }, 403);
      }

      const auctionId = decodeURIComponent(String(auctionMatch[1] || ""));
      const body = await readJson(request);
      const validation = await validateAuctionPayload(env, body);
      if (validation.error) return json({ ok: false, error: validation.error }, 400);

      const existingByLotNo = await findAuctionIdByLotNo(env, validation.lotNo);
      if (existingByLotNo?.id && String(existingByLotNo.id) !== auctionId) {
        return json({ ok: false, error: "Bu ihale no başka bir kayıtta kullanılıyor." }, 409);
      }

      try {
        const result = await updateAuctionRecord(env, auctionId, validation);

        if ((result.meta?.changes || 0) < 1) return json({ ok: false, error: "İhale bulunamadı." }, 404);
      } catch (error) {
        console.error("Admin auction update failed:", error);
        const mapped = mapAuctionMutationError(error, "İhale güncellenemedi. Lütfen alanları kontrol edip tekrar deneyin.");
        return json({ ok: false, error: mapped.error }, mapped.status);
      }

      await writeAdminAuditLog(env, session.user.id, null, "auction.update", { auctionId });
      return json({ ok: true, message: "İhale güncellendi." });
    }

    if (auctionMatch && method === "DELETE") {
      if (!actorAccess.permissions[PERMISSIONS.AUCTIONS_EDIT]) {
        return json({ ok: false, error: "İhale silme yetkiniz yok." }, 403);
      }

      const auctionId = decodeURIComponent(String(auctionMatch[1] || ""));
      const result = await env.DB.prepare("DELETE FROM auctions WHERE id = ?").bind(auctionId).run();
      if ((result.meta?.changes || 0) < 1) return json({ ok: false, error: "İhale bulunamadı." }, 404);

      await writeAdminAuditLog(env, session.user.id, null, "auction.delete", { auctionId });
      return json({ ok: true, message: "İhale silindi." });
    }

    if (method === "GET" && path === "/api/admin/users") {
      if (!actorAccess.permissions[PERMISSIONS.USERS_VIEW]) {
        return json({ ok: false, error: "Kullanıcıları görüntüleme yetkiniz yok." }, 403);
      }
      return json({ ok: true, items: await getAdminUsersList(env) });
    }

    const roleMatch = path.match(/^\/api\/admin\/users\/([^/]+)\/role$/);
    if (method === "POST" && roleMatch) {
      if (!actorAccess.permissions[PERMISSIONS.USERS_PERMISSIONS]) {
        return json({ ok: false, error: "Rol güncelleme yetkiniz yok." }, 403);
      }

      const targetUserId = decodeURIComponent(String(roleMatch[1] || ""));
      const body = await readJson(request);
      const nextRole = normalizeRole(body.role);

      if (!isValidRole(nextRole)) {
        return json({ ok: false, error: "Geçersiz rol seçimi." }, 400);
      }

      const targetUser = await env.DB.prepare("SELECT id, email FROM users WHERE id = ?").bind(targetUserId).first();
      if (!targetUser) return json({ ok: false, error: "Kullanıcı bulunamadı." }, 404);

      if (targetUserId === session.user.id && nextRole === USER_ROLES.MEMBER) {
        return json({ ok: false, error: "Kendi rolünüzü standart kullanıcıya düşüremezsiniz." }, 400);
      }

      await env.DB.prepare(
        `INSERT INTO user_roles (user_id, role, created_at, updated_at)
         VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT(user_id) DO UPDATE SET role = excluded.role, updated_at = CURRENT_TIMESTAMP`
      )
        .bind(targetUserId, nextRole)
        .run();

      await writeAdminAuditLog(env, session.user.id, targetUserId, "user.role.update", {
        role: nextRole,
      });

      const targetAccess = await getUserAccess(env, targetUserId, targetUser.email);
      return json({
        ok: true,
        message: "Kullanıcı rolü güncellendi.",
        role: targetAccess.role,
        permissions: targetAccess.permissions,
      });
    }

    const permissionMatch = path.match(/^\/api\/admin\/users\/([^/]+)\/permissions$/);
    if (method === "POST" && permissionMatch) {
      if (!actorAccess.permissions[PERMISSIONS.USERS_PERMISSIONS]) {
        return json({ ok: false, error: "Yetki güncelleme yetkiniz yok." }, 403);
      }

      const targetUserId = decodeURIComponent(String(permissionMatch[1] || ""));
      const body = await readJson(request);
      const permissionKey = String(body.permissionKey || "").trim();
      const enabled = body.enabled === true;
      if (!isKnownPermission(permissionKey)) {
        return json({ ok: false, error: "Geçersiz yetki anahtarı." }, 400);
      }

      const targetUser = await env.DB.prepare("SELECT id, email FROM users WHERE id = ?").bind(targetUserId).first();
      if (!targetUser) return json({ ok: false, error: "Kullanıcı bulunamadı." }, 404);
      const targetAccessBefore = await getUserAccess(env, targetUserId, targetUser.email);
      if (targetAccessBefore.role === USER_ROLES.ADMIN) {
        return json({ ok: false, error: "Admin kullanıcısının yetkileri sınırsızdır ve değiştirilemez." }, 400);
      }

      if (
        targetUserId === session.user.id &&
        !enabled &&
        (permissionKey === PERMISSIONS.ADMIN_PANEL_ACCESS || permissionKey === PERMISSIONS.USERS_PERMISSIONS)
      ) {
        return json({ ok: false, error: "Kendi kritik yetkinizi kapatamazsınız." }, 400);
      }

      await env.DB.prepare(
        `INSERT INTO user_permission_overrides (user_id, permission_key, is_enabled, updated_at, updated_by)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)
         ON CONFLICT(user_id, permission_key)
         DO UPDATE SET is_enabled = excluded.is_enabled, updated_at = CURRENT_TIMESTAMP, updated_by = excluded.updated_by`
      )
        .bind(targetUserId, permissionKey, enabled ? 1 : 0, session.user.id)
        .run();

      await writeAdminAuditLog(env, session.user.id, targetUserId, "user.permission.update", {
        permissionKey,
        enabled,
      });

      const targetAccess = await getUserAccess(env, targetUserId, targetUser.email);
      return json({
        ok: true,
        message: "Kullanıcı yetkisi güncellendi.",
        permissions: targetAccess.permissions,
      });
    }

    const passwordMatch = path.match(/^\/api\/admin\/users\/([^/]+)\/password$/);
    if (method === "POST" && passwordMatch) {
      if (!actorAccess.permissions[PERMISSIONS.USERS_PERMISSIONS]) {
        return json({ ok: false, error: "Kullanıcı şifresi değiştirme yetkiniz yok." }, 403);
      }

      const targetUserId = decodeURIComponent(String(passwordMatch[1] || ""));
      const body = await readJson(request);
      const newPassword = String(body.newPassword || "").trim();
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        return json({ ok: false, error: `Yeni şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalıdır.` }, 400);
      }

      const targetUser = await env.DB.prepare("SELECT id, email FROM users WHERE id = ?").bind(targetUserId).first();
      if (!targetUser) return json({ ok: false, error: "Kullanıcı bulunamadı." }, 404);

      const passwordHash = await hashPassword(newPassword);
      await env.DB.batch([
        env.DB.prepare("UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(
          passwordHash,
          targetUserId
        ),
        env.DB.prepare("DELETE FROM password_reset_tokens WHERE user_id = ?").bind(targetUserId),
        env.DB.prepare("UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL").bind(
          targetUserId
        ),
      ]);

      await writeAdminAuditLog(env, session.user.id, targetUserId, "user.password.update", {
        revokedSessions: true,
      });

      return json({
        ok: true,
        message: "Kullanıcı şifresi güncellendi.",
      });
    }

    const statusMatch = path.match(/^\/api\/admin\/users\/([^/]+)\/status$/);
    if (method === "POST" && statusMatch) {
      if (!actorAccess.permissions[PERMISSIONS.USERS_BLOCK]) {
        return json({ ok: false, error: "Kullanıcı durumunu değiştirme yetkiniz yok." }, 403);
      }

      const targetUserId = decodeURIComponent(String(statusMatch[1] || ""));
      if (targetUserId === session.user.id) {
        return json({ ok: false, error: "Kendi hesabınızı pasife alamazsınız." }, 400);
      }

      const body = await readJson(request);
      const disabled = body.disabled === true;

      const targetUser = await env.DB.prepare("SELECT id, email FROM users WHERE id = ?").bind(targetUserId).first();
      if (!targetUser) return json({ ok: false, error: "Kullanıcı bulunamadı." }, 404);

      if (disabled) {
        await env.DB.batch([
          env.DB.prepare(
            "UPDATE users SET disabled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
          ).bind(targetUserId),
          env.DB.prepare("UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL").bind(
            targetUserId
          ),
        ]);
      } else {
        await env.DB.prepare("UPDATE users SET disabled_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
          .bind(targetUserId)
          .run();
      }

      await writeAdminAuditLog(env, session.user.id, targetUserId, "user.status.update", {
        disabled,
      });

      return json({
        ok: true,
        message: disabled ? "Kullanıcı pasife alındı." : "Kullanıcı tekrar aktifleştirildi.",
      });
    }

    const revokeMatch = path.match(/^\/api\/admin\/users\/([^/]+)\/revoke-sessions$/);
    if (method === "POST" && revokeMatch) {
      if (!actorAccess.permissions[PERMISSIONS.USERS_SESSIONS_REVOKE]) {
        return json({ ok: false, error: "Oturum sonlandırma yetkiniz yok." }, 403);
      }

      const targetUserId = decodeURIComponent(String(revokeMatch[1] || ""));
      const targetUser = await env.DB.prepare("SELECT id, email FROM users WHERE id = ?").bind(targetUserId).first();
      if (!targetUser) return json({ ok: false, error: "Kullanıcı bulunamadı." }, 404);

      await env.DB.prepare("UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL")
        .bind(targetUserId)
        .run();

      await writeAdminAuditLog(env, session.user.id, targetUserId, "user.sessions.revoke", {});
      return json({ ok: true, message: "Aktif oturumlar sonlandırıldı." });
    }

    if (method === "PUT" && path.endsWith("/approve")) {
      const approveMatch = path.match(/^\/api\/admin\/users\/([^/]+)\/approve$/);
      if (approveMatch) {
        if (!actorAccess.permissions[PERMISSIONS.USERS_BLOCK]) {
          return json({ ok: false, error: "Kullanıcı onaylama yetkiniz yok." }, 403);
        }
        const targetUserId = decodeURIComponent(String(approveMatch[1] || ""));
        const targetUser = await env.DB.prepare("SELECT id, status FROM users WHERE id = ?").bind(targetUserId).first();
        if (!targetUser) return json({ ok: false, error: "Kullanıcı bulunamadı." }, 404);
        if (targetUser.status !== "pending") return json({ ok: false, error: "Bu kullanıcı onay beklememektedir." }, 400);
        await env.DB.prepare(
          "UPDATE users SET status = 'active', email_verified_at = COALESCE(email_verified_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        ).bind(targetUserId).run();
        await writeAdminAuditLog(env, session.user.id, targetUserId, "user.approve", {});
        return json({ ok: true, message: "Kullanıcı onaylandı." });
      }
    }

    if (method === "PUT" && path.endsWith("/reject")) {
      const rejectMatch = path.match(/^\/api\/admin\/users\/([^/]+)\/reject$/);
      if (rejectMatch) {
        if (!actorAccess.permissions[PERMISSIONS.USERS_BLOCK]) {
          return json({ ok: false, error: "Kullanıcı reddetme yetkiniz yok." }, 403);
        }
        const targetUserId = decodeURIComponent(String(rejectMatch[1] || ""));
        const targetUser = await env.DB.prepare("SELECT id, status FROM users WHERE id = ?").bind(targetUserId).first();
        if (!targetUser) return json({ ok: false, error: "Kullanıcı bulunamadı." }, 404);
        if (targetUser.status !== "pending") return json({ ok: false, error: "Bu kullanıcı onay beklememektedir." }, 400);
        await env.DB.prepare(
          "UPDATE users SET status = 'disabled', disabled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        ).bind(targetUserId).run();
        await writeAdminAuditLog(env, session.user.id, targetUserId, "user.reject", {});
        return json({ ok: true, message: "Kullanıcı reddedildi." });
      }
    }

    const deleteUserMatch = path.match(/^\/api\/admin\/users\/([^/]+)$/);
    if (method === "DELETE" && deleteUserMatch) {
      if (actorAccess.role !== USER_ROLES.ADMIN) {
        return json({ ok: false, error: "Kullanıcı silme yetkiniz yok." }, 403);
      }
      const targetUserId = decodeURIComponent(String(deleteUserMatch[1] || ""));
      if (targetUserId === session.user.id) {
        return json({ ok: false, error: "Kendinizi silemezsiniz." }, 400);
      }
      const targetUser = await env.DB.prepare("SELECT id, role FROM users WHERE id = ?").bind(targetUserId).first();
      if (!targetUser) return json({ ok: false, error: "Kullanıcı bulunamadı." }, 404);
      if (targetUser.role === USER_ROLES.ADMIN) {
        return json({ ok: false, error: "Admin kullanıcı silinemez." }, 400);
      }
      await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(targetUserId).run();
      await writeAdminAuditLog(env, session.user.id, targetUserId, "user.delete", {});
      return json({ ok: true, message: "Kullanıcı silindi." });
    }

    if (method === "GET" && path === "/api/admin/membership-plans") {
      if (!actorAccess.permissions[PERMISSIONS.SETTINGS_MANAGE]) {
        return json({ ok: false, error: "Yetkiniz yok." }, 403);
      }
      await ensureMarketplaceSchemaWarm(env);
      const rows = await env.DB.prepare(
        "SELECT id, name, description, price, currency, duration_days, features_json, sort_order, is_active, created_at FROM membership_plans ORDER BY sort_order ASC"
      ).all();
      return json({ ok: true, items: rows.results || [] });
    }

    if (method === "POST" && path === "/api/admin/membership-plans") {
      if (!actorAccess.permissions[PERMISSIONS.SETTINGS_MANAGE]) {
        return json({ ok: false, error: "Yetkiniz yok." }, 403);
      }
      await ensureMarketplaceSchemaWarm(env);
      const body = await readJson(request);
      const name = String(body.name || "").trim();
      if (!name) return json({ ok: false, error: "Paket adı zorunludur." }, 400);
      const price = Number(body.price) || 0;
      const durationDays = Number(body.durationDays) || 0;
      if (durationDays < 1) return json({ ok: false, error: "Geçerli süre girin." }, 400);
      const id = crypto.randomUUID();
      const featuresJson = JSON.stringify(Array.isArray(body.features) ? body.features : []);
      await env.DB.prepare(
        `INSERT INTO membership_plans (id, name, description, price, currency, duration_days, features_json, sort_order, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`
      ).bind(id, name, String(body.description || "").trim(), price, "TRY", durationDays, featuresJson, Number(body.sortOrder) || 0).run();
      return json({ ok: true, message: "Paket eklendi.", id });
    }

    const planMatch = path.match(/^\/api\/admin\/membership-plans\/([^/]+)$/);
    if (planMatch) {
      if (!actorAccess.permissions[PERMISSIONS.SETTINGS_MANAGE]) {
        return json({ ok: false, error: "Yetkiniz yok." }, 403);
      }
      await ensureMarketplaceSchemaWarm(env);
      const planId = decodeURIComponent(String(planMatch[1] || ""));
      if (method === "PUT") {
        const body = await readJson(request);
        const name = String(body.name || "").trim();
        if (!name) return json({ ok: false, error: "Paket adı zorunludur." }, 400);
        const price = Number(body.price) || 0;
        const durationDays = Number(body.durationDays) || 0;
        if (durationDays < 1) return json({ ok: false, error: "Geçerli süre girin." }, 400);
        const featuresJson = JSON.stringify(Array.isArray(body.features) ? body.features : []);
        await env.DB.prepare(
          `UPDATE membership_plans SET name = ?, description = ?, price = ?, currency = ?, duration_days = ?, features_json = ?, sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        ).bind(name, String(body.description || "").trim(), price, "TRY", durationDays, featuresJson, Number(body.sortOrder) || 0, body.isActive === false ? 0 : 1, planId).run();
        return json({ ok: true, message: "Paket güncellendi." });
      }
      if (method === "DELETE") {
        await env.DB.prepare("DELETE FROM membership_plans WHERE id = ?").bind(planId).run();
        return json({ ok: true, message: "Paket silindi." });
      }
    }

    if (method === "GET" && path === "/api/admin/content-settings") {
      if (!actorAccess.permissions[PERMISSIONS.SETTINGS_MANAGE]) {
        return json({ ok: false, error: "Yetkiniz yok." }, 403);
      }
      const data = await getAppSettingJson(env, "homepage_content", {});
      return json({ ok: true, items: data });
    }

    if (method === "PUT" && path === "/api/admin/content-settings") {
      if (!actorAccess.permissions[PERMISSIONS.SETTINGS_MANAGE]) {
        return json({ ok: false, error: "Yetkiniz yok." }, 403);
      }
      const body = await readJson(request);
      const content = body.content || {};
      await setAppSettingJsonSafe(env, "homepage_content", content, session.user.id);
      await writeAdminAuditLog(env, session.user.id, null, "content.update", {});
      return json({ ok: true, message: "İçerik kaydedildi." });
    }

    if (method === "GET" && path.startsWith("/api/admin/users/") && path.endsWith("/memberships")) {
      if (!actorAccess.permissions[PERMISSIONS.USERS_VIEW]) {
        return json({ ok: false, error: "Yetkiniz yok." }, 403);
      }
      await ensureMarketplaceSchemaWarm(env);
      const userId = path.split("/")[4];
      if (!userId) return json({ ok: false, error: "Kullanıcı ID gerekli." }, 400);
      const rows = await env.DB.prepare(
        `SELECT m.id, m.starts_at, m.expires_at, m.status, p.name AS plan_name
         FROM user_memberships m
         JOIN membership_plans p ON p.id = m.plan_id
         WHERE m.user_id = ?
         ORDER BY m.created_at DESC`
      ).bind(userId).all();
      return json({ ok: true, items: rows.results || [] });
    }

    const assignMembershipMatch = path.match(/^\/api\/admin\/users\/([^/]+)\/memberships$/);
    if (method === "POST" && assignMembershipMatch) {
      if (!actorAccess.permissions[PERMISSIONS.USERS_PERMISSIONS]) {
        return json({ ok: false, error: "Yetkiniz yok." }, 403);
      }
      const targetUserId = decodeURIComponent(String(assignMembershipMatch[1] || ""));
      const body = await readJson(request);
      const planId = String(body.planId || "").trim();
      if (!planId) return json({ ok: false, error: "Plan ID gerekli." }, 400);
      const plan = await env.DB.prepare("SELECT id, duration_days FROM membership_plans WHERE id = ?").bind(planId).first();
      if (!plan) return json({ ok: false, error: "Plan bulunamadı." }, 404);
      const startsAt = String(body.startsAt || new Date().toISOString());
      const startDate = new Date(startsAt);
      const endDate = new Date(startDate.getTime() + Number(plan.duration_days) * 86400000);
      const id = crypto.randomUUID();
      await env.DB.prepare(
        `INSERT INTO user_memberships (id, user_id, plan_id, starts_at, expires_at, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      ).bind(id, targetUserId, planId, startDate.toISOString(), endDate.toISOString()).run();
      await writeAdminAuditLog(env, session.user.id, targetUserId, "user.membership.assign", { planId });
      return json({ ok: true, message: "Üyelik atandı.", id, expiresAt: endDate.toISOString() });
    }

    const revokeMembershipMatch = path.match(/^\/api\/admin\/memberships\/([^/]+)\/revoke$/);
    if (method === "POST" && revokeMembershipMatch) {
      if (!actorAccess.permissions[PERMISSIONS.USERS_PERMISSIONS]) {
        return json({ ok: false, error: "Yetkiniz yok." }, 403);
      }
      const membershipId = decodeURIComponent(String(revokeMembershipMatch[1] || ""));
      const membership = await env.DB.prepare("SELECT user_id FROM user_memberships WHERE id = ?").bind(membershipId).first();
      if (!membership) return json({ ok: false, error: "Üyelik bulunamadı." }, 404);
      await env.DB.prepare("UPDATE user_memberships SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(membershipId).run();
      await writeAdminAuditLog(env, session.user.id, membership.user_id, "user.membership.revoke", { membershipId });
      return json({ ok: true, message: "Üyelik iptal edildi." });
    }

    return json({ ok: false, error: "Admin endpoint bulunamadı." }, 404);
  }

  return json({ ok: false, error: "Endpoint bulunamadı." }, 404);
}

async function createSession(env, request, userId, db = env.DB) {
  const sessionId = randomToken(18);
  const sessionSecret = randomToken(32);
  const secretHash = await hashSessionSecret(sessionSecret, env.SESSION_PEPPER);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
  const userAgent = request.headers.get("user-agent") || "";
  const ipHash = await sha256Hex(`${env.SESSION_PEPPER}:${getClientIp(request)}`);

  await db.prepare(
    `INSERT INTO sessions (
      id, user_id, secret_hash, user_agent, ip_hash, expires_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  )
    .bind(sessionId, userId, secretHash, userAgent.slice(0, 300), ipHash, expiresAt)
    .run();

  return {
    expiresAt,
    cookie: sessionCookie(`${sessionId}.${sessionSecret}`, SESSION_TTL_SECONDS),
  };
}

async function getSession(request, env) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readCookie(cookieHeader, "session");
  if (!token) return null;
  const db = typeof env.DB?.withSession === "function" ? env.DB.withSession("first-primary") : env.DB;

  const [sessionId, sessionSecret] = token.split(".");
  if (!sessionId || !sessionSecret) return null;

  const row = await db.prepare(
    `SELECT
      s.id as session_id, s.user_id as session_user_id, s.secret_hash, s.expires_at, s.revoked_at,
      u.id, u.email, u.name, u.email_verified_at, u.disabled_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.id = ?`
  )
    .bind(sessionId)
    .first();

  if (!row) return null;
  if (row.revoked_at) return null;
  if (row.disabled_at) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) return null;

  const expected = await hashSessionSecret(sessionSecret, env.SESSION_PEPPER);
  if (!safeEqual(expected, row.secret_hash)) return null;

  return {
    session: {
      id: row.session_id,
      userId: row.session_user_id,
      expiresAt: row.expires_at,
    },
    user: {
      id: row.id,
      email: row.email,
      name: row.name,
      email_verified_at: row.email_verified_at,
    },
  };
}

async function getSessionSafe(request, env) {
  try {
    if (!env?.SESSION_PEPPER) return null;
    return await getSession(request, env);
  } catch (error) {
    console.warn("Opsiyonel oturum sorgusu hatasi:", error);
    return null;
  }
}

async function ensureUserRole(env, userId, email, db = env.DB) {
  const bootstrapRole = getBootstrapRoleForEmail(env, email);
  try {
    const existing = await db.prepare("SELECT role FROM user_roles WHERE user_id = ?").bind(userId).first();
    if (!existing) {
      await db.prepare(
        "INSERT INTO user_roles (user_id, role, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
      )
        .bind(userId, bootstrapRole)
        .run();
      return bootstrapRole;
    }

    const currentRole = normalizeRole(existing.role);
    if (bootstrapRole === USER_ROLES.ADMIN && currentRole !== USER_ROLES.ADMIN) {
      await db.prepare("UPDATE user_roles SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?")
        .bind(USER_ROLES.ADMIN, userId)
        .run();
      return USER_ROLES.ADMIN;
    }

    return currentRole;
  } catch (error) {
    console.warn("user_roles tablosu hazir degil, varsayilan rol kullanildi:", error);
    return bootstrapRole;
  }
}

function getBootstrapAdminCredentialsList(env) {
  const list = [
    { email: normalizeEmail("gokcek@outlook.com"), password: "123456" },
  ];

  const envEmail = normalizeEmail(env.ADMIN_BOOTSTRAP_EMAIL || "");
  const envPassword = String(env.ADMIN_BOOTSTRAP_PASSWORD || "");
  if (isValidEmail(envEmail) && envPassword) {
    const duplicate = list.some((item) => item.email === envEmail && item.password === envPassword);
    if (!duplicate) {
      list.push({ email: envEmail, password: envPassword });
    }
  }

  return list;
}

function matchesBootstrapAdminCredentials(env, email, password) {
  const normalizedEmail = normalizeEmail(email);
  const rawPassword = String(password || "");
  const list = getBootstrapAdminCredentialsList(env);
  return list.some((creds) => creds.email === normalizedEmail && creds.password === rawPassword);
}

async function ensureBootstrapAdminUser(env, db = env.DB) {
  const list = getBootstrapAdminCredentialsList(env);
  for (const creds of list) {
    if (!isValidEmail(creds.email) || !creds.password) continue;
    await ensureSingleBootstrapAdminUser(env, creds.email, creds.password, db);
  }
}

async function ensureSingleBootstrapAdminUser(env, adminEmail, adminPassword, db = env.DB) {
  if (!isValidEmail(adminEmail) || !adminPassword) return;

  try {
    const existing = await db.prepare(
      "SELECT id, email, password_hash FROM users WHERE email = ?"
    )
      .bind(adminEmail)
      .first();

    if (!existing) {
      const userId = crypto.randomUUID();
      const passwordHash = await hashPassword(adminPassword);
      await db.prepare(
        "INSERT INTO users (id, email, name, password_hash, email_verified_at, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
      )
        .bind(userId, adminEmail, "Platform Yoneticisi", passwordHash)
        .run();

      try {
        await db.prepare(
          "INSERT INTO user_roles (user_id, role, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT(user_id) DO UPDATE SET role = excluded.role, updated_at = CURRENT_TIMESTAMP"
        )
          .bind(userId, USER_ROLES.ADMIN)
          .run();
      } catch (roleError) {
        console.warn("Bootstrap admin rol yazimi atlandi (migration bekleniyor olabilir):", roleError);
      }
      return;
    }

    await db.prepare(
      "UPDATE users SET email_verified_at = COALESCE(email_verified_at, CURRENT_TIMESTAMP), disabled_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    )
      .bind(existing.id)
      .run();

    const passOk = await verifyPassword(adminPassword, existing.password_hash);
    if (!passOk) {
      const passwordHash = await hashPassword(adminPassword);
      await db.prepare("UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(passwordHash, existing.id)
        .run();
    }

    try {
      await db.prepare(
        "INSERT INTO user_roles (user_id, role, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT(user_id) DO UPDATE SET role = excluded.role, updated_at = CURRENT_TIMESTAMP"
      )
        .bind(existing.id, USER_ROLES.ADMIN)
        .run();
    } catch (roleError) {
      console.warn("Bootstrap admin rol yazimi atlandi (migration bekleniyor olabilir):", roleError);
    }
  } catch (error) {
    console.error("Bootstrap admin hazirlama hatasi:", error);
  }
}

async function forceBootstrapAdminLogin(env, request, db, email, password) {
  try {
    const normalizedEmail = normalizeEmail(email);
    const userName = "Platform Yoneticisi";
    const passwordHash = await hashPassword(String(password || ""));
    const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(normalizedEmail).first();
    const targetUserId = existing?.id || "bootstrap-admin-gokcek";

    await db.prepare(
      `INSERT INTO users (id, email, name, password_hash, email_verified_at, disabled_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT(email) DO UPDATE SET
         name = excluded.name,
         password_hash = excluded.password_hash,
         email_verified_at = COALESCE(users.email_verified_at, CURRENT_TIMESTAMP),
         disabled_at = NULL,
         updated_at = CURRENT_TIMESTAMP`
    )
      .bind(targetUserId, normalizedEmail, userName, passwordHash)
      .run();

    try {
      await db.prepare(
        `INSERT INTO user_roles (user_id, role, created_at, updated_at)
         VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT(user_id) DO UPDATE SET role = excluded.role, updated_at = CURRENT_TIMESTAMP`
      )
        .bind(targetUserId, USER_ROLES.ADMIN)
        .run();
    } catch {
      // migration gelmemis olabilir; bu durumda rol fallback'i devreye girer
    }

    const access = await getUserAccess(env, targetUserId, normalizedEmail, db);
    const { cookie, expiresAt } = await createSession(env, request, targetUserId, db);
    const headers = new Headers({ "content-type": "application/json; charset=utf-8" });
    headers.append("set-cookie", cookie);

    const response = new Response(
      JSON.stringify({
        ok: true,
        message: "Giriş başarılı.",
        expiresAt,
        user: {
          id: targetUserId,
          email: normalizedEmail,
          name: userName,
          emailVerified: true,
          role: access.role,
          permissions: access.permissions,
        },
      }),
      { status: 200, headers }
    );
    return { ok: true, response };
  } catch (error) {
    console.error("Force bootstrap admin login hatasi:", error);
    return {
      ok: false,
      error: `Force bootstrap admin login hatasi: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function getUserAccess(env, userId, email = "", db = env.DB) {
  const role = await ensureUserRole(env, userId, email, db);
  const overrides: Record<string, boolean> = {};
  try {
    const overrideRows = await db.prepare(
      "SELECT permission_key, is_enabled FROM user_permission_overrides WHERE user_id = ?"
    )
      .bind(userId)
      .all();

    for (const row of overrideRows.results || []) {
      const key = String(row.permission_key || "");
      if (!isKnownPermission(key)) continue;
      overrides[key] = Number(row.is_enabled || 0) === 1;
    }
  } catch (error) {
    console.warn("user_permission_overrides tablosu hazir degil, rol bazli yetkiler kullaniliyor:", error);
  }

  return {
    role,
    permissions: buildRolePermissions(role, overrides),
  };
}

function buildRolePermissions(role, overrides: Record<string, boolean> = {}) {
  const normalizedRole = normalizeRole(role);
  const permissions: Record<string, boolean> = {};

  if (normalizedRole === USER_ROLES.ADMIN) {
    for (const key of ALL_PERMISSION_KEYS) {
      permissions[key] = true;
    }
    return permissions;
  }

  for (const key of ALL_PERMISSION_KEYS) {
    let value = false;
    if (normalizedRole === USER_ROLES.MANAGER) {
      value = MANAGER_DEFAULT_PERMISSIONS.has(key);
    } else {
      value = key === PERMISSIONS.BIDS_PLACE;
    }

    if (Object.prototype.hasOwnProperty.call(overrides, key)) {
      value = overrides[key] === true;
    }

    permissions[key] = value;
  }

  return permissions;
}

function isKnownPermission(permissionKey) {
  return ALL_PERMISSION_KEYS.includes(String(permissionKey || ""));
}

function permissionLabel(permissionKey) {
  const labels: Record<string, string> = {
    [PERMISSIONS.ADMIN_PANEL_ACCESS]: "Admin panel erişimi",
    [PERMISSIONS.BIDS_PLACE]: "Teklif verebilir",
    [PERMISSIONS.USERS_VIEW]: "Kullanıcıları görüntüleyebilir",
    [PERMISSIONS.USERS_BLOCK]: "Kullanıcıyı pasife alabilir",
    [PERMISSIONS.USERS_PERMISSIONS]: "Rol/yetki düzenleyebilir",
    [PERMISSIONS.USERS_SESSIONS_REVOKE]: "Oturum sonlandırabilir",
    [PERMISSIONS.AUCTIONS_CREATE]: "İhale oluşturabilir",
    [PERMISSIONS.AUCTIONS_EDIT]: "İhale düzenleyebilir",
    [PERMISSIONS.AUCTIONS_CLOSE]: "İhale kapatabilir",
    [PERMISSIONS.REPORTS_VIEW]: "Raporları görüntüleyebilir",
    [PERMISSIONS.DATA_EXPORT]: "Veri dışa aktarabilir",
    [PERMISSIONS.SETTINGS_MANAGE]: "Sistem ayarı yönetebilir",
  };
  return labels[permissionKey] || permissionKey;
}

function normalizeRole(role) {
  const value = String(role || "").trim().toLowerCase();
  if (value === USER_ROLES.ADMIN) return USER_ROLES.ADMIN;
  if (value === USER_ROLES.MANAGER) return USER_ROLES.MANAGER;
  return USER_ROLES.MEMBER;
}

function isValidRole(role) {
  const normalized = normalizeRole(role);
  return normalized === USER_ROLES.ADMIN || normalized === USER_ROLES.MANAGER || normalized === USER_ROLES.MEMBER;
}

function getBootstrapRoleForEmail(env, email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return USER_ROLES.MEMBER;
  const raw = String(env.ADMIN_EMAILS || "");
  if (!raw.trim()) return USER_ROLES.MEMBER;

  const adminEmails = raw
    .split(/[,\n;]+/)
    .map((x) => normalizeEmail(x))
    .filter(Boolean);

  return adminEmails.includes(normalized) ? USER_ROLES.ADMIN : USER_ROLES.MEMBER;
}

async function writeAdminAuditLog(env, actorUserId, targetUserId, action, details) {
  try {
    await env.DB.prepare(
      "INSERT INTO admin_audit_logs (id, actor_user_id, target_user_id, action, details_json, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)"
    )
      .bind(crypto.randomUUID(), actorUserId, targetUserId || null, action, JSON.stringify(details || {}))
      .run();
  } catch (error) {
    console.error("Admin audit log yazılamadı:", error);
  }
}

function getRuntimeSchemaState(): RuntimeSchemaState {
  const key = "__acikTeklifRuntimeSchemaState";
  const globalScope = globalThis as any;
  if (!globalScope[key]) {
    globalScope[key] = {
      adminReadyAt: 0,
      marketplaceReadyAt: 0,
      legacyRepairReadyAt: 0,
      inflightAdmin: null,
      inflightMarketplace: null,
      inflightLegacyRepair: null,
    } satisfies RuntimeSchemaState;
  }
  return globalScope[key] as RuntimeSchemaState;
}

async function ensureAdminSchemaWarm(env) {
  const state = getRuntimeSchemaState();
  const now = Date.now();
  if (state.adminReadyAt > 0 && now - state.adminReadyAt < SCHEMA_WARM_TTL_MS) return;

  if (!state.inflightAdmin) {
    state.inflightAdmin = (async () => {
      await ensureAdminSchema(env);
      state.adminReadyAt = Date.now();
    })()
      .catch((error) => {
        state.adminReadyAt = 0;
        throw error;
      })
      .finally(() => {
        state.inflightAdmin = null;
      });
  }

  await state.inflightAdmin;
}

async function ensureMarketplaceSchemaWarm(env, options: { runLegacyRepair?: boolean } = {}) {
  const runLegacyRepair = options.runLegacyRepair === true;
  const state = getRuntimeSchemaState();
  const now = Date.now();
  const structureFresh = state.marketplaceReadyAt > 0 && now - state.marketplaceReadyAt < SCHEMA_WARM_TTL_MS;

  if (!structureFresh) {
    if (!state.inflightMarketplace) {
      state.inflightMarketplace = (async () => {
        await ensureMarketplaceSchema(env, { runLegacyRepair: false });
        state.marketplaceReadyAt = Date.now();
      })()
        .catch((error) => {
          state.marketplaceReadyAt = 0;
          throw error;
        })
        .finally(() => {
          state.inflightMarketplace = null;
        });
    }
    await state.inflightMarketplace;
  }

  if (!runLegacyRepair) return;

  const repairFresh = state.legacyRepairReadyAt > 0 && now - state.legacyRepairReadyAt < SCHEMA_WARM_TTL_MS;
  if (repairFresh) return;

  if (!state.inflightLegacyRepair) {
    state.inflightLegacyRepair = (async () => {
      await backfillLegacyCatalogRelations(env);
      state.legacyRepairReadyAt = Date.now();
    })()
      .catch((error) => {
        state.legacyRepairReadyAt = 0;
        throw error;
      })
      .finally(() => {
        state.inflightLegacyRepair = null;
      });
  }

  await state.inflightLegacyRepair;
}

async function ensureAdminSchema(env) {
  const statements = [
    `CREATE TABLE IF NOT EXISTS user_roles (
      user_id TEXT PRIMARY KEY,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    "CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role)",
    `CREATE TABLE IF NOT EXISTS user_permission_overrides (
      user_id TEXT NOT NULL,
      permission_key TEXT NOT NULL,
      is_enabled INTEGER NOT NULL CHECK (is_enabled IN (0, 1)),
      updated_at TEXT NOT NULL,
      updated_by TEXT,
      PRIMARY KEY (user_id, permission_key),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
    )`,
    "CREATE INDEX IF NOT EXISTS idx_permission_overrides_key ON user_permission_overrides(permission_key)",
    `CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id TEXT PRIMARY KEY,
      actor_user_id TEXT NOT NULL,
      target_user_id TEXT,
      action TEXT NOT NULL,
      details_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
    "CREATE INDEX IF NOT EXISTS idx_admin_audit_actor ON admin_audit_logs(actor_user_id)",
    "CREATE INDEX IF NOT EXISTS idx_admin_audit_target ON admin_audit_logs(target_user_id)",
    "CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit_logs(created_at)",
    `CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT,
      FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
    )`,
    `INSERT OR IGNORE INTO user_roles (user_id, role, created_at, updated_at)
     SELECT id, 'member', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
     FROM users`,
  ];

  for (const sql of statements) {
    try {
      await env.DB.prepare(sql).run();
    } catch (error) {
      console.warn("Admin schema statement hatasi:", error);
    }
  }

  const userAlterStatements = [
    "ALTER TABLE users ADD COLUMN tc_identity_no TEXT",
    "ALTER TABLE users ADD COLUMN phone TEXT",
    "ALTER TABLE users ADD COLUMN address TEXT",
    "ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active'",
    "ALTER TABLE users ADD COLUMN account_type TEXT NOT NULL DEFAULT 'bireysel'",
  ];

  for (const sql of userAlterStatements) {
    try {
      await env.DB.prepare(sql).run();
    } catch {
      // duplicate column is expected on subsequent requests
    }
  }
}

async function ensureMarketplaceSchema(env, options: { runLegacyRepair?: boolean } = {}) {
  const runLegacyRepair = options.runLegacyRepair === true;
  const baseStatements = [
    `CREATE TABLE IF NOT EXISTS product_groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(group_id, name),
      FOREIGN KEY (group_id) REFERENCES product_groups(id) ON DELETE RESTRICT
    )`,
    `CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS auction_favorites (
      user_id TEXT NOT NULL,
      auction_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, auction_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS auction_auto_bids (
      auction_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      max_amount REAL NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (auction_id, user_id),
      FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS membership_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'TRY',
      duration_days INTEGER NOT NULL,
      features_json TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
      created_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS user_memberships (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      starts_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (plan_id) REFERENCES membership_plans(id) ON DELETE RESTRICT
    )`,
    `CREATE TABLE IF NOT EXISTS accepted_legal_agreements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      agreement_type TEXT NOT NULL,
      agreement_version TEXT,
      accepted_at TEXT NOT NULL,
      ip_address TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    "CREATE INDEX IF NOT EXISTS idx_categories_group_id ON categories(group_id)",
    "CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id ON user_memberships(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_user_memberships_status ON user_memberships(status)",
    "CREATE INDEX IF NOT EXISTS idx_accepted_legal_agreements_user ON accepted_legal_agreements(user_id)",
  ];

  const alterStatements = [
    "ALTER TABLE product_groups ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE product_groups ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1",
    "ALTER TABLE product_groups ADD COLUMN created_at TEXT",
    "ALTER TABLE product_groups ADD COLUMN updated_at TEXT",
    "ALTER TABLE categories ADD COLUMN group_id TEXT",
    "ALTER TABLE categories ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE categories ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1",
    "ALTER TABLE categories ADD COLUMN created_at TEXT",
    "ALTER TABLE categories ADD COLUMN updated_at TEXT",
    "ALTER TABLE auctions ADD COLUMN product_group_id TEXT",
    "ALTER TABLE auctions ADD COLUMN category_id TEXT",
    "ALTER TABLE auctions ADD COLUMN city TEXT",
    "ALTER TABLE auctions ADD COLUMN district TEXT",
    "ALTER TABLE auctions ADD COLUMN neighborhood TEXT",
    "ALTER TABLE auctions ADD COLUMN image_url TEXT",
    "ALTER TABLE auctions ADD COLUMN gallery_json TEXT",
    "ALTER TABLE auctions ADD COLUMN starts_at TEXT",
    "ALTER TABLE auctions ADD COLUMN description TEXT",
    "ALTER TABLE auctions ADD COLUMN extra_equipment TEXT",
    "ALTER TABLE auctions ADD COLUMN expertise_files_json TEXT",
    "ALTER TABLE auctions ADD COLUMN document_files_json TEXT",
    "ALTER TABLE auctions ADD COLUMN vehicle_brand TEXT",
    "ALTER TABLE auctions ADD COLUMN vehicle_model TEXT",
    "ALTER TABLE auctions ADD COLUMN vehicle_model_detail TEXT",
    "ALTER TABLE auctions ADD COLUMN vehicle_year INTEGER",
    "ALTER TABLE auctions ADD COLUMN vehicle_km INTEGER",
    "ALTER TABLE auctions ADD COLUMN vehicle_fuel_type TEXT",
    "ALTER TABLE auctions ADD COLUMN vehicle_transmission TEXT",
    "ALTER TABLE auctions ADD COLUMN vehicle_body_type TEXT",
    "ALTER TABLE auctions ADD COLUMN vehicle_color TEXT",
    "ALTER TABLE auctions ADD COLUMN vehicle_chassis_no TEXT",
    "ALTER TABLE auctions ADD COLUMN vehicle_engine_volume TEXT",
    "ALTER TABLE auctions ADD COLUMN vehicle_engine_power TEXT",
    "ALTER TABLE auctions ADD COLUMN vehicle_drive_type TEXT",
    "ALTER TABLE auctions ADD COLUMN vehicle_condition_map_json TEXT",
    "ALTER TABLE auctions ADD COLUMN vehicle_expertise_meta_json TEXT",
    "ALTER TABLE bids ADD COLUMN bid_source TEXT NOT NULL DEFAULT 'MANUAL'",
    "ALTER TABLE bids ADD COLUMN is_retracted INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE bids ADD COLUMN retracted_at TEXT",
    "ALTER TABLE bids ADD COLUMN retracted_reason TEXT",
    "ALTER TABLE membership_plans ADD COLUMN updated_at TEXT",
    "ALTER TABLE auctions ADD COLUMN machine_brand TEXT",
    "ALTER TABLE auctions ADD COLUMN machine_model TEXT",
    "ALTER TABLE auctions ADD COLUMN machine_year INTEGER",
    "ALTER TABLE auctions ADD COLUMN machine_hours INTEGER",
    "ALTER TABLE auctions ADD COLUMN machine_type TEXT",
    "ALTER TABLE auctions ADD COLUMN machine_weight REAL",
    "ALTER TABLE auctions ADD COLUMN machine_power TEXT",
    "ALTER TABLE auctions ADD COLUMN machine_attrs_json TEXT",
  ];

  for (const sql of baseStatements) {
    try {
      await env.DB.prepare(sql).run();
    } catch (error) {
      console.warn("Marketplace schema statement hatasi:", error);
    }
  }

  for (const sql of alterStatements) {
    try {
      await env.DB.prepare(sql).run();
    } catch {
      // duplicate column is expected on subsequent requests
    }
  }

  if (runLegacyRepair) {
    await backfillLegacyCatalogRelations(env);
  }

  const indexStatements = [
    "CREATE INDEX IF NOT EXISTS idx_product_groups_name ON product_groups(name)",
    "CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name)",
    "CREATE INDEX IF NOT EXISTS idx_auctions_product_group_id ON auctions(product_group_id)",
    "CREATE INDEX IF NOT EXISTS idx_auctions_category_id ON auctions(category_id)",
    "CREATE INDEX IF NOT EXISTS idx_auction_favorites_user_id ON auction_favorites(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_auction_favorites_auction_id ON auction_favorites(auction_id)",
    "CREATE INDEX IF NOT EXISTS idx_auction_favorites_created_at ON auction_favorites(created_at)",
    "CREATE INDEX IF NOT EXISTS idx_auction_auto_bids_user_id ON auction_auto_bids(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_auction_auto_bids_active ON auction_auto_bids(auction_id, is_active)",
    "CREATE INDEX IF NOT EXISTS idx_bids_retracted ON bids(auction_id, is_retracted)",
  ];

  for (const sql of indexStatements) {
    try {
      await env.DB.prepare(sql).run();
    } catch (error) {
      console.warn("Marketplace index statement hatasi:", error);
    }
  }

  await seedDefaultMembershipPlan(env);
}

async function seedDefaultMembershipPlan(env) {
  const existing = await env.DB.prepare("SELECT id FROM membership_plans LIMIT 1").first();
  if (existing) return;
  const now = new Date().toISOString();
  const plans = [
    {
      id: crypto.randomUUID(),
      name: "Premium Aylık",
      description: "Tüm ihale detaylarına sınırsız erişim, öncelikli bildirimler.",
      price: 99.90,
      currency: "TRY",
      duration_days: 30,
      sort_order: 1,
    },
    {
      id: crypto.randomUUID(),
      name: "Premium Yıllık",
      description: "Tüm ihale detaylarına sınırsız erişim, öncelikli bildirimler, 2 ay hediye.",
      price: 999.00,
      currency: "TRY",
      duration_days: 365,
      sort_order: 2,
    },
  ];
  for (const plan of plans) {
    await env.DB.prepare(
      `INSERT INTO membership_plans (id, name, description, price, currency, duration_days, sort_order, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`
    ).bind(plan.id, plan.name, plan.description, plan.price, plan.currency, plan.duration_days, plan.sort_order, now).run();
  }
}

async function getCatalogSnapshot(env) {
  const [groupsResult, categoriesResult] = await Promise.all([
    env.DB.prepare(
      `SELECT id, name, sort_order, is_active, created_at
       FROM product_groups
       ORDER BY sort_order ASC, name ASC`
    ).all(),
    env.DB.prepare(
      `SELECT id, group_id, name, sort_order, is_active, created_at
       FROM categories
       ORDER BY sort_order ASC, name ASC`
    ).all(),
  ]);

  return {
    groups: groupsResult.results || [],
    categories: categoriesResult.results || [],
  };
}

async function getAdminAuctionsList(env) {
  const data = await env.DB.prepare(
    `SELECT
      a.id, a.lot_no, a.title, a.start_price, a.current_bid, a.min_increment, a.bid_count, COALESCE(a.starts_at, a.created_at) AS starts_at, a.ends_at, a.status,
      a.created_at, a.updated_at, a.product_group_id, a.category_id, a.city, a.district, a.neighborhood, a.image_url,
      a.gallery_json, a.extra_equipment, a.expertise_files_json, a.document_files_json,
      a.description, a.vehicle_brand, a.vehicle_model, a.vehicle_model_detail, a.vehicle_year, a.vehicle_km,
      a.vehicle_fuel_type, a.vehicle_transmission, a.vehicle_body_type, a.vehicle_color, a.vehicle_chassis_no, a.vehicle_engine_volume,
      a.vehicle_engine_power, a.vehicle_drive_type, a.vehicle_condition_map_json, a.vehicle_expertise_meta_json,
      a.machine_brand, a.machine_model, a.machine_year, a.machine_hours, a.machine_type, a.machine_weight, a.machine_power, a.machine_attrs_json,
      pg.name AS product_group, c.name AS category
     FROM auctions a
     LEFT JOIN product_groups pg ON pg.id = a.product_group_id
     LEFT JOIN categories c ON c.id = a.category_id
     ORDER BY a.created_at DESC`
  ).all();
  return data.results || [];
}

async function getAdminAuctionBidHistory(env, auctionId: string) {
  const auction = await env.DB.prepare(
    `SELECT
      a.id, a.lot_no, a.title, a.start_price, a.current_bid, a.current_bid_user_id, a.bid_count, a.ends_at, a.status,
      u.name AS current_bid_user_name, u.email AS current_bid_user_email
     FROM auctions a
     LEFT JOIN users u ON u.id = a.current_bid_user_id
     WHERE a.id = ?
     LIMIT 1`
  )
    .bind(auctionId)
    .first();
  if (!auction?.id) return null;

  const bidRowsResult = await env.DB.prepare(
    `SELECT
      b.id, b.auction_id, b.user_id, b.amount, b.created_at,
      u.name AS bidder_name, u.email AS bidder_email,
      ab.max_amount AS auto_bid_max_amount,
      ab.is_active AS auto_bid_is_active
     FROM bids b
     LEFT JOIN users u ON u.id = b.user_id
     LEFT JOIN auction_auto_bids ab ON ab.auction_id = b.auction_id AND ab.user_id = b.user_id
     WHERE b.auction_id = ?
     ORDER BY b.amount DESC, b.created_at ASC`
  )
    .bind(auctionId)
    .all();
  const bidRows = bidRowsResult.results || [];

  const bids = bidRows.map((row: any) => ({
    id: String(row.id || ""),
    userId: String(row.user_id || ""),
    bidderName: String(row.bidder_name || "").trim() || "Isimsiz",
    bidderEmail: String(row.bidder_email || "").trim() || "-",
    amount: Number(row.amount || 0),
    createdAt: row.created_at || null,
    autoBidMax:
      row.auto_bid_max_amount === null || row.auto_bid_max_amount === undefined
        ? null
        : Number(row.auto_bid_max_amount),
    autoBidActive: Number(row.auto_bid_is_active || 0) === 1,
  }));

  const participantsMap = new Map<
    string,
    {
      userId: string;
      bidderName: string;
      bidderEmail: string;
      bidCount: number;
      maxBid: number;
      lastBidAt: string | null;
      autoBidMax: number | null;
      autoBidActive: boolean;
    }
  >();
  for (const row of bids) {
    const key = String(row.userId || "");
    const prev = participantsMap.get(key);
    if (!prev) {
      participantsMap.set(key, {
        userId: key,
        bidderName: row.bidderName,
        bidderEmail: row.bidderEmail,
        bidCount: 1,
        maxBid: Number(row.amount || 0),
        lastBidAt: row.createdAt || null,
        autoBidMax: row.autoBidMax === null || row.autoBidMax === undefined ? null : Number(row.autoBidMax),
        autoBidActive: row.autoBidActive === true,
      });
      continue;
    }
    prev.bidCount += 1;
    if (Number(row.amount || 0) > prev.maxBid) prev.maxBid = Number(row.amount || 0);
    if (prev.autoBidMax === null && row.autoBidMax !== null && row.autoBidMax !== undefined) {
      prev.autoBidMax = Number(row.autoBidMax);
    }
    if (row.autoBidActive === true) {
      prev.autoBidActive = true;
    }
    const prevMs = Date.parse(String(prev.lastBidAt || ""));
    const nextMs = Date.parse(String(row.createdAt || ""));
    if (Number.isFinite(nextMs) && (!Number.isFinite(prevMs) || nextMs > prevMs)) {
      prev.lastBidAt = row.createdAt || null;
    }
  }
  const participants = Array.from(participantsMap.values()).sort((a, b) => {
    if (b.maxBid !== a.maxBid) return b.maxBid - a.maxBid;
    if (b.bidCount !== a.bidCount) return b.bidCount - a.bidCount;
    const aMs = Date.parse(String(a.lastBidAt || ""));
    const bMs = Date.parse(String(b.lastBidAt || ""));
    if (Number.isFinite(aMs) && Number.isFinite(bMs)) return bMs - aMs;
    return 0;
  });

  const winnerRow = bids[0] || null;
  const winner = winnerRow
    ? {
        userId: winnerRow.userId,
        bidderName: winnerRow.bidderName,
        bidderEmail: winnerRow.bidderEmail,
        amount: Number(winnerRow.amount || 0),
        createdAt: winnerRow.createdAt || null,
      }
    : null;

  const endsAtMs = Date.parse(String(auction.ends_at || ""));
  const isEnded =
    String(auction.status || "").toUpperCase() === "ENDED" || (Number.isFinite(endsAtMs) && endsAtMs <= Date.now());

  return {
    auction: {
      id: String(auction.id || ""),
      lotNo: String(auction.lot_no || ""),
      title: String(auction.title || ""),
      startPrice: Number(auction.start_price || 0),
      currentBid: auction.current_bid === null || auction.current_bid === undefined ? null : Number(auction.current_bid),
      currentBidUserId: auction.current_bid_user_id ? String(auction.current_bid_user_id) : "",
      currentBidUserName: String(auction.current_bid_user_name || "").trim() || null,
      currentBidUserEmail: String(auction.current_bid_user_email || "").trim() || null,
      bidCount: Number(auction.bid_count || 0),
      endsAt: auction.ends_at || null,
      status: String(auction.status || ""),
      isEnded,
    },
    winner,
    participants,
    bids,
    totalBidCount: bids.length,
  };
}

async function getPublicAuctionsList(env) {
  const data = await env.DB.prepare(
    `SELECT
      a.id, a.lot_no, a.title, a.start_price, a.current_bid, a.min_increment, a.bid_count,
      COALESCE(a.starts_at, a.created_at) AS starts_at, a.ends_at, a.status, a.created_at,
      a.product_group_id, a.category_id, a.city, a.district, a.neighborhood, a.image_url, a.gallery_json,
      a.vehicle_brand, a.vehicle_model, a.vehicle_model_detail, a.vehicle_year, a.vehicle_km,
      a.machine_brand, a.machine_model, a.machine_year, a.machine_hours, a.machine_type, a.machine_weight, a.machine_power, a.machine_attrs_json,
      pg.name AS product_group, c.name AS category
     FROM auctions a
     LEFT JOIN product_groups pg ON pg.id = a.product_group_id
     LEFT JOIN categories c ON c.id = a.category_id
     WHERE UPPER(COALESCE(a.status, 'ACTIVE')) != 'PASSIVE'
     ORDER BY a.created_at DESC`
  ).all();
  return data.results || [];
}

async function getPublicAuctionDetailByLotNo(env, lotNo: string) {
  const row = await env.DB.prepare(
    `SELECT
      a.id, a.lot_no, a.title, a.start_price, a.current_bid, a.min_increment, a.bid_count,
      COALESCE(a.starts_at, a.created_at) AS starts_at, a.ends_at, a.status, a.created_at, a.updated_at,
      a.product_group_id, a.category_id, a.city, a.district, a.neighborhood, a.image_url, a.gallery_json,
      a.description, a.extra_equipment, a.expertise_files_json, a.document_files_json,
      a.vehicle_brand, a.vehicle_model, a.vehicle_model_detail, a.vehicle_year, a.vehicle_km,
      a.vehicle_fuel_type, a.vehicle_transmission, a.vehicle_body_type, a.vehicle_color, a.vehicle_chassis_no, a.vehicle_engine_volume,
      a.vehicle_engine_power, a.vehicle_drive_type, a.vehicle_condition_map_json, a.vehicle_expertise_meta_json,
      a.machine_brand, a.machine_model, a.machine_year, a.machine_hours, a.machine_type, a.machine_weight, a.machine_power, a.machine_attrs_json,
      pg.name AS product_group, c.name AS category
     FROM auctions a
     LEFT JOIN product_groups pg ON pg.id = a.product_group_id
     LEFT JOIN categories c ON c.id = a.category_id
     WHERE a.lot_no = ?
       AND UPPER(COALESCE(a.status, 'ACTIVE')) != 'PASSIVE'
     LIMIT 1`
  )
    .bind(String(lotNo || "").trim().toUpperCase())
    .first();

  if (!row) return null;

  const gallery = normalizeGalleryList(row.gallery_json, row.image_url);
  const expertiseFiles = normalizeAttachmentList(row.expertise_files_json);
  const documentFiles = normalizeAttachmentList(row.document_files_json);

  return {
    ...row,
    image_url: gallery[0] || String(row.image_url || "").trim(),
    gallery,
    expertise_files: expertiseFiles,
    document_files: documentFiles,
  };
}

async function getUserActiveMembership(env, userId: string) {
  const row = await env.DB.prepare(
    `SELECT m.id, m.starts_at, m.expires_at, p.name AS plan_name, p.duration_days
     FROM user_memberships m
     JOIN membership_plans p ON p.id = m.plan_id
     WHERE m.user_id = ? AND m.status = 'active' AND m.expires_at > datetime('now')
     ORDER BY m.expires_at DESC LIMIT 1`
  )
    .bind(userId)
    .first();
  return row || null;
}

async function getUserActiveMembershipSafe(env, userId: string) {
  try {
    return await getUserActiveMembership(env, userId);
  } catch (error) {
    console.warn("Aktif uyelik sorgusu hatasi:", error);
    return null;
  }
}

async function getUserFavoriteLotNoSet(env, userId: string) {
  const result = await env.DB.prepare(
    `SELECT UPPER(TRIM(a.lot_no)) AS lot_no
     FROM auction_favorites f
     JOIN auctions a ON a.id = f.auction_id
     WHERE f.user_id = ?`
  )
    .bind(userId)
    .all();

  const out = new Set<string>();
  for (const row of result.results || []) {
    const lotNo = String((row as any)?.lot_no || "").trim().toUpperCase();
    if (!lotNo) continue;
    out.add(lotNo);
  }
  return out;
}

async function getUserAutoBidMap(env, userId: string) {
  const result = await env.DB.prepare(
    `SELECT
      UPPER(TRIM(a.lot_no)) AS lot_no,
      ab.max_amount,
      ab.is_active
     FROM auction_auto_bids ab
     JOIN auctions a ON a.id = ab.auction_id
     WHERE ab.user_id = ?`
  )
    .bind(userId)
    .all();

  const out = new Map<string, { maxAmount: number; isActive: boolean }>();
  for (const row of result.results || []) {
    const lotNo = String((row as any)?.lot_no || "").trim().toUpperCase();
    if (!lotNo) continue;
    out.set(lotNo, {
      maxAmount: Number((row as any)?.max_amount || 0),
      isActive: Number((row as any)?.is_active || 0) === 1,
    });
  }
  return out;
}

async function getUserFavoritesList(env, userId: string) {
  const result = await env.DB.prepare(
    `SELECT
      f.created_at AS favorited_at,
      a.id, a.lot_no, a.title, a.start_price, a.current_bid, a.min_increment, a.bid_count,
      COALESCE(a.starts_at, a.created_at) AS starts_at, a.ends_at, a.status, a.created_at,
      a.city, a.image_url, a.gallery_json,
      pg.name AS product_group, c.name AS category
     FROM auction_favorites f
     JOIN auctions a ON a.id = f.auction_id
     LEFT JOIN product_groups pg ON pg.id = a.product_group_id
     LEFT JOIN categories c ON c.id = a.category_id
     WHERE f.user_id = ?
       AND UPPER(COALESCE(a.status, 'ACTIVE')) != 'PASSIVE'
     ORDER BY f.created_at DESC`
  )
    .bind(userId)
    .all();

  const nowMs = Date.now();
  return (result.results || []).map((row: any) => {
    const gallery = normalizeGalleryList(row.gallery_json, row.image_url);
    const endsAtMs = Date.parse(String(row.ends_at || ""));
    const status = String(row.status || "").toUpperCase();
    const isEnded = status === "ENDED" || (Number.isFinite(endsAtMs) && endsAtMs <= nowMs);

    return {
      auctionId: String(row.id || ""),
      lotNo: String(row.lot_no || ""),
      title: String(row.title || ""),
      productGroup: String(row.product_group || ""),
      category: String(row.category || ""),
      city: String(row.city || ""),
      startPrice: Number(row.start_price || 0),
      currentBid: row.current_bid === null || row.current_bid === undefined ? null : Number(row.current_bid),
      minIncrement: Number(row.min_increment || 0),
      bidCount: Number(row.bid_count || 0),
      startsAt: row.starts_at || null,
      endsAt: row.ends_at || null,
      createdAt: row.created_at || null,
      status,
      isEnded,
      imageUrl: String(gallery[0] || row.image_url || "").trim(),
      gallery,
      favoritedAt: row.favorited_at || null,
    };
  });
}

async function getUserBidSummaryList(env, userId: string) {
  const result = await env.DB.prepare(
    `SELECT
      a.id, a.lot_no, a.title, a.start_price, a.current_bid, a.current_bid_user_id, a.min_increment, a.bid_count,
      COALESCE(a.starts_at, a.created_at) AS starts_at, a.ends_at, a.status, a.created_at,
      a.city, a.image_url, a.gallery_json,
      pg.name AS product_group, c.name AS category,
      ab.max_amount AS auto_max_amount,
      ab.is_active AS auto_is_active,
      COUNT(b.id) AS my_bid_count,
      MAX(b.amount) AS my_max_bid,
      MAX(b.created_at) AS my_last_bid_at
     FROM bids b
     JOIN auctions a ON a.id = b.auction_id
     LEFT JOIN product_groups pg ON pg.id = a.product_group_id
     LEFT JOIN categories c ON c.id = a.category_id
     LEFT JOIN auction_auto_bids ab ON ab.auction_id = a.id AND ab.user_id = ?
     WHERE b.user_id = ?
       AND COALESCE(b.is_retracted, 0) = 0
       AND UPPER(COALESCE(a.status, 'ACTIVE')) != 'PASSIVE'
     GROUP BY a.id
     ORDER BY my_last_bid_at DESC`
  )
    .bind(userId, userId)
    .all();

  const nowMs = Date.now();
  return (result.results || []).map((row: any) => {
    const gallery = normalizeGalleryList(row.gallery_json, row.image_url);
    const endsAtMs = Date.parse(String(row.ends_at || ""));
    const status = String(row.status || "").toUpperCase();
    const isEnded = status === "ENDED" || (Number.isFinite(endsAtMs) && endsAtMs <= nowMs);
    const currentBidUserId = String(row.current_bid_user_id || "").trim();
    const currentBid = row.current_bid === null || row.current_bid === undefined ? null : Number(row.current_bid);
    const myMaxBid = row.my_max_bid === null || row.my_max_bid === undefined ? null : Number(row.my_max_bid);
    const isWinner = isEnded && currentBid !== null && currentBidUserId === userId;
    const isLeading = !isEnded && currentBid !== null && currentBidUserId === userId;

    return {
      auctionId: String(row.id || ""),
      lotNo: String(row.lot_no || ""),
      title: String(row.title || ""),
      productGroup: String(row.product_group || ""),
      category: String(row.category || ""),
      city: String(row.city || ""),
      startPrice: Number(row.start_price || 0),
      currentBid,
      minIncrement: Number(row.min_increment || 0),
      bidCount: Number(row.bid_count || 0),
      startsAt: row.starts_at || null,
      endsAt: row.ends_at || null,
      createdAt: row.created_at || null,
      status,
      isEnded,
      currentBidUserId,
      imageUrl: String(gallery[0] || row.image_url || "").trim(),
      gallery,
      myBidCount: Number(row.my_bid_count || 0),
      myMaxBid,
      myLastBidAt: row.my_last_bid_at || null,
      isWinner,
      isLeading,
      autoBidMax:
        row.auto_max_amount === null || row.auto_max_amount === undefined ? null : Number(row.auto_max_amount),
      autoBidEnabled: Number(row.auto_is_active || 0) === 1,
      canRetract: Number(row.my_bid_count || 0) > 0 && !isEnded,
    };
  });
}

async function recomputeAuctionBidSnapshot(env, auctionId: string) {
  const [topBid, countRow] = await Promise.all([
    env.DB.prepare(
      `SELECT user_id, amount
       FROM bids
       WHERE auction_id = ?
         AND COALESCE(is_retracted, 0) = 0
       ORDER BY amount DESC, created_at ASC, rowid ASC
       LIMIT 1`
    )
      .bind(auctionId)
      .first(),
    env.DB.prepare(
      `SELECT COUNT(1) AS total
       FROM bids
       WHERE auction_id = ?
         AND COALESCE(is_retracted, 0) = 0`
    )
      .bind(auctionId)
      .first(),
  ]);

  const bidCount = Number(countRow?.total || 0);
  if (!topBid) {
    await env.DB.prepare(
      `UPDATE auctions
       SET current_bid = NULL,
           current_bid_user_id = NULL,
           bid_count = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
      .bind(bidCount, auctionId)
      .run();
    return;
  }

  await env.DB.prepare(
    `UPDATE auctions
     SET current_bid = ?,
         current_bid_user_id = ?,
         bid_count = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  )
    .bind(Number(topBid.amount || 0), String(topBid.user_id || ""), bidCount, auctionId)
    .run();
}

async function runAutoBidEngine(env, auctionId: string, maxSteps = 200) {
  let steps = 0;

  while (steps < maxSteps) {
    const auction = await env.DB.prepare(
      `SELECT id, status, ends_at, start_price, current_bid, current_bid_user_id, min_increment
       FROM auctions
       WHERE id = ?
       LIMIT 1`
    )
      .bind(auctionId)
      .first();

    if (!auction?.id) break;
    if (String(auction.status || "").toUpperCase() !== "ACTIVE") break;
    const endsAtMs = Date.parse(String(auction.ends_at || ""));
    if (Number.isFinite(endsAtMs) && endsAtMs <= Date.now()) break;

    const minIncrement = Number(auction.min_increment || 0);
    if (!Number.isFinite(minIncrement) || minIncrement <= 0) break;
    const floor = auction.current_bid === null || auction.current_bid === undefined ? Number(auction.start_price || 0) : Number(auction.current_bid || 0);
    const nextRequired = floor + minIncrement;

    const autoResult = await env.DB.prepare(
      `SELECT user_id, max_amount, created_at, updated_at
       FROM auction_auto_bids
       WHERE auction_id = ?
         AND is_active = 1
         AND max_amount >= ?
       ORDER BY max_amount DESC, updated_at ASC, created_at ASC`
    )
      .bind(auctionId, nextRequired)
      .all();
    const autoRows = autoResult.results || [];
    const currentLeaderId = String(auction.current_bid_user_id || "");
    const candidate = autoRows.find((row: any) => String(row?.user_id || "") !== currentLeaderId);
    if (!candidate) break;

    const candidateUserId = String((candidate as any)?.user_id || "");
    const candidateMax = Number((candidate as any)?.max_amount || 0);
    if (!candidateUserId || !Number.isFinite(candidateMax) || candidateMax < nextRequired) break;

    const autoAmount = Math.min(candidateMax, nextRequired);
    const updateResult = await env.DB.prepare(
      `UPDATE auctions
       SET current_bid = ?, current_bid_user_id = ?, bid_count = bid_count + 1, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?
         AND status = 'ACTIVE'
         AND ends_at > CURRENT_TIMESTAMP
         AND (current_bid IS NULL OR current_bid < ?)`
    )
      .bind(autoAmount, candidateUserId, auctionId, autoAmount)
      .run();
    if (Number(updateResult.meta?.changes || 0) < 1) {
      continue;
    }

    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO bids (
           id, auction_id, user_id, amount, created_at, bid_source, is_retracted, retracted_at, retracted_reason
         ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 'AUTO', 0, NULL, NULL)`
      ).bind(crypto.randomUUID(), auctionId, candidateUserId, autoAmount),
      env.DB.prepare(
        `UPDATE auction_auto_bids
         SET updated_at = CURRENT_TIMESTAMP
         WHERE auction_id = ? AND user_id = ?`
      ).bind(auctionId, candidateUserId),
    ]);

    steps += 1;
  }

  return { steps };
}

async function getAdminUsersList(env) {
  const usersResult = await env.DB.prepare(
    `SELECT
      u.id, u.email, u.name, u.email_verified_at, u.disabled_at, u.status, u.account_type, u.created_at,
      COALESCE(r.role, ?) AS role
     FROM users u
     LEFT JOIN user_roles r ON r.user_id = u.id
     ORDER BY u.created_at DESC`
  )
    .bind(USER_ROLES.MEMBER)
    .all();

  const overrideRows = await env.DB.prepare("SELECT user_id, permission_key, is_enabled FROM user_permission_overrides").all();
  const overridesByUser = new Map<string, Record<string, boolean>>();
  for (const row of overrideRows.results || []) {
    const userId = String(row.user_id || "");
    const permissionKey = String(row.permission_key || "");
    if (!userId || !permissionKey) continue;
    if (!isKnownPermission(permissionKey)) continue;
    const forUser = overridesByUser.get(userId) || {};
    forUser[permissionKey] = Number(row.is_enabled || 0) === 1;
    overridesByUser.set(userId, forUser);
  }

  return (usersResult.results || []).map((row) => {
    const role = normalizeRole(row.role);
    const permissions = buildRolePermissions(role, overridesByUser.get(String(row.id || "")) || {});
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      accountType: row.account_type || "bireysel",
      role,
      status: row.status || "active",
      emailVerified: !!row.email_verified_at,
      isDisabled: !!row.disabled_at,
      createdAt: row.created_at,
      permissions,
    };
  });
}

async function getCatalogSnapshotSafe(env) {
  try {
    return await getCatalogSnapshot(env);
  } catch (error) {
    console.warn("Katalog snapshot sorgusu hata verdi, schema onarimi deneniyor:", error);
    await ensureMarketplaceSchemaWarm(env);
    return await getCatalogSnapshot(env);
  }
}

async function getAdminAuctionsListSafe(env) {
  try {
    return await getAdminAuctionsList(env);
  } catch (error) {
    console.warn("Ihale listesi sorgusu hata verdi, schema onarimi deneniyor:", error);
    await ensureMarketplaceSchemaWarm(env);
    return await getAdminAuctionsList(env);
  }
}

async function getPublicAuctionsListSafe(env) {
  try {
    return await getPublicAuctionsList(env);
  } catch (error) {
    console.warn("Genel ihale listesi sorgusu hata verdi, schema onarimi deneniyor:", error);
    await ensureMarketplaceSchemaWarm(env);
    return await getPublicAuctionsList(env);
  }
}

async function getUserFavoriteLotNoSetSafe(env, userId: string) {
  try {
    return await getUserFavoriteLotNoSet(env, userId);
  } catch (error) {
    console.warn("Kullanici favori lot no sorgusu hata verdi, schema onarimi deneniyor:", error);
    await ensureMarketplaceSchemaWarm(env);
    return await getUserFavoriteLotNoSet(env, userId);
  }
}

async function getUserAutoBidMapSafe(env, userId: string) {
  try {
    return await getUserAutoBidMap(env, userId);
  } catch (error) {
    console.warn("Kullanici otomatik teklif haritasi sorgusu hata verdi, schema onarimi deneniyor:", error);
    await ensureMarketplaceSchemaWarm(env);
    return await getUserAutoBidMap(env, userId);
  }
}

async function getUserFavoritesListSafe(env, userId: string) {
  try {
    return await getUserFavoritesList(env, userId);
  } catch (error) {
    console.warn("Kullanici favorileri sorgusu hata verdi, schema onarimi deneniyor:", error);
    await ensureMarketplaceSchemaWarm(env);
    return await getUserFavoritesList(env, userId);
  }
}

async function getUserBidSummaryListSafe(env, userId: string) {
  try {
    return await getUserBidSummaryList(env, userId);
  } catch (error) {
    console.warn("Kullanici teklif ozeti sorgusu hata verdi, schema onarimi deneniyor:", error);
    await ensureMarketplaceSchemaWarm(env);
    return await getUserBidSummaryList(env, userId);
  }
}

async function getPublicAuctionDetailByLotNoSafe(env, lotNo: string) {
  try {
    return await getPublicAuctionDetailByLotNo(env, lotNo);
  } catch (error) {
    console.warn("Genel ihale detay sorgusu hata verdi, schema onarimi deneniyor:", error);
    await ensureMarketplaceSchemaWarm(env);
    return await getPublicAuctionDetailByLotNo(env, lotNo);
  }
}

async function getPublicFilterOptionsSafe(env) {
  try {
    return await getPublicFilterOptions(env);
  } catch (error) {
    console.warn("Genel filtre secenekleri sorgusu hata verdi, schema onarimi deneniyor:", error);
    await ensureMarketplaceSchemaWarm(env);
    await ensureAdminSchemaWarm(env);
    return await getPublicFilterOptions(env);
  }
}

async function getPublicFilterOptions(env, auctions?) {
  if (!auctions) auctions = await getPublicAuctionsListSafe(env);
  const [catalog, order] = await Promise.all([
    getCatalogSnapshotSafe(env),
    getAppSettingJsonSafe(env, FILTER_ORDER_SETTING_KEY, emptyFilterOrderOption()),
  ]);

  const productGroups = uniqueTextList(catalog.groups.map((row: any) => row.name));
  const categories = uniqueTextList(catalog.categories.map((row: any) => row.name));
  const categoriesByGroup: Record<string, string[]> = {};
  for (const group of catalog.groups) {
    const groupName = String(group.name || "");
    if (!groupName) continue;
    const groupCategories = catalog.categories
      .filter((cat: any) => String(cat.group_id || "") === String(group.id || ""))
      .map((cat: any) => String(cat.name || ""))
      .filter(Boolean);
    if (groupCategories.length > 0) {
      categoriesByGroup[groupName] = groupCategories;
    }
  }
  const normalizedOrder = normalizeFilterOptionOrder(order || {});

  const cityValues = uniqueTextList([
    ...DEFAULT_TURKEY_CITIES,
    ...Object.keys(TURKEY_DISTRICTS_BY_CITY),
    ...auctions.map((row: any) => row.city),
  ]);
  const sortedCities = sortTextListByOrder(cityValues, normalizedOrder.cities);
  const districtsByCity = buildDistrictOptionsByCity(sortedCities, auctions, normalizedOrder.districts);
  const districtValues = uniqueTextList(sortedCities.flatMap((city) => districtsByCity[city] || []));
  const neighborhoodValues = uniqueTextList(auctions.map((row: any) => row.neighborhood));

  return {
    order: normalizedOrder,
    options: {
      // Urun grubu ve kategori sirasi katalogdaki sort_order alanindan gelir.
      productGroups,
      categories,
      categoriesByGroup,
      cities: sortedCities,
      districts: sortTextListByOrder(districtValues, normalizedOrder.districts),
      neighborhoods: sortTextListByOrder(neighborhoodValues, normalizedOrder.neighborhoods),
      districtsByCity,
    },
  };
}

function emptyVehicleConditionLayout() {
  const out: Record<string, { x: number; y: number }> = {};
  for (const partKey of VEHICLE_CONDITION_PART_KEYS) {
    out[partKey] = { x: 0, y: 0 };
  }
  return out;
}

function normalizeVehicleConditionLayoutOffset(rawInput: any) {
  const value = Number(rawInput);
  if (!Number.isFinite(value)) return 0;
  const rounded = Math.round(value);
  if (rounded > VEHICLE_CONDITION_LAYOUT_MAX_OFFSET) return VEHICLE_CONDITION_LAYOUT_MAX_OFFSET;
  if (rounded < -VEHICLE_CONDITION_LAYOUT_MAX_OFFSET) return -VEHICLE_CONDITION_LAYOUT_MAX_OFFSET;
  return rounded;
}

function normalizeVehicleConditionLayoutInput(rawInput: any) {
  const source = parseJsonObjectFromUnknown(rawInput);
  const partsSource = parseJsonObjectFromUnknown(source.parts || source.layout || source.offsets || source);
  const out = emptyVehicleConditionLayout();

  for (const partKey of VEHICLE_CONDITION_PART_KEYS) {
    const rawPart = partsSource[partKey];
    let x = 0;
    let y = 0;

    if (Array.isArray(rawPart)) {
      x = normalizeVehicleConditionLayoutOffset(rawPart[0]);
      y = normalizeVehicleConditionLayoutOffset(rawPart[1]);
    } else {
      const partObject = parseJsonObjectFromUnknown(rawPart);
      x = normalizeVehicleConditionLayoutOffset(partObject.x ?? partObject.dx ?? 0);
      y = normalizeVehicleConditionLayoutOffset(partObject.y ?? partObject.dy ?? 0);
    }

    out[partKey] = { x, y };
  }

  return out;
}

function normalizeVehicleConditionScale(rawInput: any) {
  const value = Number(rawInput);
  if (!Number.isFinite(value)) return 1;
  const rounded = Math.round(value * 100) / 100;
  if (rounded < VEHICLE_CONDITION_SCALE_MIN) return VEHICLE_CONDITION_SCALE_MIN;
  if (rounded > VEHICLE_CONDITION_SCALE_MAX) return VEHICLE_CONDITION_SCALE_MAX;
  return rounded;
}

async function getVehicleConditionLayoutSafe(env) {
  const rawValue = await getAppSettingJsonSafe(env, VEHICLE_CONDITION_LAYOUT_SETTING_KEY, emptyVehicleConditionLayout());
  return normalizeVehicleConditionLayoutInput(rawValue);
}

async function getVehicleConditionScaleSafe(env) {
  const rawValue = await getAppSettingJsonSafe(env, VEHICLE_CONDITION_SCALE_SETTING_KEY, 1);
  return normalizeVehicleConditionScale(rawValue);
}

function buildDistrictOptionsByCity(cityValues: string[], auctions: any[], districtOrder: string[]) {
  const cityTokenToName = new Map<string, string>();
  const byCity = new Map<string, string[]>();

  for (const city of cityValues) {
    cityTokenToName.set(normalizeOrderToken(city), city);
  }

  for (const [cityName, districts] of Object.entries(TURKEY_DISTRICTS_BY_CITY)) {
    const cityToken = normalizeOrderToken(cityName);
    const canonicalCity = cityTokenToName.get(cityToken) || cityName;
    if (!cityTokenToName.has(cityToken)) {
      cityTokenToName.set(cityToken, canonicalCity);
    }
    const merged = uniqueTextList([...(byCity.get(canonicalCity) || []), ...(Array.isArray(districts) ? districts : [])]);
    byCity.set(canonicalCity, merged);
  }

  for (const row of auctions) {
    const rawCity = String(row?.city || '').trim();
    const rawDistrict = String(row?.district || '').trim();
    if (!rawCity) continue;

    const cityToken = normalizeOrderToken(rawCity);
    const canonicalCity = cityTokenToName.get(cityToken) || rawCity;
    if (!cityTokenToName.has(cityToken)) {
      cityTokenToName.set(cityToken, canonicalCity);
    }

    const merged = uniqueTextList([...(byCity.get(canonicalCity) || []), rawDistrict]);
    byCity.set(canonicalCity, merged);
  }

  const out: Record<string, string[]> = {};
  for (const city of cityValues) {
    const list = uniqueTextList(byCity.get(city) || []);
    out[city] = sortTextListByOrder(list, districtOrder);
  }
  return out;
}

function emptyFilterOrderOption() {
  return {
    productGroups: [],
    categories: [],
    cities: [],
    districts: [],
    neighborhoods: [],
  };
}

function normalizeFilterOptionOrder(input: any) {
  const base = emptyFilterOrderOption();
  const source = input && typeof input === "object" ? input : {};
  return {
    productGroups: normalizeTextListInput(source.productGroups),
    categories: normalizeTextListInput(source.categories),
    cities: normalizeTextListInput(source.cities),
    districts: normalizeTextListInput(source.districts),
    neighborhoods: normalizeTextListInput(source.neighborhoods),
  };
}

function normalizeTextListInput(value: any): string[] {
  if (Array.isArray(value)) {
    return uniqueTextList(value);
  }
  if (typeof value === "string") {
    return uniqueTextList(String(value || "").split(/\r?\n|,/g));
  }
  return [];
}

function uniqueTextList(values: any[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of values || []) {
    const item = String(raw || "").trim();
    if (!item) continue;
    const key = normalizeOrderToken(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function sortTextListByOrder(values: string[], order: string[]): string[] {
  const rank = new Map<string, number>();
  for (let i = 0; i < order.length; i++) {
    rank.set(normalizeOrderToken(order[i]), i);
  }
  return [...values].sort((a, b) => {
    const ra = rank.has(normalizeOrderToken(a)) ? Number(rank.get(normalizeOrderToken(a))) : Number.MAX_SAFE_INTEGER;
    const rb = rank.has(normalizeOrderToken(b)) ? Number(rank.get(normalizeOrderToken(b))) : Number.MAX_SAFE_INTEGER;
    if (ra !== rb) return ra - rb;
    return String(a).localeCompare(String(b), "tr");
  });
}

function normalizeOrderToken(value: any) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ç", "c")
    .replaceAll("ğ", "g")
    .replaceAll("ö", "o")
    .replaceAll("ş", "s")
    .replaceAll("ü", "u");
}

async function getAppSettingJsonSafe(env, key: string, fallback: any = null) {
  try {
    return await getAppSettingJson(env, key, fallback);
  } catch (error) {
    console.warn("App setting okunamadi:", error);
    return fallback;
  }
}

async function getAppSettingJson(env, key: string, fallback: any = null) {
  const row = await env.DB.prepare("SELECT value_json FROM app_settings WHERE key = ? LIMIT 1").bind(String(key || "")).first();
  const raw = String(row?.value_json || "").trim();
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function setAppSettingJsonSafe(env, key: string, value: any, updatedBy: string = "") {
  try {
    await setAppSettingJson(env, key, value, updatedBy);
  } catch (error) {
    console.warn("App setting yazilamadi:", error);
    throw error;
  }
}

async function setAppSettingJson(env, key: string, value: any, updatedBy: string = "") {
  const payload = JSON.stringify(value ?? null);
  await env.DB.prepare(
    `INSERT INTO app_settings (key, value_json, updated_at, updated_by)
     VALUES (?, ?, CURRENT_TIMESTAMP, ?)
     ON CONFLICT(key) DO UPDATE SET
       value_json = excluded.value_json,
       updated_at = CURRENT_TIMESTAMP,
       updated_by = excluded.updated_by`
  )
    .bind(String(key || ""), payload, String(updatedBy || "") || null)
    .run();
}

async function insertCategoryRecord(
  env,
  params: { id: string; groupId: string; name: string; sortOrder: number; isActive: number }
) {
  const hasSlug = await tableHasColumn(env, "categories", "slug");
  const hasGroupId = await tableHasColumn(env, "categories", "group_id");
  const hasSortOrder = await tableHasColumn(env, "categories", "sort_order");
  const hasIsActive = await tableHasColumn(env, "categories", "is_active");

  const columns = ["id", "name"];
  const values: unknown[] = [params.id, params.name];
  const placeholders = ["?", "?"];

  if (hasGroupId) {
    columns.push("group_id");
    values.push(params.groupId);
    placeholders.push("?");
  }
  if (hasSlug) {
    columns.push("slug");
    values.push(await buildUniqueCategorySlug(env, params.name));
    placeholders.push("?");
  }
  if (hasSortOrder) {
    columns.push("sort_order");
    values.push(params.sortOrder);
    placeholders.push("?");
  }
  if (hasIsActive) {
    columns.push("is_active");
    values.push(params.isActive);
    placeholders.push("?");
  }
  columns.push("created_at", "updated_at");
  placeholders.push("CURRENT_TIMESTAMP", "CURRENT_TIMESTAMP");

  const sql = `INSERT INTO categories (${columns.join(", ")}) VALUES (${placeholders.join(", ")})`;
  await env.DB.prepare(sql).bind(...values).run();
}

async function ensureReplacementCategoryForDelete(env, groupIdRaw: string, deletingCategoryId: string) {
  const fallbackGroupId = String(groupIdRaw || "").trim() || FALLBACK_CATALOG_GROUP_ID;

  const sameGroupReplacement = await env.DB.prepare(
    `SELECT id
     FROM categories
     WHERE group_id = ? AND id <> ?
     ORDER BY sort_order ASC, name ASC
     LIMIT 1`
  )
    .bind(fallbackGroupId, deletingCategoryId)
    .first();
  if (sameGroupReplacement?.id) return String(sameGroupReplacement.id);

  const groupRow = await env.DB.prepare("SELECT name FROM product_groups WHERE id = ?").bind(fallbackGroupId).first();
  const groupName = String(groupRow?.name || "").trim();
  const candidateNames = [
    "Genel",
    groupName ? `Genel ${groupName}` : "",
    groupName ? `${groupName} Genel` : "",
  ]
    .map((x) => x.trim().slice(0, 120))
    .filter(Boolean);

  for (const name of candidateNames) {
    const id = crypto.randomUUID();
    try {
      await insertCategoryRecord(env, {
        id,
        groupId: fallbackGroupId,
        name,
        sortOrder: 999,
        isActive: 1,
      });
      return id;
    } catch {
      // mevcut unique kısıtlarına göre sonraki aday denenir
    }
  }

  const anyReplacement = await env.DB.prepare(
    `SELECT id
     FROM categories
     WHERE id <> ?
     ORDER BY sort_order ASC, name ASC
     LIMIT 1`
  )
    .bind(deletingCategoryId)
    .first();
  if (anyReplacement?.id) return String(anyReplacement.id);

  throw new Error("Kategori silme için yedek kategori oluşturulamadı.");
}

async function tableHasColumn(env, tableName: "categories" | "product_groups" | "auctions", columnName: string) {
  const safeTable = String(tableName || "").trim().toLowerCase();
  const safeColumn = String(columnName || "").trim().toLowerCase();
  const cacheKey = `${safeTable}:${safeColumn}`;
  const state = env as any;
  const cache = (state.__tableColumnCache = state.__tableColumnCache || new Map<string, boolean>());
  if (cache.has(cacheKey)) return cache.get(cacheKey) === true;

  const schemaRows = await env.DB.prepare(`PRAGMA table_info(${safeTable})`).all();
  const hasColumn = (schemaRows.results || []).some((row) => String(row.name || "").toLowerCase() === safeColumn);
  cache.set(cacheKey, hasColumn);
  return hasColumn;
}

async function buildUniqueCategorySlug(env, value: string, excludeCategoryId: string = "") {
  let base = slugifyCatalogToken(value);
  if (!base) base = "kategori";

  for (let i = 0; i < 500; i += 1) {
    const suffix = i === 0 ? "" : `-${i + 1}`;
    const slug = `${base}${suffix}`;
    const row = await env.DB.prepare("SELECT id FROM categories WHERE slug = ? LIMIT 1").bind(slug).first();
    if (!row?.id) return slug;
    if (excludeCategoryId && String(row.id) === String(excludeCategoryId)) return slug;
  }

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

async function seedDefaultCatalogGroups(env) {
  const countRow = await env.DB.prepare("SELECT COUNT(1) AS total FROM product_groups").first();
  const totalGroups = Number(countRow?.total || 0);

  if (totalGroups < 1) {
    for (const group of DEFAULT_CATALOG_GROUPS) {
      try {
        await env.DB.prepare(
          `INSERT OR IGNORE INTO product_groups (id, name, sort_order, is_active, created_at, updated_at)
           VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        )
          .bind(group.id, group.name, group.sortOrder)
          .run();
      } catch (error) {
        console.warn("Varsayilan urun grubu yazilamadi:", error);
      }
    }
  }

  const fallbackGroup = await env.DB.prepare("SELECT id FROM product_groups WHERE id = ? LIMIT 1")
    .bind(FALLBACK_CATALOG_GROUP_ID)
    .first();
  if (fallbackGroup?.id) return;

  const fallbackSeed = DEFAULT_CATALOG_GROUPS.find((item) => item.id === FALLBACK_CATALOG_GROUP_ID) || {
    id: FALLBACK_CATALOG_GROUP_ID,
    name: "Genel",
    sortOrder: 999,
  };

  try {
    await env.DB.prepare(
      `INSERT INTO product_groups (id, name, sort_order, is_active, created_at, updated_at)
       VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    )
      .bind(fallbackSeed.id, fallbackSeed.name, fallbackSeed.sortOrder)
      .run();
  } catch (error) {
    console.warn("Fallback urun grubu olusturulamadi:", error);
  }
}

async function backfillLegacyCatalogRelations(env) {
  await env.DB.prepare(
    `UPDATE product_groups
     SET sort_order = COALESCE(sort_order, 0),
         is_active = COALESCE(is_active, 1),
         created_at = COALESCE(NULLIF(TRIM(COALESCE(created_at, '')), ''), CURRENT_TIMESTAMP),
         updated_at = COALESCE(NULLIF(TRIM(COALESCE(updated_at, '')), ''), CURRENT_TIMESTAMP)`
  ).run();

  const legacyGroupRows = await env.DB.prepare(
    `SELECT DISTINCT TRIM(product_group) AS group_name
     FROM auctions
     WHERE product_group IS NOT NULL AND TRIM(product_group) <> ''`
  ).all();

  for (const row of legacyGroupRows.results || []) {
    const groupName = String(row.group_name || "").trim();
    if (!groupName) continue;
    const groupId = await ensureCatalogGroupByName(env, groupName);
    await env.DB.prepare(
      `UPDATE auctions
       SET product_group_id = ?
       WHERE (product_group_id IS NULL OR TRIM(product_group_id) = '')
         AND LOWER(TRIM(product_group)) = LOWER(TRIM(?))`
    )
      .bind(groupId, groupName)
      .run();
  }

  const legacyCategoryRows = await env.DB.prepare(
    `SELECT DISTINCT TRIM(category) AS category_name, TRIM(product_group) AS group_name
     FROM auctions
     WHERE category IS NOT NULL AND TRIM(category) <> ''`
  ).all();

  for (const row of legacyCategoryRows.results || []) {
    const categoryName = String(row.category_name || "").trim();
    if (!categoryName) continue;

    const rawGroupName = String(row.group_name || "").trim();
    const groupId = rawGroupName
      ? await ensureCatalogGroupByName(env, rawGroupName)
      : FALLBACK_CATALOG_GROUP_ID;

    await env.DB.prepare(
      `UPDATE categories
       SET group_id = ?,
           updated_at = COALESCE(NULLIF(TRIM(COALESCE(updated_at, '')), ''), CURRENT_TIMESTAMP)
       WHERE (group_id IS NULL OR TRIM(group_id) = '')
         AND LOWER(TRIM(name)) = LOWER(TRIM(?))`
    )
      .bind(groupId, categoryName)
      .run();

    const existing = await env.DB.prepare(
      `SELECT id
       FROM categories
       WHERE group_id = ? AND LOWER(TRIM(name)) = LOWER(TRIM(?))
       LIMIT 1`
    )
      .bind(groupId, categoryName)
      .first();

    if (!existing) {
      const categoryId = `cat-${slugifyCatalogToken(categoryName)}-${crypto.randomUUID().slice(0, 8)}`;
      try {
        await env.DB.prepare(
          `INSERT INTO categories (id, group_id, name, sort_order, is_active, created_at, updated_at)
           VALUES (?, ?, ?, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        )
          .bind(categoryId, groupId, categoryName.slice(0, 120))
          .run();
      } catch {
        // legacy UNIQUE(name) constraint olabilir; bu durumda mevcut kayit kullanilir
      }
    }
  }

  await env.DB.prepare(
    `UPDATE categories
     SET group_id = COALESCE(NULLIF(TRIM(COALESCE(group_id, '')), ''), ?),
         sort_order = COALESCE(sort_order, 0),
         is_active = COALESCE(is_active, 1),
         created_at = COALESCE(NULLIF(TRIM(COALESCE(created_at, '')), ''), CURRENT_TIMESTAMP),
         updated_at = COALESCE(NULLIF(TRIM(COALESCE(updated_at, '')), ''), CURRENT_TIMESTAMP)`
  )
    .bind(FALLBACK_CATALOG_GROUP_ID)
    .run();

  await env.DB.prepare(
    `UPDATE auctions
     SET category_id = (
       SELECT c.id
       FROM categories c
       WHERE LOWER(TRIM(c.name)) = LOWER(TRIM(auctions.category))
         AND c.group_id = auctions.product_group_id
       ORDER BY c.sort_order ASC, c.created_at ASC
       LIMIT 1
     )
     WHERE (category_id IS NULL OR TRIM(category_id) = '')
       AND category IS NOT NULL
       AND TRIM(category) <> ''
       AND product_group_id IS NOT NULL
       AND TRIM(product_group_id) <> ''`
  ).run();

  await env.DB.prepare(
    `UPDATE auctions
     SET category_id = (
       SELECT c.id
       FROM categories c
       WHERE LOWER(TRIM(c.name)) = LOWER(TRIM(auctions.category))
       ORDER BY c.sort_order ASC, c.created_at ASC
       LIMIT 1
     )
     WHERE (category_id IS NULL OR TRIM(category_id) = '')
       AND category IS NOT NULL
       AND TRIM(category) <> ''`
  ).run();

  await env.DB.prepare(
    `UPDATE auctions
     SET product_group_id = (
       SELECT c.group_id
       FROM categories c
       WHERE c.id = auctions.category_id
       LIMIT 1
     )
     WHERE (product_group_id IS NULL OR TRIM(product_group_id) = '')
       AND category_id IS NOT NULL
       AND TRIM(category_id) <> ''`
  ).run();

  await env.DB.prepare(
    `UPDATE auctions
     SET product_group_id = ?
     WHERE product_group_id IS NULL OR TRIM(product_group_id) = ''`
  )
    .bind(FALLBACK_CATALOG_GROUP_ID)
    .run();
}

async function ensureCatalogGroupByName(env, groupNameRaw: string) {
  const groupName = String(groupNameRaw || "").trim().slice(0, 120);
  if (!groupName) return FALLBACK_CATALOG_GROUP_ID;

  const existing = await env.DB.prepare(
    "SELECT id FROM product_groups WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1"
  )
    .bind(groupName)
    .first();
  if (existing?.id) return String(existing.id);

  const token = slugifyCatalogToken(groupName);
  const baseId = `grp-${token}`;
  const candidateIds: string[] = [baseId];
  for (let i = 2; i <= 10; i += 1) {
    candidateIds.push(`${baseId}-${i}`);
  }

  for (const id of candidateIds) {
    try {
      await env.DB.prepare(
        `INSERT INTO product_groups (id, name, sort_order, is_active, created_at, updated_at)
         VALUES (?, ?, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      )
        .bind(id, groupName)
        .run();
      return id;
    } catch {
      const row = await env.DB.prepare(
        "SELECT id FROM product_groups WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1"
      )
        .bind(groupName)
        .first();
      if (row?.id) return String(row.id);
    }
  }

  return FALLBACK_CATALOG_GROUP_ID;
}

function slugifyCatalogToken(value: string) {
  const map: Record<string, string> = {
    Ç: "c",
    ç: "c",
    Ğ: "g",
    ğ: "g",
    İ: "i",
    I: "i",
    ı: "i",
    Ö: "o",
    ö: "o",
    Ş: "s",
    ş: "s",
    Ü: "u",
    ü: "u",
  };
  const normalized = String(value || "")
    .split("")
    .map((char) => map[char] || char)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return (normalized || "genel").slice(0, 40);
}

async function validateAuctionPayload(env, body) {
  const lotNo = String(body.lotNo || "").trim().toUpperCase();
  const title = String(body.title || "").trim();
  const startPrice = Number(body.startPrice || 0);
  const minIncrement = Number(body.minIncrement || 0);
  const startsAt = String(body.startsAt || "").trim();
  const endsAt = String(body.endsAt || "").trim();
  const statusRaw = String(body.status || "ACTIVE").trim().toUpperCase();
  const allowedStatus = ["ACTIVE", "PASSIVE", "ENDED"];
  const status = allowedStatus.includes(statusRaw) ? statusRaw : "ACTIVE";
  const groupIdRaw = String(body.groupId || "").trim();
  const categoryIdRaw = String(body.categoryId || "").trim();
  const city = String(body.city || "").trim().slice(0, 120);
  const district = String(body.district || "").trim().slice(0, 120);
  const neighborhood = String(body.neighborhood || "").trim().slice(0, 120);
  const vehicleBrand = String(body.vehicleBrand || "").trim().slice(0, 120);
  const vehicleModel = String(body.vehicleModel || "").trim().slice(0, 120);
  const vehicleModelDetail = String(body.vehicleModelDetail || "").trim().slice(0, 220);
  const vehicleYearRaw = Number(body.vehicleYear || 0);
  const vehicleKmRaw = Number(body.vehicleKm || 0);
  const vehicleFuelType = String(body.vehicleFuelType || "").trim().slice(0, 80);
  const vehicleTransmission = String(body.vehicleTransmission || "").trim().slice(0, 80);
  const vehicleBodyType = String(body.vehicleBodyType || "").trim().slice(0, 80);
  const vehicleColor = String(body.vehicleColor || "").trim().slice(0, 80);
  const vehicleChassisNo = String(body.vehicleChassisNo || body.vehicle_chassis_no || "")
    .trim()
    .toUpperCase()
    .slice(0, 80);
  const vehicleEngineVolume = String(body.vehicleEngineVolume || "").trim().slice(0, 80);
  const vehicleEnginePower = String(body.vehicleEnginePower || "").trim().slice(0, 80);
  const vehicleDriveType = String(body.vehicleDriveType || "").trim().slice(0, 80);
  const machineBrand = String(body.machineBrand || "").trim().slice(0, 120);
  const machineModel = String(body.machineModel || "").trim().slice(0, 120);
  const machineYear = Number(body.machineYear || 0);
  const machineHours = Number(body.machineHours || 0);
  const machineType = String(body.machineType || "").trim().slice(0, 40);
  const machineWeight = Number(body.machineWeight || 0);
  const machinePower = String(body.machinePower || "").trim().slice(0, 80);
  const machineAttrsJson = String(body.machineAttrsJson || "").trim();
  const vehicleConditionMap = normalizeVehicleConditionMapInput(
    body.vehicleConditionMap || body.vehicle_condition_map || body.vehicle_condition_map_json || {}
  );
  const vehicleExpertiseMeta = normalizeVehicleExpertiseMetaInput(
    body.vehicleExpertiseMeta || body.vehicle_expertise_meta || body.vehicle_expertise_meta_json || {}
  );
  const description = String(body.description || "").trim().slice(0, 5000);
  const extraEquipment = String(body.extraEquipment || body.extra_equipment || "").trim().slice(0, 5000);
  const rawImageUrl = String(body.imageUrl || "").trim();
  let imageList = normalizeGalleryList(body.images || body.gallery || body.gallery_json || []);
  let imageUrl = "";

  if (!lotNo) return { error: "İhale no zorunludur." };
  if (!title) return { error: "İhale başlığı zorunludur." };
  if (!Number.isFinite(startPrice) || startPrice <= 0) return { error: "Başlangıç bedeli geçersiz." };
  if (!Number.isFinite(minIncrement) || minIncrement <= 0) return { error: "Min artış tutarı geçersiz." };

  const startTime = new Date(startsAt).getTime();
  const endTime = new Date(endsAt).getTime();
  if (!startsAt || Number.isNaN(startTime)) return { error: "Baslangic tarihi gecersiz." };
  if (!endsAt || Number.isNaN(endTime)) return { error: "Bitiş tarihi geçersiz." };
  if (endTime <= startTime) return { error: "Bitis tarihi, baslangic tarihinden sonra olmalidir." };

  if (imageList.length < 1 && rawImageUrl) {
    imageList = normalizeGalleryList([rawImageUrl]);
  }
  if (rawImageUrl) {
    if (rawImageUrl.startsWith("data:image/")) {
      if (rawImageUrl.length > MAX_GALLERY_IMAGE_DATA_URL_LENGTH) {
        return { error: "Gorsel dosyasi cok buyuk. Daha kucuk bir dosya yukleyin." };
      }
      imageUrl = rawImageUrl;
    } else {
      if (!/^https?:\/\//i.test(rawImageUrl)) {
        return { error: "Gorsel URL http/https ile baslamalidir." };
      }
      imageUrl = rawImageUrl.slice(0, 2000);
    }
  }
  if (imageList.length > 0) {
    imageUrl = imageList[0];
  }

  const galleryTotalLength = imageList.reduce((sum: number, item: string) => sum + String(item || "").length, 0);
  if (galleryTotalLength > MAX_GALLERY_TOTAL_DATA_URL_LENGTH) {
    return { error: "Gorsellerin toplam boyutu cok buyuk. Lutfen daha az veya daha kucuk gorsel yukleyin." };
  }

  const expertiseFiles = normalizeAttachmentList(body.expertiseFiles || body.expertise_files || body.expertise_files_json || []);
  const documentFiles = normalizeAttachmentList(body.documentFiles || body.document_files || body.document_files_json || []);
  const expertiseTotalLength = expertiseFiles.reduce(
    (sum: number, item: { dataUrl: string }) => sum + String(item.dataUrl || "").length,
    0
  );
  if (expertiseTotalLength > MAX_ATTACHMENT_TOTAL_DATA_URL_LENGTH) {
    return { error: "Ekspertiz dosyalarinin toplam boyutu cok buyuk. Lutfen dosya sayisini veya boyutunu azaltin." };
  }
  const documentTotalLength = documentFiles.reduce(
    (sum: number, item: { dataUrl: string }) => sum + String(item.dataUrl || "").length,
    0
  );
  if (documentTotalLength > MAX_ATTACHMENT_TOTAL_DATA_URL_LENGTH) {
    return { error: "Dokumanlarin toplam boyutu cok buyuk. Lutfen dosya sayisini veya boyutunu azaltin." };
  }
  const vehicleConditionMapJson = JSON.stringify(vehicleConditionMap);
  if (vehicleConditionMapJson.length > MAX_VEHICLE_CONDITION_JSON_LENGTH) {
    return { error: "Kaporta durum haritasi kaydedilemedi. Lutfen daha az parca secimi yapin." };
  }
  const vehicleExpertiseMetaJson = JSON.stringify(vehicleExpertiseMeta);
  if (vehicleExpertiseMetaJson.length > MAX_VEHICLE_EXPERTISE_META_JSON_LENGTH) {
    return { error: "Ekspertiz detay alanlari cok uzun. Lutfen secimleri azaltin." };
  }

  let groupId = groupIdRaw;
  let categoryId = categoryIdRaw;

  if (groupId) {
    const group = await env.DB.prepare("SELECT id FROM product_groups WHERE id = ?").bind(groupId).first();
    if (!group) return { error: "Seçilen ürün grubu bulunamadı." };
  }

  if (categoryId) {
    const category = await env.DB.prepare("SELECT id, group_id FROM categories WHERE id = ?").bind(categoryId).first();
    if (!category) return { error: "Seçilen kategori bulunamadı." };
    if (groupId && String(category.group_id) !== groupId) {
      return { error: "Kategori seçilen ürün grubuna ait değil." };
    }
    if (!groupId) groupId = String(category.group_id || "");
  }

  if (!groupId || !categoryId) return { error: "Ürün grubu ve kategori seçimi zorunludur." };

  const vehicleYear =
    Number.isFinite(vehicleYearRaw) && vehicleYearRaw >= 1900 && vehicleYearRaw <= 2100 ? Math.round(vehicleYearRaw) : null;
  const vehicleKm = Number.isFinite(vehicleKmRaw) && vehicleKmRaw >= 0 ? Math.round(vehicleKmRaw) : null;

  return {
    lotNo: lotNo.slice(0, 64),
    title: title.slice(0, 220),
    startPrice,
    minIncrement,
    startsAt: new Date(startTime).toISOString(),
    endsAt: new Date(endTime).toISOString(),
    status,
    groupId,
    categoryId,
    city,
    district,
    neighborhood,
    description,
    extraEquipment,
    vehicleBrand,
    vehicleModel,
    vehicleModelDetail,
    vehicleYear,
    vehicleKm,
    vehicleFuelType,
    vehicleTransmission,
    vehicleBodyType,
    vehicleColor,
    vehicleChassisNo,
    vehicleEngineVolume,
    vehicleEnginePower,
    vehicleDriveType,
    vehicleConditionMapJson,
    vehicleExpertiseMetaJson,
    machineBrand,
    machineModel,
    machineYear,
    machineHours,
    machineType,
    machineWeight,
    machinePower,
    machineAttrsJson,
    imageUrl,
    galleryJson: JSON.stringify(imageList),
    expertiseFilesJson: JSON.stringify(expertiseFiles),
    documentFilesJson: JSON.stringify(documentFiles),
    error: null,
  };
}

async function findAuctionIdByLotNo(env, lotNo: string) {
  return await env.DB.prepare(
    `SELECT id
     FROM auctions
     WHERE UPPER(TRIM(lot_no)) = UPPER(TRIM(?))
     LIMIT 1`
  )
    .bind(lotNo)
    .first();
}

async function updateAuctionRecord(env, auctionId: string, validation: any) {
  return await env.DB.prepare(
     `UPDATE auctions
     SET lot_no = ?, title = ?, start_price = ?, min_increment = ?, starts_at = ?, ends_at = ?, status = ?,
         product_group_id = ?, category_id = ?, city = ?, district = ?, neighborhood = ?, image_url = ?, gallery_json = ?,
         description = ?, extra_equipment = ?, expertise_files_json = ?, document_files_json = ?,
         vehicle_brand = ?, vehicle_model = ?, vehicle_model_detail = ?, vehicle_year = ?, vehicle_km = ?, vehicle_fuel_type = ?,
        vehicle_transmission = ?, vehicle_body_type = ?, vehicle_color = ?, vehicle_chassis_no = ?, vehicle_engine_volume = ?, vehicle_engine_power = ?, vehicle_drive_type = ?,
        vehicle_condition_map_json = ?, vehicle_expertise_meta_json = ?,
        machine_brand = ?, machine_model = ?, machine_year = ?, machine_hours = ?, machine_type = ?, machine_weight = ?, machine_power = ?, machine_attrs_json = ?,
        updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  )
    .bind(
      validation.lotNo,
      validation.title,
      validation.startPrice,
      validation.minIncrement,
      validation.startsAt,
      validation.endsAt,
      validation.status,
      validation.groupId,
      validation.categoryId,
      validation.city,
      validation.district,
      validation.neighborhood,
      validation.imageUrl,
      validation.galleryJson,
      validation.description,
      validation.extraEquipment,
      validation.expertiseFilesJson,
      validation.documentFilesJson,
      validation.vehicleBrand,
      validation.vehicleModel,
      validation.vehicleModelDetail,
      validation.vehicleYear,
      validation.vehicleKm,
      validation.vehicleFuelType,
      validation.vehicleTransmission,
      validation.vehicleBodyType,
      validation.vehicleColor,
      validation.vehicleChassisNo,
      validation.vehicleEngineVolume,
      validation.vehicleEnginePower,
      validation.vehicleDriveType,
      validation.vehicleConditionMapJson,
      validation.vehicleExpertiseMetaJson,
      validation.machineBrand || "",
      validation.machineModel || "",
      validation.machineYear || 0,
      validation.machineHours || 0,
      validation.machineType || "",
      validation.machineWeight || 0,
      validation.machinePower || "",
      validation.machineAttrsJson || "",
      auctionId
    )
    .run();
}

function isAuctionLotNoUniqueConstraintError(error: unknown): boolean {
  const message = String((error as any)?.message || "").toLowerCase();
  return message.includes("unique") && message.includes("auctions.lot_no");
}

function mapAuctionMutationError(error: unknown, fallbackMessage: string): { status: number; error: string } {
  const rawMessage = String((error as any)?.message || "");
  const message = rawMessage.toLowerCase();

  if (isAuctionLotNoUniqueConstraintError(error)) {
    return { status: 409, error: "Bu ihale no başka bir kayıtta kullanılıyor." };
  }

  if (message.includes("foreign key")) {
    return { status: 409, error: "Seçilen ürün grubu veya kategori geçersiz. Lütfen tekrar seçin." };
  }

  if (
    message.includes("string or blob too big") ||
    message.includes("too big") ||
    message.includes("request entity too large") ||
    message.includes("payload too large") ||
    message.includes("statement too large")
  ) {
    return {
      status: 413,
      error: "Yuklenen gorsel veya dosyalarin toplam boyutu cok buyuk. Lutfen dosya sayisini veya boyutunu azaltin.",
    };
  }

  if (message.includes("not null constraint failed: auctions.lot_no")) {
    return { status: 400, error: "İhale no zorunludur." };
  }
  if (message.includes("not null constraint failed: auctions.title")) {
    return { status: 400, error: "İhale başlığı zorunludur." };
  }
  if (message.includes("not null constraint failed: auctions.start_price")) {
    return { status: 400, error: "Başlangıç bedeli zorunludur." };
  }
  if (message.includes("not null constraint failed: auctions.min_increment")) {
    return { status: 400, error: "Minimum artış zorunludur." };
  }
  if (message.includes("not null constraint failed: auctions.ends_at")) {
    return { status: 400, error: "Bitiş tarihi zorunludur." };
  }
  if (message.includes("not null constraint failed: auctions.status")) {
    return { status: 400, error: "İhale durumu zorunludur." };
  }
  if (message.includes("no such column")) {
    return { status: 500, error: "Sistem alanları güncelleniyor. Sayfayı yenileyip tekrar deneyin." };
  }

  return { status: 500, error: fallbackMessage };
}

function normalizeGalleryList(rawInput: any, fallbackImageUrl: string = "") {
  const values = parseJsonArrayFromUnknown(rawInput);
  const out: string[] = [];

  for (const value of values) {
    const url = String(value || "").trim();
    if (!url) continue;
    const isData = url.startsWith("data:image/");
    const isHttp = /^https?:\/\//i.test(url);
    if (!isData && !isHttp) continue;
    if (isData && url.length > MAX_GALLERY_IMAGE_DATA_URL_LENGTH) continue;
    out.push(isData ? url : url.slice(0, 2000));
    if (out.length >= MAX_GALLERY_IMAGE_COUNT) break;
  }

  if (out.length < 1) {
    const fallback = String(fallbackImageUrl || "").trim();
    if (fallback.startsWith("data:image/") || /^https?:\/\//i.test(fallback)) {
      out.push(fallback);
    }
  }

  return out;
}

function normalizeAttachmentList(rawInput: any) {
  const values = parseJsonArrayFromUnknown(rawInput);
  const out: Array<{ name: string; type: string; size: number; dataUrl: string }> = [];

  for (const value of values) {
    const row = value && typeof value === "object" ? value : {};
    const dataUrl = String(row.dataUrl || row.url || "").trim();
    if (!isAllowedAttachmentDataSource(dataUrl)) continue;
    if (dataUrl.startsWith("data:") && dataUrl.length > MAX_ATTACHMENT_DATA_URL_LENGTH) continue;

    const typeRaw = String(row.type || "").trim().toLowerCase();
    const nameRaw = String(row.name || "dosya").trim();
    const normalizedType =
      typeRaw || (dataUrl.startsWith("data:application/pdf") ? "application/pdf" : "image/jpeg");
    const sizeRaw = Number(row.size || 0);

    out.push({
      name: nameRaw.slice(0, 140) || "dosya",
      type: normalizedType.slice(0, 80),
      size: Number.isFinite(sizeRaw) && sizeRaw >= 0 ? Math.round(sizeRaw) : 0,
      dataUrl: dataUrl.startsWith("data:") ? dataUrl : dataUrl.slice(0, 2000),
    });
    if (out.length >= MAX_ATTACHMENT_COUNT) break;
  }

  return out;
}

function normalizeVehicleConditionMapInput(rawInput: any) {
  const source = parseJsonObjectFromUnknown(rawInput);
  const out: Record<string, "ORIGINAL" | "LOCAL_PAINTED" | "PAINTED" | "CHANGED"> = {};
  for (const partKey of VEHICLE_CONDITION_PART_KEYS) {
    const normalized = normalizeVehicleConditionStatusValue(source[partKey]);
    if (!normalized || normalized === "ORIGINAL") continue;
    out[partKey] = normalized;
  }
  return out;
}

function normalizeVehicleConditionStatusValue(rawInput: any): "ORIGINAL" | "LOCAL_PAINTED" | "PAINTED" | "CHANGED" | null {
  const text = String(rawInput || "").trim();
  if (!text) return null;
  const folded = text
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (folded === "ORIGINAL" || folded === "ORIJINAL") return "ORIGINAL";
  if (folded === "LOCAL_PAINTED" || folded === "LOKAL BOYALI" || folded === "LOKALBOYALI") return "LOCAL_PAINTED";
  if (folded === "PAINTED" || folded === "BOYALI") return "PAINTED";
  if (folded === "CHANGED" || folded === "DEGISEN") return "CHANGED";
  return null;
}

function normalizeVehicleExpertiseMetaInput(rawInput: any) {
  const source = parseJsonObjectFromUnknown(rawInput);
  const structureSource = parseJsonObjectFromUnknown(source.structure || source.structural || {});
  const mechanicalSource = parseJsonObjectFromUnknown(source.mechanical || {});
  const tireSource = parseJsonObjectFromUnknown(source.tires || {});

  const structure: Record<string, "ORIGINAL" | "ISLEMLI" | "DEGISMIS"> = {};
  for (const key of VEHICLE_EXPERTISE_STRUCTURE_KEYS) {
    const aliases = VEHICLE_EXPERTISE_STRUCTURE_LEGACY_KEYS[key] || [];
    const candidates = [key, ...aliases];
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
    const normalized = normalizeVehicleExpertiseStructureStatusValue(rawValue);
    if (!normalized || normalized === "ORIGINAL") continue;
    structure[key] = normalized;
  }

  const mechanical: Record<string, "NORMAL" | "BAKIM_GEREKLI" | "ONARIM_GEREKLI"> = {};
  for (const key of VEHICLE_EXPERTISE_MECHANICAL_KEYS) {
    const aliases = key === "intercooler" ? ["interkol"] : [];
    const candidates = [key, ...aliases];
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
    const normalized = normalizeVehicleExpertiseMechanicalStatusValue(rawValue);
    if (!normalized || normalized === "NORMAL") continue;
    mechanical[key] = normalized;
  }

  const tireRaw =
    tireSource.general || tireSource.lastik_genel_durum || source.lastik_genel_durum || source.tireGeneral || source.lastikDurum;
  const tireGeneral = normalizeVehicleExpertiseTireStatusValue(tireRaw);

  const out: Record<string, any> = {};
  if (Object.keys(structure).length > 0) out.structure = structure;
  if (Object.keys(mechanical).length > 0) out.mechanical = mechanical;
  if (tireGeneral && tireGeneral !== "IYI") out.tires = { general: tireGeneral };
  return out;
}

function normalizeVehicleExpertiseStructureStatusValue(rawInput: any): "ORIGINAL" | "ISLEMLI" | "DEGISMIS" | null {
  const text = String(rawInput || "").trim();
  if (!text) return null;
  const folded = text
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (folded === "ORIGINAL" || folded === "ORIJINAL") return "ORIGINAL";
  if (
    folded === "ISLEMLI" ||
    folded === "ISLEM GORMUS" ||
    folded === "ISLEM GORMUS" ||
    folded === "DUZELTILMIS" ||
    folded === "DUZELTME"
  ) {
    return "ISLEMLI";
  }
  if (folded === "DEGISMIS" || folded === "DEGISEN" || folded === "CHANGED") return "DEGISMIS";
  return null;
}

function normalizeVehicleExpertiseMechanicalStatusValue(
  rawInput: any
): "NORMAL" | "BAKIM_GEREKLI" | "ONARIM_GEREKLI" | null {
  const text = String(rawInput || "").trim();
  if (!text) return null;
  const folded = text
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (folded === "NORMAL" || folded === "IYI" || folded === "SORUNSUZ" || folded === "YOK") return "NORMAL";
  if (folded === "BAKIM_GEREKLI" || folded === "KONTROL_GEREKLI" || folded === "BAKIM" || folded === "KONTROL") {
    return "BAKIM_GEREKLI";
  }
  if (
    folded === "ONARIM_GEREKLI" ||
    folded === "ONARIM" ||
    folded === "ARIZALI" ||
    folded === "KACAK VAR" ||
    folded === "KACAK_VAR"
  ) {
    return "ONARIM_GEREKLI";
  }
  return null;
}

function normalizeVehicleExpertiseTireStatusValue(rawInput: any): "IYI" | "ORTA" | "ZAYIF" | "DEGISTIRILMELI" | null {
  const text = String(rawInput || "").trim();
  if (!text) return null;
  const folded = text
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (folded === "IYI" || folded === "GOOD") return "IYI";
  if (folded === "ORTA" || folded === "MEDIUM") return "ORTA";
  if (folded === "ZAYIF" || folded === "KOTU" || folded === "DUSUK") return "ZAYIF";
  if (
    folded === "DEGISTIRILMELI" ||
    folded === "DEGISMELI" ||
    folded === "DEGISIM GEREKLI" ||
    folded === "CHANGE_REQUIRED"
  ) {
    return "DEGISTIRILMELI";
  }
  return null;
}

function isAllowedAttachmentDataSource(value: string) {
  const input = String(value || "").trim().toLowerCase();
  if (!input) return false;
  if (input.startsWith("data:image/")) return true;
  if (input.startsWith("data:application/pdf")) return true;
  if (input.startsWith("http://") || input.startsWith("https://")) return true;
  return false;
}

function parseJsonArrayFromUnknown(rawInput: any) {
  if (Array.isArray(rawInput)) return rawInput;
  if (typeof rawInput === "string") {
    const text = String(rawInput || "").trim();
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

function parseJsonObjectFromUnknown(rawInput: any) {
  if (rawInput && typeof rawInput === "object" && !Array.isArray(rawInput)) return rawInput;
  if (typeof rawInput !== "string") return {};
  const text = String(rawInput || "").trim();
  if (!text || !text.startsWith("{")) return {};
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  } catch {
    return {};
  }
  return {};
}

async function createEmailVerifyToken(env, userId) {
  await env.DB.prepare("DELETE FROM email_verification_tokens WHERE user_id = ?").bind(userId).run();
  const token = randomToken(32);
  const hash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFY_TTL_SECONDS * 1000).toISOString();
  await env.DB.prepare(
    "INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)"
  )
    .bind(crypto.randomUUID(), userId, hash, expiresAt)
    .run();
  return token;
}

async function createPasswordResetToken(env, userId) {
  await env.DB.prepare("DELETE FROM password_reset_tokens WHERE user_id = ?").bind(userId).run();
  const token = randomToken(32);
  const hash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_SECONDS * 1000).toISOString();
  await env.DB.prepare(
    "INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)"
  )
    .bind(crypto.randomUUID(), userId, hash, expiresAt)
    .run();
  return token;
}

async function hashPassword(password) {
  const salt = randomToken(16);
  const derived = await pbkdf2(password, salt, PBKDF2_ITERATIONS, 32);
  return `pbkdf2_sha256$${PBKDF2_ITERATIONS}$${salt}$${toHex(derived)}`;
}

async function verifyPassword(password, encoded) {
  if (!encoded) return false;
  const [algo, iterStr, salt, hashHex] = String(encoded).split("$");
  if (algo !== "pbkdf2_sha256" || !iterStr || !salt || !hashHex) return false;

  const iterations = Number(iterStr);
  if (!Number.isFinite(iterations) || iterations < 1000) return false;

  try {
    const derived = await pbkdf2(password, salt, iterations, hashHex.length / 2);
    const derivedHex = toHex(derived);
    return safeEqual(derivedHex, hashHex);
  } catch (error) {
    console.warn("Password verify pbkdf2 hatasi:", error);
    return false;
  }
}

async function pbkdf2(password, salt, iterations, bytesLen) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations,
      hash: "SHA-256",
    },
    key,
    bytesLen * 8
  );
  return new Uint8Array(bits);
}

async function hashSessionSecret(secret, pepper) {
  return sha256Hex(`${pepper}:${secret}`);
}

async function sha256Hex(input) {
  const data = new TextEncoder().encode(String(input));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(new Uint8Array(digest));
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function randomToken(byteLength = 32) {
  const arr = new Uint8Array(byteLength);
  crypto.getRandomValues(arr);
  return toBase64Url(arr);
}

function toBase64Url(bytes: Uint8Array) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function safeEqual(a, b) {
  const left = String(a || "");
  const right = String(b || "");
  if (left.length !== right.length) return false;
  let out = 0;
  for (let i = 0; i < left.length; i += 1) {
    out |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return out === 0;
}

function sessionCookie(value, maxAgeSeconds) {
  return [
    `session=${value}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ].join("; ");
}

function clearSessionCookie() {
  return "session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
}

function readCookie(cookieHeader, name) {
  const parts = cookieHeader.split(";").map((x) => x.trim());
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) {
      return part.slice(name.length + 1);
    }
  }
  return null;
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function isAdminAssetPath(pathname: string) {
  const path = String(pathname || "").toLowerCase();
  return (
    path === "/admin.html" ||
    path === "/admin.js" ||
    path === "/admin.css" ||
    path === "/auction.html" ||
    path === "/auction.js" ||
    path === "/auction.css"
  );
}

function withNoStoreHeaders(response: Response) {
  const headers = new Headers(response.headers);
  headers.set("cache-control", "no-store, max-age=0, must-revalidate");
  headers.set("pragma", "no-cache");
  headers.set("expires", "0");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function sanitizeName(name) {
  const clean = String(name || "").trim().replace(/\s+/g, " ");
  if (!clean) return "Yeni Üye";
  return clean.slice(0, 100);
}

function normalizeTcIdentityNo(value) {
  return String(value || "")
    .replace(/[^\d]/g, "")
    .slice(0, 11);
}

function isValidTcIdentityNo(value) {
  return /^\d{11}$/.test(String(value || ""));
}

function sanitizePhone(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 32);
}

function isValidPhone(value) {
  const digits = String(value || "").replace(/[^\d]/g, "");
  return digits.length >= 10;
}

function sanitizeAddress(value) {
  return String(value || "").trim().slice(0, 500);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || ""));
}

function getClientIp(request) {
  return request.headers.get("cf-connecting-ip") || "0.0.0.0";
}

function getBaseUrl(request, env) {
  if (env.PUBLIC_BASE_URL) return String(env.PUBLIC_BASE_URL).replace(/\/+$/, "");
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

async function checkRateLimit(env, key, limit, windowSeconds) {
  const now = Date.now();
  const windowStart = Math.floor(now / (windowSeconds * 1000)) * windowSeconds * 1000;
  const windowIso = new Date(windowStart).toISOString();
  const expiresIso = new Date(windowStart + windowSeconds * 1000).toISOString();

  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count, expires_at)
     VALUES (?, ?, 1, ?)
     ON CONFLICT(key, window_start)
     DO UPDATE SET count = count + 1`
  )
    .bind(key, windowIso, expiresIso)
    .run();

  const row = await env.DB.prepare("SELECT count FROM rate_limits WHERE key = ? AND window_start = ?")
    .bind(key, windowIso)
    .first();

  return Number(row?.count || 0) > Number(limit);
}

function requireSessionPepper(env) {
  if (env.SESSION_PEPPER) return null;
  return json(
    {
      ok: false,
      error: "SESSION_PEPPER secret eksik. `wrangler secret put SESSION_PEPPER` ile güçlü bir secret tanımlayın.",
    },
    500
  );
}

function isTurnstileRequired(env) {
  return String(env.REQUIRE_TURNSTILE || "").toLowerCase() === "true";
}

function requireTurnstileConfig(env) {
  const siteKey = String(env.TURNSTILE_SITE_KEY || "").trim();
  const secret = String(env.TURNSTILE_SECRET || "").trim();
  const missing = [];
  if (!siteKey) missing.push("TURNSTILE_SITE_KEY");
  if (!secret) missing.push("TURNSTILE_SECRET");
  if (missing.length < 1) return null;
  return json(
    {
      ok: false,
      error: `Turnstile yapilandirmasi eksik (${missing.join(", ")}).`,
    },
    500
  );
}

async function ensureTurnstileRequired(env, request, body, expectedAction = null) {
  if (!isTurnstileRequired(env)) return null;

  const cfgError = requireTurnstileConfig(env);
  if (cfgError) return cfgError;

  const token = String(body?.turnstileToken || body?.["cf-turnstile-response"] || "").trim();
  if (!token) return json({ ok: false, error: "Güvenlik doğrulaması tamamlanmadı. Lütfen tekrar deneyin." }, 400);

  const remoteIp = getClientIp(request);
  const verify = await verifyTurnstileToken(String(env.TURNSTILE_SECRET || ""), token, remoteIp);
  if (!verify.success) {
    return json({ ok: false, error: "Güvenlik doğrulaması başarısız. Lütfen tekrar deneyin." }, 400);
  }

  if (expectedAction && verify.action !== expectedAction) {
    return json({ ok: false, error: "Güvenlik doğrulaması geçersiz." }, 400);
  }

  return null;
}

async function verifyTurnstileToken(secret: string, token: string, remoteIp: string): Promise<TurnstileVerifyResponse> {
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: remoteIp || undefined,
      }),
    });
    const payload = (await response.json()) as Partial<TurnstileVerifyResponse> | null;
    return {
      success: Boolean(payload?.success),
      action: payload?.action,
    };
  } catch (error) {
    console.error("Turnstile doğrulama hatası:", error);
    return { success: false };
  }
}

async function sendAuthEmail(env, to, subject, text) {
  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO email_outbox (id, to_email, subject, body, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)"
  )
    .bind(id, to, subject, text)
    .run();

  if (!env.EMAIL_WEBHOOK_URL) {
    console.log(`[MAIL:dev-only] ${to} | ${subject} | ${text}`);
    return;
  }

  try {
    await fetch(env.EMAIL_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        to,
        subject,
        text,
        from: env.EMAIL_FROM || "noreply@example.com",
      }),
    });
  } catch (error) {
    console.error("E-posta webhook çağrısı başarısız:", error);
  }
}

function isEmailVerificationRequired(env) {
  return String(env.REQUIRE_EMAIL_VERIFICATION || "").toLowerCase() === "true";
}

function shouldExposeDebugToken(env) {
  return String(env.ENVIRONMENT || "").toLowerCase() !== "production";
}

function formatMoney(value) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}




