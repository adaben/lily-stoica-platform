"""
Email utilities for the LiLy Stoica platform.
Sends branded HTML emails via Resend SMTP.
"""
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from django.conf import settings as dj_settings
from ..models import SystemConfiguration

logger = logging.getLogger("core")

BRAND_COLOUR = "#4F8A6E"

def _site_url():
    return getattr(dj_settings, "FRONTEND_URL", "https://calm-lily.co.uk").rstrip("/")


def _get_config():
    return SystemConfiguration.load()


def _send_email(to_email: str, subject: str, html_body: str):
    """Send an email via Resend SMTP."""
    config = _get_config()
    api_key = config.resend_api_key

    if not api_key:
        logger.warning("No Resend API key configured. Email not sent to %s", to_email)
        return

    # Test mode: redirect to admin
    if config.email_test_mode and config.email_test_recipient:
        to_email = config.email_test_recipient
        subject = f"[TEST] {subject}"

    from_email = config.email_from

    msg = MIMEMultipart("alternative")
    msg["From"] = f"LiLy Stoica <{from_email}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP("smtp.resend.com", 587) as server:
            server.starttls()
            server.login("resend", api_key)
            server.send_message(msg)
        logger.info("Email sent to %s: %s", to_email, subject)
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to_email, str(e))


def _wrap_html(title: str, body: str) -> str:
    """Wrap content in a branded email template."""
    return f"""
    <!DOCTYPE html>
    <html lang="en-GB">
    <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
    <body style="margin:0;padding:0;background:#FAF8F5;font-family:Inter,Helvetica,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;">
        <tr>
          <td style="padding:32px 24px 16px;text-align:center;background:{BRAND_COLOUR};">
            <h1 style="color:#ffffff;font-size:22px;font-family:Georgia,serif;margin:0;">LiLy Stoica</h1>
            <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:4px 0 0;">Neurocoach &amp; Hypnotherapist</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 24px;">
            <h2 style="font-family:Georgia,serif;color:#1a1a1a;font-size:18px;margin:0 0 16px;">{title}</h2>
            {body}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px;background:#f5f3f0;text-align:center;font-size:12px;color:#888;">
            Calm Lily Ltd &middot; Balham, London SW12<br />
            <a href="{_site_url()}/privacy" style="color:{BRAND_COLOUR};">Privacy Policy</a>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """


# ---------------------------------------------------------------------------
# Specific email senders
# ---------------------------------------------------------------------------

def send_booking_confirmation(booking):
    """Send booking confirmation email to the client."""
    slot = booking.slot
    date_str = slot.date.strftime("%A %d %B %Y") if slot else "To be confirmed"
    time_str = f"{slot.start_time.strftime('%H:%M')}-{slot.end_time.strftime('%H:%M')}" if slot else ""

    body = f"""
    <p style="color:#444;font-size:14px;line-height:1.6;">
      Your {booking.session_type} session has been confirmed.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr>
        <td style="padding:8px 12px;border:1px solid #eee;font-size:13px;color:#666;">Date</td>
        <td style="padding:8px 12px;border:1px solid #eee;font-size:13px;font-weight:600;">{date_str}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;border:1px solid #eee;font-size:13px;color:#666;">Time</td>
        <td style="padding:8px 12px;border:1px solid #eee;font-size:13px;font-weight:600;">{time_str}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;border:1px solid #eee;font-size:13px;color:#666;">Type</td>
        <td style="padding:8px 12px;border:1px solid #eee;font-size:13px;font-weight:600;">{booking.session_type.title()}</td>
      </tr>
    </table>
    <p style="color:#444;font-size:14px;line-height:1.6;">
      You can join your session from your dashboard when the time comes.
      If you need to reschedule, please do so at least 24 hours in advance.
    </p>
    <p style="color:#444;font-size:14px;">Warm regards,<br />LiLy</p>
    """

    _send_email(
        to_email=booking.client.email,
        subject=f"Session confirmed - {date_str}",
        html_body=_wrap_html("Your session is confirmed", body),
    )


def send_lead_magnet_delivery(entry):
    """Send the free resource download link."""
    body = f"""
    <p style="color:#444;font-size:14px;line-height:1.6;">
      Hello {entry.first_name},
    </p>
    <p style="color:#444;font-size:14px;line-height:1.6;">
      Thank you for your interest in calming your nervous system.
      Here is your free Nervous System Reset audio recording:
    </p>
    <p style="text-align:center;margin:24px 0;">
      <a href="{_site_url()}/resources/nervous-system-reset"
         style="display:inline-block;background:{BRAND_COLOUR};color:#fff;
                padding:12px 28px;border-radius:24px;text-decoration:none;
                font-size:14px;font-weight:600;">
        Download Your Recording
      </a>
    </p>
    <p style="color:#444;font-size:14px;line-height:1.6;">
      If you would like to explore how neurocoaching or hypnotherapy
      could support you further, I offer a free discovery call with
      no obligation.
    </p>
    <p style="color:#444;font-size:14px;">Warm regards,<br />LiLy</p>
    """

    _send_email(
        to_email=entry.email,
        subject="Your free Nervous System Reset recording",
        html_body=_wrap_html("Your free resource is ready", body),
    )


def send_contact_notification(message):
    """Notify admin of a new contact form submission."""
    body = f"""
    <p style="color:#444;font-size:14px;line-height:1.6;">
      New contact form submission:
    </p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr>
        <td style="padding:8px 12px;border:1px solid #eee;font-size:13px;color:#666;">Name</td>
        <td style="padding:8px 12px;border:1px solid #eee;font-size:13px;">{message.name}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;border:1px solid #eee;font-size:13px;color:#666;">Email</td>
        <td style="padding:8px 12px;border:1px solid #eee;font-size:13px;">{message.email}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;border:1px solid #eee;font-size:13px;color:#666;">Phone</td>
        <td style="padding:8px 12px;border:1px solid #eee;font-size:13px;">{message.phone or "Not provided"}</td>
      </tr>
    </table>
    <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin:16px 0;">
      <p style="color:#333;font-size:14px;line-height:1.6;margin:0;">{message.message}</p>
    </div>
    """

    config = _get_config()
    admin_email = config.email_test_recipient or config.email_from

    _send_email(
        to_email=admin_email,
        subject=f"New enquiry from {message.name}",
        html_body=_wrap_html("New contact form message", body),
    )
