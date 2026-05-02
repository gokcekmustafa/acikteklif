PRAGMA foreign_keys = ON;

ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'USER';

ALTER TABLE auctions ADD COLUMN product_group TEXT NOT NULL DEFAULT 'Genel';
ALTER TABLE auctions ADD COLUMN category TEXT NOT NULL DEFAULT 'Genel';
ALTER TABLE auctions ADD COLUMN city TEXT NOT NULL DEFAULT 'Belirtilmemis';
ALTER TABLE auctions ADD COLUMN district TEXT NOT NULL DEFAULT '-';
ALTER TABLE auctions ADD COLUMN neighborhood TEXT NOT NULL DEFAULT '-';
ALTER TABLE auctions ADD COLUMN image_url TEXT;
ALTER TABLE auctions ADD COLUMN is_new INTEGER NOT NULL DEFAULT 0;
ALTER TABLE auctions ADD COLUMN is_opportunity INTEGER NOT NULL DEFAULT 0;
ALTER TABLE auctions ADD COLUMN price_dropped INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_auctions_category ON auctions(category);
CREATE INDEX IF NOT EXISTS idx_auctions_product_group ON auctions(product_group);

UPDATE auctions
SET
  product_group = CASE lot_no
    WHEN '34AT001' THEN 'Vasita'
    WHEN '34AT002' THEN 'Vasita'
    WHEN '06AT103' THEN 'Vasita'
    WHEN '35AT044' THEN 'Elektronik'
    WHEN '16AT211' THEN 'Ofis Ekipmanlari'
    WHEN '34AT330' THEN 'Sanayi Ekipmanlari'
    WHEN '07AT510' THEN 'Gayrimenkul'
    WHEN '34AT777' THEN 'Beyaz Esya'
    ELSE product_group
  END,
  category = CASE lot_no
    WHEN '34AT001' THEN 'Otomotiv'
    WHEN '34AT002' THEN 'Ticari Arac'
    WHEN '06AT103' THEN 'SUV'
    WHEN '35AT044' THEN 'Bilgisayar'
    WHEN '16AT211' THEN 'Mobilya'
    WHEN '34AT330' THEN 'Depo'
    WHEN '07AT510' THEN 'Konut'
    WHEN '34AT777' THEN 'Toplu Urun'
    ELSE category
  END,
  city = CASE lot_no
    WHEN '34AT001' THEN 'Istanbul'
    WHEN '34AT002' THEN 'Ankara'
    WHEN '06AT103' THEN 'Ankara'
    WHEN '35AT044' THEN 'Izmir'
    WHEN '16AT211' THEN 'Bursa'
    WHEN '34AT330' THEN 'Istanbul'
    WHEN '07AT510' THEN 'Antalya'
    WHEN '34AT777' THEN 'Istanbul'
    ELSE city
  END,
  district = CASE lot_no
    WHEN '34AT001' THEN 'Umraniye'
    WHEN '34AT002' THEN 'Cubuk'
    WHEN '06AT103' THEN 'Yenimahalle'
    WHEN '35AT044' THEN 'Bornova'
    WHEN '16AT211' THEN 'Nilufer'
    WHEN '34AT330' THEN 'Tuzla'
    WHEN '07AT510' THEN 'Muratpasa'
    WHEN '34AT777' THEN 'Kagithane'
    ELSE district
  END,
  neighborhood = CASE lot_no
    WHEN '34AT001' THEN 'Finans Mah.'
    WHEN '34AT002' THEN 'Cumhuriyet Mah.'
    WHEN '06AT103' THEN 'Camlica Mah.'
    WHEN '35AT044' THEN 'Kazimdirik Mah.'
    WHEN '16AT211' THEN 'Odunluk Mah.'
    WHEN '34AT330' THEN 'Aydinli Mah.'
    WHEN '07AT510' THEN 'Lara Mah.'
    WHEN '34AT777' THEN 'Merkez Mah.'
    ELSE neighborhood
  END,
  image_url = CASE lot_no
    WHEN '34AT001' THEN 'https://images.unsplash.com/photo-1549925862-990bcf84c6f0?auto=format&fit=crop&w=900&q=80'
    WHEN '34AT002' THEN 'https://images.unsplash.com/photo-1562141961-f18f9c3b4f0f?auto=format&fit=crop&w=900&q=80'
    WHEN '06AT103' THEN 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80'
    WHEN '35AT044' THEN 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80'
    WHEN '16AT211' THEN 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80'
    WHEN '34AT330' THEN 'https://images.unsplash.com/photo-1565799557186-1f8d4fe81694?auto=format&fit=crop&w=900&q=80'
    WHEN '07AT510' THEN 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80'
    WHEN '34AT777' THEN 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80'
    ELSE image_url
  END,
  is_new = CASE lot_no
    WHEN '34AT001' THEN 1
    WHEN '34AT002' THEN 1
    WHEN '35AT044' THEN 1
    WHEN '34AT777' THEN 1
    ELSE 0
  END,
  is_opportunity = CASE lot_no
    WHEN '34AT002' THEN 1
    WHEN '35AT044' THEN 1
    WHEN '16AT211' THEN 1
    WHEN '34AT777' THEN 1
    ELSE 0
  END,
  price_dropped = CASE lot_no
    WHEN '06AT103' THEN 1
    WHEN '35AT044' THEN 1
    WHEN '07AT510' THEN 1
    ELSE 0
  END;

INSERT OR IGNORE INTO categories (id, name, slug, created_at, updated_at) VALUES
  ('cat-otomotiv', 'Otomotiv', 'otomotiv', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-ticari-arac', 'Ticari Arac', 'ticari-arac', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-suv', 'SUV', 'suv', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-bilgisayar', 'Bilgisayar', 'bilgisayar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-mobilya', 'Mobilya', 'mobilya', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-depo', 'Depo', 'depo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-konut', 'Konut', 'konut', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-toplu-urun', 'Toplu Urun', 'toplu-urun', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
