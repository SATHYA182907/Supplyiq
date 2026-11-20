from fastapi import APIRouter
from typing import Dict, Any
from app.core.config import settings
from app.database.store import db_store

router = APIRouter(prefix="/settings", tags=["System Settings & Demo Mode"])

@router.get("")
def get_system_settings():
    """Returns current system configuration, thresholds, and engine statuses."""
    return {
        "project_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database_mode": "Local SQLite Engine" if not settings.SUPABASE_URL else "Supabase PostgreSQL",
        "demo_mode": settings.DEMO_MODE,
        "matching_thresholds": {
            "strong_match": settings.STRONG_MATCH_THRESHOLD,
            "possible_match": settings.POSSIBLE_MATCH_THRESHOLD,
            "geo_tolerance_meters": settings.GEO_TOLERANCE_METERS
        },
        "ai_engine": {
            "fuzzy_algorithm": "RapidFuzz Levenshtein & Token Sort",
            "semantic_embeddings": "Character & Token N-Gram Vector Cosine",
            "geodesic_engine": "Haversine Distance (Meters)",
            "llm_explanation": "Gemini API (Configured)" if settings.GEMINI_API_KEY else "Deterministic Grounded Natural Language"
        }
    }

@router.post("/reset-demo")
def reset_demo_data():
    """Resets the platform dataset to initial clean state."""
    return db_store.reset_demo_data()
