import json
from flask import Blueprint, request, jsonify
from app.utils.db import get_db_connection
from app.middleware.auth import token_required

cart_bp = Blueprint('cart', __name__)

def get_or_create_user_cart_id(cursor, user_id):
    cursor.execute("SELECT id FROM cart WHERE user_id = %s;", (user_id,))
    row = cursor.fetchone()
    if row:
        return row['id']
    cursor.execute("INSERT INTO cart (user_id) VALUES (%s);", (user_id,))
    return cursor.lastrowid

@cart_bp.route('/cart', methods=['GET'])
@token_required
def get_cart(current_user):
    """
    Get all items in user shopping cart with variant details, custom text, and price calculations
    """
    user_id = current_user['id']
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cart_id = get_or_create_user_cart_id(cursor, user_id)
            conn.commit()

            query = """
                SELECT ci.id as cart_item_id, ci.quantity, 
                       ci.selected_color, ci.selected_size, ci.selected_material, 
                       ci.custom_text, ci.customization_payload,
                       p.id as product_id, p.name, p.price, p.image, 
                       p.stock_quantity, p.is_made_to_order, p.is_customizable,
                       c.name as category_name, a.name as artisan_name
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN artisans a ON p.artisan_id = a.id
                WHERE ci.cart_id = %s
                ORDER BY ci.id DESC;
            """
            cursor.execute(query, (cart_id,))
            items = cursor.fetchall()

        conn.close()

        subtotal = 0.0
        customization_fee_total = 0.0
        total_items = 0

        for item in items:
            unit_price = float(item['price'])
            item_custom_fee = 0.0

            # Parse customization payload if present
            if item['customization_payload']:
                try:
                    payload = json.loads(item['customization_payload'])
                    if isinstance(payload, dict):
                        item_custom_fee = float(payload.get('customization_fee', 0.0))
                except Exception:
                    pass

            item['unit_price'] = unit_price
            item['customization_fee'] = item_custom_fee
            item['effective_unit_price'] = unit_price + item_custom_fee
            item['item_total'] = round((unit_price + item_custom_fee) * item['quantity'], 2)

            subtotal += unit_price * item['quantity']
            customization_fee_total += item_custom_fee * item['quantity']
            total_items += item['quantity']

        overall_items_total = subtotal + customization_fee_total
        shipping_fee = 0.0 if (overall_items_total >= 1000 or total_items == 0) else 99.0
        grand_total = overall_items_total + shipping_fee

        return jsonify({
            "items": items,
            "subtotal": round(subtotal, 2),
            "customization_fee": round(customization_fee_total, 2),
            "shipping_fee": shipping_fee,
            "grand_total": round(grand_total, 2),
            "total_items_count": total_items
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cart_bp.route('/cart', methods=['POST'])
@token_required
def add_to_cart(current_user):
    """
    Add a product to cart. Variant/customization options differentiate items.
    """
    user_id = current_user['id']
    data = request.get_json() or {}
    product_id = data.get('product_id')
    quantity = int(data.get('quantity', 1))
    
    selected_color = data.get('selected_color') or data.get('color') or None
    selected_size = data.get('selected_size') or data.get('size') or None
    selected_material = data.get('selected_material') or None
    custom_text = (data.get('custom_text') or data.get('personalized_text') or '').strip() or None
    
    customization_payload = data.get('customization_payload') or data.get('customization')
    if isinstance(customization_payload, dict):
        customization_payload_str = json.dumps(customization_payload)
    else:
        customization_payload_str = customization_payload or None

    if not product_id or quantity <= 0:
        return jsonify({"error": "Valid product_id and quantity (> 0) required"}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # 1. Fetch available product stock
            cursor.execute("SELECT id, name, stock_quantity, is_made_to_order, price FROM products WHERE id = %s;", (product_id,))
            product = cursor.fetchone()
            if not product:
                conn.close()
                return jsonify({"error": "Product not found"}), 404

            available_stock = product['stock_quantity']
            is_made_to_order = product['is_made_to_order']

            if available_stock <= 0 and not is_made_to_order:
                conn.close()
                return jsonify({"error": f"Sorry, '{product['name']}' is currently out of stock"}), 400

            cart_id = get_or_create_user_cart_id(cursor, user_id)

            # 2. Match exact variant in cart
            query_find = """
                SELECT id, quantity FROM cart_items 
                WHERE cart_id = %s AND product_id = %s
                  AND (selected_color <=> %s)
                  AND (selected_size <=> %s)
                  AND (custom_text <=> %s);
            """
            cursor.execute(query_find, (cart_id, product_id, selected_color, selected_size, custom_text))
            existing_item = cursor.fetchone()

            if existing_item:
                new_qty = existing_item['quantity'] + quantity
                if not is_made_to_order and new_qty > available_stock:
                    conn.close()
                    return jsonify({
                        "error": f"Cannot add {quantity} more. Maximum available stock is {available_stock} (You have {existing_item['quantity']} in cart)"
                    }), 400

                cursor.execute(
                    "UPDATE cart_items SET quantity = %s, customization_payload = %s WHERE id = %s;",
                    (new_qty, customization_payload_str, existing_item['id'])
                )
            else:
                if not is_made_to_order and quantity > available_stock:
                    conn.close()
                    return jsonify({
                        "error": f"Requested quantity exceeds available stock of {available_stock}"
                    }), 400

                cursor.execute(
                    """
                    INSERT INTO cart_items 
                    (cart_id, product_id, quantity, selected_color, selected_size, selected_material, custom_text, customization_payload)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
                    """,
                    (cart_id, product_id, quantity, selected_color, selected_size, selected_material, custom_text, customization_payload_str)
                )

            conn.commit()
        conn.close()
        return jsonify({"message": f"Added '{product['name']}' to cart successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cart_bp.route('/cart/<int:item_id>', methods=['PUT'])
@token_required
def update_cart_item(current_user, item_id):
    user_id = current_user['id']
    data = request.get_json() or {}
    new_quantity = int(data.get('quantity', 1))
    custom_text = data.get('custom_text')

    if new_quantity <= 0:
        return jsonify({"error": "Quantity must be at least 1"}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            query = """
                SELECT ci.id, ci.cart_id, ci.product_id, p.name, p.stock_quantity, p.is_made_to_order
                FROM cart_items ci
                JOIN cart c ON ci.cart_id = c.id
                JOIN products p ON ci.product_id = p.id
                WHERE ci.id = %s AND c.user_id = %s;
            """
            cursor.execute(query, (item_id, user_id))
            item = cursor.fetchone()

            if not item:
                conn.close()
                return jsonify({"error": "Cart item not found"}), 404

            if not item['is_made_to_order'] and new_quantity > item['stock_quantity']:
                conn.close()
                return jsonify({
                    "error": f"Only {item['stock_quantity']} units of '{item['name']}' available"
                }), 400

            if custom_text is not None:
                cursor.execute(
                    "UPDATE cart_items SET quantity = %s, custom_text = %s WHERE id = %s;",
                    (new_quantity, custom_text.strip(), item_id)
                )
            else:
                cursor.execute(
                    "UPDATE cart_items SET quantity = %s WHERE id = %s;",
                    (new_quantity, item_id)
                )

            conn.commit()

        conn.close()
        return jsonify({"message": "Cart item updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cart_bp.route('/cart/<int:item_id>', methods=['DELETE'])
@token_required
def remove_cart_item(current_user, item_id):
    user_id = current_user['id']
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            query = """
                DELETE ci FROM cart_items ci
                JOIN cart c ON ci.cart_id = c.id
                WHERE ci.id = %s AND c.user_id = %s;
            """
            cursor.execute(query, (item_id, user_id))
            conn.commit()
            if cursor.rowcount == 0:
                conn.close()
                return jsonify({"error": "Cart item not found"}), 404

        conn.close()
        return jsonify({"message": "Item removed from cart"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500