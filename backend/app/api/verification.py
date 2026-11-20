from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from app.models.schemas import DuplicateMatchResponse, MatchReviewRequest
from app.database.store import db_store

router = APIRouter(prefix="/verification", tags=["Human-in-the-Loop Verification Center"])

@router.get("/queue", response_model=List[DuplicateMatchResponse])
def get_verification_queue():
    """Returns matches that require human-in-the-loop verification before merging."""
    return db_store.get_matches(status="PENDING")

@router.post("/action")
def take_verification_action(payload: MatchReviewRequest):
    """Executes reviewer decision (APPROVE, REJECT, MERGE, KEEP_SEPARATE)."""
    res = db_store.review_match(
        match_id=payload.match_id,
        action=payload.action,
        reviewer=payload.reviewer,
        decision_reason=payload.decision_reason or ""
    )
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error"))
    return res

@router.get("/audit-logs")
def get_audit_logs():
    """Returns audit log of all human reviewer actions."""
    conn = db_store.get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT r.*, m.source_record_id, m.target_record_id, m.product_type
        FROM match_reviews r
        JOIN product_matches m ON r.match_id = m.id
        ORDER BY r.created_at DESC LIMIT 100
    """)
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows
