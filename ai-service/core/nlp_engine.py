import spacy
from sentence_transformers import SentenceTransformer
from loguru import logger
from typing import List, Optional
import numpy as np


class NLPEngine:
    """Core NLP engine using spaCy and Sentence Transformers"""
    
    def __init__(self):
        self.nlp = None
        self.sentence_model = None
        self.model_name = "all-MiniLM-L6-v2"
    
    async def initialize(self):
        """Initialize NLP models"""
        try:
            logger.info("Loading spaCy model...")
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("✅ spaCy model loaded")
            
            logger.info(f"Loading Sentence Transformer: {self.model_name}...")
            self.sentence_model = SentenceTransformer(self.model_name)
            logger.info("✅ Sentence Transformer loaded")
            
        except Exception as e:
            logger.error(f"NLP initialization failed: {e}")
            raise
    
    def get_embedding(self, text: str) -> List[float]:
        """Generate sentence embedding for text"""
        if not self.sentence_model:
            raise RuntimeError("Sentence model not initialized")
        
        if not text or len(text.strip()) == 0:
            return []
        
        # Truncate to max 512 tokens
        text = text[:5000]
        embedding = self.sentence_model.encode(text, normalize_embeddings=True)
        return embedding.tolist()
    
    def get_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts"""
        if not self.sentence_model:
            raise RuntimeError("Sentence model not initialized")
        
        cleaned = [t[:5000] if t else "" for t in texts]
        embeddings = self.sentence_model.encode(cleaned, normalize_embeddings=True, batch_size=32)
        return embeddings.tolist()
    
    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        if not vec1 or not vec2:
            return 0.0
        
        a = np.array(vec1)
        b = np.array(vec2)
        
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
        
        return float(np.dot(a, b) / (norm_a * norm_b))
    
    def extract_entities(self, text: str) -> dict:
        """Extract named entities from text"""
        if not self.nlp or not text:
            return {}
        
        doc = self.nlp(text[:100000])
        entities = {
            "organizations": list(set([ent.text for ent in doc.ents if ent.label_ == "ORG"])),
            "locations": list(set([ent.text for ent in doc.ents if ent.label_ in ["GPE", "LOC"]])),
            "dates": list(set([ent.text for ent in doc.ents if ent.label_ == "DATE"])),
            "persons": list(set([ent.text for ent in doc.ents if ent.label_ == "PERSON"])),
            "money": list(set([ent.text for ent in doc.ents if ent.label_ == "MONEY"])),
        }
        return entities
    
    def extract_keywords(self, text: str, top_n: int = 20) -> List[str]:
        """Extract key phrases from text"""
        if not self.nlp or not text:
            return []
        
        doc = self.nlp(text[:50000])
        
        keywords = []
        # Extract noun chunks
        for chunk in doc.noun_chunks:
            cleaned = chunk.text.lower().strip()
            if 2 <= len(cleaned) <= 50:
                keywords.append(cleaned)
        
        # Extract important tokens
        for token in doc:
            if (token.pos_ in ["NOUN", "PROPN"] and 
                not token.is_stop and 
                len(token.text) > 2 and
                token.text.lower() not in keywords):
                keywords.append(token.text.lower())
        
        # Return unique keywords
        seen = set()
        unique_keywords = []
        for kw in keywords:
            if kw not in seen:
                seen.add(kw)
                unique_keywords.append(kw)
        
        return unique_keywords[:top_n]
