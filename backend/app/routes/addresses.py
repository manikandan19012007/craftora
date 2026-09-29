import re
from flask import Blueprint, request, jsonify
from app.utils.db import get_db_connection
from app.middleware.auth import token_required

addresses_bp = Blueprint('addresses', __name__)

PHONE_REGEX = re.compile(r'^[6-9]\d{9}$')
PINCODE_REGEX = re.compile(r'^\d{6}$')

@addresses_bp.route('/addresses', methods=['GET'])
@token_required
def get_user_addresses(current_user):
    user_id = current_user['id']
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, full_name, phone, house_street, area_city, state, pincode, 
                       delivery_instructions, is_default, created_at
                FROM user_addresses
                WHERE user_id = %s
                ORDER BY is_default DESC, id DESC;
                """,
                (user_id,)
            )
            addresses = cursor.fetchall()
        conn.close()
        return jsonify({"addresses": addresses}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@addresses_bp.route('/addresses', methods=['POST'])
@token_required
def create_address(current_user):
    user_id = current_user['id']
    data = request.get_json() or {}

    full_name = (data.get('full_name') or '').strip()
    phone = (data.get('phone') or '').strip()
    house_street = (data.get('house_street') or '').strip()
    area_city = (data.get('area_city') or '').strip()
    state = (data.get('state') or '').strip()
    pincode = (data.get('pincode') or '').strip()
    delivery_instructions = (data.get('delivery_instructions') or '').strip()
    is_default = 1 if data.get('is_default') else 0

    if not full_name or not phone or not house_street or not area_city or not state or not pincode:
        return jsonify({"error": "Full Name, Phone, House/Street, City, State, and Pincode are required"}), 400

    if not PHONE_REGEX.match(phone):
        return jsonify({"error": "Invalid 10-digit Indian mobile number (must start with 6-9)"}), 400

    if not PINCODE_REGEX.match(pincode):
        return jsonify({"error": "Invalid 6-digit Indian PIN Code"}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            if is_default:
                cursor.execute("UPDATE user_addresses SET is_default = 0 WHERE user_id = %s", (user_id,))

            cursor.execute(
                """
                INSERT INTO user_addresses 
                (user_id, full_name, phone, house_street, area_city, state, pincode, delivery_instructions, is_default)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
                """,
                (user_id, full_name, phone, house_street, area_city, state, pincode, delivery_instructions, is_default)
            )
            new_id = cursor.lastrowid
            conn.commit()
        conn.close()
        return jsonify({"message": "Delivery address saved successfully", "id": new_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@addresses_bp.route('/addresses/<int:address_id>', methods=['DELETE'])
@token_required
def delete_address(current_user, address_id):
    user_id = current_user['id']
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM user_addresses WHERE id = %s AND user_id = %s;", (address_id, user_id))
            conn.commit()
            if cursor.rowcount == 0:
                conn.close()
                return jsonify({"error": "Address not found"}), 404
        conn.close()
        return jsonify({"message": "Address deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
