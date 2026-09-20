import os
import json
import logging
import urllib.request
import urllib.error
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter(tags=["Translation"])
logger = logging.getLogger(__name__)

class TranslateRequest(BaseModel):
    text: str
    target_language: str

class TranslateResponse(BaseModel):
    translation: str

@router.post("/translate", response_model=TranslateResponse)
def translate_text(req: TranslateRequest):
    if not req.text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Text cannot be empty.")
    
    webhook_url = os.environ.get("N8N_TRANSLATION_WEBHOOK_URL")
    if not webhook_url:
        logger.error("N8N_TRANSLATION_WEBHOOK_URL environment variable is missing.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Translation service is not configured."
        )

    payload = json.dumps({
        "text": req.text,
        "target_language": req.target_language
    }).encode("utf-8")

    req_obj = urllib.request.Request(
        webhook_url,
        data=payload,
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req_obj, timeout=30) as response:
            res_body = response.read().decode("utf-8")
            data = json.loads(res_body)
            
            translation = data.get("translation")
            if translation is None:
                logger.error(f"Invalid response from n8n webhook: {res_body}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Invalid response format from translation service."
                )
                
            return TranslateResponse(translation=translation)
            
    except urllib.error.HTTPError as e:
        logger.error(f"HTTPError from n8n webhook: {e.code} {e.reason}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Translation service error: {e.reason}"
        )
    except urllib.error.URLError as e:
        logger.error(f"URLError from n8n webhook: {e.reason}")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Translation service is unreachable."
        )
    except json.JSONDecodeError as e:
        logger.error(f"Failed to decode JSON from n8n webhook: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Invalid response format from translation service."
        )
    except Exception as e:
        logger.exception("Unexpected error during translation")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during translation."
        )
