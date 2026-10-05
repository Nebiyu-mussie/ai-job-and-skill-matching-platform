from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security.api_key import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
from loguru import logger
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

from routers import resume_parser, matcher, recommender, embedder, health
from core.nlp_engine import NLPEngine
from core.matcher_engine import MatcherEngine

# Global state
nlp_engine = None
matcher_engine = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    global nlp_engine, matcher_engine
    
    logger.info("🚀 Starting AI Service...")
    
    try:
        nlp_engine = NLPEngine()
        await nlp_engine.initialize()
        app.state.nlp_engine = nlp_engine
        logger.info("✅ NLP Engine initialized")
        
        matcher_engine = MatcherEngine()
        await matcher_engine.initialize()
        app.state.matcher_engine = matcher_engine
        logger.info("✅ Matcher Engine initialized")
        
    except Exception as e:
        logger.error(f"Failed to initialize AI engines: {e}")
        raise
    
    yield
    
    logger.info("👋 Shutting down AI Service...")


app = FastAPI(
    title="AI Job Matching Service",
    description="AI-powered resume parsing, job matching, and recommendation service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("BACKEND_URL", "http://localhost:5000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Key authentication
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def verify_api_key(api_key: str = Security(api_key_header)):
    expected_key = os.getenv("AI_SERVICE_API_KEY", "")
    if expected_key and api_key != expected_key:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return api_key

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(
    resume_parser.router,
    prefix="/api/v1",
    tags=["Resume Parser"],
    dependencies=[Depends(verify_api_key)],
)
app.include_router(
    matcher.router,
    prefix="/api/v1",
    tags=["Job Matcher"],
    dependencies=[Depends(verify_api_key)],
)
app.include_router(
    recommender.router,
    prefix="/api/v1",
    tags=["Recommender"],
    dependencies=[Depends(verify_api_key)],
)
app.include_router(
    embedder.router,
    prefix="/api/v1",
    tags=["Embedder"],
    dependencies=[Depends(verify_api_key)],
)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENVIRONMENT", "development") == "development",
        workers=int(os.getenv("WORKERS", 1)),
        log_level="info",
    )
