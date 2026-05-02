# Acik Teklif Pazari (Cloudflare + D1)

Bu proje statik arayuzun yaninda Cloudflare Worker + D1 ile calisan uyelik ve teklif API'si icerir.

## Ozellikler

- Uyelik: `/api/auth/register`
- Giris/Cikis: `/api/auth/login`, `/api/auth/logout`
- Oturum yonetimi: `HttpOnly + Secure cookie`
- E-posta dogrulama akisi
- Sifre sifirlama akisi
- Sadece dogrulanmis uyelerin teklif verebilmesi: `/api/bids`
- Basit rate limiting (D1 tabanli)
- Turnstile captcha korumasi (register/login icin zorunlu)

## Dizin Yapisi

- `public/index.html`, `public/styles.css`, `public/script.js`: Frontend (yayinda kullanilan statik dosyalar)
- `src/worker.js`: API ve auth mantigi
- `migrations/0001_initial.sql`: D1 sema + ornek ihale verisi
- `wrangler.toml`: Worker konfigurasyonu

## Kurulum

1. Wrangler kur:
```bash
npm install --save-dev wrangler@4
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

8. Lokal calistir:
```bash
npx wrangler dev
```

9. Deploy:
```bash
npx wrangler deploy
```

## Turnstile Notu

- Frontend site key degerini `/api/config` endpointinden alir.
- `TURNSTILE_SECRET` veya `TURNSTILE_SITE_KEY` eksikse register/login endpointleri 500 doner.
- Lokal test icin `.dev.vars` ve `.dev.vars.example` icinde Cloudflare test key'leri bulunur.

## Uretim Notlari

- `ENVIRONMENT=production` disinda dogrulama/reset tokenlari debug amacli API cevabinda donebilir.
- Uretimde mutlaka gercek e-posta servisi (`EMAIL_WEBHOOK_URL`) baglayin.
