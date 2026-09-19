from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import DbUser

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(DbUser).filter(DbUser.email == req.email).first()
    if not user or user.password != req.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    return {
        "id": user.id,
        "name": user.name,
        "role": user.role,
        "dept": user.dept,
        "citizenId": user.citizenId
    }
