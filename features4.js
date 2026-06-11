/* ================================================================
   ConcertID — features4.js
   1. Setlist.fm API — real-time setlist dari setlist.fm
   2. Notifikasi Konser Baru — badge + panel via Mailchimp
   3. Artikel Tips — popup modal, update tiap Senin
   ================================================================ */

'use strict';

/* ================================================================
   1. SETLIST.FM API
   API Key: yfMDeTqtitq3mYgW-jv9MzYW_7DEXjWPCPVl
   Docs: https://api.setlist.fm/docs/1.0/index.html
   Strategi:
   - Konser PAST → cari setlist aktual dari setlist.fm
   - Konser UPCOMING → tetap pakai data prediksi dari features3.js
   - Cache di localStorage 24 jam agar tidak spam API
   ================================================================ */
const SetlistFM = (() => {
  const API_KEY  = 'yfMDeTqtitq3mYgW-jv9MzYW_7DEXjWPCPVl';
  const CACHE_KEY = 'cid_setlistfm';
  const CACHE_TTL = 86400000; // 24 jam

  // Mapping concert ID → nama artis di setlist.fm (harus sama persis)
  const ARTIST_MAP = {
    'blackpink-deadline-2025':       'BLACKPINK',
    'green-day-jakarta-2025':        'Green Day',
    'ateez-2026':                    'ATEEZ',
    'dream-theater-2026':            'Dream Theater',
    'mcr-hammersonic-2026':          'My Chemical Romance',
    'laufey-jakarta-2026':           'Laufey',
    'exo-exhorizon-jakarta-2026':    'EXO',
    'fforever-jakarta-2026':         null,
    'the-neighbourhood-jakarta-2026':'The Neighbourhood',
    'lalala-fest-2026':              null,
    'five-sos-jakarta-2026':         '5 Seconds of Summer',
    'java-jazz-2026':                null,
    'avenged-sevenfold-jakarta-2026':'Avenged Sevenfold',
    'bryan-adams-jakarta-2026':      'Bryan Adams',
    'the-weeknd-jakarta-2026':       'The Weeknd',
    'mcr-jis-2026':                  'My Chemical Romance',
    'bts-jakarta-2026':              'BTS',
    'westlife-jakarta-2027':         'Westlife',
    'one-ok-rock-jakarta-2026':      'ONE OK ROCK',
  };

  function getCache(concertId) {
    try {
      const all = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      const entry = all[concertId];
      if (!entry) return null;
      if (Date.now() - entry.ts > CACHE_TTL) return null;
      return entry.data;
    } catch { return null; }
  }

  function setCache(concertId, data) {
    try {
      const all = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      all[concertId] = { ts: Date.now(), data };
      localStorage.setItem(CACHE_KEY, JSON.stringify(all));
    } catch {}
  }

  async function fetchSetlist(concertId, concert) {
    // Hanya fetch untuk konser yang sudah selesai
    if (!concert || concert.rawDate > new Date()) return null;
    const artistName = ARTIST_MAP[concertId];
    if (!artistName) return null;

    // Cek cache dulu
    const cached = getCache(concertId);
    if (cached) return cached;

    try {
      // Search artis dulu
      const artistRes = await fetch(
        `https://api.setlist.fm/rest/1.0/search/artists?artistName=${encodeURIComponent(artistName)}&p=1&sort=relevance`,
        { headers: { 'x-api-key': API_KEY, 'Accept': 'application/json' } }
      );
      if (!artistRes.ok) return null;
      const artistData = await artistRes.json();
      const artist = artistData.artist?.[0];
      if (!artist) return null;

      // Search setlist di Jakarta / Indonesia
      const year = concert.rawDate.getFullYear();
      const setlistRes = await fetch(
        `https://api.setlist.fm/rest/1.0/artist/${artist.mbid}/setlists?p=1`,
        { headers: { 'x-api-key': API_KEY, 'Accept': 'application/json' } }
      );
      if (!setlistRes.ok) return null;
      const setlistData = await setlistRes.json();

      // Cari setlist yang cocok — Jakarta / Indonesia, tahun yang sesuai
      const setlists = setlistData.setlist || [];
      const match = setlists.find(s => {
        const venueCity    = (s.venue?.city?.name || '').toLowerCase();
        const venueCountry = (s.venue?.city?.country?.code || '').toLowerCase();
        const eventDate    = s.eventDate || '';
        const eventYear    = eventDate ? parseInt(eventDate.split('-')[2]) : 0;
        return (
          (venueCity.includes('jakarta') || venueCountry === 'id') &&
          Math.abs(eventYear - year) <= 1
        );
      });

      if (!match) { setCache(concertId, null); return null; }

      // Flatten semua lagu dari semua set
      const songs = [];
      (match.sets?.set || []).forEach(set => {
        (set.song || []).forEach(song => {
          if (song.name) songs.push(song.name);
        });
      });

      if (!songs.length) { setCache(concertId, null); return null; }

      const result = {
        songs,
        date:   match.eventDate,
        venue:  match.venue?.name || '',
        city:   match.venue?.city?.name || '',
        url:    match.url || '',
        source: 'setlist.fm',
      };
      setCache(concertId, result);
      return result;

    } catch (err) {
      console.warn('[SetlistFM]', err);
      return null;
    }
  }

  async function renderLive(concertId, concert) {
    const data = await fetchSetlist(concertId, concert);
    if (!data || !data.songs.length) return '';

    return `
      <div class="setlist-section setlist-live">
        <div class="setlist-header">
          <h4>🎶 Setlist Aktual</h4>
          <span class="setlist-badge setlist-actual">Live · setlist.fm ✅</span>
        </div>
        <p class="setlist-source">📊 ${data.venue}${data.city ? ', ' + data.city : ''} · ${data.date || ''}
          ${data.url ? `· <a href="${data.url}" target="_blank" rel="noopener" style="color:var(--accent);">Lihat di setlist.fm ↗</a>` : ''}
        </p>
        <ol class="setlist-list">
          ${data.songs.map((s, i) => `
            <li class="setlist-item">
              <span class="setlist-num">${i + 1}</span>
              <span class="setlist-song">${s}</span>
            </li>`).join('')}
        </ol>
      </div>`;
  }

  return { renderLive, fetchSetlist };
})();
window.SetlistFM = SetlistFM;


/* ================================================================
   2. NOTIFIKASI KONSER BARU
   - Badge "BARU" di card konser yang ditambahkan < 7 hari
   - Tombol lonceng di navbar → panel daftar konser baru
   - Mailchimp: link ke campaign manual (tidak otomatis)
   ================================================================ */
const NewConcertNotif = (() => {
  const KEY_SEEN  = 'cid_seen_concerts';
  const KEY_TS    = 'cid_first_seen';

  function getSeenIds() {
    try { return new Set(JSON.parse(localStorage.getItem(KEY_SEEN) || '[]')); } catch { return new Set(); }
  }
  function saveSeenIds(s) { try { localStorage.setItem(KEY_SEEN, JSON.stringify([...s])); } catch {} }

  function getFirstSeen() {
    try { return JSON.parse(localStorage.getItem(KEY_TS) || '{}'); } catch { return {}; }
  }
  function saveFirstSeen(d) { try { localStorage.setItem(KEY_TS, JSON.stringify(d)); } catch {} }

  // Tandai semua konser yang ada sekarang sebagai "sudah dilihat"
  function markAllSeen() {
    if (typeof CONCERTS === 'undefined') return;
    const seen      = getSeenIds();
    const firstSeen = getFirstSeen();
    const now       = Date.now();
    CONCERTS.forEach(c => {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        firstSeen[c.id] = now;
      }
    });
    saveSeenIds(seen);
    saveFirstSeen(firstSeen);
  }

  // Cek konser mana yang baru (firstSeen < 7 hari)
  function getNewConcerts() {
    if (typeof CONCERTS === 'undefined') return [];
    const firstSeen = getFirstSeen();
    const now       = Date.now();
    const WEEK      = 7 * 86400000;
    return CONCERTS.filter(c => {
      const ts = firstSeen[c.id];
      return ts && (now - ts) < WEEK;
    });
  }

  function getUnseenCount() {
    return getNewConcerts().length;
  }

  function isNew(concertId) {
    const firstSeen = getFirstSeen();
    const ts = firstSeen[concertId];
    if (!ts) return false;
    return (Date.now() - ts) < 7 * 86400000;
  }

  function updateNavBadge() {
    const badge = document.getElementById('newConcertBadge');
    const count = getUnseenCount();
    if (!badge) return;
    if (count > 0) {
      badge.textContent    = count;
      badge.style.display  = 'inline-flex';
    } else {
      badge.style.display  = 'none';
    }
  }

  function applyNewBadgesToCards() {
    if (typeof CONCERTS === 'undefined') return;
    CONCERTS.forEach(c => {
      if (!isNew(c.id)) return;
      document.querySelectorAll(`.concert-card[onclick*="${c.id}"]`).forEach(card => {
        if (!card.querySelector('.badge-new-concert')) {
          const badge = document.createElement('span');
          badge.className   = 'badge-new-concert';
          badge.textContent = '🆕 Baru';
          const badges = card.querySelector('.card-badges');
          if (badges) badges.appendChild(badge);
        }
      });
    });
  }

  function openPanel() {
    const newConcerts = getNewConcerts();

    let overlay = document.getElementById('newConcertOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id        = 'newConcertOverlay';
      overlay.className = 'ha-overlay';
      overlay.onclick   = e => { if (e.target === overlay) closePanel(); };
      document.body.appendChild(overlay);
    }

    const items = newConcerts.length
      ? newConcerts.map(c => `
          <div class="ha-item" style="cursor:pointer" onclick="openModal('${c.id}');NewConcertNotif.closePanel()">
            <div class="ha-item-left">
              <span class="ha-budget">${c.emoji} ${c.artist}</span>
              <span class="ha-match">${c.dates[0]} · ${c.confirmStatus === 'confirmed' ? '✅ Confirmed' : '🔮 Rumor'}</span>
            </div>
            <span style="font-size:0.72rem;color:#c084fc;flex-shrink:0;">Lihat →</span>
          </div>`).join('')
      : `<div class="ha-empty">Tidak ada konser baru dalam 7 hari terakhir.</div>`;

    overlay.innerHTML = `
      <div class="ha-panel">
        <div class="ha-panel-header">
          <h4>🆕 Konser Baru (7 hari terakhir)</h4>
          <button class="ha-close" onclick="NewConcertNotif.closePanel()">✕</button>
        </div>
        <p class="ha-desc">Konser yang baru ditambahkan ke ConcertID.</p>
        <div class="ha-list">${items}</div>
        <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);text-align:center;">
          <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:8px;">Mau dapat notifikasi email saat ada konser baru?</p>
          <button onclick="NewConcertNotif.closePanel();document.querySelector('.newsletter-section')?.scrollIntoView({behavior:'smooth'})"
            style="font-size:0.8rem;padding:7px 16px;border-radius:99px;border:1px solid rgba(168,85,247,0.3);background:rgba(168,85,247,0.1);color:#c084fc;cursor:pointer;font-family:var(--font);font-weight:600;">
            📧 Subscribe Newsletter
          </button>
        </div>
      </div>`;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    const overlay = document.getElementById('newConcertOverlay');
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  return { markAllSeen, getNewConcerts, isNew, updateNavBadge, applyNewBadgesToCards, openPanel, closePanel, getUnseenCount };
})();
window.NewConcertNotif = NewConcertNotif;


/* ================================================================
   3. ARTIKEL TIPS — popup modal, update tiap Senin
   Konten ditulis manual tiap minggu, sistem popup otomatis
   ================================================================ */
const TipsArticle = (() => {
  const KEY_READ = 'cid_tips_read'; // { weekKey: boolean }

  // Dapat week key dari tanggal Senin terdekat sebelumnya
  function getCurrentWeekKey() {
    const now  = new Date();
    const day  = now.getDay(); // 0=Sun, 1=Mon...
    const diff = day === 0 ? -6 : 1 - day; // mundur ke Senin
    const mon  = new Date(now);
    mon.setDate(now.getDate() + diff);
    return `${mon.getFullYear()}-W${String(Math.ceil((mon.getDate() - 1) / 7) + 1).padStart(2,'0')}`;
  }

  function isRead() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY_READ) || '{}');
      return !!data[getCurrentWeekKey()];
    } catch { return false; }
  }

  function markRead() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY_READ) || '{}');
      data[getCurrentWeekKey()] = true;
      localStorage.setItem(KEY_READ, JSON.stringify(data));
    } catch {}
  }

  // ── KONTEN ARTIKEL ──
  // Update bagian ini tiap Senin dengan artikel baru
  // Format: { weekKey, title, emoji, readTime, content (HTML) }
  const ARTICLES = [

    {
      weekKey: '2026-W24', // Senin 8 Juni 2026
      title:   'Trik & Tips War Tiket Konser: Panduan Lengkap Agar Tidak Gagal',
      emoji:   '🎫',
      readTime: '5 menit',
      content: `
        <p class="tips-intro">War tiket konser bisa jadi pengalaman yang menegangkan. Dengan ribuan orang berebut tiket di waktu yang sama, persiapan matang adalah kunci utama. Ini panduan lengkapnya:</p>

        <div class="tips-section">
          <h3>⚡ H-7: Persiapan Teknis</h3>
          <ul class="tips-list">
            <li><strong>Buat akun di platform tiket</strong> (tiket.com, Loket.com, TIX.ID) jauh-jauh hari. Jangan buat akun baru saat war!</li>
            <li><strong>Simpan data pembayaran</strong> — kartu kredit/debit atau e-wallet sudah terhubung dan saldo cukup</li>
            <li><strong>Catat tanggal & jam sale</strong> di calendar dengan alarm 30 menit sebelumnya</li>
            <li><strong>Screenshot halaman konser</strong> — bisa membantu navigasi lebih cepat saat web lambat</li>
          </ul>
        </div>

        <div class="tips-section">
          <h3>💻 H-1: Siapkan Device</h3>
          <ul class="tips-list">
            <li><strong>Gunakan laptop + HP sekaligus</strong> — buka di 2 device untuk backup</li>
            <li><strong>Bersihkan cache browser</strong> dan pastikan browser up-to-date</li>
            <li><strong>Nonaktifkan VPN</strong> — bisa memperlambat koneksi atau terdeteksi sebagai bot</li>
            <li><strong>Siapkan koneksi internet cadangan</strong> (hotspot HP sebagai backup WiFi)</li>
            <li><strong>Charge semua device</strong> hingga 100%</li>
          </ul>
        </div>

        <div class="tips-section">
          <h3>⏰ Saat War Dimulai</h3>
          <ul class="tips-list">
            <li><strong>Buka halaman tiket 5-10 menit sebelum sale</strong> dan refresh setiap 30 detik</li>
            <li><strong>Jangan refresh terlalu cepat</strong> — bisa kena rate limit dan diblokir sementara</li>
            <li><strong>Pilih kategori tiket lebih murah</strong> sebagai backup jika kategori utama habis</li>
            <li><strong>Jangan terlalu lama memilih kursi</strong> — ada timer! Putuskan dalam 3 menit</li>
            <li><strong>Segera checkout & bayar</strong> — tiket bisa diambil orang lain selama belum bayar</li>
          </ul>
        </div>

        <div class="tips-section">
          <h3>💳 Tips Pembayaran</h3>
          <ul class="tips-list">
            <li><strong>Bayar dengan GoPay/OVO/Dana</strong> — lebih cepat dari transfer bank</li>
            <li><strong>Aktifkan autofill</strong> di browser untuk isi data kartu otomatis</li>
            <li><strong>Hindari transfer bank manual</strong> saat war — terlalu lambat</li>
            <li><strong>Pastikan limit kartu mencukupi</strong> — naikkan limit H-3 jika perlu</li>
          </ul>
        </div>

        <div class="tips-section">
          <h3>🚫 Yang Harus Dihindari</h3>
          <ul class="tips-list">
            <li>❌ <strong>Jangan beli dari calo</strong> — harga bisa 3-5x lipat dan risiko tiket palsu</li>
            <li>❌ <strong>Jangan pakai bot/script</strong> — bisa kena banned permanent dari platform</li>
            <li>❌ <strong>Jangan pakai WiFi publik</strong> — lambat dan tidak aman</li>
            <li>❌ <strong>Jangan tunda keputusan</strong> — tiket bisa habis dalam hitungan detik</li>
          </ul>
        </div>

        <div class="tips-section">
          <h3>🤝 Strategi Grup</h3>
          <ul class="tips-list">
            <li><strong>Bagi tugas dengan teman</strong> — 1 orang fokus 1 kategori tiket</li>
            <li><strong>Komunikasi via WA/Telegram</strong> real-time selama war berlangsung</li>
            <li><strong>Tentukan "PIC pembayaran"</strong> — orang yang paling cepat transaksi</li>
            <li><strong>Beli max tiket per transaksi</strong> untuk efisiensi waktu</li>
          </ul>
        </div>

        <div class="tips-highlight">
          💡 <strong>Pro Tip:</strong> Daftarkan email di newsletter ConcertID untuk dapat notifikasi pertama saat tiket baru dibuka!
        </div>
      `,
    },

    {
      weekKey: '2026-W25', // Senin 15 Juni 2026
      title:   'Panduan Lengkap Venue Konser di Jakarta: Kapasitas, Fasilitas & Tips',
      emoji:   '🏟️',
      readTime: '4 menit',
      content: `
        <p class="tips-intro">Mengenal venue konser sebelum hari-H bisa membuat pengalaman kamu jauh lebih menyenangkan. Ini panduan lengkap venue-venue utama di Jakarta:</p>

        <div class="tips-section">
          <h3>🏟️ Gelora Bung Karno (GBK) Utama</h3>
          <ul class="tips-list">
            <li><strong>Kapasitas:</strong> ~80.000 penonton</li>
            <li><strong>Transportasi:</strong> MRT Senayan, TransJakarta Blok M-Kota</li>
            <li><strong>Parkir:</strong> Terbatas — sangat disarankan naik transportasi umum</li>
            <li><strong>Tips:</strong> Datang minimal 2 jam sebelum show, antrian gate bisa sangat panjang</li>
          </ul>
        </div>

        <div class="tips-section">
          <h3>🏛️ Jakarta International Stadium (JIS)</h3>
          <ul class="tips-list">
            <li><strong>Kapasitas:</strong> ~82.000 penonton</li>
            <li><strong>Transportasi:</strong> TransJakarta koridor 7, Ancol Exit Tol</li>
            <li><strong>Tips:</strong> Area sekitar belum seramai GBK, makan/minum di luar venue lebih murah</li>
          </ul>
        </div>

        <div class="tips-section">
          <h3>🎪 Indonesia Arena GBK</h3>
          <ul class="tips-list">
            <li><strong>Kapasitas:</strong> ~16.000 (indoor)</li>
            <li><strong>Transportasi:</strong> MRT Senayan</li>
            <li><strong>Tips:</strong> Indoor AC — bawa jaket tipis, bisa dingin di bagian tribune atas</li>
          </ul>
        </div>

        <div class="tips-section">
          <h3>📦 ICE BSD City</h3>
          <ul class="tips-list">
            <li><strong>Kapasitas:</strong> 10.000-20.000 (tergantung konfigurasi)</li>
            <li><strong>Transportasi:</strong> Commuter Line BSD, Tol BSD Exit 2</li>
            <li><strong>Tips:</strong> Banyak pilihan makan di sekitar BSD — manfaatkan untuk pre/post concert dinner</li>
          </ul>
        </div>

        <div class="tips-highlight">
          💡 <strong>Tips Universal:</strong> Selalu bawa power bank, ear plug (untuk standing depan), dan uang cash secukupnya!
        </div>
      `,
    },

    {
      weekKey: '2026-W26', // Senin 22 Juni 2026
      title:   'Cara Aman Jual Beli Tiket Konser Bekas: Hindari Penipuan',
      emoji:   '🛡️',
      readTime: '4 menit',
      content: `
        <p class="tips-intro">Resell tiket konser sudah jadi hal umum, tapi juga ladang penipuan. Ini cara aman melakukannya — baik sebagai penjual maupun pembeli:</p>

        <div class="tips-section">
          <h3>✅ Sebagai Pembeli</h3>
          <ul class="tips-list">
            <li><strong>Minta foto tiket fisik/e-ticket</strong> beserta KTP penjual</li>
            <li><strong>Cek nomor barcode</strong> — pastikan bisa di-scan dan valid di website promotor</li>
            <li><strong>Jangan transfer dulu sebelum tiket dikirim</strong> — gunakan rekening bersama jika memungkinkan</li>
            <li><strong>Meet offline di tempat ramai</strong> untuk transaksi tiket fisik</li>
            <li><strong>Cek profil sosmed penjual</strong> — akun lama dengan aktivitas nyata lebih terpercaya</li>
          </ul>
        </div>

        <div class="tips-section">
          <h3>💰 Sebagai Penjual</h3>
          <ul class="tips-list">
            <li><strong>Jual di harga wajar</strong> — terlalu tinggi susah laku, terlalu murah dicurigai palsu</li>
            <li><strong>Posting di forum resmi</strong> seperti Cari Teman Nonton di ConcertID ini</li>
            <li><strong>Jangan kirim tiket sebelum pembayaran clear</strong></li>
            <li><strong>Simpan bukti transaksi</strong> dan komunikasi sebagai perlindungan</li>
          </ul>
        </div>

        <div class="tips-section">
          <h3>🚨 Red Flags Penipuan</h3>
          <ul class="tips-list">
            <li>❌ Harga jauh di bawah harga asli tanpa alasan jelas</li>
            <li>❌ Penjual minta DP dulu baru kirim tiket</li>
            <li>❌ Foto tiket buram atau ada tanda editan</li>
            <li>❌ Tidak mau video call untuk verifikasi tiket</li>
            <li>❌ Minta transfer ke rekening orang lain</li>
          </ul>
        </div>

        <div class="tips-highlight">
          💡 <strong>Ingat:</strong> Platform ConcertID tidak bertanggung jawab atas transaksi. Selalu verifikasi sendiri sebelum transfer!
        </div>
      `,
    },

  ];

  function getCurrentArticle() {
    const weekKey = getCurrentWeekKey();
    // Cari artikel minggu ini, fallback ke artikel terbaru
    return ARTICLES.find(a => a.weekKey === weekKey) || ARTICLES[ARTICLES.length - 1];
  }

  function openPopup(forceOpen = false) {
    if (!forceOpen && isRead()) return;
    const article = getCurrentArticle();
    if (!article) return;

    let overlay = document.getElementById('tipsOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id        = 'tipsOverlay';
      overlay.className = 'modal-overlay';
      overlay.style.cssText = 'z-index:1200;';
      overlay.onclick = e => { if (e.target === overlay) closePopup(); };
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="modal tips-modal">
        <button class="modal-close" onclick="TipsArticle.closePopup()">✕</button>
        <div class="modal-content tips-modal-content">
          <div class="tips-header">
            <span class="tips-emoji">${article.emoji}</span>
            <div class="tips-meta">
              <span class="tips-tag">📰 Artikel Mingguan</span>
              <span class="tips-readtime">⏱ ${article.readTime}</span>
            </div>
            <h2 class="tips-title">${article.title}</h2>
          </div>
          <div class="tips-body">${article.content}</div>
          <div class="tips-footer">
            <button class="tips-btn-close" onclick="TipsArticle.closePopup()">
              Oke, sudah baca! ✓
            </button>
            <span class="tips-week">Update tiap Senin · ${article.weekKey}</span>
          </div>
        </div>
      </div>`;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    markRead();
  }

  function closePopup() {
    const overlay = document.getElementById('tipsOverlay');
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  return { openPopup, closePopup, getCurrentArticle, isRead };
})();
window.TipsArticle = TipsArticle;


/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // ── 1. Tombol konser baru di navbar ──
  const navCta = document.querySelector('.nav-cta');
  if (navCta) {
    const newBtn = document.createElement('button');
    newBtn.className   = 'theme-toggle';
    newBtn.title       = 'Konser Baru';
    newBtn.style.cssText = 'position:relative;';
    newBtn.onclick     = () => NewConcertNotif.openPanel();
    newBtn.innerHTML   = `🆕<span class="ha-badge" id="newConcertBadge" style="display:none"></span>`;
    navCta.insertBefore(newBtn, navCta.firstChild);
  }

  // ── 2. Tombol Tips di navbar ──
  if (navCta) {
    const tipsBtn = document.createElement('button');
    tipsBtn.className   = 'theme-toggle';
    tipsBtn.title       = 'Tips & Trik Konser';
    tipsBtn.onclick     = () => TipsArticle.openPopup(true);
    tipsBtn.innerHTML   = `📰`;
    navCta.insertBefore(tipsBtn, navCta.firstChild);
  }

  // ── 3. Init new concert notif ──
  NewConcertNotif.markAllSeen();
  setTimeout(() => {
    NewConcertNotif.applyNewBadgesToCards();
    NewConcertNotif.updateNavBadge();
  }, 700);

  // ── 4. Auto-popup artikel tips (sekali per minggu) ──
  setTimeout(() => {
    if (!TipsArticle.isRead()) TipsArticle.openPopup();
  }, 4000);

  // ── 5. Patch openModal untuk inject Setlist.fm ──
  const _prevF4 = window.openModal;
  if (typeof _prevF4 === 'function') {
    window.openModal = function(id) {
      _prevF4(id);
      const c = typeof CONCERTS !== 'undefined' ? CONCERTS.find(x => x.id === id) : null;
      if (!c || c.rawDate > new Date()) return; // hanya untuk konser past

      // Coba fetch setlist.fm dan replace setlist jika berhasil
      SetlistFM.renderLive(id, c).then(liveHtml => {
        if (!liveHtml) return;
        const modal = document.getElementById('modalContent');
        if (!modal) return;
        // Ganti setlist yang sudah ada (dari features3.js) dengan data live
        const existing = modal.querySelector('.setlist-section');
        if (existing) {
          existing.outerHTML = liveHtml;
        } else {
          // Inject sebelum ticket area jika belum ada
          const anchor = modal.querySelector('.modal-ticket-area');
          if (anchor) {
            const el = document.createElement('div');
            el.innerHTML = liveHtml;
            anchor.insertAdjacentElement('beforebegin', el.firstElementChild || el);
          }
        }
      });
    };
  }
});
