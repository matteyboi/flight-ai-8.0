from backend.app import app


def _auth_header(user='admin', pwd='password'):
    import base64
    token = base64.b64encode(f"{user}:{pwd}".encode()).decode()
    return {"Authorization": "Basic " + token}


def test_audit_csv_export():
    client = app.test_client()
    headers = _auth_header()
    # ensure at least one audit exists by creating and deleting an entry
    client.post('/progress', json={'student_id': 'auditcsv', 'score': 9})
    r = client.get('/admin/progress', headers=headers)
    entries = r.get_json().get('entries', [])
    target = next((e for e in entries if e.get('student_id') == 'auditcsv'), None)
    assert target is not None
    entry_id = target['id']
    client.delete(f'/admin/progress/{entry_id}', headers=headers)

    # export audit CSV
    r = client.get('/admin/audit.csv?limit=10', headers=headers)
    assert r.status_code == 200
    txt = r.get_data(as_text=True)
    # header contains 'action' and dynamic keys like 'student_id' are likely present
    assert 'action' in txt.splitlines()[0]
    assert 'auditcsv' in txt
