from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.db import get_db
from app.models.models import DbDepartment, DbOfficer, DbComplaint

router = APIRouter(prefix="/departments", tags=["departments"])

@router.get("")
def get_departments(db: Session = Depends(get_db)):
    depts = db.query(DbDepartment).filter(DbDepartment.active == True).all()
    res = []
    for d in depts:
        officer_count = db.query(DbOfficer).filter(DbOfficer.dept == d.name, DbOfficer.active == True).count()
        open_complaints = db.query(DbComplaint).filter(
            DbComplaint.dept == d.name,
            DbComplaint.status.notin_(["Closed", "Resolved"])
        ).count()
        resolved_complaints = db.query(DbComplaint).filter(
            DbComplaint.dept == d.name,
            DbComplaint.status.in_(["Closed", "Resolved"])
        ).count()

        res.append({
            "id": d.id,
            "name": d.name,
            "code": d.code,
            "description": d.description,
            "head_officer": d.head_officer,
            "contact_email": d.contact_email,
            "phone": d.phone,
            "active": d.active,
            "officer_count": officer_count,
            "open_complaints": open_complaints,
            "resolved_complaints": resolved_complaints
        })
    return res

@router.get("/{id}")
def get_department(id: str, db: Session = Depends(get_db)):
    d = db.query(DbDepartment).filter(DbDepartment.id == id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Department not found")
    return {
        "id": d.id,
        "name": d.name,
        "code": d.code,
        "description": d.description,
        "head_officer": d.head_officer,
        "contact_email": d.contact_email,
        "phone": d.phone,
        "active": d.active
    }
