from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import uuid
from app.models.schemas import SupplierResponse, SupplierCreate, SupplierUpdate
from app.database.store import db_store

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])

@router.get("", response_model=List[SupplierResponse])
def get_all_suppliers():
    conn = db_store.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM suppliers ORDER BY reliability_score DESC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier_by_id(supplier_id: str):
    conn = db_store.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM suppliers WHERE id = ?", (supplier_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail=f"Supplier {supplier_id} not found")
    return dict(row)

@router.post("", response_model=SupplierResponse, status_code=201)
def create_supplier(supplier: SupplierCreate):
    conn = db_store.get_connection()
    cur = conn.cursor()
    supp_id = supplier.id or f"SUP-{supplier.code.upper()}-{uuid.uuid4().hex[:4].upper()}"
    cur.execute("""
        INSERT INTO suppliers (id, code, name, contact_email, contact_phone, integration_type, status, reliability_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        supp_id, supplier.code.upper(), supplier.name, supplier.contact_email,
        supplier.contact_phone, supplier.integration_type, supplier.status, supplier.reliability_score
    ))
    conn.commit()
    cur.execute("SELECT * FROM suppliers WHERE id = ?", (supp_id,))
    created = dict(cur.fetchone())
    conn.close()
    return created

@router.put("/{supplier_id}", response_model=SupplierResponse)
def update_supplier(supplier_id: str, payload: SupplierUpdate):
    conn = db_store.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM suppliers WHERE id = ?", (supplier_id,))
    existing = cur.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Supplier not found")
        
    updates = []
    params = []
    if payload.name is not None:
        updates.append("name = ?")
        params.append(payload.name)
    if payload.contact_email is not None:
        updates.append("contact_email = ?")
        params.append(payload.contact_email)
    if payload.contact_phone is not None:
        updates.append("contact_phone = ?")
        params.append(payload.contact_phone)
    if payload.integration_type is not None:
        updates.append("integration_type = ?")
        params.append(payload.integration_type)
    if payload.status is not None:
        updates.append("status = ?")
        params.append(payload.status)
    if payload.reliability_score is not None:
        updates.append("reliability_score = ?")
        params.append(payload.reliability_score)
        
    if updates:
        params.append(supplier_id)
        cur.execute(f"UPDATE suppliers SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP WHERE id = ?", params)
        conn.commit()
        
    cur.execute("SELECT * FROM suppliers WHERE id = ?", (supplier_id,))
    updated = dict(cur.fetchone())
    conn.close()
    return updated

@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: str):
    conn = db_store.get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM suppliers WHERE id = ?", (supplier_id,))
    if not cur.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Supplier not found")
    # Soft deactivate
    cur.execute("UPDATE suppliers SET status = 'INACTIVE' WHERE id = ?", (supplier_id,))
    conn.commit()
    conn.close()
    return {"success": True, "message": f"Supplier {supplier_id} deactivated"}
