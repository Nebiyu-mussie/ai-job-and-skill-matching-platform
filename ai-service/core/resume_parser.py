import re
import io
from typing import Dict, List, Optional, Any
from loguru import logger
import httpx
import asyncio

try:
    import PyPDF2
    from pdfminer.high_level import extract_text as pdfminer_extract
    import docx
    PDF_SUPPORT = True
    DOCX_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False
    DOCX_SUPPORT = False
    logger.warning("PDF/DOCX support not available")


# Comprehensive skill taxonomy
SKILL_PATTERNS = {
    "Programming Languages": [
        "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust",
        "php", "ruby", "swift", "kotlin", "scala", "r", "matlab", "perl",
        "bash", "shell", "powershell", "lua", "haskell", "clojure", "dart",
        "objective-c", "fortran", "cobol", "assembly",
    ],
    "Frontend": [
        "react", "vue", "angular", "next.js", "nuxt.js", "svelte", "html", "css",
        "sass", "scss", "tailwind", "bootstrap", "material-ui", "chakra-ui",
        "redux", "zustand", "mobx", "webpack", "vite", "parcel", "gatsby",
        "jquery", "d3.js", "three.js", "webgl", "canvas",
    ],
    "Backend": [
        "node.js", "express", "fastapi", "django", "flask", "spring boot",
        "laravel", "rails", "asp.net", "nestjs", "gin", "fiber", "echo",
        "graphql", "rest api", "grpc", "microservices", "serverless",
    ],
    "Database": [
        "mongodb", "postgresql", "mysql", "sqlite", "redis", "elasticsearch",
        "cassandra", "dynamodb", "firebase", "supabase", "oracle", "sql server",
        "mariadb", "couchdb", "neo4j", "influxdb", "clickhouse",
    ],
    "Cloud & DevOps": [
        "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
        "jenkins", "github actions", "gitlab ci", "circleci", "travis ci",
        "nginx", "apache", "linux", "ubuntu", "centos", "ci/cd", "devops",
        "helm", "istio", "prometheus", "grafana", "elk stack", "datadog",
    ],
    "AI/ML": [
        "machine learning", "deep learning", "nlp", "computer vision",
        "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
        "opencv", "hugging face", "transformers", "llm", "bert", "gpt",
        "reinforcement learning", "neural networks", "data science",
        "data analysis", "tableau", "power bi", "spark", "hadoop",
    ],
    "Mobile": [
        "react native", "flutter", "android", "ios", "swift", "kotlin",
        "xamarin", "ionic", "expo", "firebase", "fastlane",
    ],
    "Tools": [
        "git", "github", "gitlab", "bitbucket", "jira", "confluence",
        "figma", "sketch", "adobe xd", "photoshop", "illustrator",
        "postman", "swagger", "linux", "vim", "vs code",
    ],
    "Soft Skills": [
        "leadership", "communication", "problem solving", "teamwork",
        "project management", "agile", "scrum", "kanban", "critical thinking",
        "time management", "collaboration", "presentation", "mentoring",
    ],
}

# Flatten skill list for searching
ALL_SKILLS = []
SKILL_CATEGORY_MAP = {}
for category, skills in SKILL_PATTERNS.items():
    for skill in skills:
        ALL_SKILLS.append(skill)
        SKILL_CATEGORY_MAP[skill] = category


class ResumeParser:
    """Advanced resume parser with NLP capabilities"""
    
    def __init__(self, nlp_engine=None):
        self.nlp_engine = nlp_engine
        
        # Email pattern
        self.email_pattern = re.compile(
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        )
        
        # Phone patterns (international)
        self.phone_pattern = re.compile(
            r'(?:\+?251|0)?[-.\s]?(?:\d{2}[-.\s]?\d{3}[-.\s]?\d{4}|'
            r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|'
            r'\d{10,12})'
        )
        
        # URL pattern
        self.url_pattern = re.compile(
            r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+[/\w .?=&-]*'
        )
        
        # Date patterns
        self.date_patterns = [
            re.compile(r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}', re.I),
            re.compile(r'\d{1,2}/\d{4}'),
            re.compile(r'\d{4}\s*[-–]\s*(?:\d{4}|present|current|now)', re.I),
            re.compile(r'\d{4}'),
        ]
    
    async def extract_text_from_url(self, file_url: str, file_type: str) -> str:
        """Download and extract text from file URL"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(file_url)
                response.raise_for_status()
                file_content = response.content
            
            if file_type == "pdf" and PDF_SUPPORT:
                return self._extract_text_from_pdf(file_content)
            elif file_type in ["doc", "docx"] and DOCX_SUPPORT:
                return self._extract_text_from_docx(file_content)
            else:
                # Try to decode as text
                return file_content.decode("utf-8", errors="ignore")
                
        except Exception as e:
            logger.error(f"Text extraction failed: {e}")
            return ""
    
    def _extract_text_from_pdf(self, content: bytes) -> str:
        """Extract text from PDF bytes"""
        try:
            # Try pdfminer first (better quality)
            text = pdfminer_extract(io.BytesIO(content))
            if text and len(text.strip()) > 50:
                return text
            
            # Fallback to PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            logger.error(f"PDF extraction error: {e}")
            return ""
    
    def _extract_text_from_docx(self, content: bytes) -> str:
        """Extract text from DOCX bytes"""
        try:
            doc = docx.Document(io.BytesIO(content))
            paragraphs = [para.text for para in doc.paragraphs]
            # Also extract text from tables
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        paragraphs.append(cell.text)
            return "\n".join(paragraphs)
        except Exception as e:
            logger.error(f"DOCX extraction error: {e}")
            return ""
    
    def parse(self, text: str) -> Dict[str, Any]:
        """Parse resume text and extract structured data"""
        if not text or len(text.strip()) < 10:
            return self._empty_result()
        
        # Clean text
        clean_text = self._clean_text(text)
        
        result = {
            "name": self._extract_name(clean_text),
            "email": self._extract_email(clean_text),
            "phone": self._extract_phone(clean_text),
            "location": self._extract_location(clean_text),
            "summary": self._extract_summary(clean_text),
            "skills": self._extract_skills(clean_text),
            "experience": self._extract_experience(clean_text),
            "education": self._extract_education(clean_text),
            "certifications": self._extract_certifications(clean_text),
            "languages": self._extract_languages(clean_text),
            "projects": self._extract_projects(clean_text),
            "totalExperienceYears": self._calculate_experience_years(clean_text),
            "extractedText": text[:5000],  # First 5000 chars
            "confidence": self._calculate_confidence(clean_text),
        }
        
        return result
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove multiple whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep important ones
        text = re.sub(r'[^\w\s@.+\-/()|,:#&]', ' ', text)
        return text.strip()
    
    def _extract_name(self, text: str) -> Optional[str]:
        """Extract person name from resume"""
        lines = text.split('\n')
        # Usually name is in first 5 lines
        for line in lines[:5]:
            line = line.strip()
            # Filter likely name lines (2-4 words, no special chars, not email)
            if (2 <= len(line.split()) <= 4 and 
                not self.email_pattern.search(line) and
                not any(char.isdigit() for char in line) and
                len(line) < 60):
                return line
        return None
    
    def _extract_email(self, text: str) -> Optional[str]:
        """Extract email address"""
        matches = self.email_pattern.findall(text)
        return matches[0].lower() if matches else None
    
    def _extract_phone(self, text: str) -> Optional[str]:
        """Extract phone number"""
        matches = self.phone_pattern.findall(text)
        if matches:
            phone = re.sub(r'[^\d+]', '', matches[0])
            if len(phone) >= 9:
                return phone
        return None
    
    def _extract_location(self, text: str) -> Optional[str]:
        """Extract location"""
        # Ethiopian cities
        ethiopian_cities = [
            "addis ababa", "dire dawa", "mekelle", "gondar", "hawassa",
            "bahir dar", "dessie", "jimma", "jijiga", "shashamane",
            "bishoftu", "adama", "harar", "nekemte", "asella",
        ]
        
        text_lower = text.lower()
        for city in ethiopian_cities:
            if city in text_lower:
                return city.title()
        
        # Try to find location keywords
        location_pattern = re.compile(
            r'(?:location|address|city|based in|lives in|residing in)[:\s]+([A-Za-z\s,]+)',
            re.I
        )
        match = location_pattern.search(text)
        if match:
            return match.group(1).strip()[:50]
        
        return None
    
    def _extract_summary(self, text: str) -> Optional[str]:
        """Extract professional summary"""
        patterns = [
            r'(?:professional\s+)?summary[:\s]+(.*?)(?=\n\n|\neducation|\nexperience|\nskills)',
            r'(?:about\s+me|profile|objective)[:\s]+(.*?)(?=\n\n|\neducation)',
            r'(?:career\s+)?objective[:\s]+(.*?)(?=\n\n)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.I | re.DOTALL)
            if match:
                summary = match.group(1).strip()
                if len(summary) > 50:
                    return summary[:2000]
        
        return None
    
    def _extract_skills(self, text: str) -> List[Dict]:
        """Extract skills with categorization"""
        text_lower = text.lower()
        found_skills = []
        seen = set()
        
        for skill in ALL_SKILLS:
            # Use word boundaries for short skills
            if len(skill) <= 4:
                pattern = r'\b' + re.escape(skill) + r'\b'
            else:
                pattern = re.escape(skill)
            
            if re.search(pattern, text_lower):
                if skill not in seen:
                    seen.add(skill)
                    found_skills.append({
                        "name": skill.title() if len(skill) <= 4 else skill,
                        "category": SKILL_CATEGORY_MAP.get(skill, "Other"),
                        "level": self._infer_skill_level(skill, text_lower),
                    })
        
        return found_skills
    
    def _infer_skill_level(self, skill: str, text: str) -> str:
        """Infer skill proficiency level from context"""
        # Look for level indicators near skill mention
        pattern = r'.{0,50}' + re.escape(skill) + r'.{0,50}'
        match = re.search(pattern, text, re.I)
        if match:
            context = match.group().lower()
            if any(w in context for w in ['expert', 'advanced', 'senior', 'lead', 'architect']):
                return 'expert'
            elif any(w in context for w in ['intermediate', 'mid', 'experienced', '3+ years', '4+ years']):
                return 'intermediate'
            elif any(w in context for w in ['beginner', 'basic', 'learning', 'junior', 'entry']):
                return 'beginner'
        return 'intermediate'
    
    def _extract_experience(self, text: str) -> List[Dict]:
        """Extract work experience"""
        experiences = []
        
        # Find experience section
        exp_pattern = re.compile(
            r'(?:work\s+)?experience[:\s]+(.*?)(?=\neducation|\ncertification|\nskills|\n\n\n)',
            re.I | re.DOTALL
        )
        
        match = exp_pattern.search(text)
        exp_text = match.group(1) if match else text
        
        # Pattern for job entries
        job_pattern = re.compile(
            r'([A-Za-z\s,]+?)\s*[\|\-–at]\s*([A-Za-z\s&,.]+?)\s*'
            r'(\d{4}|\w+\s+\d{4})\s*[-–to]+\s*(\d{4}|\w+\s+\d{4}|present|current)',
            re.I
        )
        
        for match in job_pattern.finditer(exp_text):
            experiences.append({
                "title": match.group(1).strip()[:100],
                "company": match.group(2).strip()[:100],
                "startDate": match.group(3).strip(),
                "endDate": match.group(4).strip(),
                "isCurrent": match.group(4).lower() in ['present', 'current', 'now'],
                "description": "",
            })
        
        return experiences[:10]  # Max 10 entries
    
    def _extract_education(self, text: str) -> List[Dict]:
        """Extract education history"""
        education = []
        
        # Degree patterns
        degree_pattern = re.compile(
            r'(?:b\.?s\.?c?|b\.?a\.?|m\.?s\.?c?|m\.?b\.?a\.?|ph\.?d\.?|'
            r'bachelor|master|doctorate|diploma|certificate|degree)\s+'
            r'(?:of\s+|in\s+)?([A-Za-z\s,]+)',
            re.I
        )
        
        # University patterns
        uni_pattern = re.compile(
            r'([A-Za-z\s]+(?:university|college|institute|school|academy))',
            re.I
        )
        
        degrees = degree_pattern.findall(text)
        universities = uni_pattern.findall(text)
        
        for i, degree in enumerate(degrees[:5]):
            edu_entry = {
                "degree": degree.strip()[:100],
                "institution": universities[i].strip()[:100] if i < len(universities) else "",
                "fieldOfStudy": degree.strip()[:100],
            }
            education.append(edu_entry)
        
        return education
    
    def _extract_certifications(self, text: str) -> List[Dict]:
        """Extract certifications"""
        certs = []
        
        cert_pattern = re.compile(
            r'(?:certified|certification|certificate|aws|azure|gcp|cisco|'
            r'comptia|pmp|scrum|cfa|cpa|cisa)[^.]*\.?[^.\n]*',
            re.I
        )
        
        for match in cert_pattern.finditer(text):
            cert_text = match.group().strip()
            if 5 < len(cert_text) < 200:
                certs.append({
                    "name": cert_text[:100],
                    "issuer": "",
                    "date": "",
                })
        
        return list({c['name']: c for c in certs}.values())[:10]
    
    def _extract_languages(self, text: str) -> List[Dict]:
        """Extract languages"""
        languages = []
        
        known_languages = [
            "english", "amharic", "oromo", "afaan oromo", "somali", "tigrinya",
            "french", "arabic", "swahili", "spanish", "portuguese", "italian",
            "german", "chinese", "japanese", "korean", "hindi",
        ]
        
        text_lower = text.lower()
        
        for lang in known_languages:
            if lang in text_lower:
                proficiency = self._infer_language_level(lang, text_lower)
                languages.append({
                    "name": lang.title(),
                    "proficiency": proficiency,
                })
        
        return languages
    
    def _infer_language_level(self, language: str, text: str) -> str:
        """Infer language proficiency"""
        pattern = r'.{0,100}' + re.escape(language) + r'.{0,100}'
        match = re.search(pattern, text, re.I)
        if match:
            context = match.group().lower()
            if any(w in context for w in ['native', 'mother tongue', 'first language']):
                return 'native'
            elif any(w in context for w in ['fluent', 'proficient', 'excellent', 'advanced']):
                return 'fluent'
            elif any(w in context for w in ['intermediate', 'good', 'working knowledge']):
                return 'conversational'
            elif any(w in context for w in ['basic', 'elementary', 'beginner']):
                return 'basic'
        return 'conversational'
    
    def _extract_projects(self, text: str) -> List[Dict]:
        """Extract projects"""
        projects = []
        
        project_section = re.search(
            r'projects?[:\s]+(.*?)(?=\n\n\n|\neducation|\nexperience|\nskills)',
            text,
            re.I | re.DOTALL
        )
        
        if project_section:
            project_text = project_section.group(1)
            # Split by project entries
            entries = re.split(r'\n(?=[A-Z])', project_text)
            
            for entry in entries[:5]:
                if len(entry.strip()) > 20:
                    lines = entry.strip().split('\n')
                    projects.append({
                        "name": lines[0].strip()[:100] if lines else "Project",
                        "description": '\n'.join(lines[1:]).strip()[:500] if len(lines) > 1 else "",
                        "technologies": self._extract_tech_from_text(entry),
                    })
        
        return projects
    
    def _extract_tech_from_text(self, text: str) -> List[str]:
        """Extract technologies mentioned in text"""
        text_lower = text.lower()
        found = []
        for skill in ALL_SKILLS[:100]:  # Check most common skills
            if skill in text_lower:
                found.append(skill.title())
        return found[:10]
    
    def _calculate_experience_years(self, text: str) -> Optional[int]:
        """Calculate total years of experience"""
        year_pattern = re.compile(r'(\d+)\+?\s+years?\s+(?:of\s+)?experience', re.I)
        match = year_pattern.search(text)
        if match:
            return int(match.group(1))
        
        # Count from date ranges
        date_range_pattern = re.compile(
            r'(\d{4})\s*[-–]\s*(\d{4}|present|current)',
            re.I
        )
        
        total_years = 0
        current_year = 2024
        
        for match in date_range_pattern.finditer(text):
            start = int(match.group(1))
            end_str = match.group(2).lower()
            end = current_year if end_str in ['present', 'current'] else int(end_str)
            years = end - start
            if 0 < years < 50:
                total_years += years
        
        return min(total_years, 40) if total_years > 0 else None
    
    def _calculate_confidence(self, text: str) -> float:
        """Calculate parsing confidence score"""
        score = 0.0
        checks = [
            (bool(self._extract_email(text)), 0.2),
            (bool(self._extract_phone(text)), 0.1),
            (len(self._extract_skills(text)) > 3, 0.3),
            (len(self._extract_experience(text)) > 0, 0.2),
            (len(self._extract_education(text)) > 0, 0.2),
        ]
        
        for condition, weight in checks:
            if condition:
                score += weight
        
        return round(score, 2)
    
    def _empty_result(self) -> Dict:
        """Return empty parse result"""
        return {
            "name": None,
            "email": None,
            "phone": None,
            "location": None,
            "summary": None,
            "skills": [],
            "experience": [],
            "education": [],
            "certifications": [],
            "languages": [],
            "projects": [],
            "totalExperienceYears": None,
            "extractedText": "",
            "confidence": 0.0,
        }
