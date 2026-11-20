from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.schemas import SightseeingResponse
from app.database.store import db_store

router = APIRouter(prefix="/sightseeing", tags=["Sightseeing Inventory"])

@router.get("", response_model=List[SightseeingResponse])
def get_sightseeing(
    search: Optional[str] = None,
    destination_city: Optional[str] = None,
    supplier_id: Optional[str] = None,
    activity_type: Optional[str] = None,
    max_price: Optional[float] = None,
    matching_status: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    conn = db_store.get_connection()
    cur = conn.cursor()
    query = """
        SELECT sp.*, s.name as supplier_name
        FROM sightseeing_products sp
        LEFT JOIN suppliers s ON sp.supplier_id = s.id
        WHERE 1=1
    """
    params = []
    if search:
        query += " AND (LOWER(sp.product_title) LIKE ? OR LOWER(sp.attraction_name) LIKE ?)"
        params.extend([f"%{search.lower()}%", f"%{search.lower()}%"])
    if destination_city:
        query += " AND LOWER(sp.destination_city) = LOWER(?)"
        params.append(destination_city)
    if supplier_id:
        query += " AND sp.supplier_id = ?"
        params.append(supplier_id)
    if activity_type:
        query += " AND sp.activity_type = ?"
        params.append(activity_type.upper())
    if max_price:
        query += " AND sp.base_price <= ?"
        params.append(max_price)
    if matching_status:
        query += " AND sp.matching_status = ?"
        params.append(matching_status.upper())
        
    query += " ORDER BY sp.base_price ASC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    cur.execute(query, params)
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

@router.get("/{product_id}", response_model=SightseeingResponse)
def get_sightseeing_details(product_id: str):
    conn = db_store.get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT sp.*, s.name as supplier_name
        FROM sightseeing_products sp
        LEFT JOIN suppliers s ON sp.supplier_id = s.id
        WHERE sp.id = ?
    """, (product_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail=f"Sightseeing product {product_id} not found")
    return dict(row)
