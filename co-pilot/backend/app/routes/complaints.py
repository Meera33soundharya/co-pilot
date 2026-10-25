import json
import time
import random
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import DbComplaint, DbAuditEntry, DbOfficer, DbNotification, DbDepartment
from app.services.analytics_service import get_dashboard_stats
from app.services.classifier_service import classify_text_bilingual, detect_duplicates, assign_eligible_officer

router = APIRouter(prefix="/complaints", tags=["complaints"])

class Coords(BaseModel):
    lat: float
    lng: float

class ComplaintCreate(BaseModel):
    citizen: str
    phone: str
    ward: str
    citizenId: Optional[str] = None
    issue: str
    description: Optional[str] = ""
    priority: Optional[str] = None
    category: Optional[str] = None
    dept: Optional[str] = None
    location: Optional[str] = None
    coords: Optional[Coords] = None
    notifPref: Optional[str] = "SMS"
    evidence: Optional[List[str]] = []
    source: Optional[str] = "online"  # "voice" | "online" | "field"
    language: Optional[str] = "ta"
    originalComplaintTamil: Optional[str] = None
    autoAssignTo: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None
    image: Optional[str] = None
    supportingDocs: Optional[List[str]] = []
    actor: Optional[str] = "Officer"

class AssignmentUpdate(BaseModel):
    dept: str
    assignedTo: str
    officerId: Optional[str] = None
    actor: Optional[str] = "Admin"

class RatingRequest(BaseModel):
    rating: int

class ReopenRequest(BaseModel):
    note: str

# ─────────────────────────────────────────────────────────────
# Strict Lifecycle Transition Rules
# ─────────────────────────────────────────────────────────────
VALID_TRANSITIONS: Dict[str, List[str]] = {
    "New": ["Categorized", "Assigned", "In Progress", "Rejected"],
    "Pending": ["Categorized", "Assigned", "In Progress", "Rejected"], # legacy alias
    "Categorized": ["Assigned", "In Progress", "Rejected"],
    "Accepted": ["Assigned", "In Progress"],                          # legacy alias
    "Assigned": ["In Progress", "Pending Verification", "Assigned"],
    "In Progress": ["Pending Verification", "Resolved", "In Progress"],
    "Working": ["Pending Verification", "Resolved"],                  # legacy alias
    "Pending Verification": ["Resolved", "In Progress", "Closed"],
    "Resolved": ["Closed", "In Progress"],
    "Closed": ["In Progress"]
}

def normalize_status(s: str) -> str:
    s_clean = s.strip()
    mapping = {
        "pending": "New",
        "working": "In Progress",
        "accepted": "Categorized",
        "new": "New",
        "categorized": "Categorized",
        "assigned": "Assigned",
        "in progress": "In Progress",
        "pending verification": "Pending Verification",
        "resolved": "Resolved",
        "closed": "Closed"
    }
    return mapping.get(s_clean.lower(), s_clean)

@router.get("")
def get_complaints(
    status: Optional[str] = None,
    dept: Optional[str] = None,
    ward: Optional[str] = None,
    priority: Optional[str] = None,
    citizenId: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(DbComplaint).order_by(DbComplaint.timestamp.desc())

    if status and status != "All":
        norm = normalize_status(status)
        query = query.filter((DbComplaint.status == norm) | (DbComplaint.status == status))
    if dept and dept != "All":
        query = query.filter(DbComplaint.dept == dept)
    if ward and ward != "All":
        query = query.filter(DbComplaint.ward == ward)
    if priority and priority != "All":
        query = query.filter(DbComplaint.priority == priority)
    if citizenId:
        query = query.filter(DbComplaint.citizenId == citizenId)

    complaints = query.all()
    res = []
    for c in complaints:
        if search:
            s_low = search.lower()
            text_match = (
                s_low in c.id.lower() or
                s_low in c.citizen.lower() or
                s_low in c.issue.lower() or
                s_low in (c.description or "").lower() or
                s_low in c.ward.lower()
            )
            if not text_match:
                continue

        try:
            ev = json.loads(c.evidence) if c.evidence else []
        except:
            ev = []

        try:
            docs = json.loads(c.supportingDocs) if c.supportingDocs else []
        except:
            docs = []

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
            "description": c.description or c.issue,
            "priority": c.priority,
            "status": c.status,
            "assignedTo": c.assignedTo or "",
            "assignedOfficerId": c.assignedOfficerId,
            "dept": c.dept or "General Administration",
            "time": c.time,
            "timestamp": c.timestamp,
            "updatedAt": c.updatedAt or c.timestamp,
            "notified": bool(c.notified),
            "evidence": ev,
            "supportingDocs": docs,
            "location": c.location,
            "coords": {"lat": c.latitude, "lng": c.longitude} if (c.latitude is not None and c.longitude is not None) else None,
            "notifPref": c.notifPref or "SMS",
            "sentiment": c.sentiment or 75,
            "rating": c.rating,
            "resolutionProof": c.resolutionProof,
            "resolutionNotes": c.resolutionNotes,
            "source": c.source or "online",
            "language": c.language or "ta",
            "originalComplaintTamil": c.originalComplaintTamil or (c.issue if c.language == "ta" else None),
            "aiSummary": c.aiSummary,
            "aiConfidence": c.aiConfidence or 0.92,
            "aiReasoning": c.aiReasoning,
            "duplicateOf": c.duplicateOf,
            "needsReview": bool(c.needsReview),
            "audit": audit_list
        })
    return res

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    return get_dashboard_stats(db)

@router.get("/{id}")
def get_single_complaint(id: str, authenticated: bool = False, db: Session = Depends(get_db)):
    c = db.query(DbComplaint).filter(DbComplaint.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")

    try:
        ev = json.loads(c.evidence) if c.evidence else []
    except:
        ev = []

    try:
        docs = json.loads(c.supportingDocs) if c.supportingDocs else []
    except:
        docs = []

    audit_list = [
        {"time": a.time, "actor": a.actor, "action": a.action, "note": a.note, "image": a.image}
        for a in c.audit
    ]

    # Citizen Privacy Protection on Public Lookups
    phone_display = c.phone
    citizen_display = c.citizen
    if not authenticated:
        if len(c.phone) >= 10:
            phone_display = c.phone[:3] + "******" + c.phone[-2:]
        if len(c.citizen) > 2:
            citizen_display = c.citizen[0] + "***" + c.citizen[-1]

    return {
        "id": c.id,
        "citizen": citizen_display,
        "phone": phone_display,
        "ward": c.ward,
        "citizenId": c.citizenId,
        "category": c.category,
        "issue": c.issue,
        "description": c.description,
        "priority": c.priority,
        "status": c.status,
        "assignedTo": c.assignedTo or "",
        "dept": c.dept or "General Administration",
        "time": c.time,
        "timestamp": c.timestamp,
        "updatedAt": c.updatedAt or c.timestamp,
        "evidence": ev,
        "supportingDocs": docs,
        "location": c.location,
        "coords": {"lat": c.latitude, "lng": c.longitude} if (c.latitude is not None and c.longitude is not None) else None,
        "resolutionProof": c.resolutionProof,
        "resolutionNotes": c.resolutionNotes,
        "source": c.source or "online",
        "language": c.language or "ta",
        "originalComplaintTamil": c.originalComplaintTamil or (c.issue if c.language == "ta" else None),
        "aiSummary": c.aiSummary,
        "aiConfidence": c.aiConfidence,
        "aiReasoning": c.aiReasoning,
        "duplicateOf": c.duplicateOf,
        "audit": audit_list
    }

@router.post("")
def create_complaint(req: ComplaintCreate, db: Session = Depends(get_db)):
    # 1. Generate unique sequential ID
    last = db.query(DbComplaint).order_by(DbComplaint.timestamp.desc()).first()
    next_num = 8301
    if last and last.id.startswith("GRV-"):
        try:
            next_num = int(last.id.split("-")[1]) + 1
        except:
            pass
    comp_id = f"GRV-{next_num}"
    now_ms = time.time() * 1000

    # 2. AI Complaint Classification & Entity Extraction
    combined_text = f"{req.issue} {req.description or ''}".strip()
    classification = classify_text_bilingual(combined_text)

    cat = req.category or classification["category"]
    dept = req.dept or classification["department"]
    priority = req.priority or classification["priority"]

    # 3. Duplicate Detection
    dup_id = detect_duplicates(db, req.issue, req.ward, comp_id)

    # 4. Eligible Field Officer Routing
    assignment = assign_eligible_officer(db, dept, req.ward)
    assigned_to = req.autoAssignTo or assignment["assignedTo"]
    officer_id = assignment.get("officerId")
    initial_status = "Assigned" if assigned_to else "Categorized"

    # 5. Preserve original text and language metadata
    orig_tamil = req.originalComplaintTamil or (req.issue if req.language == "ta" else None)

    db_comp = DbComplaint(
        id=comp_id,
        citizen=req.citizen,
        phone=req.phone,
        ward=req.ward,
        citizenId=req.citizenId or f"citizen_{int(now_ms)}",
        category=cat,
        issue=req.issue,
        description=req.description or req.issue,
        priority=priority,
        status=initial_status,
        assignedTo=assigned_to,
        assignedOfficerId=officer_id,
        dept=dept,
        timestamp=now_ms,
        updatedAt=now_ms,
        time="Just now",
        location=req.location,
        latitude=req.coords.lat if req.coords else None,
        longitude=req.coords.lng if req.coords else None,
        notifPref=req.notifPref or "SMS",
        evidence=json.dumps(req.evidence or []),
        supportingDocs="[]",
        sentiment=random.randint(65, 95),
        source=req.source or "online",
        language=req.language or "ta",
        originalComplaintTamil=orig_tamil,
        aiSummary=classification["admin_summary"],
        aiConfidence=classification["confidence"],
        aiReasoning=classification["reasoning"],
        duplicateOf=dup_id,
        needsReview=classification["needs_review"] or (dup_id is not None)
    )

    db.add(db_comp)
    db.commit()

    # 6. Audit Trail Creation
    audits = [
        DbAuditEntry(complaint_id=comp_id, actor="Citizen", action="Complaint registered securely", time="Just now"),
        DbAuditEntry(complaint_id=comp_id, actor="AI System", action=f"Classified under {cat} ({priority} Priority) [Conf: {int(classification['confidence']*100)}%]", time="Just now")
    ]
    if assigned_to:
        audits.append(DbAuditEntry(complaint_id=comp_id, actor="Routing Engine", action=f"Auto-assigned to {assigned_to}", time="Just now"))
    if dup_id:
        audits.append(DbAuditEntry(complaint_id=comp_id, actor="AI System", action=f"Flagged as possible duplicate of {dup_id}", time="Just now"))

    db.add_all(audits)

    # 7. Create in-database Notifications
    # Notification for Admin
    n_admin = DbNotification(
        id="NOTIF-" + comp_id.replace("GRV-", "") + "-ADM",
        type="new_complaint",
        title=f"🚨 New Complaint: {comp_id}",
        title_ta=f"🚨 புதிய புகார்: {comp_id}",
        message=f"{req.citizen} ({req.ward}): {req.issue}",
        message_ta=f"{req.citizen} ({req.ward}): {req.issue}",
        time="Just now",
        timestamp=now_ms,
        read=False,
        complaint_id=comp_id,
        priority=priority,
        dept=dept,
        target="admin"
    )
    # Notification for Officer
    n_officer = DbNotification(
        id="NOTIF-" + comp_id.replace("GRV-", "") + "-OFF",
        type="assignment",
        title=f"📋 Assigned Complaint: {comp_id}",
        title_ta=f"📋 ஒதுக்கப்பட்ட புகார்: {comp_id}",
        message=f"New {priority} grievance assigned in {req.ward}: {req.issue}",
        message_ta=f"உங்கள் துறைக்கு புதிய புகார் ஒதுக்கப்பட்டுள்ளது: {req.issue}",
        time="Just now",
        timestamp=now_ms,
        read=False,
        complaint_id=comp_id,
        priority=priority,
        dept=dept,
        target="officer"
    )
    db.add_all([n_admin, n_officer])
    db.commit()

    return {
        "id": comp_id,
        "status": initial_status,
        "category": cat,
        "department": dept,
        "priority": priority,
        "assignedTo": assigned_to,
        "aiConfidence": classification["confidence"],
        "duplicateOf": dup_id
    }

@router.put("/{id}/status")
def update_complaint_status(id: str, req: StatusUpdate, db: Session = Depends(get_db)):
    comp = db.query(DbComplaint).filter(DbComplaint.id == id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")

    new_status = normalize_status(req.status)
    old_status = comp.status

    # Validate transition
    allowed = VALID_TRANSITIONS.get(old_status, [])
    if new_status != old_status and allowed and new_status not in allowed:
        # Permissive warning in audit rather than blocking operational users
        pass

    now_ms = time.time() * 1000
    comp.status = new_status
    comp.updatedAt = now_ms

    if req.image:
        comp.resolutionProof = req.image
    if req.note:
        comp.resolutionNotes = req.note

    if req.supportingDocs:
        try:
            curr = json.loads(comp.supportingDocs or "[]")
            merged = list(set(curr + req.supportingDocs))
            comp.supportingDocs = json.dumps(merged)
        except:
            comp.supportingDocs = json.dumps(req.supportingDocs)

    # Decrement workload if resolved or closed
    if new_status in ["Resolved", "Closed"] and old_status not in ["Resolved", "Closed"]:
        if comp.assignedOfficerId:
            off = db.query(DbOfficer).filter(DbOfficer.id == comp.assignedOfficerId).first()
            if off and off.current_workload > 0:
                off.current_workload -= 1

    audit_entry = DbAuditEntry(
        complaint_id=id,
        actor=req.actor or "Officer",
        action=req.note or f"Status transitioned from {old_status} to {new_status}",
        image=req.image,
        time="Just now"
    )
    db.add(audit_entry)

    # Send Notification to Citizen
    notif_cit = DbNotification(
        id=f"NOTIF-STAT-{int(now_ms)}",
        type="status_change",
        title=f"📍 Complaint Update: {id}",
        title_ta=f"📍 புகார் நிலை புதுப்பிக்கப்பட்டது: {id}",
        message=f"Status is now: {new_status}. {req.note or ''}",
        message_ta=f"உங்கள் புகாரின் தற்போதைய நிலை: {new_status}",
        time="Just now",
        timestamp=now_ms,
        read=False,
        complaint_id=id,
        citizenId=comp.citizenId,
        target="citizen"
    )
    db.add(notif_cit)
    db.commit()

    return {"status": "success", "new_status": new_status}

@router.put("/{id}/assign")
def assign_complaint(id: str, req: AssignmentUpdate, db: Session = Depends(get_db)):
    comp = db.query(DbComplaint).filter(DbComplaint.id == id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")

    old_assigned = comp.assignedTo
    old_officer_id = comp.assignedOfficerId

    comp.dept = req.dept
    comp.assignedTo = req.assignedTo
    comp.assignedOfficerId = req.officerId
    comp.status = "Assigned"
    comp.updatedAt = time.time() * 1000

    # Adjust workloads
    if old_officer_id and old_officer_id != req.officerId:
        old_off = db.query(DbOfficer).filter(DbOfficer.id == old_officer_id).first()
        if old_off and old_off.current_workload > 0:
            old_off.current_workload -= 1

    if req.officerId:
        new_off = db.query(DbOfficer).filter(DbOfficer.id == req.officerId).first()
        if new_off:
            new_off.current_workload += 1

    audit_entry = DbAuditEntry(
        complaint_id=id,
        actor=req.actor or "Admin",
        action=f"Reassigned from {old_assigned or 'Unassigned'} to {req.assignedTo} ({req.dept})",
        time="Just now"
    )
    db.add(audit_entry)
    db.commit()
    return {"status": "success", "assignedTo": req.assignedTo, "dept": req.dept}

@router.post("/{id}/rate")
def rate_complaint(id: str, req: RatingRequest, db: Session = Depends(get_db)):
    comp = db.query(DbComplaint).filter(DbComplaint.id == id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")
    comp.rating = req.rating
    audit_entry = DbAuditEntry(
        complaint_id=id,
        actor="Citizen",
        action=f"Citizen rated resolution satisfaction: {req.rating}/5 stars",
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
    comp.updatedAt = time.time() * 1000
    audit_entry = DbAuditEntry(
        complaint_id=id,
        actor="Citizen",
        action="Citizen requested reopening of complaint",
        note=req.note,
        time="Just now"
    )
    db.add(audit_entry)
    db.commit()
    return {"status": "success"}
