from flask import Blueprint, request, jsonify
from app.utils.db import get_db_connection
from app.middleware.auth import token_required

wishlist_bp = Blueprint('wishlist', __name__)

@wishlist_bp.route('/wishlist', methods=['GET'])
@token_required
def get_wishlist(current_user):
    """
    Retrieve all wishlist products for the authenticated user
    """
    user_id = current_user['id']
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            query = """
                SELECT w.id as wishlist_id, w.created_at as saved_at,
                       p.id, p.name, p.description, p.price, p.image, 
                       p.material, p.dimensions, p.stock_quantity, p.rating,
                       c.name as category_name, a.name as artisan_name
                FROM wishlist w
                JOIN products p ON w.product_id = p.id
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN artisans a ON p.artisan_id = a.id
                WHERE w.user_id = %s
                ORDER BY w.id DESC;
            """
            cursor.execute(query, (user_id,))
            items = cursor.fetchall()
        conn.close()
        return jsonify({
            "wishlist": items,
            "count": len(items)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@wishlist_bp.route('/wishlist', methods=['POST'])
@token_required
def add_to_wishlist(current_user):
    """
    Add a product to user wishlist, preventing duplicates
    """
    user_id = current_user['id']
    data = request.get_json() or {}
    product_id = data.get('product_id')

    if not product_id:
        return jsonify({"error": "product_id is required"}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # Verify product exists
            cursor.execute("SELECT id FROM products WHERE id = %s;", (product_id,))
            if not cursor.fetchone():
                conn.close()
                return jsonify({"error": "Product does not exist"}), 404

            # Check for existing wishlist entry
            cursor.execute(
                "SELECT id FROM wishlist WHERE user_id = %s AND product_id = %s;",
                (user_id, product_id)
            )
            if cursor.fetchone():
                conn.close()
                return jsonify({"message": "Product is already in your wishlist"}), 200

            # Insert new entry
            cursor.execute(
                "INSERT INTO wishlist (user_id, product_id) VALUES (%s, %s);",
                (user_id, product_id)
            )
            conn.commit()
            new_id = cursor.lastrowid
        conn.close()
        return jsonify({"message": "Item saved to wishlist", "id": new_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@wishlist_bp.route('/wishlist/<int:product_id>', methods=['DELETE'])
@token_required
def remove_from_wishlist(current_user, product_id):
    """
    Remove product from user wishlist
    """
    user_id = current_user['id']
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                "DELETE FROM wishlist WHERE user_id = %s AND product_id = %s;",
                (user_id, product_id)
            )
            conn.commit()
            if cursor.rowcount == 0:
                conn.close()
                return jsonify({"error": "Item not in wishlist"}), 404
        conn.close()
        return jsonify({"message": "Item removed from wishlist"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500