from flask import Blueprint, jsonify
from app.utils.db import test_db_connection

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    db_status = test_db_connection()
    return jsonify({
        'status': 'healthy',
        'project': 'Craftora - E-Commerce API',
        'environment': 'development',
        'database': db_status
    }), 200
