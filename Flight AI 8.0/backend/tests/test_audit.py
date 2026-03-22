from app.app import app as flask_app


def _auth_header(user='admin', pwd='password'):
    import base64
    token = base64.b64encode(f"{user}:{pwd}".encode()).decode()
    return {"Authorization": "Basic " + token}


def test_delete_creates_audit():
    client = flask_app.test_client()
    # create entry
    r = client.post('/progress', json={'student_id': 'auditme', 'score': 42})
    assert r.status_code == 200
    # list entries and find one to delete
    headers = _auth_header()
    r = client.get('/admin/progress', headers=headers)
    entries = r.get_json().get('entries', [])
    target = next((e for e in entries if e.get('student_id') == 'auditme'), None)
    assert target is not None
    entry_id = target['id']
    # delete
    r = client.delete(f'/admin/progress/{entry_id}', headers=headers)
    assert r.status_code == 200
    # check audit
    r = client.get('/admin/audit?action=delete&limit=10', headers=headers)
    assert r.status_code == 200
    audits = r.get_json().get('entries', [])
    assert any(a.get('entry_id') == entry_id and a.get('action') == 'delete' for a in audits)
