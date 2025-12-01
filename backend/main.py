"""The Alfred Brief - Backend Entry Point."""

from src.db import test_connection


def main() -> None:
    print("Alfred is listening...")

    try:
        test_connection()
        print("Database connection successful.")
    except Exception as e:
        print(f"Database connection failed: {e}")


if __name__ == "__main__":
    main()
