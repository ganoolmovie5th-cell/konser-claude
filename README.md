# 🎵 ConcertID — Jadwal Konser Internasional di Indonesia

> Sumber informasi terpercaya untuk jadwal konser musisi internasional di Indonesia 2025–2027.  
> Lengkap dengan label **Confirmed ✅** vs **Rumor 🔮** agar kamu tidak tertipu.

🌐 **Live:** [list-concert-tour.web.id](https://www.list-concert-tour.web.id)

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|---|---|
| 🗓️ Jadwal Lengkap | Data konser 2025–2027: artis, tanggal, venue, jam, dan harga tiket |
| ✅ / 🔮 Status | Label jelas **Confirmed** (resmi) vs **Rumor** (belum dikonfirmasi) |
| 🔍 Search & Filter | Cari berdasarkan artis/venue/kota; filter genre, status, dan wishlist |
| 🔍 Advanced Search | Filter harga (slider), bulan, kota/area, dan status konser |
| 💰 Harga Alert | Set budget maksimal — notifikasi saat ada konser yang sesuai |
| ❤️ Wishlist | Simpan konser favorit ke localStorage tanpa perlu akun |
| ⏱️ Countdown | Timer hitung mundur untuk setiap konser mendatang |
| 📤 Share | Share konser via WhatsApp, Telegram, Instagram, atau copy link |
| 🗓️ Google Calendar | Tambah konser langsung ke Google Calendar |
| 🗺️ Venue Maps | Embed Google Maps untuk setiap venue |
| 🎵 Spotify Preview | Preview musik artis langsung di modal detail |
| 🎟️ Going / Interested | Vote kehadiran & ketertarikan per konser |
| ⭐ Review & Rating | Sistem ulasan & rating berbasis localStorage |
| 💬 Diskusi | Komentar publik per konser berbasis localStorage |
| 🛒 Forum Jual Beli Tiket | Listing jual/cari tiket antar fans — kontak via emoji WA, edit & hapus per post |
| 🤝 Cari Teman Nonton | Posting cari teman nonton — kontak WA/IG hanya ditampilkan sebagai ikon |
| 📋 Setlist.fm | Lihat setlist konser sebelumnya via Setlist.fm API |
| 📰 Newsletter | Daftar email untuk update konser terbaru (via Mailchimp) |
| 📬 Kritik & Saran | Form feedback dengan lampiran foto (via EmailJS) |
| 📊 Analytics Dashboard | Dashboard admin untuk melihat engagement |
| 🔄 Auto-monitor Harian | Scraper otomatis via GitHub Actions setiap hari pukul 01:00 WIB |

---

## 🏗️ Struktur Proyek

```
list-concert-tour-claude/
├── index.html          # Halaman utama
├── app.js              # Data konser & logika utama (render, modal, filter, wishlist)
├── style.css           # Styling (dark/light mode, responsive)
├── reviews.js          # Sistem review & rating
├── features.js         # Going/Interested, Sort, Google Calendar, Social Media, Diskusi, UGC
├── features2.js        # Calendar View, Advanced Search, Harga Alert, Spotify Integration
├── features3.js        # Group Buying, Ticket Market, Review Tabs, Kritik & Saran (EmailJS)
├── features4.js        # Setlist.fm, New Concert Notif, Tips & Artikel, Bahasa
├── api/
│   └── subscribe.js    # Vercel Serverless Function — proxy Mailchimp Newsletter
├── analytics.html      # Dashboard analytics (admin only)
├── scraper.py          # Scraper Python untuk monitoring data konser
├── email_reporter.py   # Kirim laporan scraper via Gmail SMTP
├── email-template.html # Template email laporan
├── requirements.txt    # Dependensi Python scraper
├── vercel.json         # Konfigurasi Vercel + CSP headers
├── robots.txt          # Instruksi untuk search engine
├── sitemap.xml         # Sitemap untuk SEO
├── images/             # Foto artis/konser
├── logo.svg            # Logo ConcertID
├── og-image.png        # Open Graph image untuk social share
└── .github/
    └── workflows/
        └── scrape.yml  # GitHub Actions: monitor harian
```

---

## 🚀 Cara Menjalankan Secara Lokal

Proyek ini adalah **static website** murni — tidak butuh build step.

```bash
# Clone repo
git clone https://github.com/ganoolmovie5th-cell/list-concert-tour-claude.git
cd list-concert-tour-claude

# Jalankan dengan server lokal (pilih salah satu)
python3 -m http.server 8080
# atau
npx serve .
```

Buka browser dan akses `http://localhost:8080`.

---

## ⚙️ Environment Variables (Vercel Dashboard)

Setelah deploy ke Vercel, tambahkan di **Settings → Environment Variables**:

| Variable | Keterangan |
|---|---|
| `MAILCHIMP_API_KEY` | API key dari Mailchimp → Account → Extras → API keys |
| `MAILCHIMP_LIST_ID` | Audience ID dari Mailchimp → Audience → Settings |
| `MAILCHIMP_SERVER` | Server prefix saja, contoh `us20` (dari URL: `us20.admin.mailchimp.com`) |

> ⚠️ Isi `MAILCHIMP_SERVER` hanya dengan prefix (contoh: `us20`), **bukan** URL lengkap.

---

## 📧 GitHub Secrets (untuk Scraper Email)

Tambahkan di **Settings → Secrets and variables → Actions**:

| Secret | Keterangan |
|---|---|
| `GMAIL_APP_PASSWORD` | Gmail App Password 16 karakter dari [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) |
| `ADMIN_EMAIL` | Email tujuan laporan, contoh: `listconcerttour@gmail.com` |

---

## 🤖 Auto-Monitor Harian (GitHub Actions)

Scraper berjalan otomatis setiap hari pukul **01:00 WIB** (18:00 UTC).

```
Scraper jalan tiap hari → Scrape 7+ sumber → Generate laporan HTML + JSON
       ↓
Kirim ke email admin → Admin review → Update manual app.js jika valid
```

> Tidak ada auto-push ke repo. `app.js` hanya diubah secara manual setelah review.

**Trigger manual:** Actions → "🎵 Daily Concert Monitor" → Run workflow.

---

## 📬 Setup EmailJS (Kritik & Saran)

Form Kritik & Saran mengirim pesan + foto via [EmailJS](https://emailjs.com).

**Konfigurasi di `features3.js`:**
- Service ID: `service_lq3pvsq`
- Template ID: `template_w8grsoa`
- Public Key: di-init di `index.html`

**Template EmailJS** harus memiliki variabel berikut:
- `{{from_name}}`, `{{from_email}}`, `{{type}}`, `{{message}}`, `{{sent_at}}`
- `{{photo_data}}` — base64 foto murni (tanpa prefix `data:image/...`)

Bagian foto di template EmailJS:
```html
{{#if has_photo}}
<img src="data:image/jpeg;base64,{{photo_data}}"
     style="max-width:500px;width:100%;border-radius:8px;display:block;" />
{{/if}}
```

> ⚠️ Pastikan template sudah di-**Save** setelah mengedit di dashboard EmailJS.

---

## 🎫 Forum Jual Beli Tiket & Cari Teman Nonton

Fitur berbasis `localStorage` — data tersimpan di browser pengunjung.

### Forum Jual Beli Tiket
- Post listing **Jual** atau **Cari** tiket
- Kontak ditampilkan sebagai emoji **💬** (WhatsApp) — nomor tidak diekspos
- Pemilik post bisa: **✓ Tandai Terjual/Ditemukan**, **✏️ Edit**, **🗑️ Hapus**
- Hapus hanya menghapus 1 post spesifik, post lain tetap ada
- Input harga otomatis format ribuan (1.500.000)

### Cari Teman Nonton
- Post untuk cari teman nonton bareng
- Isi No WA dan @Instagram terpisah
- Kontak ditampilkan sebagai emoji **💬** dan **📷** — nomor/username tidak diekspos
- Pemilik post bisa: **✏️ Edit**, **🗑️ Hapus**

---

## 📊 Analytics Dashboard

Akses di `/analytics.html`.

- **Dilindungi password** — default: `ConcertID2026!`
- Menampilkan: klik per konser, wishlist, review stats, distribusi genre/status
- Fitur export: **CSV** dan **JSON**

> ⚠️ Ganti password default sebelum deploy — edit `PASS_HASH` di `analytics.html`.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | HTML5, CSS3 (custom dark/light theme), Vanilla JavaScript |
| Font | Inter + Syne via Google Fonts |
| Analytics | Google Analytics 4 (GA4) |
| Storage | `localStorage` (wishlist, reviews, diskusi, vote, forum) |
| Newsletter | Mailchimp Marketing API v3 (via Vercel Serverless Function) |
| Email | EmailJS (kritik & saran dengan foto) |
| Maps | Google Maps Embed API |
| Music | Spotify Embed, Setlist.fm API |
| Scraper | Python 3.12 + requests + BeautifulSoup4 |
| CI/CD | GitHub Actions |
| Hosting | Vercel |

---

## 📋 Konvensi Data Konser (`app.js`)

```javascript
{
  id: 'unique-concert-id',
  artist: 'Nama Artis',
  tour: 'Nama Tur',
  genre: 'kpop|pop|rock|jazz|indie',
  emoji: '🎵',
  dates: ['DD Bulan YYYY'],
  rawDate: new Date('YYYY-MM-DD'),
  time: 'HH:MM WIB',
  venue: 'Nama Venue',
  city: 'Kota, Provinsi',
  promotor: 'Nama Promotor',
  ticketUrl: 'https://...',
  priceRange: 'Rp X – Rp Y',
  priceMin: 0,
  priceMax: 0,
  ticketCategories: [{ name, price }],
  confirmStatus: 'confirmed|rumor',
  hot: true|false,
  rumorDetail: '...',   // opsional, hanya untuk rumor
  description: '...',
  sources: ['domain1.com'],
  lineup: ['Artis 1'],  // opsional, untuk festival
}
```

---

## 🤝 Kontribusi

Ada konser yang belum masuk atau info yang perlu diperbarui?

1. Fork repo ini
2. Edit data di `app.js`
3. Buat Pull Request dengan deskripsi dan link sumber resmi

---

## ⚠️ Disclaimer

- Selalu verifikasi ke platform resmi sebelum membeli tiket.
- Konser berlabel **🔮 Rumor** belum dikonfirmasi — **jangan beli tiket dari calo!**
- Harga tiket dapat berubah sewaktu-waktu.
- Data di Forum Jual Beli Tiket & Cari Teman Nonton tidak diverifikasi admin — selalu hati-hati.

---

© 2026 ConcertID. Dibuat dengan ❤️ untuk komunitas fans musik Indonesia.
