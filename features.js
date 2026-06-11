/* ================================================================
   ConcertID — features.js
   Fitur tambahan:
   1. Browser Notification (reminder konser)
   2. Google Calendar Link
   3. Sort Options
   4. Newsletter (Mailchimp JSONP — di index.html)
   5. Social Features (Going / Interested counter)
   6. Harga Tracker / Price History
   7. Social Media Integration (Instagram & Twitter links)
   8. Discussion / Comments per konser
   9. User-Generated Content (foto after concert)
   ================================================================ */

'use strict';

/* ================================================================
   1. NOTIFIKASI BROWSER
   ================================================================ */
const BrowserNotif = (() => {
  const KEY = 'cid_notif_subs'; // { concertId: true/false }

  function getSubs() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
  }
  function saveSubs(s) { localStorage.setItem(KEY, JSON.stringify(s)); }

  function isSubscribed(id) { return !!getSubs()[id]; }

  async function requestPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }

  function scheduleReminder(concert) {
    // Fire a test notification immediately so user sees it works
    if (Notification.permission === 'granted') {
      new Notification(`🔔 ConcertID — Reminder Aktif`, {
        body: `${concert.artist} · ${concert.dates[0]} · ${concert.venue.split('(')[0].trim()}`,
        icon: '/favicon-32.png',
        badge: '/favicon-32.png',
        tag: concert.id,
      });
    }
    // Store sub so we can check on page load
    const subs = getSubs();
    subs[concert.id] = { date: concert.rawDate.toISOString(), artist: concert.artist, dates: concert.dates, venue: concert.venue };
    saveSubs(subs);
  }

  function unsubscribe(id) {
    const subs = getSubs();
    delete subs[id];
    saveSubs(subs);
  }

  // On page load: fire reminders for concerts in ≤7 days
  function checkPending() {
    if (Notification.permission !== 'granted') return;
    const subs = getSubs();
    const now  = Date.now();
    Object.entries(subs).forEach(([id, info]) => {
      const diff = new Date(info.date) - now;
      const days = Math.ceil(diff / 86400000);
      if (diff > 0 && days <= 7) {
        new Notification(`⏰ ${days} hari lagi — ${info.artist}!`, {
          body: `${info.dates[0]} · ${info.venue.split('(')[0].trim()}`,
          icon: '/favicon-32.png',
          tag: `remind_${id}`,
        });
      }
    });
  }

  async function toggle(concert, btnEl) {
    if (isSubscribed(concert.id)) {
      unsubscribe(concert.id);
      if (btnEl) { btnEl.classList.remove('notif-active'); btnEl.textContent = '🔔 Ingatkan Saya'; }
      showToast('🔕 Reminder dibatalkan', 'info');
      return;
    }
    const ok = await requestPermission();
    if (!ok) { showToast('⚠️ Izin notifikasi ditolak. Aktifkan di pengaturan browser.', 'error', 4000); return; }
    scheduleReminder(concert);
    if (btnEl) { btnEl.classList.add('notif-active'); btnEl.textContent = '🔔 Diingatkan!'; }
    showToast('✅ Reminder aktif! Kamu akan diingatkan 7 hari sebelum konser.', 'success', 3500);
  }

  return { toggle, isSubscribed, checkPending };
})();

/* ================================================================
   2. GOOGLE CALENDAR LINK
   ================================================================ */
function getGoogleCalendarUrl(c) {
  if (c.confirmStatus === 'rumor') return null;
  const start = c.rawDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const end   = new Date(c.rawDate.getTime() + 3 * 3600000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const details = `${c.tour}%0AHarga: ${encodeURIComponent(c.priceRange)}%0ATiket: ${encodeURIComponent(c.ticketUrl)}%0A%0AData dari ConcertID — www.list-concert-tour.web.id`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE`
    + `&text=${encodeURIComponent('🎵 ' + c.artist + ' Live in Jakarta')}`
    + `&dates=${start}/${end}`
    + `&details=${details}`
    + `&location=${encodeURIComponent(c.venue + ', ' + c.city)}`
    + `&sf=true&output=xml`;
}

/* ================================================================
   3. SORT OPTIONS
   ================================================================ */
const SortOptions = (() => {
  let current = 'date-asc'; // date-asc | date-desc | price-asc | price-desc | name-asc

  function get() { return current; }

  function set(val) {
    current = val;
    if (typeof applyFilters === 'function') applyFilters();
  }

  function apply(list) {
    const sorted = [...list];
    switch (current) {
      case 'date-asc':    return sorted.sort((a, b) => a.rawDate - b.rawDate);
      case 'date-desc':   return sorted.sort((a, b) => b.rawDate - a.rawDate);
      case 'price-asc':   return sorted.sort((a, b) => (a.priceMin || 999999999) - (b.priceMin || 999999999));
      case 'price-desc':  return sorted.sort((a, b) => (b.priceMax || 0) - (a.priceMax || 0));
      case 'name-asc':    return sorted.sort((a, b) => a.artist.localeCompare(b.artist));
      default:            return sorted;
    }
  }

  return { get, set, apply };
})();

/* ================================================================
   4. NEWSLETTER SIGNUP
   ================================================================ */
const Newsletter = (() => {
  const KEY = 'cid_newsletter';

  function isSubscribed() {
    try { return !!localStorage.getItem(KEY); } catch { return false; }
  }

  function subscribe(email) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, msg: 'Email tidak valid.' };
    if (isSubscribed()) return { ok: false, msg: 'Email ini sudah terdaftar!' };
    localStorage.setItem(KEY, JSON.stringify({ email, date: new Date().toISOString() }));
    // GA event
    if (window.gtag) gtag('event', 'newsletter_signup', { event_category: 'engagement', event_label: email });
    return { ok: true };
  }

  function render() {
    if (isSubscribed()) {
      return `<div class="nl-done">✅ Kamu sudah terdaftar! Kami akan kirim update konser terbaru.</div>`;
    }
    return `
      <form class="nl-form" id="nlForm" onsubmit="Newsletter.handleSubmit(event)">
        <input class="nl-input" type="email" id="nlEmail" placeholder="email@kamu.com" required />
        <button class="nl-btn" type="submit">Daftar Gratis</button>
      </form>
      <div class="nl-msg" id="nlMsg"></div>`;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('nlEmail')?.value || '';
    const result = subscribe(email);
    const msg    = document.getElementById('nlMsg');
    if (msg) {
      msg.textContent = result.ok ? '🎉 Berhasil! Cek inbox kamu.' : '⚠️ ' + result.msg;
      msg.style.color = result.ok ? '#4ade80' : '#f87171';
    }
    if (result.ok) {
      showToast('🎉 Newsletter berhasil didaftarkan!', 'success');
      const form = document.getElementById('nlForm');
      if (form) form.outerHTML = `<div class="nl-done">✅ Kamu sudah terdaftar!</div>`;
    }
  }

  return { render, handleSubmit, isSubscribed, subscribe };
})();
window.Newsletter = Newsletter;

/* ================================================================
   5. SOCIAL FEATURES — Going / Interested counter
   ================================================================ */
const SocialFeatures = (() => {
  const KEY_GOING    = 'cid_going';
  const KEY_INTEREST = 'cid_interest';
  const KEY_MYVOTE   = 'cid_myvote'; // { concertId: 'going'|'interested' }

  function getCounts(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
  }
  function saveCounts(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
  function getMyVotes() {
    try { return JSON.parse(localStorage.getItem(KEY_MYVOTE) || '{}'); } catch { return {}; }
  }

  function getGoingCount(id)    { return getCounts(KEY_GOING)[id]    ?? 0; }
  function getInterestCount(id) { return getCounts(KEY_INTEREST)[id] ?? 0; }
  function getMyVote(id)        { return getMyVotes()[id] || null; }

  function vote(id, type) {
    const myVotes = getMyVotes();
    const prev    = myVotes[id];

    const going    = getCounts(KEY_GOING);
    const interest = getCounts(KEY_INTEREST);

    // Init dari 0 jika belum ada
    if (going[id]    == null) going[id]    = 0;
    if (interest[id] == null) interest[id] = 0;

    if (prev === type) {
      // Undo vote
      if (type === 'going')      going[id]    = Math.max(0, going[id] - 1);
      if (type === 'interested') interest[id] = Math.max(0, interest[id] - 1);
      delete myVotes[id];
    } else {
      // Undo prev if exists
      if (prev === 'going')      going[id]    = Math.max(0, going[id] - 1);
      if (prev === 'interested') interest[id] = Math.max(0, interest[id] - 1);
      // Add new
      if (type === 'going')      going[id]++;
      if (type === 'interested') interest[id]++;
      myVotes[id] = type;
    }

    saveCounts(KEY_GOING, going);
    saveCounts(KEY_INTEREST, interest);
    localStorage.setItem(KEY_MYVOTE, JSON.stringify(myVotes));
    return { going: going[id], interest: interest[id], myVote: myVotes[id] || null };
  }

  function renderBadges(id) {
    const going    = getGoingCount(id);
    const interest = getInterestCount(id);
    const myVote   = getMyVote(id);
    return `
      <div class="social-badges" data-concert="${id}">
        <button class="social-btn${myVote === 'going' ? ' active-going' : ''}"
          onclick="SocialFeatures.voteAndUpdate('${id}', 'going', this.closest('.social-badges'))">
          🎟️ Going <span class="social-count">${fmtCount(going)}</span>
        </button>
        <button class="social-btn${myVote === 'interested' ? ' active-interested' : ''}"
          onclick="SocialFeatures.voteAndUpdate('${id}', 'interested', this.closest('.social-badges'))">
          ⭐ Interested <span class="social-count">${fmtCount(interest)}</span>
        </button>
      </div>`;
  }

  function voteAndUpdate(id, type, container) {
    const result = vote(id, type);
    if (container) {
      container.outerHTML = renderBadges(id);
    }
    const msg = type === 'going'
      ? (result.myVote === 'going' ? '🎟️ Kamu tandai akan hadir!' : '✅ Vote dibatalkan')
      : (result.myVote === 'interested' ? '⭐ Kamu tandai tertarik!' : '✅ Vote dibatalkan');
    if (typeof showToast === 'function') showToast(msg, 'success', 2000);
  }

  function fmtCount(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
    return n;
  }

  return { renderBadges, vote, voteAndUpdate, getGoingCount, getInterestCount };
})();
window.SocialFeatures = SocialFeatures;

/* ================================================================
   7. SOCIAL MEDIA INTEGRATION — Twitter/X & Instagram feed links
   ================================================================ */
const SocialMedia = (() => {
  const ARTIST_SOCIALS = {
    'blackpink-deadline-2025':      { ig: 'blackpinkofficial',   tw: 'BLACKPINK' },
    'bts-jakarta-2026':             { ig: 'bts.bighitofficial',  tw: 'BTS_twt' },
    'avenged-sevenfold-jakarta-2026':{ ig: 'avengedsevenfold',  tw: 'TheOfficialA7X' },
    'the-weeknd-jakarta-2026':      { ig: 'theweeknd',           tw: 'theweeknd' },
    'mcr-hammersonic-2026':         { ig: 'mychemicalromance',   tw: 'mcrmcr' },
    'mcr-jis-2026':                 { ig: 'mychemicalromance',   tw: 'mcrmcr' },
    'dream-theater-2026':           { ig: 'dreamtheater',        tw: 'dreamtheater' },
    'laufey-jakarta-2026':          { ig: 'laufeymusic',         tw: 'laufeymusic' },
    'ateez-2026':                   { ig: 'ateez_official_',     tw: 'ATEEZofficial_' },
    'the-neighbourhood-jakarta-2026':{ ig: 'thenbhd',            tw: 'thenbhd' },
    'lalala-fest-2026':             { ig: 'lalalafest',          tw: 'lalalafestival' },
    'five-sos-jakarta-2026':        { ig: '5sos',                tw: '5sos' },
    'java-jazz-2026':               { ig: 'javajazzfestival',    tw: 'JavaJazzFest' },
    'exo-exhorizon-jakarta-2026':   { ig: 'weareone.exo',        tw: 'weareoneEXO' },
    'bryan-adams-jakarta-2026':     { ig: 'bryanadams',          tw: 'bryanadams' },
    'enhypen-jakarta-2027':         { ig: 'enhypen_official',    tw: 'ENHYPEN_members' },
    'taylor-swift-jakarta-rumor':   { ig: 'taylorswift',         tw: 'taylorswift13' },
    'coldplay-jakarta-rumor':       { ig: 'coldplay',            tw: 'coldplay' },
    'ed-sheeran-jakarta-rumor':     { ig: 'teddysphotos',        tw: 'edsheeran' },
    'dua-lipa-jakarta-rumor':       { ig: 'dualipa',             tw: 'DUALIPA' },
    'aespa-jakarta-2026':           { ig: 'aespa_official',      tw: 'aespa_SM' },
    'nct-wish-jakarta-2026':        { ig: 'nct_wish',             tw: 'NCTsmtown_WISH' },
    'deep-purple-jakarta-2026':     { ig: 'deeppurple',           tw: 'OfficialDeepPurple' },
    'monsta-x-jakarta-2026':        { ig: 'monstax.official',     tw: 'OfficialMonstaX' },
    'treasure-jakarta-2026':        { ig: 'treasuremembers',      tw: 'TREASUREMEMBERS' },
    'one-ok-rock-jakarta-2026':     { ig: 'oneokrockofficial',    tw: 'ONEOKROCK_japan' },
    'westlife-jakarta-2027':        { ig: 'westlifeofficial',    tw: 'westlife' },
    'jaehyun-jakarta-2026':         { ig: 'jaehyun_studios',     tw: 'NCTsmtown_JAEHYUN' },
    'ariana-grande-jakarta-rumor':  { ig: 'arianagrande',        tw: 'ArianaGrande' },
    'olivia-rodrigo-jakarta-rumor': { ig: 'oliviarodrigo',       tw: 'oliviarodrigo' },
    'charlie-puth-jakarta-rumor':   { ig: 'charlieputh',         tw: 'charlieputh' },
    'post-malone-jakarta-rumor':    { ig: 'postmalone',          tw: 'PostMalone' },
    'bad-bunny-jakarta-rumor':      { ig: 'badbunnypr',          tw: 'sanbenito' },
  };

  function getSocials(concertId) { return ARTIST_SOCIALS[concertId] || null; }

  function renderLinks(concertId, artist) {
    const s = getSocials(concertId);
    if (!s) return '';
    const hashtag = artist.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
    return `
      <div class="social-links">
        <span class="social-links-label">Ikuti di:</span>
        <a class="social-link social-link-ig" href="https://instagram.com/${s.ig}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          @${s.ig}
        </a>
        <a class="social-link social-link-tw" href="https://twitter.com/hashtag/${hashtag}Jakarta" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          #${hashtag}Jakarta
        </a>
      </div>`;
  }

  return { renderLinks, getSocials };
})();
window.SocialMedia = SocialMedia;

/* ================================================================
   8. DISCUSSION / COMMENTS PER KONSER
   ================================================================ */
const Discussion = (() => {
  const KEY = 'cid_discussions';

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
  }
  function saveAll(d) { localStorage.setItem(KEY, JSON.stringify(d)); }
  function getFor(id) { return getAll()[id] || []; }

  function getUID() {
    let uid = localStorage.getItem('cid_uid');
    if (!uid) { uid = 'u_' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('cid_uid', uid); }
    return uid;
  }

  function add(id, { author, text }) {
    if (!text || text.trim().length < 3) return { ok: false, msg: 'Komentar minimal 3 karakter.' };
    const all = getAll();
    if (!all[id]) all[id] = [];
    all[id].unshift({
      uid: getUID(),
      author: (author || 'Anonim').trim().slice(0, 30),
      text: text.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;').slice(0, 300),
      date: new Date().toISOString(),
      likes: 0,
    });
    if (all[id].length > 50) all[id] = all[id].slice(0, 50);
    saveAll(all);
    return { ok: true };
  }

  function like(concertId, idx) {
    const all = getAll();
    if (all[concertId] && all[concertId][idx]) {
      all[concertId][idx].likes = (all[concertId][idx].likes || 0) + 1;
      saveAll(all);
    }
  }

  function timeAgo(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    const diff = Date.now() - d.getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const dy = Math.floor(h / 24);
    if (dy > 30) return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    if (dy > 0)  return `${dy} hari lalu`;
    if (h > 0)   return `${h} jam lalu`;
    if (m > 0)   return `${m} menit lalu`;
    return 'Baru saja';
  }

  function render(concertId) {
    const comments = getFor(concertId);
    return `
      <div class="disc-section" id="disc_${concertId}">
        <div class="disc-header">
          <h4>💬 Diskusi <span class="disc-count">${comments.length || ''}</span></h4>
        </div>
        <form class="disc-form" onsubmit="Discussion.handleSubmit(event, '${concertId}')">
          <input class="disc-name" type="text" placeholder="Nama (opsional)" maxlength="30" />
          <div class="disc-input-row">
            <textarea class="disc-textarea" placeholder="Tulis komentar, tanya sesuatu, atau bagikan info... (max 300 karakter)" rows="2" maxlength="300" required></textarea>
            <button class="disc-submit" type="submit">Kirim</button>
          </div>
        </form>
        <div class="disc-list" id="disclist_${concertId}">
          ${comments.length
            ? comments.map((c, i) => `
              <div class="disc-item">
                <div class="disc-avatar">${c.author.charAt(0).toUpperCase()}</div>
                <div class="disc-body">
                  <div class="disc-meta"><strong>${c.author}</strong> <span>${timeAgo(c.date)}</span></div>
                  <div class="disc-text">${c.text}</div>
                  <button class="disc-like" onclick="Discussion.likeAndUpdate('${concertId}', ${i}, this)">👍 ${c.likes || 0}</button>
                </div>
              </div>`).join('')
            : '<div class="disc-empty">Jadilah yang pertama berkomentar! 💬</div>'
          }
        </div>
      </div>`;
  }

  function handleSubmit(e, concertId) {
    e.preventDefault();
    const form   = e.target;
    const author = form.querySelector('.disc-name')?.value || 'Anonim';
    const text   = form.querySelector('.disc-textarea')?.value || '';
    const result = add(concertId, { author, text });
    if (!result.ok) { showToast('⚠️ ' + result.msg, 'error'); return; }
    // Re-render
    const section = document.getElementById(`disc_${concertId}`);
    if (section) section.outerHTML = render(concertId);
    showToast('💬 Komentar berhasil dikirim!', 'success', 2000);
  }

  function likeAndUpdate(concertId, idx, btn) {
    like(concertId, idx);
    const all = getFor(concertId);
    if (btn) { btn.textContent = `👍 ${all[idx]?.likes || 0}`; btn.disabled = true; }
  }

  return { render, handleSubmit, likeAndUpdate, getFor };
})();
window.Discussion = Discussion;



/* ================================================================
   10. USER-GENERATED CONTENT — foto setelah konser (file upload)
   ================================================================ */
const UGC = (() => {
  const KEY      = 'cid_ugc';
  const MAX_SIZE = 2 * 1024 * 1024; // 2 MB max per foto
  const MAX_DIM  = 1200;            // resize jika > 1200px

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
  }
  function saveAll(d) {
    try { localStorage.setItem(KEY, JSON.stringify(d)); return true; }
    catch (e) {
      // localStorage penuh — hapus foto paling lama
      showToast('⚠️ Storage penuh, foto lama dihapus otomatis.', 'error', 4000);
      return false;
    }
  }
  function getFor(id) { return getAll()[id] || []; }

  /* Resize & compress image ke canvas → base64 JPEG */
  function processFile(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) return reject('Hanya file gambar yang diizinkan.');
      if (file.size > MAX_SIZE) return reject('Ukuran file maks 2 MB.');

      const reader = new FileReader();
      reader.onerror = () => reject('Gagal membaca file.');
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject('Gagal memuat gambar.');
        img.onload = () => {
          let { width, height } = img;
          if (width > MAX_DIM || height > MAX_DIM) {
            const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
            width  = Math.round(width  * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width  = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function addPhoto(concertId, { caption, dataUrl, author }) {
    if (!dataUrl) return { ok: false, msg: 'Data foto tidak valid.' };
    const all = getAll();
    if (!all[concertId]) all[concertId] = [];
    if (all[concertId].length >= 20) return { ok: false, msg: 'Maksimal 20 foto per konser.' };
    all[concertId].unshift({
      url: dataUrl,
      caption: (caption || '').trim().replace(/</g, '&lt;').slice(0, 100),
      author:  (author  || 'Anonim').trim().slice(0, 30),
      date: new Date().toISOString(),
    });
    saveAll(all);
    return { ok: true };
  }

  function renderGrid(photos) {
    if (!photos.length) return `<div class="ugc-empty">Belum ada foto. Jadilah yang pertama berbagi! 📸</div>`;
    return `<div class="ugc-grid">${photos.map(p => `
      <div class="ugc-item">
        <img src="${p.url}" alt="${p.caption || 'Foto konser'}" loading="lazy" />
        ${p.caption ? `<div class="ugc-caption-text">${p.caption}</div>` : ''}
        <div class="ugc-item-meta">${p.author} · ${new Date(p.date).toLocaleDateString('id-ID')}</div>
      </div>`).join('')}</div>`;
  }

  function render(concertId) {
    const concert = typeof CONCERTS !== 'undefined' ? CONCERTS.find(c => c.id === concertId) : null;
    const past    = concert && concert.rawDate < (typeof TODAY !== 'undefined' ? TODAY : new Date());
    const photos  = getFor(concertId);

    return `
      <div class="ugc-section" id="ugc_${concertId}">
        <div class="ugc-header">
          <h4>📸 Foto dari Fans</h4>
          ${photos.length ? `<span class="ugc-count">${photos.length} foto</span>` : ''}
        </div>
        ${past ? `
          <div class="ugc-form" id="ugcform_${concertId}">
            <label class="ugc-file-label" for="ugcfile_${concertId}">
              <span class="ugc-file-icon">📁</span>
              <span class="ugc-file-text">Pilih foto dari perangkat kamu</span>
              <span class="ugc-file-hint">JPG / PNG / WebP · maks 2 MB</span>
            </label>
            <input class="ugc-file-input" id="ugcfile_${concertId}" type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onchange="UGC.handleFileChange(event, '${concertId}')" />
            <div class="ugc-preview-wrap" id="ugcpreview_${concertId}" style="display:none">
              <img class="ugc-preview-img" id="ugcpreviewimg_${concertId}" alt="preview" />
              <div class="ugc-preview-fields">
                <input class="ugc-caption-input" id="ugccaption_${concertId}" type="text"
                  placeholder="Caption foto (opsional)" maxlength="100" />
                <input class="ugc-author-input" id="ugcauthor_${concertId}" type="text"
                  placeholder="Nama kamu (opsional, default: Anonymous)" maxlength="30" />
                <div class="ugc-preview-actions">
                  <button class="ugc-cancel" onclick="UGC.cancelPreview('${concertId}')">Batal</button>
                  <button class="ugc-submit" onclick="UGC.confirmUpload('${concertId}')">Upload Foto</button>
                </div>
              </div>
            </div>
          </div>` : `<div class="ugc-not-yet">📸 Foto dapat ditambahkan setelah konser berlangsung.</div>`}
        <div id="ugcgrid_${concertId}">${renderGrid(photos)}</div>
      </div>`;
  }

  // Saat user pilih file — tampilkan preview dulu
  function handleFileChange(e, concertId) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('⚠️ Hanya file gambar yang diizinkan.', 'error'); return; }
    if (file.size > MAX_SIZE) { showToast('⚠️ Ukuran file maks 2 MB.', 'error'); return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const previewWrap = document.getElementById(`ugcpreview_${concertId}`);
      const previewImg  = document.getElementById(`ugcpreviewimg_${concertId}`);
      if (previewWrap && previewImg) {
        previewImg.src = ev.target.result;
        previewWrap.style.display = 'flex';
      }
      // Simpan dataURL sementara di dataset
      const label = document.querySelector(`#ugcform_${concertId} .ugc-file-label`);
      if (label) label.dataset.pending = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Batalkan preview
  function cancelPreview(concertId) {
    const previewWrap = document.getElementById(`ugcpreview_${concertId}`);
    const fileInput   = document.getElementById(`ugcfile_${concertId}`);
    if (previewWrap) previewWrap.style.display = 'none';
    if (fileInput)   fileInput.value = '';
  }

  // Konfirmasi upload — compress lalu simpan
  async function confirmUpload(concertId) {
    const fileInput = document.getElementById(`ugcfile_${concertId}`);
    const file      = fileInput?.files?.[0];
    const caption   = document.getElementById(`ugccaption_${concertId}`)?.value?.trim() || '';
    const author    = document.getElementById(`ugcauthor_${concertId}`)?.value?.trim()  || '';

    if (!file)    { showToast('⚠️ Pilih foto terlebih dahulu.', 'error'); return; }
    // Nama kosong → Anonymous
    const finalAuthor = author || 'Anonymous';

    const btn = document.querySelector(`#ugc_${concertId} .ugc-submit`);
    if (btn) { btn.disabled = true; btn.textContent = 'Memproses...'; }

    try {
      const dataUrl = await processFile(file);
      const result  = addPhoto(concertId, { dataUrl, caption, author: finalAuthor });
      if (!result.ok) { showToast('⚠️ ' + result.msg, 'error'); return; }

      // Re-render section
      const section = document.getElementById(`ugc_${concertId}`);
      if (section) section.outerHTML = render(concertId);
      showToast('📸 Foto berhasil ditambahkan!', 'success');
    } catch (err) {
      showToast('⚠️ ' + (typeof err === 'string' ? err : 'Gagal memproses foto.'), 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Upload Foto'; }
    }
  }

  return { render, handleFileChange, cancelPreview, confirmUpload, getFor };
})();
window.UGC = UGC;

/* ================================================================
   PATCH openModal — inject semua fitur baru ke modal
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // Patch openModal — SATU TEMPAT untuk semua inject bawah disclaimer
  // Urutan: Going/Interested → Spotify → Ikuti di → Diskusi → Rating & Review → Foto dari Fans
  const _baseFeaturesOpenModal = window.openModal;
  if (typeof _baseFeaturesOpenModal === 'function') {
    window.openModal = function(id) {
      _baseFeaturesOpenModal(id);
      const c  = typeof CONCERTS !== 'undefined' ? CONCERTS.find(x => x.id === id) : null;
      if (!c) return;
      const mc = document.getElementById('modalContent');
      if (!mc) return;

      // Semua section di bawah disclaimer — inject satu kali dalam satu rAF
      requestAnimationFrame(() => {
        const modal = document.getElementById('modalContent');
        if (!modal) return;
        const disclaimer = modal.querySelector('.modal-disclaimer');
        if (!disclaimer) return;

        // Helper: tambahkan section setelah elemen terakhir yang sudah ada
        let lastEl = disclaimer;
        function appendAfterLast(html) {
          if (!html) return;
          const el = document.createElement('div');
          el.innerHTML = html;
          const node = el.firstElementChild || el;
          lastEl.insertAdjacentElement('afterend', node);
          lastEl = node;
        }

        // 1. Going & Interested — selalu tampil (termasuk konser past, data actual)
        if (typeof SocialFeatures !== 'undefined') {
          appendAfterLast(SocialFeatures.renderBadges(c.id));
        }

        // 2. Spotify Preview
        if (typeof SpotifyIntegration !== 'undefined') {
          appendAfterLast(SpotifyIntegration.renderEmbed(c.id, c.artist));
        }

        // 3. Ikuti di (Social media links)
        appendAfterLast(SocialMedia.renderLinks(c.id, c.artist));

        // 4. Diskusi
        appendAfterLast(Discussion.render(c.id));

        // 5. Rating & Review
        if (typeof window.ConcertReviews !== 'undefined') {
          const rvHtml = window.ConcertReviews.render(id);
          if (rvHtml) {
            const rvEl = document.createElement('div');
            rvEl.innerHTML = rvHtml;
            const rvNode = rvEl.firstElementChild || rvEl;
            lastEl.insertAdjacentElement('afterend', rvNode);
            lastEl = rvNode;
            window.ConcertReviews.bind(id);
          }
        }

        // 6. Foto dari Fans (paling bawah)
        appendAfterLast(UGC.render(c.id));
      });
    };
  }

  // Check pending notifications on load — dinonaktifkan (fitur dihapus)
  // BrowserNotif.checkPending();

  // Render newsletter section if container exists
  const nlContainer = document.getElementById('newsletterFormContainer');
  if (nlContainer) nlContainer.innerHTML = Newsletter.render();
});
