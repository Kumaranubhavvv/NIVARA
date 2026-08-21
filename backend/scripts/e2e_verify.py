import urllib.request
import json
import sys

BASE = 'http://127.0.0.1:8000/api/v1'

def req(path, data=None, method='GET', token=None):
    url = f"{BASE}{path}"
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    body = json.dumps(data).encode('utf-8') if data is not None else None
    r = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        raw = e.read().decode('utf-8')
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, raw

print("\n" + "="*50)
print("  NIVARA E2E INTEGRATION & API VERIFICATION")
print("="*50 + "\n")

# 1. Authentication
print("1. Authentication (Sarah Mitchell - Caregiver)")
status, auth = req('/auth/login', {'email': 'sarah@nivara.app', 'password': 'password123'}, 'POST')
user_name = auth.get("user", {}).get("full_name") if isinstance(auth, dict) else None
print(f"   Status: {status} | User: {user_name}")
assert status == 200, f"Login failed: {auth}"
token = auth.get("access_token")

# 2. Safety Status
print("\n2. Master Safety Hub Status")
status, s_data = req('/safety/status', token=token)
print(f"   Status: {status} | Safe: {s_data.get('is_safe')} | Child: {s_data.get('child_name')}")
assert status == 200

# 3. Location & Safe Zones
print("\n3. Current GPS Location & Configured Safe Zones")
status, loc_data = req('/safety/locations/current/child-leo-1', token=token)
print(f"   Location Status: {status} | Safe: {loc_data.get('is_safe')} | Active Zone: {loc_data.get('active_zone_name')}")
assert status == 200

status, sz_data = req('/safety/safe-zones/child/child-leo-1', token=token)
print(f"   Safe Zones Status: {status} | Total Zones: {len(sz_data)}")
assert status == 200

# 4. Geofencing Evaluation
print("\n4. Geofencing Containment Engine")
geo_payload = {'child_id': 'child-leo-1', 'latitude': 37.7750, 'longitude': -122.4195, 'create_events': False}
status, geo_data = req('/safety/geofence/evaluate', geo_payload, 'POST', token=token)
print(f"   Evaluate Inside: {status} | Inside: {geo_data.get('is_inside_safe_zone')} | Zone: {geo_data.get('active_zone_name')}")
assert status == 200 and geo_data.get('is_inside_safe_zone') is True

geo_outside_payload = {'child_id': 'child-leo-1', 'latitude': 37.8100, 'longitude': -122.4100, 'create_events': False}
status, geo_out = req('/safety/geofence/check', geo_outside_payload, 'POST', token=token)
print(f"   Check Outside: {status} | Inside: {geo_out.get('is_inside_safe_zone')} | Status: {geo_out.get('status')}")
assert status == 200 and geo_out.get('is_inside_safe_zone') is False

# 5. Separation Proximity
print("\n5. Separation & Proximity Monitoring")
sep_payload = {
    'child_id': 'child-leo-1',
    'child_latitude': 37.7750,
    'child_longitude': -122.4195,
    'caregiver_latitude': 37.7750,
    'caregiver_longitude': -122.4196,
    'create_event': False
}
status, sep_data = req('/safety/separation/evaluate', sep_payload, 'POST', token=token)
print(f"   Separation Status: {status} | Distance: {sep_data.get('distance_meters')}m | Zone: {sep_data.get('proximity_zone')}")
assert status == 200 and sep_data.get('is_separated') is False

# 6. SOS Emergency Flow
print("\n6. SOS Panic Trigger & Caregiver Resolution")
sos_payload = {
    'child_id': 'child-leo-1',
    'triggered_by': 'sos_button',
    'severity': 'critical',
    'latitude': 37.7749,
    'longitude': -122.4194,
    'message': 'E2E Automated SOS Verification'
}
status, sos_data = req('/safety/emergencies/sos', sos_payload, 'POST', token=token)
emg_id = sos_data.get('id')
print(f"   SOS Trigger: {status} | Emergency ID: {emg_id} | Status: {sos_data.get('status')}")
assert status == 201

# Resolve emergency
res_payload = {'status': 'resolved', 'resolution_notes': 'E2E Automated Resolution Verified'}
status, res_data = req(f'/safety/emergencies/{emg_id}/resolve', res_payload, 'POST', token=token)
print(f"   SOS Resolve: {status} | Status: {res_data.get('status')}")
assert status == 200 and res_data.get('status') == 'resolved'

# 7. Devices & Wearables
print("\n7. Hardware Wearables & Contacts")
status, dev_data = req('/safety/devices/', token=token)
print(f"   Devices: {status} | Total Paired: {len(dev_data)}")
assert status == 200

status, con_data = req('/safety/emergency-contacts/', token=token)
print(f"   Contacts: {status} | Total Registered: {len(con_data)}")
assert status == 200

# 8. Community Feed
print("\n8. Community Feed & Resources")
status, com_data = req('/community/posts', token=token)
posts_count = len(com_data) if isinstance(com_data, list) else com_data.get("total", "OK")
print(f"   Community Posts: {status} | Posts Available: {posts_count}")
assert status == 200

print("\n" + "="*50)
print("  ALL E2E SAFETY MODULES VERIFIED SUCCESSFULLY!")
print("="*50 + "\n")
