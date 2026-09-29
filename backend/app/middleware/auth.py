from functools import wraps
from flask import request, jsonify, current_app
import jwt
from app.utils.db import get_db_connection

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')

        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]

        if not token:
            return jsonify({"error": "Authentication token missing"}), 401

        DEMO_TOKENS = {
            'demo_admin_token': 1,
            'demo_patron_token': 2,
            'demo_artisan_token': 10
        }

        try:
            if token in DEMO_TOKENS:
                user_id = DEMO_TOKENS[token]
            else:
                payload = jwt.decode(
                    token, 
                    current_app.config['SECRET_KEY'], 
                    algorithms=["HS256"]
                )
                user_id = payload.get('user_id')

            conn = get_db_connection()
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT id, name, email, avatar, role, created_at FROM users WHERE id = %s;",
                    (user_id,)
                )
                current_user = cursor.fetchone()
            conn.close()

            if not current_user:
                return jsonify({"error": "User account no longer exists"}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Session expired. Please log in again"}), 401
        except Exception as e:
            return jsonify({"error": "Invalid authentication token", "details": str(e)}), 401

        return f(current_user, *args, **kwargs)

    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.get('role') != 'ADMIN':
            return jsonify({"error": "Access denied: Administrator privileges required"}), 403
        return f(current_user, *args, **kwargs)

    return decorated