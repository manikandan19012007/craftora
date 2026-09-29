from flask import Blueprint, request, jsonify
from app.utils.db import get_db_connection
from app.middleware.auth import token_required, admin_required

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/products/<int:product_id>/reviews', methods=['GET'])
def get_product_reviews(product_id):
    """
    Get all reviews for a specific product
    """
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            query = """
                SELECT r.id, r.product_id, r.rating, r.review_text, r.created_at,
                       u.id as user_id, u.name as user_name, u.avatar as user_avatar
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                WHERE r.product_id = %s
                ORDER BY r.id DESC;
            """
            cursor.execute(query, (product_id,))
            reviews = cursor.fetchall()
        conn.close()
        return jsonify({"reviews": reviews, "count": len(reviews)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reviews_bp.route('/products/<int:product_id>/reviews', methods=['POST'])
@token_required
def add_product_review(current_user, product_id):
    """
    Submit a review with rating (1-5) and text for a product.
    Automatically recalculates and updates the product average rating in MySQL.
    """
    user_id = current_user['id']
    data = request.get_json() or {}

    rating = data.get('rating')
    review_text = (data.get('review_text') or '').strip()

    if rating is None or not (1 <= int(rating) <= 5):
        return jsonify({"error": "Rating must be an integer between 1 and 5 stars"}), 400

    if not review_text:
        return jsonify({"error": "Review text cannot be empty"}), 400

    rating = int(rating)

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # 1. Verify product exists
            cursor.execute("SELECT id FROM products WHERE id = %s;", (product_id,))
            if not cursor.fetchone():
                conn.close()
                return jsonify({"error": "Product not found"}), 404

            # 2. Insert new review
            cursor.execute(
                """
                INSERT INTO reviews (user_id, product_id, rating, review_text)
                VALUES (%s, %s, %s, %s);
                """,
                (user_id, product_id, rating, review_text)
            )
            review_id = cursor.lastrowid

            # 3. Recalculate average rating for the product
            cursor.execute(
                "SELECT AVG(rating) as avg_rating FROM reviews WHERE product_id = %s;",
                (product_id,)
            )
            res = cursor.fetchone()
            new_avg = round(float(res['avg_rating']), 1) if res and res['avg_rating'] else float(rating)

            cursor.execute(
                "UPDATE products SET rating = %s WHERE id = %s;",
                (new_avg, product_id)
            )

            conn.commit()

        conn.close()
        return jsonify({
            "message": "Review submitted successfully! Thank you for sharing your experience.",
            "review_id": review_id,
            "new_product_rating": new_avg
        }), 201

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500

@reviews_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
@token_required
def delete_review(current_user, review_id):
    """
    Delete a review (Customer can delete their own review; Admin can delete any review)
    """
    user_id = current_user['id']
    is_admin = current_user.get('role') == 'ADMIN'

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT user_id, product_id FROM reviews WHERE id = %s;", (review_id,))
            review = cursor.fetchone()

            if not review:
                conn.close()
                return jsonify({"error": "Review not found"}), 404

            if review['user_id'] != user_id and not is_admin:
                conn.close()
                return jsonify({"error": "You do not have permission to delete this review"}), 403

            product_id = review['product_id']

            cursor.execute("DELETE FROM reviews WHERE id = %s;", (review_id,))

            # Recompute average rating
            cursor.execute(
                "SELECT AVG(rating) as avg_rating FROM reviews WHERE product_id = %s;",
                (product_id,)
            )
            res = cursor.fetchone()
            new_avg = round(float(res['avg_rating']), 1) if res and res['avg_rating'] else 5.0

            cursor.execute(
                "UPDATE products SET rating = %s WHERE id = %s;",
                (new_avg, product_id)
            )

            conn.commit()

        conn.close()
        return jsonify({"message": "Review deleted successfully"}), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500

@reviews_bp.route('/reviews', methods=['GET'])
@token_required
@admin_required
def get_all_reviews_admin(current_user):
    """
    Admin: View all reviews across the platform
    """
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            query = """
                SELECT r.id, r.product_id, r.rating, r.review_text, r.created_at,
                       p.name as product_name, p.image as product_image,
                       u.id as user_id, u.name as user_name, u.email as user_email
                FROM reviews r
                JOIN products p ON r.product_id = p.id
                JOIN users u ON r.user_id = u.id
                ORDER BY r.id DESC;
            """
            cursor.execute(query)
            all_reviews = cursor.fetchall()
        conn.close()
        return jsonify({"reviews": all_reviews, "count": len(all_reviews)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500