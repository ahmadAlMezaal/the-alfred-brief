"""Mailer module for The Alfred Brief - Email Dispatcher."""

import os
from datetime import datetime, timezone
from typing import Any

import resend
from dotenv import load_dotenv

from src.db import get_client

load_dotenv()

RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
APP_BASE_URL: str = os.getenv("APP_BASE_URL", "http://localhost:3000")

# Valid category keys (must match preferences_json keys)
VALID_CATEGORIES = ("immigration", "tech", "finance")


def validate_resend_config() -> bool:
    """Validate that Resend API key is set."""
    if not RESEND_API_KEY:
        raise ValueError("RESEND_API_KEY environment variable is not set")
    return True


def format_scraped_date(scraped_at: str) -> str:
    """Parse scraped_at timestamp and format as 'DD Mon' (e.g., '02 Dec').

    Args:
        scraped_at: ISO format timestamp string.

    Returns:
        Formatted date string or empty string if parsing fails.
    """
    if not scraped_at:
        return ""
    try:
        dt = datetime.fromisoformat(scraped_at.replace("Z", "+00:00"))
        return dt.strftime("%d %b")
    except (ValueError, TypeError):
        return ""


def get_category_badge_style(category: str) -> tuple[str, str]:
    """Get inline styles for category badge based on category name.

    Args:
        category: The category name (immigration, tech, finance).

    Returns:
        Tuple of (background_color, text_color) hex values.
    """
    category_styles = {
        "immigration": ("#7c3aed", "#ede9fe"),  # Purple
        "tech": ("#059669", "#d1fae5"),  # Green
        "finance": ("#d97706", "#fef3c7"),  # Amber
    }
    return category_styles.get(category.lower(), ("#64748b", "#f1f5f9"))  # Default: Slate


def generate_html_digest(
    news_items: list[dict[str, Any]], management_token: str | None = None
) -> str:
    """Generate premium HTML email content with Gotham dark aesthetic.

    Args:
        news_items: List of news item dicts to include in the digest.
        management_token: Optional token for the preferences link.

    Returns:
        Fully styled HTML string for the email body.
    """
    # Build preferences URL
    preferences_url = f"{APP_BASE_URL}/preferences?token={management_token}" if management_token else ""

    if not news_items:
        return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px;">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding-bottom: 32px; border-bottom: 1px solid #334155;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #f8fafc; letter-spacing: -0.5px;">
                                The Alfred Brief
                            </h1>
                            <p style="margin: 8px 0 0 0; font-size: 14px; color: #94a3b8;">
                                Your Daily Intelligence Digest
                            </p>
                        </td>
                    </tr>
                    <!-- Empty State -->
                    <tr>
                        <td style="padding: 48px 0; text-align: center;">
                            <p style="margin: 0; font-size: 16px; color: #94a3b8;">
                                No new intelligence items today. Check back tomorrow.
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding-top: 32px; border-top: 1px solid #334155; text-align: center;">
                            {f'<a href="{preferences_url}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">Manage Preferences</a>' if management_token else ''}
                            <p style="margin: 24px 0 0 0; font-size: 12px; color: #64748b;">
                                The Alfred Brief - Delivered with precision.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

    # Build news cards HTML
    cards_html = ""
    for item in news_items:
        title = item.get("title", "Untitled")
        url = item.get("url", "#")
        category = item.get("category", "Unknown")
        scraped_at = item.get("scraped_at", "")

        formatted_date = format_scraped_date(scraped_at)
        bg_color, text_color = get_category_badge_style(category)

        cards_html += f"""
                    <tr>
                        <td style="padding-bottom: 16px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #1e293b; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <!-- Category Badge & Date -->
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td>
                                                    <span style="display: inline-block; padding: 4px 10px; background-color: {bg_color}; color: {text_color}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 4px;">
                                                        {category}
                                                    </span>
                                                </td>
                                                <td align="right">
                                                    <span style="font-size: 12px; color: #64748b;">
                                                        {formatted_date}
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>
                                        <!-- Title -->
                                        <h2 style="margin: 12px 0 16px 0; font-size: 18px; font-weight: 600; color: #f1f5f9; line-height: 1.4;">
                                            {title}
                                        </h2>
                                        <!-- Read More Button -->
                                        <a href="{url}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 500;">
                                            Read article →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
"""

    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px;">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding-bottom: 32px; border-bottom: 1px solid #334155;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #f8fafc; letter-spacing: -0.5px;">
                                The Alfred Brief
                            </h1>
                            <p style="margin: 8px 0 0 0; font-size: 14px; color: #94a3b8;">
                                Your Daily Intelligence Digest
                            </p>
                        </td>
                    </tr>
                    <!-- Greeting -->
                    <tr>
                        <td style="padding: 24px 0;">
                            <p style="margin: 0; font-size: 16px; color: #e2e8f0;">
                                Good morning. Your briefing is ready.
                            </p>
                        </td>
                    </tr>
                    <!-- News Cards -->
{cards_html}
                    <!-- Footer -->
                    <tr>
                        <td style="padding-top: 24px; border-top: 1px solid #334155; text-align: center;">
                            {f'<a href="{preferences_url}" style="display: inline-block; padding: 12px 24px; background-color: #1e293b; color: #e2e8f0; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; border: 1px solid #334155;">Manage Preferences</a>' if management_token else ''}
                            <p style="margin: 24px 0 0 0; font-size: 12px; color: #64748b;">
                                The Alfred Brief - Delivered with precision.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
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

    # Fetch all active subscribers (including management_token for preferences link)
    subscribers_response = (
        client.table("subscribers")
        .select("id, email, preferences_json, management_token")
        .eq("is_active", True)
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
        management_token = subscriber.get("management_token")

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
            html_content = generate_html_digest(personalized_news, management_token)
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
