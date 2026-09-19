import sqlite3

conn = sqlite3.connect('govpilot.db')

# Mark existing voice complaints (those from "Voice User" citizen or from Voice Portal)
result = conn.execute("""
    UPDATE complaints 
    SET source = 'voice' 
    WHERE citizen = 'Voice User' 
       OR location = 'From Voice Portal'
       OR (notifPref = 'None' AND (description LIKE '%voice%' OR description LIKE '%Voice%'))
""")
conn.commit()
print(f'Updated {result.rowcount} existing voice complaints')

# Show count by source
rows = conn.execute("SELECT source, COUNT(*) as count FROM complaints GROUP BY source").fetchall()
for row in rows:
    print(f'  source={row[0]}: {row[1]} complaints')

conn.close()
