import time
import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from app.database.db import get_db
from app.models.models import DbAnnouncement

router = APIRouter(prefix="/announcements", tags=["announcements"])

class AnnouncementPayload(BaseModel):
    title: Dict[str, str]  # {"en": "...", "ta": "..."}
    body: Dict[str, str]   # {"en": "...", "ta": "..."}
    type: Optional[str] = "General"  # Alert, Resolution, Event, General
    ward: Optional[str] = "All Wards"
    postedBy: Optional[str] = "District Admin"
    pinned: Optional[bool] = False

@router.get("")
def get_announcements(db: Session = Depends(get_db)):
    anns = db.query(DbAnnouncement).filter(
        DbAnnouncement.active == True
    ).order_by(DbAnnouncement.pinned.desc(), DbAnnouncement.timestamp.desc()).all()

    return [
        {
            "id": a.id,
            "title": {"en": a.title_en, "ta": a.title_ta or a.title_en},
            "body": {"en": a.body_en, "ta": a.body_ta or a.body_en},
            "type": a.type,
            "ward": a.ward,
            "postedBy": a.postedBy,
            "date": a.date,
            "pinned": bool(a.pinned),
            "timestamp": a.timestamp,
        }
        for a in anns
    ]

@router.post("")
def create_announcement(req: AnnouncementPayload, db: Session = Depends(get_db)):
    aid = "ANN-" + uuid.uuid4().hex[:4].upper()
    now = time.time() * 1000
    date_str = time.strftime("%d %b %Y")

    ann = DbAnnouncement(
        id=aid,
        title_en=req.title.get("en", ""),
        title_ta=req.title.get("ta", req.title.get("en", "")),
        body_en=req.body.get("en", ""),
        body_ta=req.body.get("ta", req.body.get("en", "")),
        type=req.type or "General",
        ward=req.ward or "All Wards",
        postedBy=req.postedBy or "District Admin",
        date=date_str,
        pinned=bool(req.pinned),
        timestamp=now,
        active=True
    )
    db.add(ann)
    db.commit()
    return {"id": aid, "status": "created"}

@router.put("/{id}")
def update_announcement(id: str, req: AnnouncementPayload, db: Session = Depends(get_db)):
    ann = db.query(DbAnnouncement).filter(DbAnnouncement.id == id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")

    if "en" in req.title:
        ann.title_en = req.title["en"]
    if "ta" in req.title:
        ann.title_ta = req.title["ta"]
    if "en" in req.body:
        ann.body_en = req.body["en"]
    if "ta" in req.body:
        ann.body_ta = req.body["ta"]
    if req.type:
        ann.type = req.type
    if req.ward:
        ann.ward = req.ward
    if req.pinned is not None:
        ann.pinned = req.pinned

    db.commit()
    return {"status": "updated"}

@router.delete("/{id}")
def delete_announcement(id: str, db: Session = Depends(get_db)):
    ann = db.query(DbAnnouncement).filter(DbAnnouncement.id == id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    ann.active = False
    db.commit()
    return {"status": "deleted"}
