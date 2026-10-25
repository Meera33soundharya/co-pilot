from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.db import get_db
from app.models.models import DbOfficer, DbComplaint

router = APIRouter(prefix="/officers", tags=["officers"])

@router.get("")
def get_officers(dept: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(DbOfficer).filter(DbOfficer.active == True)
    if dept:
        query = query.filter(DbOfficer.dept == dept)
    officers = query.all()

    res = []
    for off in officers:
        assigned_complaints = db.query(DbComplaint).filter(
            DbComplaint.dept == off.dept,
            DbComplaint.status.notin_(["Closed", "Resolved"])
        ).count()

        res.append({
            "id": off.id,
            "user_id": off.user_id,
            "name": off.name,
            "email": off.email,
            "phone": off.phone,
            "dept": off.dept,
            "ward": off.ward,
            "designation": off.designation,
            "active": off.active,
            "max_workload": off.max_workload,
            "current_workload": off.current_workload,
            "assigned_complaints_count": assigned_complaints,
            "is_available": off.current_workload < off.max_workload
        })
    return res

@router.get("/eligible")
def get_eligible_officers(dept: str, ward: Optional[str] = "All Wards", db: Session = Depends(get_db)):
    officers = db.query(DbOfficer).filter(
        DbOfficer.dept == dept,
        DbOfficer.active == True
    ).all()

    res = []
    for off in officers:
        is_ward_match = (off.ward == "All Wards") or (ward and ward.lower() in off.ward.lower())
        res.append({
            "id": off.id,
            "name": off.name,
            "email": off.email,
            "phone": off.phone,
            "dept": off.dept,
            "ward": off.ward,
            "designation": off.designation,
            "is_ward_match": is_ward_match,
            "current_workload": off.current_workload,
            "max_workload": off.max_workload,
            "is_available": off.current_workload < off.max_workload
        })
    # Sort ward matches first, then lowest workload
    res.sort(key=lambda x: (not x["is_ward_match"], x["current_workload"]))
    return res
