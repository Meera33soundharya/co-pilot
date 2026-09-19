import json
import time
import random
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import DbComplaint, DbAuditEntry
from app.services.analytics_service import get_dashboard_stats

router = APIRouter(prefix="/complaints", tags=["complaints"])

class Coords(BaseModel):
    lat: float
    lng: float

class ComplaintCreate(BaseModel):
    citizen: str
    phone: str
    ward: str
    citizenId: str
    issue: str
    description: str
    priority: str
    category: Optional[str] = None
    dept: Optional[str] = None
    location: Optional[str] = None
    coords: Optional[Coords] = None
    notifPref: Optional[str] = "SMS"
    evidence: Optional[List[str]] = []
    source: Optional[str] = "online"  # "voice" | "online" | "field"

class StatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None
    image: Optional[str] = None
    actor: Optional[str] = "Officer"

class AssignmentUpdate(BaseModel):
    dept: str
    assignedTo: str
    actor: Optional[str] = "Admin"

class RatingRequest(BaseModel):
    rating: int

class ReopenRequest(BaseModel):
    note: str

# Local categorization helpers
CATEGORY_KEYWORDS = [
    ("Water Supply", ["water", "leak", "pipe", "tap", "supply", "bore"]),
    ("Electricity", ["light", "power", "electric", "voltage", "street light", "current"]),
    ("Roads & Infrastructure", ["road", "pothole", "footpath", "pavement", "crack", "construction"]),
    ("Sanitation", ["garbage", "waste", "dustbin", "trash", "toilet", "hygiene", "drain", "sewage"]),
    ("Drainage", ["drain", "flood", "waterlog", "clog", "overflow", "stormwater"]),
    ("Public Health", ["health", "hospital", "clinic", "mosquito", "disease", "stray", "animal"]),
    ("Parks & Recreation", ["park", "garden", "swing", "bench", "tree", "playground"]),
    ("Enforcement", ["noise", "illegal", "encroach", "vendor", "traffic", "parking", "hawker"]),
    ("Education", ["school", "teacher", "class", "student", "college", "education"]),
    ("Ward Committee & Governance", ["committee", "politician", "meeting", "ward member", "mla", "official visit", "councillor", "liason"])
]

CATEGORY_DEPT = {
    "Water Supply": "Water Supply Department",
    "Electricity": "Electricity Board",
    "Roads & Infrastructure": "Roads & PWD",
    "Sanitation": "Sanitation Department",
    "Public Health": "Public Health",
    "Parks & Recreation": "Parks Department",
    "Drainage": "Drainage & Sewerage",
    "Enforcement": "Municipal Enforcement",
    "Education": "Education Department",
    "Ward Committee & Governance": "Governance & Ward Committee",
    "Other": "General Administration"
}

def auto_categorize(text: str) -> str:
    lower = text.lower()
    for cat, words in CATEGORY_KEYWORDS:
        if any(w in lower for w in words):
            return cat
    return "Other"

@router.get("")
def get_complaints(db: Session = Depends(get_db)):
    complaints = db.query(DbComplaint).order_by(DbComplaint.timestamp.desc()).all()
    res = []
    for c in complaints:
        try:
            ev = json.loads(c.evidence)
        except:
            ev = []
        
        audit_list = []
        for a in c.audit:
            audit_list.append({
                "time": a.time,
                "actor": a.actor,
                "action": a.action,
                "note": a.note,
                "image": a.image
            })
            
        res.append({
            "id": c.id,
            "citizen": c.citizen,
            "phone": c.phone,
            "ward": c.ward,
            "citizenId": c.citizenId,
            "category": c.category,
            "issue": c.issue,
            "description": c.description,
            "priority": c.priority,
            "status": c.status,
            "assignedTo": c.assignedTo,
            "dept": c.dept,
            "time": c.time,
            "timestamp": c.timestamp,
            "notified": c.notified,
            "evidence": ev,
            "location": c.location,
            "coords": {"lat": c.latitude, "lng": c.longitude} if (c.latitude is not None and c.longitude is not None) else None,
            "notifPref": c.notifPref,
            "sentiment": c.sentiment,
            "rating": c.rating,
            "resolutionProof": c.resolutionProof,
            "source": c.source or "online",
            "audit": audit_list
        })
    return res

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    return get_dashboard_stats(db)

@router.post("")
def create_complaint(req: ComplaintCreate, db: Session = Depends(get_db)):
    last = db.query(DbComplaint).order_by(DbComplaint.timestamp.desc()).first()
    next_num = 8300
    if last and last.id.startswith("GRV-"):
        try:
            next_num = int(last.id.split("-")[1]) + 1
        except:
            pass
    comp_id = f"GRV-{next_num}"
    
    cat = req.category
    if not cat:
        cat = auto_categorize(f"{req.issue} {req.description}")
        
    dept = req.dept
    if not dept:
        dept = CATEGORY_DEPT.get(cat, "General Administration")
        
    db_comp = DbComplaint(
        id=comp_id,
        citizen=req.citizen,
        phone=req.phone,
        ward=req.ward,
        citizenId=req.citizenId,
        category=cat,
        issue=req.issue,
        description=req.description,
        priority=req.priority,
        status="Pending",
        assignedTo="",
        dept=dept,
        timestamp=time.time() * 1000,
        time="Just now",
        location=req.location,
        latitude=req.coords.lat if req.coords else None,
        longitude=req.coords.lng if req.coords else None,
        notifPref=req.notifPref,
        evidence=json.dumps(req.evidence or []),
        sentiment=random.randint(60, 100),
        source=req.source or "online"
    )
    
    db.add(db_comp)
    db.commit()
    
    a1 = DbAuditEntry(complaint_id=comp_id, actor="Citizen", action="Complaint submitted online", time="Just now")
    a2 = DbAuditEntry(complaint_id=comp_id, actor="System", action=f"Auto-categorized as {cat}", time="Just now")
    db.add_all([a1, a2])
    db.commit()
    
    return {"id": comp_id, "status": "Pending"}

@router.put("/{id}/status")
def update_complaint_status(id: str, req: StatusUpdate, db: Session = Depends(get_db)):
    comp = db.query(DbComplaint).filter(DbComplaint.id == id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    comp.status = req.status
    if req.image:
        comp.resolutionProof = req.image
        
    audit_entry = DbAuditEntry(
        complaint_id=id,
        actor=req.actor,
        action=req.note or f"Status changed to {req.status}",
        image=req.image,
        time="Just now"
    )
    db.add(audit_entry)
    db.commit()
    return {"status": "success"}

@router.put("/{id}/assign")
def assign_complaint(id: str, req: AssignmentUpdate, db: Session = Depends(get_db)):
    comp = db.query(DbComplaint).filter(DbComplaint.id == id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    comp.dept = req.dept
    comp.assignedTo = req.assignedTo
    comp.status = "Assigned"
    
    audit_entry = DbAuditEntry(
        complaint_id=id,
        actor=req.actor,
        action=f"Assigned to {req.assignedTo} ({req.dept})",
        time="Just now"
    )
    db.add(audit_entry)
    db.commit()
    return {"status": "success"}

@router.post("/{id}/rate")
def rate_complaint(id: str, req: RatingRequest, db: Session = Depends(get_db)):
    comp = db.query(DbComplaint).filter(DbComplaint.id == id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")
    comp.rating = req.rating
    audit_entry = DbAuditEntry(
        complaint_id=id,
        actor="Citizen",
        action=f"Rated resolution {req.rating} stars",
        time="Just now"
    )
    db.add(audit_entry)
    db.commit()
    return {"status": "success"}

@router.post("/{id}/reopen")
def reopen_complaint(id: str, req: ReopenRequest, db: Session = Depends(get_db)):
    comp = db.query(DbComplaint).filter(DbComplaint.id == id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")
    comp.status = "In Progress"
    audit_entry = DbAuditEntry(
        complaint_id=id,
        actor="Citizen",
        action="Complaint Reopened",
        note=req.note,
        time="Just now"
    )
    db.add(audit_entry)
    db.commit()
    return {"status": "success"}
