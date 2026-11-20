import os

class Settings:
    PROJECT_NAME: str = "SUPPLYIQ"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./supplyiq.db")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # Gemini AI
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Application Mode
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    
    # Matching Thresholds (Configurable)
    STRONG_MATCH_THRESHOLD: float = float(os.getenv("STRONG_MATCH_THRESHOLD", "94.0"))
    POSSIBLE_MATCH_THRESHOLD: float = float(os.getenv("POSSIBLE_MATCH_THRESHOLD", "75.0"))
    GEO_TOLERANCE_METERS: float = float(os.getenv("GEO_TOLERANCE_METERS", "350.0"))

settings = Settings()
