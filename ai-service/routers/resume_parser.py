from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import Optional
from loguru import logger
from core.resume_parser import ResumeParser

router = APIRouter()


class ResumeParseRequest(BaseModel):
    file_url: str
    file_type: str = "pdf"


@router.post("/parse-resume")
async def parse_resume(request: Request, body: ResumeParseRequest):
    """Parse a resume file and extract structured data"""
    try:
        nlp_engine = getattr(request.app.state, 'nlp_engine', None)
        parser = ResumeParser(nlp_engine)
        
        # Extract text from file
        text = await parser.extract_text_from_url(body.file_url, body.file_type)
        
        if not text or len(text.strip()) < 20:
            raise HTTPException(
                status_code=422,
                detail="Could not extract text from the provided file"
            )
        
        # Parse the resume
        result = parser.parse(text)
        
        # Generate embedding if NLP engine available
        if nlp_engine and text:
            try:
                embedding = nlp_engine.get_embedding(text[:3000])
                result["embedding"] = embedding
            except Exception as e:
                logger.warning(f"Embedding generation failed: {e}")
        
        logger.info(f"Resume parsed: {len(result.get('skills', []))} skills, "
                   f"{len(result.get('experience', []))} experience entries")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resume parsing error: {e}")
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")
