import sys
from pathlib import Path

# Add backend directory to path so app package can be imported directly
backend_dir = Path(__file__).resolve().parent / 'backend'
sys.path.insert(0, str(backend_dir))

from app import create_app

app = create_app()

if __name__ == '__main__':
    print("==================================================")
    print("  Craftora Backend Server running on http://127.0.0.1:5000")
    print("  Health check endpoint: http://127.0.0.1:5000/api/health")
    print("==================================================")
    app.run(host='127.0.0.1', port=5000, debug=True)
