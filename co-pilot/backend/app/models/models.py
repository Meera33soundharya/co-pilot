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
    status = Column(String, nullable=False)    # Pending, Accepted, Rejected, Assigned, In Progress, Resolved, Closed

    assignedTo = Column(String, default="")
    dept = Column(String, default="")
    time = Column(String, default="Just now")
    timestamp = Column(Float, nullable=False)
    notified = Column(Boolean, default=False)
    
    # JSON-serialized array of evidence URLs
    evidence = Column(Text, default="[]") 
    location = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    notifPref = Column(String, default="SMS")
    sentiment = Column(Integer, default=75)
    rating = Column(Integer, nullable=True)
    resolutionProof = Column(Text, nullable=True)
    source = Column(String, default="online")  # "voice" | "online" | "field"

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
