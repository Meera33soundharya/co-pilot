import sqlite3
import time
import os

db_path = os.path.join(os.path.dirname(__file__), 'govpilot.db')
print(f"Connecting to database at {db_path}...")
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# 1. Add missing columns to complaints table safely
complaint_columns = [
    ("language", "TEXT DEFAULT 'ta'"),
    ("originalComplaintTamil", "TEXT"),
    ("aiSummary", "TEXT"),
    ("aiConfidence", "REAL DEFAULT 0.92"),
    ("aiReasoning", "TEXT"),
    ("duplicateOf", "TEXT"),
    ("needsReview", "INTEGER DEFAULT 0"),
    ("resolutionNotes", "TEXT"),
    ("supportingDocs", "TEXT DEFAULT '[]'"),
    ("assignedOfficerId", "TEXT"),
    ("updatedAt", "REAL"),
    ("source", "TEXT DEFAULT 'online'")
]

for col_name, col_type in complaint_columns:
    try:
        cur.execute(f"ALTER TABLE complaints ADD COLUMN {col_name} {col_type}")
        print(f"  + Added column complaints.{col_name}")
    except Exception as e:
        if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
            pass
        else:
            print(f"  ! Note on {col_name}: {e}")

# 2. Create departments table
cur.execute("""
CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    head_officer TEXT,
    contact_email TEXT,
    phone TEXT,
    active INTEGER DEFAULT 1
)
""")

# 3. Create officers table
cur.execute("""
CREATE TABLE IF NOT EXISTS officers (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    dept TEXT NOT NULL,
    ward TEXT DEFAULT 'All Wards',
    designation TEXT DEFAULT 'Field Officer',
    active INTEGER DEFAULT 1,
    max_workload INTEGER DEFAULT 15,
    current_workload INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id)
)
""")

# 4. Create notifications table
cur.execute("""
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    title_ta TEXT,
    message TEXT NOT NULL,
    message_ta TEXT,
    time TEXT DEFAULT 'Just now',
    timestamp REAL NOT NULL,
    read INTEGER DEFAULT 0,
    complaint_id TEXT,
    priority TEXT,
    dept TEXT,
    citizenId TEXT,
    target TEXT DEFAULT 'all'
)
""")

# 5. Create announcements table
cur.execute("""
CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_ta TEXT,
    body_en TEXT NOT NULL,
    body_ta TEXT,
    type TEXT DEFAULT 'General',
    ward TEXT DEFAULT 'All Wards',
    postedBy TEXT NOT NULL,
    date TEXT NOT NULL,
    pinned INTEGER DEFAULT 0,
    timestamp REAL NOT NULL,
    active INTEGER DEFAULT 1
)
""")
conn.commit()

# 6. Seed departments if empty
cur.execute("SELECT COUNT(*) FROM departments")
if cur.fetchone()[0] == 0:
    print("[*] Seeding official departments...")
    depts = [
        ("dept_water", "Water Supply Department", "WTR", "Municipal drinking water pipeline and supply management", "Rajiv Kumar", "water@govpilot.in", "+91 44 2859 1001", 1),
        ("dept_elec", "Electricity Board", "ELEC", "Grid, power distribution and street lighting infrastructure", "K. Ramesh", "electricity@govpilot.in", "+91 44 2859 1002", 1),
        ("dept_pwd", "Roads & PWD", "PWD", "Road repaving, pothole restoration and public infrastructure", "M. Anbarasan", "pwd@govpilot.in", "+91 44 2859 1003", 1),
        ("dept_san", "Sanitation Department", "SAN", "Solid waste management and door-to-door collection", "Priya Natarajan", "sanitation@govpilot.in", "+91 44 2859 1004", 1),
        ("dept_drain", "Drainage & Sewerage", "DRN", "Stormwater drains, sewage and underground network maintenance", "Murugan Chellappa", "drainage@govpilot.in", "+91 44 2859 1005", 1),
        ("dept_health", "Public Health", "HLT", "Disease control, community clinics and pest eradication", "Dr. S. Kavitha", "health@govpilot.in", "+91 44 2859 1006", 1),
        ("dept_parks", "Parks Department", "PRK", "Maintenance of civic gardens, play equipment and green belts", "Vignesh Pandian", "parks@govpilot.in", "+91 44 2859 1007", 1),
        ("dept_enf", "Municipal Enforcement", "ENF", "Civic noise regulations, encroachments and code compliance", "Inspector T. Vijay", "enforcement@govpilot.in", "+91 44 2859 1008", 1),
        ("dept_edu", "Education Department", "EDU", "Municipal schools and education facilities", "A. Lakshmi", "education@govpilot.in", "+91 44 2859 1009", 1),
        ("dept_gov", "Governance & Ward Committee", "GOV", "Ward committee grievance mediation and citizen liaison", "K. Soundar", "governance@govpilot.in", "+91 44 2859 1010", 1),
        ("dept_gen", "General Administration", "GEN", "General civic affairs, registry and inter-departmental issues", "District Admin", "admin@govpilot.in", "+91 44 2859 1000", 1)
    ]
    cur.executemany("INSERT INTO departments (id, name, code, description, head_officer, contact_email, phone, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", depts)
    conn.commit()

# 7. Seed officers if empty
cur.execute("SELECT COUNT(*) FROM officers")
if cur.fetchone()[0] == 0:
    print("[*] Seeding eligible field officers...")
    officers = [
        ("off_water_1", "officer_1", "Rajiv Kumar", "officer@govpilot.in", "+91 94441 23456", "Water Supply Department", "Ward 02, Ward 03, Ward 04", "Senior Water Engineer", 1, 15, 1),
        ("off_water_2", None, "Suresh Selvam", "suresh.wtr@govpilot.in", "+91 94441 23457", "Water Supply Department", "Ward 01, Ward 05, Ward 06", "Field Assistant Engineer", 1, 15, 0),
        ("off_elec_1", None, "K. Ramesh", "ramesh.elec@govpilot.in", "+91 94442 34567", "Electricity Board", "All Wards", "Assistant Electrical Inspector", 1, 15, 0),
        ("off_pwd_1", None, "M. Anbarasan", "anbarasan.pwd@govpilot.in", "+91 94443 45678", "Roads & PWD", "Ward 01 to Ward 06", "Junior PWD Engineer", 1, 15, 1),
        ("off_san_1", None, "Priya Natarajan", "priya.san@govpilot.in", "+91 94444 56789", "Sanitation Department", "All Wards", "Sanitary Inspector", 1, 15, 0),
        ("off_drain_1", None, "Murugan Chellappa", "murugan.drn@govpilot.in", "+91 94445 67890", "Drainage & Sewerage", "All Wards", "Drainage Supervisor", 1, 15, 0),
        ("off_health_1", None, "Dr. S. Kavitha", "kavitha.hlt@govpilot.in", "+91 94446 78901", "Public Health", "All Wards", "Public Health Officer", 1, 15, 0),
        ("off_parks_1", None, "Vignesh Pandian", "vignesh.prk@govpilot.in", "+91 94447 89012", "Parks Department", "All Wards", "Horticulture Officer", 1, 15, 0),
        ("off_enf_1", None, "Inspector T. Vijay", "vijay.enf@govpilot.in", "+91 94448 90123", "Municipal Enforcement", "All Wards", "Enforcement Officer", 1, 15, 0)
    ]
    cur.executemany("INSERT INTO officers (id, user_id, name, email, phone, dept, ward, designation, active, max_workload, current_workload) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", officers)
    conn.commit()

# 8. Seed announcements if empty
cur.execute("SELECT COUNT(*) FROM announcements")
if cur.fetchone()[0] == 0:
    print("[*] Seeding initial announcements...")
    now = time.time() * 1000
    anns = [
        ("ANN-001", "Water Supply Disruption — Ward 5 & 7", "குடிநீர் விநியோகத் தடை — வார்டு 5 & 7",
         "Due to emergency pipe replacement work scheduled on 17 March, water supply will be interrupted from 6AM to 2PM. Residents are advised to store water in advance.",
         "மார்ச் 17 அன்று திட்டமிடப்பட்ட அவசரகால குழாய் மாற்றுப் பணி காரணமாக, காலை 6 மணி முதல் மதியம் 2 மணி வரை குடிநீர் விநியோகம் தடைபடும். குடியிருப்பாளர்கள் முன்கூட்டியே தண்ணீரைச் சேமித்து வைக்குமாறு அறிவுறுத்தப்படுகிறார்கள்.",
         "Alert", "Ward 5, Ward 7", "Municipal Commissioner", "15 Mar 2026", 1, now - 86400000, 1),
        ("ANN-002", "Street Light Installation Completed — Ward 3", "தெருவிளக்கு நிறுவுதல் நிறைவடைந்தது — வார்டு 3",
         "We are pleased to announce the successful installation of 32 new LED streetlights along the Main Road stretch in Ward 3. The work was completed 2 days ahead of schedule.",
         "வார்டு 3-இல் உள்ள பிரதான சாலை நெடுகிலும் 32 புதிய LED தெருவிளக்குகள் வெற்றிகரமாக நிறுவப்பட்டுள்ளன என்பதை மகிழ்ச்சியுடன் தெரிவித்துக் கொள்கிறோம்.",
         "Resolution", "Ward 3", "Roads & PWD Dept", "14 Mar 2026", 0, now - 172800000, 1),
        ("ANN-003", "Free Health Camp — Ward 11 Community Center", "இலவச மருத்துவ முகாம் — வார்டு 11 சமூக நலக்கூடம்",
         "A free health check-up camp will be held on 20 March 2026 at the Ward 11 Community Hall from 9AM–4PM. Services include blood pressure, sugar, eye check-up, and general physician consult.",
         "மார்ச் 20, 2026 அன்று வார்டு 11 சமூக நலக்கூடத்தில் காலை 9 மணி முதல் மாலை 4 மணி வரை இலவச மருத்துவப் பரிசோதனை முகாம் நடைபெறும்.",
         "Event", "Ward 11", "Public Health Department", "13 Mar 2026", 0, now - 259200000, 1)
    ]
    cur.executemany("INSERT INTO announcements (id, title_en, title_ta, body_en, body_ta, type, ward, postedBy, date, pinned, timestamp, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", anns)
    conn.commit()

# 9. Seed notifications if empty
cur.execute("SELECT COUNT(*) FROM notifications")
if cur.fetchone()[0] == 0:
    print("[*] Seeding initial notifications...")
    now = time.time() * 1000
    notifs = [
        ("NOTIF-101", "new_complaint", "High Priority Grievance Filed", "அவசர புகார் பெறப்பட்டது",
         "No water supply for 2 days in Sector 4 (Ward 02).", "செக்டார் 4 (வார்டு 02)-ல் 2 நாட்களாக குடிநீர் இல்லை.",
         "Just now", now - 60000, 0, "GRV-8296", "High", "Water Supply Department", "citizen_amit", "admin"),
        ("NOTIF-102", "assignment", "Grievance Assigned to Your Dept", "உங்கள் துறைக்கு புகார் ஒதுக்கப்பட்டுள்ளது",
         "Severe water leakage – Block C, Sector 7 assigned to Rajiv Kumar.", "பிளாக் சி, செக்டார் 7-ல் குடிநீர் கசிவு புகார் ராஜீவ் குமாருக்கு ஒதுக்கப்பட்டது.",
         "2 hours ago", now - 7200000, 0, "GRV-8294", "High", "Water Supply Department", "citizen_amit", "officer")
    ]
    cur.executemany("INSERT INTO notifications (id, type, title, title_ta, message, message_ta, time, timestamp, read, complaint_id, priority, dept, citizenId, target) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", notifs)
    conn.commit()

print("[+] Migration and schema enhancement completed successfully.")
cur.close()
conn.close()
