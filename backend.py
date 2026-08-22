import os
import json
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
openai.api_key = OPENAI_API_KEY
DB_PATH = 'asistente.db'

# Initialize database
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS items (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            original_text TEXT NOT NULL,
            type TEXT,
            when_type TEXT,
            date TEXT,
            project TEXT,
            status TEXT DEFAULT 'active',
            source TEXT,
            ai_confidence REAL,
            created_at TEXT,
            completed INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# ===== INTERPRETATION LOGIC =====

def parse_when(text):
    """Parse temporal references from Spanish text"""
    lower = text.lower()

    if 'hoy' in lower:
        return 'hoy'
    if 'mañana' in lower:
        return 'manana'
    if 'esta semana' in lower or 'ésta semana' in lower:
        return 'esta-semana'
    if 'próxima semana' in lower or 'proxima semana' in lower:
        return 'proxima-semana'

    # Day + number (ej: "lunes 24")
    import re
    day_match = re.search(r'(lunes|martes|miércoles|jueves|viernes|sábado|domingo)\s+(\d{1,2})', text, re.IGNORECASE)
    if day_match:
        return f"{day_match.group(1)}-{day_match.group(2)}"

    return None

def extract_project(text):
    """Extract project from text"""
    projects = ['Costa Rica', 'EMCA', 'Residencia', 'Blog', 'CAPE',
                'Salud Pública', 'Casa', 'Personal', 'Consulta']
    for proj in projects:
        if proj.lower() in text.lower():
            return proj
    return None

def interpret_with_ai(text, timezone='Atlantic/Canary'):
    """Use OpenAI to interpret the text"""
    prompt = f"""
    Interpreta este texto en español y extrae:
    - type: 'task', 'reminder', 'event', 'idea', 'note'
    - title: versión corta y clara
    - temporal: 'hoy', 'mañana', 'esta-semana', 'proxima-semana', 'algún-día' o null
    - project: si se menciona algún proyecto
    - confidence: 0.0 a 1.0

    Responde SOLO en JSON válido, sin markdown.

    Texto: "{text}"
    Timezone: {timezone}

    Devuelve exactamente esto:
    {{"type": "...", "title": "...", "temporal": "...", "project": "...", "confidence": 0.9}}
    """

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=200
        )

        result_text = response.choices[0].message['content'].strip()

        # Parse JSON
        result = json.loads(result_text)
        return result
    except Exception as e:
        print(f"AI Error: {e}")
        # Fallback: basic parsing
        return {
            "type": "task",
            "title": text[:50],
            "temporal": parse_when(text),
            "project": extract_project(text),
            "confidence": 0.5
        }

# ===== DATABASE OPERATIONS =====

def add_item(title, original_text, item_type, when_type=None, date=None, project=None, source='siri', confidence=0.9):
    """Add item to database"""
    item_id = str(int(datetime.now().timestamp() * 1000))

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO items (id, title, original_text, type, when_type, date, project, source, ai_confidence, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (item_id, title, original_text, item_type, when_type, date, project, source, confidence, datetime.now().isoformat()))
    conn.commit()
    conn.close()

    return item_id

def get_all_items():
    """Get all items from database"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM items WHERE status = "active" ORDER BY created_at DESC')
    items = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return items

# ===== API ENDPOINTS =====

@app.route('/api/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({"status": "ok", "service": "asistente-backend"}), 200

@app.route('/api/capture', methods=['POST'])
def capture():
    """Main capture endpoint for Siri/voice"""
    try:
        # Accept both JSON and form-urlencoded
        if request.is_json:
            data = request.json
        else:
            data = request.form.to_dict()

        text = data.get('text', '').strip()
        timezone = data.get('timezone', 'Atlantic/Canary')
        source = data.get('source', 'siri')

        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Interpret with AI
        interpretation = interpret_with_ai(text, timezone)

        # Add to database
        item_id = add_item(
            title=interpretation.get('title', text[:50]),
            original_text=text,
            item_type=interpretation.get('type', 'task'),
            when_type=interpretation.get('temporal'),
            project=interpretation.get('project'),
            source=source,
            confidence=interpretation.get('confidence', 0.8)
        )

        return jsonify({
            "success": True,
            "id": item_id,
            "type": interpretation.get('type', 'task'),
            "title": interpretation.get('title', text[:50]),
            "temporal": interpretation.get('temporal'),
            "project": interpretation.get('project'),
            "confidence": interpretation.get('confidence', 0.8)
        }), 200

    except Exception as e:
        print(f"Error in /api/capture: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/items', methods=['GET'])
def get_items():
    """Get all items (for PWA to sync)"""
    try:
        items = get_all_items()
        return jsonify({"items": items}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/items/<item_id>/complete', methods=['POST'])
def complete_item(item_id):
    """Mark item as complete"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('UPDATE items SET completed = 1 WHERE id = ?', (item_id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/items/<item_id>', methods=['DELETE'])
def delete_item(item_id):
    """Delete item"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('UPDATE items SET status = "deleted" WHERE id = ?', (item_id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # For development
    app.run(debug=True, host='0.0.0.0', port=5000)
