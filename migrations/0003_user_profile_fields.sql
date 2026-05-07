PRAGMA foreign_keys = ON;

ALTER TABLE users ADD COLUMN tc_identity_no TEXT;
ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN address TEXT;
