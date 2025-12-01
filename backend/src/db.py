"""Database module for The Alfred Brief backend."""

from supabase import create_client, Client

from src.config import SUPABASE_URL, SUPABASE_KEY, validate_config


def get_client() -> Client:
    """Create and return a Supabase client instance."""
    validate_config()
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def test_connection() -> bool:
    """Test the database connection by querying the subscribers table."""
    client = get_client()
    # Simple query to verify connection works
    client.table("subscribers").select("id").limit(1).execute()
    return True
