"""The Alfred Brief - Backend Entry Point."""

import sys

from src.db import test_connection
from src.scrapers.immigration import scrape_and_save as scrape_immigration
from src.mailer import send_digest


def run_scrapers() -> None:
    """Run all data scrapers."""
    print("\n--- Running Scrapers ---")
    try:
        scrape_immigration()
    except Exception as e:
        print(f"Immigration scraper failed: {e}")


def run_mailer(to_email: str) -> None:
    """Send the daily digest email."""
    print("\n--- Sending Daily Digest ---")
    try:
        send_digest(to_email)
    except Exception as e:
        print(f"Mailer failed: {e}")


def main(mode: str = "all") -> None:
    """Main entry point.

    Args:
        mode: 'scrape' for scrapers only, 'mail' for mailer only, 'all' for both.
    """
    print("Alfred is listening...")

    try:
        test_connection()
        print("Database connection successful.")
    except Exception as e:
        print(f"Database connection failed: {e}")
        return

    if mode in ("scrape", "all"):
        run_scrapers()

    if mode in ("mail", "all"):
        run_mailer("ahmad.hmazaal@gmail.com")


if __name__ == "__main__":
    # Parse mode from command line: python main.py [scrape|mail|all]
    run_mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    main(run_mode)
