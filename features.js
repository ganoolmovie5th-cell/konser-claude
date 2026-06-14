/* ================================================================
   ConcertID — features.js
   Fitur:
   2. Google Calendar Link
   3. Sort Options
   5. Social Features (Going / Interested counter)
   7. Social Media Integration
   8. Discussion / Comments
   9. User-Generated Content
   ================================================================ */

'use strict';

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
   4. NEWSLETTER — handled by Mailchimp JSONP di index.html
   ================================================================ */

/* ================================================================
   5. SOCIAL FEATURES — Going / Interested counter
   Supabase primary, localStorage fallback
   ================================================================ */
const SocialFeatures = (() => {
  // localStorage keys (fallback)
  const KEY_GOING    = 'cid_going';
  const KEY_INTEREST = 'cid_interest';
  const KEY_MYVOTE   = 'cid_myvote';

  /* ── localStorage fallback helpers ── */
  function lsGetCounts(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
  }
  function lsSaveCounts(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
  function lsGetMyVotes() {
    try { return JSON.parse(localStorage.getItem(KEY_MYVOTE) || '{}'); } catch { return {}; }
  }

  /* ── Supabase: ambil counts untuk satu konser ── */
  async function fetchCounts(id) {
    try {
      const rows = await DB.select('concert_votes',
        `concert_id=eq.${encodeURIComponent(id)}&select=type`);
      const going      = rows.filter(r => r.type === 'going').length;
      const interested = rows.filter(r => r.type === 'interested').length;
      const myVote     = rows.find(r => r.device_uid === getDeviceUID())?.type || null;
      return { going, interested, myVote };
    } catch {
      // fallback localStorage
      return {
        going:      lsGetCounts(KEY_GOING)[id]    ?? 0,
        interested: lsGetCounts(KEY_INTEREST)[id] ?? 0,
        myVote:     lsGetMyVotes()[id] || null,
      };
    }
  }

  /* ── Supabase: toggle vote ── */
  async function vote(id, type) {
    const uid = getDeviceUID();
    try {
      // Cek apakah sudah ada vote dengan type ini
      const existing = await DB.select('concert_votes',
        `concert_id=eq.${encodeURIComponent(id)}&device_uid=eq.${uid}&type=eq.${type}`);

      if (existing.length > 0) {
        // Undo — hapus vote ini
        await DB.delete('concert_votes',
          `concert_id=eq.${encodeURIComponent(id)}&device_uid=eq.${uid}&type=eq.${type}`);
      } else {
        // Upsert vote baru (hapus type lain dulu jika ada)
        await DB.delete('concert_votes',
          `concert_id=eq.${encodeURIComponent(id)}&device_uid=eq.${uid}`);
        await DB.insert('concert_votes', { concert_id: id, device_uid: uid, type });
      }
      return await fetchCounts(id);
    } catch {
      // fallback localStorage
      return voteFallback(id, type);
    }
  }

  function voteFallback(id, type) {
    const myVotes = lsGetMyVotes();
    const prev    = myVotes[id];
    const going    = lsGetCounts(KEY_GOING);
    const interest = lsGetCounts(KEY_INTEREST);
    if (going[id]    == null) going[id]    = 0;
    if (interest[id] == null) interest[id] = 0;
    if (prev === type) {
      if (type === 'going')      going[id]    = Math.max(0, going[id] - 1);
      if (type === 'interested') interest[id] = Math.max(0, interest[id] - 1);
      delete myVotes[id];
    } else {
      if (prev === 'going')      going[id]    = Math.max(0, going[id] - 1);
      if (prev === 'interested') interest[id] = Math.max(0, interest[id] - 1);
      if (type === 'going')      going[id]++;
      if (type === 'interested') interest[id]++;
      myVotes[id] = type;
    }
    lsSaveCounts(KEY_GOING, going);
    lsSaveCounts(KEY_INTEREST, interest);
    localStorage.setItem(KEY_MYVOTE, JSON.stringify(myVotes));
    return { going: going[id], interested: interest[id], myVote: myVotes[id] || null };
  }

  function fmtCount(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
    return n;
  }

  function renderBadges(id) {
    const concert = typeof CONCERTS !== 'undefined' ? CONCERTS.find(c => c.id === id) : null;
    const past    = concert && concert.rawDate < (typeof TODAY !== 'undefined' ? TODAY : new Date());

    if (past) {
      const seed            = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const dummyGoing      = (seed % 900) + 100;
      const dummyInterest   = ((seed * 3) % 1500) + 300;

      // Fetch real count dari Supabase, fallback ke dummy jika 0
      setTimeout(async () => {
        try {
          const data = await fetchCounts(id);
          const el   = document.querySelector(`.social-badges[data-concert="${id}"]`);
          if (!el) return;
          const g = data.going       > 0 ? data.going       : dummyGoing;
          const i = data.interested  > 0 ? data.interested  : dummyInterest;
          el.innerHTML = `
            <button class="social-btn" disabled style="opacity:0.5;cursor:not-allowed">
              🎟️ Hadir <span class="social-count">${fmtCount(g)}</span>
            </button>
            <button class="social-btn" disabled style="opacity:0.5;cursor:not-allowed">
              ⭐ Tertarik <span class="social-count">${fmtCount(i)}</span>
            </button>`;
        } catch { /* tetap pakai dummy */ }
      }, 0);

      return `
        <div class="social-badges" data-concert="${id}">
          <button class="social-btn" disabled style="opacity:0.5;cursor:not-allowed">
            🎟️ Hadir <span class="social-count">${fmtCount(dummyGoing)}</span>
          </button>
          <button class="social-btn" disabled style="opacity:0.5;cursor:not-allowed">
            ⭐ Tertarik <span class="social-count">${fmtCount(dummyInterest)}</span>
          </button>
        </div>`;
    }

    // Render placeholder dulu, lalu async update
    const going    = lsGetCounts(KEY_GOING)[id]    ?? 0;
    const interest = lsGetCounts(KEY_INTEREST)[id] ?? 0;
    const myVote   = lsGetMyVotes()[id] || null;

    setTimeout(async () => {
      const data    = await fetchCounts(id);
      const el      = document.querySelector(`.social-badges[data-concert="${id}"]`);
      if (!el) return;
      el.outerHTML  = renderBadgesHtml(id, data.going, data.interested, data.myVote);
    }, 0);

    return renderBadgesHtml(id, going, interest, myVote);
  }

  function renderBadgesHtml(id, going, interested, myVote) {
    return `
      <div class="social-badges" data-concert="${id}">
        <button class="social-btn${myVote === 'going' ? ' active-going' : ''}"
          onclick="SocialFeatures.voteAndUpdate('${id}', 'going', this.closest('.social-badges'))">
          🎟️ Going <span class="social-count">${fmtCount(going)}</span>
        </button>
        <button class="social-btn${myVote === 'interested' ? ' active-interested' : ''}"
          onclick="SocialFeatures.voteAndUpdate('${id}', 'interested', this.closest('.social-badges'))">
          ⭐ Interested <span class="social-count">${fmtCount(interested)}</span>
        </button>
      </div>`;
  }

  async function voteAndUpdate(id, type, container) {
    const result = await vote(id, type);
    if (container) {
      container.outerHTML = renderBadgesHtml(id, result.going, result.interested, result.myVote);
    }
    const msg = type === 'going'
      ? (result.myVote === 'going' ? '🎟️ Kamu tandai akan hadir!' : '✅ Vote dibatalkan')
      : (result.myVote === 'interested' ? '⭐ Kamu tandai tertarik!' : '✅ Vote dibatalkan');
    if (typeof showToast === 'function') showToast(msg, 'success', 2000);
  }

  return { renderBadges, vote, voteAndUpdate, fetchCounts };
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
   Supabase primary, localStorage fallback
   ================================================================ */
const Discussion = (() => {
  const LS_KEY = 'cid_discussions';

  function lsGetAll() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; } }
  function lsGetFor(id) { return lsGetAll()[id] || []; }

  function timeAgo(date) {
    const d    = typeof date === 'string' ? new Date(date) : date;
    const diff = Date.now() - d.getTime();
    const m = Math.floor(diff / 60000), h = Math.floor(m / 60), dy = Math.floor(h / 24);
    if (dy > 30) return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    if (dy > 0)  return `${dy} hari lalu`;
    if (h > 0)   return `${h} jam lalu`;
    if (m > 0)   return `${m} menit lalu`;
    return 'Baru saja';
  }

  /* ── Fetch dari Supabase ── */
  async function fetchComments(concertId) {
    try {
      const rows = await DB.select('discussions',
        `concert_id=eq.${encodeURIComponent(concertId)}&order=created_at.desc&limit=100`);
      return rows.map(r => ({
        id:       r.id,
        uid:      r.device_uid,
        author:   r.author,
        text:     r.text,
        date:     r.created_at,
        likes:    r.likes,
        replyTo:  r.reply_to,
      }));
    } catch {
      return lsGetFor(concertId);
    }
  }

  /* ── Add komentar ── */
  async function add(concertId, { author, text, replyTo = null }) {
    if (!text || text.trim().length < 3) return { ok: false, msg: 'Komentar minimal 3 karakter.' };
    const clean = text.trim().replace(/</g,'&lt;').replace(/>/g,'&gt;').slice(0,300);
    const name  = (author || 'Anonim').trim().slice(0,30);
    try {
      await DB.insert('discussions', {
        concert_id: concertId,
        device_uid: getDeviceUID(),
        author:     name,
        text:       clean,
        reply_to:   replyTo || null,
      });
      return { ok: true };
    } catch (e) {
      // fallback localStorage
      const all = lsGetAll();
      if (!all[concertId]) all[concertId] = [];
      all[concertId].unshift({ uid: getDeviceUID(), author: name, text: clean, date: new Date().toISOString(), likes: 0, replyTo });
      localStorage.setItem(LS_KEY, JSON.stringify(all));
      return { ok: true };
    }
  }

  /* ── Like komentar ── */
  async function like(concertId, commentId) {
    try {
      const rows = await DB.select('discussions', `id=eq.${commentId}&select=likes`);
      const cur  = rows[0]?.likes ?? 0;
      await DB.update('discussions', `id=eq.${commentId}`, { likes: cur + 1 });
    } catch { /* silent */ }
  }

  /* ── Render section ── */
  function render(concertId, isPastConcert = false) {
    const formHtml = isPastConcert
      ? `<div class="disc-past-info">📋 Konser sudah selesai — diskusi ditutup, tapi kamu masih bisa baca komentar di bawah.</div>`
      : `<form class="disc-form" onsubmit="Discussion.handleSubmit(event, '${concertId}')">
          <input class="disc-name" type="text" placeholder="Nama (opsional)" maxlength="30" />
          <div id="discReplyPreview_${concertId}" class="disc-reply-preview" style="display:none"></div>
          <div class="disc-input-row">
            <textarea class="disc-textarea" placeholder="Tulis komentar... (max 300 karakter)" rows="2" maxlength="300" required></textarea>
            <button class="disc-submit" type="submit">Kirim</button>
          </div>
        </form>`;

    // Render placeholder, lalu async load
    setTimeout(async () => {
      const comments = await fetchComments(concertId);
      const listEl   = document.getElementById(`disclist_${concertId}`);
      if (!listEl) return;
      const countEl  = document.querySelector(`#disc_${concertId} .disc-count`);
      if (countEl) countEl.textContent = comments.length || '';
      listEl.innerHTML = renderCommentList(comments, concertId, isPastConcert);
    }, 0);

    return `
      <div class="disc-section" id="disc_${concertId}">
        <div class="disc-header">
          <h4>💬 Diskusi <span class="disc-count"></span></h4>
        </div>
        ${formHtml}
        <div class="disc-list" id="disclist_${concertId}">
          <div class="disc-empty" style="opacity:0.5">Memuat komentar...</div>
        </div>
      </div>`;
  }

  function renderCommentList(comments, concertId, isPastConcert) {
    if (!comments.length) return `<div class="disc-empty">${isPastConcert ? 'Belum ada diskusi.' : 'Jadilah yang pertama berkomentar! 💬'}</div>`;
    return comments.map((c, i) => `
      <div class="disc-item">
        <div class="disc-avatar">${c.author.charAt(0).toUpperCase()}</div>
        <div class="disc-body">
          <div class="disc-meta"><strong>${c.author}</strong> <span>${timeAgo(c.date)}</span></div>
          ${c.replyTo ? `<div class="disc-reply-quote">↩ <strong>${c.replyTo.author}:</strong> ${c.replyTo.text}</div>` : ''}
          <div class="disc-text">${c.text}</div>
          <div class="disc-actions">
            <button class="disc-like" onclick="Discussion.likeAndUpdate('${concertId}', ${c.id || i}, this)">👍 ${c.likes || 0}</button>
            ${!isPastConcert ? `<button class="disc-reply-btn" onclick="Discussion.setReply('${concertId}', ${i})">↩ Reply</button>` : ''}
          </div>
        </div>
      </div>`).join('');
  }

  function setReply(concertId, idx) {
    // Ambil dari DOM karena sudah di-render async
    const items   = document.querySelectorAll(`#disclist_${concertId} .disc-item`);
    const item    = items[idx];
    if (!item) return;
    const author  = item.querySelector('.disc-meta strong')?.textContent || 'Anonim';
    const text    = item.querySelector('.disc-text')?.textContent || '';
    const form    = document.querySelector(`#disc_${concertId} .disc-form`);
    const preview = document.getElementById(`discReplyPreview_${concertId}`);
    if (!form || !preview) return;
    form.dataset.replyAuthor = author;
    form.dataset.replyText   = text.slice(0, 60);
    preview.style.display    = 'flex';
    preview.innerHTML = `
      <span class="disc-reply-to">↩ Membalas <strong>${author}</strong>: ${text.slice(0,50)}${text.length > 50 ? '...' : ''}</span>
      <button class="disc-reply-cancel" onclick="Discussion.cancelReply('${concertId}')">✕</button>`;
    form.querySelector('.disc-textarea')?.focus();
  }

  function cancelReply(concertId) {
    const form    = document.querySelector(`#disc_${concertId} .disc-form`);
    const preview = document.getElementById(`discReplyPreview_${concertId}`);
    if (form) { delete form.dataset.replyAuthor; delete form.dataset.replyText; }
    if (preview) preview.style.display = 'none';
  }

  async function handleSubmit(e, concertId) {
    e.preventDefault();
    const form    = e.target;
    const author  = form.querySelector('.disc-name')?.value || 'Anonim';
    const text    = form.querySelector('.disc-textarea')?.value || '';
    const replyTo = form.dataset.replyAuthor
      ? { author: form.dataset.replyAuthor, text: form.dataset.replyText }
      : null;
    const result  = await add(concertId, { author, text, replyTo });
    if (!result.ok) { showToast('⚠️ ' + result.msg, 'error'); return; }
    const section = document.getElementById(`disc_${concertId}`);
    if (section) section.outerHTML = render(concertId);
    showToast('💬 Komentar berhasil dikirim!', 'success', 2000);
  }

  async function likeAndUpdate(concertId, commentId, btn) {
    await like(concertId, commentId);
    if (btn) {
      const cur = parseInt(btn.textContent.replace('👍 ','')) || 0;
      btn.textContent = `👍 ${cur + 1}`;
      btn.disabled    = true;
    }
  }

  return { render, handleSubmit, likeAndUpdate, setReply, cancelReply, getFor: lsGetFor };
})();
window.Discussion = Discussion;



/* ================================================================
   10. USER-GENERATED CONTENT — foto setelah konser
   Supabase Storage primary, localStorage fallback
   ================================================================ */
const UGC = (() => {
  const LS_KEY  = 'cid_ugc';
  const BUCKET  = 'fan-photos';
  const MAX_SIZE = 2 * 1024 * 1024;
  const MAX_DIM  = 1200;

  function lsGetAll() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; } }
  function lsGetFor(id) { return lsGetAll()[id] || []; }

  /* Resize & compress */
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
          canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.82);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ── Fetch foto dari Supabase ── */
  async function fetchPhotos(concertId) {
    try {
      const rows = await DB.select('fan_photos',
        `concert_id=eq.${encodeURIComponent(concertId)}&order=created_at.desc&limit=20`);
      return rows.map(r => ({
        url:     r.public_url,
        caption: r.caption || '',
        author:  r.author  || 'Anonymous',
        date:    r.created_at,
      }));
    } catch {
      return lsGetFor(concertId);
    }
  }

  /* ── Upload ke Supabase Storage + insert row ── */
  async function uploadPhoto(concertId, { blob, caption, author }) {
    const path      = `${concertId}/${Date.now()}_${getDeviceUID()}.jpg`;
    const publicUrl = await Storage.upload(BUCKET, path, blob);
    await DB.insert('fan_photos', {
      concert_id:   concertId,
      device_uid:   getDeviceUID(),
      storage_path: path,
      public_url:   publicUrl,
      caption:      (caption || '').trim().slice(0, 100),
      author:       (author  || 'Anonymous').trim().slice(0, 30),
    });
    return publicUrl;
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

    // Async load foto
    setTimeout(async () => {
      const gridEl = document.getElementById(`ugcgrid_${concertId}`);
      if (!gridEl) return;
      const photos = await fetchPhotos(concertId);
      gridEl.innerHTML = renderGrid(photos);
      const countEl = document.querySelector(`#ugc_${concertId} .ugc-count`);
      if (countEl && photos.length) countEl.textContent = `${photos.length} foto`;
    }, 0);

    return `
      <div class="ugc-section" id="ugc_${concertId}">
        <div class="ugc-header">
          <h4>📸 Foto dari Fans</h4>
          <span class="ugc-count"></span>
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
                  placeholder="Nama kamu (opsional)" maxlength="30" />
                <div class="ugc-preview-actions">
                  <button class="ugc-cancel" onclick="UGC.cancelPreview('${concertId}')">Batal</button>
                  <button class="ugc-submit" onclick="UGC.confirmUpload('${concertId}')">Upload Foto</button>
                </div>
              </div>
            </div>
          </div>` : `<div class="ugc-not-yet">📸 Foto dapat ditambahkan setelah konser berlangsung.</div>`}
        <div id="ugcgrid_${concertId}"><div class="ugc-empty" style="opacity:0.5">Memuat foto...</div></div>
      </div>`;
  }

  function handleFileChange(e, concertId) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('⚠️ Hanya file gambar.', 'error'); return; }
    if (file.size > MAX_SIZE)            { showToast('⚠️ Ukuran file maks 2 MB.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const previewWrap = document.getElementById(`ugcpreview_${concertId}`);
      const previewImg  = document.getElementById(`ugcpreviewimg_${concertId}`);
      if (previewWrap && previewImg) {
        previewImg.src            = ev.target.result;
        previewWrap.style.display = 'flex';
      }
    };
    reader.readAsDataURL(file);
  }

  function cancelPreview(concertId) {
    const previewWrap = document.getElementById(`ugcpreview_${concertId}`);
    const fileInput   = document.getElementById(`ugcfile_${concertId}`);
    if (previewWrap) previewWrap.style.display = 'none';
    if (fileInput)   fileInput.value = '';
  }

  async function confirmUpload(concertId) {
    const fileInput = document.getElementById(`ugcfile_${concertId}`);
    const file      = fileInput?.files?.[0];
    const caption   = document.getElementById(`ugccaption_${concertId}`)?.value?.trim() || '';
    const author    = document.getElementById(`ugcauthor_${concertId}`)?.value?.trim() || 'Anonymous';
    if (!file) { showToast('⚠️ Pilih foto terlebih dahulu.', 'error'); return; }

    const btn = document.querySelector(`#ugc_${concertId} .ugc-submit`);
    if (btn) { btn.disabled = true; btn.textContent = 'Mengupload...'; }

    try {
      const blob = await processFile(file);
      await uploadPhoto(concertId, { blob, caption, author });
      const section = document.getElementById(`ugc_${concertId}`);
      if (section) section.outerHTML = render(concertId);
      showToast('📸 Foto berhasil ditambahkan!', 'success');
    } catch (err) {
      showToast('⚠️ ' + (typeof err === 'string' ? err : 'Gagal upload foto.'), 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Upload Foto'; }
    }
  }

  return { render, handleFileChange, cancelPreview, confirmUpload, getFor: lsGetFor };
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

      // Urutan seragam untuk SEMUA tipe konser (past/confirmed/rumor):
        // Forum Jual Beli → Cari Teman Nonton → Diskusi → Review & Rating → Foto dari Fans
        // (inject Forum & Cari Teman dari features3.js via rAF ke-2)
        // Di sini hanya inject: Diskusi, Review, Foto dari Fans

        // 4. Diskusi — tampil untuk semua, tapi form disabled untuk past
        appendAfterLast(Discussion.render(c.id, c.rawDate < new Date()));

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

        // 6. Foto dari Fans
        appendAfterLast(UGC.render(c.id));

        // 7. Forum Jual Beli Tiket — di bawah Ikuti di, sebelum Diskusi
        if (typeof TicketMarket !== 'undefined') {
          const discSection = modal.querySelector('.disc-section');
          const tmEl = document.createElement('div');
          tmEl.innerHTML = TicketMarket.render(c.id);
          if (discSection) discSection.insertAdjacentElement('beforebegin', tmEl.firstElementChild || tmEl);
        }

        // 8. Cari Teman Nonton — setelah Forum Jual Beli, sebelum Diskusi
        if (typeof GroupBuying !== 'undefined') {
          const tmSection  = modal.querySelector('.tm-section');
          const discSection = modal.querySelector('.disc-section');
          const anchor     = tmSection || discSection;
          const gbEl       = document.createElement('div');
          gbEl.innerHTML   = GroupBuying.render(c.id);
          if (anchor) anchor.insertAdjacentElement(tmSection ? 'afterend' : 'beforebegin', gbEl.firstElementChild || gbEl);
        }
      });
    };
  }

  // Check pending notifications — dinonaktifkan
  // BrowserNotif.checkPending();
});
