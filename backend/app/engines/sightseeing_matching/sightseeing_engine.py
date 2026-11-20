import uuid
from typing import Dict, Any, List, Optional
from rapidfuzz import fuzz
from app.engines.matching.embeddings import calculate_semantic_similarity

class SightseeingMatchingEngine:
    def __init__(self, strong_threshold: float = 92.0, possible_threshold: float = 75.0):
        self.strong_threshold = strong_threshold
        self.possible_threshold = possible_threshold

    def compare_sightseeing_pair(self, rec_a: Dict[str, Any], rec_b: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compares two sightseeing products.
        Crucial Rule: Products for the same attraction with different inclusions
        (e.g. ticket only vs transfer combo vs guided tour with meals) MUST NOT be marked equivalent.
        """
        # 1. Attraction Name Similarity
        attr_a = (rec_a.get("attraction_name") or "").lower().strip()
        attr_b = (rec_b.get("attraction_name") or "").lower().strip()
        attr_sim = fuzz.token_sort_ratio(attr_a, attr_b)
        
        # 2. Product Title Similarity
        title_a = (rec_a.get("product_title") or "").lower().strip()
        title_b = (rec_b.get("product_title") or "").lower().strip()
        title_sim = fuzz.token_set_ratio(title_a, title_b)
        
        # 3. Semantic Description Similarity
        desc_a = rec_a.get("description", "")
        desc_b = rec_b.get("description", "")
        desc_sim = calculate_semantic_similarity(desc_a, desc_b) if (desc_a and desc_b) else 50.0
        
        # 4. Inclusions & Activity Type Validation (STRICT)
        conflicts = []
        
        # Activity Type (TICKET_ONLY vs GUIDED_TOUR vs TRANSFER_COMBO vs VIP_ACCESS)
        type_a = rec_a.get("activity_type")
        type_b = rec_b.get("activity_type")
        if type_a != type_b:
            conflicts.append({
                "attribute": "Activity Type",
                "source_val": type_a,
                "target_val": type_b,
                "severity": "CRITICAL",
                "note": f"Incompatible experience type ({type_a} vs {type_b}). Admission ticket is not equivalent to tour or transfer combo."
            })
            
        # Transfer Inclusion
        transfer_a = bool(rec_a.get("transfer_included"))
        transfer_b = bool(rec_b.get("transfer_included"))
        if transfer_a != transfer_b:
            conflicts.append({
                "attribute": "Transfer Inclusion",
                "source_val": "Transfers Included" if transfer_a else "No Transfers",
                "target_val": "Transfers Included" if transfer_b else "No Transfers",
                "severity": "CRITICAL",
                "note": "One product includes transportation while the other does not."
            })
            
        # Meal Inclusion
        meal_a = bool(rec_a.get("meal_included"))
        meal_b = bool(rec_b.get("meal_included"))
        if meal_a != meal_b:
            conflicts.append({
                "attribute": "Meal Inclusion",
                "source_val": "Meals/Dinner Included" if meal_a else "No Meals",
                "target_val": "Meals/Dinner Included" if meal_b else "No Meals",
                "severity": "CRITICAL",
                "note": "Experience bundles dining/meals while the other does not."
            })
            
        # Access Type (GENERAL vs SKIP_THE_LINE vs VIP_BEHIND_THE_SCENES)
        access_a = rec_a.get("access_type")
        access_b = rec_b.get("access_type")
        if access_a != access_b:
            conflicts.append({
                "attribute": "Access Privilege",
                "source_val": access_a,
                "target_val": access_b,
                "severity": "WARNING",
                "note": f"Different access privilege tier ({access_a} vs {access_b})."
            })
            
        # Duration comparison
        dur_a = float(rec_a.get("duration_hours") or 0.0)
        dur_b = float(rec_b.get("duration_hours") or 0.0)
        dur_diff = abs(dur_a - dur_b)
        if dur_diff > 1.5:
            conflicts.append({
                "attribute": "Duration",
                "source_val": f"{dur_a} hours",
                "target_val": f"{dur_b} hours",
                "severity": "WARNING",
                "note": f"Duration difference of {dur_diff:.1f} hours suggests different itinerary depth."
            })
            
        # 5. Composite Confidence
        base_confidence = (attr_sim * 0.40) + (title_sim * 0.35) + (desc_sim * 0.25)
        
        # Penalties for critical inclusion conflicts
        has_critical = any(c["severity"] == "CRITICAL" for c in conflicts)
        if attr_sim < 60:
            overall_confidence = min(base_confidence, 20.0)
        elif has_critical:
            # Drop score significantly so they stay separate
            overall_confidence = min(base_confidence * 0.40, 55.0)
        else:
            overall_confidence = base_confidence
            
        overall_confidence = round(min(100.0, max(0.0, overall_confidence)), 2)
        
        # 6. Classification
        if overall_confidence >= self.strong_threshold and not conflicts:
            classification = "STRONG_MATCH"
        elif overall_confidence >= self.possible_threshold and not has_critical:
            classification = "POSSIBLE_MATCH"
        elif overall_confidence >= 50.0:
            classification = "NEEDS_VERIFICATION"
        else:
            classification = "NOT_A_MATCH"
            
        return {
            "overall_confidence": overall_confidence,
            "classification": classification,
            "evidence": {
                "name_similarity": float(attr_sim),
                "address_similarity": float(title_sim), # Used for title in sightseeing
                "geo_similarity": 100.0 if not conflicts else 60.0,
                "description_similarity": float(desc_sim),
                "distance_meters": 0.0,
                "star_match": not has_critical,
                "city_match": rec_a.get("destination_city") == rec_b.get("destination_city")
            },
            "conflicts": conflicts
        }

    def run_batch_sightseeing_detection(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Runs candidate generation and matching across all sightseeing products."""
        # Block by attraction or city
        city_groups = {}
        for r in records:
            c = (r.get("destination_city") or "unknown").strip().lower()
            city_groups.setdefault(c, []).append(r)
            
        results = []
        for city, group in city_groups.items():
            n = len(group)
            for i in range(n):
                for j in range(i + 1, n):
                    rec_a = group[i]
                    rec_b = group[j]
                    if rec_a.get("supplier_id") == rec_b.get("supplier_id"):
                        continue
                        
                    res = self.compare_sightseeing_pair(rec_a, rec_b)
                    if res["overall_confidence"] >= 50.0:
                        match_id = f"MATCH-SGT-{uuid.uuid4().hex[:8].upper()}"
                        results.append({
                            "id": match_id,
                            "product_type": "SIGHTSEEING",
                            "source_record_id": rec_a.get("product_id") or rec_a.get("id"),
                            "target_record_id": rec_b.get("product_id") or rec_b.get("id"),
                            "source_supplier_id": rec_a.get("supplier_id"),
                            "source_supplier_name": rec_a.get("supplier_name", "Supplier A"),
                            "target_supplier_id": rec_b.get("supplier_id"),
                            "target_supplier_name": rec_b.get("supplier_name", "Supplier B"),
                            "source_name": rec_a.get("product_title"),
                            "target_name": rec_b.get("product_title"),
                            "source_address": f"{rec_a.get('attraction_name')} ({rec_a.get('activity_type')})",
                            "target_address": f"{rec_b.get('attraction_name')} ({rec_b.get('activity_type')})",
                            "source_city": rec_a.get("destination_city"),
                            "target_city": rec_b.get("destination_city"),
                            "overall_confidence": res["overall_confidence"],
                            "classification": res["classification"],
                            "status": "APPROVED" if res["classification"] == "STRONG_MATCH" else "PENDING",
                            "evidence": res["evidence"],
                            "conflicts": res["conflicts"],
                            "source_record": rec_a,
                            "target_record": rec_b
                        })
                        
        results.sort(key=lambda x: x["overall_confidence"], reverse=True)
        return results
