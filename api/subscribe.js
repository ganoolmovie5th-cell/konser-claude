/**
 * Vercel Serverless Function — Mailchimp Subscribe Proxy
 *
 * Environment variables yang harus diset di Vercel dashboard:
 *   MAILCHIMP_API_KEY  — API key dari Mailchimp (Account > Extras > API keys)
 *   MAILCHIMP_LIST_ID  — Audience/List ID (Audience > Settings > Audience name and defaults)
 *   MAILCHIMP_SERVER   — Server prefix, misal "us20" (dari URL: us20.admin.mailchimp.com)
 */

module.exports = async function handler(req, res) {
  // CORS headers — wajib ada sebelum apapun
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body — Vercel otomatis parse JSON jika Content-Type: application/json
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
    console.error('[subscribe] Missing env vars: MAILCHIMP_API_KEY or MAILCHIMP_LIST_ID');
    return res.status(500).json({ error: 'Konfigurasi server belum lengkap.' });
  }

  const url  = `https://${SERVER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;
  const auth = Buffer.from(`anystring:${API_KEY}`).toString('base64');

  let mcRes, data;
  try {
    mcRes = await fetch(url, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        email_address: email,
        status:        'subscribed',
      }),
    });
    data = await mcRes.json();
  } catch (err) {
    console.error('[subscribe] Fetch to Mailchimp failed:', err);
    return res.status(500).json({ error: 'Gagal menghubungi Mailchimp.' });
  }

  if (mcRes.status === 200 || mcRes.status === 201) {
    return res.status(200).json({ result: 'success' });
  }

  if (mcRes.status === 400 && data.title === 'Member Exists') {
    return res.status(200).json({ result: 'success', note: 'already_subscribed' });
  }

  const errMsg = data.detail || data.title || 'Gagal mendaftar.';
  console.error('[subscribe] Mailchimp error:', mcRes.status, data);
  return res.status(400).json({ error: errMsg });
};
