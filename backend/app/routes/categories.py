from flask import Blueprint, request, jsonify
from app.utils.db import get_db_connection

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('/categories', methods=['GET'])
def get_categories():
    """
    Retrieve all product categories with product count
    """
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            query = """
                SELECT c.id, c.name, c.description, c.image, 
                       COUNT(p.id) as product_count
                FROM categories c
                LEFT JOIN products p ON c.id = p.category_id
                GROUP BY c.id, c.name, c.description, c.image
                ORDER BY c.name ASC;
            """
            cursor.execute(query)
            categories = cursor.fetchall()
        conn.close()
        return jsonify({"categories": categories}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@categories_bp.route('/categories/<int:category_id>', methods=['GET'])
def get_category_by_id(category_id):
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM categories WHERE id = %s;", (category_id,))
            category = cursor.fetchone()
        conn.close()
        if not category:
            return jsonify({"error": "Category not found"}), 404
        return jsonify({"category": category}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@categories_bp.route('/categories', methods=['POST'])
def create_category():
    data = request.get_json() or {}
    name = data.get('name')
    description = data.get('description', '')
    image = data.get('image', '')

    if not name:
        return jsonify({"error": "Category name is required"}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO categories (name, description, image) VALUES (%s, %s, %s);",
                (name, description, image)
            )
            conn.commit()
            new_id = cursor.lastrowid
        conn.close()
        return jsonify({"message": "Category created successfully", "id": new_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@categories_bp.route('/categories/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    data = request.get_json() or {}
    name = data.get('name')
    description = data.get('description')
    image = data.get('image')

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM categories WHERE id = %s;", (category_id,))
            if not cursor.fetchone():
                conn.close()
                return jsonify({"error": "Category not found"}), 404

            cursor.execute(
                """
                UPDATE categories 
                SET name = COALESCE(%s, name),
                    description = COALESCE(%s, description),
                    image = COALESCE(%s, image)
                WHERE id = %s;
                """,
                (name, description, image, category_id)
            )
            conn.commit()
        conn.close()
        return jsonify({"message": "Category updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@categories_bp.route('/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM categories WHERE id = %s;", (category_id,))
            conn.commit()
            if cursor.rowcount == 0:
                conn.close()
                return jsonify({"error": "Category not found"}), 404
        conn.close()
        return jsonify({"message": "Category deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500