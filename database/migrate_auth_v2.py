"""
CRAFTORA: Safe Schema Migration
- Adds `mobile` column to `users` table (if not exists)
- Adds SELLER to the role ENUM (if not already present)
- Adds `user_id` FK column to `artisans` table (links seller accounts to artisan profiles)
- Does NOT delete any existing data
"""
import os
import sys
import pymysql
from dotenv import load_dotenv

load_dotenv()

DB_HOST     = os.getenv('DB_HOST', 'localhost')
DB_PORT     = int(os.getenv('DB_PORT', 3306))
DB_USER     = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME     = os.getenv('DB_NAME', 'craftora_db')

def run_migration():
    print("=" * 55)
    print("  CRAFTORA: Safe DB Migration v2")
    print(f"  Target: {DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}")
    print("=" * 55)

    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        autocommit=True,
        cursorclass=pymysql.cursors.DictCursor
    )

    with conn.cursor() as cursor:

        # 1. Add `mobile` column if not present
        cursor.execute("""
            SELECT COUNT(*) AS cnt
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = %s
              AND TABLE_NAME   = 'users'
              AND COLUMN_NAME  = 'mobile';
        """, (DB_NAME,))
        if cursor.fetchone()['cnt'] == 0:
            cursor.execute("ALTER TABLE users ADD COLUMN mobile VARCHAR(15) DEFAULT NULL AFTER email;")
            print("✓  Added `mobile` column to users table.")
        else:
            print("·  `mobile` column already exists — skipped.")

        # 2. Add SELLER to role ENUM if not already there
        cursor.execute("""
            SELECT COLUMN_TYPE
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = %s
              AND TABLE_NAME   = 'users'
              AND COLUMN_NAME  = 'role';
        """, (DB_NAME,))
        row = cursor.fetchone()
        col_type = row['COLUMN_TYPE'] if row else ''
        if 'SELLER' not in col_type:
            cursor.execute(
                "ALTER TABLE users MODIFY COLUMN role ENUM('USER', 'SELLER', 'ADMIN') DEFAULT 'USER';"
            )
            print("✓  Added SELLER to users.role ENUM.")
        else:
            print("·  SELLER role already in ENUM — skipped.")

        # 3. Add `user_id` FK column to artisans table if not present
        cursor.execute("""
            SELECT COUNT(*) AS cnt
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = %s
              AND TABLE_NAME   = 'artisans'
              AND COLUMN_NAME  = 'user_id';
        """, (DB_NAME,))
        if cursor.fetchone()['cnt'] == 0:
            cursor.execute(
                "ALTER TABLE artisans ADD COLUMN user_id INT DEFAULT NULL AFTER id;"
            )
            cursor.execute(
                "ALTER TABLE artisans ADD CONSTRAINT fk_artisan_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;"
            )
            print("✓  Added `user_id` FK column to artisans table.")
        else:
            print("·  `user_id` column already exists in artisans — skipped.")

    conn.close()
    print("\n✅  Migration completed successfully. No data was deleted.")
    return True


if __name__ == '__main__':
    try:
        success = run_migration()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗  Migration failed: {e}")
        sys.exit(1)
