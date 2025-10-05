import sqlite3
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

DATABASE = 'events.db'

def init_db():
    """Initializes the database and creates tables if they don't exist."""
    if os.path.exists(DATABASE):
        return  

    print("Creating a new database...")
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            date TEXT NOT NULL,
            description TEXT NOT NULL,
            location TEXT NOT NULL
        )
    ''')


    cursor.execute('''
        CREATE TABLE registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            event_id INTEGER,
            FOREIGN KEY(event_id) REFERENCES events(id)
        )
    ''')


    sample_events = [
        ('Oktoberfest Bengaluru', '2025-10-25', 'Experience the best of German culture with music, food, and craft beer.', 'Jaymahal Palace Hotel'),
        ('Bengaluru Tech Summit', '2025-11-19', 'Asia\'s largest tech event, showcasing the latest in IT and biotech.', 'Bangalore Palace'),
        ('Bengaluru Comic Con', '2025-11-22', 'The city\'s biggest pop-culture celebration. Cosplay, comics, and fun!', 'KTPO Convention Centre'),
        ('Echoes of Earth Music Festival', '2025-12-07', 'A sustainable music festival celebrating music, art, and nature.', 'Embassy International Riding School')
    ]
    cursor.executemany('INSERT INTO events (name, date, description, location) VALUES (?, ?, ?, ?)', sample_events)
    
    conn.commit()  
    conn.close()  
    print("Database created and populated with sample Bengaluru events.")


@app.route('/api/events', methods=['GET'])
def get_events():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM events ORDER BY date ASC')
    events = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(events)

@app.route('/api/register', methods=['POST'])
def register_for_event():
    data = request.get_json() 
    username = data.get('username')
    event_id = data.get('event_id')

    if not username or not event_id:
        return jsonify({'message': 'Missing username or event ID'}), 400 

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
 
    cursor.execute('SELECT * FROM registrations WHERE username = ? AND event_id = ?', (username, event_id))
    if cursor.fetchone():
        conn.close()
        return jsonify({'message': 'You are already registered for this event.'}), 409 


    cursor.execute('INSERT INTO registrations (username, event_id) VALUES (?, ?)', (username, event_id))
    conn.commit()
    conn.close()
    
    print(f"SUCCESS: Registered '{username}' for event ID '{event_id}'")
    return jsonify({'message': 'Registration successful! See you there.'}), 201 

if __name__ == '__main__':
    init_db() 
    app.run(debug=True)

