import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app, startup_event
from app.config.database import Base, engine

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    startup_event()

client = TestClient(app)

def get_sarah_auth():
    res = client.post("/api/v1/auth/login", json={"email": "sarah@nivara.app", "password": "password123"})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_register_and_list_devices():
    headers = get_sarah_auth()

    new_device = {
        "child_id": "child-leo-1",
        "device_name": "NIVARA GPS Tracker Pendant",
        "device_type": "pendant",
        "serial_number": "PENDANT-998877",
        "battery_level": 95,
        "firmware_version": "v2.0.1",
    }
    reg_res = client.post("/api/v1/safety/devices/", json=new_device, headers=headers)
    assert reg_res.status_code == 201
    dev_data = reg_res.json()
    assert dev_data["serial_number"] == "PENDANT-998877"
    assert dev_data["device_name"] == "NIVARA GPS Tracker Pendant"

    list_res = client.get("/api/v1/safety/devices/", headers=headers)
    assert list_res.status_code == 200
    devices = list_res.json()
    assert any(d["serial_number"] == "PENDANT-998877" for d in devices)

def test_device_heartbeat_and_low_battery_trigger():
    # Heartbeat endpoint with low battery (10%)
    hb_payload = {
        "serial_number": "NIVARA-BAND-LEO-001",
        "battery_level": 10,
        "latitude": 37.7749,
        "longitude": -122.4194,
    }
    hb_res = client.post("/api/v1/safety/devices/heartbeat", json=hb_payload)
    assert hb_res.status_code == 200
    res_data = hb_res.json()
    assert res_data["battery_level"] == 10
    assert "low_battery" in res_data["events_triggered"]

    # Verify battery updated on device
    headers = get_sarah_auth()
    dev_res = client.get("/api/v1/safety/devices/dev-band-leo-1", headers=headers)
    assert dev_res.status_code == 200
    assert dev_res.json()["battery_level"] == 10

def test_device_summary_and_pairing_lifecycle():
    headers = get_sarah_auth()

    # 1. Register unassigned device
    reg_res = client.post(
        "/api/v1/safety/devices/",
        json={
            "device_name": "Secondary Smartband",
            "device_type": "smartwatch",
            "serial_number": "WATCH-554433",
            "battery_level": 88,
        },
        headers=headers
    )
    assert reg_res.status_code == 201
    device_id = reg_res.json()["id"]

    # 2. Pair device to Leo
    pair_res = client.post(
        "/api/v1/safety/devices/pair",
        json={
            "device_id": device_id,
            "child_id": "child-leo-1",
            "force": False
        },
        headers=headers
    )
    assert pair_res.status_code == 200
    assert pair_res.json()["child_id"] == "child-leo-1"

    # 3. Get summary
    sum_res = client.get(f"/api/v1/safety/devices/{device_id}/summary", headers=headers)
    assert sum_res.status_code == 200
    assert sum_res.json()["battery_level"] == 88

    # 4. Unpair device
    unpair_res = client.post(f"/api/v1/safety/devices/unpair/{device_id}", headers=headers)
    assert unpair_res.status_code == 200
    assert unpair_res.json()["child_id"] is None

    # 5. Delete device
    del_res = client.delete(f"/api/v1/safety/devices/{device_id}?soft_delete=true", headers=headers)
    assert del_res.status_code == 200
