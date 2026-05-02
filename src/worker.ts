const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const EMAIL_VERIFY_TTL_SECONDS = 60 * 60 * 24;
const PASSWORD_RESET_TTL_SECONDS = 60 * 60;
const PBKDF2_ITERATIONS = 210000;
const MIN_PASSWORD_LENGTH = 8;

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

      return env.ASSETS.fetch(request);
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
    return json({ ok: true, service: "acik-teklif-api" });
  }

  if (method === "GET" && path === "/api/config") {
    return json({
      ok: true,
      turnstileSiteKey: String(env.TURNSTILE_SITE_KEY || "").trim(),
      requireEmailVerification: isEmailVerificationRequired(env),
    });
  }

  if (method === "GET" && path === "/api/auth/me") {
    const cfgError = requireSessionPepper(env);
    if (cfgError) return cfgError;

    const session = await getSession(request, env);
    if (!session) return json({ ok: true, authenticated: false, user: null });
    return json({
      ok: true,
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        emailVerified: !!session.user.email_verified_at,
      },
    });
  }

  if (method === "POST" && path === "/api/auth/register") {
    const cfgError = requireSessionPepper(env);
    if (cfgError) return cfgError;

    const ip = getClientIp(request);
    const limited = await checkRateLimit(env, `register:${ip}`, 8, 10 * 60);
    if (limited) return json({ ok: false, error: "Çok fazla deneme yaptınız. Lütfen sonra tekrar deneyin." }, 429);

    const body = await readJson(request);
    const turnstileError = await ensureTurnstileRequired(env, request, body, "register");
    if (turnstileError) return turnstileError;

    const email = normalizeEmail(body.email);
    const name = sanitizeName(body.name);
    const password = String(body.password || "");

    if (!isValidEmail(email)) return json({ ok: false, error: "Geçerli bir e-posta girin." }, 400);
    if (password.length < MIN_PASSWORD_LENGTH) {
      return json({ ok: false, error: `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalıdır.` }, 400);
    }

    const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) return json({ ok: false, error: "Bu e-posta ile kayıtlı bir kullanıcı zaten var." }, 409);

    const userId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const requireEmailVerification = isEmailVerificationRequired(env);

    await env.DB.prepare(
      "INSERT INTO users (id, email, name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
    )
      .bind(userId, email, name, passwordHash)
      .run();

    const verifyToken = requireEmailVerification ? await createEmailVerifyToken(env, userId) : null;
    if (requireEmailVerification && verifyToken) {
      const verifyUrl = `${getBaseUrl(request, env)}/?verify=${encodeURIComponent(verifyToken)}`;
      await sendAuthEmail(
        env,
        email,
        "E-posta Doğrulama",
        `Hesabınızı doğrulamak için bu bağlantıyı açın: ${verifyUrl}`
      );
    } else {
      await env.DB.prepare(
        "UPDATE users SET email_verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      )
        .bind(userId)
        .run();
    }

    const { cookie, expiresAt } = await createSession(env, request, userId);
    const headers = new Headers({ "content-type": "application/json; charset=utf-8" });
    headers.append("set-cookie", cookie);

    const registerMessage = requireEmailVerification
      ? "Kayit basarili. E-posta dogrulama baglantisi gonderildi."
      : "Kayit basarili.";

    return new Response(
      JSON.stringify({
        ok: true,
        expiresAt,
        message: registerMessage,
        debugVerifyToken: requireEmailVerification && shouldExposeDebugToken(env) ? verifyToken : undefined,
      }),
      { status: 201, headers }
    );
  }

  if (method === "POST" && path === "/api/auth/login") {
    const cfgError = requireSessionPepper(env);
    if (cfgError) return cfgError;

    const ip = getClientIp(request);
    const limited = await checkRateLimit(env, `login:${ip}`, 20, 10 * 60);
    if (limited) return json({ ok: false, error: "Çok fazla deneme yaptınız. Lütfen sonra tekrar deneyin." }, 429);

    const body = await readJson(request);
    const turnstileError = await ensureTurnstileRequired(env, request, body, "login");
    if (turnstileError) return turnstileError;

    const email = normalizeEmail(body.email);
    const password = String(body.password || "");

    if (!isValidEmail(email) || !password) return json({ ok: false, error: "E-posta ve şifre zorunludur." }, 400);

    const user = await env.DB.prepare(
      "SELECT id, email, name, password_hash, email_verified_at, disabled_at FROM users WHERE email = ?"
    )
      .bind(email)
      .first();

    if (!user || user.disabled_at) return json({ ok: false, error: "E-posta veya şifre hatalı." }, 401);

    const passOk = await verifyPassword(password, user.password_hash);
    if (!passOk) return json({ ok: false, error: "E-posta veya şifre hatalı." }, 401);

    const { cookie, expiresAt } = await createSession(env, request, user.id);
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
    const data = await env.DB.prepare(
      "SELECT id, lot_no, title, start_price, current_bid, min_increment, ends_at, status, created_at FROM auctions ORDER BY created_at DESC"
    ).all();
    return json({ ok: true, items: data.results || [] });
  }

  if (method === "POST" && path === "/api/bids") {
    const cfgError = requireSessionPepper(env);
    if (cfgError) return cfgError;

    const session = await getSession(request, env);
    if (!session) return json({ ok: false, error: "Teklif verebilmek için giriş yapmalısınız." }, 401);
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
      "INSERT INTO bids (id, auction_id, user_id, amount, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)"
    )
      .bind(crypto.randomUUID(), auction.id, session.user.id, amount)
      .run();

    return json({
      ok: true,
      message: "Teklifiniz alındı.",
      lotNo,
      amount,
    });
  }

  return json({ ok: false, error: "Endpoint bulunamadı." }, 404);
}

async function createSession(env, request, userId) {
  const sessionId = randomToken(18);
  const sessionSecret = randomToken(32);
  const secretHash = await hashSessionSecret(sessionSecret, env.SESSION_PEPPER);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
  const userAgent = request.headers.get("user-agent") || "";
  const ipHash = await sha256Hex(`${env.SESSION_PEPPER}:${getClientIp(request)}`);

  await env.DB.prepare(
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

  const [sessionId, sessionSecret] = token.split(".");
  if (!sessionId || !sessionSecret) return null;

  const row = await env.DB.prepare(
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

  const derived = await pbkdf2(password, salt, iterations, hashHex.length / 2);
  const derivedHex = toHex(derived);
  return safeEqual(derivedHex, hashHex);
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




