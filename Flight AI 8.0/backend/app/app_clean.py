# DEBUG: Print file path to confirm which app.py is loaded
print('[DEBUG] Loading backend/main_app.py:', __file__)
__all__ = ["create_app", "app"]

# --- Imports ---
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from functools import wraps
from dotenv import load_dotenv
from itsdangerous import URLSafeTimedSerializer
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy.sql import func

# --- SQLAlchemy Setup ---
Base = declarative_base()
engine = create_engine('sqlite:///progress.db')
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- Models ---
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)
    full_name = Column(String)
    email = Column(String, unique=True)
    management_id = Column(String)
    def set_password(self, password):
        self.password_hash = password  # Replace with real hash in production
    def check_password(self, password):
        return self.password_hash == password  # Replace with real hash in production

class Progress(Base):
    __tablename__ = 'progress'
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, index=True)
    management_id = Column(String, index=True)
    data = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class Audit(Base):
    __tablename__ = 'audit'
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String)
    user_id = Column(Integer)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

# --- Flask App Factory ---
def create_app():
    app = Flask(__name__)
    CORS(app)
    limiter = Limiter(key_func=get_remote_address, default_limits=["200 per day", "50 per hour"])
    limiter.init_app(app)
    load_dotenv()
    serializer = URLSafeTimedSerializer(os.environ.get('SECRET_KEY', 'dev-secret'))

    def require_admin(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            auth = request.authorization
            if not auth or not (auth.username == 'admin' and auth.password == os.environ.get('ADMIN_PASSWORD', 'password')):
                return jsonify({'error': 'Unauthorized'}), 401, {'WWW-Authenticate': 'Basic realm="Login required"'}
            return f(*args, **kwargs)
        return wrapper

    @app.route('/admin/reset', methods=['POST'])
    @require_admin
    def admin_reset():
        session = SessionLocal()
        try:
            deleted_progress = session.query(Progress).delete()
            deleted_audit = session.query(Audit).delete()
            session.commit()
            msg = f"Reset complete: {deleted_progress} progress entries, {deleted_audit} audit logs deleted."
            print(f"[ADMIN RESET] {msg}")
            return jsonify({"message": msg}), 200
        except Exception as e:
            session.rollback()
            print(f"[ADMIN RESET ERROR] {e}")
            return jsonify({"error": "Failed to reset data."}), 500
        finally:
            session.close()

    def _print_registered_routes():
        try:
            routes = sorted([r.rule for r in app.url_map.iter_rules()])
            print('[DEBUG] Registered routes:', routes)
        except Exception as e:
            print('[DEBUG] Could not list routes:', e)

    @app.before_request
    def handle_options():
        if request.method == 'OPTIONS':
            return ('', 200)

    @app.route('/set-new-password', methods=['POST', 'OPTIONS'])
    def set_new_password():
        data = request.json or {}
        token = data.get('token', '').strip()
        print(f"[DEBUG] Received token: {token}")
        new_password = data.get('password', '')
        if not token or not new_password:
            return jsonify({'error': 'Missing token or password'}), 400
        try:
            payload = serializer.loads(token, salt='reset-password', max_age=3600)
            user_id = payload.get('user_id')
            email = payload.get('email')
        except Exception as e:
            return jsonify({'error': 'Invalid or expired token'}), 400
        session = SessionLocal()
        user = session.query(User).filter_by(id=user_id, email=email).first()
        if not user:
            session.close()
            return jsonify({'error': 'User not found'}), 404
        user.set_password(new_password)
        session.commit()
        session.close()
        return jsonify({'message': 'Password has been reset successfully.'})

    @app.route('/reset-password', methods=['POST', 'OPTIONS'])
    def reset_password():
        data = request.json or {}
        email = data.get('email', '').strip()
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        session = SessionLocal()
        user = session.query(User).filter_by(email=email).first()
        if not user:
            session.close()
            return jsonify({'message': 'If the email is registered, you will receive a password reset link.'})
        token = serializer.dumps({'user_id': user.id, 'email': user.email}, salt='reset-password')
        reset_url = f"http://localhost:5173/reset-password?token={token}"
        # send_reset_email(email, reset_url)  # Uncomment and implement as needed
        session.close()
        return jsonify({'message': 'If the email is registered, you will receive a password reset link.'})

    @app.route('/syllabus', methods=['GET'])
    def syllabus():
        return jsonify({'status': 'ok', 'service': 'flight-ai-backend'}), 200

    @app.route('/register', methods=['POST', 'OPTIONS'])
    def register():
        data = request.json or {}
        username = data.get('username', '').strip()
        password = data.get('password', '')
        role = data.get('role', '').strip().lower()
        full_name = data.get('full_name', '').strip()
        email = data.get('email', '').strip()
        management_id = data.get('management_id', '').strip() or None
        if not username or not password or role not in ('student', 'instructor', 'management'):
            return jsonify({'error': 'Missing or invalid fields'}), 400
        session = SessionLocal()
        if session.query(User).filter_by(username=username).first():
            session.close()
            return jsonify({'error': 'Username already exists'}), 409
        if email and session.query(User).filter_by(email=email).first():
            session.close()
            return jsonify({'error': 'Email already exists'}), 409
        user = User(username=username, role=role, full_name=full_name, email=email, management_id=management_id)
        user.set_password(password)
        session.add(user)
        session.commit()
        session.close()
        return jsonify({'message': 'User registered successfully'})

    @app.route('/login', methods=['POST', 'OPTIONS'])
    def login():
        data = request.json or {}
        username = data.get('username', '').strip()
        password = data.get('password', '')
        session = SessionLocal()
        user = session.query(User).filter_by(username=username).first()
        if not user or not user.check_password(password):
            session.close()
            return jsonify({'error': 'Invalid username or password'}), 401
        user_info = {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'full_name': user.full_name,
            'email': user.email
        }
        session.close()
        return jsonify({'message': 'Login successful', 'user': user_info})

    @app.route('/progress', methods=['POST'])
    def track_progress():
        data = request.json or {}
        print(f"[DEBUG] /progress POST received: {data}")
        student_id = data.get('student_id')
        if not student_id:
            print("[ERROR] /progress POST missing student_id!")
            return jsonify({'error': 'student_id required'}), 400
        management_id = data.get('management_id', None)
        session = SessionLocal()
        entry = Progress(student_id=student_id, management_id=management_id, data=json.dumps(data))
        session.add(entry)
        session.commit()
        print(f"Created progress entry: id={entry.id}, student_id={student_id}, management_id={management_id}, data={data}")
        session.close()
        return jsonify({"status": "success", "student_id": student_id, "management_id": management_id, "progress": data})

    @app.route('/admin/progress', methods=['GET'])
    @limiter.limit('30/minute')
    def list_progress():
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

    @app.route('/progress', methods=['GET'])
    def get_progress():
        student_id = request.args.get('student_id')
        if not student_id:
            return jsonify({'error': 'student_id required'}), 400
        session = SessionLocal()
        entry = session.query(Progress).filter_by(student_id=student_id).order_by(Progress.timestamp.desc()).first()
        session.close()
        if not entry:
            return jsonify({'progress': None})
        try:
            data = json.loads(entry.data)
        except Exception:
            data = entry.data
        return jsonify({'progress': data})

    _print_registered_routes()
    return app

app = create_app()
globals()['app'] = app
