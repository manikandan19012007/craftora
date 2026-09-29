from flask import Blueprint, request, jsonify
from app.utils.db import get_db_connection

artisans_bp = Blueprint('artisans', __name__)

@artisans_bp.route('/artisans', methods=['GET'])
def get_artisans():
    """
    Retrieve all artisans with their craft specialties and product counts
    """
    craft = request.args.get('craft')
    search = request.args.get('search')

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            query = """
                SELECT a.id, a.name, a.bio, a.specialty, a.location, a.image, 
                       a.experience, a.rating, a.created_at,
                       COUNT(p.id) as product_count
                FROM artisans a
                LEFT JOIN products p ON a.id = p.artisan_id
                WHERE 1=1
            """
            params = []

            if craft and craft != 'All':
                query += " AND a.specialty LIKE %s"
                params.append(f"%{craft}%")

            if search:
                query += " AND (a.name LIKE %s OR a.location LIKE %s OR a.bio LIKE %s)"
                term = f"%{search}%"
                params.extend([term, term, term])

            query += " GROUP BY a.id, a.name, a.bio, a.specialty, a.location, a.image, a.experience, a.rating, a.created_at"
            query += " ORDER BY a.rating DESC, a.name ASC;"

            cursor.execute(query, tuple(params) if params else None)
            artisans = cursor.fetchall()
        conn.close()
        return jsonify({"artisans": artisans}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@artisans_bp.route('/artisans/<int:artisan_id>', methods=['GET'])
def get_artisan_by_id(artisan_id):
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM artisans WHERE id = %s;", (artisan_id,))
            artisan = cursor.fetchone()

            if not artisan:
                conn.close()
                return jsonify({"error": "Artisan not found"}), 404

            # Fetch artisan's products
            cursor.execute(
                """
                SELECT p.*, c.name as category_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.artisan_id = %s
                ORDER BY p.id DESC;
                """,
                (artisan_id,)
            )
            products = cursor.fetchall()
            artisan['products'] = products
            artisan['product_count'] = len(products)
        conn.close()
        return jsonify({"artisan": artisan}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@artisans_bp.route('/artisans', methods=['POST'])
def create_artisan():
    data = request.get_json() or {}
    name = data.get('name')
    specialty = data.get('specialty')
    bio = data.get('bio', '')
    location = data.get('location', '')
    image = data.get('image', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80')
    experience = data.get('experience', '5+ years')

    if not name or not specialty:
        return jsonify({"error": "Name and craft specialty are required"}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO artisans (name, specialty, bio, location, image, experience, rating)
                VALUES (%s, %s, %s, %s, %s, %s, 5.0);
                """,
                (name, specialty, bio, location, image, experience)
            )
            conn.commit()
            new_id = cursor.lastrowid
        conn.close()
        return jsonify({"message": "Artisan profile created", "id": new_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@artisans_bp.route('/artisans/<int:artisan_id>', methods=['PUT'])
def update_artisan(artisan_id):
    data = request.get_json() or {}
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                """
                UPDATE artisans 
                SET name = COALESCE(%s, name),
                    specialty = COALESCE(%s, specialty),
                    bio = COALESCE(%s, bio),
                    location = COALESCE(%s, location),
                    image = COALESCE(%s, image),
                    experience = COALESCE(%s, experience)
                WHERE id = %s;
                """,
                (
                    data.get('name'),
                    data.get('specialty'),
                    data.get('bio'),
                    data.get('location'),
                    data.get('image'),
                    data.get('experience'),
                    artisan_id
                )
            )
            conn.commit()
            if cursor.rowcount == 0:
                conn.close()
                return jsonify({"error": "Artisan not found or no change"}), 404
        conn.close()
        return jsonify({"message": "Artisan profile updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@artisans_bp.route('/artisans/<int:artisan_id>', methods=['DELETE'])
def delete_artisan(artisan_id):
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM artisans WHERE id = %s;", (artisan_id,))
            conn.commit()
            if cursor.rowcount == 0:
                conn.close()
                return jsonify({"error": "Artisan not found"}), 404
        conn.close()
        return jsonify({"message": "Artisan deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500