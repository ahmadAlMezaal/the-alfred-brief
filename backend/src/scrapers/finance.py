"""Finance scraper for GBP/USD exchange rate using free Exchange Rate API."""

from dataclasses import dataclass

import requests

from src.db import get_client

# Free exchange rate API (no key required)
EXCHANGE_RATE_API_URL = "https://open.er-api.com/v6/latest/GBP"
CATEGORY = "finance"

# Static URL for the news item (users can click to see more)
REFERENCE_URL = "https://www.xe.com/currencyconverter/convert/?Amount=1&From=GBP&To=USD"


@dataclass
class NewsItem:
    """Represents a scraped news item."""

    title: str
    url: str
    summary: str | None = None


def fetch_exchange_rate() -> float | None:
    """Fetch current GBP to USD exchange rate from API."""
    response = requests.get(EXCHANGE_RATE_API_URL, timeout=30)
    response.raise_for_status()

    data = response.json()

    if data.get("result") != "success":
        return None

    rates = data.get("rates", {})
    usd_rate = rates.get("USD")

    return usd_rate


def scrape_and_save() -> int:
    """
    Scrape GBP/USD exchange rate and save to database.

    Uses upsert based on URL to ensure idempotency.

    Returns:
        Number of items processed.
    """
    print(f"Scraping: {EXCHANGE_RATE_API_URL}")

    usd_rate = fetch_exchange_rate()

    if not usd_rate:
        print("Could not extract GBP/USD exchange rate.")
        return 0

    # Format to 4 decimal places
    price = f"{usd_rate:.4f}"

    client = get_client()

    data = {
        "category": CATEGORY,
        "title": f"GBP to USD: {price}",
        "url": REFERENCE_URL,
        "summary": f"Current GBP/USD exchange rate: 1 GBP = {price} USD",
    }
    # Upsert based on URL (unique constraint) - updates if exists
    client.table("news_items").upsert(
        data,
        on_conflict="url",
    ).execute()
    print(f"  Upserted: GBP to USD: {price}")

    print("Processed 1 finance item.")
    return 1
