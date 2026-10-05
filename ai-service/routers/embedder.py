from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import List
from loguru import logger

router = APIRouter()


class EmbedRequest(BaseModel):
    text: str


class BatchEmbedRequest(BaseModel):
    texts: List[str]


@router.post("/embed")
async def generate_embedding(request: Request, body: EmbedRequest):
    """Generate text embedding"""
    try:
        nlp_engine = getattr(request.app.state, 'nlp_engine', None)
        if not nlp_engine:
            raise HTTPException(status_code=503, detail="NLP engine not initialized")
        
        embedding = nlp_engine.get_embedding(body.text)
        return {"embedding": embedding, "dimensions": len(embedding)}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Embedding error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/embed/batch")
async def batch_embeddings(request: Request, body: BatchEmbedRequest):
    """Generate embeddings for multiple texts"""
    try:
        nlp_engine = getattr(request.app.state, 'nlp_engine', None)
        if not nlp_engine:
            raise HTTPException(status_code=503, detail="NLP engine not initialized")
        
        embeddings = nlp_engine.get_batch_embeddings(body.texts)
        return {"embeddings": embeddings, "count": len(embeddings)}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch embedding error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
