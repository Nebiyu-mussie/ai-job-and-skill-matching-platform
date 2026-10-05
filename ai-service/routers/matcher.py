from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from loguru import logger
from core.matcher_engine import MatcherEngine

router = APIRouter()


class CandidateData(BaseModel):
    skills: List[str] = []
    experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    location: Optional[str] = None
    resumeText: Optional[str] = None


class JobData(BaseModel):
    requiredSkills: List[str] = []
    niceToHaveSkills: List[str] = []
    experienceLevel: str = "mid"
    experienceYears: Optional[Dict[str, int]] = None
    educationLevel: Optional[str] = None
    location: Optional[Dict[str, Any]] = None
    description: str = ""


class MatchRequest(BaseModel):
    candidate: CandidateData
    job: JobData


class CandidateForRanking(BaseModel):
    userId: str
    skills: List[str] = []
    experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    resumeText: Optional[str] = None


class RankRequest(BaseModel):
    job_id: str
    candidates: List[CandidateForRanking]
    job_requirements: Dict[str, Any]


class SkillGapRequest(BaseModel):
    user_skills: List[str]
    target_skills: List[str]
    experience_level: str = "mid"


@router.post("/match")
async def match_candidate_to_job(request: Request, body: MatchRequest):
    """Calculate match score between candidate and job"""
    try:
        nlp_engine = getattr(request.app.state, 'nlp_engine', None)
        matcher = getattr(request.app.state, 'matcher_engine', MatcherEngine())
        
        result = matcher.calculate_match(
            body.candidate.model_dump(),
            body.job.model_dump(),
            nlp_engine,
        )
        
        logger.info(f"Match calculated: {result['overallScore']}% overall")
        return result
        
    except Exception as e:
        logger.error(f"Matching error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rank-candidates")
async def rank_candidates(request: Request, body: RankRequest):
    """Rank multiple candidates for a job"""
    try:
        if not body.candidates:
            return []
        
        nlp_engine = getattr(request.app.state, 'nlp_engine', None)
        matcher = getattr(request.app.state, 'matcher_engine', MatcherEngine())
        
        candidates = [c.model_dump() for c in body.candidates]
        
        ranked = matcher.rank_candidates(
            candidates,
            body.job_requirements,
            nlp_engine,
        )
        
        logger.info(f"Ranked {len(ranked)} candidates for job {body.job_id}")
        return ranked
        
    except Exception as e:
        logger.error(f"Ranking error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/skill-gap")
async def analyze_skill_gap(request: Request, body: SkillGapRequest):
    """Analyze skill gap between user and job requirements"""
    try:
        matcher = getattr(request.app.state, 'matcher_engine', MatcherEngine())
        
        user_lower = [s.lower() for s in body.user_skills]
        
        missing = [s for s in body.target_skills if s.lower() not in user_lower]
        partial = [
            s for s in body.target_skills
            if s.lower() not in user_lower and
            any(u in s.lower() or s.lower() in u for u in user_lower)
        ]
        
        gap_analysis = matcher._generate_skill_gap_analysis(
            body.user_skills,
            missing,
            body.experience_level,
        )
        
        return {
            "missingSkills": missing,
            "partialSkills": partial,
            "recommendations": gap_analysis,
        }
        
    except Exception as e:
        logger.error(f"Skill gap analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
