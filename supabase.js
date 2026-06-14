/* ================================================================
   ConcertID — Supabase Client
   Semua akses database terpusat di sini
   ================================================================ */

const SUPA_URL = 'https://crtqxgsruywurdlcsjfp.supabase.co';
const SUPA_KEY = 'sb_publishable_G9oVhoD74guR61dZ755SYw_QwcrRKmc';

/* ── Supabase REST helper (tanpa npm, pure fetch) ─────────── */
const DB = {
  /* Base fetch ke Supabase REST API */
  async _fetch(path, options = {}) {
    const url = `${SUPA_URL}/rest/v1/${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'apikey':        SUPA_KEY,
        'Authorization': `Bearer ${SUPA_KEY}`,
        'Content-Type':  'application/json',
        'Prefer':        options._prefer || 'return=representation',
        ...options.headers,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.details || `HTTP ${res.status}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : [];
  },
  select(table, query = '') {
    return this._fetch(`${table}?${query}`);
  },

  /* INSERT — returns inserted row */
  insert(table, data) {
    return this._fetch(table, {
      method: 'POST',
      body:   JSON.stringify(data),
      _prefer: 'return=representation',
    });
  },

  /* UPDATE — filter: 'col=eq.value' */
  update(table, filter, data) {
    return this._fetch(`${table}?${filter}`, {
      method:  'PATCH',
      body:    JSON.stringify(data),
      _prefer: 'return=representation',
    });
  },

  /* DELETE */
  delete(table, filter) {
    return this._fetch(`${table}?${filter}`, {
      method:  'DELETE',
      _prefer: 'return=minimal',
    });
  },

  /* RPC — stored procedure */
  rpc(fn, params = {}) {
    return this._fetch(`rpc/${fn}`, {
      method: 'POST',
      body:   JSON.stringify(params),
      _prefer: 'return=representation',
    });
  },
};

/* ── Storage helper ───────────────────────────────────────── */
const Storage = {
  async upload(bucket, path, file) {
    const url = `${SUPA_URL}/storage/v1/object/${bucket}/${path}`;
    const res = await fetch(url, {
      method:  'POST',
      headers: {
        'apikey':         SUPA_KEY,
        'Authorization':  `Bearer ${SUPA_KEY}`,
        'Content-Type':   file.type || 'image/jpeg',
        'Cache-Control':  'max-age=3600',
      },
      body: file,
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Upload gagal (${res.status}): ${errText}`);
    }
    return `${SUPA_URL}/storage/v1/object/public/${bucket}/${path}`;
  },

  publicUrl(bucket, path) {
    return `${SUPA_URL}/storage/v1/object/public/${bucket}/${path}`;
  },
};

/* ── Device UID ───────────────────────────────────────────── */
function getDeviceUID() {
  let uid = localStorage.getItem('cid_uid');
  if (!uid) {
    uid = 'u_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('cid_uid', uid);
  }
  return uid;
}

/* ── Expose globals ───────────────────────────────────────── */
window.DB         = DB;
window.Storage    = Storage;
window.getDeviceUID = getDeviceUID;
