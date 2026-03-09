from backend.app import app


def test_get_syllabus():
    client = app.test_client()
    r = client.get('/syllabus')
    assert r.status_code == 200
    j = r.get_json()
    assert 'syllabus' in j


def test_generate_lesson():
    client = app.test_client()
    r = client.post('/lesson', json={'topic': 'Weather'})
    assert r.status_code == 200
    j = r.get_json()
    assert 'lesson' in j


def test_track_progress():
    client = app.test_client()
    r = client.post('/progress', json={'student_id': '123'})
    assert r.status_code == 200
    j = r.get_json()
    assert 'progress' in j

