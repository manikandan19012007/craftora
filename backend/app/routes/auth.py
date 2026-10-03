from datetime import datetime, timedelta, timezone
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import jwt
import re
import os
import uuid
from pathlib import Path
from app.utils.db import get_db_connection
from app.middleware.auth import token_required, admin_required

auth_bp = Blueprint('auth', __name__)

EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
PHONE_RE = re.compile(r'^[6-9]\d{9}$')

ALLOWED_AVATAR_TYPES = {'image/jpeg', 'image/png', 'image/gif', 'image/webp'}
ALLOWED_AVATAR_EXT   = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_AVATAR_BYTES     = 3 * 1024 * 1024   # 3 MB

def _avatar_dir() -> Path:
    """Return (and create if needed) the directory for uploaded avatars."""
    base = Path(current_app.root_path).parent  # backend/
    d = base / 'static' / 'avatars'
    d.mkdir(parents=True, exist_ok=True)
    return d


@auth_bp.route('/avatars/<path:filename>', methods=['GET'])
def serve_avatar(filename):
    """Serve uploaded avatar images."""
    avatar_dir = str(_avatar_dir())
    return send_from_directory(avatar_dir, filename)


@auth_bp.route('/auth/avatar', methods=['POST'])
@token_required
def upload_avatar(current_user):
    """Upload a new profile avatar image (multipart/form-data, field: 'avatar')."""
    if 'avatar' not in request.files:
        return jsonify({"error": "No file uploaded. Use field name 'avatar'."}), 400

    file = request.files['avatar']
    if not file or not file.filename:
        return jsonify({"error": "Empty file received."}), 400

    # Validate extension
    ext = Path(secure_filename(file.filename)).suffix.lower()
    if ext not in ALLOWED_AVATAR_EXT:
        return jsonify({"error": "Only JPEG, PNG, GIF, or WebP images are allowed."}), 400

    # Validate MIME type
    mime = file.mimetype or ''
    if mime and mime not in ALLOWED_AVATAR_TYPES:
        return jsonify({"error": "Invalid image type. Upload a JPEG, PNG, GIF, or WebP."}), 400

    # Read and check file size
    file_bytes = file.read()
    if len(file_bytes) > MAX_AVATAR_BYTES:
        return jsonify({"error": "Image is too large. Maximum size is 3 MB."}), 413

    # Generate a unique filename: <user_id>_<uuid><ext>
    filename = f"user_{current_user['id']}_{uuid.uuid4().hex[:8]}{ext}"
    save_path = _avatar_dir() / filename
    save_path.write_bytes(file_bytes)

    # Build the public URL (served via /api/avatars/<filename>)
    avatar_url = f"/api/avatars/{filename}"

    # Remove old avatar file if it was a local upload
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT avatar FROM users WHERE id = %s;", (current_user['id'],))
            row = cursor.fetchone()
            old_avatar = row.get('avatar', '') if row else ''

            # Delete old local file if it's a local upload path
            if old_avatar and old_avatar.startswith('/api/avatars/'):
                old_filename = old_avatar.split('/')[-1]
                old_file = _avatar_dir() / old_filename
                if old_file.exists():
                    old_file.unlink()

            cursor.execute(
                "UPDATE users SET avatar = %s WHERE id = %s;",
                (avatar_url, current_user['id'])
            )
            conn.commit()

            cursor.execute(
                "SELECT id, name, email, mobile, avatar, role, created_at FROM users WHERE id = %s;",
                (current_user['id'],)
            )
            updated_user = cursor.fetchone()
        conn.close()

        return jsonify({
            "message":    "Profile photo updated successfully!",
            "avatar_url": avatar_url,
            "user":       updated_user
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@auth_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name     = (data.get('name') or '').strip()
    email    = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    confirm  = data.get('confirm_password') or ''
    mobile   = (data.get('mobile') or '').strip()
    role_req = (data.get('role') or 'USER').upper()

    # --- Basic field validation ---
    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if not EMAIL_RE.match(email):
        return jsonify({"error": "Please provide a valid email address"}), 400

    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters long"}), 400

    # Password strength: at least one digit and one letter
    if not re.search(r'[A-Za-z]', password) or not re.search(r'\d', password):
        return jsonify({"error": "Password must contain at least one letter and one number"}), 400

    if confirm and password != confirm:
        return jsonify({"error": "Passwords do not match"}), 400

    if mobile and not PHONE_RE.match(mobile):
        return jsonify({"error": "Mobile number must be a valid 10-digit Indian number starting with 6-9"}), 400

    # Only allow USER or SELLER roles via self-registration
    if role_req not in ('USER', 'SELLER'):
        role_req = 'USER'

    # Artisan-only fields for SELLER
    craft_name     = (data.get('craft_name') or '').strip() if role_req == 'SELLER' else None
    craft_category = (data.get('craft_category') or '').strip() if role_req == 'SELLER' else None
    location       = (data.get('location') or '').strip() if role_req == 'SELLER' else None

    if role_req == 'SELLER' and not craft_name:
        return jsonify({"error": "Studio / Workshop brand name is required for Artisan accounts"}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # Duplicate email check
            cursor.execute("SELECT id FROM users WHERE email = %s;", (email,))
            if cursor.fetchone():
                conn.close()
                return jsonify({"error": "An account with this email already exists"}), 409

            password_hash    = generate_password_hash(password)
            default_avatar   = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'

            cursor.execute(
                """
                INSERT INTO users (name, email, password_hash, mobile, avatar, role)
                VALUES (%s, %s, %s, %s, %s, %s);
                """,
                (name, email, password_hash, mobile or None, default_avatar, role_req)
            )
            conn.commit()
            user_id = cursor.lastrowid

            # Create default empty cart for new user
            cursor.execute("INSERT INTO cart (user_id) VALUES (%s);", (user_id,))
            conn.commit()

            # If SELLER, also create artisan profile record
            if role_req == 'SELLER':
                cursor.execute(
                    """
                    INSERT INTO artisans (name, bio, specialty, location, image, user_id)
                    VALUES (%s, %s, %s, %s, %s, %s);
                    """,
                    (
                        name,
                        f'{name} is a skilled artisan specializing in {craft_category or "handmade crafts"}.',
                        craft_name,
                        location or 'India',
                        default_avatar,
                        user_id
                    )
                )
                conn.commit()

        conn.close()
        return jsonify({
            "message": "Account created successfully! Please log in to continue.",
            "user_id": user_id
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/auth/login', methods=['POST'])
def login():
    data     = request.get_json() or {}
    email    = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, name, email, password_hash, mobile, avatar, role, created_at FROM users WHERE email = %s;",
                (email,)
            )
            user = cursor.fetchone()
        conn.close()

        if not user or not check_password_hash(user['password_hash'], password):
            return jsonify({"error": "Invalid email or password"}), 401

        payload = {
            "user_id": user['id'],
            "email":   user['email'],
            "role":    user['role'],
            "exp":     datetime.now(timezone.utc) + timedelta(days=7)
        }
        token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm="HS256")

        user_data = {
            "id":         user['id'],
            "name":       user['name'],
            "email":      user['email'],
            "mobile":     user['mobile'],
            "avatar":     user['avatar'],
            "role":       user['role'],
            "created_at": user['created_at']
        }

        return jsonify({
            "message": "Login successful",
            "token":   token,
            "user":    user_data
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Get profile of the authenticated user with stats"""
    user_id = current_user['id']
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(id) AS total_orders FROM orders WHERE user_id = %s;", (user_id,))
            orders_count = cursor.fetchone().get('total_orders', 0)

            cursor.execute("SELECT COUNT(id) AS total_wishlist FROM wishlist WHERE user_id = %s;", (user_id,))
            wishlist_count = cursor.fetchone().get('total_wishlist', 0)

            cursor.execute("SELECT COUNT(id) AS total_reviews FROM reviews WHERE user_id = %s;", (user_id,))
            reviews_count = cursor.fetchone().get('total_reviews', 0)
        conn.close()

        user_info = dict(current_user)
        user_info['stats'] = {
            "orders":   orders_count,
            "wishlist": wishlist_count,
            "reviews":  reviews_count
        }
        return jsonify({"user": user_info}), 200
    except Exception as e:
        return jsonify({"user": current_user, "stats": {"orders": 0, "wishlist": 0, "reviews": 0}}), 200


@auth_bp.route('/auth/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Update profile details for the authenticated user"""
    data   = request.get_json() or {}
    name   = (data.get('name') or '').strip()
    avatar = (data.get('avatar') or '').strip()
    mobile = (data.get('mobile') or '').strip()

    if not name:
        return jsonify({"error": "Name cannot be empty"}), 400

    if mobile and not PHONE_RE.match(mobile):
        return jsonify({"error": "Mobile number must be a valid 10-digit Indian number starting with 6-9"}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                """
                UPDATE users
                SET name   = %s,
                    mobile = COALESCE(NULLIF(%s, ''), mobile),
                    avatar = COALESCE(NULLIF(%s, ''), avatar)
                WHERE id = %s;
                """,
                (name, mobile or None, avatar or None, current_user['id'])
            )
            conn.commit()

            cursor.execute(
                "SELECT id, name, email, mobile, avatar, role, created_at FROM users WHERE id = %s;",
                (current_user['id'],)
            )
            updated_user = cursor.fetchone()
        conn.close()

        return jsonify({
            "message": "Profile updated successfully",
            "user":    updated_user
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/auth/users', methods=['GET'])
@token_required
@admin_required
def get_all_users(current_user):
    """Admin endpoint to view registered users"""
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            query = """
                SELECT u.id, u.name, u.email, u.mobile, u.role, u.avatar, u.created_at,
                       COUNT(DISTINCT o.id) as total_orders,
                       COUNT(DISTINCT r.id) as total_reviews
                FROM users u
                LEFT JOIN orders o ON u.id = o.user_id
                LEFT JOIN reviews r ON u.id = r.user_id
                GROUP BY u.id, u.name, u.email, u.mobile, u.role, u.avatar, u.created_at
                ORDER BY u.id ASC;
            """
            cursor.execute(query)
            users = cursor.fetchall()
        conn.close()
        return jsonify({"users": users}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/auth/logout', methods=['POST'])
def logout():
    """JWT stateless logout acknowledgement"""
    return jsonify({"message": "Logged out successfully"}), 200