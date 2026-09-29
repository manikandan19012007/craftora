import os
import sys
from pathlib import Path
import pymysql
from pymysql.cursors import DictCursor
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', 3306))
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'craftora_db')

def init_database():
    print("==================================================")
    print("  CRAFTORA DATABASE INITIALIZER & SEEDER")
    print(f"  Target: {DB_USER}@{DB_HOST}:{DB_PORT}")
    print("==================================================")

    try:
        # Step 1: Connect without database to create if missing
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            autocommit=True
        )
        print("✓ Connected to MySQL Server successfully!")

        with conn.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            print(f"✓ Database '{DB_NAME}' created or verified.")
        conn.close()

        # Step 2: Connect to craftora_db
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            autocommit=True
        )

        base_dir = Path(__file__).resolve().parent

        # Execute schema.sql
        schema_path = base_dir / 'schema.sql'
        if schema_path.exists():
            with open(schema_path, 'r', encoding='utf-8') as f:
                schema_sql = f.read()
            with conn.cursor() as cursor:
                # PyMySQL execute statements
                for statement in schema_sql.split(';'):
                    stmt = statement.strip()
                    if stmt:
                        cursor.execute(stmt)
            print("✓ schema.sql executed successfully (11 tables created).")

        # Execute seed.sql
        seed_path = base_dir / 'seed.sql'
        if seed_path.exists():
            with open(seed_path, 'r', encoding='utf-8') as f:
                seed_sql = f.read()
            with conn.cursor() as cursor:
                for statement in seed_sql.split(';'):
                    stmt = statement.strip()
                    if stmt:
                        cursor.execute(stmt)
            print("✓ seed.sql executed successfully (Artisans, Categories, 30+ Products loaded).")

        # Verify record counts
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) as cnt FROM users;")
            users_cnt = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) as cnt FROM categories;")
            cat_cnt = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) as cnt FROM artisans;")
            art_cnt = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) as cnt FROM products;")
            prod_cnt = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) as cnt FROM reviews;")
            rev_cnt = cursor.fetchone()[0]

            print("--------------------------------------------------")
            print(f"  Summary in '{DB_NAME}':")
            print(f"  - Users:      {users_cnt}")
            print(f"  - Categories: {cat_cnt}")
            print(f"  - Artisans:   {art_cnt}")
            print(f"  - Products:   {prod_cnt}")
            print(f"  - Reviews:    {rev_cnt}")
            print("--------------------------------------------------")

        conn.close()
        return True

    except Exception as e:
        print("\n✗ Failed to initialize MySQL database:")
        print(f"  Error: {e}")
        print("\nPlease ensure:")
        print("  1. MySQL Service (MySQL80) is running.")
        print("  2. DB_PASSWORD in .env matches your MySQL root password.")
        return False

if __name__ == '__main__':
    success = init_database()
    sys.exit(0 if success else 1)