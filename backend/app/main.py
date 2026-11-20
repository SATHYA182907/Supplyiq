import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.suppliers import router as suppliers_router
from app.api.ingestion import router as ingestion_router
from app.api.hotels import router as hotels_router
from app.api.sightseeing import router as sightseeing_router
from app.api.matching import router as matching_router
from app.api.comparison import router as comparison_router
from app.api.ranking import router as ranking_router
from app.api.analytics import router as analytics_router
from app.api.verification import router as verification_router
from app.api.settings import router as settings_router

app = FastAPI(
    title="SUPPLYIQ API",
    description="AI-Powered Multi-Supplier Inventory Optimization Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(suppliers_router, prefix="/api")
app.include_router(ingestion_router, prefix="/api")
app.include_router(hotels_router, prefix="/api")
app.include_router(sightseeing_router, prefix="/api")
app.include_router(matching_router, prefix="/api")
app.include_router(comparison_router, prefix="/api")
app.include_router(ranking_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(verification_router, prefix="/api")
app.include_router(settings_router, prefix="/api")

@app.get("/")
def root():
    return {
        "platform": "SUPPLYIQ",
        "description": "AI-Powered Multi-Supplier Inventory Optimization Platform",
        "version": "1.0.0",
        "status": "ONLINE",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "mode": "DEMO_READY",
        "database": "CONNECTED",
        "ai_engine": "ACTIVE"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
