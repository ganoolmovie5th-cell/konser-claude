/* ================================================================
   ConcertID — features2.js
   Fitur:
   1. Tampilan Kalender — view konser per bulan
   2. Advanced Search — filter harga slider, bulan, kota
   3. Harga Alert — notifikasi konser di bawah budget
   4. Spotify Integration — embed preview artis di modal
   ================================================================ */

'use strict';

/* ================================================================
   1. TAMPILAN KALENDER
   ================================================================ */
const CalendarView = (() => {
  let visible = false;
  let currentYear  = new Date().getFullYear();
  let currentMonth = new Date().getMonth(); // 0-based

  const MONTH_ID  = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
  const MONTH_FULL = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const DAY_LABELS = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

  function getConcertsForMonth(year, month) {
    if (typeof CONCERTS === 'undefined') return {};
    const map = {};
    CONCERTS.forEach(c => {
      const d = c.rawDate;
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(c);
      }
    });
    return map;
  }

  function renderCalendar(year, month) {
    const concertMap  = getConcertsForMonth(year, month);
    const firstDay    = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today       = new Date();
    const isToday     = (d) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

    // Header hari
    const dayHeaders = DAY_LABELS.map(d =>
      `<div class="cal-day-label">${d}</div>`
    ).join('');

    // Empty cells sebelum hari pertama
    let cells = '';
    for (let i = 0; i < firstDay; i++) {
      cells += `<div class="cal-cell cal-empty"></div>`;
    }

    // Hari-hari dalam bulan
    for (let d = 1; d <= daysInMonth; d++) {
      const concerts = concertMap[d] || [];
      const hasConcert = concerts.length > 0;
      const pastDay    = new Date(year, month, d) < today && !isToday(d);
      let dotsHtml = '';
      if (hasConcert) {
        dotsHtml = concerts.slice(0,3).map(c => {
          const color = c.confirmStatus === 'rumor' ? '#fbbf24'
                      : c.genre === 'kpop'  ? '#c084fc'
                      : c.genre === 'rock'  ? '#f87171'
                      : c.genre === 'jazz'  ? '#facc15'
                      : c.genre === 'indie' ? '#2dd4bf'
                      : '#ec4899';
          return `<span class="cal-dot" style="background:${color}"></span>`;
        }).join('');
      }
      const concertTitles = concerts.map(c => c.artist).join(', ');
      cells += `
        <div class="cal-cell${hasConcert ? ' cal-has-concert' : ''}${isToday(d) ? ' cal-today' : ''}${pastDay ? ' cal-past' : ''}"
             ${hasConcert ? `onclick="CalendarView.showDay(${year},${month},${d})"` : ''}
             ${hasConcert ? `title="${concertTitles}"` : ''}>
          <span class="cal-date">${d}</span>
          ${dotsHtml ? `<div class="cal-dots">${dotsHtml}</div>` : ''}
        </div>`;
    }

    // Total cell = firstDay + daysInMonth, pad to multiple of 7
    const totalCells = firstDay + daysInMonth;
    const remainder  = totalCells % 7;
    if (remainder !== 0) {
      for (let i = 0; i < 7 - remainder; i++) {
        cells += `<div class="cal-cell cal-empty"></div>`;
      }
    }

    // Daftar konser bulan ini
    const allConcerts = Object.values(concertMap).flat();
    const concertList = allConcerts.length
      ? allConcerts.map(c => {
          const past  = c.rawDate < today;
          const rumor = c.confirmStatus === 'rumor';
          return `
            <div class="cal-concert-item${past ? ' cal-ci-past' : ''}" onclick="openModal('${c.id}')">
              <div class="cal-ci-left">
                <div class="cal-ci-date">${c.rawDate.getDate()} ${MONTH_ID[c.rawDate.getMonth()]}</div>
                <div class="cal-ci-artist">${c.artist}</div>
                <div class="cal-ci-venue">${c.venue.split('(')[0].trim()}</div>
              </div>
              <span class="badge ${rumor ? 'badge-status-rumor' : past ? 'badge-status-past' : 'badge-status-upcoming'}" style="font-size:0.65rem;">
                ${rumor ? '🔮' : past ? 'Selesai' : '✅'}
              </span>
            </div>`;
        }).join('')
      : `<div class="cal-empty-month">Tidak ada konser di bulan ini 🎵</div>`;

    return `
      <div class="cal-wrap" id="calendarWrap">
        <div class="cal-header">
          <button class="cal-nav" onclick="CalendarView.prevMonth()">‹</button>
          <span class="cal-title">${MONTH_FULL[month]} ${year}</span>
          <button class="cal-nav" onclick="CalendarView.nextMonth()">›</button>
        </div>
        <div class="cal-grid">
          ${dayHeaders}
          ${cells}
        </div>
        <div class="cal-list-header">Konser Bulan Ini <span class="cal-list-count">${allConcerts.length}</span></div>
        <div class="cal-list">${concertList}</div>
      </div>`;
  }

  function show() {
    visible = true;
    let container = document.getElementById('calendarSection');
    if (!container) {
      container = document.createElement('section');
      container.id = 'calendarSection';
      container.className = 'calendar-section';
      const concertsSection = document.querySelector('.concerts-section');
      if (concertsSection) concertsSection.insertAdjacentElement('beforebegin', container);
      else document.querySelector('.filter-section').insertAdjacentElement('afterend', container);
    }
    container.style.display = 'block';
    container.innerHTML = `
      <div class="container">
        <div class="section-header" style="margin-bottom:20px;">
          <h2>🗓️ Tampilan <span class="gradient-text">Kalender</span></h2>
          <p>Lihat jadwal konser berdasarkan bulan</p>
        </div>
        ${renderCalendar(currentYear, currentMonth)}
      </div>`;
    document.getElementById('calToggleBtn')?.classList.add('active');
  }

  function hide() {
    visible = false;
    const container = document.getElementById('calendarSection');
    if (container) container.style.display = 'none';
    document.getElementById('calToggleBtn')?.classList.remove('active');
  }

  function toggle() {
    visible ? hide() : show();
  }

  function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    refresh();
  }

  function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    refresh();
  }

  function refresh() {
    const wrap = document.getElementById('calendarWrap');
    if (wrap) wrap.outerHTML = renderCalendar(currentYear, currentMonth);
  }

  function showDay(year, month, day) {
    const concerts = (getConcertsForMonth(year, month)[day] || []);
    if (concerts.length === 1) {
      openModal(concerts[0].id);
    } else if (concerts.length > 1) {
      // Buat mini popup daftar konser hari itu
      const existing = document.getElementById('calDayPopup');
      if (existing) existing.remove();

      const popup = document.createElement('div');
      popup.id = 'calDayPopup';
      popup.className = 'cal-day-popup';
      popup.innerHTML = `
        <div class="cal-day-popup-header">
          <span>${day} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'][month]} ${year}</span>
          <button onclick="document.getElementById('calDayPopup').remove()">✕</button>
        </div>
        ${concerts.map(c => `
          <div class="cal-day-popup-item" onclick="openModal('${c.id}');document.getElementById('calDayPopup')?.remove()">
            <span>${c.emoji}</span>
            <div>
              <div style="font-weight:700;font-size:0.88rem">${c.artist}</div>
              <div style="font-size:0.75rem;color:var(--text-muted)">${c.venue.split('(')[0].trim()}</div>
            </div>
          </div>`).join('')}`;
      document.body.appendChild(popup);
    }
  }

  return { toggle, show, hide, prevMonth, nextMonth, showDay };
})();
window.CalendarView = CalendarView;


/* ================================================================
   2. ADVANCED SEARCH
   ================================================================ */
const AdvancedSearch = (() => {
  let visible = false;
  let filters = {
    priceMax: 10000000,
    month:    'all',
    city:     'all',
    status:   'all',
  };

  const CITIES = ['Semua Kota', 'Jakarta', 'Tangerang', 'Banten', 'Ancol', 'Senayan', 'BSD'];
  const MONTHS_FULL = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  function formatRp(val) {
    if (val >= 1000000) return `Rp ${(val/1000000).toFixed(1).replace('.0','')}jt`;
    if (val >= 1000)    return `Rp ${(val/1000).toFixed(0)}rb`;
    return `Rp ${val}`;
  }

  function render() {
    const monthOpts = `<option value="all">Semua Bulan</option>` +
      MONTHS_FULL.map((m, i) => `<option value="${i}" ${filters.month == i ? 'selected' : ''}>${m}</option>`).join('');
    const cityOpts  = CITIES.map(c =>
      `<option value="${c === 'Semua Kota' ? 'all' : c}" ${filters.city === (c === 'Semua Kota' ? 'all' : c) ? 'selected' : ''}>${c}</option>`
    ).join('');

    return `
      <div class="adv-search-panel" id="advSearchPanel">
        <div class="adv-search-header">
          <h4>🔍 Advanced Search</h4>
          <button class="adv-reset" onclick="AdvancedSearch.reset()">Reset</button>
        </div>
        <div class="adv-search-body">

          <!-- Harga Max -->
          <div class="adv-group">
            <label class="adv-label">
              💰 Harga Tiket Maksimal
              <span class="adv-price-val" id="advPriceVal">${filters.priceMax >= 10000000 ? 'Semua Harga' : formatRp(filters.priceMax)}</span>
            </label>
            <input type="range" class="adv-slider" id="advPriceSlider"
              min="0" max="10000000" step="100000" value="${filters.priceMax}"
              oninput="AdvancedSearch.onSlider(this.value)" />
            <div class="adv-slider-labels">
              <span>Gratis</span>
              <span>Rp 1jt</span>
              <span>Rp 3jt</span>
              <span>Rp 5jt</span>
              <span>Semua</span>
            </div>
          </div>

          <!-- Bulan -->
          <div class="adv-group">
            <label class="adv-label">📅 Bulan</label>
            <select class="adv-select" id="advMonthSelect" onchange="AdvancedSearch.onMonth(this.value)">
              ${monthOpts}
            </select>
          </div>

          <!-- Kota -->
          <div class="adv-group">
            <label class="adv-label">📍 Kota / Area</label>
            <select class="adv-select" id="advCitySelect" onchange="AdvancedSearch.onCity(this.value)">
              ${cityOpts}
            </select>
          </div>

          <!-- Status -->
          <div class="adv-group">
            <label class="adv-label">🎫 Status</label>
            <div class="adv-status-btns">
              ${['all','confirmed','rumor'].map(s => `
                <button class="adv-status-btn${filters.status === s ? ' active' : ''}"
                  onclick="AdvancedSearch.onStatus('${s}')">
                  ${s === 'all' ? 'Semua' : s === 'confirmed' ? '✅ Confirmed' : '🔮 Rumor'}
                </button>`).join('')}
            </div>
          </div>

        </div>
        <button class="adv-apply" onclick="AdvancedSearch.apply()">Terapkan Filter →</button>
      </div>`;
  }

  function injectPanel() {
    const filterSection = document.querySelector('.filter-section .container');
    if (!filterSection) return;
    let panel = document.getElementById('advSearchPanel');
    if (!panel) {
      const div = document.createElement('div');
      div.innerHTML = render();
      filterSection.appendChild(div.firstElementChild);
    }
  }

  function toggle() {
    visible = !visible;
    let panel = document.getElementById('advSearchPanel');
    if (visible) {
      if (!panel) { injectPanel(); panel = document.getElementById('advSearchPanel'); }
      panel?.classList.add('open');
      document.getElementById('advSearchToggle')?.classList.add('active');
    } else {
      panel?.classList.remove('open');
      document.getElementById('advSearchToggle')?.classList.remove('active');
    }
  }

  function onSlider(val) {
    filters.priceMax = parseInt(val);
    const label = document.getElementById('advPriceVal');
    if (label) label.textContent = filters.priceMax >= 10000000 ? 'Semua Harga' : formatRp(filters.priceMax);
  }

  function onMonth(val) { filters.month = val === 'all' ? 'all' : parseInt(val); }
  function onCity(val)  { filters.city  = val; }
  function onStatus(val){ filters.status = val; document.querySelectorAll('.adv-status-btn').forEach(b => b.classList.toggle('active', b.textContent.trim().replace('✅ ','').replace('🔮 ','').toLowerCase() === val || (val==='all' && b.textContent.trim()==='Semua'))); }

  function apply() {
    if (typeof CONCERTS === 'undefined') return;

    let result = [...CONCERTS];

    // Filter status
    if (filters.status === 'confirmed') result = result.filter(c => c.confirmStatus === 'confirmed');
    if (filters.status === 'rumor')     result = result.filter(c => c.confirmStatus === 'rumor');

    // Filter harga
    if (filters.priceMax < 10000000) {
      result = result.filter(c => c.priceMin === 0 || c.priceMin <= filters.priceMax);
    }

    // Filter bulan
    if (filters.month !== 'all') {
      result = result.filter(c => c.rawDate.getMonth() === parseInt(filters.month));
    }

    // Filter kota
    if (filters.city !== 'all') {
      result = result.filter(c =>
        c.city.toLowerCase().includes(filters.city.toLowerCase()) ||
        c.venue.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Sort
    if (typeof SortOptions !== 'undefined') result = SortOptions.apply(result);

    // Render
    if (typeof renderCards === 'function') renderCards(result);

    // Scroll ke grid
    document.getElementById('concertsGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Toast
    if (typeof showToast === 'function') {
      showToast(`🔍 ${result.length} konser ditemukan`, 'info', 2500);
    }

    // Tutup panel
    toggle();
  }

  function reset() {
    filters = { priceMax: 10000000, month: 'all', city: 'all', status: 'all' };
    const panel = document.getElementById('advSearchPanel');
    if (panel) panel.outerHTML = render(); // Re-render fresh
    // Jangan auto-apply supaya user bisa lihat perubahan dulu
    if (typeof showToast === 'function') showToast('🔄 Filter direset', 'info', 2000);
    if (typeof renderCards === 'function' && typeof CONCERTS !== 'undefined') {
      let result = [...CONCERTS];
      if (typeof SortOptions !== 'undefined') result = SortOptions.apply(result);
      renderCards(result);
    }
  }

  return { toggle, onSlider, onMonth, onCity, onStatus, apply, reset };
})();
window.AdvancedSearch = AdvancedSearch;


/* ================================================================
   3. HARGA ALERT
   ================================================================ */
const HargaAlert = (() => {
  const KEY = 'cid_harga_alert';

  function getAlerts() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }
  function saveAlerts(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); }

  function addAlert(budget) {
    budget = parseInt(budget);
    if (!budget || budget < 50000) return { ok: false, msg: 'Budget minimal Rp 50.000' };
    const alerts = getAlerts();
    // Cegah duplikat yang sama persis
    if (alerts.includes(budget)) return { ok: false, msg: `Alert Rp ${(budget/1e6).toFixed(1)}jt sudah ada` };
    alerts.push(budget);
    saveAlerts(alerts);
    return { ok: true };
  }

  function removeAlert(budget) {
    const alerts = getAlerts().filter(a => a !== budget);
    saveAlerts(alerts);
  }

  function getMatchingConcerts(budget) {
    if (typeof CONCERTS === 'undefined') return [];
    return CONCERTS.filter(c =>
      c.confirmStatus !== 'rumor' &&
      c.priceMin > 0 &&
      c.priceMin <= budget &&
      c.rawDate > (typeof TODAY !== 'undefined' ? TODAY : new Date())
    );
  }

  function checkAndNotify() {
    const alerts = getAlerts();
    if (!alerts.length) return;
    alerts.forEach(budget => {
      const matches = getMatchingConcerts(budget);
      if (matches.length && typeof showToast === 'function') {
        showToast(
          `💰 ${matches.length} konser tersedia di bawah ${budget >= 1e6 ? `Rp ${(budget/1e6).toFixed(1)}jt` : `Rp ${(budget/1e3).toFixed(0)}rb`}!`,
          'success', 5000
        );
      }
    });
  }

  function renderPanel() {
    const alerts = getAlerts();
    const alertItems = alerts.length
      ? alerts.map(b => {
          const matches = getMatchingConcerts(b);
          const label   = b >= 1e6 ? `Rp ${(b/1e6).toFixed(1)}jt` : `Rp ${(b/1e3).toFixed(0)}rb`;
          return `
            <div class="ha-item">
              <div class="ha-item-left">
                <span class="ha-budget">${label}</span>
                <span class="ha-match">${matches.length} konser cocok</span>
              </div>
              <div class="ha-item-right">
                ${matches.length ? `<button class="ha-see" onclick="AdvancedSearch.onSlider(${b});AdvancedSearch.apply();HargaAlert.closePanel()">Lihat →</button>` : ''}
                <button class="ha-remove" onclick="HargaAlert.remove(${b})">✕</button>
              </div>
            </div>`;
        }).join('')
      : `<div class="ha-empty">Belum ada Harga Alert. Set budget dan kami akan beritahu kalau ada konser yang cocok!</div>`;

    return `
      <div class="ha-panel" id="haPanel">
        <div class="ha-panel-header">
          <h4>💰 Harga Alert</h4>
          <button class="ha-close" onclick="HargaAlert.closePanel()">✕</button>
        </div>
        <p class="ha-desc">Set budget maksimal kamu. Kami akan tunjukkan konser yang sesuai.</p>
        <form class="ha-form" onsubmit="HargaAlert.handleAdd(event)">
          <div class="ha-presets">
            ${[300000,500000,750000,1000000,2000000,3000000].map(v =>
              `<button type="button" class="ha-preset${alerts.includes(v) ? ' ha-preset-active' : ''}"
                onclick="HargaAlert.quickAdd(${v})">
                ${v >= 1e6 ? `Rp ${(v/1e6).toFixed(1)}jt` : `Rp ${(v/1e3).toFixed(0)}rb`}
              </button>`).join('')}
          </div>
          <div class="ha-custom-row">
            <input class="ha-input" type="number" id="haCustomInput"
              placeholder="Budget custom (contoh: 1500000)" min="50000" step="50000" />
            <button class="ha-add-btn" type="submit">+ Tambah</button>
          </div>
          <div class="ha-msg" id="haMsg"></div>
        </form>
        <div class="ha-list">${alertItems}</div>
      </div>`;
  }

  function openPanel() {
    let overlay = document.getElementById('haOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'haOverlay';
      overlay.className = 'ha-overlay';
      overlay.onclick = (e) => { if (e.target === overlay) closePanel(); };
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = renderPanel();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    const overlay = document.getElementById('haOverlay');
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function handleAdd(e) {
    e.preventDefault();
    const input = document.getElementById('haCustomInput');
    const val   = input?.value;
    if (!val) return;
    const result = addAlert(val);
    const msg    = document.getElementById('haMsg');
    if (msg) {
      msg.textContent = result.ok ? '✅ Alert ditambahkan!' : '⚠️ ' + result.msg;
      msg.style.color = result.ok ? '#4ade80' : '#f87171';
      setTimeout(() => { if (msg) msg.textContent = ''; }, 2500);
    }
    if (result.ok) {
      if (input) input.value = '';
      // Refresh panel
      const overlay = document.getElementById('haOverlay');
      if (overlay) overlay.innerHTML = renderPanel();
      if (typeof showToast === 'function') showToast('💰 Harga Alert ditambahkan!', 'success', 2500);
    }
  }

  function quickAdd(budget) {
    const result = addAlert(budget);
    if (result.ok && typeof showToast === 'function') {
      showToast(`💰 Alert Rp ${budget >= 1e6 ? (budget/1e6).toFixed(1)+'jt' : (budget/1e3).toFixed(0)+'rb'} ditambahkan!`, 'success', 2000);
    }
    // Refresh panel
    const overlay = document.getElementById('haOverlay');
    if (overlay && overlay.classList.contains('open')) overlay.innerHTML = renderPanel();
  }

  function remove(budget) {
    removeAlert(budget);
    const overlay = document.getElementById('haOverlay');
    if (overlay && overlay.classList.contains('open')) overlay.innerHTML = renderPanel();
    if (typeof showToast === 'function') showToast('🗑️ Alert dihapus', 'info', 2000);
  }

  return { openPanel, closePanel, handleAdd, quickAdd, remove, checkAndNotify, getAlerts, getMatchingConcerts };
})();
window.HargaAlert = HargaAlert;


/* ================================================================
   4. SPOTIFY INTEGRATION
   ================================================================ */
const SpotifyIntegration = (() => {
  // Spotify Artist ID — dari open.spotify.com/artist/ARTIST_ID
  const SPOTIFY_ARTISTS = {
    'blackpink-deadline-2025':       '41MozSoPIsD1dJM0CLPjZF',
    'bts-jakarta-2026':              '3Nrfpe0tUJi4K4DXYWgMUX',
    'avenged-sevenfold-jakarta-2026':'0nmQIMXWTXfhgOBdNzhGos',
    'the-weeknd-jakarta-2026':       '1Xyo4u8uXC1ZmMpatF05PJ',
    'mcr-hammersonic-2026':          '3RNrq3jvMZxD9ZyoOZbQOD',
    'mcr-jis-2026':                  '3RNrq3jvMZxD9ZyoOZbQOD',
    'dream-theater-2026':            '2aaLAng2L2aWD2FClzwiep',
    'laufey-jakarta-2026':           '7gW0r5CkdEUMl42fpwSn9a',
    'green-day-jakarta-2025':        '7sPZN2BJlkvX3WVxU5mlJA',
    'ateez-2026':                    '1z4g3DjMEIg9KORHMTSyeR',
    'the-neighbourhood-jakarta-2026':'4kSGbjWGxLwowfd57V9of3',
    'bryan-adams-jakarta-2026':      '3Z02hBLubJxuFJfhacLuqt',
    'five-sos-jakarta-2026':         '5WUlDfRSoLAfcVSX1WnrxN',
    'java-jazz-2026':                '0LyfQWJT6nXafLPZqxe9Of',
    'lalala-fest-2026':              '7jy3rLJdaqkdoif9IUQ2km',
    'exo-exhorizon-jakarta-2026':    '3cjEqqelV9zb4BYE3KB9YN',
    'enhypen-jakarta-2027':          '0s4QNfO6DVyRdFIMy3Af8l',
    'westlife-jakarta-2027':         '0NQiuqFGqfm4p0sR1OtCiz',
    'jaehyun-jakarta-2026':          '7wlFHeNHpZaHHUHhSFa6Fz',
    'ariana-grande-jakarta-rumor':   '66CXWjxzNUsdJxJ2JdwvnR',
    'olivia-rodrigo-jakarta-rumor':  '1McMsnEElThX1knmY4oliG',
    'charlie-puth-jakarta-rumor':    '6VuMaDnrHyPL1p4EHjYLi7',
    'post-malone-jakarta-rumor':     '246dkjvS1zLTtiykXe5h60',
    'bad-bunny-jakarta-rumor':       '4q3ewBCX7sLwd24euuV69X',
    'taylor-swift-jakarta-rumor':    '06HL4z0CvFAxyc27GXpf02',
    'coldplay-jakarta-rumor':        '4gzpq5DkT2qDeGs86M3XHD',
    'ed-sheeran-jakarta-rumor':      '6eUKZXaKkcviH0Ku9w2n3V',
    'dua-lipa-jakarta-rumor':        '6M2wZ9GZgrQXHCFfjv46we',
    'aespa-jakarta-rumor':           '4Mw9Gcu1LYa2PjGMxFQosB',
  };

  function getSpotifyId(concertId) {
    return SPOTIFY_ARTISTS[concertId] || null;
  }

  function renderEmbed(concertId, artist) {
    const spotifyId = getSpotifyId(concertId);
    if (!spotifyId) return '';

    return `
      <div class="spotify-section">
        <div class="spotify-header">
          <svg class="spotify-logo" viewBox="0 0 24 24" fill="#1DB954">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <span>Preview di Spotify</span>
        </div>
        <iframe
          class="spotify-embed"
          src="https://open.spotify.com/embed/artist/${spotifyId}?utm_source=generator&theme=0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Spotify — ${artist}">
        </iframe>
      </div>`;
  }

  return { renderEmbed, getSpotifyId };
})();
window.SpotifyIntegration = SpotifyIntegration;


/* ================================================================
   INIT — patch openModal untuk inject Spotify
   + tombol kalender, advanced search, harga alert di filter bar
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // ── Patch openModal untuk inject Spotify — dihandle oleh features.js ──

  // ── Inject tombol di filter bar (setelah sort-wrap) ──
  const sortWrap = document.querySelector('.sort-wrap');
  if (sortWrap) {
    const btnWrap = document.createElement('div');
    btnWrap.className = 'filter-extra-btns';
    btnWrap.innerHTML = `
      <button class="filter-extra-btn" id="calToggleBtn"
        onclick="CalendarView.toggle()" title="Tampilan Kalender">
        🗓️
      </button>
      <button class="filter-extra-btn" id="advSearchToggle"
        onclick="AdvancedSearch.toggle()" title="Advanced Search">
        ⚙️
      </button>
      <button class="filter-extra-btn ha-alert-btn" id="haAlertBtn"
        onclick="HargaAlert.openPanel()" title="Harga Alert">
        💰
        <span class="ha-badge" id="haBadge" style="display:none"></span>
      </button>`;
    sortWrap.insertAdjacentElement('afterend', btnWrap);
  }

  // ── Update badge Harga Alert ──
  function updateHaBadge() {
    const badge   = document.getElementById('haBadge');
    const alerts  = HargaAlert.getAlerts();
    if (!badge) return;
    if (alerts.length > 0) {
      badge.textContent = alerts.length;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }
  updateHaBadge();

  // Patch HargaAlert.quickAdd & remove untuk update badge
  const _origQuickAdd = HargaAlert.quickAdd;
  const _origRemove   = HargaAlert.remove;
  HargaAlert.quickAdd = function(b) { _origQuickAdd(b); updateHaBadge(); };
  HargaAlert.remove   = function(b) { _origRemove(b);   updateHaBadge(); };

  // ── Cek Harga Alert saat page load ──
  setTimeout(() => HargaAlert.checkAndNotify(), 2000);
});
