"""Immigration news scraper for Gov.uk."""

from dataclasses import dataclass

import requests
from bs4 import BeautifulSoup

from src.db import get_client

GOV_UK_IMMIGRATION_URL = "https://www.gov.uk/guidance/immigration-rules"
CATEGORY = "immigration"


@dataclass
class NewsItem:
    """Represents a scraped news item."""

    title: str
    url: str
    summary: str | None = None


def fetch_page(url: str) -> str:
    """Fetch HTML content from a URL."""
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.text


def parse_immigration_updates(html: str) -> list[NewsItem]:
    """Parse the Gov.uk immigration rules page for updates."""
    soup = BeautifulSoup(html, "html.parser")
    items: list[NewsItem] = []

    # Look for the "Updates to this page" section or change history
    change_notes = soup.find("div", class_="gem-c-metadata")
    if change_notes:
        # Try to find last updated info
        last_updated = change_notes.find("dd", class_="gem-c-metadata__definition")
        if last_updated:
            items.append(
                NewsItem(
                    title="Immigration Rules - Latest Update",
                    url=GOV_UK_IMMIGRATION_URL,
                    summary=f"Last updated: {last_updated.get_text(strip=True)}",
                )
            )

    # Look for full change history link
    history_link = soup.find("a", href=lambda x: x and "full-publication-update-history" in str(x))
    if history_link:
        history_url = history_link.get("href", "")
        if history_url.startswith("/"):
            history_url = f"https://www.gov.uk{history_url}"
        items.append(
            NewsItem(
                title="Immigration Rules - Full Update History",
                url=history_url,
                summary="View the complete history of changes to immigration rules.",
            )
        )

    # Parse main content sections (parts of the guidance)
    nav_links = soup.find_all("a", class_="gem-c-contents-list__link")
    for link in nav_links[:5]:  # Limit to first 5 sections
        href = link.get("href", "")
        title = link.get_text(strip=True)
        if href and title:
            full_url = href if href.startswith("http") else f"https://www.gov.uk{href}"
            items.append(
                NewsItem(
                    title=f"Immigration Rules: {title}",
                    url=full_url,
                    summary=None,
                )
            )

    return items


def scrape_and_save() -> int:
    """
    Scrape immigration news and save to database.

    Uses upsert based on URL to ensure idempotency (no duplicates).

    Returns:
        Number of items processed.
    """
    print(f"Scraping: {GOV_UK_IMMIGRATION_URL}")

    html = fetch_page(GOV_UK_IMMIGRATION_URL)
    items = parse_immigration_updates(html)

    if not items:
        print("No items found to scrape.")
        return 0

    client = get_client()

    for item in items:
        data = {
            "category": CATEGORY,
            "title": item.title,
            "url": item.url,
            "summary": item.summary,
        }
        # Upsert based on URL (unique constraint) - only insert if new
        client.table("news_items").upsert(
            data,
            on_conflict="url",
        ).execute()
        print(f"  Upserted: {item.title}")

    print(f"Processed {len(items)} immigration items.")
    return len(items)
