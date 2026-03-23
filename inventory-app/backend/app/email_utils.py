import aiosmtplib
from email.message import EmailMessage
from jinja2 import Environment, FileSystemLoader
from io import BytesIO
import os

# Setup Jinja2 environment
env = Environment(loader=FileSystemLoader(os.path.join(os.path.dirname(__file__), "templates")))

async def send_html_email(
    to_email: str,
    subject: str,
    context: dict,
    attachments: list[tuple[str, BytesIO]] = None
):
    """
    Send HTML email with optional in-memory attachments.
    attachments: list of tuples (filename, BytesIO)
    """
    template = env.get_template("template.html")
    html_content = template.render(**context)

    message = EmailMessage()
    message["From"] = "noreply@example.com"
    message["To"] = to_email
    message["Subject"] = subject
    message.add_alternative(html_content, subtype="html")

    if attachments:
        for filename, file_bytes in attachments:
            file_bytes.seek(0)
            message.add_attachment(
                file_bytes.read(),
                maintype="application",
                subtype="vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                filename=filename
            )

    await aiosmtplib.send(
        message,
        hostname="smtp.example.com",
        port=587,
        username="smtp_user",
        password="smtp_password",
        start_tls=True
    )
    print(f"Email sent to {to_email} with attachments {[f[0] for f in attachments]}")