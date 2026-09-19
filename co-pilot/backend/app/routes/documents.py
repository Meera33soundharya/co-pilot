from fastapi import APIRouter, UploadFile, File
from app.services.ai_service import summarize_document

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        text = contents.decode("utf-8", errors="ignore")
    except Exception:
        text = "Evidence document describing constituency infrastructural needs."
        
    summary_points = summarize_document(text)
    return {
        "fileName": file.filename,
        "summary": summary_points
    }
