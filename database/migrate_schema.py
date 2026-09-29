import os
import sys
import pymysql
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(r'C:\Users\MANIKANDAN G\Documents\WE LAB Project')
load_dotenv(BASE_DIR / '.env')

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', 3307))
DB_USER = os.getenv('DB_USER', 'root')
DB_PASS = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'craftora_db')

def run_migrations():
    print("==================================================")
    print(" CRAFTORA DATABASE MIGRATION SYSTEM")
    print("==================================================")
    
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        autocommit=True
    )
    
    with conn.cursor() as cursor:
        # Helper function to check if column exists
        def add_column_if_missing(table, column, col_def):
            cursor.execute(f"SHOW COLUMNS FROM {table} LIKE %s", (column,))
            if not cursor.fetchone():
                cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {col_def}")
                print(f"  ✓ Added column '{column}' to '{table}' table.")
            else:
                print(f"  - Column '{column}' already exists in '{table}'.")

        print("\n1. Upgrading 'products' table...")
        add_column_if_missing('products', 'is_customizable', 'TINYINT DEFAULT 0')
        add_column_if_missing('products', 'customization_options', 'TEXT DEFAULT NULL')
        add_column_if_missing('products', 'is_made_to_order', 'TINYINT DEFAULT 0')

        print("\n2. Upgrading 'cart_items' table...")
        add_column_if_missing('cart_items', 'selected_color', 'VARCHAR(80) DEFAULT NULL')
        add_column_if_missing('cart_items', 'selected_size', 'VARCHAR(80) DEFAULT NULL')
        add_column_if_missing('cart_items', 'selected_material', 'VARCHAR(80) DEFAULT NULL')
        add_column_if_missing('cart_items', 'custom_text', 'TEXT DEFAULT NULL')
        add_column_if_missing('cart_items', 'customization_payload', 'TEXT DEFAULT NULL')

        # Drop unique constraint on cart_items (cart_id, product_id) if exists to allow multiple variants
        cursor.execute("SHOW INDEX FROM cart_items WHERE Key_name = 'unique_cart_product'")
        if cursor.fetchone():
            try:
                cursor.execute("ALTER TABLE cart_items DROP INDEX unique_cart_product")
                print("  ✓ Dropped strict unique_cart_product constraint to allow variant cart items.")
            except Exception as e:
                print(f"  - Unique index drop info: {e}")

        print("\n3. Upgrading 'orders' table...")
        add_column_if_missing('orders', 'order_code', 'VARCHAR(50) DEFAULT NULL')
        add_column_if_missing('orders', 'full_name', 'VARCHAR(100) DEFAULT NULL')
        add_column_if_missing('orders', 'payment_method', 'VARCHAR(50) DEFAULT "COD"')
        add_column_if_missing('orders', 'payment_service', 'VARCHAR(80) DEFAULT "DEMO_PAYMENT_GATEWAY"')
        add_column_if_missing('orders', 'transaction_id', 'VARCHAR(100) DEFAULT NULL')
        add_column_if_missing('orders', 'delivery_instructions', 'TEXT DEFAULT NULL')
        add_column_if_missing('orders', 'subtotal', 'DECIMAL(10,2) DEFAULT 0.00')
        add_column_if_missing('orders', 'shipping_fee', 'DECIMAL(10,2) DEFAULT 0.00')
        add_column_if_missing('orders', 'customization_fee', 'DECIMAL(10,2) DEFAULT 0.00')

        print("\n4. Upgrading 'order_items' table...")
        add_column_if_missing('order_items', 'selected_color', 'VARCHAR(80) DEFAULT NULL')
        add_column_if_missing('order_items', 'selected_size', 'VARCHAR(80) DEFAULT NULL')
        add_column_if_missing('order_items', 'selected_material', 'VARCHAR(80) DEFAULT NULL')
        add_column_if_missing('order_items', 'custom_text', 'TEXT DEFAULT NULL')
        add_column_if_missing('order_items', 'customization_payload', 'TEXT DEFAULT NULL')
        add_column_if_missing('order_items', 'product_name', 'VARCHAR(180) DEFAULT NULL')
        add_column_if_missing('order_items', 'product_image', 'VARCHAR(255) DEFAULT NULL')
        add_column_if_missing('order_items', 'artisan_id', 'INT DEFAULT NULL')

        print("\n5. Creating 'user_addresses' table if missing...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_addresses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                house_street TEXT NOT NULL,
                area_city VARCHAR(100) NOT NULL,
                state VARCHAR(100) NOT NULL,
                pincode VARCHAR(20) NOT NULL,
                delivery_instructions TEXT,
                is_default TINYINT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        """)
        print("  ✓ 'user_addresses' table created or verified.")

    conn.close()
    print("\n==================================================")
    print(" 🎉 MIGRATION COMPLETED SUCCESSFULLY!")
    print("==================================================")

if __name__ == '__main__':
    run_migrations()
