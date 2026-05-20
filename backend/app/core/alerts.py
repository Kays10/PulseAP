import emails
from .config import settings
import logging

logger = logging.getLogger(__name__)

def send_alert_email(ap_name: str, site_name: str, status: str):
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        logger.warning("SMTP not configured, skipping alert email")
        return

    subject = f"ALERT: Access Point {ap_name} is {status.upper()}"
    if status == "online":
        subject = f"RECOVERY: Access Point {ap_name} is back ONLINE"

    body = f"""
    <h3>Access Point Status Alert</h3>
    <p><b>AP Name:</b> {ap_name}</p>
    <p><b>Site:</b> {site_name}</p>
    <p><b>Status:</b> {status.upper()}</p>
    <p><b>Time:</b> {emails.utils.now()}</p>
    """

    message = emails.html(
        html=body,
        subject=subject,
        mail_from=settings.SMTP_FROM or settings.SMTP_USER
    )

    try:
        r = message.send(
            to=settings.SMTP_TO or settings.SMTP_USER,
            smtp={
                "host": settings.SMTP_HOST,
                "port": settings.SMTP_PORT,
                "ssl": settings.SMTP_PORT == 465,
                "tls": settings.SMTP_PORT == 587,
                "user": settings.SMTP_USER,
                "password": settings.SMTP_PASSWORD,
            }
        )
        if r.status_code != 250:
            logger.error(f"Failed to send email: {r.status_code}")
    except Exception as e:
        logger.error(f"Error sending email: {e}")
