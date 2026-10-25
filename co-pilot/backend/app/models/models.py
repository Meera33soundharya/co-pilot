from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.db import Base

class DbUser(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # admin, officer, citizen
    dept = Column(String, nullable=True)   # department name for officer
    citizenId = Column(String, nullable=True)

class DbDepartment(Base):
    __tablename__ = "departments"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    code = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    head_officer = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    active = Column(Boolean, default=True)

class DbOfficer(Base):
    __tablename__ = "officers"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    dept = Column(String, nullable=False)
    ward = Column(String, default="All Wards")
    designation = Column(String, default="Field Officer")
    active = Column(Boolean, default=True)
    max_workload = Column(Integer, default=15)
    current_workload = Column(Integer, default=0)

class DbComplaint(Base):
    __tablename__ = "complaints"

    id = Column(String, primary_key=True, index=True)
    citizen = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    ward = Column(String, nullable=False)
    citizenId = Column(String, nullable=True)

    category = Column(String, nullable=False)
    issue = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String, nullable=False)  # High, Medium, Low
    status = Column(String, nullable=False)    # New, Categorized, Assigned, In Progress, Pending Verification, Resolved, Closed

    assignedTo = Column(String, default="")
    assignedOfficerId = Column(String, nullable=True)
    dept = Column(String, default="")
    time = Column(String, default="Just now")
    timestamp = Column(Float, nullable=False)
    updatedAt = Column(Float, nullable=True)
    notified = Column(Boolean, default=False)
    
    # JSON-serialized array of evidence URLs
    evidence = Column(Text, default="[]") 
    supportingDocs = Column(Text, default="[]")
    location = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    notifPref = Column(String, default="SMS")
    sentiment = Column(Integer, default=75)
    rating = Column(Integer, nullable=True)
    resolutionProof = Column(Text, nullable=True)
    resolutionNotes = Column(Text, nullable=True)
    source = Column(String, default="online")  # "voice" | "online" | "field"

    # AI & Multi-lingual fields
    language = Column(String, default="ta")     # "ta" | "en"
    originalComplaintTamil = Column(Text, nullable=True)
    aiSummary = Column(Text, nullable=True)
    aiConfidence = Column(Float, default=0.92)
    aiReasoning = Column(Text, nullable=True)
    duplicateOf = Column(String, nullable=True)
    needsReview = Column(Boolean, default=False)

    audit = relationship("DbAuditEntry", back_populates="complaint", cascade="all, delete-orphan")

class DbAuditEntry(Base):
    __tablename__ = "audit_entries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    complaint_id = Column(String, ForeignKey("complaints.id"), nullable=False)
    time = Column(String, default="Just now")
    actor = Column(String, nullable=False)
    action = Column(String, nullable=False)
    note = Column(Text, nullable=True)
    image = Column(Text, nullable=True)

    complaint = relationship("DbComplaint", back_populates="audit")

class DbNotification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    type = Column(String, nullable=False)  # new_complaint, status_change, assignment, alert
    title = Column(String, nullable=False)
    title_ta = Column(String, nullable=True)
    message = Column(Text, nullable=False)
    message_ta = Column(Text, nullable=True)
    time = Column(String, default="Just now")
    timestamp = Column(Float, nullable=False)
    read = Column(Boolean, default=False)
    complaint_id = Column(String, nullable=True)
    priority = Column(String, nullable=True)
    dept = Column(String, nullable=True)
    citizenId = Column(String, nullable=True)
    target = Column(String, default="all")  # admin, officer, citizen, all

class DbAnnouncement(Base):
    __tablename__ = "announcements"

    id = Column(String, primary_key=True, index=True)
    title_en = Column(String, nullable=False)
    title_ta = Column(String, nullable=True)
    body_en = Column(Text, nullable=False)
    body_ta = Column(Text, nullable=True)
    type = Column(String, default="General")  # Alert, Resolution, Event, General
    ward = Column(String, default="All Wards")
    postedBy = Column(String, nullable=False)
    date = Column(String, nullable=False)
    pinned = Column(Boolean, default=False)
    timestamp = Column(Float, nullable=False)
    active = Column(Boolean, default=True)
