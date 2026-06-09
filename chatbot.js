/* ============================================================
   ConcertID Chatbot — Floating widget
   Menjawab pertanyaan seputar konser dari data CONCERTS
   Pure JS, no external API, no backend needed
   ============================================================ */

(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────────────── */
  const BOT_NAME   = 'ConcertBot 🎵';
  const BOT_AVATAR = '🎵';
  const TYPING_MS  = 700;

  /* ── Greeting & quick replies ───────────────────────────── */
  const GREETINGS = [
    'Halo! Saya <strong>ConcertBot</strong> 🎵<br>Tanya apa saja soal konser internasional di Indonesia!',
    'Hai! Ada yang bisa saya bantu soal konser? 🎶',
  ];

  const QUICK_REPLIES = [
    { label: '🎵 Konser apa yang upcoming?', msg: 'konser upcoming apa saja' },
    { label: '💜 BTS kapan?',                msg: 'BTS Jakarta kapan' },
    { label: '💀 A7X kapan?',               msg: 'Avenged Sevenfold kapan' },
    { label: '🌙 The Weeknd info',           msg: 'The Weeknd Jakarta' },
    { label: '💰 Konser termurah?',         msg: 'konser harga tiket termurah' },
    { label: '🔮 Ada rumor konser apa?',    msg: 'konser yang masih rumor' },
    { label: '📊 Analytics',                msg: 'analytics' },
  ];

  /* ── NLP helpers ────────────────────────────────────────── */
  const norm = s => s.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const contains = (text, ...words) => words.some(w => norm(text).includes(norm(w)));

  /* ── Intent detection ───────────────────────────────────── */
  function detectIntent(msg) {
    const m = norm(msg);

    // Greet
    if (contains(m, 'halo', 'hai', 'hi', 'hello', 'hei', 'pagi', 'siang', 'malam', 'apa kabar'))
      return { intent: 'greet' };

    // Analytics
    if (contains(m, 'analytics', 'dashboard', 'statistik', 'data promotor'))
      return { intent: 'analytics' };

    // Help
    if (contains(m, 'bantuan', 'help', 'apa bisa', 'bisa apa', 'fitur'))
      return { intent: 'help' };

    // List upcoming
    if (contains(m, 'upcoming', 'mendatang', 'akan datang', 'mau konser', 'jadwal konser', 'konser apa'))
      return { intent: 'list_upcoming' };

    // List past
    if (contains(m, 'sudah lewat', 'sudah selesai', 'past', 'kemarin', 'lalu', 'selesai'))
      return { intent: 'list_past' };

    // List rumor
    if (contains(m, 'rumor', 'gosip', 'belum pasti', 'kemungkinan', 'katanya'))
      return { intent: 'list_rumor' };

    // Price / harga
    if (contains(m, 'harga', 'tiket', 'berapa', 'murah', 'mahal', 'termurah', 'termahal'))
      return { intent: 'price', query: m };

    // Venue info
    if (contains(m, 'venue', 'di mana', 'dimana', 'lokasi', 'tempat', 'stadion', 'arena'))
      return { intent: 'venue', query: m };

    // Date/time
    if (contains(m, 'kapan', 'tanggal', 'bulan', 'jam berapa', 'waktu'))
      return { intent: 'date', query: m };

    // Specific artist search
    return { intent: 'artist_search', query: m };
  }

  /* ── Find matching concerts ─────────────────────────────── */
  function findConcerts(query) {
    if (!window.CONCERTS) return [];
    const q = norm(query);
    return CONCERTS.filter(c => {
      return (
        norm(c.artist).includes(q) ||
        norm(c.tour).includes(q) ||
        norm(c.venue).includes(q) ||
        norm(c.city).includes(q) ||
        norm(c.genre).includes(q) ||
        // nickname matching
        (q.includes('a7x') && norm(c.artist).includes('avenged')) ||
        (q.includes('mcr') && norm(c.artist).includes('chemical')) ||
        (q.includes('weeknd') && norm(c.artist).includes('weeknd')) ||
        (q.includes('5sos') && norm(c.artist).includes('seconds')) ||
        (q.includes('bts') && norm(c.artist).includes('bts')) ||
        (q.includes('kpop') && c.genre === 'kpop') ||
        (q.includes('rock') && c.genre === 'rock') ||
        (q.includes('jazz') && c.genre === 'jazz') ||
        (q.includes('indie') && c.genre === 'indie') ||
        ((q.includes('pop') || q.includes('r&b')) && c.genre === 'pop')
      );
    });
  }

  function isPastC(c)  { return c.rawDate < new Date('2026-06-09'); }
  function isRumorC(c) { return c.confirmStatus === 'rumor'; }

  function fmtConcert(c, short = false) {
    const status = isPastC(c) ? '📼 Lewat' : isRumorC(c) ? '🔮 Rumor' : '✅ Confirmed';
    if (short) return `<strong>${c.artist}</strong> — ${c.dates[0]} · ${status}`;
    return `
      <div class="cb-concert-card" onclick="openModal('${c.id}')">
        <div class="cb-cc-top">
          <span class="cb-cc-artist">${c.artist}</span>
          <span class="cb-cc-status">${status}</span>
        </div>
        <div class="cb-cc-info">📅 ${c.dates[0]}</div>
        <div class="cb-cc-info">📍 ${c.venue.split('(')[0].trim()}</div>
        ${c.priceMin > 0 ? `<div class="cb-cc-price">💰 Mulai Rp ${(c.priceMin/1e6).toFixed(1).replace('.0','')}jt</div>` : ''}
        <div class="cb-cc-tap">Tap untuk detail →</div>
      </div>`;
  }

  /* ── Generate responses ─────────────────────────────────── */
  function generateResponse(msg) {
    const { intent, query } = detectIntent(msg);
    const allC = window.CONCERTS || [];

    switch (intent) {

      case 'greet':
        return `Halo! Saya <strong>ConcertBot</strong> 🎵<br><br>Saya bisa bantu kamu cari info konser internasional di Indonesia — jadwal, harga tiket, venue, dan lainnya!<br><br>Mau tanya apa? 😊`;

      case 'help':
        return `Saya bisa jawab pertanyaan seperti:<br><br>
          🎵 "Konser apa yang upcoming?"<br>
          💰 "Berapa harga tiket BTS?"<br>
          📍 "The Weeknd konser di mana?"<br>
          📅 "MCR kapan konsernya?"<br>
          🔮 "Ada rumor konser apa?"<br><br>
          Coba tanya! 👇`;

      case 'analytics':
        return `📊 <strong>Analytics Dashboard</strong> tersedia khusus untuk promotor!<br><br>
          Kamu bisa lihat: interest per konser, klik detail, wishlist, review stats, dan export data CSV/JSON.<br><br>
          <a href="analytics.html" target="_blank" style="color:#c084fc;font-weight:600;">→ Buka Analytics Dashboard</a>`;

      case 'list_upcoming': {
        const upcoming = allC.filter(c => !isPastC(c) && !isRumorC(c));
        if (!upcoming.length) return 'Belum ada konser upcoming yang confirmed saat ini.';
        return `<strong>🎵 ${upcoming.length} Konser Upcoming Confirmed:</strong><br><br>` +
          upcoming.map(c => fmtConcert(c)).join('');
      }

      case 'list_past': {
        const past = allC.filter(c => isPastC(c)).slice(0, 5);
        return `<strong>📼 Konser yang sudah selesai (recent):</strong><br><br>` +
          past.map(c => `• ${fmtConcert(c, true)}`).join('<br>');
      }

      case 'list_rumor': {
        const rumors = allC.filter(c => isRumorC(c));
        if (!rumors.length) return 'Tidak ada konser dengan status rumor saat ini.';
        return `<strong>🔮 ${rumors.length} Konser yang masih Rumor:</strong><br><br>
          <em style="font-size:0.8rem;color:var(--text-muted)">⚠️ Belum dikonfirmasi resmi — jangan beli tiket dari calo!</em><br><br>` +
          rumors.map(c => `• <strong>${c.artist}</strong> — ${c.dates[0]}`).join('<br>');
      }

      case 'price': {
        const matches = findConcerts(query);
        if (!matches.length) {
          // Generic price range info
          const affordable = allC.filter(c => c.priceMin > 0 && c.priceMin < 1000000);
          const cheapest   = allC.filter(c => c.priceMin > 0).sort((a,b) => a.priceMin - b.priceMin)[0];
          return `💰 <strong>Info Harga Tiket:</strong><br><br>
            ${cheapest ? `Termurah: <strong>${cheapest.artist}</strong> mulai Rp ${(cheapest.priceMin/1000).toFixed(0)}rb` : ''}<br><br>
            Coba tanya spesifik, contoh: "berapa harga tiket BTS?" 😊`;
        }
        return matches.map(c => {
          if (c.priceMin === 0) return `<strong>${c.artist}</strong><br>💰 Harga: ${c.priceRange}<br>🎫 Cek: <a href="${c.ticketUrl}" target="_blank" style="color:#c084fc">${c.ticketPlatform}</a>`;
          return `<strong>${c.artist}</strong><br>
            💰 Range: <strong>${c.priceRange}</strong><br>
            📊 Kategori:<br>${c.ticketCategories.slice(0,4).map(t => `&nbsp;&nbsp;• ${t.name}: ${t.price}`).join('<br>')}<br>
            🎫 Beli: <a href="${c.ticketUrl}" target="_blank" style="color:#c084fc;font-weight:600">${c.ticketPlatform}</a>`;
        }).join('<hr style="border-color:var(--border);margin:12px 0">');
      }

      case 'venue': {
        const matches = findConcerts(query);
        if (!matches.length) return `Maaf, tidak ada konser yang cocok. Coba sebut nama artisnya! 😊`;
        return matches.map(c =>
          `<strong>${c.artist}</strong><br>📍 <strong>${c.venue}</strong><br>📍 ${c.city}<br>
           <a href="https://www.google.com/maps/search/${encodeURIComponent(c.venue+', '+c.city)}" target="_blank" style="color:#c084fc;font-size:0.8rem">→ Buka Google Maps</a>`
        ).join('<hr style="border-color:var(--border);margin:12px 0">');
      }

      case 'date': {
        const matches = findConcerts(query);
        if (!matches.length) return `Tidak ada konser yang cocok. Coba sebutkan nama artisnya! 😊`;
        return matches.map(c =>
          `<strong>${c.artist}</strong><br>
           📅 <strong>${c.dates.join(', ')}</strong><br>
           🕐 ${c.time}<br>
           📍 ${c.venue.split('(')[0].trim()}, ${c.city.split(',')[0]}<br>
           ${!isPastC(c) && !isRumorC(c) ? `🎫 Tiket: <a href="${c.ticketUrl}" target="_blank" style="color:#c084fc">${c.ticketPlatform}</a>` : ''}`
        ).join('<hr style="border-color:var(--border);margin:12px 0">');
      }

      case 'artist_search': {
        const matches = findConcerts(query);
        if (!matches.length) {
          // Suggest similar
          const sugg = allC.filter(c => !isPastC(c)).slice(0, 3);
          return `Maaf, tidak ada konser yang cocok dengan "<em>${msg}</em>".<br><br>
            Mungkin maksud kamu:<br>${sugg.map(c=>`• ${c.artist}`).join('<br>')}<br><br>
            Atau coba kata kunci lain! 😊`;
        }
        return `<strong>Ditemukan ${matches.length} konser:</strong><br><br>` +
          matches.map(c => fmtConcert(c)).join('');
      }

      default:
        return `Maaf, saya belum bisa menjawab itu. 😅<br>Coba tanya soal jadwal, harga tiket, atau venue konser! 🎵`;
    }
  }

  /* ── Build DOM ───────────────────────────────────────────── */
  function buildWidget() {
    const wrap = document.createElement('div');
    wrap.id    = 'cb-wrap';
    wrap.innerHTML = `
      <!-- Toggle button -->
      <button id="cb-toggle" aria-label="Buka chatbot">
        <span id="cb-toggle-icon">💬</span>
        <span class="cb-notif" id="cbNotif">1</span>
      </button>

      <!-- Chat window -->
      <div id="cb-window" role="dialog" aria-label="ConcertBot">
        <div id="cb-header">
          <div class="cb-hdr-left">
            <div class="cb-avatar">${BOT_AVATAR}</div>
            <div>
              <div class="cb-hdr-name">${BOT_NAME}</div>
              <div class="cb-hdr-status"><span class="cb-dot"></span>Online</div>
            </div>
          </div>
          <div class="cb-hdr-actions">
            <a href="analytics.html" target="_blank" class="cb-hdr-btn" title="Analytics">📊</a>
            <button class="cb-hdr-btn" id="cb-close" title="Tutup">✕</button>
          </div>
        </div>

        <div id="cb-messages"></div>

        <div id="cb-quick"></div>

        <div id="cb-input-wrap">
          <input id="cb-input" type="text" placeholder="Tanya soal konser..." maxlength="200" autocomplete="off" />
          <button id="cb-send">↑</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
  }

  /* ── Message rendering ───────────────────────────────────── */
  function addMessage(html, role = 'bot', isTyping = false) {
    const msgs  = document.getElementById('cb-messages');
    const div   = document.createElement('div');
    div.className = `cb-msg cb-msg-${role}`;
    if (isTyping) {
      div.className += ' cb-typing';
      div.innerHTML  = '<span></span><span></span><span></span>';
    } else {
      div.innerHTML = `<div class="cb-bubble">${html}</div>`;
    }
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function botReply(html) {
    const typingEl = addMessage('', 'bot', true);
    setTimeout(() => {
      typingEl.remove();
      addMessage(html, 'bot');
      // track in GA if available
      if (window.gtag) gtag('event', 'chatbot_response', { event_category: 'chatbot' });
    }, TYPING_MS);
  }

  /* ── Quick reply pills ───────────────────────────────────── */
  function renderQuickReplies() {
    const qr = document.getElementById('cb-quick');
    qr.innerHTML = QUICK_REPLIES.map(r =>
      `<button class="cb-qr" data-msg="${r.msg}">${r.label}</button>`
    ).join('');
    qr.querySelectorAll('.cb-qr').forEach(btn => {
      btn.addEventListener('click', () => handleSend(btn.dataset.msg));
    });
  }

  /* ── Send ────────────────────────────────────────────────── */
  function handleSend(text) {
    const msg = (text || document.getElementById('cb-input').value).trim();
    if (!msg) return;
    document.getElementById('cb-input').value = '';

    // track click
    trackClick('chatbot_query');

    addMessage(msg, 'user');
    const response = generateResponse(msg);
    botReply(response);
  }

  /* ── Click tracking helper ──────────────────────────────── */
  function trackClick(id) {
    try {
      const cl = JSON.parse(localStorage.getItem('cid_clicks') || '{}');
      cl[id] = (cl[id] || 0) + 1;
      localStorage.setItem('cid_clicks', JSON.stringify(cl));
    } catch {}
  }

  /* ── Open / Close ─────────────────────────────────────────── */
  function openChat() {
    document.getElementById('cb-window').classList.add('open');
    document.getElementById('cb-toggle-icon').textContent = '✕';
    document.getElementById('cbNotif').style.display = 'none';
    document.getElementById('cb-input').focus();
  }
  function closeChat() {
    document.getElementById('cb-window').classList.remove('open');
    document.getElementById('cb-toggle-icon').textContent = '💬';
  }

  /* ── Init ────────────────────────────────────────────────── */
  function init() {
    buildWidget();

    // Events
    document.getElementById('cb-toggle').addEventListener('click', () => {
      document.getElementById('cb-window').classList.contains('open') ? closeChat() : openChat();
    });
    document.getElementById('cb-close').addEventListener('click', closeChat);
    document.getElementById('cb-send').addEventListener('click', () => handleSend());
    document.getElementById('cb-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') handleSend();
    });

    // Welcome message
    setTimeout(() => {
      addMessage(GREETINGS[0], 'bot');
      renderQuickReplies();
      // Show notif bubble after 3s if chat not opened
      setTimeout(() => {
        if (!document.getElementById('cb-window').classList.contains('open')) {
          document.getElementById('cbNotif').style.display = 'flex';
        }
      }, 3000);
    }, 800);

    // Track page view
    try {
      const pv = parseInt(localStorage.getItem('cid_pageviews') || '0') + 1;
      localStorage.setItem('cid_pageviews', String(pv));
    } catch {}
  }

  // Wait for DOM + CONCERTS data
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }

})();
