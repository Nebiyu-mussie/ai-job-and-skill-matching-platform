from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from loguru import logger

router = APIRouter()


class UserProfile(BaseModel):
    skills: List[str] = []
    experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    jobPreferences: Optional[Dict[str, Any]] = None
    appliedJobs: List[str] = []


class RecommendRequest(BaseModel):
    user_id: str
    profile: UserProfile


@router.post("/recommend")
async def get_recommendations(request: Request, body: RecommendRequest):
    """Get personalized recommendations for a user"""
    try:
        profile = body.profile
        
        # Career paths based on skills
        career_paths = _generate_career_paths(profile.skills, profile.experience)
        
        # Skill recommendations
        skill_recommendations = _recommend_skills(profile.skills)
        
        return {
            "jobs": [],  # Jobs are recommended by the backend service
            "skills": skill_recommendations,
            "courses": [],  # Courses are from backend DB
            "careerPaths": career_paths,
        }
        
    except Exception as e:
        logger.error(f"Recommendation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _generate_career_paths(skills: List[str], experience: List[Dict]) -> List[Dict]:
    """Generate career path recommendations"""
    skill_lower = [s.lower() for s in skills]
    
    paths = []
    
    # Software Engineering path
    if any(s in skill_lower for s in ["javascript", "python", "java", "react", "node.js"]):
        paths.append({
            "title": "Senior Software Engineer",
            "currentFit": _calculate_fit(skill_lower, ["javascript", "python", "react", "system design"]),
            "timeline": "2-3 years",
            "requiredSkills": ["System Design", "Architecture", "Leadership"],
            "steps": [
                "Master system design principles",
                "Lead technical projects",
                "Get cloud certification",
                "Contribute to open source",
                "Build mentoring skills",
            ],
            "averageSalaryETB": 80000,
        })
    
    # Data Science path
    if any(s in skill_lower for s in ["python", "machine learning", "data analysis", "pandas"]):
        paths.append({
            "title": "Data Scientist",
            "currentFit": _calculate_fit(skill_lower, ["python", "machine learning", "statistics", "sql"]),
            "timeline": "1-2 years",
            "requiredSkills": ["Statistics", "Deep Learning", "Big Data"],
            "steps": [
                "Learn advanced statistics",
                "Master deep learning frameworks",
                "Work on Kaggle competitions",
                "Get ML certifications",
                "Build end-to-end ML projects",
            ],
            "averageSalaryETB": 90000,
        })
    
    # DevOps path
    if any(s in skill_lower for s in ["docker", "kubernetes", "aws", "ci/cd", "linux"]):
        paths.append({
            "title": "DevOps/Cloud Engineer",
            "currentFit": _calculate_fit(skill_lower, ["docker", "kubernetes", "aws", "terraform"]),
            "timeline": "1-2 years",
            "requiredSkills": ["Kubernetes", "Terraform", "Cloud Architecture"],
            "steps": [
                "Get AWS/Azure/GCP certification",
                "Master Kubernetes",
                "Learn Infrastructure as Code",
                "Build CI/CD pipelines",
                "Study security best practices",
            ],
            "averageSalaryETB": 85000,
        })
    
    return paths[:3]


def _calculate_fit(user_skills: List[str], required_skills: List[str]) -> int:
    """Calculate career path fit percentage"""
    if not required_skills:
        return 0
    matched = sum(1 for s in required_skills if s in user_skills)
    return min(95, round((matched / len(required_skills)) * 100))


def _recommend_skills(current_skills: List[str]) -> List[Dict]:
    """Recommend skills to learn based on current skills"""
    skill_lower = [s.lower() for s in current_skills]
    
    complementary_skills = {
        "javascript": ["typescript", "react", "node.js", "testing"],
        "python": ["django", "fastapi", "machine learning", "pandas"],
        "react": ["next.js", "typescript", "redux", "testing"],
        "java": ["spring boot", "microservices", "docker", "kubernetes"],
        "sql": ["postgresql", "mongodb", "redis", "data modeling"],
        "docker": ["kubernetes", "ci/cd", "terraform", "monitoring"],
        "machine learning": ["deep learning", "nlp", "computer vision", "mlops"],
    }
    
    recommended = []
    seen = set()
    
    for skill in skill_lower:
        if skill in complementary_skills:
            for rec_skill in complementary_skills[skill]:
                if rec_skill not in skill_lower and rec_skill not in seen:
                    seen.add(rec_skill)
                    recommended.append({
                        "name": rec_skill.title(),
                        "priority": "high" if rec_skill in ["typescript", "testing", "docker"] else "medium",
                        "reason": f"Complements your {skill.title()} skills",
                        "demandScore": 85,
                    })
    
    # Add high-demand skills if not many recommendations
    if len(recommended) < 5:
        high_demand = ["Cloud Computing", "DevOps", "TypeScript", "System Design", "Communication"]
        for skill in high_demand:
            if skill.lower() not in skill_lower and skill not in seen:
                seen.add(skill)
                recommended.append({
                    "name": skill,
                    "priority": "medium",
                    "reason": "High demand skill in the Ethiopian market",
                    "demandScore": 80,
                })
    
    return recommended[:10]
