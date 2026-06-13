/**
 * Vercel Serverless Function — Mailchimp Subscribe Proxy
 * Menggunakan Node https module (bukan fetch) agar kompatibel semua runtime
 *
 * Env vars di Vercel dashboard:
 *   MAILCHIMP_API_KEY  — dari Mailchimp > Account > Extras > API keys
 *   MAILCHIMP_LIST_ID  — dari Mailchimp > Audience > Settings
 *   MAILCHIMP_SERVER   — prefix server, misal "us20"
 */

const https = require('https');

function mailchimpRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: {} });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let email;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    email = body?.email;
  } catch {
    return res.status(400).json({ error: 'Request body tidak valid.' });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email tidak valid.' });
  }

  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const LIST_ID = process.env.MAILCHIMP_LIST_ID;
  const SERVER  = process.env.MAILCHIMP_SERVER || 'us20';

  if (!API_KEY || !LIST_ID) {
    console.error('[subscribe] Missing env vars');
    return res.status(500).json({ error: 'Konfigurasi server belum lengkap.' });
  }

  const postData = JSON.stringify({ email_address: email, status: 'subscribed' });
  const auth     = Buffer.from(`anystring:${API_KEY}`).toString('base64');

  const options = {
    hostname: `${SERVER}.api.mailchimp.com`,
    path:     `/3.0/lists/${LIST_ID}/members`,
    method:   'POST',
    headers:  {
      'Content-Type':   'application/json',
      'Authorization':  `Basic ${auth}`,
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  let result;
  try {
    result = await mailchimpRequest(options, postData);
  } catch (err) {
    console.error('[subscribe] HTTPS request error:', err.message);
    return res.status(500).json({ error: 'Koneksi ke Mailchimp gagal: ' + err.message });
  }

  if (result.status === 200 || result.status === 201) {
    return res.status(200).json({ result: 'success' });
  }

  if (result.status === 400 && result.data.title === 'Member Exists') {
    return res.status(200).json({ result: 'success', note: 'already_subscribed' });
  }

  const errMsg = result.data.detail || result.data.title || 'Gagal mendaftar.';
  console.error('[subscribe] Mailchimp error:', result.status, result.data);
  return res.status(400).json({ error: errMsg });
};
