"""
tests/test_separation.py

Integration tests for the NIVARA Separation & Proximity Monitoring system.

Coverage:
  - Pure distance/zone calculations (unit-level, no DB)
  - evaluate_separation(): state machine transitions, event creation, notification dispatch
  - check_child_separation_with_latest_location(): shortcut helper
  - Edge cases: unknown child, no location history, threshold boundaries
  - Proximity zone classification: immediate / near / caution / critical
  - Return-to-proximity restoration (separation_alert → safe transition)
  - Repeated pings inside threshold (no duplicate events)
  - Custom threshold override
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app, startup_event
from app.config.database import Base, engine, SessionLocal
from app.services.separation_service import SeparationService, separation_service
from app.models.child import Child
from app.models.safety_event import SafetyEvent
from app.models.location import Location
from datetime import datetime, timezone


# ─────────────────────────────────────────────────────────────
# Fixtures
# ─────────────────────────────────────────────────────────────

@pytest.fixture(autouse=True)
def setup_db():
    """Drop, recreate, and seed the database before every test."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    startup_event()
    yield
    # No teardown needed — next test resets anyway


client = TestClient(app)

# Seeded child & home zone from startup_event():
#   Child   : child-leo-1 (caregiver: user-verified-sarah)
#   Home    : 37.7749, -122.4194 — radius 200m
#   Band    : dev-band-leo-1
#   Loc     : 37.7750, -122.4195 (inside home zone)

CHILD_ID = "child-leo-1"

# ── Coordinate helpers ──────────────────────────────────────
# ~  5m from child's initial seeded location — well within any threshold
CAREGIVER_SIDE_BY_SIDE = (37.7750, -122.4196)

# ~ 35m away — within default 50m threshold
CAREGIVER_NEAR = (37.7753, -122.4196)

# ~ 60m away — just beyond the default 50m threshold (caution zone)
CAREGIVER_SEPARATED_MILD = (37.7755, -122.4196)

# ~ 120m away — 2x threshold (critical zone)
CAREGIVER_SEPARATED_CRITICAL = (37.7760, -122.4196)

# ~ 400m away — clearly out of range
CAREGIVER_FAR = (37.7785, -122.4194)

# Default threshold used by SeparationService (matches settings default)
DEFAULT_THRESHOLD = 50.0


def get_sarah_auth() -> dict:
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "sarah@nivara.app", "password": "password123"},
    )
    assert res.status_code == 200, f"Login failed: {res.text}"
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


def get_db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _count_separation_events(db, child_id: str) -> int:
    return (
        db.query(SafetyEvent)
        .filter(
            SafetyEvent.child_id == child_id,
            SafetyEvent.event_type == SafetyEvent.EVENT_SEPARATION_ALERT,
        )
        .count()
    )


def _count_proximity_restored_events(db, child_id: str) -> int:
    return (
        db.query(SafetyEvent)
        .filter(
            SafetyEvent.child_id == child_id,
            SafetyEvent.event_type == "proximity_restored",
        )
        .count()
    )


def _get_child_status(db, child_id: str) -> str:
    child = db.query(Child).filter(Child.id == child_id).first()
    return child.current_status if child else "unknown"


# ─────────────────────────────────────────────────────────────
# 1. Pure Calculation Tests (no DB)
# ─────────────────────────────────────────────────────────────

class TestCalculateSeparation:
    """Unit tests for the stateless calculate_separation helper."""

    def test_side_by_side_is_not_separated(self):
        result = SeparationService.calculate_separation(
            child_lat=37.7750, child_lon=-122.4195,
            caregiver_lat=CAREGIVER_SIDE_BY_SIDE[0],
            caregiver_lon=CAREGIVER_SIDE_BY_SIDE[1],
        )
        assert result["is_separated"] is False
        assert result["distance_meters"] < DEFAULT_THRESHOLD
        assert result["proximity_zone"] in ("immediate", "near")

    def test_mild_separation_flagged(self):
        result = SeparationService.calculate_separation(
            child_lat=37.7750, child_lon=-122.4195,
            caregiver_lat=CAREGIVER_SEPARATED_MILD[0],
            caregiver_lon=CAREGIVER_SEPARATED_MILD[1],
        )
        assert result["is_separated"] is True
        assert result["distance_meters"] > DEFAULT_THRESHOLD
        assert result["severity"] == SafetyEvent.SEVERITY_WARNING

    def test_critical_separation_elevated_severity(self):
        result = SeparationService.calculate_separation(
            child_lat=37.7750, child_lon=-122.4195,
            caregiver_lat=CAREGIVER_SEPARATED_CRITICAL[0],
            caregiver_lon=CAREGIVER_SEPARATED_CRITICAL[1],
        )
        assert result["is_separated"] is True
        assert result["severity"] == SafetyEvent.SEVERITY_CRITICAL
        assert result["proximity_zone"] == "critical"

    def test_custom_threshold_overrides_default(self):
        """With a tighter 20m threshold, the near caregiver is separated."""
        result = SeparationService.calculate_separation(
            child_lat=37.7750, child_lon=-122.4195,
            caregiver_lat=CAREGIVER_NEAR[0],
            caregiver_lon=CAREGIVER_NEAR[1],
            max_allowed_distance_meters=20.0,
        )
        assert result["threshold_meters"] == 20.0
        assert result["is_separated"] is True

    def test_custom_threshold_relaxed(self):
        """With a relaxed 200m threshold, even the far caregiver is within range."""
        result = SeparationService.calculate_separation(
            child_lat=37.7750, child_lon=-122.4195,
            caregiver_lat=CAREGIVER_FAR[0],
            caregiver_lon=CAREGIVER_FAR[1],
            max_allowed_distance_meters=500.0,
        )
        assert result["is_separated"] is False
        assert result["threshold_meters"] == 500.0

    def test_response_contains_coordinates(self):
        result = SeparationService.calculate_separation(
            child_lat=37.7750, child_lon=-122.4195,
            caregiver_lat=CAREGIVER_NEAR[0],
            caregiver_lon=CAREGIVER_NEAR[1],
        )
        assert result["child_coordinates"]["latitude"] == 37.7750
        assert result["caregiver_coordinates"]["latitude"] == CAREGIVER_NEAR[0]


# ─────────────────────────────────────────────────────────────
# 2. Proximity Zone Classification
# ─────────────────────────────────────────────────────────────

class TestProximityZone:
    """Unit tests for the 4-tier proximity zone classifier."""

    def test_immediate_zone(self):
        zone = SeparationService.get_proximity_zone(5.0, DEFAULT_THRESHOLD)
        assert zone == "immediate"

    def test_near_zone(self):
        zone = SeparationService.get_proximity_zone(30.0, DEFAULT_THRESHOLD)
        assert zone == "near"

    def test_caution_zone(self):
        # Between 1x and 2x threshold
        zone = SeparationService.get_proximity_zone(75.0, DEFAULT_THRESHOLD)
        assert zone == "caution"

    def test_critical_zone(self):
        # Beyond 2x threshold
        zone = SeparationService.get_proximity_zone(120.0, DEFAULT_THRESHOLD)
        assert zone == "critical"

    def test_exact_threshold_is_near(self):
        """Exactly at threshold should be "near", not separated."""
        zone = SeparationService.get_proximity_zone(DEFAULT_THRESHOLD, DEFAULT_THRESHOLD)
        assert zone == "near"

    def test_zero_distance_is_immediate(self):
        zone = SeparationService.get_proximity_zone(0.0, DEFAULT_THRESHOLD)
        assert zone == "immediate"


# ─────────────────────────────────────────────────────────────
# 3. evaluate_separation — State Machine & Events
# ─────────────────────────────────────────────────────────────

class TestEvaluateSeparation:
    """Integration tests for evaluate_separation against the real DB."""

    def test_caregiver_within_range_no_event(self):
        """Child and caregiver are close — no SafetyEvent, status stays 'safe'."""
        db = SessionLocal()
        try:
            result = separation_service.evaluate_separation(
                db=db,
                child_id=CHILD_ID,
                child_lat=37.7750, child_lon=-122.4195,
                caregiver_lat=CAREGIVER_SIDE_BY_SIDE[0],
                caregiver_lon=CAREGIVER_SIDE_BY_SIDE[1],
                create_event=True,
            )
            assert result["is_separated"] is False
            assert result["status"] == Child.STATUS_SAFE
            assert result["triggered_event_id"] is None
            assert _count_separation_events(db, CHILD_ID) == 0
        finally:
            db.close()

    def test_separation_triggers_state_transition_and_event(self):
        """Caregiver beyond threshold → child status becomes separation_alert,
        a SafetyEvent is created, and an event ID is returned."""
        db = SessionLocal()
        try:
            result = separation_service.evaluate_separation(
                db=db,
                child_id=CHILD_ID,
                child_lat=37.7750, child_lon=-122.4195,
                caregiver_lat=CAREGIVER_FAR[0],
                caregiver_lon=CAREGIVER_FAR[1],
                create_event=True,
            )
            assert result["is_separated"] is True
            assert result["status"] == Child.STATUS_SEPARATION
            assert result["triggered_event_id"] is not None

            # Verify event persisted in DB
            assert _count_separation_events(db, CHILD_ID) == 1

            # Verify child status in DB
            assert _get_child_status(db, CHILD_ID) == Child.STATUS_SEPARATION
        finally:
            db.close()

    def test_create_event_false_suppresses_event(self):
        """With create_event=False, no SafetyEvent is written even on breach."""
        db = SessionLocal()
        try:
            result = separation_service.evaluate_separation(
                db=db,
                child_id=CHILD_ID,
                child_lat=37.7750, child_lon=-122.4195,
                caregiver_lat=CAREGIVER_FAR[0],
                caregiver_lon=CAREGIVER_FAR[1],
                create_event=False,
            )
            assert result["is_separated"] is True
            assert result["triggered_event_id"] is None
            assert _count_separation_events(db, CHILD_ID) == 0
        finally:
            db.close()

    def test_return_to_proximity_resets_status(self):
        """After a breach, caregiver returning within range resets child to 'safe'
        and logs a proximity_restored event."""
        db = SessionLocal()
        try:
            # Step 1: trigger separation
            separation_service.evaluate_separation(
                db=db,
                child_id=CHILD_ID,
                child_lat=37.7750, child_lon=-122.4195,
                caregiver_lat=CAREGIVER_FAR[0],
                caregiver_lon=CAREGIVER_FAR[1],
                create_event=True,
            )
            assert _get_child_status(db, CHILD_ID) == Child.STATUS_SEPARATION

            # Step 2: caregiver moves back in range
            result = separation_service.evaluate_separation(
                db=db,
                child_id=CHILD_ID,
                child_lat=37.7750, child_lon=-122.4195,
                caregiver_lat=CAREGIVER_SIDE_BY_SIDE[0],
                caregiver_lon=CAREGIVER_SIDE_BY_SIDE[1],
                create_event=True,
            )
            assert result["is_separated"] is False
            assert result["status"] == Child.STATUS_SAFE
            assert _get_child_status(db, CHILD_ID) == Child.STATUS_SAFE

            # Proximity-restored event logged
            assert _count_proximity_restored_events(db, CHILD_ID) == 1
        finally:
            db.close()

    def test_emergency_status_not_overridden_by_separation(self):
        """If a child is already in STATUS_EMERGENCY, a separation event should NOT
        downgrade the status to separation_alert."""
        db = SessionLocal()
        try:
            # Force child into emergency state
            child = db.query(Child).filter(Child.id == CHILD_ID).first()
            child.current_status = Child.STATUS_EMERGENCY
            db.commit()

            # Evaluate separation (outside threshold)
            separation_service.evaluate_separation(
                db=db,
                child_id=CHILD_ID,
                child_lat=37.7750, child_lon=-122.4195,
                caregiver_lat=CAREGIVER_FAR[0],
                caregiver_lon=CAREGIVER_FAR[1],
                create_event=True,
            )

            # Status must remain 'emergency', not be downgraded
            assert _get_child_status(db, CHILD_ID) == Child.STATUS_EMERGENCY
        finally:
            db.close()

    def test_repeated_pings_within_range_no_duplicate_events(self):
        """Multiple pings when caregiver is within range should not create events."""
        db = SessionLocal()
        try:
            for _ in range(3):
                separation_service.evaluate_separation(
                    db=db,
                    child_id=CHILD_ID,
                    child_lat=37.7750, child_lon=-122.4195,
                    caregiver_lat=CAREGIVER_NEAR[0],
                    caregiver_lon=CAREGIVER_NEAR[1],
                    create_event=True,
                )
            assert _count_separation_events(db, CHILD_ID) == 0
        finally:
            db.close()

    def test_unknown_child_returns_error(self):
        """evaluate_separation with a non-existent child ID returns an error dict,
        never raises an exception."""
        db = SessionLocal()
        try:
            result = separation_service.evaluate_separation(
                db=db,
                child_id="child-ghost-999",
                child_lat=37.7750, child_lon=-122.4195,
                caregiver_lat=CAREGIVER_FAR[0],
                caregiver_lon=CAREGIVER_FAR[1],
            )
            assert "error" in result
            assert result["is_separated"] is False
        finally:
            db.close()

    def test_event_metadata_contains_expected_keys(self):
        """The SafetyEvent metadata_json must include distance, threshold, and proximity_zone."""
        import json
        db = SessionLocal()
        try:
            separation_service.evaluate_separation(
                db=db,
                child_id=CHILD_ID,
                child_lat=37.7750, child_lon=-122.4195,
                caregiver_lat=CAREGIVER_FAR[0],
                caregiver_lon=CAREGIVER_FAR[1],
                create_event=True,
            )
            event = (
                db.query(SafetyEvent)
                .filter(
                    SafetyEvent.child_id == CHILD_ID,
                    SafetyEvent.event_type == SafetyEvent.EVENT_SEPARATION_ALERT,
                )
                .first()
            )
            assert event is not None
            meta = json.loads(event.metadata_json)
            assert "distance_to_caregiver_m" in meta
            assert "threshold_m" in meta
            assert "proximity_zone" in meta
            assert meta["distance_to_caregiver_m"] > DEFAULT_THRESHOLD
        finally:
            db.close()

    def test_caregiver_id_stored_in_event_metadata(self):
        """When caregiver_id is passed, it is persisted in the event metadata."""
        import json
        db = SessionLocal()
        try:
            separation_service.evaluate_separation(
                db=db,
                child_id=CHILD_ID,
                child_lat=37.7750, child_lon=-122.4195,
                caregiver_lat=CAREGIVER_FAR[0],
                caregiver_lon=CAREGIVER_FAR[1],
                caregiver_id="user-verified-sarah",
                create_event=True,
            )
            event = (
                db.query(SafetyEvent)
                .filter(
                    SafetyEvent.child_id == CHILD_ID,
                    SafetyEvent.event_type == SafetyEvent.EVENT_SEPARATION_ALERT,
                )
                .first()
            )
            meta = json.loads(event.metadata_json)
            assert meta.get("caregiver_id") == "user-verified-sarah"
        finally:
            db.close()


# ─────────────────────────────────────────────────────────────
# 4. check_child_separation_with_latest_location
# ─────────────────────────────────────────────────────────────

class TestCheckWithLatestLocation:
    """Tests for the shortcut helper that pulls the stored latest location."""

    def test_uses_seeded_location_correctly(self):
        """The seeded location (37.7750, -122.4195) should be used automatically."""
        db = SessionLocal()
        try:
            result = separation_service.check_child_separation_with_latest_location(
                db=db,
                child_id=CHILD_ID,
                caregiver_lat=CAREGIVER_FAR[0],
                caregiver_lon=CAREGIVER_FAR[1],
                create_event=False,
            )
            assert "is_separated" in result
            assert result["is_separated"] is True
            assert result["distance_meters"] > DEFAULT_THRESHOLD
        finally:
            db.close()

    def test_no_location_history_returns_error(self):
        """When no location pings exist for a child, the helper returns an error
        dict rather than raising an exception."""
        db = SessionLocal()
        try:
            # Remove all location records for Leo
            db.query(Location).filter(Location.child_id == CHILD_ID).delete()
            db.commit()

            result = separation_service.check_child_separation_with_latest_location(
                db=db,
                child_id=CHILD_ID,
                caregiver_lat=CAREGIVER_FAR[0],
                caregiver_lon=CAREGIVER_FAR[1],
            )
            assert "error" in result
            assert result["is_separated"] is False
            assert result["distance_meters"] is None
        finally:
            db.close()

    def test_most_recent_location_used(self):
        """When multiple location pings exist, only the latest is evaluated."""
        db = SessionLocal()
        try:
            # Add a newer ping very close to the caregiver
            new_loc = Location(
                child_id=CHILD_ID,
                latitude=CAREGIVER_SIDE_BY_SIDE[0],
                longitude=CAREGIVER_SIDE_BY_SIDE[1],
                accuracy=3.0,
                speed=0.0,
                heading=0.0,
                created_at=datetime.now(timezone.utc),
            )
            db.add(new_loc)
            db.commit()

            result = separation_service.check_child_separation_with_latest_location(
                db=db,
                child_id=CHILD_ID,
                caregiver_lat=CAREGIVER_SIDE_BY_SIDE[0],
                caregiver_lon=CAREGIVER_SIDE_BY_SIDE[1],
                create_event=False,
            )
            # With the latest location now at caregiver coords, should not be separated
            assert result["is_separated"] is False
        finally:
            db.close()

    def test_custom_threshold_passed_through(self):
        """custom_threshold_meters is forwarded to evaluate_separation."""
        db = SessionLocal()
        try:
            # Seeded location is ~3m from caregiver — inside 50m but outside 1m
            result = separation_service.check_child_separation_with_latest_location(
                db=db,
                child_id=CHILD_ID,
                caregiver_lat=CAREGIVER_FAR[0],
                caregiver_lon=CAREGIVER_FAR[1],
                custom_threshold_meters=500.0,  # relaxed: nobody is separated
                create_event=False,
            )
            assert result["threshold_meters"] == 500.0
            assert result["is_separated"] is False
        finally:
            db.close()


# ─────────────────────────────────────────────────────────────
# 5. Notification Dispatch Verification
# ─────────────────────────────────────────────────────────────

class TestSeparationNotifications:
    """Verify the notification dispatch payload on separation breach."""

    def test_notification_service_called_on_breach(self, monkeypatch):
        """Monkeypatches NotificationService to verify it is called on separation."""
        dispatch_calls = []

        def mock_send(db, child, alert_title, alert_message, severity, coordinates):
            dispatch_calls.append({
                "title": alert_title,
                "message": alert_message,
                "severity": severity,
                "coordinates": coordinates,
            })
            return {"contacts_reached": 1, "channels_used": ["sms"]}

        monkeypatch.setattr(
            "app.services.separation_service.notification_service.send_emergency_alert",
            mock_send,
        )

        db = SessionLocal()
        try:
            separation_service.evaluate_separation(
                db=db,
                child_id=CHILD_ID,
                child_lat=37.7750, child_lon=-122.4195,
                caregiver_lat=CAREGIVER_FAR[0],
                caregiver_lon=CAREGIVER_FAR[1],
                create_event=True,
            )
            assert len(dispatch_calls) == 1
            call = dispatch_calls[0]
            assert "SEPARATION" in call["title"].upper() or "PROXIMITY" in call["title"].upper()
            assert call["coordinates"]["latitude"] == 37.7750
            assert call["coordinates"]["longitude"] == -122.4195
        finally:
            db.close()

    def test_no_notification_when_within_range(self, monkeypatch):
        """Notification service must NOT be called when child is within range."""
        dispatch_calls = []

        def mock_send(*args, **kwargs):
            dispatch_calls.append(True)
            return {}

        monkeypatch.setattr(
            "app.services.separation_service.notification_service.send_emergency_alert",
            mock_send,
        )

        db = SessionLocal()
        try:
            separation_service.evaluate_separation(
                db=db,
                child_id=CHILD_ID,
                child_lat=37.7750, child_lon=-122.4195,
                caregiver_lat=CAREGIVER_SIDE_BY_SIDE[0],
                caregiver_lon=CAREGIVER_SIDE_BY_SIDE[1],
                create_event=True,
            )
            assert len(dispatch_calls) == 0
        finally:
            db.close()


# ─────────────────────────────────────────────────────────────
# 6. Severity Tier Assertions
# ─────────────────────────────────────────────────────────────

class TestSeverityEscalation:
    """Verify severity tiers scale with distance multiples."""

    def test_warning_severity_between_1x_and_2x_threshold(self):
        # ~60m: just past 50m threshold but under 100m (2x)
        result = SeparationService.calculate_separation(
            child_lat=37.7750, child_lon=-122.4195,
            caregiver_lat=CAREGIVER_SEPARATED_MILD[0],
            caregiver_lon=CAREGIVER_SEPARATED_MILD[1],
        )
        assert result["is_separated"] is True
        assert result["severity"] == SafetyEvent.SEVERITY_WARNING

    def test_critical_severity_beyond_2x_threshold(self):
        # ~400m: well beyond 2x default threshold
        result = SeparationService.calculate_separation(
            child_lat=37.7750, child_lon=-122.4195,
            caregiver_lat=CAREGIVER_FAR[0],
            caregiver_lon=CAREGIVER_FAR[1],
        )
        assert result["is_separated"] is True
        assert result["severity"] == SafetyEvent.SEVERITY_CRITICAL

    def test_info_severity_when_within_range(self):
        result = SeparationService.calculate_separation(
            child_lat=37.7750, child_lon=-122.4195,
            caregiver_lat=CAREGIVER_SIDE_BY_SIDE[0],
            caregiver_lon=CAREGIVER_SIDE_BY_SIDE[1],
        )
        assert result["is_separated"] is False
        assert result["severity"] == SafetyEvent.SEVERITY_INFO
