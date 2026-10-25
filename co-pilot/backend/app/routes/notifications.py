import time
import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.db import get_db
from app.models.models import DbNotification

router = APIRouter(prefix="/notifications", tags=["notifications"])

class NotificationCreate(BaseModel):
    type: str
    title: str
    title_ta: Optional[str] = None
    message: str
    message_ta: Optional[str] = None
    priority: Optional[str] = "Medium"
    complaintId: Optional[str] = None
    dept: Optional[str] = None
    citizenId: Optional[str] = None
    target: Optional[str] = "all"

@router.get("")
def get_notifications(
    target: Optional[str] = None,
    citizenId: Optional[str] = None,
    dept: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(DbNotification).order_by(DbNotification.timestamp.desc())

    if target:
        if target == "admin":
            query = query.filter(DbNotification.target.in_(["admin", "all"]))
        elif target == "officer":
            if dept:
                query = query.filter(
                    DbNotification.target.in_(["officer", "all"]),
                    (DbNotification.dept == dept) | (DbNotification.dept == None)
                )
            else:
                query = query.filter(DbNotification.target.in_(["officer", "all"]))
        elif target == "citizen":
            if citizenId:
                query = query.filter(
                    DbNotification.target.in_(["citizen", "all"]),
                    (DbNotification.citizenId == citizenId) | (DbNotification.citizenId == None)
                )
            else:
                query = query.filter(DbNotification.target.in_(["citizen", "all"]))

    notifications = query.limit(100).all()
    return [
        {
            "id": n.id,
            "type": n.type,
            "title": n.title,
            "title_ta": n.title_ta,
            "message": n.message,
            "message_ta": n.message_ta,
            "time": n.time,
            "timestamp": n.timestamp,
            "read": bool(n.read),
            "complaintId": n.complaint_id,
            "priority": n.priority,
            "dept": n.dept,
            "citizenId": n.citizenId,
            "target": n.target
        }
        for n in notifications
    ]

@router.post("")
def create_notification(req: NotificationCreate, db: Session = Depends(get_db)):
    nid = "NOTIF-" + uuid.uuid4().hex[:6].upper()
    now = time.time() * 1000
    notif = DbNotification(
        id=nid,
        type=req.type,
        title=req.title,
        title_ta=req.title_ta,
        message=req.message,
        message_ta=req.message_ta,
        time="Just now",
        timestamp=now,
        read=False,
        complaint_id=req.complaintId,
        priority=req.priority,
        dept=req.dept,
        citizenId=req.citizenId,
        target=req.target or "all"
    )
    db.add(notif)
    db.commit()
    return {"id": nid, "status": "created"}

@router.put("/{id}/read")
def mark_read(id: str, db: Session = Depends(get_db)):
    n = db.query(DbNotification).filter(DbNotification.id == id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.read = True
    db.commit()
    return {"status": "success"}

@router.delete("/{id}")
def delete_notification(id: str, db: Session = Depends(get_db)):
    n = db.query(DbNotification).filter(DbNotification.id == id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(n)
    db.commit()
    return {"status": "deleted"}
