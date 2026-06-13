/* ================================================================
   ConcertID — features3.js
   1. Multi-bahasa (ID / EN)
   2. Notifikasi Tiket On-Sale
   3. "Sudah Nonton" Badge
   4. Setlist Prediction
   5. Konverter Harga Real-time
   6. Group Buying / Cari Teman Nonton
   ================================================================ */

'use strict';

/* ================================================================
   1. MULTI-BAHASA (ID / EN)
   ================================================================ */
const I18n = (() => {
  const KEY = 'cid_lang';
  let current = (() => { try { return localStorage.getItem(KEY) || 'id'; } catch { return 'id'; } })();

  const T = {
    // Navbar
    nav_concerts:      { id: 'Konser',           en: 'Concerts' },
    nav_upcoming:      { id: 'Mendatang',         en: 'Upcoming' },
    nav_venues:        { id: 'Venue',             en: 'Venues' },
    nav_about:         { id: 'Tentang',           en: 'About' },
    // Hero
    hero_badge:        { id: '🇮🇩 Indonesia 2025 – 2027', en: '🇮🇩 Indonesia 2025 – 2027' },
    hero_title_l1:     { id: 'Semua Konser',      en: 'All Concerts' },
    hero_title_l2:     { id: 'Internasional',     en: 'International' },
    hero_title_l3:     { id: 'di Satu Tempat',    en: 'in One Place' },
    hero_sub:          { id: 'Info lengkap venue, tanggal, jam, dan harga tiket — lengkap dengan label <strong>Confirmed ✅</strong> vs <strong>Rumor 🔮</strong> agar kamu tidak tertipu.', en: 'Full info on venue, date, time, and ticket prices — complete with <strong>Confirmed ✅</strong> vs <strong>Rumor 🔮</strong> labels so you don\'t get scammed.' },
    hero_search:       { id: 'Cari artis, venue, kota...', en: 'Search artist, venue, city...' },
    hero_scroll:       { id: 'Scroll untuk lihat konser', en: 'Scroll to see concerts' },
    hero_stat1:        { id: 'Total Konser',      en: 'Total Concerts' },
    hero_stat2:        { id: '✅ Confirmed',       en: '✅ Confirmed' },
    hero_stat3:        { id: '🔮 Rumor',           en: '🔮 Rumor' },
    // Filter
    filter_all:        { id: 'Semua',             en: 'All' },
    filter_confirmed:  { id: '✅ Confirmed',       en: '✅ Confirmed' },
    filter_rumor:      { id: '🔮 Rumor',           en: '🔮 Rumor' },
    filter_kpop:       { id: 'K-Pop',             en: 'K-Pop' },
    filter_pop:        { id: 'Pop / R&B',          en: 'Pop / R&B' },
    filter_rock:       { id: 'Rock / Metal',       en: 'Rock / Metal' },
    filter_jazz:       { id: 'Jazz',               en: 'Jazz' },
    filter_indie:      { id: 'Indie / Festival',   en: 'Indie / Festival' },
    filter_upcoming:   { id: 'Mendatang',          en: 'Upcoming' },
    filter_past:       { id: 'Sudah Lewat',        en: 'Past' },
    sort_label:        { id: 'Urutkan:',           en: 'Sort:' },
    sort_date_asc:     { id: '📅 Tanggal (Terdekat)', en: '📅 Date (Nearest)' },
    sort_date_desc:    { id: '📅 Tanggal (Terjauh)',  en: '📅 Date (Farthest)' },
    sort_price_asc:    { id: '💰 Harga (Termurah)',   en: '💰 Price (Cheapest)' },
    sort_price_desc:   { id: '💰 Harga (Termahal)',   en: '💰 Price (Most Expensive)' },
    sort_name_asc:     { id: '🔤 Nama Artis (A–Z)',   en: '🔤 Artist Name (A–Z)' },
    // Concerts section
    section_concerts:  { id: 'Jadwal Konser',     en: 'Concert Schedule' },
    section_subtitle:  { id: 'Data dari sumber resmi. ✅ = Confirmed resmi &nbsp;|&nbsp; 🔮 = Rumor / belum dikonfirmasi', en: 'Data from official sources. ✅ = Officially confirmed &nbsp;|&nbsp; 🔮 = Rumor / unconfirmed' },
    section_hot:       { id: '🔥 Paling Ditunggu-tunggu', en: '🔥 Most Anticipated' },
    section_hot_sub:   { id: 'Konser mendatang yang jangan sampai kamu lewatkan', en: "Upcoming concerts you don't want to miss" },
    // Cards
    card_buy:          { id: '🎫 Beli Tiket',      en: '🎫 Buy Ticket' },
    card_buy_now:      { id: '🎫 Beli Tiket Sekarang', en: '🎫 Buy Ticket Now' },
    card_ended:        { id: 'Konser Selesai',     en: 'Concert Ended' },
    card_ended2:       { id: 'Konser Telah Selesai', en: 'Concert Has Ended' },
    card_detail:       { id: 'Detail ›',           en: 'Details ›' },
    card_unconfirmed:  { id: '🔮 Belum Dikonfirmasi', en: '🔮 Unconfirmed' },
    card_monitor:      { id: '🔔 Pantau Info Resmi', en: '🔔 Monitor Official Info' },
    card_rumor_banner: { id: '⚠️ Belum ada pengumuman resmi', en: '⚠️ No official announcement yet' },
    card_price_label:  { id: 'Harga Tiket',        en: 'Ticket Price' },
    card_price_rumor:  { id: '⚠️ Status Harga',    en: '⚠️ Price Status' },
    card_unannounced:  { id: '⚠️ Belum diumumkan', en: '⚠️ Not yet announced' },
    // Legend
    legend_title:      { id: '📖 Panduan Status Konser', en: '📖 Concert Status Guide' },
    legend_confirmed_title: { id: '✅ Confirmed', en: '✅ Confirmed' },
    legend_confirmed_desc:  { id: 'Diumumkan resmi oleh artis, manajemen, atau promotor. Tiket sudah/sedang dijual di platform resmi.', en: 'Officially announced by the artist, management, or promoter. Tickets are already/being sold on official platforms.' },
    legend_rumor_title:     { id: '🔮 Rumor', en: '🔮 Rumor' },
    legend_rumor_desc:      { id: 'Beredar di media sosial atau media hiburan, namun BELUM ada pernyataan resmi. Jangan beli tiket dari calo!', en: 'Circulating on social media or entertainment media, but NO official statement yet. Don\'t buy tickets from scalpers!' },
    legend_past_desc:       { id: 'Konser telah selesai digelar. Data disimpan sebagai referensi historis.', en: 'Concert has been held. Data is stored as historical reference.' },
    // Newsletter
    nl_title:          { id: 'Jangan Ketinggalan Konser!', en: "Don't Miss a Concert!" },
    nl_sub:            { id: 'Daftar gratis dan dapatkan update konser terbaru langsung di inbox kamu.', en: 'Sign up free and get the latest concert updates straight to your inbox.' },
    nl_placeholder:    { id: 'email@kamu.com',     en: 'your@email.com' },
    nl_btn:            { id: 'Daftar Gratis',      en: 'Sign Up Free' },
    // Footer
    footer_tagline:    { id: 'Jadwal konser internasional terlengkap di Indonesia', en: 'The most complete international concert schedule in Indonesia' },
    footer_nav:        { id: 'Navigasi',           en: 'Navigation' },
    footer_all:        { id: 'Semua Konser',       en: 'All Concerts' },
    footer_upcoming:   { id: 'Mendatang',          en: 'Upcoming' },
    footer_about:      { id: 'Tentang Kami',       en: 'About Us' },
    footer_tickets:    { id: 'Tiket Resmi',        en: 'Official Tickets' },
    footer_copy:       { id: '© 2026 ConcertID — Data diupdate berkala. Disclaimer: Selalu verifikasi ke platform resmi. Harga tiket dapat berubah sewaktu-waktu.', en: '© 2026 ConcertID — Data updated regularly. Disclaimer: Always verify with official platforms. Ticket prices may change at any time.' },
    // Venue section
    venues_title:      { id: '📍 Venue Populer',  en: '📍 Popular Venues' },
    venues_sub:        { id: 'Lokasi konser internasional favorit di Indonesia', en: 'Favorite international concert venues in Indonesia' },
    // Upcoming section
    upcoming_scroll:   { id: 'Scroll untuk lihat konser', en: 'Scroll to see concerts' },
    // No result
    no_result:         { id: '😔 Tidak ada konser yang cocok dengan pencarian kamu.', en: '😔 No concerts match your search.' },
  };

  function t(key) {
    const entry = T[key];
    if (!entry) return key;
    return entry[current] || entry['id'];
  }

  function getLang() { return current; }

  function setLang(lang) {
    current = lang;
    try { localStorage.setItem(KEY, lang); } catch {}
    applyAll();
    if (typeof showToast === 'function') {
      showToast(lang === 'en' ? '🌐 Language: English' : '🌐 Bahasa: Indonesia', 'info', 2000);
    }
  }

  function toggle() { setLang(current === 'id' ? 'en' : 'id'); }

  function applyAll() {
    const btn = document.getElementById('langToggleBtn');
    if (btn) btn.textContent = current === 'id' ? '🌐 EN' : '🌐 ID';

    // ── Navbar ──
    const navLinks = document.querySelectorAll('.nav-links a');
    ['nav_concerts','nav_upcoming','nav_venues','nav_about'].forEach((k, i) => {
      if (navLinks[i]) navLinks[i].textContent = t(k);
    });

    // ── Hero ──
    const heroBadge = document.querySelector('.hero-badge');
    if (heroBadge) heroBadge.textContent = t('hero_badge');

    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) heroTitle.innerHTML =
      `${t('hero_title_l1')}<br /><span class="gradient-text">${t('hero_title_l2')}</span><br />${t('hero_title_l3')}`;

    const heroSub = document.querySelector('.hero-sub');
    if (heroSub) heroSub.innerHTML = t('hero_sub');

    const heroScroll = document.querySelector('.hero-scroll span');
    if (heroScroll) heroScroll.textContent = t('hero_scroll');

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = t('hero_search');

    const statLabels = document.querySelectorAll('.stat-label');
    ['hero_stat1','hero_stat2','hero_stat3'].forEach((k, i) => {
      if (statLabels[i]) statLabels[i].textContent = t(k);
    });

    // ── Filter ──
    const filterMap = {
      all:'filter_all', confirmed:'filter_confirmed', rumor:'filter_rumor',
      kpop:'filter_kpop', pop:'filter_pop', rock:'filter_rock',
      jazz:'filter_jazz', indie:'filter_indie', upcoming:'filter_upcoming', past:'filter_past',
    };
    document.querySelectorAll('.filter-btn[data-filter]').forEach(b => {
      const key = filterMap[b.dataset.filter];
      if (!key || b.dataset.filter === 'wishlist') return;
      // Preserve wishlist count badge
      const badge = b.querySelector('.wishlist-count');
      b.textContent = t(key);
      if (badge) b.appendChild(badge);
    });

    const sortLabel = document.querySelector('.sort-label');
    if (sortLabel) sortLabel.textContent = t('sort_label');

    // Sort options
    const sortOpts = document.querySelectorAll('#sortSelect option');
    const sortKeys = ['sort_date_asc','sort_date_desc','sort_price_asc','sort_price_desc','sort_name_asc'];
    sortOpts.forEach((opt, i) => { if (sortKeys[i]) opt.textContent = t(sortKeys[i]); });

    // ── Concert section headers ──
    const concSecH2 = document.querySelector('.concerts-section .section-header h2');
    const concSecP  = document.querySelector('.concerts-section .section-header p');
    if (concSecH2) concSecH2.innerHTML = t('section_concerts') + ' <span class="gradient-text">2025–2027</span>';
    if (concSecP)  concSecP.innerHTML  = t('section_subtitle');

    const hlH2 = document.querySelector('.highlight-section .section-header h2');
    const hlP  = document.querySelector('.highlight-section .section-header p');
    if (hlH2) hlH2.textContent = t('section_hot');
    if (hlP)  hlP.textContent  = t('section_hot_sub');

    // ── Legend ──
    const legendH3 = document.querySelector('.legend-box h3');
    if (legendH3) legendH3.textContent = t('legend_title');
    const legendItems = document.querySelectorAll('.legend-item p');
    if (legendItems[0]) legendItems[0].textContent = t('legend_confirmed_desc');
    if (legendItems[1]) legendItems[1].textContent = t('legend_rumor_desc');
    if (legendItems[2]) legendItems[2].textContent = t('legend_past_desc');

    // ── Venues section ──
    const venuesH2 = document.querySelector('.venues-section .section-header h2');
    const venuesP  = document.querySelector('.venues-section .section-header p');
    if (venuesH2) venuesH2.textContent = t('venues_title');
    if (venuesP)  venuesP.textContent  = t('venues_sub');

    // ── No result ──
    const noRes = document.querySelector('#noResult p');
    if (noRes) noRes.textContent = t('no_result');

    // ── Newsletter ──
    const nlTitle = document.querySelector('.nl-text h3');
    const nlSub   = document.querySelector('.nl-text p');
    const nlBtn   = document.getElementById('nlMcBtn');
    const nlEmail = document.getElementById('nlMcEmail');
    if (nlTitle) nlTitle.textContent = t('nl_title');
    if (nlSub)   nlSub.textContent   = t('nl_sub');
    if (nlBtn && !nlBtn.disabled) nlBtn.textContent = t('nl_btn');
    if (nlEmail) nlEmail.placeholder = t('nl_placeholder');

    // ── Footer ──
    const footerTagline = document.querySelector('.footer-logo p');
    if (footerTagline) footerTagline.textContent = t('footer_tagline');

    const footerNavH4 = document.querySelector('.footer-links h4');
    if (footerNavH4) footerNavH4.textContent = t('footer_nav');

    const footerLinks = document.querySelectorAll('.footer-links a');
    const footerLinkKeys = ['footer_all','footer_upcoming','footer_about'];
    footerLinks.forEach((a, i) => { if (footerLinkKeys[i]) a.textContent = t(footerLinkKeys[i]); });

    const footerCopy = document.querySelector('.footer-bottom p');
    if (footerCopy) footerCopy.textContent = t('footer_copy');

    // ── Re-render cards agar tombol Beli Tiket, Detail, dll ikut berubah ──
    if (typeof applyFilters === 'function') applyFilters();
  }

  return { t, getLang, setLang, toggle, applyAll };
})();
window.I18n = I18n;


/* ================================================================
   2. NOTIFIKASI TIKET ON-SALE
   Tombol ada di filter bar sebagai tombol extra (🔔)
   + di dalam modal konser TBA
   ================================================================ */
const TicketAlert = (() => {
  const KEY = 'cid_ticket_alerts';

  function getAlerts() {
    try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { return new Set(); }
  }
  function saveAlerts(s) { try { localStorage.setItem(KEY, JSON.stringify([...s])); } catch {} }
  function isSubscribed(id) { return getAlerts().has(id); }

  function toggle(concertId, btnEl) {
    const alerts = getAlerts();
    if (alerts.has(concertId)) {
      alerts.delete(concertId);
      if (btnEl) { btnEl.textContent = '🔔 Ingatkan Tiket On-Sale'; btnEl.classList.remove('ta-active'); }
      showToast('🔕 Alert tiket dibatalkan', 'info', 2000);
    } else {
      alerts.add(concertId);
      if (btnEl) { btnEl.textContent = '🔔 Alert Aktif!'; btnEl.classList.add('ta-active'); }
      showToast('✅ Kami akan ingatkan saat tiket mulai dijual!', 'success', 3000);
    }
    saveAlerts(alerts);
    updateAlertBadge();
  }

  function updateAlertBadge() {
    const badge = document.getElementById('taBadge');
    const count = getAlerts().size;
    if (!badge) return;
    if (count > 0) { badge.textContent = count; badge.style.display = 'inline-flex'; }
    else badge.style.display = 'none';
  }

  function renderBtn(concertId) {
    const active = isSubscribed(concertId);
    return `<button class="btn-ticket-alert${active ? ' ta-active' : ''}"
      onclick="TicketAlert.toggle('${concertId}', this)">
      ${active ? '🔔 Alert Aktif!' : '🔔 Ingatkan Tiket On-Sale'}
    </button>`;
  }

  // Panel semua alert aktif
  function openPanel() {
    const alerts = getAlerts();
    const concerts = typeof CONCERTS !== 'undefined'
      ? [...alerts].map(id => CONCERTS.find(c => c.id === id)).filter(Boolean)
      : [];

    let overlay = document.getElementById('taOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'taOverlay';
      overlay.className = 'ha-overlay';
      overlay.onclick = e => { if (e.target === overlay) closePanel(); };
      document.body.appendChild(overlay);
    }

    const items = concerts.length
      ? concerts.map(c => `
          <div class="ha-item">
            <div class="ha-item-left">
              <span class="ha-budget">${c.artist}</span>
              <span class="ha-match">${c.dates[0]} · ${c.venue.split('(')[0].trim()}</span>
            </div>
            <div class="ha-item-right">
              <button class="ha-see" onclick="openModal('${c.id}');TicketAlert.closePanel()">Lihat →</button>
              <button class="ha-remove" onclick="TicketAlert.removeAlert('${c.id}')">✕</button>
            </div>
          </div>`).join('')
      : `<div class="ha-empty">Belum ada alert aktif. Buka konser dengan tiket TBA dan klik "Ingatkan Tiket On-Sale".</div>`;

    overlay.innerHTML = `
      <div class="ha-panel">
        <div class="ha-panel-header">
          <h4>🔔 Tiket On-Sale Alert</h4>
          <button class="ha-close" onclick="TicketAlert.closePanel()">✕</button>
        </div>
        <p class="ha-desc">Kamu akan muncul notifikasi saat konser ini mendekati 30 hari.</p>
        <div class="ha-list">${items}</div>
      </div>`;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    const overlay = document.getElementById('taOverlay');
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function removeAlert(concertId) {
    const alerts = getAlerts();
    alerts.delete(concertId);
    saveAlerts(alerts);
    updateAlertBadge();
    openPanel(); // refresh panel
  }

  function checkAndNotify() {
    if (typeof CONCERTS === 'undefined') return;
    const alerts = getAlerts();
    const now    = new Date();
    alerts.forEach(id => {
      const c    = CONCERTS.find(x => x.id === id);
      if (!c) return;
      const days = Math.ceil((c.rawDate - now) / 86400000);
      if (days > 0 && days <= 30 && typeof showToast === 'function') {
        showToast(`🎫 ${c.artist} — ${days} hari lagi! Cek info tiket sekarang.`, 'info', 5000);
      }
    });
  }

  return { toggle, isSubscribed, renderBtn, openPanel, closePanel, removeAlert, checkAndNotify, updateAlertBadge };
})();
window.TicketAlert = TicketAlert;


/* ================================================================
   3. "SUDAH NONTON" BADGE
   ================================================================ */
const BeenThere = (() => {
  const KEY = 'cid_been_there';

  function getAll() { try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { return new Set(); } }
  function saveAll(s) { try { localStorage.setItem(KEY, JSON.stringify([...s])); } catch {} }
  function hasAttended(id) { return getAll().has(id); }

  function toggle(concertId, btnEl) {
    const all = getAll();
    if (all.has(concertId)) {
      all.delete(concertId);
      if (btnEl) { btnEl.textContent = '✅ Tandai Sudah Nonton'; btnEl.classList.remove('bt-active'); }
      showToast('Dihapus dari daftar konser yang pernah kamu tonton', 'info', 2000);
    } else {
      all.add(concertId);
      if (btnEl) { btnEl.textContent = '🎉 Sudah Nonton!'; btnEl.classList.add('bt-active'); }
      showToast('🎉 Ditandai! Kamu pernah nonton konser ini.', 'success', 2500);
    }
    saveAll(all);
    document.querySelectorAll(`.concert-card[onclick*="${concertId}"]`).forEach(card => {
      card.classList.toggle('been-there', all.has(concertId));
    });
  }

  function renderBtn(concertId) {
    const active = hasAttended(concertId);
    return `<button class="btn-been-there${active ? ' bt-active' : ''}"
      onclick="BeenThere.toggle('${concertId}', this)">
      ${active ? '🎉 Sudah Nonton!' : '✅ Tandai Sudah Nonton'}
    </button>`;
  }

  function applyBadgesToCards() {
    const all = getAll();
    all.forEach(id => {
      document.querySelectorAll(`.concert-card[onclick*="${id}"]`).forEach(card => {
        card.classList.add('been-there');
      });
    });
  }

  return { toggle, hasAttended, renderBtn, applyBadgesToCards };
})();
window.BeenThere = BeenThere;


/* ================================================================
   4. SETLIST
   - Konser mendatang: label "Prediksi Setlist"
   - Konser past: label "Setlist Aktual" (sudah pasti)
   ================================================================ */
const SetlistPredict = (() => {
  // isPast (actual) vs upcoming (prediction)
  const SETLISTS = {
    // ── PAST — Setlist Aktual ──
    'blackpink-deadline-2025': {
      actual: true,
      source: 'Setlist aktual BLACKPINK DEADLINE Jakarta, Nov 2025',
      songs: ['Pink Venom','Shut Down','Typa Girl','Hard to Love','The Happiest Girl','Between Girls','Yeah Yeah Yeah','Lovesick Girls','Kill This Love','DDU-DU DDU-DU','How You Like That','Boombayah'],
    },
    'green-day-jakarta-2025': {
      actual: true,
      source: 'Setlist aktual Green Day Hammersonic, Feb 2025',
      songs: ['American Idiot','Holiday','Boulevard of Broken Dreams','Welcome to Paradise','Basket Case','Brain Stew','Minority','Wake Me Up When September Ends','Know Your Enemy','21 Guns','Good Riddance (Time of Your Life)'],
    },
    'ateez-2026': {
      actual: true,
      source: 'Setlist aktual ATEEZ In Your Fantasy Jakarta, Jan 2026',
      songs: ['FIREWORKS (I\'LL BE THE ONE)','Fireworks','WAVE','ANSWER','Wonderland','HALAZIA','Guerrilla','Inception','Say My Name','The Real','Rocky','ROCKY','Deja Vu','I\'ll Be There'],
    },
    'dream-theater-2026': {
      actual: true,
      source: 'Setlist aktual Dream Theater Jakarta, Feb 2026',
      songs: ['The Alien','Metropolis Pt. 1','Pull Me Under','The Mirror','Lie','Peruvian Skies','The Spirit Carries On','Octavarium','The Count of Tuscany','On the Backs of Angels'],
    },
    'mcr-hammersonic-2026': {
      actual: true,
      source: 'Setlist aktual MCR Hammersonic Jakarta, Mei 2026',
      songs: ['Welcome to the Black Parade','Helena',"I'm Not Okay (I Promise)",'Famous Last Words','Na Na Na','Teenagers','The Ghost of You','Cancer','Mama'],
    },
    'laufey-jakarta-2026': {
      actual: true,
      source: 'Setlist aktual Laufey Jakarta, Mei 2026',
      songs: ['Valentine','Let You Break My Heart Again','Bewitched','From the Start','Best Friend','Falling Behind',"I'd Rather Go Blind",'Lovesick','Atonement','An Evening I Will Not Forget'],
    },
    'exo-exhorizon-jakarta-2026': {
      actual: true,
      source: 'Setlist aktual EXO EXhOrizon Jakarta, Jun 2026',
      songs: ['Power','Tempo','Obsession','Ko Ko Bop','Monster','Lucky One','Love Shot','Growl','Call Me Baby','MAMA','Comeback','The Eve','Cream Soda'],
    },
    // ── UPCOMING — Prediksi Setlist ──
    'bts-jakarta-2026': {
      actual: false,
      source: 'Prediksi berdasarkan setlist BTS Permission to Dance on Stage (2022)',
      songs: ['Butter','Permission to Dance','ON','Dynamite','Boy With Luv','DNA','IDOL','Fake Love','Spring Day','Fire','Not Today','DOPE','Run BTS','Yet To Come'],
    },
    'mcr-jis-2026': {
      actual: false,
      source: 'Prediksi berdasarkan setlist MCR World Tour 2023',
      songs: ['The Ghost of You','Helena','Famous Last Words',"I'm Not Okay",'Welcome to the Black Parade','Teenagers','Na Na Na','Sing','Mama','Cancer','Planetary (GO!)','Thank You for the Venom'],
    },
    'the-weeknd-jakarta-2026': {
      actual: false,
      source: 'Prediksi berdasarkan setlist After Hours Til Dawn Tour 2023',
      songs: ['Alone Again','Gasoline','How Do I Make You Love Me?','Take My Breath','Sacrifice','Blinding Lights','Save Your Tears','Starboy','I Feel It Coming',"Can't Feel My Face",'The Hills','Often','Call Out My Name'],
    },
    'avenged-sevenfold-jakarta-2026': {
      actual: false,
      source: 'Prediksi berdasarkan setlist A7X Life Is But a Dream Tour 2023',
      songs: ['Game Over','Mattel','Nobody','We Love You','Hail to the King','God Damn','Critical Acclaim','Bat Country','Afterlife','Nightmare','So Far Away','A Little Piece of Heaven','Unholy Confessions'],
    },
    'one-ok-rock-jakarta-2026': {
      actual: false,
      source: 'Prediksi berdasarkan setlist ONE OK ROCK Luxury Disease Asia Tour 2023',
      songs: ['Wherever You Are','Taking Off','Never Let Me Go','Make It Out Alive','Vandalize','Answer is Near','Wasted Nights','(Re)make','Renegades','Stand Out Fit In','Mighty Long Fall'],
    },
    'westlife-jakarta-2027': {
      actual: false,
      source: 'Prediksi berdasarkan setlist Westlife Wild Dreams Tour 2022',
      songs: ['Swear It Again','Flying Without Wings','You Raise Me Up','My Love','Uptown Girl','World of Our Own','What Makes a Man','Unbreakable','When You\'re Looking Like That','Queen of My Heart'],
    },
    'coldplay-jakarta-rumor': {
      actual: false,
      source: 'Prediksi berdasarkan setlist Music of the Spheres World Tour 2023',
      songs: ['Music of the Spheres','My Universe','Human Heart','Yellow','The Scientist','Fix You','A Sky Full of Stars','Adventure of a Lifetime','Hymn for the Weekend','Clocks','Sparks','Higher Power'],
    },
    'taylor-swift-jakarta-rumor': {
      actual: false,
      source: 'Prediksi berdasarkan setlist The Eras Tour 2023-2024',
      songs: ['Cruel Summer','Love Story','You Belong With Me','Blank Space','Style','All Too Well (10 Min)','Shake It Off','Bad Blood','Wildest Dreams','Anti-Hero','Lavender Haze','Bejeweled','Karma'],
    },
    'ed-sheeran-jakarta-rumor': {
      actual: false,
      source: 'Prediksi berdasarkan setlist Mathematics Tour 2023',
      songs: ['Tides','Shivers','Castle on the Hill','Galway Girl','Don\'t','Shape of You','Photograph','Perfect','Thinking Out Loud','Bad Habits','Overpass Graffiti','Celestial'],
    },
  };

  function render(concertId) {
    const data = SETLISTS[concertId];
    if (!data) return '';
    const isActual = data.actual;
    return `
      <div class="setlist-section">
        <div class="setlist-header">
          <h4>${isActual ? '🎶 Setlist Aktual' : '🎶 Prediksi Setlist'}</h4>
          <span class="setlist-badge${isActual ? ' setlist-actual' : ''}">${isActual ? 'Aktual ✅' : 'Prediction'}</span>
        </div>
        <p class="setlist-source">📊 ${data.source}</p>
        <ol class="setlist-list">
          ${data.songs.map((s, i) => `
            <li class="setlist-item">
              <span class="setlist-num">${i + 1}</span>
              <span class="setlist-song">${s}</span>
            </li>`).join('')}
        </ol>
        ${!isActual ? `<p class="setlist-disclaimer">⚠️ Hanya prediksi. Setlist aktual bisa berbeda.</p>` : ''}
      </div>`;
  }

  return { render };
})();
window.SetlistPredict = SetlistPredict;


/* ================================================================
   5. KONVERTER HARGA REAL-TIME
   Hanya tampil untuk konser CONFIRMED + UPCOMING + ada harga
   ================================================================ */
const PriceConverter = (() => {
  const KEY_RATES = 'cid_fx_rates';
  const KEY_TS    = 'cid_fx_ts';
  const CACHE_TTL = 3600000;

  let rates = { USD: 0.000062, SGD: 0.000084, KRW: 0.085, MYR: 0.00029, JPY: 0.0097 };

  async function fetchRates() {
    try {
      const ts     = parseInt(localStorage.getItem(KEY_TS) || '0');
      const cached = localStorage.getItem(KEY_RATES);
      if (Date.now() - ts < CACHE_TTL && cached) { rates = JSON.parse(cached); return; }
      const res  = await fetch('https://open.er-api.com/v6/latest/IDR');
      const data = await res.json();
      if (data && data.rates) {
        rates = { USD: data.rates.USD, SGD: data.rates.SGD, KRW: data.rates.KRW, MYR: data.rates.MYR, JPY: data.rates.JPY };
        localStorage.setItem(KEY_RATES, JSON.stringify(rates));
        localStorage.setItem(KEY_TS, Date.now().toString());
      }
    } catch {}
  }

  function fmtCurrency(idr, currency) {
    const val = idr * (rates[currency] || 0);
    switch (currency) {
      case 'USD': return `$${val.toFixed(0)}`;
      case 'SGD': return `S$${val.toFixed(0)}`;
      case 'KRW': return `₩${Math.round(val).toLocaleString()}`;
      case 'MYR': return `RM ${val.toFixed(0)}`;
      case 'JPY': return `¥${Math.round(val).toLocaleString()}`;
      default:    return val.toFixed(0);
    }
  }

  function render(concert) {
    // Sembunyikan untuk konser past atau rumor atau harga belum ada
    if (!concert || concert.priceMin === 0) return '';
    if (concert.confirmStatus === 'rumor') return '';
    if (concert.rawDate < new Date()) return '';

    const currencies = [
      { code: 'USD', flag: '🇺🇸' }, { code: 'SGD', flag: '🇸🇬' },
      { code: 'KRW', flag: '🇰🇷' }, { code: 'MYR', flag: '🇲🇾' },
      { code: 'JPY', flag: '🇯🇵' },
    ];
    const rows = currencies.map(c => `
      <div class="fx-row">
        <span class="fx-flag">${c.flag}</span>
        <span class="fx-currency">${c.code}</span>
        <span class="fx-range">${fmtCurrency(concert.priceMin, c.code)} – ${fmtCurrency(concert.priceMax, c.code)}</span>
      </div>`).join('');

    return `
      <div class="fx-section">
        <div class="fx-header">
          <h4>💱 Konverter Harga</h4>
          <span class="fx-badge">Live Rate</span>
        </div>
        <div class="fx-grid">${rows}</div>
        <p class="fx-disclaimer">* Kurs real-time · 1 USD ≈ Rp ${Math.round(1 / rates.USD).toLocaleString()}</p>
      </div>`;
  }

  return { fetchRates, render };
})();
window.PriceConverter = PriceConverter;


/* ================================================================
   6. GROUP BUYING / CARI TEMAN NONTON
   Form dinonaktifkan untuk konser PAST dan RUMOR
   ================================================================ */
const GroupBuying = (() => {
  const KEY = 'cid_group_buying';

  function getAll()   { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
  function saveAll(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} }
  function getFor(id) { return getAll()[id] || []; }

  function getUID() {
    let uid = localStorage.getItem('cid_uid');
    if (!uid) { uid = 'u_' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('cid_uid', uid); }
    return uid;
  }

  function timeAgo(date) {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
    if (d > 0) return `${d} hari lalu`;
    if (h > 0) return `${h} jam lalu`;
    if (m > 0) return `${m} menit lalu`;
    return 'Baru saja';
  }

  function add(concertId, { name, seats, category, contact, note }) {
    if (!name || !seats || !contact) return { ok: false, msg: 'Nama, jumlah tiket, dan kontak wajib diisi.' };
    const all = getAll();
    if (!all[concertId]) all[concertId] = [];
    if (all[concertId].length >= 30) return { ok: false, msg: 'Maksimal 30 posting per konser.' };
    all[concertId].unshift({
      uid: getUID(),
      name: name.trim().slice(0,30).replace(/</g,'&lt;'),
      seats: Math.min(parseInt(seats)||1, 10),
      category: (category||'TBA').trim().slice(0,30).replace(/</g,'&lt;'),
      contact: contact.trim().slice(0,60).replace(/</g,'&lt;'),
      note: (note||'').trim().slice(0,150).replace(/</g,'&lt;'),
      date: new Date().toISOString(),
    });
    saveAll(all);
    return { ok: true };
  }

  function buildContactHref(contact) {
    const digits = contact.replace(/\D/g, '');
    if (contact.startsWith('http')) return contact;
    if (digits.length >= 8) return `https://wa.me/${digits}`;
    return `https://instagram.com/${contact.replace('@','')}`;
  }

  function render(concertId) {
    const posts   = getFor(concertId);
    const concert = typeof CONCERTS !== 'undefined' ? CONCERTS.find(c => c.id === concertId) : null;
    const isPastC = concert && concert.rawDate < new Date();
    const isRumorC = concert && concert.confirmStatus === 'rumor';
    const formDisabled = isPastC || isRumorC;

    const postItems = posts.length
      ? posts.map(p => `
          <div class="gb-item">
            <div class="gb-item-top">
              <div class="gb-avatar">${p.name.charAt(0).toUpperCase()}</div>
              <div class="gb-info">
                <div class="gb-name">${p.name}</div>
                <div class="gb-meta">${timeAgo(p.date)} · ${p.seats} tiket · ${p.category}</div>
              </div>
              <a class="gb-contact" href="${buildContactHref(p.contact)}" target="_blank" rel="noopener">Hubungi →</a>
            </div>
            ${p.note ? `<div class="gb-note">${p.note}</div>` : ''}
          </div>`).join('')
      : `<div class="gb-empty">Belum ada yang cari teman nonton. Jadilah yang pertama! 🎉</div>`;

    const formHtml = formDisabled
      ? `<div class="gb-ended">${isPastC ? 'Konser sudah selesai' : 'Konser belum dikonfirmasi'} — form posting ditutup.</div>`
      : `<form class="gb-form" onsubmit="GroupBuying.handleSubmit(event,'${concertId}')">
          <div class="gb-form-row">
            <input class="gb-input" name="name" type="text" placeholder="Nama kamu *" maxlength="30" required />
            <input class="gb-input gb-input-sm" name="seats" type="number" placeholder="Jml tiket *" min="1" max="10" required />
          </div>
          <div class="gb-form-row">
            <input class="gb-input" name="category" type="text" placeholder="Kategori (CAT 1, VIP...)" maxlength="30" />
            <input class="gb-input" name="contact" type="text" placeholder="No WA / @instagram *" maxlength="60" required />
          </div>
          <div class="gb-form-row">
            <input class="gb-input" name="note" type="text" placeholder="Catatan tambahan (opsional)" maxlength="150" />
            <button class="gb-submit" type="submit">Post</button>
          </div>
        </form>`;

    return `
      <div class="gb-section" id="gb_${concertId}">
        <div class="gb-header">
          <h4>🤝 Cari Teman Nonton</h4>
          ${posts.length ? `<span class="gb-count">${posts.length}</span>` : ''}
        </div>
        <p class="gb-desc">Cari teman nonton bareng atau jual tiket berlebih. Selalu verifikasi sebelum transfer!</p>
        ${formHtml}
        <div class="gb-list">${postItems}</div>
      </div>`;
  }

  function handleSubmit(e, concertId) {
    e.preventDefault();
    const f = e.target;
    const result = add(concertId, {
      name:     f.querySelector('[name="name"]')?.value,
      seats:    f.querySelector('[name="seats"]')?.value,
      category: f.querySelector('[name="category"]')?.value,
      contact:  f.querySelector('[name="contact"]')?.value,
      note:     f.querySelector('[name="note"]')?.value,
    });
    if (!result.ok) { showToast('⚠️ ' + result.msg, 'error'); return; }
    const section = document.getElementById(`gb_${concertId}`);
    if (section) section.outerHTML = render(concertId);
    showToast('🤝 Posting berhasil!', 'success', 2500);
  }

  return { render, handleSubmit };
})();
window.GroupBuying = GroupBuying;


/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // ── 1. Tombol bahasa di navbar (sebelum theme toggle) ──
  const navCta = document.querySelector('.nav-cta');
  if (navCta) {
    const langBtn = document.createElement('button');
    langBtn.id        = 'langToggleBtn';
    langBtn.className = 'theme-toggle';
    langBtn.style.cssText = 'font-size:0.68rem;font-weight:700;width:auto;padding:0 10px;border-radius:99px;letter-spacing:0.5px;flex-shrink:0;';
    langBtn.textContent   = I18n.getLang() === 'id' ? '🌐 EN' : '🌐 ID';
    langBtn.title         = 'Toggle Language / Bahasa';
    langBtn.onclick       = () => I18n.toggle();
    navCta.insertBefore(langBtn, navCta.firstChild);
  }

  // ── 2. Tombol Ticket Alert di filter-extra-btns ──
  const filterExtraBtns = document.querySelector('.filter-extra-btns');
  if (filterExtraBtns) {
    const taBtn = document.createElement('button');
    taBtn.className = 'filter-extra-btn';
    taBtn.title     = 'Tiket On-Sale Alert';
    taBtn.onclick   = () => TicketAlert.openPanel();
    taBtn.innerHTML = `🔔<span class="ha-badge" id="taBadge" style="display:none"></span>`;
    filterExtraBtns.appendChild(taBtn);
    TicketAlert.updateAlertBadge();
  }

  // ── 3. Fetch kurs ──
  PriceConverter.fetchRates();

  // ── 4. Been-there badges ──
  setTimeout(() => BeenThere.applyBadgesToCards(), 600);

  // ── 5. Ticket alert check ──
  setTimeout(() => TicketAlert.checkAndNotify(), 3000);

  // ── 6. Patch openModal ──
  const _prevF3 = window.openModal;
  if (typeof _prevF3 === 'function') {
    window.openModal = function(id) {
      _prevF3(id);
      const c = typeof CONCERTS !== 'undefined' ? CONCERTS.find(x => x.id === id) : null;
      if (!c) return;

      requestAnimationFrame(() => requestAnimationFrame(() => {
        const modal = document.getElementById('modalContent');
        if (!modal) return;

        const isPastC  = c.rawDate < new Date();
        const isRumorC = c.confirmStatus === 'rumor';

        // A. Ticket On-Sale Alert — di bawah share row, hanya confirmed + TBA harga + upcoming
        if (!isRumorC && c.priceMin === 0 && !isPastC) {
          const shareRow = modal.querySelector('.modal-share-row');
          if (shareRow) {
            const el = document.createElement('div');
            el.className = 'ta-wrap';
            el.innerHTML = TicketAlert.renderBtn(c.id);
            shareRow.insertAdjacentElement('afterend', el);
          }
        }

        // B. Sudah Nonton — hanya konser past, tepat setelah .modal-disclaimer
        if (isPastC) {
          const disclaimer = modal.querySelector('.modal-disclaimer');
          if (disclaimer) {
            const el = document.createElement('div');
            el.className = 'bt-wrap';
            el.innerHTML = BeenThere.renderBtn(c.id);
            disclaimer.insertAdjacentElement('afterend', el);
          }
        }

        // C. Setlist — di atas kategori tiket (.modal-ticket-area)
        const setlistHtml = SetlistPredict.render(c.id);
        if (setlistHtml) {
          // Coba beberapa anchor karena ada kemungkinan ticket area sudah dipindah
          const anchor = modal.querySelector('.modal-ticket-area') ||
                         modal.querySelector('.modal-desc') ||
                         modal.querySelector('.modal-details');
          if (anchor) {
            const el = document.createElement('div');
            el.innerHTML = setlistHtml;
            anchor.insertAdjacentElement('beforebegin', el.firstElementChild || el);
          } else {
            // Fallback: tambah ke dalam modal langsung
            const el = document.createElement('div');
            el.innerHTML = setlistHtml;
            modal.appendChild(el.firstElementChild || el);
          }
        }

        // D. Konverter Harga — hanya confirmed + upcoming + ada harga
        const fxHtml = PriceConverter.render(c);
        if (fxHtml) {
          const anchor = modal.querySelector('.setlist-section') || modal.querySelector('.modal-ticket-area');
          if (anchor) {
            const el = document.createElement('div');
            el.innerHTML = fxHtml;
            anchor.insertAdjacentElement('afterend', el.firstElementChild || el);
          }
        }

        // Forum Jual Beli dan Cari Teman Nonton sudah di-inject dari features.js
        // untuk menghindari race condition rAF bertingkat

      }));
    };
  }
});



/* ================================================================
   7. FORUM JUAL BELI TIKET
   - Jual: punya tiket, cari pembeli
   - Beli: cari tiket, butuh seller
   - Disabled untuk konser PAST dan RUMOR
   ================================================================ */
const TicketMarket = (() => {
  const KEY = 'cid_ticket_market';

  function getAll()   { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
  function saveAll(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} }
  function getFor(id) { return getAll()[id] || []; }

  function getUID() {
    let uid = localStorage.getItem('cid_uid');
    if (!uid) { uid = 'u_' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('cid_uid', uid); }
    return uid;
  }

  function timeAgo(date) {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
    if (d > 0) return `${d} hari lalu`;
    if (h > 0) return `${h} jam lalu`;
    if (m > 0) return `${m} menit lalu`;
    return 'Baru saja';
  }

  function add(concertId, { type, name, category, qty, price, contact, note }) {
    if (!name || !contact) return { ok: false, msg: 'Nama dan kontak wajib diisi.' };
    const all = getAll();
    if (!all[concertId]) all[concertId] = [];
    if (all[concertId].length >= 50) return { ok: false, msg: 'Maksimal 50 listing per konser.' };
    all[concertId].unshift({
      uid:      getUID(),
      type:     type || 'jual',
      name:     name.trim().slice(0,30).replace(/</g,'&lt;'),
      category: (category||'TBA').trim().slice(0,30).replace(/</g,'&lt;'),
      qty:      Math.min(parseInt(qty)||1, 20),
      price:    (price||'').trim().slice(0,30).replace(/</g,'&lt;'),
      contact:  contact.trim().slice(0,60).replace(/</g,'&lt;'),
      note:     (note||'').trim().slice(0,150).replace(/</g,'&lt;'),
      date:     new Date().toISOString(),
    });
    saveAll(all);
    return { ok: true };
  }

  function buildContactHref(contact) {
    const digits = contact.replace(/\D/g, '');
    if (contact.startsWith('http')) return contact;
    if (digits.length >= 8) return `https://wa.me/${digits}`;
    return `https://instagram.com/${contact.replace('@','')}`;
  }

  function render(concertId) {
    const posts    = getFor(concertId);
    const concert  = typeof CONCERTS !== 'undefined' ? CONCERTS.find(c => c.id === concertId) : null;
    const isPastC  = concert && concert.rawDate < new Date();
    const isRumorC = concert && concert.confirmStatus === 'rumor';
    const disabled = isPastC || isRumorC;

    // Split jual & beli
    const jual = posts.filter(p => p.type === 'jual');
    const beli = posts.filter(p => p.type === 'beli');

    function renderItems(items) {
      if (!items.length) return `<div class="tm-empty">Belum ada listing.</div>`;
      return items.map(p => `
        <div class="tm-item">
          <div class="tm-item-top">
            <span class="tm-type-badge tm-type-${p.type}">${p.type === 'jual' ? 'JUAL' : 'BELI'}</span>
            <div class="tm-info">
              <span class="tm-name">${p.name}</span>
              <span class="tm-meta">${p.category} · ${p.qty} tiket${p.price ? ` · ${p.price}` : ''}</span>
            </div>
            <a class="gb-contact" href="${buildContactHref(p.contact)}" target="_blank" rel="noopener">Hubungi →</a>
          </div>
          ${p.note ? `<div class="gb-note">${p.note}</div>` : ''}
          <div class="tm-time">${timeAgo(p.date)}</div>
        </div>`).join('');
    }

    const formHtml = disabled
      ? `<div class="gb-ended">${isPastC ? 'Konser sudah selesai' : 'Konser belum dikonfirmasi'} — listing ditutup.</div>`
      : `<form class="gb-form tm-form" onsubmit="TicketMarket.handleSubmit(event,'${concertId}')">
          <div class="tm-type-row">
            <label class="tm-type-opt">
              <input type="radio" name="type" value="jual" checked /> 🎫 Jual Tiket
            </label>
            <label class="tm-type-opt">
              <input type="radio" name="type" value="beli" /> 🔍 Cari Tiket
            </label>
          </div>
          <div class="gb-form-row">
            <input class="gb-input" name="name" type="text" placeholder="Nama kamu *" maxlength="30" required />
            <input class="gb-input gb-input-sm" name="qty" type="number" placeholder="Jml" min="1" max="20" />
          </div>
          <div class="gb-form-row">
            <input class="gb-input" name="category" type="text" placeholder="Kategori (CAT 1, VIP...)" maxlength="30" />
            <input class="gb-input" name="price" type="text" placeholder="Harga (Rp ...)" maxlength="30" />
          </div>
          <div class="gb-form-row">
            <input class="gb-input" name="contact" type="text" placeholder="No WA / @instagram *" maxlength="60" required />
            <input class="gb-input" name="note" type="text" placeholder="Catatan (opsional)" maxlength="150" />
          </div>
          <button class="gb-submit" type="submit" style="width:100%">+ Post Listing</button>
          <p class="tm-warn">⚠️ Selalu verifikasi tiket sebelum transfer. Waspada penipuan!</p>
        </form>`;

    return `
      <div class="tm-section" id="tm_${concertId}">
        <div class="gb-header">
          <h4>🎫 Forum Jual Beli Tiket</h4>
          ${posts.length ? `<span class="gb-count">${posts.length}</span>` : ''}
        </div>
        ${formHtml}
        ${posts.length ? `
          <div class="tm-tabs">
            <button class="tm-tab active" onclick="TicketMarket.switchTab(this,'${concertId}','jual')">
              Jual <span class="tm-tab-count">${jual.length}</span>
            </button>
            <button class="tm-tab" onclick="TicketMarket.switchTab(this,'${concertId}','beli')">
              Cari <span class="tm-tab-count">${beli.length}</span>
            </button>
          </div>
          <div class="tm-list" id="tmlist_${concertId}">${renderItems(jual)}</div>
        ` : ''}
      </div>`;
  }

  function switchTab(btnEl, concertId, type) {
    const posts = getFor(concertId);
    const items = posts.filter(p => p.type === type);
    document.querySelectorAll(`#tm_${concertId} .tm-tab`).forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
    const list = document.getElementById(`tmlist_${concertId}`);
    if (list) list.innerHTML = items.length
      ? items.map(p => `
          <div class="tm-item">
            <div class="tm-item-top">
              <span class="tm-type-badge tm-type-${p.type}">${p.type === 'jual' ? 'JUAL' : 'BELI'}</span>
              <div class="tm-info">
                <span class="tm-name">${p.name}</span>
                <span class="tm-meta">${p.category} · ${p.qty} tiket${p.price ? ` · ${p.price}` : ''}</span>
              </div>
              <a class="gb-contact" href="${buildContactHref(p.contact)}" target="_blank" rel="noopener">Hubungi →</a>
            </div>
            ${p.note ? `<div class="gb-note">${p.note}</div>` : ''}
            <div class="tm-time">${timeAgo(p.date)}</div>
          </div>`).join('')
      : `<div class="tm-empty">Belum ada listing.</div>`;
  }

  function handleSubmit(e, concertId) {
    e.preventDefault();
    const f    = e.target;
    const type = f.querySelector('input[name="type"]:checked')?.value || 'jual';
    const result = add(concertId, {
      type,
      name:     f.querySelector('[name="name"]')?.value,
      category: f.querySelector('[name="category"]')?.value,
      qty:      f.querySelector('[name="qty"]')?.value,
      price:    f.querySelector('[name="price"]')?.value,
      contact:  f.querySelector('[name="contact"]')?.value,
      note:     f.querySelector('[name="note"]')?.value,
    });
    if (!result.ok) { showToast('⚠️ ' + result.msg, 'error'); return; }
    const section = document.getElementById(`tm_${concertId}`);
    if (section) section.outerHTML = render(concertId);
    showToast(type === 'jual' ? '🎫 Tiket berhasil di-listing!' : '🔍 Pencarian tiket berhasil diposting!', 'success', 2500);
  }

  return { render, handleSubmit, switchTab };
})();
window.TicketMarket = TicketMarket;



/* ================================================================
   8. KRITIK & SARAN — kirim ke listconcerttour@gmail.com via EmailJS
   ================================================================ */
const FeedbackForm = (() => {

  function render() {
    return `
      <div class="fb-section" id="fbSection">
        <div class="gb-header">
          <h4>📬 Kritik &amp; Saran</h4>
        </div>
        <p class="gb-desc">Punya masukan, laporan data salah, atau saran fitur baru? Kirim ke kami!</p>
        <form class="fb-form" id="fbForm" onsubmit="FeedbackForm.handleSubmit(event)">
          <div class="gb-form-row">
            <input class="gb-input" name="from_name" type="text" placeholder="Nama kamu (opsional)" maxlength="50" />
            <input class="gb-input" name="from_email" type="email" placeholder="Email (opsional)" maxlength="100" />
          </div>
          <div class="fb-type-row">
            <label class="tm-type-opt"><input type="radio" name="type" value="kritik" checked /> 🔴 Kritik</label>
            <label class="tm-type-opt"><input type="radio" name="type" value="saran" /> 💡 Saran</label>
            <label class="tm-type-opt"><input type="radio" name="type" value="data" /> 📋 Data Salah</label>
            <label class="tm-type-opt"><input type="radio" name="type" value="lainnya" /> 💬 Lainnya</label>
          </div>
          <textarea class="fb-textarea" name="message" placeholder="Tuliskan pesan kamu di sini... (min 10 karakter)" rows="4" maxlength="1000" required></textarea>
          <label class="fb-attach-label" for="fbAttach">
            <span class="fb-attach-icon">📎</span>
            <span class="fb-attach-text" id="fbAttachText">Lampirkan foto (opsional · JPG/PNG/WebP · maks 2MB)</span>
          </label>
          <input class="fb-attach-input" id="fbAttach" type="file"
            accept="image/jpeg,image/png,image/webp"
            onchange="FeedbackForm.onAttach(this)" />
          <div class="fb-attach-preview" id="fbAttachPreview" style="display:none">
            <img id="fbAttachImg" alt="preview" />
            <button type="button" class="fb-attach-remove" onclick="FeedbackForm.removeAttach()">✕ Hapus foto</button>
          </div>
          <button class="gb-submit fb-btn" type="submit" id="fbSubmitBtn">📬 Kirim Pesan</button>
        </form>
        <div class="fb-msg" id="fbMsg"></div>
      </div>`;
  }

  // Rate limiting — max 3 submit per 10 menit
  function checkRateLimit() {
    const KEY   = 'cid_fb_rl';
    const LIMIT = 3;
    const TTL   = 10 * 60 * 1000; // 10 menit
    try {
      const raw  = JSON.parse(localStorage.getItem(KEY) || '{"count":0,"ts":0}');
      const now  = Date.now();
      if (now - raw.ts > TTL) {
        localStorage.setItem(KEY, JSON.stringify({ count: 1, ts: now }));
        return true;
      }
      if (raw.count >= LIMIT) return false;
      localStorage.setItem(KEY, JSON.stringify({ count: raw.count + 1, ts: raw.ts }));
      return true;
    } catch { return true; }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn  = document.getElementById('fbSubmitBtn');
    const msg  = document.getElementById('fbMsg');

    const name    = form.from_name?.value?.trim()  || 'Anonim';
    const email   = form.from_email?.value?.trim() || 'Tidak dicantumkan';
    const type    = form.querySelector('input[name="type"]:checked')?.value || 'lainnya';
    const message = form.message?.value?.trim();

    if (!message || message.length < 10) {
      showToast('⚠️ Pesan minimal 10 karakter.', 'error'); return;
    }

    // Rate limit check
    if (!checkRateLimit()) {
      showToast('⚠️ Terlalu banyak pengiriman. Coba lagi dalam 10 menit.', 'error', 5000);
      return;
    }

    btn.disabled    = true;
    btn.textContent = 'Mengirim...';

    // Upload foto ke ImgBB jika ada, dapatkan URL
    let photoUrl = '';
    const attachedFile = FeedbackForm._attachedFile || null;
    if (attachedFile) {
      try {
        btn.textContent = 'Mengupload foto...';
        photoUrl = await FeedbackForm.uploadPhoto(attachedFile);
      } catch (uploadErr) {
        showToast('⚠️ Gagal upload foto, pesan tetap dikirim tanpa foto.', 'error', 4000);
      }
    }

    try {
      const payload = {
        from_name:  name,
        from_email: email,
        type:       type.charAt(0).toUpperCase() + type.slice(1),
        message:    message,
        sent_at:    new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
        // Kirim base64 data URL langsung sebagai <img> di body email
        // EmailJS template HARUS pakai {{{photo_url}}} (triple curly = unescaped HTML)
        photo_url: photoUrl
          ? `<img src="${photoUrl}" alt="Foto lampiran" style="max-width:560px;width:100%;border-radius:8px;display:block;margin-top:8px;" />`
          : 'Tidak ada foto',
      };

      const result = await emailjs.send('service_lq3pvsq', 'template_w8grsoa', payload);

      if (result.status === 200) {
        btn.textContent = '✅ Terkirim!';
        if (msg) {
          msg.innerHTML = '🎉 Terima kasih! Pesan kamu sudah kami terima.';
          msg.style.color = '#4ade80';
        }
        form.reset();
        FeedbackForm.removeAttach();
        showToast('📬 Pesan berhasil dikirim!', 'success', 4000);
      }
    } catch (err) {
      btn.disabled    = false;
      btn.textContent = '📬 Kirim Pesan';
      const errMsg = err?.text || err?.message || JSON.stringify(err) || 'Unknown error';
      console.error('[EmailJS Error]', err);
      if (msg) {
        msg.innerHTML = `⚠️ Error: <code style="font-size:0.75rem;background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;">${errMsg}</code>`;
        msg.style.color = '#f87171';
      }
      showToast('⚠️ Gagal kirim: ' + errMsg.slice(0, 60), 'error', 6000);
    }
  }

  async function uploadPhoto(file) {
    // Resize ke max 300px, quality 40% → base64 ~8-15KB, aman untuk EmailJS payload limit
    return new Promise((resolve, reject) => {
      const image  = new Image();
      const objUrl = URL.createObjectURL(file);
      image.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error('Gagal memuat gambar')); };
      image.onload  = () => {
        const MAX = 300;
        let { width, height } = image;
        if (width > MAX || height > MAX) {
          const ratio = Math.min(MAX / width, MAX / height);
          width  = Math.round(width  * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(image, 0, 0, width, height);
        URL.revokeObjectURL(objUrl);
        resolve(canvas.toDataURL('image/jpeg', 0.40));
      };
      image.src = objUrl;
    });
  }

  function onAttach(input) {
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('⚠️ Hanya file gambar.', 'error'); input.value = ''; return; }
    if (file.size > 2 * 1024 * 1024) { showToast('⚠️ Ukuran maksimal 2MB.', 'error'); input.value = ''; return; }

    FeedbackForm._attachedFile = file;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const preview = document.getElementById('fbAttachPreview');
      const img     = document.getElementById('fbAttachImg');
      const label   = document.getElementById('fbAttachText');
      if (img)     img.src = ev.target.result;
      if (preview) preview.style.display = 'flex';
      if (label)   label.textContent = `📎 ${file.name} (${(file.size/1024).toFixed(0)}KB)`;
    };
    reader.readAsDataURL(file);
  }

  function removeAttach() {
    FeedbackForm._attachedFile = null;
    const input   = document.getElementById('fbAttach');
    const preview = document.getElementById('fbAttachPreview');
    const label   = document.getElementById('fbAttachText');
    if (input)   input.value = '';
    if (preview) preview.style.display = 'none';
    if (label)   label.textContent = 'Lampirkan foto (opsional · JPG/PNG/WebP · maks 2MB)';
  }

  return { render, handleSubmit, uploadPhoto, onAttach, removeAttach };
})();
window.FeedbackForm = FeedbackForm;
