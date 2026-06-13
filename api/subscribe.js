/**
 * Vercel Serverless Function — Mailchimp Subscribe Proxy
 *
 * Environment variables yang harus diset di Vercel dashboard:
 *   MAILCHIMP_API_KEY   — API key dari Mailchimp (Account > Extras > API keys)
 *   MAILCHIMP_LIST_ID   — Audience/List ID dari Mailchimp (Audience > Settings > Audience name and defaults)
 *   MAILCHIMP_SERVER    — Server prefix, misal "us20" (dari URL Mailchimp: us20.admin.mailchimp.com)
 */

export default async function handler(req, res) {
  // Hanya izinkan POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS — hanya izinkan dari domain sendiri
  res.setHeader('Access-Control-Allow-Origin', 'https://www.list-concert-tour.web.id');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { email } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email tidak valid.' });
  }

  const API_KEY  = process.env.MAILCHIMP_API_KEY;
  const LIST_ID  = process.env.MAILCHIMP_LIST_ID;
  const SERVER   = process.env.MAILCHIMP_SERVER || 'us20';

  if (!API_KEY || !LIST_ID) {
    console.error('[subscribe] Missing env vars: MAILCHIMP_API_KEY or MAILCHIMP_LIST_ID');
    return res.status(500).json({ error: 'Konfigurasi server belum lengkap.' });
  }

  const url = `https://${SERVER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;

  try {
    const mc = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Basic auth: "anystring:API_KEY" di-encode base64
        'Authorization': 'Basic ' + Buffer.from(`anystring:${API_KEY}`).toString('base64'),
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',  // langsung subscribe (tanpa double opt-in)
        // Atau gunakan 'pending' jika ingin double opt-in
      }),
    });

    const data = await mc.json();

    if (mc.status === 200 || mc.status === 201) {
      // Berhasil subscribe baru
      return res.status(200).json({ result: 'success' });
    } else if (mc.status === 400 && data.title === 'Member Exists') {
      // Email sudah terdaftar — anggap sukses agar UX tidak bingung
      return res.status(200).json({ result: 'success', note: 'already_subscribed' });
    } else {
      // Error dari Mailchimp (email tidak valid, dll)
      const msg = data.detail || data.title || 'Gagal mendaftar.';
      return res.status(400).json({ error: msg });
    }
  } catch (err) {
    console.error('[subscribe] Fetch error:', err);
    return res.status(500).json({ error: 'Koneksi ke server gagal. Coba lagi.' });
  }
}
