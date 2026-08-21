from datetime import datetime, timezone, timedelta
from typing import Optional, Union


def utc_now() -> datetime:
    """Returns the current UTC datetime with timezone awareness."""
    return datetime.now(timezone.utc)


def to_iso_format(dt: Optional[datetime]) -> Optional[str]:
    """Serializes a datetime to an ISO-8601 string."""
    if not dt:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


def from_iso_format(date_str: Optional[str]) -> Optional[datetime]:
    """Parses an ISO-8601 string into a timezone-aware datetime."""
    if not date_str:
        return None
    try:
        dt = datetime.fromisoformat(date_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except (ValueError, TypeError):
        return None


def format_time_ago(dt: Optional[datetime]) -> str:
    """Formats a datetime into a friendly human-readable time-ago string."""
    if not dt:
        return "Unknown"
    now = utc_now()
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = now - dt
    seconds = int(diff.total_seconds())

    if seconds < 0:
        return "Just now"
    if seconds < 60:
        return "Just now" if seconds < 10 else f"{seconds}s ago"
    minutes = seconds // 60
    if minutes < 60:
        return f"{minutes}m ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours}h ago"
    days = hours // 24
    if days < 7:
        return f"{days}d ago"
    weeks = days // 7
    if weeks < 4:
        return f"{weeks}w ago"
    months = days // 30
    if months < 12:
        return f"{months}mo ago"
    years = days // 365
    return f"{years}y ago"


def is_older_than(dt: Optional[datetime], minutes: int = 5) -> bool:
    """Checks if a given timestamp is older than the specified number of minutes."""
    if not dt:
        return True
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    cutoff = utc_now() - timedelta(minutes=minutes)
    return dt < cutoff


def calculate_duration_seconds(start: Optional[datetime], end: Optional[datetime] = None) -> Optional[float]:
    """Calculates duration between start and end (or current time) in seconds."""
    if not start:
        return None
    end = end or utc_now()
    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)
    if end.tzinfo is None:
        end = end.replace(tzinfo=timezone.utc)
    return round((end - start).total_seconds(), 2)
