import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import engine, Base, SessionLocal
from app.models.models import DbUser, DbComplaint, DbAuditEntry
from app.routes import auth, complaints, documents, speech

# Initialize database schemas
Base.metadata.create_all(bind=engine)

app = FastAPI(title="GovPilot Backend API", version="2.0.0")

# Configure CORS for development testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed database with initial users and complaints
def seed_database():
    db = SessionLocal()
    try:
        # Users
        if db.query(DbUser).count() == 0:
            demo_users = [
                DbUser(id="admin_1", email="admin@govpilot.in", password="Admin@2026", name="District Admin", role="admin"),
                DbUser(id="officer_1", email="officer@govpilot.in", password="Officer@2026", name="Rajiv Kumar", role="officer", dept="Water Supply Department"),
                DbUser(id="citizen_amit", email="citizen@govpilot.in", password="Citizen@2026", name="Amit Patel", role="citizen", citizenId="citizen_amit")
            ]
            db.add_all(demo_users)
            db.commit()
            
        # Complaints
        if db.query(DbComplaint).count() == 0:
            now = time.time() * 1000
            
            c1 = DbComplaint(
                id="GRV-8296", citizen="Online Citizen", phone="+91 90000 12345",
                ward="Ward 02", citizenId="citizen_amit",
                category="Water Supply", issue="No water supply for 2 days – Sector 4",
                description="The water supply has been completely cut off for 2 days in Sector 4. Residents are buying water at high cost. Urgent repair needed.",
                priority="High", status="Pending", assignedTo="", dept="Water Supply Department",
                timestamp=now - 60000, notified=False, evidence="[]", sentiment=78
            )
            
            c2 = DbComplaint(
                id="GRV-8295", citizen="Meera Soundarya", phone="+91 63821 54321",
                ward="Ward 05", citizenId="citizen_meera",
                category="Electricity", issue="Live wire dangling on street near Park West",
                description="Extremely dangerous live wire hanging low after last night's wind. Needs immediate isolation before anyone gets hurt.",
                priority="High", status="Pending", assignedTo="", dept="Electricity Board",
                timestamp=now - 300000, notified=False, evidence="[]", sentiment=62
            )
            
            c3 = DbComplaint(
                id="GRV-8294", citizen="Amit Patel", phone="+91 98765 43210",
                ward="Ward 03", citizenId="citizen_amit",
                category="Water Supply", issue="Severe water leakage – Block C, Sector 7",
                description="Water is leaking from the main pipeline near Block C and flooding the road, making it dangerous for pedestrians and vehicles.",
                priority="High", status="In Progress", assignedTo="Rajiv Kumar (Water Dept)", dept="Water Supply Department",
                timestamp=now - 7200000, notified=False, evidence="[]", sentiment=85
            )
            
            c4 = DbComplaint(
                id="GRV-8292", citizen="Vikram Singh", phone="+91 76543 21098",
                ward="Ward 06", citizenId="citizen_vikram",
                category="Roads & Infrastructure", issue="Broken road causing accidents on Main Road",
                description="A large pothole formed due to recent rain. Two accidents have already occurred. Urgent road repair is needed immediately.",
                priority="High", status="Accepted", assignedTo="", dept="Roads & PWD",
                timestamp=now - 18000000, notified=False, evidence="[]", sentiment=70
            )

            db.add_all([c1, c2, c3, c4])
            db.commit()
            
            # Audit Trails
            a1 = DbAuditEntry(complaint_id="GRV-8296", actor="Citizen", action="Complaint submitted online", time="Just now")
            a2 = DbAuditEntry(complaint_id="GRV-8296", actor="System", action="Auto-categorized as Water Supply", time="Just now")
            a3 = DbAuditEntry(complaint_id="GRV-8294", actor="System", action="Complaint submitted by citizen", time="2 hours ago")
            a4 = DbAuditEntry(complaint_id="GRV-8294", actor="Admin", action="Assigned to Water Supply Department", time="2 hours ago")
            a5 = DbAuditEntry(complaint_id="GRV-8294", actor="Rajiv Kumar", action="Started working on the complaint", time="1 hour ago")
            
            db.add_all([a1, a2, a3, a4, a5])
            db.commit()
    finally:
        db.close()

# Run database seed
seed_database()

# Include FastAPI routers
app.include_router(auth.router, prefix="/api")
app.include_router(complaints.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(speech.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "GovPilot Backend API is fully functional"}
