import uuid
from rapidfuzz import fuzz
from typing import Dict, Any, List, Optional, Tuple
from app.engines.matching.normalizer import normalize_text, normalize_hotel_brand
from app.engines.matching.fuzzy import calculate_fuzzy_scores
from app.engines.matching.geo import haversine_distance_meters, calculate_geo_similarity
from app.engines.matching.embeddings import calculate_semantic_similarity

class HybridMatchingEngine:
    def __init__(self, strong_threshold: float = 94.0, possible_threshold: float = 75.0, geo_tolerance_m: float = 350.0):
        self.strong_threshold = strong_threshold
        self.possible_threshold = possible_threshold
        self.geo_tolerance_m = geo_tolerance_m

    def compare_hotel_pair(self, rec_a: Dict[str, Any], rec_b: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes complete multi-factor hybrid comparison between two hotel supplier records.
        Returns match evidence, confidence score, conflicting attributes, and classification.
        """
        # 1. Name Normalization and Fuzzy Comparison
        name_str_a = rec_a.get("hotel_name") or rec_a.get("name") or ""
        name_str_b = rec_b.get("hotel_name") or rec_b.get("name") or ""
        norm_name_a = normalize_text(name_str_a)
        norm_name_b = normalize_text(name_str_b)
        stem_a = normalize_hotel_brand(name_str_a)
        stem_b = normalize_hotel_brand(name_str_b)
        
        fuzzy_raw = calculate_fuzzy_scores(norm_name_a, norm_name_b)
        fuzzy_stem = calculate_fuzzy_scores(stem_a, stem_b)
        # Choose the stronger signal between raw and stem
        name_sim = max(fuzzy_raw["composite"], fuzzy_stem["composite"])
        
        # 2. Address Comparison
        addr_a = normalize_text(rec_a.get("address", ""))
        addr_b = normalize_text(rec_b.get("address", ""))
        addr_sim = calculate_fuzzy_scores(addr_a, addr_b)["composite"] if (addr_a and addr_b) else 50.0
        
        # 3. Geographic Comparison
        lat_a, lon_a = rec_a.get("latitude"), rec_a.get("longitude")
        lat_b, lon_b = rec_b.get("latitude"), rec_b.get("longitude")
        dist_m = haversine_distance_meters(lat_a, lon_a, lat_b, lon_b)
        geo_sim = calculate_geo_similarity(dist_m, self.geo_tolerance_m)
        
        # 4. Semantic Description Comparison
        desc_a = rec_a.get("description", "")
        desc_b = rec_b.get("description", "")
        desc_sim = calculate_semantic_similarity(desc_a, desc_b) if (desc_a and desc_b) else 50.0
        
        # 5. Attribute Validation & Conflict Detection
        conflicts = []
        city_a = (rec_a.get("city") or "").strip().lower()
        city_b = (rec_b.get("city") or "").strip().lower()
        city_match = city_a == city_b
        
        if not city_match:
            conflicts.append({
                "attribute": "City",
                "source_val": rec_a.get("city"),
                "target_val": rec_b.get("city"),
                "severity": "CRITICAL",
                "note": "Properties are in different cities. Cannot be the same hotel."
            })
            
        star_a = float(rec_a.get("star_rating") or 0.0)
        star_b = float(rec_b.get("star_rating") or 0.0)
        star_diff = abs(star_a - star_b)
        star_match = star_diff <= 0.5
        
        if star_diff > 1.0:
            conflicts.append({
                "attribute": "Star Rating",
                "source_val": f"{star_a} Stars",
                "target_val": f"{star_b} Stars",
                "severity": "WARNING",
                "note": f"Significant star rating discrepancy ({star_a} vs {star_b})."
            })
            
        # Geographic distance conflict (Rule: Never merge different properties solely on similar names!)
        if dist_m is not None and dist_m > 1200.0:
            conflicts.append({
                "attribute": "Geographical Location",
                "source_val": f"Lat: {lat_a}, Lon: {lon_a}",
                "target_val": f"Lat: {lat_b}, Lon: {lon_b}",
                "severity": "CRITICAL",
                "note": f"Properties are {dist_m/1000.0:.2f} km apart. Exceeds duplicate threshold."
            })
            
        # 6. Overall Confidence Calculation
        # Weights:
        # Name: 40%, Geo: 25%, Address: 20%, Description: 15%
        if dist_m is not None:
            raw_confidence = (name_sim * 0.40) + (geo_sim * 0.25) + (addr_sim * 0.20) + (desc_sim * 0.15)
        else:
            # If coordinates are missing, rebalance weights without geo
            raw_confidence = (name_sim * 0.55) + (addr_sim * 0.30) + (desc_sim * 0.15)
            
        # Penalties for critical conflicts
        if not city_match:
            overall_confidence = min(raw_confidence, 15.0)
        elif any(c["severity"] == "CRITICAL" for c in conflicts):
            overall_confidence = min(raw_confidence * 0.45, 60.0)
        else:
            overall_confidence = raw_confidence
            
        overall_confidence = round(min(100.0, max(0.0, overall_confidence)), 2)
        
        # 7. Classification
        if overall_confidence >= self.strong_threshold and not conflicts:
            classification = "STRONG_MATCH"
        elif overall_confidence >= self.possible_threshold:
            classification = "POSSIBLE_MATCH"
        elif overall_confidence >= 55.0 or (name_sim >= 85.0 and dist_m and dist_m > 800.0):
            classification = "NEEDS_VERIFICATION"
        else:
            classification = "NOT_A_MATCH"
            
        return {
            "overall_confidence": overall_confidence,
            "classification": classification,
            "evidence": {
                "name_similarity": name_sim,
                "address_similarity": addr_sim,
                "geo_similarity": geo_sim,
                "description_similarity": desc_sim,
                "distance_meters": dist_m,
                "star_match": star_match,
                "city_match": city_match
            },
            "conflicts": conflicts
        }

    def run_batch_detection(self, records: List[Dict[str, Any]], city_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Runs candidate generation (blocking by city and initial token) and pairwise matching.
        Avoids comparing records from the same supplier against themselves.
        """
        filtered_records = records
        if city_filter:
            filtered_records = [r for r in records if (r.get("city") or "").lower() == city_filter.lower()]
            
        # Group by city for blocking
        city_groups = {}
        for r in filtered_records:
            c = (r.get("city") or "unknown").strip().lower()
            city_groups.setdefault(c, []).append(r)
            
        results = []
        
        for city, group in city_groups.items():
            n = len(group)
            for i in range(n):
                for j in range(i + 1, n):
                    rec_a = group[i]
                    rec_b = group[j]
                    
                    # Skip if same supplier
                    if rec_a.get("supplier_id") == rec_b.get("supplier_id"):
                        continue
                        
                    # Quick preliminary blocking check: token overlap or first letter of brand stem
                    norm_name_a = normalize_text(rec_a.get("hotel_name") or rec_a.get("name") or "")
                    norm_name_b = normalize_text(rec_b.get("hotel_name") or rec_b.get("name") or "")
                    stem_a = normalize_hotel_brand(rec_a.get("hotel_name") or rec_a.get("name") or "")
                    stem_b = normalize_hotel_brand(rec_b.get("hotel_name") or rec_b.get("name") or "")
                    tokens_a = set(stem_a.split())
                    tokens_b = set(stem_b.split())
                    
                    # If no common words and length > 3, check initial 3-letter similarity
                    if not (tokens_a & tokens_b) and stem_a[:3] != stem_b[:3]:
                        # Quick ratio check before deep geo/embedding
                        if fuzz.ratio(stem_a, stem_b) < 50:
                            continue
                            
                    eval_result = self.compare_hotel_pair(rec_a, rec_b)
                    
                    # Only retain pairs with non-trivial similarity
                    if eval_result["overall_confidence"] >= 50.0:
                        match_id = f"MATCH-{uuid.uuid4().hex[:8].upper()}"
                        s_id = rec_a.get("record_id") or rec_a.get("id")
                        t_id = rec_b.get("record_id") or rec_b.get("id")
                        results.append({
                            "id": match_id,
                            "product_type": "HOTEL",
                            "source_record_id": s_id,
                            "target_record_id": t_id,
                            "source_supplier_id": rec_a.get("supplier_id"),
                            "source_supplier_name": rec_a.get("supplier_name", "Supplier A"),
                            "target_supplier_id": rec_b.get("supplier_id"),
                            "target_supplier_name": rec_b.get("supplier_name", "Supplier B"),
                            "source_name": rec_a.get("hotel_name") or rec_a.get("name"),
                            "target_name": rec_b.get("hotel_name") or rec_b.get("name"),
                            "source_address": rec_a.get("address", ""),
                            "target_address": rec_b.get("address", ""),
                            "source_city": rec_a.get("city", ""),
                            "target_city": rec_b.get("city", ""),
                            "overall_confidence": eval_result["overall_confidence"],
                            "classification": eval_result["classification"],
                            "status": "APPROVED" if eval_result["classification"] == "STRONG_MATCH" else "PENDING",
                            "evidence": eval_result["evidence"],
                            "conflicts": eval_result["conflicts"],
                            "source_record": rec_a,
                            "target_record": rec_b
                        })
                        
        # Sort descending by confidence
        results.sort(key=lambda x: x["overall_confidence"], reverse=True)
        return results
