# Açık Teklif Pazarı (Cloudflare + D1)

Bu proje artık sadece statik arayüz değil; `Cloudflare Worker + D1` ile gerçek üyelik ve teklif API'si içerir.

## Eklenen Özellikler

- Üyelik (`/api/auth/register`)
- Giriş/çıkış (`/api/auth/login`, `/api/auth/logout`)
- Oturum yönetimi (`HttpOnly + Secure cookie`)
- E-posta doğrulama akışı
- Şifre sıfırlama akışı
- Sadece doğrulanmış üyelerin teklif verebilmesi (`/api/bids`)
- Basit rate limiting (D1 tabanlı)
- Turnstile desteği (register/login ve hassas endpoint koruması)
- E-posta outbox kaydı (`email_outbox`)

## Dizin Yapısı

- `public/index.html`, `public/styles.css`, `public/script.js`: Frontend (yayınlanan statik dosyalar)
- `src/worker.js`: API ve auth mantığı
- `migrations/0001_initial.sql`: D1 şema + örnek ihale verisi
- `wrangler.toml`: Worker konfigürasyonu

## Kurulum

1. Wrangler kur:
```bash
npm install -g wrangler@3.112.0
```

2. Cloudflare login:
```bash
wrangler login
```

3. D1 veritabanı oluştur:
```bash
wrangler d1 create acik-teklif-pazari-db
```

4. Çıkan `database_id` değerini `wrangler.toml` içine yaz:
```toml
[[d1_databases]]
binding = "DB"
database_name = "acik-teklif-pazari-db"
database_id = "BURAYA_D1_ID"
```

5. Migration çalıştır:
```bash
wrangler d1 migrations apply acik-teklif-pazari-db --local
wrangler d1 migrations apply acik-teklif-pazari-db --remote
```

Node 20 + Wrangler v3 ile stabil lokal D1 geliştirme için:
```bash
wrangler d1 migrations apply acik-teklif-pazari-db --local --persist-to %TEMP%\\wrangler-persist
```

6. Session secret gir:
```bash
wrangler secret put SESSION_PEPPER
```

7. (Opsiyonel) E-posta webhook:
```bash
wrangler secret put EMAIL_WEBHOOK_URL
```

8. (Opsiyonel ama önerilen) Turnstile secret ekle:
```bash
wrangler secret put TURNSTILE_SECRET
```

9. `index.html` içindeki `<meta name="turnstile-site-key" ...>` alanına Turnstile site key yaz.

10. Lokal geliştirme:
```bash
wrangler dev
```

Node 20 + Wrangler v3 kullanıyorsanız şu komut daha stabil çalışır:
```bash
wrangler dev --local --persist-to %TEMP%\\wrangler-persist
```

11. Deploy:
```bash
wrangler deploy
```

## Önemli Notlar

- `ENVIRONMENT=production` olmadığı sürece doğrulama/reset tokenları debug amaçlı API cevabında döner.
- Production'da `ENVIRONMENT=production` tanımlayın.
- Production'da mutlaka gerçek e-posta servisiniz için `EMAIL_WEBHOOK_URL` ekleyin.
- Turnstile zorunluluğu, yalnızca `TURNSTILE_SECRET` tanımlıysa aktif olur.
