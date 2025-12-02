"""Mailer module for The Alfred Brief - Email Dispatcher."""

import os
from datetime import date, datetime, timedelta, timezone
from typing import Any

import resend
from dotenv import load_dotenv

from src.db import get_client

load_dotenv()

RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")

# Valid category keys (must match preferences_json keys)
VALID_CATEGORIES = ("immigration", "tech", "finance")


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


def get_subscriber_categories(preferences_json: dict[str, Any] | None) -> set[str]:
    """Extract enabled categories from subscriber preferences.

    Args:
        preferences_json: The subscriber's preferences dict (e.g., {"immigration": true, "tech": false}).

    Returns:
        Set of category names where the value is truthy.
    """
    if not preferences_json:
        return set()

    return {
        category
        for category in VALID_CATEGORIES
        if preferences_json.get(category, False)
    }


def filter_news_for_subscriber(
    news_items: list[dict[str, Any]], enabled_categories: set[str]
) -> list[dict[str, Any]]:
    """Filter news items to only those matching subscriber's preferences.

    Args:
        news_items: All today's news items.
        enabled_categories: Set of category names the subscriber wants.

    Returns:
        Filtered list of news items.
    """
    return [
        item
        for item in news_items
        if item.get("category", "").lower() in enabled_categories
    ]


def send_daily_briefs() -> dict[str, Any]:
    """Send personalized daily briefs to all active subscribers.

    Logic:
        1. Fetch all active subscribers.
        2. Fetch today's news items.
        3. For each subscriber:
           - Parse their preferences.
           - Filter news to their categories.
           - If no matches, skip (don't spam).
           - If matches exist, generate HTML and send.

    Returns:
        Summary dict with sent_count, skipped_count, and errors.
    """
    validate_resend_config()
    resend.api_key = RESEND_API_KEY

    client = get_client()

    # Fetch all active subscribers
    subscribers_response = (
        client.table("subscribers")
        .select("id, email, preferences_json")
        .eq("active", True)
        .execute()
    )
    subscribers = subscribers_response.data
    print(f"Found {len(subscribers)} active subscribers.")

    if not subscribers:
        print("No active subscribers. Skipping email dispatch.")
        return {"sent_count": 0, "skipped_count": 0, "errors": []}

    # Fetch today's news items (scraped in the last 24 hours)
    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    news_response = (
        client.table("news_items")
        .select("*")
        .gte("scraped_at", today_start.isoformat())
        .order("scraped_at", desc=True)
        .execute()
    )
    all_news_items = news_response.data
    print(f"Found {len(all_news_items)} news items from today.")

    if not all_news_items:
        print("No news items today. Skipping email dispatch.")
        return {"sent_count": 0, "skipped_count": len(subscribers), "errors": []}

    sent_count = 0
    skipped_count = 0
    errors: list[str] = []

    for subscriber in subscribers:
        email = subscriber.get("email")
        preferences = subscriber.get("preferences_json")

        if not email:
            continue

        # Get enabled categories for this subscriber
        enabled_categories = get_subscriber_categories(preferences)

        if not enabled_categories:
            print(f"  Skipping {email}: No categories enabled.")
            skipped_count += 1
            continue

        # Filter news to subscriber's preferences
        personalized_news = filter_news_for_subscriber(all_news_items, enabled_categories)

        if not personalized_news:
            print(f"  Skipping {email}: No matching news for their preferences.")
            skipped_count += 1
            continue

        # Generate and send personalized email
        try:
            html_content = generate_html_digest(personalized_news)
            params: resend.Emails.SendParams = {
                "from": "Alfred <onboarding@resend.dev>",
                "to": [email],
                "subject": "Your Daily Brief from Alfred",
                "html": html_content,
            }
            resend.Emails.send(params)
            print(f"  Sent to {email}: {len(personalized_news)} items.")
            sent_count += 1
        except Exception as e:
            error_msg = f"Failed to send to {email}: {e}"
            print(f"  {error_msg}")
            errors.append(error_msg)

    print(f"\nDaily briefs complete: {sent_count} sent, {skipped_count} skipped, {len(errors)} errors.")
    return {"sent_count": sent_count, "skipped_count": skipped_count, "errors": errors}
