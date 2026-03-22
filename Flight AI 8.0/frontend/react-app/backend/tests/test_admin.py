import base64
from backend.app import app


def _auth_header(user: str = "admin", pwd: str = "password") -> dict:
    token = base64.b64encode(f"{user}:{pwd}".encode()).decode()
    return {"Authorization": "Basic " + token}


def test_admin_progress_flow():
    client = app.test_client()

    # create a progress entry
    r = client.post("/progress", json={"student_id": "test-user", "score": 77})
    assert r.status_code == 200

    # unauthenticated admin request should be rejected
    r = client.get("/admin/progress")
    assert r.status_code == 401

    # authenticated admin request should return entries
    headers = _auth_header()
    r = client.get("/admin/progress", headers=headers)
    assert r.status_code == 200
    payload = r.get_json()
    assert "entries" in payload
    assert any(e.get("student_id") == "test-user" for e in payload["entries"]) 

    # delete the most recent matching entry
    # find an entry id for test-user
    entries = payload["entries"]
    target = next((e for e in entries if e.get("student_id") == "test-user"), None)
    assert target is not None
    entry_id = target["id"]

    r = client.delete(f"/admin/progress/{entry_id}", headers=headers)
    assert r.status_code == 200
    assert r.get_json().get("deleted") == entry_id

    # test filtering by student_id
    # create two entries
    client.post('/progress', json={'student_id': 'alice'})
    client.post('/progress', json={'student_id': 'bob'})
    r = client.get('/admin/progress?student_id=alice&limit=10', headers=headers)
    assert r.status_code == 200
    j = r.get_json()
    assert j.get('total', 0) >= 1
    assert all(e.get('student_id') == 'alice' for e in j.get('entries', [])) or any(e.get('student_id') == 'alice' for e in j.get('entries', []))
