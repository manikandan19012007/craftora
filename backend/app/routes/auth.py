from datetime import datetime, timedelta, timezone
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from app.utils.db import get_db_connection
from app.middleware.auth import token_required, admin_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    confirm_password = data.get('confirm_password') or ''

    # Validation
    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if '@' not in email or '.' not in email:
        return jsonify({"error": "Please provide a valid email address"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long"}), 400

    if confirm_password and password != confirm_password:
        return jsonify({"error": "Passwords do not match"}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # Check for existing email
            cursor.execute("SELECT id FROM users WHERE email = %s;", (email,))
            if cursor.fetchone():
                conn.close()
                return jsonify({"error": "An account with this email already exists"}), 409

            # Secure password hashing (scrypt / pbkdf2)
            password_hash = generate_password_hash(password)
            default_avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'

            cursor.execute(
                """
                INSERT INTO users (name, email, password_hash, avatar, role)
                VALUES (%s, %s, %s, %s, 'USER');
                """,
                (name, email, password_hash, default_avatar)
            )
            conn.commit()
            user_id = cursor.lastrowid

            # Create default empty shopping cart for user
            cursor.execute("INSERT INTO cart (user_id) VALUES (%s);", (user_id,))
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
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, name, email, password_hash, avatar, role, created_at FROM users WHERE email = %s;",
                (email,)
            )
            user = cursor.fetchone()
        conn.close()

        if not user or not check_password_hash(user['password_hash'], password):
            return jsonify({"error": "Invalid email or password"}), 401

        # Generate JWT Token (Valid for 7 days)
        payload = {
            "user_id": user['id'],
            "email": user['email'],
            "role": user['role'],
            "exp": datetime.now(timezone.utc) + timedelta(days=7)
        }
        token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm="HS256")

        # Exclude password_hash from response
        user_data = {
            "id": user['id'],
            "name": user['name'],
            "email": user['email'],
            "avatar": user['avatar'],
            "role": user['role'],
            "created_at": user['created_at']
        }

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": user_data
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """
    Get profile of the authenticated user along with order, wishlist, and review counts
    """
    user_id = current_user['id']
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # Count orders
            cursor.execute("SELECT COUNT(id) AS total_orders FROM orders WHERE user_id = %s;", (user_id,))
            orders_count = cursor.fetchone().get('total_orders', 0)

            # Count wishlist items
            cursor.execute("SELECT COUNT(id) AS total_wishlist FROM wishlist WHERE user_id = %s;", (user_id,))
            wishlist_count = cursor.fetchone().get('total_wishlist', 0)

            # Count reviews written
            cursor.execute("SELECT COUNT(id) AS total_reviews FROM reviews WHERE user_id = %s;", (user_id,))
            reviews_count = cursor.fetchone().get('total_reviews', 0)

        conn.close()

        user_info = dict(current_user)
        user_info['stats'] = {
            "orders": orders_count,
            "wishlist": wishlist_count,
            "reviews": reviews_count
        }

        return jsonify({"user": user_info}), 200
    except Exception as e:
        return jsonify({"user": current_user, "stats": {"orders": 0, "wishlist": 0, "reviews": 0}}), 200

@auth_bp.route('/auth/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """
    Update profile details for the authenticated patron
    """
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    avatar = (data.get('avatar') or '').strip()

    if not name:
        return jsonify({"error": "Name cannot be empty"}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                """
                UPDATE users 
                SET name = %s, 
                    avatar = COALESCE(NULLIF(%s, ''), avatar)
                WHERE id = %s;
                """,
                (name, avatar, current_user['id'])
            )
            conn.commit()

            cursor.execute(
                "SELECT id, name, email, avatar, role, created_at FROM users WHERE id = %s;",
                (current_user['id'],)
            )
            updated_user = cursor.fetchone()
        conn.close()

        return jsonify({
            "message": "Profile updated successfully",
            "user": updated_user
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/auth/users', methods=['GET'])
@token_required
@admin_required
def get_all_users(current_user):
    """
    Admin endpoint to view registered users with order and review metrics
    """
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            query = """
                SELECT u.id, u.name, u.email, u.role, u.avatar, u.created_at,
                       COUNT(DISTINCT o.id) as total_orders,
                       COUNT(DISTINCT r.id) as total_reviews
                FROM users u
                LEFT JOIN orders o ON u.id = o.user_id
                LEFT JOIN reviews r ON u.id = r.user_id
                GROUP BY u.id, u.name, u.email, u.role, u.avatar, u.created_at
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
    """
    Standard JWT stateless logout acknowledgement
    """
    return jsonify({"message": "Logged out successfully"}), 200