/**
 * Vercel Serverless Function — Mailchimp Subscribe Proxy
 *
 * Environment variables yang harus diset di Vercel dashboard:
 *   MAILCHIMP_API_KEY  — API key dari Mailchimp (Account > Extras > API keys)
 *   MAILCHIMP_LIST_ID  — Audience/List ID (Audience > Settings > Audience name and defaults)
 *   MAILCHIMP_SERVER   — Server prefix, misal "us20" (dari URL: us20.admin.mailchimp.com)
 */

module.exports = async function handler(req, res) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};

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

  const url = `https://${SERVER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;
  const auth = Buffer.from(`anystring:${API_KEY}`).toString('base64');

  try {
    const mc   = await fetch(url, {
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

    const data = await mc.json();

    if (mc.status === 200 || mc.status === 201) {
      return res.status(200).json({ result: 'success' });
    }

    if (mc.status === 400 && data.title === 'Member Exists') {
      return res.status(200).json({ result: 'success', note: 'already_subscribed' });
    }

    const msg = data.detail || data.title || 'Gagal mendaftar.';
    return res.status(400).json({ error: msg });

  } catch (err) {
    console.error('[subscribe] Error:', err);
    return res.status(500).json({ error: 'Koneksi ke server gagal. Coba lagi.' });
  }
};
