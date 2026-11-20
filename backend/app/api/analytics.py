from fastapi import APIRouter
from typing import List, Dict, Any
from app.models.schemas import DashboardSummary, SupplierPerformanceItem
from app.database.store import db_store

router = APIRouter(prefix="/analytics", tags=["Supplier & Inventory Analytics"])

@router.get("/dashboard", response_model=DashboardSummary)
def get_dashboard_summary():
    """Returns top-level dashboard metrics calculated from the database."""
    return db_store.get_dashboard_summary()

@router.get("/suppliers", response_model=List[SupplierPerformanceItem])
def get_supplier_performance():
    """Returns supplier performance and reliability metrics."""
    conn = db_store.get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT sp.supplier_id, s.name as supplier_name,
               AVG(sp.total_offers) as total_offers,
               AVG(sp.successful_bookings) as successful_bookings,
               AVG(sp.failed_bookings) as failed_bookings,
               AVG(sp.availability_accuracy) as availability_accuracy,
               AVG(sp.price_accuracy) as price_accuracy,
               AVG(sp.cancellation_accuracy) as cancellation_accuracy,
               AVG(sp.avg_response_time_ms) as avg_response_time_ms,
               AVG(sp.data_completeness) as data_completeness,
               s.reliability_score
        FROM supplier_performance sp
        JOIN suppliers s ON sp.supplier_id = s.id
        GROUP BY sp.supplier_id, s.name, s.reliability_score
        ORDER BY s.reliability_score DESC
    """)
    rows = []
    for r in cur.fetchall():
        rows.append({
            "supplier_id": r["supplier_id"],
            "supplier_name": r["supplier_name"],
            "total_offers": int(r["total_offers"]),
            "successful_bookings": int(r["successful_bookings"]),
            "failed_bookings": int(r["failed_bookings"]),
            "availability_accuracy": round(r["availability_accuracy"], 2),
            "price_accuracy": round(r["price_accuracy"], 2),
            "cancellation_accuracy": round(r["cancellation_accuracy"], 2),
            "avg_response_time_ms": int(r["avg_response_time_ms"]),
            "data_completeness": round(r["data_completeness"], 2),
            "reliability_score": round(r["reliability_score"], 2)
        })
    conn.close()
    return rows

@router.get("/supplier-distribution")
def get_supplier_distribution():
    """Returns distribution of inventory by supplier."""
    return db_store.get_supplier_distribution()

@router.get("/insights")
def get_actionable_insights():
    """Returns real calculated AI insights from database records."""
    return db_store.get_quality_insights()

@router.get("/inventory-quality")
def get_inventory_quality():
    """Calculates granular inventory quality scores and audit details."""
    summary = db_store.get_dashboard_summary()
    conn = db_store.get_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT COUNT(*) FROM hotels WHERE latitude IS NULL OR longitude IS NULL")
    missing_geo = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM hotels WHERE description IS NULL OR length(description) < 20")
    missing_desc = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM room_mappings WHERE is_verified = 0")
    unverified_rooms = cur.fetchone()[0]
    
    conn.close()
    
    return {
        "overall_score": summary["inventory_quality_score"],
        "metrics": {
            "geocoding_completeness": round((1.0 - (missing_geo / max(summary["hotel_listings"], 1))) * 100, 1),
            "description_richness": round((1.0 - (missing_desc / max(summary["hotel_listings"], 1))) * 100, 1),
            "room_mapping_precision": round((1.0 - (unverified_rooms / max(summary["hotel_listings"] * 3, 1))) * 100, 1),
            "supplier_unification_rate": round((summary["confirmed_matches"] / max(summary["potential_duplicate_groups"] + summary["confirmed_matches"], 1)) * 100, 1)
        },
        "anomalies": {
            "missing_coordinates": missing_geo,
            "incomplete_descriptions": missing_desc,
            "unverified_rooms": unverified_rooms,
            "pending_duplicate_pairs": summary["manual_review_required"]
        }
    }
