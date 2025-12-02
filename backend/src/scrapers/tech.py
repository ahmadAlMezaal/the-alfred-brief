"""Tech news scraper for BBC Technology RSS feed."""

from dataclasses import dataclass

import requests
from bs4 import BeautifulSoup

from src.db import get_client

# BBC provides a reliable RSS feed for technology news
BBC_TECH_RSS_URL = "https://feeds.bbci.co.uk/news/technology/rss.xml"
CATEGORY = "tech"


@dataclass
class NewsItem:
    """Represents a scraped news item."""

    title: str
    url: str
    summary: str | None = None


def fetch_rss(url: str) -> str:
    """Fetch RSS feed content from a URL."""
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.text


def parse_rss_feed(xml_content: str) -> list[NewsItem]:
    """Parse BBC Technology RSS feed for top headlines."""
    soup = BeautifulSoup(xml_content, "xml")
    items: list[NewsItem] = []

    # Find all <item> elements in the RSS feed
    rss_items = soup.find_all("item")

    for rss_item in rss_items[:3]:  # Limit to top 3 headlines
        title_elem = rss_item.find("title")
        link_elem = rss_item.find("link")
        desc_elem = rss_item.find("description")

        if not title_elem or not link_elem:
            continue

        title = title_elem.get_text(strip=True)
        # Clean URL (remove RSS tracking params)
        url = link_elem.get_text(strip=True).split("?")[0]
        summary = desc_elem.get_text(strip=True) if desc_elem else None

        items.append(
            NewsItem(
                title=title,
                url=url,
                summary=summary,
            )
        )

    return items


def scrape_and_save() -> int:
    """
    Scrape tech news from BBC RSS feed and save to database.

    Uses upsert based on URL to ensure idempotency (no duplicates).

    Returns:
        Number of items processed.
    """
    print(f"Scraping: {BBC_TECH_RSS_URL}")

    xml_content = fetch_rss(BBC_TECH_RSS_URL)
    items = parse_rss_feed(xml_content)

    if not items:
        print("No tech items found to scrape.")
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

    print(f"Processed {len(items)} tech items.")
    return len(items)
