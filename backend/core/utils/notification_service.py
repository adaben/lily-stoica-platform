"""
Notification service for the LiLy Stoica platform.
Handles admin notifications for key events.
"""
import logging
import threading

from .email_utils import _send_email, _wrap_html, _get_config

logger = logging.getLogger("core")


def _send_async(to_email: str, subject: str, html_body: str):
    """Send email in a daemon thread to avoid blocking the request."""
    thread = threading.Thread(
        target=_send_email,
        args=(to_email, subject, html_body),
        daemon=True,
    )
    thread.start()


def notify_admin_new_booking(booking):
    """Notify admin of a new booking that needs confirmation."""
    slot = booking.slot
    date_str = slot.date.strftime("%d/%m/%Y") if slot else "TBC"
    time_str = f"{slot.start_time.strftime('%H:%M')}" if slot else ""

    body = f"""
    <p style="color:#444;font-size:14px;line-height:1.6;">
      A new booking has been submitted and requires your confirmation:
    </p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr>
        <td style="padding:8px 12px;border:1px solid #eee;font-size:13px;color:#666;">Client</td>
        <td style="padding:8px 12px;border:1px solid #eee;font-size:13px;font-weight:600;">{booking.client.full_name}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;border:1px solid #eee;font-size:13px;color:#666;">Type</td>
        <td style="padding:8px 12px;border:1px solid #eee;font-size:13px;">{booking.session_type.title()}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;border:1px solid #eee;font-size:13px;color:#666;">Date</td>
        <td style="padding:8px 12px;border:1px solid #eee;font-size:13px;">{date_str} {time_str}</td>
      </tr>
    </table>
    {f'<p style="color:#666;font-size:13px;">Notes: {booking.notes}</p>' if booking.notes else ''}
    <p style="color:#444;font-size:14px;">
      Please log in to the admin dashboard to confirm or manage this booking.
    </p>
    """

    config = _get_config()
    admin_email = config.email_test_recipient or config.email_from

    _send_async(
        to_email=admin_email,
        subject=f"New booking from {booking.client.full_name}",
        html_body=_wrap_html("New booking requires confirmation", body),
    )
