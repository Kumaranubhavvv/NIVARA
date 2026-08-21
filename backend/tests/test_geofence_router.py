"""
tests/test_geofence_router.py

Integration tests for the NIVARA Geofence Router API endpoints:
  - POST /api/v1/safety/geofence/evaluate
  - POST /api/v1/safety/geofence/check
  - POST /api/v1/safety/geofence/batch-evaluate
  - GET  /api/v1/safety/geofence/overview/{child_id}
  - GET  /api/v1/safety/geofence/distance/{zone_id}
  - GET  /api/v1/safety/geofence/caregiver-status
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app, startup_event
from app.config.database import Base, engine, SessionLocal
from app.models.child import Child
from app.models.safe_zone import SafeZone
from app.models.safety_event import SafetyEvent


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    startup_event()
    yield


client = TestClient(app)
CHILD_ID = "child-leo-1"

# Coords:
# Home safe zone is seeded at (37.7749, -122.4194) with radius 200m
INSIDE_HOME = (37.7750, -122.4195)
OUTSIDE_ZONES = (37.8100, -122.4100)  # ~4km away


def get_sarah_auth():
    res = client.post("/api/v1/auth/login", json={"email": "sarah@nivara.app", "password": "password123"})
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_evaluate_location_inside_zone():
    headers = get_sarah_auth()
    payload = {
        "child_id": CHILD_ID,
        "latitude": INSIDE_HOME[0],
        "longitude": INSIDE_HOME[1],
        "create_events": True,
    }
    res = client.post("/api/v1/safety/geofence/evaluate", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["child_id"] == CHILD_ID
    assert data["is_inside_safe_zone"] is True
    assert data["status"] == "safe"
    assert data["active_zone_name"] == "Home (Safe Haven)"


def test_evaluate_location_outside_zone_breach():
    headers = get_sarah_auth()
    payload = {
        "child_id": CHILD_ID,
        "latitude": OUTSIDE_ZONES[0],
        "longitude": OUTSIDE_ZONES[1],
        "create_events": True,
    }
    res = client.post("/api/v1/safety/geofence/evaluate", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["is_inside_safe_zone"] is False
    assert data["status"] == "out_of_bounds"
    assert data["exit_alert_triggered"] is True

    # Check that a geofence_exit safety event was logged
    events_res = client.get("/api/v1/safety/safety-events/?event_type=geofence_exit", headers=headers)
    assert events_res.status_code == 200
    events = events_res.json()
    assert len(events) >= 1


def test_check_point_containment_dry_run():
    headers = get_sarah_auth()
    payload = {
        "child_id": CHILD_ID,
        "latitude": OUTSIDE_ZONES[0],
        "longitude": OUTSIDE_ZONES[1],
    }
    # /check should never log safety events or mutate status
    res = client.post("/api/v1/safety/geofence/check", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["is_inside_safe_zone"] is False

    # Child should still be safe in DB since this was a dry run
    db = SessionLocal()
    try:
        child = db.query(Child).filter(Child.id == CHILD_ID).first()
        assert child.current_status == "safe"
    finally:
        db.close()


def test_batch_evaluate():
    headers = get_sarah_auth()
    payload = {
        "child_ids": [CHILD_ID],
        "latitude": INSIDE_HOME[0],
        "longitude": INSIDE_HOME[1],
        "create_events": False,
    }
    res = client.post("/api/v1/safety/geofence/batch-evaluate", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_evaluated"] == 1
    assert data["children_inside"] == 1
    assert data["children_outside"] == 0
    assert len(data["results"]) == 1
    assert data["results"][0]["is_inside_safe_zone"] is True


def test_get_child_geofence_overview():
    headers = get_sarah_auth()
    res = client.get(
        f"/api/v1/safety/geofence/overview/{CHILD_ID}?current_lat={INSIDE_HOME[0]}&current_lon={INSIDE_HOME[1]}",
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["child_id"] == CHILD_ID
    assert data["total_active_zones"] >= 1
    assert "Home (Safe Haven)" in data["zones_inside"]


def test_get_boundary_distance():
    headers = get_sarah_auth()
    res = client.get(
        f"/api/v1/safety/geofence/distance/sz-home-1?latitude={INSIDE_HOME[0]}&longitude={INSIDE_HOME[1]}",
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["zone_id"] == "sz-home-1"
    assert data["is_inside"] is True
    assert data["distance_to_boundary_meters"] < 0  # negative inside boundary


def test_get_caregiver_geofence_status():
    headers = get_sarah_auth()
    res = client.get("/api/v1/safety/geofence/caregiver-status", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_children"] >= 1
    assert data["children_safe"] >= 1
    assert len(data["children"]) >= 1
