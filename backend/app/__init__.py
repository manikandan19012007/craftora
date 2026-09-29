from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.routes.health import health_bp
from app.routes.products import products_bp
from app.routes.categories import categories_bp
from app.routes.artisans import artisans_bp
from app.routes.auth import auth_bp
from app.routes.wishlist import wishlist_bp
from app.routes.cart import cart_bp
from app.routes.orders import orders_bp
from app.routes.reviews import reviews_bp
from app.routes.addresses import addresses_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register Blueprints
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(products_bp, url_prefix='/api')
    app.register_blueprint(categories_bp, url_prefix='/api')
    app.register_blueprint(artisans_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(wishlist_bp, url_prefix='/api')
    app.register_blueprint(cart_bp, url_prefix='/api')
    app.register_blueprint(orders_bp, url_prefix='/api')
    app.register_blueprint(reviews_bp, url_prefix='/api')
    app.register_blueprint(addresses_bp, url_prefix='/api')

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Endpoint not found", "status": 404}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal server error", "status": 500}), 500

    return app