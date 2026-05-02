import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

# We can use environment variables later, but hardcoded fallback for local dev
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "vengatavisva7@gmail.com"
SENDER_PASSWORD = "eiwd qfqq afnw fnvj"

def send_alert_email(to_email: str, subject: str, message_html: str):
    """
    Sends an automated HTML alert email.
    Note: For this to work in reality, the user must set valid Gmail credentials in their environment.
    """
    if SENDER_EMAIL == "test@example.com":
        print(f"⚠️ [MOCK EMAIL] To: {to_email} | Subject: {subject}")
        print(f"Content: {message_html}")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"GHG-FuseNet Alerts <{SENDER_EMAIL}>"
        msg["To"] = to_email

        part = MIMEText(message_html, "html")
        msg.attach(part)

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
        server.quit()
        print(f"✅ Alert email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send email to {to_email}: {str(e)}")
        return False
