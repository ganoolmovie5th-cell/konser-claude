/* ============================================================
   ConcertID Review & Rating System
   localStorage-based, no backend required
   ============================================================ */

(function () {
  'use strict';

  /* ── Storage helpers ────────────────────────────────────── */
  const KEY = 'cid_reviews';

  function getAll()      { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
  function saveAll(data) { localStorage.setItem(KEY, JSON.stringify(data)); }

  function getReviewsFor(id) { return getAll()[id] || []; }

  function addReview(id, { rating, comment, author }) {
    const all  = getAll();
    if (!all[id]) all[id] = [];
    // Spam guard: same user max 1 review per concert
    const uid  = getUID();
    if (all[id].find(r => r.uid === uid)) return { ok: false, msg: 'Kamu sudah pernah review konser ini!' };
    if (comment.trim().length < 10)       return { ok: false, msg: 'Komentar minimal 10 karakter.' };
    if (rating < 1 || rating > 5)         return { ok: false, msg: 'Rating harus 1–5 bintang.' };

    all[id].push({
      uid,
      author:    author.trim() || 'Anonim',
      rating:    parseInt(rating),
      comment:   sanitize(comment.trim()),
      date:      new Date().toISOString(),
      likes:     0,
    });
    saveAll(all);

    // Update analytics click tracking
    try {
      const cl = JSON.parse(localStorage.getItem('cid_clicks') || '{}');
      cl[id] = (cl[id] || 0) + 1;
      localStorage.setItem('cid_clicks', JSON.stringify(cl));
    } catch {}

    return { ok: true };
  }

  function likeReview(concertId, idx) {
    const all = getAll();
    if (all[concertId] && all[concertId][idx]) {
      all[concertId][idx].likes = (all[concertId][idx].likes || 0) + 1;
      saveAll(all);
    }
  }

  /* ── Anti-spam UID ──────────────────────────────────────── */
  function getUID() {
    let uid = localStorage.getItem('cid_uid');
    if (!uid) {
      uid = 'u_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('cid_uid', uid);
    }
    return uid;
  }

  /* ── Sanitize HTML ──────────────────────────────────────── */
  function sanitize(str) {
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').slice(0, 500);
  }

  /* ── Average rating ─────────────────────────────────────── */
  function avg(reviews) {
    if (!reviews.length) return 0;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }

  /* ── Render stars ───────────────────────────────────────── */
  function renderStars(rating, interactive = false, name = '') {
    if (!interactive) {
      const full  = Math.floor(rating);
      const empty = 5 - full;
      return `<span class="rv-stars-static">${'★'.repeat(full)}${'☆'.repeat(empty)}</span>`;
    }
    return [5,4,3,2,1].map(i => `
      <input type="radio" id="${name}_s${i}" name="${name}" value="${i}" class="rv-star-input" />
      <label for="${name}_s${i}" class="rv-star-label" title="${i} bintang">★</label>
    `).join('');
  }

  /* ── Render a single review card ────────────────────────── */
  function renderReviewCard(r, concertId, idx) {
    const d    = new Date(r.date);
    const ago  = timeAgo(d);
    const uid  = getUID();
    const isOwn = r.uid === uid;
    return `
      <div class="rv-card" data-idx="${idx}">
        <div class="rv-card-top">
          <div class="rv-card-author">
            <div class="rv-avatar">${r.author.charAt(0).toUpperCase()}</div>
            <div>
              <div class="rv-author-name">${r.author}${isOwn ? ' <span class="rv-you">Kamu</span>' : ''}</div>
              <div class="rv-date">${ago}</div>
            </div>
          </div>
          <div class="rv-rating-display">${renderStars(r.rating)}<span class="rv-rating-num">${r.rating}.0</span></div>
        </div>
        <p class="rv-comment">${r.comment}</p>
        <div class="rv-card-bottom">
          <button class="rv-like-btn" onclick="ConcertReviews.like('${concertId}', ${idx}, this)">
            👍 ${r.likes || 0}
          </button>
        </div>
      </div>`;
  }

  /* ── Render the full review section for a concert ───────── */
  function renderReviewSection(concertId) {
    const reviews = getReviewsFor(concertId);
    const avgR    = avg(reviews);
    const uid     = getUID();
    const hasReviewed = reviews.some(r => r.uid === uid);
    const formName = `rvform_${concertId}`;

    // Rating distribution
    const dist = [5,4,3,2,1].map(s => ({
      star: s,
      count: reviews.filter(r => r.rating === s).length,
      pct: reviews.length ? Math.round(reviews.filter(r => r.rating === s).length / reviews.length * 100) : 0,
    }));

    return `
      <div class="rv-section" id="rv_${concertId}">
        <div class="rv-header">
          <h4>⭐ Review &amp; Rating</h4>
          ${reviews.length ? `<span class="rv-count">${reviews.length} review</span>` : ''}
        </div>

        ${reviews.length ? `
          <div class="rv-summary">
            <div class="rv-avg-wrap">
              <div class="rv-avg-num">${avgR.toFixed(1)}</div>
              <div>${renderStars(avgR)}</div>
              <div class="rv-avg-label">${reviews.length} review</div>
            </div>
            <div class="rv-dist">
              ${dist.map(d => `
                <div class="rv-dist-row">
                  <span class="rv-dist-star">${d.star}★</span>
                  <div class="rv-dist-track"><div class="rv-dist-fill" style="width:${d.pct}%"></div></div>
                  <span class="rv-dist-count">${d.count}</span>
                </div>`).join('')}
            </div>
          </div>` : ''}

        ${!hasReviewed ? `
          <div class="rv-form-wrap">
            <h5>✍️ Tulis Review</h5>
            <form class="rv-form" onsubmit="ConcertReviews.submit(event, '${concertId}')">
              <div class="rv-star-picker">
                <label>Rating:</label>
                <div class="rv-stars-wrap">${renderStars(0, true, formName)}</div>
              </div>
              <input class="rv-author-input" type="text" placeholder="Nama kamu (opsional)" maxlength="30" />
              <textarea class="rv-textarea" placeholder="Bagaimana konsernya? Ceritakan pengalamanmu... (min 10 karakter)" rows="3" maxlength="500" required></textarea>
              <div class="rv-form-footer">
                <span class="rv-char-count">0 / 500</span>
                <button type="submit" class="btn btn-primary" style="flex:0;padding:8px 20px;font-size:0.82rem;">Kirim Review ↑</button>
              </div>
              <div class="rv-form-msg"></div>
            </form>
          </div>` : `
          <div class="rv-already">✅ Kamu sudah review konser ini. Terima kasih!</div>`}

        <div class="rv-list" id="rvlist_${concertId}">
          ${reviews.length
            ? reviews.slice().reverse().map((r, i) => renderReviewCard(r, concertId, reviews.length - 1 - i)).join('')
            : `<div class="rv-empty">Belum ada review. Jadilah yang pertama! 🎵</div>`}
        </div>
      </div>`;
  }

  /* ── Submit handler ─────────────────────────────────────── */
  function handleSubmit(e, concertId) {
    e.preventDefault();
    const form    = e.target;
    const rating  = parseInt(form.querySelector('input[type=radio]:checked')?.value || '0');
    const author  = form.querySelector('.rv-author-input')?.value || 'Anonim';
    const comment = form.querySelector('.rv-textarea')?.value || '';
    const msgEl   = form.querySelector('.rv-form-msg');

    if (!rating) {
      msgEl.textContent = '⚠️ Pilih rating bintang dulu!';
      msgEl.style.color = '#f87171';
      return;
    }

    const result = addReview(concertId, { rating, comment, author });
    if (!result.ok) {
      msgEl.textContent = '⚠️ ' + result.msg;
      msgEl.style.color = '#f87171';
      return;
    }

    // Re-render the whole section
    const section = document.getElementById(`rv_${concertId}`);
    if (section) {
      section.outerHTML = renderReviewSection(concertId);
      bindCharCount(concertId);
    }

    // GA event
    if (window.gtag) gtag('event', 'review_submitted', { event_category: 'reviews', event_label: concertId });
  }

  /* ── Like handler ───────────────────────────────────────── */
  function handleLike(concertId, idx, btn) {
    likeReview(concertId, idx);
    const all   = getReviewsFor(concertId);
    btn.textContent = `👍 ${all[idx]?.likes || 0}`;
    btn.disabled = true;
  }

  /* ── Char count binding ─────────────────────────────────── */
  function bindCharCount(concertId) {
    const section = document.getElementById(`rv_${concertId}`);
    if (!section) return;
    const ta   = section.querySelector('.rv-textarea');
    const cnt  = section.querySelector('.rv-char-count');
    if (ta && cnt) {
      ta.addEventListener('input', () => {
        cnt.textContent = `${ta.value.length} / 500`;
        cnt.style.color = ta.value.length > 450 ? '#f87171' : 'var(--text-muted)';
      });
    }
  }

  /* ── Time ago helper ────────────────────────────────────── */
  function timeAgo(date) {
    const diff = Date.now() - date.getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 30)  return date.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' });
    if (d > 0)   return `${d} hari lalu`;
    if (h > 0)   return `${h} jam lalu`;
    if (m > 0)   return `${m} menit lalu`;
    return 'Baru saja';
  }

  /* ── Public API ─────────────────────────────────────────── */
  window.ConcertReviews = {
    render:  renderReviewSection,
    submit:  handleSubmit,
    like:    handleLike,
    bind:    bindCharCount,
    getAll:  getReviewsFor,
    avgFor:  (id) => avg(getReviewsFor(id)),
  };

})();
