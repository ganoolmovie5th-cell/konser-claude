#!/usr/bin/env python3
"""
ConcertID — Daily Monitoring Scraper (Opsi A)
============================================
Jalan tiap hari jam 01:00 WIB via GitHub Actions.
TIDAK menulis ke app.js dan TIDAK auto-push ke main.

Cara kerja:
  1. Scrape beberapa sumber terpercaya
  2. Bandingkan dengan data konser yang sudah ada di app.js
  3. Generate laporan JSON → dikirim ke email sebagai HTML report
  4. Kamu review → kalau ada info valid → tambah manual ke app.js → merge ke main

Sumber:
  - Bandwagon Asia
  - Tempo.co
  - The Jakarta Post
  - Songkick
  - Jambase
  - tiket.com / loket.com search
"""

import json
import re
import sys
import time
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path

import requests
from bs4 import BeautifulSoup

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
log = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────
WIB         = timezone(timedelta(hours=7))
NOW_WIB     = datetime.now(WIB)
TODAY_STR   = NOW_WIB.strftime("%Y-%m-%d")
TODAY_LABEL = NOW_WIB.strftime("%d %b %Y %H:%M WIB")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Referer": "https://www.google.com/",
}

APP_JS_PATH    = Path(__file__).parent / "app.js"
REPORT_PATH    = Path(__file__).parent / "scraper_report.json"
REPORT_HTML    = Path(__file__).parent / "scraper_report.html"

# ── Baca artist yang sudah ada di app.js ──────────────────────────────────────
def get_existing_artists() -> set[str]:
    """Baca semua artist & id yang sudah ada di app.js."""
    if not APP_JS_PATH.exists():
        return set()
    content = APP_JS_PATH.read_text(encoding="utf-8")
    artists = set(re.findall(r"artist:\s*'([^']+)'", content))
    return {a.lower().strip() for a in artists}

def get_existing_ids() -> set[str]:
    if not APP_JS_PATH.exists():
        return set()
    content = APP_JS_PATH.read_text(encoding="utf-8")
    return set(re.findall(r"id:\s*'([^']+)'", content))

def normalize(name: str) -> str:
    return re.sub(r"[^a-z0-9 ]", "", name.lower()).strip()

def already_in_list(artist: str, existing_artists: set[str]) -> bool:
    norm = normalize(artist)
    if not norm or len(norm) < 3:
        return True  # skip garbage
    for ea in existing_artists:
        if norm in ea or ea in norm:
            return True
    return False

# ── Fetcher ───────────────────────────────────────────────────────────────────
def fetch(url: str, timeout: int = 15) -> BeautifulSoup | None:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=timeout)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "html.parser")
    except Exception as exc:
        log.warning(f"fetch failed: {url} → {exc}")
        return None

# ── Scrapers ──────────────────────────────────────────────────────────────────

def scrape_bandwagon() -> list[dict]:
    """Bandwagon Asia — portal musik Asia Tenggara paling terpercaya."""
    found = []
    for path in [
        "/articles?tag=indonesia",
        "/articles?tag=jakarta",
        "/articles?tag=concert-announcements",
    ]:
        url  = f"https://www.bandwagon.asia{path}"
        soup = fetch(url)
        if not soup:
            continue
        for art in soup.select("article, .article-card, [class*='article'], [class*='post']")[:20]:
            title_el = art.select_one("h1,h2,h3,h4,.title,[class*='title']")
            if not title_el:
                continue
            title = title_el.get_text(strip=True)
            if not any(k in title.lower() for k in ["concert","tour","jakarta","indonesia","live","konser","fancon","fan meeting"]):
                continue
            link_el = art.select_one("a[href]")
            link = link_el["href"] if link_el else ""
            if link and not link.startswith("http"):
                link = "https://www.bandwagon.asia" + link
            # Coba ambil tanggal jika ada
            date_el = art.select_one("time,[class*='date'],[class*='time']")
            date    = date_el.get_text(strip=True) if date_el else ""
            found.append({
                "title": title, "url": link, "date": date,
                "source": "bandwagon.asia", "source_label": "Bandwagon Asia",
                "reliability": "HIGH",
            })
        time.sleep(1)
    log.info(f"bandwagon: {len(found)} artikel")
    return found


def scrape_tempo() -> list[dict]:
    """Tempo.co — media Indonesia terpercaya."""
    found = []
    for url in [
        "https://en.tempo.co/topic/concert",
        "https://www.tempo.co/tag/konser",
    ]:
        soup = fetch(url)
        if not soup:
            continue
        for art in soup.select("article,.card,[class*='article'],[class*='news']")[:20]:
            title_el = art.select_one("h1,h2,h3,h4,a")
            if not title_el:
                continue
            title = title_el.get_text(strip=True)
            if not any(k in title.lower() for k in ["concert","jakarta","indonesia","tour","live","konser"]):
                continue
            link_el = art.select_one("a[href]")
            link = link_el["href"] if link_el else ""
            date_el = art.select_one("time,[class*='date']")
            date    = date_el.get_text(strip=True) if date_el else ""
            found.append({
                "title": title, "url": link, "date": date,
                "source": "tempo.co", "source_label": "Tempo.co",
                "reliability": "HIGH",
            })
        time.sleep(1)
    log.info(f"tempo: {len(found)} artikel")
    return found


def scrape_thejakartapost() -> list[dict]:
    """The Jakarta Post — berita Indonesia berbahasa Inggris."""
    found = []
    soup  = fetch("https://www.thejakartapost.com/culture")
    if soup:
        for art in soup.select("article,.article,[class*='article'],[class*='story']")[:20]:
            title_el = art.select_one("h1,h2,h3,h4")
            if not title_el:
                continue
            title = title_el.get_text(strip=True)
            if not any(k in title.lower() for k in ["concert","tour","live","music","perform","konser"]):
                continue
            link_el = art.select_one("a[href]")
            link = link_el["href"] if link_el else ""
            if link and link.startswith("/"):
                link = "https://www.thejakartapost.com" + link
            date_el = art.select_one("time,[class*='date']")
            date    = date_el.get_text(strip=True) if date_el else ""
            found.append({
                "title": title, "url": link, "date": date,
                "source": "thejakartapost.com", "source_label": "The Jakarta Post",
                "reliability": "HIGH",
            })
    log.info(f"jakartapost: {len(found)} artikel")
    return found


def scrape_songkick() -> list[dict]:
    """Songkick — database konser global terpercaya."""
    found = []
    soup  = fetch("https://www.songkick.com/countries/105-indonesia/calendar")
    if soup:
        for ev in soup.select("li.event,[class*='event-listing'],[class*='concert']")[:30]:
            artist_el = ev.select_one(".artists,.summary,h3,strong")
            date_el   = ev.select_one("time,.date,[class*='date']")
            venue_el  = ev.select_one(".venue,[class*='venue']")
            link_el   = ev.select_one("a[href]")

            artist = artist_el.get_text(strip=True) if artist_el else ""
            date   = date_el.get_text(strip=True)   if date_el   else ""
            venue  = venue_el.get_text(strip=True)  if venue_el  else ""
            link   = link_el["href"]                if link_el   else ""
            if link and link.startswith("/"):
                link = "https://www.songkick.com" + link

            if artist:
                found.append({
                    "title": f"{artist} live in Indonesia",
                    "artist": artist, "date": date, "venue": venue,
                    "url": link, "source": "songkick.com",
                    "source_label": "Songkick",
                    "reliability": "HIGH",
                })
    log.info(f"songkick: {len(found)} events")
    return found


def scrape_jambase() -> list[dict]:
    """Jambase — database konser global."""
    found = []
    soup  = fetch("https://www.jambase.com/concerts/id")
    if soup:
        for row in soup.select(".event-listing,.concert-row,[class*='event'],[class*='show']")[:30]:
            artist_el = row.select_one(".artist,.headliner,h3,h4,strong,[class*='artist']")
            date_el   = row.select_one(".date,time,[class*='date']")
            venue_el  = row.select_one(".venue,[class*='venue']")
            link_el   = row.select_one("a[href]")

            artist = artist_el.get_text(strip=True) if artist_el else ""
            date   = date_el.get_text(strip=True)   if date_el   else ""
            venue  = venue_el.get_text(strip=True)  if venue_el  else ""
            link   = link_el["href"]                if link_el   else ""

            if artist:
                found.append({
                    "title": f"{artist} live in Indonesia",
                    "artist": artist, "date": date, "venue": venue,
                    "url": link, "source": "jambase.com",
                    "source_label": "JamBase",
                    "reliability": "MEDIUM",
                })
    log.info(f"jambase: {len(found)} events")
    return found


def scrape_tiket() -> list[dict]:
    """tiket.com — platform tiket resmi Indonesia."""
    found = []
    soup  = fetch("https://www.tiket.com/event/konser?page=1")
    if soup:
        for card in soup.select("[class*='card'],[class*='event-item'],[class*='show']")[:30]:
            title_el = card.select_one("h2,h3,[class*='title'],[class*='name']")
            date_el  = card.select_one("time,[class*='date'],[class*='time']")
            link_el  = card.select_one("a[href]")

            title = title_el.get_text(strip=True) if title_el else ""
            date  = date_el.get_text(strip=True)  if date_el  else ""
            link  = link_el["href"]               if link_el  else ""
            if link and link.startswith("/"):
                link = "https://www.tiket.com" + link

            if title and len(title) > 3:
                found.append({
                    "title": title, "date": date, "url": link,
                    "source": "tiket.com", "source_label": "tiket.com",
                    "reliability": "HIGH",
                })
    log.info(f"tiket.com: {len(found)} events")
    return found


def scrape_loket() -> list[dict]:
    """Loket.com — platform tiket resmi Indonesia."""
    found = []
    soup  = fetch("https://www.loket.com/event?category=concert")
    if soup:
        for card in soup.select("[class*='card'],[class*='event'],[class*='item']")[:30]:
            title_el = card.select_one("h2,h3,[class*='title'],[class*='name']")
            date_el  = card.select_one("time,[class*='date']")
            link_el  = card.select_one("a[href]")

            title = title_el.get_text(strip=True) if title_el else ""
            date  = date_el.get_text(strip=True)  if date_el  else ""
            link  = link_el["href"]               if link_el  else ""
            if link and link.startswith("/"):
                link = "https://www.loket.com" + link

            if title and len(title) > 3:
                found.append({
                    "title": title, "date": date, "url": link,
                    "source": "loket.com", "source_label": "Loket.com",
                    "reliability": "HIGH",
                })
    log.info(f"loket.com: {len(found)} events")
    return found


# ── Deduplicate & Classify ─────────────────────────────────────────────────────

def deduplicate(items: list[dict]) -> list[dict]:
    """Hapus duplikat berdasarkan title similarity."""
    seen   = set()
    result = []
    for item in items:
        key = normalize(item.get("title", ""))[:40]
        if key and key not in seen:
            seen.add(key)
            result.append(item)
    return result


def classify_items(items: list[dict], existing_artists: set[str]) -> dict:
    """
    Pisahkan hasil scraping menjadi:
    - new_potential  : artis yang belum ada di list (perlu review)
    - updates        : artis yang sudah ada (mungkin ada update info)
    - irrelevant     : tidak relevan (artikel umum, bukan konser spesifik)
    """
    new_potential = []
    updates       = []
    irrelevant    = []

    for item in items:
        title  = item.get("title", "")
        artist = item.get("artist", "")
        if not artist:
            # Coba ekstrak nama artis dari judul
            # Pattern: "ARTIST live/tour/concert/fancon in/at Indonesia/Jakarta"
            m = re.search(
                r"^([A-Z][^–—:]+?)\s+(?:live|tour|concert|konser|fancon|fan\s+meeting|tampil)",
                title, re.IGNORECASE
            )
            artist = m.group(1).strip() if m else ""

        if already_in_list(artist or title, existing_artists):
            updates.append({**item, "_extracted_artist": artist})
        elif artist and len(artist) > 2:
            new_potential.append({**item, "_extracted_artist": artist})
        else:
            irrelevant.append(item)

    return {
        "new_potential": new_potential,
        "updates":       updates,
        "irrelevant":    irrelevant,
    }


# ── Report Generator ──────────────────────────────────────────────────────────

def generate_html_report(classified: dict, raw_count: int, today: str) -> str:
    """Generate HTML email report untuk dikirim ke admin."""

    new_items    = classified["new_potential"]
    update_items = classified["updates"]

    def item_row(item: dict, highlight: bool = False) -> str:
        title    = item.get("title", "-")
        url      = item.get("url", "#")
        date     = item.get("date", "")
        venue    = item.get("venue", "")
        source   = item.get("source_label", item.get("source", ""))
        artist   = item.get("_extracted_artist", "")
        rel      = item.get("reliability", "")
        rel_color = {"HIGH": "#4ade80", "MEDIUM": "#fbbf24", "LOW": "#f87171"}.get(rel, "#a1a1aa")
        bg       = "rgba(168,85,247,0.08)" if highlight else "transparent"

        return f"""
        <tr style="background:{bg};border-bottom:1px solid #27272a;">
          <td style="padding:10px 12px;font-family:Arial,sans-serif;font-size:13px;color:#ffffff;max-width:280px;">
            <a href="{url}" style="color:#c084fc;text-decoration:none;font-weight:600;">{title[:80]}</a>
            {f'<br/><span style="font-size:11px;color:#a1a1aa;">🎤 {artist}</span>' if artist else ''}
          </td>
          <td style="padding:10px 12px;font-family:Arial,sans-serif;font-size:12px;color:#a1a1aa;white-space:nowrap;">{date[:20] if date else '—'}</td>
          <td style="padding:10px 12px;font-family:Arial,sans-serif;font-size:12px;color:#a1a1aa;">{venue[:30] if venue else '—'}</td>
          <td style="padding:10px 12px;font-family:Arial,sans-serif;font-size:12px;color:#a1a1aa;">{source}</td>
          <td style="padding:10px 12px;text-align:center;">
            <span style="font-size:11px;font-weight:700;color:{rel_color};background:rgba(255,255,255,0.05);padding:2px 8px;border-radius:99px;">{rel}</span>
          </td>
        </tr>"""

    new_rows    = "".join(item_row(i, highlight=True) for i in new_items[:30]) if new_items    else '<tr><td colspan="5" style="padding:16px;text-align:center;color:#71717a;font-family:Arial,sans-serif;font-size:13px;">Tidak ada artis baru terdeteksi hari ini.</td></tr>'
    update_rows = "".join(item_row(i)                 for i in update_items[:20]) if update_items else '<tr><td colspan="5" style="padding:16px;text-align:center;color:#71717a;font-family:Arial,sans-serif;font-size:13px;">Tidak ada update info konser yang sudah ada.</td></tr>'

    return f"""<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>ConcertID Scraper Report — {today}</title></head>
<body style="margin:0;padding:0;background:#09090b;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#09090b;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="max-width:640px;width:100%;">

  <!-- HEADER -->
  <tr><td style="background:#18181c;border:1px solid #27272a;border-radius:12px 12px 0 0;padding:24px 32px;text-align:center;">
    <p style="font-family:Arial,sans-serif;font-size:22px;font-weight:900;color:#ffffff;margin:0 0 4px 0;">
      Concert<span style="color:#a855f7;">ID</span> — Scraper Report
    </p>
    <p style="font-family:Arial,sans-serif;font-size:13px;color:#71717a;margin:0;">
      Daily monitoring run · {today}
    </p>
  </td></tr>

  <!-- SUMMARY STATS -->
  <tr><td style="background:#18181c;border-left:1px solid #27272a;border-right:1px solid #27272a;padding:0;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="padding:20px;text-align:center;border-right:1px solid #27272a;border-bottom:1px solid #27272a;">
          <p style="font-family:Arial,sans-serif;font-size:28px;font-weight:900;color:#a855f7;margin:0;">{raw_count}</p>
          <p style="font-family:Arial,sans-serif;font-size:11px;color:#71717a;margin:0;text-transform:uppercase;letter-spacing:1px;">Total Ditemukan</p>
        </td>
        <td style="padding:20px;text-align:center;border-right:1px solid #27272a;border-bottom:1px solid #27272a;">
          <p style="font-family:Arial,sans-serif;font-size:28px;font-weight:900;color:#ec4899;margin:0;">{len(new_items)}</p>
          <p style="font-family:Arial,sans-serif;font-size:11px;color:#71717a;margin:0;text-transform:uppercase;letter-spacing:1px;">Potensi Baru</p>
        </td>
        <td style="padding:20px;text-align:center;border-bottom:1px solid #27272a;">
          <p style="font-family:Arial,sans-serif;font-size:28px;font-weight:900;color:#fbbf24;margin:0;">{len(update_items)}</p>
          <p style="font-family:Arial,sans-serif;font-size:11px;color:#71717a;margin:0;text-transform:uppercase;letter-spacing:1px;">Info Update</p>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- ALERT BOX -->
  <tr><td style="background:#18181c;border-left:1px solid #27272a;border-right:1px solid #27272a;padding:16px 24px;">
    <div style="background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.3);border-radius:8px;padding:12px 16px;">
      <p style="font-family:Arial,sans-serif;font-size:13px;color:#fbbf24;margin:0;line-height:1.6;">
        ⚠️ <strong>REVIEW DIPERLUKAN.</strong> Data ini belum diverifikasi. Cek sumber asli sebelum menambahkan ke website.
        Kalau ada info valid → update manual di <code style="background:rgba(255,255,255,0.08);padding:1px 6px;border-radius:4px;">app.js</code> → merge ke main.
      </p>
    </div>
  </td></tr>

  <!-- SECTION: POTENSI KONSER BARU -->
  <tr><td style="background:#18181c;border-left:1px solid #27272a;border-right:1px solid #27272a;padding:20px 24px 8px;">
    <p style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ec4899;margin:0 0 12px 0;">
      🆕 Potensi Konser Baru ({len(new_items)} item)
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0f0f12;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:rgba(168,85,247,0.1);">
          <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#a1a1aa;text-align:left;font-weight:600;">Judul / Artis</th>
          <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#a1a1aa;text-align:left;font-weight:600;">Tanggal</th>
          <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#a1a1aa;text-align:left;font-weight:600;">Venue</th>
          <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#a1a1aa;text-align:left;font-weight:600;">Sumber</th>
          <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#a1a1aa;text-align:center;font-weight:600;">Trust</th>
        </tr>
      </thead>
      <tbody>{new_rows}</tbody>
    </table>
  </td></tr>

  <!-- SECTION: UPDATE KONSER YANG SUDAH ADA -->
  <tr><td style="background:#18181c;border-left:1px solid #27272a;border-right:1px solid #27272a;padding:20px 24px 8px;">
    <p style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#fbbf24;margin:0 0 12px 0;">
      🔄 Update Konser yang Sudah Ada ({len(update_items)} item)
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0f0f12;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:rgba(251,191,36,0.08);">
          <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#a1a1aa;text-align:left;font-weight:600;">Judul / Artis</th>
          <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#a1a1aa;text-align:left;font-weight:600;">Tanggal</th>
          <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#a1a1aa;text-align:left;font-weight:600;">Venue</th>
          <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#a1a1aa;text-align:left;font-weight:600;">Sumber</th>
          <th style="padding:8px 12px;font-family:Arial,sans-serif;font-size:11px;color:#a1a1aa;text-align:center;font-weight:600;">Trust</th>
        </tr>
      </thead>
      <tbody>{update_rows}</tbody>
    </table>
  </td></tr>

  <!-- CTA -->
  <tr><td style="background:#18181c;border-left:1px solid #27272a;border-right:1px solid #27272a;padding:20px 24px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center">
          <a href="https://github.com/ganoolmovie5th-cell/list-concert-tour-claude/blob/main/app.js"
             target="_blank"
             style="display:inline-block;background:linear-gradient(135deg,#a855f7,#ec4899);color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-decoration:none;padding:11px 28px;border-radius:99px;margin:0 6px;">
            ✏️ Edit app.js di GitHub
          </a>
          <a href="https://github.com/ganoolmovie5th-cell/list-concert-tour-claude/actions"
             target="_blank"
             style="display:inline-block;background:rgba(255,255,255,0.07);border:1px solid #27272a;color:#a1a1aa;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-decoration:none;padding:11px 28px;border-radius:99px;margin:0 6px;">
            📊 Lihat Actions Log
          </a>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#18181c;border:1px solid #27272a;border-top:none;border-radius:0 0 12px 12px;padding:16px 24px;text-align:center;">
    <p style="font-family:Arial,sans-serif;font-size:11px;color:#52525b;margin:0;line-height:1.6;">
      ConcertID Auto-Scraper · Laporan harian otomatis · Tidak perlu balas email ini<br/>
      Data belum diverifikasi — selalu cek sumber asli sebelum publish
    </p>
  </td></tr>

  <tr><td style="height:24px;"></td></tr>

</table>
</td></tr>
</table>
</body>
</html>"""


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    log.info(f"=== ConcertID Monitoring Scraper — {TODAY_LABEL} ===")
    log.info("Mode: MONITORING ONLY (tidak menulis app.js, tidak push ke main)")

    existing_artists = get_existing_artists()
    log.info(f"Artis sudah ada di list: {len(existing_artists)}")

    # Jalankan semua scraper
    raw_items: list[dict] = []
    scrapers = [
        ("Bandwagon Asia",   scrape_bandwagon),
        ("Tempo.co",         scrape_tempo),
        ("The Jakarta Post", scrape_thejakartapost),
        ("Songkick",         scrape_songkick),
        ("JamBase",          scrape_jambase),
        ("tiket.com",        scrape_tiket),
        ("Loket.com",        scrape_loket),
    ]

    for name, fn in scrapers:
        log.info(f"Scraping: {name} ...")
        try:
            items = fn()
            raw_items.extend(items)
            log.info(f"  → {len(items)} item")
        except Exception as exc:
            log.warning(f"  ✗ Error: {exc}")
        time.sleep(2)

    # Deduplikasi
    raw_items = deduplicate(raw_items)
    log.info(f"Total unik setelah deduplikasi: {len(raw_items)}")

    # Klasifikasi
    classified = classify_items(raw_items, existing_artists)
    log.info(f"Potensi baru: {len(classified['new_potential'])}")
    log.info(f"Info update : {len(classified['updates'])}")
    log.info(f"Tidak relevan: {len(classified['irrelevant'])}")

    # Simpan JSON report
    report_data = {
        "generated_at": TODAY_LABEL,
        "total_raw": len(raw_items),
        "new_potential": classified["new_potential"],
        "updates": classified["updates"],
    }
    REPORT_PATH.write_text(json.dumps(report_data, ensure_ascii=False, indent=2), encoding="utf-8")
    log.info(f"JSON report disimpan: {REPORT_PATH}")

    # Generate HTML report
    html = generate_html_report(classified, len(raw_items), TODAY_LABEL)
    REPORT_HTML.write_text(html, encoding="utf-8")
    log.info(f"HTML report disimpan: {REPORT_HTML}")

    log.info("=== Selesai. Laporan siap dikirim via email_reporter.py ===")
    return 0


if __name__ == "__main__":
    sys.exit(main())
