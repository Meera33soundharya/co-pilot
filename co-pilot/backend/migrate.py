import sqlite3

conn = sqlite3.connect('govpilot.db')
try:
    conn.execute('ALTER TABLE complaints ADD COLUMN source TEXT DEFAULT "online"')
    conn.commit()
    print('Column added successfully')
except Exception as e:
    if 'duplicate column' in str(e).lower():
        print('Column already exists - OK')
    else:
        print(f'Error: {e}')
finally:
    conn.close()
