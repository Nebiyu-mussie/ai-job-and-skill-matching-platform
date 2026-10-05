from fastapi import APIRouter, Request
from datetime import datetime
import psutil
import os

router = APIRouter()


@router.get("/health")
async def health_check(request: Request):
    """Health check endpoint"""
    nlp_ready = hasattr(request.app.state, 'nlp_engine') and request.app.state.nlp_engine is not None
    matcher_ready = hasattr(request.app.state, 'matcher_engine') and request.app.state.matcher_engine is not None
    
    return {
        "status": "healthy" if nlp_ready and matcher_ready else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "services": {
            "nlp_engine": "ready" if nlp_ready else "not_ready",
            "matcher_engine": "ready" if matcher_ready else "not_ready",
        },
        "system": {
            "cpu_percent": psutil.cpu_percent(),
            "memory_percent": psutil.virtual_memory().percent,
        }
    }
