from flask import Flask, jsonify, request
from flask_cors import CORS
import cx_Oracle
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database connection configuration
DB_USER = os.getenv('DB_USER', 'student_app1')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'password123')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '1521')
DB_SERVICE = os.getenv('DB_SERVICE', 'XEPDB1')

def get_db_connection():
    dsn = cx_Oracle.makedsn(DB_HOST, DB_PORT, service_name=DB_SERVICE)
    return cx_Oracle.connect(DB_USER, DB_PASSWORD, dsn)

@app.route('/api/books', methods=['GET'])
def get_books():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT b.book_id, b.title, b.publisher, b.year_published, 
                   c.category_name, a.name as author_name
            FROM Books b
            LEFT JOIN Categories c ON b.category_id = c.category_id
            LEFT JOIN Authors a ON b.author_id = a.author_id
        """)
        columns = [col[0] for col in cursor.description]
        books = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return jsonify(books)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/authors', methods=['GET'])
def get_authors():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT author_id, name, bio FROM Authors")
        columns = [col[0] for col in cursor.description]
        authors = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return jsonify(authors)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/reviews', methods=['GET'])
def get_reviews():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT r.review_id, r.content, r.rating, u.username, b.title
            FROM Reviews r
            JOIN Users u ON r.user_id = u.user_id
            JOIN Books b ON r.book_id = b.book_id
        """)
        columns = [col[0] for col in cursor.description]
        reviews = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return jsonify(reviews)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/reading-lists', methods=['GET'])
def get_reading_lists():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT rl.list_id, u.username, b.title, rl.status
            FROM ReadingList rl
            JOIN Users u ON rl.user_id = u.user_id
            JOIN Books b ON rl.book_id = b.book_id
        """)
        columns = [col[0] for col in cursor.description]
        reading_lists = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return jsonify(reading_lists)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000) 