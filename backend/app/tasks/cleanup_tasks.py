import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.location import Location

logger = logging.getLogger("safety.tasks.cleanup")

DEFAULT_LOCATION_RETENTION_DAYS = 30


def purge_old_location_history(
    db: Session, retention_days: int = DEFAULT_LOCATION_RETENTION_DAYS
) -> Dict[str, Any]:
    """
    Background worker: deletes GPS location records older than the retention policy window (default 30 days)
    for compliance and storage optimization.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=retention_days)
    deleted_count = (
        db.query(Location)
        .filter(Location.created_at < cutoff)
        .delete(synchronize_session=False)
    )
    db.commit()

    logger.info(f"[TASK: CLEANUP] Purged {deleted_count} location records older than {retention_days} days.")
    return {
        "retention_days": retention_days,
        "records_purged": deleted_count,
        "cutoff_timestamp": cutoff.isoformat(),
    }
