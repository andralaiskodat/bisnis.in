# Setup Supabase untuk Dibisnis.IN

## Langkah 1 — Buat Project Supabase

1. Login ke https://supabase.com dan buat **New Project**
2. Catat: **Project Name**, **Database Password**, **Region**

---

## Langkah 2 — Ambil Connection String

1. Buka **Settings → Database** di dashboard Supabase
2. Scroll ke bagian **"Connection string"**
3. Pilih tab **"Transaction"** → copy URL → paste ke `DATABASE_URL` di `.env`
4. Pilih tab **"Session"** → copy URL → paste ke `DIRECT_URL` di `.env`

> ⚠️ Ganti `[YOUR-PASSWORD]` dengan password database Anda di kedua URL tersebut.

Contoh isian `.env`:
```env
DATABASE_URL="postgresql://postgres.abcxyzref:MyPassword123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.abcxyzref:MyPassword123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

---

## Langkah 3 — Push Schema & Seed Data

Setelah `.env` diisi, jalankan di terminal:

```bash
# Push schema ke Supabase
npm run db:push

# Isi data dummy (users, produk, transaksi)
npm run db:seed
```

---

## Langkah 4 — Jalankan Aplikasi

```bash
npm run dev
```

Buka http://localhost:3000

---

## Akun Demo

| Role       | Email                       | Password  |
|------------|-----------------------------|-----------|
| Super Admin | admin@dibisnis.in           | admin123  |
| Owner 1    | owner@busari.com            | admin123  |
| Kasir 1    | kasir@busari.com            | admin123  |
| Owner 2    | owner@kopinusantara.com     | admin123  |
| Kasir 2    | kasir@kopinusantara.com     | admin123  |

---

## Storefront Publik (tanpa login)

- http://localhost:3000/warung/warung-bu-sari
- http://localhost:3000/warung/kafe-kopi-nusantara
