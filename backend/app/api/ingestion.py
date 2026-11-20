from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Dict, Any, Optional
import csv
import io
import json
import uuid
import datetime
from app.models.schemas import IngestionJobResponse
from app.database.store import db_store

router = APIRouter(prefix="/ingestion", tags=["Data Ingestion Engine"])

@router.post("/upload")
async def upload_supplier_inventory(
    file: UploadFile = File(...),
    supplier_id: str = Form(...),
    category: str = Form(...) # "HOTEL", "SIGHTSEEING", "SUPPLIER_PERFORMANCE"
):
    """
    Ingests supplier CSV inventory with validation, raw preservation, normalization, and error reporting.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported for ingestion.")

    content = await file.read()
    text = content.decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(text))
    
    rows = list(reader)
    if not rows:
        raise HTTPException(status_code=400, detail="CSV file is empty or invalid.")

    job_id = f"JOB-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"
    started_at = datetime.datetime.utcnow().isoformat()
    
    successful_count = 0
    failed_count = 0
    warning_count = 0
    errors = []

    conn = db_store.get_connection()
    cur = conn.cursor()

    # Verify supplier exists
    cur.execute("SELECT name FROM suppliers WHERE id = ?", (supplier_id,))
    supp_row = cur.fetchone()
    supplier_name = supp_row["name"] if supp_row else supplier_id

    category_clean = category.upper()

    for idx, row in enumerate(rows):
        row_num = idx + 2
        try:
            if "HOTEL" in category_clean:
                # Validate required columns
                name = row.get("hotel_name") or row.get("name")
                city = row.get("city")
                if not name or not city:
                    errors.append({"row": row_num, "field": "hotel_name/city", "error": "Missing mandatory hotel name or city"})
                    failed_count += 1
                    continue
                    
                # Validate price
                try:
                    price = float(row.get("base_price") or row.get("price") or 0.0)
                    if price <= 0:
                        warning_count += 1
                except ValueError:
                    price = 100.0
                    warning_count += 1
                    
                # Validate coordinates
                lat, lon = None, None
                try:
                    if row.get("latitude") and row.get("longitude"):
                        lat = float(row["latitude"])
                        lon = float(row["longitude"])
                        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                            lat, lon = None, None
                            warning_count += 1
                            errors.append({"row": row_num, "field": "coordinates", "warning": "Latitude/Longitude out of valid Earth bounds"})
                except ValueError:
                    warning_count += 1

                rec_id = row.get("record_id") or row.get("id") or f"HTL-{supplier_id[-3:]}-{uuid.uuid4().hex[:6].upper()}"
                
                # 1. Preserve Raw Record untouched
                raw_id = f"RAW-{rec_id}"
                cur.execute("""
                    INSERT OR REPLACE INTO raw_supplier_records (id, job_id, supplier_id, supplier_record_id, category, raw_payload)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (raw_id, job_id, supplier_id, rec_id, "HOTEL", json.dumps(row)))

                # 2. Store Normalized Record
                cur.execute("""
                    INSERT OR REPLACE INTO hotels (
                        id, supplier_id, supplier_hotel_id, name, city, country,
                        address, latitude, longitude, star_rating, base_price,
                        currency, availability, cancellation_policy, description,
                        facilities, rooms, matching_status, quality_score
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    rec_id, supplier_id, rec_id, name, city, row.get("country", "Global"),
                    row.get("address", f"{city} Downtown"), lat, lon,
                    float(row.get("star_rating") or 4.0), price,
                    row.get("currency", "USD"), row.get("availability", "AVAILABLE"),
                    row.get("cancellation_policy", "FREE_CANCELLATION"),
                    row.get("description", f"Property in {city}"),
                    row.get("facilities", "[]"), row.get("rooms", "[]"),
                    "UNMATCHED", 90.0 if (lat and lon) else 75.0
                ))
                successful_count += 1

            elif "SIGHTSEEING" in category_clean:
                title = row.get("product_title") or row.get("title")
                attraction = row.get("attraction_name") or title
                city = row.get("destination_city") or row.get("city")
                if not title or not city:
                    errors.append({"row": row_num, "field": "product_title/destination_city", "error": "Missing mandatory sightseeing title or city"})
                    failed_count += 1
                    continue
                    
                rec_id = row.get("product_id") or row.get("id") or f"SGT-{supplier_id[-3:]}-{uuid.uuid4().hex[:6].upper()}"
                cur.execute("""
                    INSERT OR REPLACE INTO raw_supplier_records (id, job_id, supplier_id, supplier_record_id, category, raw_payload)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (f"RAW-{rec_id}", job_id, supplier_id, rec_id, "SIGHTSEEING", json.dumps(row)))

                cur.execute("""
                    INSERT OR REPLACE INTO sightseeing_products (
                        id, supplier_id, supplier_product_id, attraction_name, product_title,
                        destination_city, destination_country, activity_type, duration_hours,
                        transfer_included, transfer_type, meal_included, meal_details,
                        access_type, cancellation_policy, base_price, currency, matching_status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    rec_id, supplier_id, rec_id, attraction, title,
                    city, row.get("destination_country", "Global"),
                    row.get("activity_type", "TOUR"), float(row.get("duration_hours") or 2.5),
                    1 if str(row.get("transfer_included")).lower() in ("true", "1") else 0,
                    row.get("transfer_type", "NONE"),
                    1 if str(row.get("meal_included")).lower() in ("true", "1") else 0,
                    row.get("meal_details", "None"),
                    row.get("access_type", "GENERAL"),
                    row.get("cancellation_policy", "FREE_CANCELLATION"),
                    float(row.get("base_price") or 50.0), row.get("currency", "USD"),
                    "UNMATCHED"
                ))
                successful_count += 1

        except Exception as e:
            errors.append({"row": row_num, "error": str(e)})
            failed_count += 1

    status = "COMPLETED" if failed_count == 0 else ("COMPLETED_WITH_WARNINGS" if successful_count > 0 else "FAILED")
    completed_at = datetime.datetime.utcnow().isoformat()

    # Record Ingestion Job
    cur.execute("""
        INSERT INTO ingestion_jobs (
            id, supplier_id, file_name, category, record_count,
            successful_count, failed_count, warning_count, status,
            error_summary, started_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        job_id, supplier_id, file.filename, category_clean, len(rows),
        successful_count, failed_count, warning_count, status,
        json.dumps(errors[:50]), started_at, completed_at
    ))

    # Update supplier total records and sync time
    cur.execute("""
        UPDATE suppliers
        SET total_records = (SELECT COUNT(*) FROM hotels WHERE supplier_id = ?) + (SELECT COUNT(*) FROM sightseeing_products WHERE supplier_id = ?),
            last_synchronization = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (supplier_id, supplier_id, supplier_id))

    conn.commit()
    conn.close()

    # Asynchronously trigger matching in background
    if "HOTEL" in category_clean:
        db_store.run_hotel_matching()
    elif "SIGHTSEEING" in category_clean:
        db_store.run_sightseeing_matching()

    return {
        "job_id": job_id,
        "supplier_id": supplier_id,
        "supplier_name": supplier_name,
        "file_name": file.filename,
        "category": category_clean,
        "total_rows": len(rows),
        "successful_records": successful_count,
        "failed_records": failed_count,
        "warning_count": warning_count,
        "status": status,
        "errors": errors[:25]
    }

@router.get("/jobs", response_model=List[IngestionJobResponse])
def get_ingestion_jobs():
    conn = db_store.get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT j.*, s.name as supplier_name
        FROM ingestion_jobs j
        LEFT JOIN suppliers s ON j.supplier_id = s.id
        ORDER BY j.started_at DESC LIMIT 50
    """)
    rows = []
    for r in cur.fetchall():
        d = dict(r)
        d["error_summary"] = json.loads(d["error_summary"]) if d.get("error_summary") else []
        rows.append(d)
    conn.close()
    return rows
