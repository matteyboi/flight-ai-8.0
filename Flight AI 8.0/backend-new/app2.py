# Copy of app.py to bypass Docker/Python import bug
# Ensure create_app is exported for Gunicorn
__all__ = ["create_app"]

# --- Imports ---
# UNIQUE_MARKER_20260320_DO_NOT_REMOVE
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_talisman import Talisman
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from functools import wraps
from dotenv import load_dotenv
from itsdangerous import URLSafeTimedSerializer
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy.sql import func

Base = declarative_base()
engine = create_engine('sqlite:///progress.db')
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

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

def create_app():
	app = Flask(__name__)
	CORS(app)
	Talisman(app, force_https=False, content_security_policy=None)
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
	_print_registered_routes()

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
			print(f"[ERROR] Token parse failed: {e}")
			return jsonify({'error': f'Invalid or expired token: {str(e)}'}), 400
		session = SessionLocal()
		user = session.query(User).filter_by(id=user_id, email=email).first()
		if not user:
			session.close()
			return jsonify({'error': 'User not found'}), 404
		user.set_password(new_password)
		session.commit()
		session.close()
		return jsonify({'message': 'Password updated successfully'}), 200

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

	return app
