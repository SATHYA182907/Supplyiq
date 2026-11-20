from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from app.models.schemas import RankingRequest, RankingResponse
from app.database.store import db_store
from app.engines.ranking.ranking_engine import IntelligentRankingEngine

router = APIRouter(prefix="/ranking", tags=["Intelligent Ranking Engine"])
ranking_engine = IntelligentRankingEngine()

@router.post("/search", response_model=RankingResponse)
def execute_smart_ranking(request: RankingRequest):
    """
    Executes multi-criteria optimization ranking.
    Formula: R = 0.30P + 0.25V + 0.15S + 0.15C + 0.10Q + 0.05U
    Applies hard constraints first, then scores and explains recommendations.
    """
    conn = db_store.get_connection()
    cur = conn.cursor()
    
    if request.product_type == "HOTEL":
        cur.execute("""
            SELECT h.*, s.name as supplier_name, s.reliability_score as supplier_reliability
            FROM hotels h
            JOIN suppliers s ON h.supplier_id = s.id
        """)
        offers = [dict(r) for r in cur.fetchall()]
    else:
        cur.execute("""
            SELECT sp.*, sp.base_price as price, sp.destination_city as city,
                   s.name as supplier_name, s.reliability_score as supplier_reliability
            FROM sightseeing_products sp
            JOIN suppliers s ON sp.supplier_id = s.id
        """)
        offers = [dict(r) for r in cur.fetchall()]
        
    conn.close()

    weights = {
        "weight_price": request.weight_price,
        "weight_relevance": request.weight_relevance,
        "weight_supplier_reliability": request.weight_supplier_reliability,
        "weight_cancellation": request.weight_cancellation,
        "weight_info_quality": request.weight_info_quality,
        "weight_preference": request.weight_preference
    }

    result = ranking_engine.rank_hotel_offers(
        offers=offers,
        destination=request.destination,
        max_budget=request.max_budget,
        min_star_rating=request.min_star_rating,
        cancellation_preferred=request.cancellation_preferred,
        preferred_suppliers=request.preferred_suppliers,
        weights=weights
    )

    return result
