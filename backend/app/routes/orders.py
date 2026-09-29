import re
import json
import uuid
import datetime
from flask import Blueprint, request, jsonify
from app.utils.db import get_db_connection
from app.middleware.auth import token_required, admin_required
from app.services.payment_service import PaymentService

orders_bp = Blueprint('orders', __name__)

PHONE_REGEX = re.compile(r'^[6-9]\d{9}$')
PINCODE_REGEX = re.compile(r'^\d{6}$')

@orders_bp.route('/orders', methods=['POST'])
@token_required
def create_order(current_user):
    """
    Execute full e-commerce checkout with ACID Database Transaction & Payment Verification
    """
    user_id = current_user['id']
    data = request.get_json() or {}

    full_name = (data.get('full_name') or current_user.get('name') or '').strip()
    shipping_address = (data.get('shipping_address') or data.get('house_street') or '').strip()
    city = (data.get('city') or data.get('area_city') or '').strip()
    state = (data.get('state') or '').strip()
    pincode = (data.get('pincode') or '').strip()
    phone = (data.get('phone') or '').strip()
    delivery_instructions = (data.get('delivery_instructions') or '').strip()
    
    payment_method = (data.get('payment_method') or 'COD').upper()
    payment_details = data.get('payment_details') or {}

    # 1. Address Validation
    if not full_name or not shipping_address or not city or not state or not pincode or not phone:
        return jsonify({"error": "Please provide complete delivery details (Full Name, Address, City, State, Pincode, Phone)"}), 400

    if not PHONE_REGEX.match(phone):
        return jsonify({"error": "Invalid 10-digit Indian mobile number (must start with 6-9)"}), 400

    if not PINCODE_REGEX.match(pincode):
        return jsonify({"error": "Invalid 6-digit Indian PIN Code"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cart_items = []
            buy_now = data.get('buy_now_item')

            if buy_now:
                product_id = buy_now.get('product_id')
                cursor.execute(
                    """
                    SELECT name, price, image, stock_quantity, is_made_to_order, artisan_id, category_id
                    FROM products WHERE id = %s;
                    """,
                    (product_id,)
                )
                prod = cursor.fetchone()
                if not prod:
                    conn.close()
                    return jsonify({"error": "Product not found"}), 404

                cust_fee = float(buy_now.get('customization_fee') or 0.0)
                cust_payload = json.dumps({"customization_fee": cust_fee}) if cust_fee > 0 else None

                cart_items = [{
                    'cart_item_id': None,
                    'product_id': product_id,
                    'quantity': int(buy_now.get('quantity', 1)),
                    'selected_color': buy_now.get('selected_color'),
                    'selected_size': buy_now.get('selected_size'),
                    'selected_material': buy_now.get('selected_material'),
                    'custom_text': buy_now.get('custom_text'),
                    'customization_payload': cust_payload,
                    'name': prod['name'],
                    'price': float(buy_now.get('price') or prod['price']),
                    'image': buy_now.get('image') or prod['image'],
                    'stock_quantity': prod['stock_quantity'],
                    'is_made_to_order': prod['is_made_to_order'],
                    'artisan_id': prod['artisan_id']
                }]
            else:
                # Fetch current user cart items
                query = """
                    SELECT ci.id as cart_item_id, ci.product_id, ci.quantity,
                           ci.selected_color, ci.selected_size, ci.selected_material,
                           ci.custom_text, ci.customization_payload,
                           p.name, p.price, p.image, p.stock_quantity, p.is_made_to_order, p.artisan_id
                    FROM cart_items ci
                    JOIN cart c ON ci.cart_id = c.id
                    JOIN products p ON ci.product_id = p.id
                    WHERE c.user_id = %s;
                """
                cursor.execute(query, (user_id,))
                cart_items = cursor.fetchall()

            if not cart_items:
                conn.close()
                return jsonify({"error": "Your cart is empty. Please add items before checking out"}), 400

            # 3. Validate stock & backend total calculation
            subtotal = 0.0
            customization_fee_total = 0.0

            for item in cart_items:
                if not item['is_made_to_order'] and item['quantity'] > item['stock_quantity']:
                    conn.rollback()
                    conn.close()
                    return jsonify({
                        "error": f"Insufficient stock for '{item['name']}'. Only {item['stock_quantity']} available."
                    }), 400

                unit_price = float(item['price'])
                custom_fee = 0.0
                if item['customization_payload']:
                    try:
                        p_data = json.loads(item['customization_payload'])
                        if isinstance(p_data, dict):
                            custom_fee = float(p_data.get('customization_fee', 0.0))
                    except Exception:
                        pass

                subtotal += unit_price * item['quantity']
                customization_fee_total += custom_fee * item['quantity']

            items_total = subtotal + customization_fee_total
            shipping_fee = 0.0 if (items_total >= 1000 or items_total == 0) else 99.0
            total_amount = round(items_total + shipping_fee, 2)

            # 4. Payment Gateway Verification via PaymentService abstraction
            payment_res = PaymentService.process_payment(
                order_id=None,
                amount=total_amount,
                payment_method=payment_method,
                payment_details=payment_details
            )

            if not payment_res.get('success'):
                conn.rollback()
                conn.close()
                return jsonify({"error": f"Payment verification failed: {payment_res.get('message')}"}), 400

            order_code = f"ORD-{datetime.date.today().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

            # 5. Insert into orders table
            cursor.execute(
                """
                INSERT INTO orders 
                (user_id, order_code, full_name, total_amount, subtotal, shipping_fee, customization_fee,
                 shipping_address, city, state, pincode, phone, delivery_instructions,
                 order_status, payment_status, payment_method, payment_service, transaction_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Confirmed', %s, %s, %s, %s);
                """,
                (
                    user_id, order_code, full_name, total_amount, subtotal, shipping_fee, customization_fee_total,
                    shipping_address, city, state, pincode, phone, delivery_instructions,
                    payment_res['payment_status'], payment_method, payment_res['payment_service'], payment_res['transaction_id']
                )
            )
            order_id = cursor.lastrowid

            # 6. Insert Order Items & Deduct Inventory Stock
            for item in cart_items:
                cursor.execute(
                    """
                    INSERT INTO order_items 
                    (order_id, product_id, artisan_id, product_name, product_image, quantity, price,
                     selected_color, selected_size, selected_material, custom_text, customization_payload)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                    """,
                    (
                        order_id, item['product_id'], item['artisan_id'], item['name'], item['image'],
                        item['quantity'], item['price'], item['selected_color'], item['selected_size'],
                        item['selected_material'], item['custom_text'], item['customization_payload']
                    )
                )

                if not item['is_made_to_order']:
                    cursor.execute(
                        """
                        UPDATE products 
                        SET stock_quantity = GREATEST(0, stock_quantity - %s) 
                        WHERE id = %s;
                        """,
                        (item['quantity'], item['product_id'])
                    )

            # 7. Clear user cart items
            cursor.execute(
                """
                DELETE ci FROM cart_items ci
                JOIN cart c ON ci.cart_id = c.id
                WHERE c.user_id = %s;
                """,
                (user_id,)
            )

            # Commit the atomic transaction
            conn.commit()

        conn.close()
        return jsonify({
            "message": "Order placed successfully! Thank you for supporting master Indian artisans.",
            "order_id": order_id,
            "order_code": order_code,
            "total_amount": total_amount,
            "order_status": "Confirmed",
            "payment_status": payment_res['payment_status'],
            "transaction_id": payment_res['transaction_id']
        }), 201

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": f"Checkout failed: {str(e)}"}), 500

@orders_bp.route('/orders', methods=['GET'])
@token_required
def get_user_orders(current_user):
    user_id = current_user['id']
    status_filter = request.args.get('status')

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            query = """
                SELECT id, order_code, full_name, total_amount, subtotal, shipping_fee, customization_fee,
                       shipping_address, city, state, pincode, phone, delivery_instructions,
                       order_status, payment_status, payment_method, payment_service, transaction_id, created_at
                FROM orders
                WHERE user_id = %s
            """
            params = [user_id]

            if status_filter and status_filter != 'All':
                query += " AND order_status = %s"
                params.append(status_filter)

            query += " ORDER BY id DESC;"

            cursor.execute(query, tuple(params))
            orders = cursor.fetchall()

            for order in orders:
                cursor.execute(
                    """
                    SELECT oi.id, oi.product_id, oi.quantity, oi.price,
                           oi.selected_color, oi.selected_size, oi.selected_material, 
                           oi.custom_text, oi.customization_payload,
                           COALESCE(oi.product_name, p.name) as name, 
                           COALESCE(oi.product_image, p.image) as image,
                           c.name as category_name, a.name as artisan_name
                    FROM order_items oi
                    LEFT JOIN products p ON oi.product_id = p.id
                    LEFT JOIN categories c ON p.category_id = c.id
                    LEFT JOIN artisans a ON oi.artisan_id = a.id OR p.artisan_id = a.id
                    WHERE oi.order_id = %s;
                    """,
                    (order['id'],)
                )
                order['items'] = cursor.fetchall()

        conn.close()
        return jsonify({"orders": orders}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@orders_bp.route('/orders/<int:order_id>', methods=['GET'])
@token_required
def get_order_by_id(current_user, order_id):
    user_id = current_user['id']
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT o.*, u.name as customer_name, u.email as customer_email
                FROM orders o
                JOIN users u ON o.user_id = u.id
                WHERE o.id = %s;
                """,
                (order_id,)
            )
            order = cursor.fetchone()

            if not order:
                conn.close()
                return jsonify({"error": "Order not found"}), 404

            # Authorization check
            if order['user_id'] != user_id and current_user.get('role') != 'ADMIN':
                conn.close()
                return jsonify({"error": "Access denied"}), 403

            cursor.execute(
                """
                SELECT oi.*, 
                       COALESCE(oi.product_name, p.name) as name, 
                       COALESCE(oi.product_image, p.image) as image,
                       c.name as category_name, a.name as artisan_name
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN artisans a ON oi.artisan_id = a.id OR p.artisan_id = a.id
                WHERE oi.order_id = %s;
                """,
                (order_id,)
            )
            order['items'] = cursor.fetchall()

        conn.close()
        return jsonify({"order": order}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@orders_bp.route('/orders/<int:order_id>/cancel', methods=['PUT'])
@token_required
def cancel_order(current_user, order_id):
    """
    Allow buyer to cancel order if status is Pending or Confirmed. Restores product stock inside transaction.
    """
    user_id = current_user['id']
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, user_id, order_status FROM orders WHERE id = %s;", (order_id,))
            order = cursor.fetchone()

            if not order:
                conn.close()
                return jsonify({"error": "Order not found"}), 404

            if order['user_id'] != user_id and current_user.get('role') != 'ADMIN':
                conn.close()
                return jsonify({"error": "Access denied"}), 403

            if order['order_status'] not in ['Pending', 'Confirmed']:
                conn.close()
                return jsonify({"error": f"Cannot cancel order with status '{order['order_status']}'"}), 400

            # 1. Update order status
            cursor.execute("UPDATE orders SET order_status = 'Cancelled' WHERE id = %s;", (order_id,))

            # 2. Restore stock for order items
            cursor.execute("SELECT product_id, quantity FROM order_items WHERE order_id = %s;", (order_id,))
            items = cursor.fetchall()
            for item in items:
                cursor.execute(
                    "UPDATE products SET stock_quantity = stock_quantity + %s WHERE id = %s;",
                    (item['quantity'], item['product_id'])
                )

            conn.commit()

        conn.close()
        return jsonify({"message": f"Order #{order_id} has been cancelled successfully.", "order_status": "Cancelled"}), 200

    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500

@orders_bp.route('/orders/seller', methods=['GET'])
@token_required
def get_seller_orders(current_user):
    """
    Retrieve orders containing products crafted by or assigned to the artisan seller
    """
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            query = """
                SELECT DISTINCT o.id, o.order_code, o.full_name, o.total_amount, 
                       o.shipping_address, o.city, o.state, o.pincode, o.phone,
                       o.order_status, o.payment_status, o.payment_method, o.created_at,
                       u.name as customer_name, u.email as customer_email
                FROM orders o
                JOIN order_items oi ON o.id = oi.order_id
                JOIN users u ON o.user_id = u.id
                ORDER BY o.id DESC;
            """
            cursor.execute(query)
            orders = cursor.fetchall()

            for order in orders:
                cursor.execute(
                    """
                    SELECT oi.id, oi.product_id, oi.quantity, oi.price,
                           oi.selected_color, oi.selected_size, oi.custom_text, oi.customization_payload,
                           COALESCE(oi.product_name, p.name) as name, 
                           COALESCE(oi.product_image, p.image) as image,
                           a.name as artisan_name
                    FROM order_items oi
                    LEFT JOIN products p ON oi.product_id = p.id
                    LEFT JOIN artisans a ON oi.artisan_id = a.id OR p.artisan_id = a.id
                    WHERE oi.order_id = %s;
                    """,
                    (order['id'],)
                )
                order['items'] = cursor.fetchall()

        conn.close()
        return jsonify({"orders": orders}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@orders_bp.route('/orders/all', methods=['GET'])
@token_required
@admin_required
def get_all_orders_admin(current_user):
    """
    Retrieve all orders across all buyers (Admin only)
    """
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            query = """
                SELECT o.id, o.order_code, o.full_name, o.total_amount, 
                       o.shipping_address, o.city, o.state, o.pincode, o.phone,
                       o.order_status, o.payment_status, o.payment_method, o.created_at,
                       u.name as customer_name, u.email as customer_email
                FROM orders o
                JOIN users u ON o.user_id = u.id
                ORDER BY o.id DESC;
            """
            cursor.execute(query)
            orders = cursor.fetchall()

            for order in orders:
                cursor.execute(
                    """
                    SELECT oi.id, oi.product_id, oi.quantity, oi.price,
                           oi.selected_color, oi.selected_size, oi.custom_text,
                           COALESCE(oi.product_name, p.name) as name, 
                           COALESCE(oi.product_image, p.image) as image
                    FROM order_items oi
                    LEFT JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id = %s;
                    """,
                    (order['id'],)
                )
                order['items'] = cursor.fetchall()

        conn.close()
        return jsonify({"orders": orders}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@orders_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@token_required
def update_order_status(current_user, order_id):
    data = request.get_json() or {}
    new_status = data.get('order_status')

    valid_statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']
    if new_status not in valid_statuses:
        return jsonify({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("UPDATE orders SET order_status = %s WHERE id = %s;", (new_status, order_id))
            conn.commit()
            if cursor.rowcount == 0:
                conn.close()
                return jsonify({"error": "Order not found"}), 404
        conn.close()
        return jsonify({"message": f"Order #{order_id} status updated to '{new_status}'"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500