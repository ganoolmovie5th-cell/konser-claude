#!/usr/bin/env python3
"""
ConcertID — Email Reporter
===========================
Kirim laporan HTML hasil scraping ke listconcerttour@gmail.com
via Gmail SMTP menggunakan App Password.

Dipanggil oleh GitHub Actions setelah scraper.py selesai jalan.

Env vars yang dibutuhkan (set di GitHub Secrets):
  GMAIL_APP_PASSWORD  — App Password dari Google Account
  ADMIN_EMAIL         — (opsional) override tujuan email, default: listconcerttour@gmail.com
"""

import os
import sys
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timezone, timedelta
from pathlib import Path

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
log = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────────────────────
WIB         = timezone(timedelta(hours=7))
TODAY_LABEL = datetime.now(WIB).strftime("%d %b %Y %H:%M WIB")

SENDER_EMAIL = "listconcerttour@gmail.com"
ADMIN_EMAIL  = os.environ.get("ADMIN_EMAIL", "listconcerttour@gmail.com")
APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")

REPORT_HTML  = Path(__file__).parent / "scraper_report.html"
REPORT_JSON  = Path(__file__).parent / "scraper_report.json"


def load_report_html() -> str:
    if REPORT_HTML.exists():
        return REPORT_HTML.read_text(encoding="utf-8")
    return "<p>Report HTML tidak ditemukan.</p>"


def load_report_summary() -> dict:
    """Baca JSON report untuk subject email."""
    import json
    if REPORT_JSON.exists():
        try:
            return json.loads(REPORT_JSON.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


def send_report():
    if not APP_PASSWORD:
        log.error("GMAIL_APP_PASSWORD tidak di-set di environment / GitHub Secrets!")
        log.error("Lihat README untuk cara setup App Password.")
        sys.exit(1)

    summary = load_report_summary()
    n_new   = len(summary.get("new_potential", []))
    n_upd   = len(summary.get("updates", []))
    total   = summary.get("total_raw", 0)

    subject = (
        f"[ConcertID] Laporan Scraper Harian — {TODAY_LABEL} "
        f"| {n_new} Potensi Baru · {n_upd} Update"
    )

    html_body = load_report_html()

    # Fallback plain text
    plain_body = (
        f"ConcertID Scraper Report — {TODAY_LABEL}\n\n"
        f"Total item ditemukan : {total}\n"
        f"Potensi konser baru  : {n_new}\n"
        f"Info update          : {n_upd}\n\n"
        f"Buka email HTML untuk melihat detail lengkap.\n\n"
        f"Review & update manual di:\n"
        f"https://github.com/ganoolmovie5th-cell/list-concert-tour-claude/blob/main/app.js\n\n"
        f"--- ConcertID Auto-Scraper ---"
    )

    # Buat email
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"ConcertID Bot <{SENDER_EMAIL}>"
    msg["To"]      = ADMIN_EMAIL

    msg.attach(MIMEText(plain_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body,  "html",  "utf-8"))

    # Kirim via Gmail SMTP
    log.info(f"Mengirim laporan ke: {ADMIN_EMAIL}")
    log.info(f"Subject: {subject}")

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, APP_PASSWORD)
            server.sendmail(SENDER_EMAIL, ADMIN_EMAIL, msg.as_string())
        log.info("✅ Email laporan berhasil dikirim!")
    except smtplib.SMTPAuthenticationError:
        log.error("❌ Autentikasi Gmail gagal!")
        log.error("   Pastikan GMAIL_APP_PASSWORD sudah benar di GitHub Secrets.")
        log.error("   Lihat README section 'Setup Gmail App Password'.")
        sys.exit(1)
    except Exception as exc:
        log.error(f"❌ Gagal kirim email: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    send_report()
