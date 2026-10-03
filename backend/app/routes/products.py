from flask import Blueprint, request, jsonify
from app.utils.db import get_db_connection

products_bp = Blueprint('products', __name__)

@products_bp.route('/products', methods=['GET'])
def get_products():
    """
    Search, filter, sort, and paginate products from MySQL
    """
    category = request.args.get('category')
    search = request.args.get('search')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    min_rating = request.args.get('min_rating', type=float)
    material = request.args.get('material')
    availability = request.args.get('availability') # 'in-stock', 'out-of-stock', 'made-to-order'
    artisan_id = request.args.get('artisan_id', type=int)
    sort_by = request.args.get('sort_by', 'popular') # 'popular', 'highest-rated', 'newest', 'price-low', 'price-high'

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            query = """
                SELECT p.id, p.name, p.description, p.price, p.image, 
                       p.material, p.dimensions, p.care_instructions, 
                       p.stock_quantity, p.rating, p.created_at,
                       p.is_customizable, p.customization_options, p.is_made_to_order,
                       p.category_id, c.name as category_name,
                       p.artisan_id, a.name as artisan_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN artisans a ON p.artisan_id = a.id
                WHERE 1=1
            """
            params = []

            if category and category != 'All':
                query += " AND c.name = %s"
                params.append(category)

            if material and material != 'All':
                query += " AND p.material LIKE %s"
                params.append(f"%{material}%")

            if artisan_id:
                query += " AND (p.artisan_id = %s OR a.user_id = %s)"
                params.extend([artisan_id, artisan_id])

            if search:
                query += " AND (p.name LIKE %s OR c.name LIKE %s OR a.name LIKE %s OR p.description LIKE %s OR p.material LIKE %s)"
                term = f"%{search}%"
                params.extend([term, term, term, term, term])

            if min_price is not None:
                query += " AND p.price >= %s"
                params.append(min_price)

            if max_price is not None:
                query += " AND p.price <= %s"
                params.append(max_price)

            if min_rating is not None:
                query += " AND p.rating >= %s"
                params.append(min_rating)

            if availability == 'in-stock':
                query += " AND (p.stock_quantity > 0 OR p.is_made_to_order = 1)"
            elif availability == 'out-of-stock':
                query += " AND p.stock_quantity <= 0 AND (p.is_made_to_order = 0 OR p.is_made_to_order IS NULL)"
            elif availability == 'made-to-order':
                query += " AND p.is_made_to_order = 1"

            # Sorting
            if sort_by == 'highest-rated':
                query += " ORDER BY p.rating DESC"
            elif sort_by == 'price-low':
                query += " ORDER BY p.price ASC"
            elif sort_by == 'price-high':
                query += " ORDER BY p.price DESC"
            elif sort_by == 'newest':
                query += " ORDER BY p.id DESC"
            else: # popular
                query += " ORDER BY p.rating DESC, p.stock_quantity DESC"

            cursor.execute(query, tuple(params) if params else None)
            products = cursor.fetchall()

        conn.close()
        return jsonify({
            "products": products,
            "total": len(products)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@products_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product_by_id(product_id):
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            query = """
                SELECT p.*, 
                       c.name as category_name,
                       a.name as artisan_name, a.location as artisan_location,
                       a.specialty as artisan_specialty, a.image as artisan_image,
                       a.experience as artisan_experience, a.bio as artisan_bio
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN artisans a ON p.artisan_id = a.id
                WHERE p.id = %s;
            """
            cursor.execute(query, (product_id,))
            product = cursor.fetchone()

            if not product:
                conn.close()
                return jsonify({"error": "Product not found"}), 404

            # Fetch product reviews
            cursor.execute(
                """
                SELECT r.id, r.rating, r.review_text, r.created_at,
                       u.name as user_name, u.avatar as user_avatar
                FROM reviews r
                LEFT JOIN users u ON r.user_id = u.id
                WHERE r.product_id = %s
                ORDER BY r.id DESC;
                """,
                (product_id,)
            )
            reviews = cursor.fetchall()
            product['reviews'] = reviews

        conn.close()
        return jsonify({"product": product}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@products_bp.route('/products', methods=['POST'])
def create_product():
    data = request.get_json() or {}
    name = data.get('name')
    price = data.get('price')
    category_id = data.get('category_id')
    category_name = data.get('category_name')
    artisan_id = data.get('artisan_id', 1)
    description = data.get('description', 'Handcrafted creation directly made in an artisan workshop.')
    image = data.get('image', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80')
    material = data.get('material', 'Natural Handcrafted Material')
    dimensions = data.get('dimensions', 'Standard')
    care_instructions = data.get('care_instructions', 'Wipe gently with clean dry cloth.')
    stock_quantity = data.get('stock_quantity', 1)
    is_customizable = 1 if data.get('is_customizable', True) else 0
    is_made_to_order = 1 if data.get('is_made_to_order', False) else 0

    if not name or price is None:
        return jsonify({"error": "name and price are required"}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # Resolve category_id if name provided
            if not category_id and category_name:
                cursor.execute("SELECT id FROM categories WHERE name LIKE %s LIMIT 1;", (f"%{category_name}%",))
                cat_row = cursor.fetchone()
                if cat_row:
                    category_id = cat_row['id']
                else:
                    category_id = 1
            elif not category_id:
                category_id = 1

            cursor.execute(
                """
                INSERT INTO products 
                (name, price, category_id, artisan_id, description, image, material, dimensions, care_instructions, stock_quantity, rating, is_customizable, is_made_to_order)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 5.0, %s, %s);
                """,
                (name, price, category_id, artisan_id, description, image, material, dimensions, care_instructions, stock_quantity, is_customizable, is_made_to_order)
            )
            conn.commit()
            new_id = cursor.lastrowid
        conn.close()
        return jsonify({"message": "Product created successfully", "id": new_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

import json

@products_bp.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.get_json() or {}
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM products WHERE id = %s;", (product_id,))
            if not cursor.fetchone():
                conn.close()
                return jsonify({"error": "Product not found"}), 404

            cust_opt = data.get('customization_options')
            if cust_opt is not None and not isinstance(cust_opt, str):
                cust_opt = json.dumps(cust_opt)

            cursor.execute(
                """
                UPDATE products
                SET name = COALESCE(%s, name),
                    price = COALESCE(%s, price),
                    category_id = COALESCE(%s, category_id),
                    artisan_id = COALESCE(%s, artisan_id),
                    description = COALESCE(%s, description),
                    image = COALESCE(%s, image),
                    material = COALESCE(%s, material),
                    dimensions = COALESCE(%s, dimensions),
                    care_instructions = COALESCE(%s, care_instructions),
                    stock_quantity = COALESCE(%s, stock_quantity),
                    is_made_to_order = COALESCE(%s, is_made_to_order),
                    is_customizable = COALESCE(%s, is_customizable),
                    customization_options = COALESCE(%s, customization_options)
                WHERE id = %s;
                """,
                (
                    data.get('name'),
                    data.get('price'),
                    data.get('category_id'),
                    data.get('artisan_id'),
                    data.get('description'),
                    data.get('image'),
                    data.get('material'),
                    data.get('dimensions'),
                    data.get('care_instructions'),
                    data.get('stock_quantity'),
                    data.get('is_made_to_order'),
                    data.get('is_customizable'),
                    cust_opt,
                    product_id
                )
            )
            conn.commit()
        conn.close()
        return jsonify({"message": "Product updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@products_bp.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM products WHERE id = %s;", (product_id,))
            conn.commit()
            if cursor.rowcount == 0:
                conn.close()
                return jsonify({"error": "Product not found"}), 404
        conn.close()
        return jsonify({"message": "Product deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500