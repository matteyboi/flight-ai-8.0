from app.app import app as flask_app


def test_get_syllabus():
    client = flask_app.test_client()
    r = client.get('/syllabus')
    assert r.status_code == 200
    j = r.get_json()
    assert 'syllabus' in j


def test_generate_lesson():
    client = flask_app.test_client()
    r = client.post('/lesson', json={'topic': 'Weather'})
    assert r.status_code == 200
    j = r.get_json()
    assert 'lesson' in j


def test_track_progress():
    client = flask_app.test_client()
    r = client.post('/progress', json={'student_id': '123'})
    assert r.status_code == 200
    j = r.get_json()
    assert 'progress' in j

