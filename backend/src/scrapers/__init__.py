"""Scrapers module for The Alfred Brief."""

from src.scrapers.immigration import scrape_and_save as scrape_immigration
from src.scrapers.tech import scrape_and_save as scrape_tech
from src.scrapers.finance import scrape_and_save as scrape_finance

__all__ = ["scrape_immigration", "scrape_tech", "scrape_finance"]
