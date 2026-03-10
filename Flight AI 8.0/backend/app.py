from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_talisman import Talisman
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import openai
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
import datetime
import os
import json
from functools import wraps
import sys
import base64
import csv
from io import StringIO
import csv
from io import StringIO

app = Flask(__name__)
CORS(app)
Talisman(app, content_security_policy=None, force_https=False)

# Rate limiter: support Redis-backed storage in production via `RATELIMIT_STORAGE_URL` or `REDIS_URL`.
limiter_storage = os.environ.get('RATELIMIT_STORAGE_URL') or os.environ.get('REDIS_URL')
if limiter_storage:
    # If a storage URI is provided, initialize the limiter with it (e.g. redis://...)
    limiter = Limiter(key_func=get_remote_address, storage_uri=limiter_storage, app=app, default_limits=[])
else:
    # Fallback to in-memory storage (not recommended for production)
    limiter = Limiter(key_func=get_remote_address, app=app, default_limits=[])

# Load environment variables from project .env (if present)
# Prefer a top-level .env (one level above `backend/`) so project-wide vars live there.
root_env = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(root_env)

# SQLite DB for simple progress persistence
DB_PATH = os.path.join(os.path.dirname(__file__), 'progress.db')
engine = create_engine(f'sqlite:///{DB_PATH}', connect_args={"check_same_thread": False})
Base = declarative_base()

class Progress(Base):
    __tablename__ = 'progress'
    id = Column(Integer, primary_key=True)
    student_id = Column(String(64), index=True)
    data = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)


class Audit(Base):
    __tablename__ = 'audit'
    id = Column(Integer, primary_key=True)
    action = Column(String(64))
    entry_id = Column(Integer, nullable=True)
    admin_user = Column(String(64), nullable=True)
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)


@app.route('/syllabus', methods=['GET'])
def get_syllabus():
    # Return sample syllabus
    return jsonify({"syllabus": "Sample AI-powered flight syllabus"})


@app.route('/lesson', methods=['POST'])
def generate_lesson():
    # Modular AI lesson/resource generation
    data = request.json or {}
    topic = data.get('topic', 'unknown')
    custom = data.get('custom', False)
    resources = data.get('resources', False)
    api_key = os.environ.get('OPENAI_API_KEY')
    def ai_generate(prompt):
        if api_key:
            try:
                openai.api_key = api_key
                resp = openai.ChatCompletion.create(
                    model=os.environ.get('OPENAI_MODEL', 'gpt-3.5-turbo'),
                    messages=[
                        {"role": "system", "content": "You are a helpful flight instructor."},
                        {"role": "user", "content": prompt},
                    ],
                    max_tokens=400,
                    n=1,
                    temperature=0.5,
                )
                text = ''
                if resp and hasattr(resp, 'choices') and len(resp.choices) > 0:
                    choice = resp.choices[0]
                    text = choice.message.get('content') if getattr(choice, 'message', None) else choice.get('text', '')
                return text or "(empty response)"
            except Exception:
                return "(fallback AI response)"
        return "(no AI key configured)"
    lesson_prompt = f"Write a short lesson suitable for a flight student on the topic: {topic}. Keep it concise and actionable."
    lesson = ai_generate(lesson_prompt)
    result = {"lesson": lesson}
    if custom:
        custom_prompt = f"Customize the lesson for a student with unique needs: {topic}."
        result["customized"] = ai_generate(custom_prompt)
    if resources:
        resource_prompt = f"Suggest study materials and resources for learning about: {topic}."
        result["resources"] = ai_generate(resource_prompt)
    return jsonify(result)


@app.route('/progress', methods=['POST'])
def track_progress():
    # Persist student progress to SQLite
    data = request.json or {}
    student_id = data.get('student_id', 'unknown')
    session = SessionLocal()
    entry = Progress(student_id=student_id, data=json.dumps(data))
    session.add(entry)
    session.commit()
    print(f"Created progress entry: id={entry.id}, student_id={student_id}, data={data}")
    session.close()
    return jsonify({"status": "success", "student_id": student_id, "progress": data})


@app.route('/admin/progress', methods=['GET'])
@limiter.limit('30/minute')
def list_progress():
    """Admin endpoint: return recent progress entries as JSON."""
    session = SessionLocal()
    # optional query params: limit
    try:
        limit = int(request.args.get('limit', 100))
    except Exception:
        limit = 100
    try:
        offset = int(request.args.get('offset', 0))
    except Exception:
        offset = 0
    student_filter = request.args.get('student_id')
    q = session.query(Progress)
    if student_filter:
        q = q.filter(Progress.student_id == student_filter)
    total = q.count()
    entries = q.order_by(Progress.timestamp.desc()).offset(offset).limit(limit).all()
    print(f"Admin listing: student_id={student_filter}, found={len(entries)} entries")
    result = []
    for e in entries:
        try:
            payload = json.loads(e.data)
        except Exception:
            payload = e.data
        result.append({
            'id': e.id,
            'student_id': e.student_id,
            'data': payload,
            'timestamp': e.timestamp.isoformat() if e.timestamp else None,
        })
    session.close()
    return jsonify({"entries": result, "total": total, "offset": offset, "limit": limit})


# --- Admin authentication (Basic) ---
def _check_admin(username, password):
    admin_user = os.environ.get('ADMIN_USER', 'admin')
    admin_pass = os.environ.get('ADMIN_PASS', 'password')
    return username == admin_user and password == admin_pass


def require_admin(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        # First, support Bearer token auth using ADMIN_TOKEN env var
        hdr = request.headers.get('Authorization', '')
        token = None
        if hdr.startswith('Bearer '):
            token = hdr.split(' ', 1)[1].strip()
        admin_token = os.environ.get('ADMIN_TOKEN')
        if token and admin_token and token == admin_token:
            # token is valid
            try:
                request.environ['admin_user'] = 'token'
            except Exception:
                pass
            return f(*args, **kwargs)
        # If configured to require token-only admin, enforce it here.
        admin_token_only = os.environ.get('ADMIN_TOKEN_ONLY', '').lower() in ('1', 'true', 'yes')
        if admin_token_only:
            # token was either absent or invalid (we would have returned earlier on valid token)
            return jsonify({'error': 'Unauthorized - token required'}), 401

        # Fallback to Basic Auth (existing behavior)
        auth = request.authorization
        username = password = None
        if auth:
            username, password = auth.username, auth.password
        else:
            if hdr and hdr.startswith('Basic '):
                try:
                    creds = base64.b64decode(hdr.split(' ', 1)[1]).decode()
                    username, password = creds.split(':', 1)
                except Exception:
                    username = password = None
        if not username or not _check_admin(username, password):
            # if token was provided but didn't match, still return 401
            return jsonify({'error': 'Unauthorized'}), 401, {'WWW-Authenticate': 'Basic realm="Login required"'}
        try:
            request.environ['admin_user'] = username
        except Exception:
            pass
        return f(*args, **kwargs)
    return wrapper


# Apply auth to admin routes
app.view_functions['list_progress'] = require_admin(app.view_functions['list_progress'])


@app.route('/admin/progress/<int:entry_id>', methods=['DELETE'])
def delete_progress(entry_id):
    session = SessionLocal()
    entry = session.query(Progress).filter_by(id=entry_id).first()
    if not entry:
        session.close()
        return jsonify({'error': 'Not found'}), 404
    # capture details before deletion
    details = json.dumps({
        'student_id': entry.student_id,
        'data': entry.data,
        'timestamp': entry.timestamp.isoformat() if entry.timestamp else None,
    })
    admin_user = request.environ.get('admin_user')
    # delete the entry
    session.delete(entry)
    # record audit
    audit = Audit(action='delete', entry_id=entry_id, admin_user=admin_user, details=details)
    session.add(audit)
    session.commit()
    session.close()
    return jsonify({'deleted': entry_id})

# protect delete endpoint
app.view_functions['delete_progress'] = require_admin(app.view_functions['delete_progress'])


@app.route('/admin/audit', methods=['GET'])
@limiter.limit('30/minute')
def get_audit():
    session = SessionLocal()
    try:
        limit = int(request.args.get('limit', 100))
    except Exception:
        limit = 100
    try:
        offset = int(request.args.get('offset', 0))
    except Exception:
        offset = 0
    action_filter = request.args.get('action')
    admin_filter = request.args.get('admin_user')
    q = session.query(Audit)
    if action_filter:
        q = q.filter(Audit.action == action_filter)
    if admin_filter:
        q = q.filter(Audit.admin_user == admin_filter)
    total = q.count()
    entries = q.order_by(Audit.timestamp.desc()).offset(offset).limit(limit).all()
    result = []
    for e in entries:
        payload = None
        try:
            payload = json.loads(e.details) if e.details else None
        except Exception:
            payload = e.details
        result.append({
            'id': e.id,
            'action': e.action,
            'entry_id': e.entry_id,
            'admin_user': e.admin_user,
            'details': payload,
            'timestamp': e.timestamp.isoformat() if e.timestamp else None,
        })
    session.close()
    return jsonify({'entries': result, 'total': total, 'offset': offset, 'limit': limit})

# protect audit endpoint
app.view_functions['get_audit'] = require_admin(app.view_functions['get_audit'])


@app.route('/admin/audit.csv', methods=['GET'])
def export_audit_csv():
    """Export audit log as CSV. Supports `action`, `admin_user`, `limit`, `offset`."""
    session = SessionLocal()
    try:
        limit = int(request.args.get('limit', 100))
    except Exception:
        limit = 100
    try:
        offset = int(request.args.get('offset', 0))
    except Exception:
        offset = 0
    action_filter = request.args.get('action')
    admin_filter = request.args.get('admin_user')
    q = session.query(Audit)
    if action_filter:
        q = q.filter(Audit.action == action_filter)
    if admin_filter:
        q = q.filter(Audit.admin_user == admin_filter)
    entries = q.order_by(Audit.timestamp.desc()).offset(offset).limit(limit).all()

    # collect dynamic keys from details
    rows = []
    detail_keys = set()
    for e in entries:
        payload = None
        try:
            payload = json.loads(e.details) if e.details else None
        except Exception:
            payload = e.details
        rows.append((e, payload))
        if isinstance(payload, dict):
            for k in payload.keys():
                detail_keys.add(k)

    detail_keys = sorted(detail_keys)
    output = StringIO()
    writer = csv.writer(output)
    header = ['id', 'action', 'entry_id', 'admin_user', 'timestamp'] + detail_keys + ['details']
    writer.writerow(header)
    for e, payload in rows:
        row = [e.id, e.action, e.entry_id, e.admin_user, e.timestamp.isoformat() if e.timestamp else '']
        for k in detail_keys:
            v = ''
            if isinstance(payload, dict):
                v = payload.get(k, '')
                if isinstance(v, (dict, list)):
                    v = json.dumps(v)
            row.append(v)
        row.append(e.details or '')
        writer.writerow(row)
    session.close()
    csv_data = output.getvalue()
    return (csv_data, 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="audit.csv"'
    })

# protect audit CSV export
app.view_functions['export_audit_csv'] = require_admin(app.view_functions['export_audit_csv'])


@app.route('/admin/progress.csv', methods=['GET'])
@limiter.limit('30/minute')
def export_progress_csv():
    """Export progress entries as CSV. Supports same query params as JSON endpoint."""
    # reuse list_progress logic to get filtered entries
    session = SessionLocal()
    try:
        limit = int(request.args.get('limit', 100))
    except Exception:
        limit = 100
    try:
        offset = int(request.args.get('offset', 0))
    except Exception:
        offset = 0
    student_filter = request.args.get('student_id')
    q = session.query(Progress)
    if student_filter:
        q = q.filter(Progress.student_id == student_filter)
    entries = q.order_by(Progress.timestamp.desc()).offset(offset).limit(limit).all()

    # prepare rows and determine dynamic data keys
    rows = []
    data_keys = set()
    for e in entries:
        try:
            payload = json.loads(e.data)
        except Exception:
            payload = None
        rows.append((e, payload))
        if isinstance(payload, dict):
            for k in payload.keys():
                data_keys.add(k)

    data_keys = sorted(data_keys)
    output = StringIO()
    writer = csv.writer(output)
    # header includes dynamic keys, plus raw data column
    header = ['id', 'student_id', 'timestamp'] + data_keys + ['data']
    writer.writerow(header)
    for e, payload in rows:
        data_str = e.data if isinstance(e.data, str) else json.dumps(e.data)
        row = [e.id, e.student_id, e.timestamp.isoformat() if e.timestamp else '']
        for k in data_keys:
            v = ''
            if isinstance(payload, dict):
                v = payload.get(k, '')
                # if value is complex, dump to JSON string
                if isinstance(v, (dict, list)):
                    v = json.dumps(v)
            row.append(v)
        row.append(data_str)
        writer.writerow(row)
    session.close()
    csv_data = output.getvalue()
    return (csv_data, 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="progress.csv"'
    })

# protect CSV export
app.view_functions['export_progress_csv'] = require_admin(app.view_functions['export_progress_csv'])


if __name__ == '__main__':
    def _validate_startup_config():
        """Sanity-checks for environment configuration on startup.

        - Warns if admin username/password are default values.
        - If `ADMIN_TOKEN_ONLY` is set, enforces that `ADMIN_TOKEN` is configured.
        - If `PRODUCTION` is set and insecure defaults are detected, exit non-zero.
        """
        admin_user = os.environ.get('ADMIN_USER', 'admin')
        admin_pass = os.environ.get('ADMIN_PASS', 'password')
        admin_token = os.environ.get('ADMIN_TOKEN')
        admin_token_only = os.environ.get('ADMIN_TOKEN_ONLY', '').lower() in ('1', 'true', 'yes')
        prod = os.environ.get('PRODUCTION', '').lower() in ('1', 'true', 'yes')

        if admin_user == 'admin' and admin_pass == 'password':
            print('WARNING: default admin credentials in use (ADMIN_USER=admin ADMIN_PASS=password).')
            print('Set secure credentials before exposing this service.')
            if prod:
                print('ERROR: running in PRODUCTION mode with insecure admin credentials; aborting startup.')
                sys.exit(1)

        if admin_token_only and not admin_token:
            print('ERROR: ADMIN_TOKEN_ONLY is set but ADMIN_TOKEN is not configured; aborting startup.')
            sys.exit(1)

    _validate_startup_config()
    port = int(os.environ.get('PORT', 5050))
    app.run(debug=True, port=port)
