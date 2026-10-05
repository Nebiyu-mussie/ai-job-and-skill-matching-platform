from typing import List, Dict, Optional, Any
from loguru import logger
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity as sklearn_cosine
import re


class MatcherEngine:
    """AI-powered job-candidate matching engine"""
    
    def __init__(self, nlp_engine=None):
        self.nlp_engine = nlp_engine
        self.experience_weights = {
            "entry": 0,
            "junior": 1,
            "mid": 3,
            "senior": 5,
            "lead": 7,
            "director": 10,
            "executive": 15,
        }
        
        self.degree_weights = {
            "phd": 5,
            "doctorate": 5,
            "master": 4,
            "mba": 4,
            "bachelor": 3,
            "b.sc": 3,
            "b.a": 3,
            "diploma": 2,
            "certificate": 1,
        }
    
    async def initialize(self):
        """Initialize matcher engine"""
        logger.info("Matcher engine initialized")
    
    def calculate_match(
        self,
        candidate: Dict,
        job: Dict,
        nlp_engine=None
    ) -> Dict:
        """Calculate comprehensive match score"""
        
        # Calculate individual scores
        skill_score, matched_skills, missing_skills, extra_skills = self._calculate_skill_match(
            candidate.get("skills", []),
            job.get("requiredSkills", []),
            job.get("niceToHaveSkills", []),
        )
        
        experience_score = self._calculate_experience_match(
            candidate.get("experience", []),
            job.get("experienceLevel", "mid"),
            job.get("experienceYears"),
        )
        
        education_score = self._calculate_education_match(
            candidate.get("education", []),
            job.get("educationLevel"),
        )
        
        location_score = self._calculate_location_match(
            candidate.get("location"),
            job.get("location"),
        )
        
        # Semantic similarity if we have embeddings
        semantic_score = 0
        if nlp_engine and candidate.get("resumeText") and job.get("description"):
            try:
                candidate_emb = nlp_engine.get_embedding(candidate["resumeText"][:3000])
                job_emb = nlp_engine.get_embedding(job["description"][:3000])
                if candidate_emb and job_emb:
                    semantic_score = max(0, nlp_engine.cosine_similarity(candidate_emb, job_emb))
                    semantic_score = int(semantic_score * 100)
            except Exception as e:
                logger.warning(f"Semantic scoring failed: {e}")
        
        # Weighted overall score
        weights = {
            "skill": 0.45,
            "experience": 0.25,
            "education": 0.15,
            "location": 0.10,
            "semantic": 0.05,
        }
        
        overall_score = (
            skill_score * weights["skill"] +
            experience_score * weights["experience"] +
            education_score * weights["education"] +
            location_score * weights["location"] +
            semantic_score * weights["semantic"]
        )
        
        # Penalty for very low skill match
        if skill_score < 20:
            overall_score *= 0.7
        
        overall_score = min(100, max(0, round(overall_score)))
        
        # Generate skill gap analysis
        skill_gap_analysis = self._generate_skill_gap_analysis(
            candidate.get("skills", []),
            missing_skills,
            job.get("experienceLevel", "mid"),
        )
        
        return {
            "overallScore": overall_score,
            "skillMatchScore": skill_score,
            "experienceMatchScore": experience_score,
            "educationMatchScore": education_score,
            "locationMatchScore": location_score,
            "semanticScore": semantic_score,
            "matchedSkills": matched_skills,
            "missingSkills": missing_skills,
            "extraSkills": extra_skills,
            "skillGapAnalysis": skill_gap_analysis,
        }
    
    def _calculate_skill_match(
        self,
        candidate_skills: List[str],
        required_skills: List[str],
        nice_to_have_skills: List[str] = None
    ) -> tuple:
        """Calculate skill matching score"""
        if not required_skills:
            return 50, [], [], candidate_skills
        
        candidate_lower = [s.lower() for s in candidate_skills]
        
        matched = []
        missing = []
        
        for skill in required_skills:
            skill_lower = skill.lower()
            # Check exact and partial matches
            if skill_lower in candidate_lower:
                matched.append(skill)
            elif any(skill_lower in c or c in skill_lower for c in candidate_lower):
                matched.append(skill)
            else:
                missing.append(skill)
        
        # Bonus for nice-to-have skills
        bonus = 0
        if nice_to_have_skills:
            nice_matched = sum(
                1 for s in nice_to_have_skills
                if s.lower() in candidate_lower
            )
            bonus = min(10, (nice_matched / len(nice_to_have_skills)) * 10)
        
        # Extra skills
        required_lower = [s.lower() for s in required_skills]
        extra = [s for s in candidate_skills if s.lower() not in required_lower]
        
        base_score = (len(matched) / len(required_skills)) * 100
        score = min(100, round(base_score + bonus))
        
        return score, matched, missing, extra[:20]
    
    def _calculate_experience_match(
        self,
        candidate_experience: List[Dict],
        required_level: str,
        required_years: Optional[Dict] = None,
    ) -> int:
        """Calculate experience match score"""
        # Calculate candidate's total experience years
        total_years = self._calculate_total_experience_years(candidate_experience)
        
        required_min_years = self.experience_weights.get(required_level, 0)
        
        if required_years:
            required_min_years = required_years.get("min", required_min_years)
        
        if total_years == 0 and required_min_years == 0:
            return 100
        
        if required_min_years == 0:
            return 90  # Any experience is good for entry level
        
        ratio = total_years / required_min_years
        
        if ratio >= 1.5:
            return 100
        elif ratio >= 1.0:
            return 90
        elif ratio >= 0.7:
            return 75
        elif ratio >= 0.5:
            return 60
        elif ratio >= 0.3:
            return 40
        else:
            return 20
    
    def _calculate_total_experience_years(self, experience: List[Dict]) -> float:
        """Calculate total years of work experience"""
        total = 0
        current_year = 2024
        
        for exp in experience:
            start_year = self._parse_year(exp.get("startDate", ""))
            end_year = current_year if exp.get("isCurrent") else self._parse_year(exp.get("endDate", ""))
            
            if start_year and end_year:
                years = end_year - start_year
                if 0 < years < 50:
                    total += years
        
        return total
    
    def _parse_year(self, date_str: str) -> Optional[int]:
        """Extract year from date string"""
        if not date_str:
            return None
        year_match = re.search(r'\d{4}', str(date_str))
        if year_match:
            year = int(year_match.group())
            if 1970 <= year <= 2030:
                return year
        return None
    
    def _calculate_education_match(
        self,
        candidate_education: List[Dict],
        required_level: Optional[str],
    ) -> int:
        """Calculate education match score"""
        if not required_level:
            return 75  # No specific requirement
        
        if not candidate_education:
            return 30
        
        candidate_level_score = 0
        for edu in candidate_education:
            degree = edu.get("degree", "").lower()
            for level, score in self.degree_weights.items():
                if level in degree:
                    candidate_level_score = max(candidate_level_score, score)
        
        required_lower = required_level.lower()
        required_score = next(
            (v for k, v in self.degree_weights.items() if k in required_lower),
            2
        )
        
        if candidate_level_score >= required_score:
            return 100
        elif candidate_level_score >= required_score - 1:
            return 80
        elif candidate_level_score >= required_score - 2:
            return 60
        else:
            return 40
    
    def _calculate_location_match(
        self,
        candidate_location: Optional[str],
        job_location: Optional[Dict],
    ) -> int:
        """Calculate location match score"""
        if not job_location:
            return 75
        
        if job_location.get("isRemote"):
            return 100
        
        if not candidate_location:
            return 50
        
        candidate_lower = candidate_location.lower()
        job_city = (job_location.get("city") or "").lower()
        job_country = (job_location.get("country") or "").lower()
        
        if job_city and job_city in candidate_lower:
            return 100
        elif job_country and job_country in candidate_lower:
            return 75
        else:
            return 40
    
    def _generate_skill_gap_analysis(
        self,
        user_skills: List[str],
        missing_skills: List[str],
        experience_level: str,
    ) -> List[Dict]:
        """Generate detailed skill gap analysis with recommendations"""
        analysis = []
        
        course_db = {
            "python": [
                {"type": "course", "title": "Python for Everybody", "provider": "Coursera", "url": "https://coursera.org", "duration": "8 weeks"},
                {"type": "course", "title": "Complete Python Bootcamp", "provider": "Udemy", "url": "https://udemy.com", "duration": "4 weeks"},
            ],
            "javascript": [
                {"type": "course", "title": "The Complete JavaScript Course", "provider": "Udemy", "url": "https://udemy.com", "duration": "6 weeks"},
                {"type": "course", "title": "JavaScript Algorithms", "provider": "freeCodeCamp", "url": "https://freecodecamp.org", "duration": "Free"},
            ],
            "react": [
                {"type": "course", "title": "React - The Complete Guide", "provider": "Udemy", "url": "https://udemy.com", "duration": "5 weeks"},
                {"type": "course", "title": "React Docs Tutorial", "provider": "React.dev", "url": "https://react.dev", "duration": "Free"},
            ],
            "machine learning": [
                {"type": "course", "title": "Machine Learning Specialization", "provider": "Coursera/DeepLearning.AI", "url": "https://coursera.org", "duration": "3 months"},
                {"type": "certification", "title": "AWS Machine Learning Specialty", "provider": "AWS", "url": "https://aws.amazon.com/certification", "duration": "3 months prep"},
            ],
            "aws": [
                {"type": "certification", "title": "AWS Cloud Practitioner", "provider": "AWS", "url": "https://aws.amazon.com/certification", "duration": "1 month"},
                {"type": "certification", "title": "AWS Solutions Architect Associate", "provider": "AWS", "url": "https://aws.amazon.com/certification", "duration": "3 months"},
            ],
            "docker": [
                {"type": "course", "title": "Docker & Kubernetes: The Practical Guide", "provider": "Udemy", "url": "https://udemy.com", "duration": "3 weeks"},
            ],
            "kubernetes": [
                {"type": "certification", "title": "Certified Kubernetes Administrator (CKA)", "provider": "CNCF", "url": "https://cncf.io", "duration": "3 months"},
            ],
        }
        
        for skill in missing_skills[:10]:
            skill_lower = skill.lower()
            recommendations = course_db.get(skill_lower, [
                {
                    "type": "course",
                    "title": f"Learn {skill}",
                    "provider": "Coursera / Udemy",
                    "url": f"https://www.coursera.org/search?query={skill.replace(' ', '+')}",
                    "duration": "2-4 weeks",
                }
            ])
            
            analysis.append({
                "skill": skill,
                "gap": "Missing",
                "priority": "high" if skill_lower in ["python", "javascript", "react", "sql"] else "medium",
                "recommendations": recommendations[:2],
            })
        
        return analysis
    
    def rank_candidates(
        self,
        candidates: List[Dict],
        job: Dict,
        nlp_engine=None,
    ) -> List[Dict]:
        """Rank multiple candidates for a job"""
        ranked = []
        
        for candidate in candidates:
            score = self.calculate_match(candidate, job, nlp_engine)
            ranked.append({
                "userId": candidate["userId"],
                "score": score["overallScore"],
                "details": score,
            })
        
        # Sort by score descending
        ranked.sort(key=lambda x: x["score"], reverse=True)
        
        # Add rank
        for i, candidate in enumerate(ranked):
            candidate["rank"] = i + 1
        
        return ranked
