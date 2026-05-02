# Acik Teklif Pazari (Cloudflare + D1)

Bu proje statik arayuzun yaninda Cloudflare Worker + D1 ile calisan uyelik ve teklif API'si icerir.

## Ozellikler

- Uyelik: `/api/auth/register`
- Giris/Cikis: `/api/auth/login`, `/api/auth/logout`
- Oturum yonetimi: `HttpOnly + Secure cookie`
- E-posta dogrulama akisi
- Sifre sifirlama akisi
- E-posta dogrulama zorunlulugu ayarlanabilir (`REQUIRE_EMAIL_VERIFICATION`)
- Basit rate limiting (D1 tabanli)
- Turnstile captcha korumasi (register/login icin zorunlu)
- Admin paneli (`/admin.html`)
- Rol + yetki yonetimi (ac/kapat)
- Kullanici pasife alma / aktif etme
- Kullanici oturum sonlandirma

## Dizin Yapisi

- `public/index.html`, `public/styles.css`, `public/script.js`: Ana sayfa statik dosyalari
- `public/admin.html`, `public/admin.css`, `public/admin.js`: Admin paneli statik dosyalari
- `src/client.ts`: Frontend TypeScript kaynagi (`npm run build` ile `public/script.js` uretilir)
- `src/admin.ts`: Admin paneli TypeScript kaynagi (`npm run build` ile `public/admin.js` uretilir)
- `src/worker.ts`: API ve auth mantigi (TypeScript)
- `migrations/0001_initial.sql`: D1 sema + ornek ihale verisi
- `migrations/0002_admin_permissions.sql`: Rol/yetki tablolari
- `wrangler.toml`: Worker konfigurasyonu

## Kurulum

1. Bagimliliklari kur (wrangler proje icinde kurulu gelir):
```bash
npm install
```

2. Cloudflare login:
```bash
npx wrangler login
```

3. D1 veritabani olustur:
```bash
npx wrangler d1 create acik-teklif-pazari-db
```

4. Olusan `database_id` degerini `wrangler.toml` icine yaz.

5. Migration calistir:
```bash
npx wrangler d1 migrations apply acik-teklif-pazari-db --local
npx wrangler d1 migrations apply acik-teklif-pazari-db --remote
```

6. Session secret ekle:
```bash
npx wrangler secret put SESSION_PEPPER
```

7. Turnstile degerlerini ekle (register/login icin zorunlu):
```bash
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put TURNSTILE_SITE_KEY
```

8. E-posta dogrulama zorunlulugunu ayarla:
```bash
# false: mail dogrulama olmadan teklif verilebilir
# true : teklif icin e-posta dogrulama gerekir
```
`wrangler.toml` icindeki `REQUIRE_EMAIL_VERIFICATION` degerini ihtiyaca gore guncelleyin.

9. Ilk admin kullanicilarini tanimla (opsiyonel ama onerilir):
```toml
[vars]
ADMIN_EMAILS = "admin@ornek.com, ikinciadmin@ornek.com"
```
Bu listedeki e-postalar ilk giriste otomatik `admin` rolu alir.

Opsiyonel bootstrap admin (ilk hesap otomatik olusturma):
```toml
[vars]
ADMIN_BOOTSTRAP_EMAIL = "admin@ornek.com"
ADMIN_BOOTSTRAP_PASSWORD = "guclu-bir-sifre"
```
Bu alanlar doluysa login istegi sirasinda hesap yoksa olusturulur ve admin rolu verilir.

10. Frontend TS derle:
```bash
npm run build
```

11. Lokal calistir:
```bash
npx wrangler dev
```

12. Deploy:
```bash
npm run deploy
```

## Gercek Calisma Kontrol Listesi

- `SESSION_PEPPER` tanimli olmali (`wrangler secret put SESSION_PEPPER`)
- `TURNSTILE_SITE_KEY` ve `TURNSTILE_SECRET` tanimli olmali
- D1 migration'lari remote ortama uygulanmis olmali
- `ENVIRONMENT=production` olmali
- `EMAIL_WEBHOOK_URL` (ve opsiyonel `EMAIL_FROM`) tanimli olmali
- Cloudflare Workers Builds, `main` pushlarinda deploy edecek sekilde bagli olmali

## Turnstile Notu

- Frontend site key degerini `/api/config` endpointinden alir.
- `TURNSTILE_SECRET` veya `TURNSTILE_SITE_KEY` eksikse register/login endpointleri 500 doner.
- Lokal test icin `.dev.vars` ve `.dev.vars.example` icinde Cloudflare test key'leri bulunur.

## Uretim Notlari

- `ENVIRONMENT=production` disinda dogrulama/reset tokenlari debug amacli API cevabinda donebilir.
- Uretimde mutlaka gercek e-posta servisi (`EMAIL_WEBHOOK_URL`) baglayin.
