from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
import json
from app.models.schemas import CanonicalComparisonGroup, HotelOffer
from app.database.store import db_store

router = APIRouter(prefix="/comparison", tags=["Supplier Comparison Engine"])

@router.get("/canonical-groups")
def get_canonical_comparison_groups():
    """Returns canonical product groups that have offers from multiple suppliers."""
    conn = db_store.get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT canonical_id, city, COUNT(DISTINCT supplier_id) as supplier_count, COUNT(*) as record_count,
               MIN(base_price) as min_price, MAX(base_price) as max_price,
               MIN(name) as sample_name
        FROM hotels
        WHERE canonical_id IS NOT NULL AND canonical_id != ''
        GROUP BY canonical_id, city
        HAVING supplier_count >= 2
        ORDER BY record_count DESC
    """)
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

@router.get("/hotels/{canonical_id}")
def compare_hotel_offers(canonical_id: str):
    """
    Compares all supplier offers for a canonical hotel.
    Highlights lowest eligible rate, best cancellation flexibility, and overall top offer.
    """
    conn = db_store.get_connection()
    cur = conn.cursor()
    
    # Fetch all hotels belonging to this canonical ID
    cur.execute("""
        SELECT h.id, h.name, h.supplier_id, h.city, h.star_rating, h.base_price,
               s.name as supplier_name, s.reliability_score as supplier_reliability
        FROM hotels h
        JOIN suppliers s ON h.supplier_id = s.id
        WHERE h.canonical_id = ? OR h.id = ?
    """, (canonical_id, canonical_id))
    hotels = cur.fetchall()
    
    if not hotels:
        conn.close()
        raise HTTPException(status_code=404, detail=f"No properties found for canonical ID {canonical_id}")
        
    hotel_ids = [h["id"] for h in hotels]
    placeholders = ",".join(["?"] * len(hotel_ids))
    
    # Fetch all offers for these properties
    cur.execute(f"""
        SELECT o.*, s.name as supplier_name, s.reliability_score as supplier_reliability
        FROM hotel_offers o
        JOIN suppliers s ON o.supplier_id = s.id
        WHERE o.hotel_id IN ({placeholders})
        ORDER BY o.price ASC
    """, hotel_ids)
    raw_offers = [dict(r) for r in cur.fetchall()]
    conn.close()

    if not raw_offers:
        # Fallback synthesize from the hotels themselves if offers table wasn't directly populated
        raw_offers = [{
            "id": f"OFFER-{h['id']}-1",
            "hotel_id": h["id"],
            "supplier_id": h["supplier_id"],
            "supplier_name": h["supplier_name"],
            "room_name": "Standard Deluxe Room",
            "standard_room_type": "Deluxe King",
            "meal_plan": "BB",
            "cancellation_policy": "FREE_CANCELLATION",
            "payment_terms": "PREPAID",
            "price": h["base_price"],
            "currency": "USD",
            "availability_status": "AVAILABLE",
            "supplier_reliability": h["supplier_reliability"]
        } for h in hotels]

    # Find key highlights
    lowest_price_offer = min(raw_offers, key=lambda x: x["price"])
    
    free_canc_offers = [o for o in raw_offers if "FREE" in (o.get("cancellation_policy") or "").upper()]
    best_canc_offer = min(free_canc_offers, key=lambda x: x["price"]) if free_canc_offers else lowest_price_offer
    
    # Best overall ranked offer: combination of low price + high reliability + cancellation
    best_ranked_offer = min(raw_offers, key=lambda x: (x["price"] * 0.6) - (x.get("supplier_reliability", 85.0) * 0.4))

    return {
        "canonical_id": canonical_id,
        "canonical_name": hotels[0]["name"],
        "city": hotels[0]["city"],
        "star_rating": hotels[0]["star_rating"],
        "total_suppliers_comparing": len(set(o["supplier_id"] for o in raw_offers)),
        "total_offers": len(raw_offers),
        "lowest_eligible_price_offer_id": lowest_price_offer["id"],
        "best_cancellation_offer_id": best_canc_offer["id"],
        "best_ranked_offer_id": best_ranked_offer["id"],
        "price_spread": {
            "min_price": lowest_price_offer["price"],
            "max_price": max(o["price"] for o in raw_offers),
            "savings_amount": round(max(o["price"] for o in raw_offers) - lowest_price_offer["price"], 2),
            "savings_percent": round(((max(o["price"] for o in raw_offers) - lowest_price_offer["price"]) / max(o["price"] for o in raw_offers)) * 100, 1) if max(o["price"] for o in raw_offers) > 0 else 0
        },
        "offers": raw_offers
    }

@router.get("/sightseeing/{canonical_id}")
def compare_sightseeing_offers(canonical_id: str):
    """Compares sightseeing supplier offers for the canonical experience."""
    conn = db_store.get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT sp.*, s.name as supplier_name, s.reliability_score as supplier_reliability
        FROM sightseeing_products sp
        JOIN suppliers s ON sp.supplier_id = s.id
        WHERE sp.canonical_id = ? OR sp.id = ?
        ORDER BY sp.base_price ASC
    """, (canonical_id, canonical_id))
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    
    if not rows:
        raise HTTPException(status_code=404, detail="No sightseeing offers found for this canonical ID")
        
    lowest = min(rows, key=lambda x: x["base_price"])
    
    return {
        "canonical_id": canonical_id,
        "attraction_name": rows[0]["attraction_name"],
        "destination_city": rows[0]["destination_city"],
        "lowest_price_offer_id": lowest["id"],
        "offers": rows
    }
