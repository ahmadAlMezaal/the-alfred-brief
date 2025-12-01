"""The Alfred Brief - Backend Entry Point."""

from src.db import test_connection
from src.scrapers.immigration import scrape_and_save as scrape_immigration


def main() -> None:
    print("Alfred is listening...")

    try:
        test_connection()
        print("Database connection successful.")
    except Exception as e:
        print(f"Database connection failed: {e}")
        return

    # Run scrapers
    print("\n--- Running Scrapers ---")
    try:
        scrape_immigration()
    except Exception as e:
        print(f"Immigration scraper failed: {e}")


if __name__ == "__main__":
    main()
