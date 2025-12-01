"""Scrapers module for The Alfred Brief."""

from src.scrapers.immigration import scrape_and_save as scrape_immigration

__all__ = ["scrape_immigration"]
