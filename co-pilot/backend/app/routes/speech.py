from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ai_service import generate_speech_script

router = APIRouter(prefix="/speech", tags=["speech"])

class SpeechRequest(BaseModel):
    topic: str
    language: str

@router.post("/generate")
def generate_speech(req: SpeechRequest):
    script = generate_speech_script(req.topic, req.language)
    return {
        "topic": req.topic,
        "language": req.language,
        "script": script
    }
