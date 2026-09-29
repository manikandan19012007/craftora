import pymysql
from pymysql.cursors import DictCursor
from flask import current_app

def get_db_connection(database=True):
    '''
    Returns a PyMySQL connection using current Flask app configuration.
    database=False allows connecting to server to run CREATE DATABASE queries.
    '''
    config = current_app.config
    return pymysql.connect(
        host=config['DB_HOST'],
        port=config['DB_PORT'],
        user=config['DB_USER'],
        password=config['DB_PASSWORD'],
        database=config['DB_NAME'] if database else None,
        cursorclass=DictCursor,
        autocommit=False
    )

def test_db_connection():
    '''
    Quick non-throwing check for database readiness.
    '''
    try:
        conn = get_db_connection(database=False)
        with conn.cursor() as cursor:
            cursor.execute('SELECT VERSION() as version;')
            res = cursor.fetchone()
        conn.close()
        return {'connected': True, 'version': res.get('version', 'unknown')}
    except Exception as e:
        return {'connected': False, 'error': str(e)}
