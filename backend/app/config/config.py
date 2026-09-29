import os
from dotenv import load_dotenv

# Load root .env
load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'craftora_dev_secret_key_2026')
    DEBUG = os.getenv('FLASK_DEBUG', '1') == '1'
    
    # Database Settings
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'craftora_db')
