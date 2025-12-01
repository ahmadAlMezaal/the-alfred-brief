"""Mailer module for The Alfred Brief - Email Dispatcher."""

import os
from typing import Any

import resend
from dotenv import load_dotenv

from src.db import get_client

load_dotenv()

RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")


def validate_resend_config() -> bool:
    """Validate that Resend API key is set."""
    if not RESEND_API_KEY:
        raise ValueError("RESEND_API_KEY environment variable is not set")
    return True


def generate_html_digest(news_items: list[dict[str, Any]]) -> str:
    """Generate HTML email content from news items."""
    if not news_items:
        return """
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a365d; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                The Alfred Brief
            </h1>
            <p style="color: #718096;">No new intelligence items today. Check back tomorrow.</p>
        </body>
        </html>
        """

    items_html = ""
    for item in news_items:
        title = item.get("title", "Untitled")
        url = item.get("url", "#")
        category = item.get("category", "Unknown")
        scraped_at = item.get("scraped_at", "")

        items_html += f"""
        <li style="margin-bottom: 20px; padding: 15px; background-color: #f7fafc; border-radius: 8px;">
            <a href="{url}" style="color: #2b6cb0; text-decoration: none; font-weight: bold; font-size: 16px;">
                {title}
            </a>
            <p style="color: #718096; margin: 8px 0 0 0; font-size: 12px;">
                Category: {category} | {scraped_at}
            </p>
        </li>
        """

    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <h1 style="color: #1a365d; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
            The Alfred Brief
        </h1>
        <p style="color: #4a5568; margin-bottom: 20px;">
            Your daily intelligence briefing is ready, sir.
        </p>
        <ul style="list-style: none; padding: 0; margin: 0;">
            {items_html}
        </ul>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="color: #a0aec0; font-size: 12px; text-align: center;">
            The Alfred Brief - Your daily intelligence digest
        </p>
    </body>
    </html>
    """


def send_digest(to_email: str) -> dict[str, Any]:
    """Fetch latest news items and send digest email.

    Args:
        to_email: Recipient email address.

    Returns:
        Resend API response.
    """
    validate_resend_config()
    resend.api_key = RESEND_API_KEY

    # Fetch latest 5 news items from Supabase
    client = get_client()
    response = (
        client.table("news_items")
        .select("*")
        .order("scraped_at", desc=True)
        .limit(5)
        .execute()
    )
    news_items = response.data

    print(f"Fetched {len(news_items)} news items for digest.")

    # Generate HTML content
    html_content = generate_html_digest(news_items)

    # Send email via Resend
    params: resend.Emails.SendParams = {
        "from": "Alfred <onboarding@resend.dev>",
        "to": [to_email],
        "subject": "Your Daily Brief from Alfred",
        "html": html_content,
    }

    email_response = resend.Emails.send(params)
    print(f"Email sent successfully to {to_email}")

    return email_response
