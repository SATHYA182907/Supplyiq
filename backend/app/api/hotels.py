from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
import json
from app.models.schemas import HotelResponse, HotelOffer
from app.database.store import db_store

router = APIRouter(prefix="/hotels", tags=["Hotel Inventory"])

@router.get("", response_model=List[HotelResponse])
def get_hotels(
    search: Optional[str] = None,
    city: Optional[str] = None,
    supplier_id: Optional[str] = None,
    star_rating: Optional[float] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    availability: Optional[str] = None,
    matching_status: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    conn = db_store.get_connection()
    cur = conn.cursor()
    query = """
        SELECT h.*, s.name as supplier_name
        FROM hotels h
        LEFT JOIN suppliers s ON h.supplier_id = s.id
        WHERE 1=1
    """
    params = []
    if search:
        query += " AND (LOWER(h.name) LIKE ? OR LOWER(h.city) LIKE ?)"
        params.extend([f"%{search.lower()}%", f"%{search.lower()}%"])
    if city:
        query += " AND LOWER(h.city) = LOWER(?)"
        params.append(city)
    if supplier_id:
        query += " AND h.supplier_id = ?"
        params.append(supplier_id)
    if star_rating:
        query += " AND h.star_rating >= ?"
        params.append(star_rating)
    if min_price:
        query += " AND h.base_price >= ?"
        params.append(min_price)
    if max_price:
        query += " AND h.base_price <= ?"
        params.append(max_price)
    if availability:
        query += " AND h.availability = ?"
        params.append(availability)
    if matching_status:
        query += " AND h.matching_status = ?"
        params.append(matching_status.upper())
        
    query += " ORDER BY h.star_rating DESC, h.base_price ASC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    cur.execute(query, params)
    rows = cur.fetchall()
    
    results = []
    for r in rows:
        d = dict(r)
        d["facilities"] = json.loads(d["facilities"]) if d.get("facilities") else []
        d["rooms"] = json.loads(d["rooms"]) if d.get("rooms") else []
        results.append(d)
        
    conn.close()
    return results

@router.get("/{hotel_id}", response_model=HotelResponse)
def get_hotel_details(hotel_id: str):
    conn = db_store.get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT h.*, s.name as supplier_name
        FROM hotels h
        LEFT JOIN suppliers s ON h.supplier_id = s.id
        WHERE h.id = ?
    """, (hotel_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail=f"Hotel {hotel_id} not found")
        
    d = dict(row)
    d["facilities"] = json.loads(d["facilities"]) if d.get("facilities") else []
    d["rooms"] = json.loads(d["rooms"]) if d.get("rooms") else []
    return d

@router.get("/{hotel_id}/offers", response_model=List[HotelOffer])
def get_hotel_offers(hotel_id: str):
    conn = db_store.get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT o.*, s.name as supplier_name, s.reliability_score as supplier_reliability
        FROM hotel_offers o
        LEFT JOIN suppliers s ON o.supplier_id = s.id
        WHERE o.hotel_id = ?
        ORDER BY o.price ASC
    """, (hotel_id,))
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows
