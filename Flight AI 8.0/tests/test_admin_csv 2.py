from backend.app import app


def _auth_header(client, user='admin', pwd='password'):
    import base64
    token = base64.b64encode(f"{user}:{pwd}".encode()).decode()
    return {"Authorization": "Basic " + token}


def test_admin_csv_export():
    client = app.test_client()
    # create some entries
    client.post('/progress', json={'student_id': 'csvuser', 'score': 10})
    client.post('/progress', json={'student_id': 'csvuser', 'score': 20})

    headers = _auth_header(client)
    r = client.get('/admin/progress.csv?student_id=csvuser&limit=10', headers=headers)
    assert r.status_code == 200
    data = r.get_data(as_text=True)
    # basic CSV checks: header should include dynamic key 'score'
    header = data.splitlines()[0]
    assert 'score' in header
    assert 'id,student_id' in header
    # ensure entries exist and score values are present
    assert 'csvuser' in data
    assert '10' in data and '20' in data
