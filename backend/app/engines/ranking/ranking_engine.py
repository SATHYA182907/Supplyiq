from typing import List, Dict, Any, Optional
import os
import json

class IntelligentRankingEngine:
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY", "")

    def rank_hotel_offers(
        self,
        offers: List[Dict[str, Any]],
        destination: str,
        max_budget: Optional[float] = None,
        min_star_rating: Optional[float] = None,
        cancellation_preferred: bool = False,
        preferred_suppliers: Optional[List[str]] = None,
        weights: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Executes multi-criteria optimization ranking.
        Formula: R = w_p * P + w_v * V + w_s * S + w_c * C + w_q * Q + w_u * U
        Hard constraints applied first.
        """
        preferred_suppliers = preferred_suppliers or []
        default_weights = {
            "weight_price": 0.30,
            "weight_relevance": 0.25,
            "weight_supplier_reliability": 0.15,
            "weight_cancellation": 0.15,
            "weight_info_quality": 0.10,
            "weight_preference": 0.05
        }
        if weights:
            default_weights.update(weights)
            
        # Normalize weights to sum to 1.0
        w_sum = sum(default_weights.values()) or 1.0
        w_p = default_weights["weight_price"] / w_sum
        w_v = default_weights["weight_relevance"] / w_sum
        w_s = default_weights["weight_supplier_reliability"] / w_sum
        w_c = default_weights["weight_cancellation"] / w_sum
        w_q = default_weights["weight_info_quality"] / w_sum
        w_u = default_weights["weight_preference"] / w_sum

        # 1. Apply Hard Constraints
        eligible = []
        for o in offers:
            # Destination check
            if destination.lower() not in (o.get("city") or "").lower():
                continue
            # Budget check
            price = float(o.get("price") or o.get("base_price") or 0.0)
            if max_budget is not None and max_budget > 0 and price > max_budget:
                continue
            # Star rating check
            star = float(o.get("star_rating") or 0.0)
            if min_star_rating is not None and star < min_star_rating:
                continue
            # Availability status check
            if o.get("availability") == "SOLD_OUT" or o.get("availability_status") == "SOLD_OUT":
                continue
            eligible.append(o)

        if not eligible:
            return {
                "destination": destination,
                "total_eligible_offers": 0,
                "applied_weights": default_weights,
                "ranked_offers": [],
                "ai_summary_explanation": f"No active inventory matches the criteria in {destination} within the specified budget (${max_budget or 'any'}) and star rating ({min_star_rating or 'any'}+)."
            }

        # 2. Compute min and max price for normalization
        prices = [float(o.get("price") or o.get("base_price") or 0.0) for o in eligible]
        min_p = min(prices)
        max_p = max(prices)
        price_spread = max_p - min_p if max_p > min_p else 1.0

        scored_results = []
        for o in eligible:
            p_val = float(o.get("price") or o.get("base_price") or 0.0)
            
            # P: Price Competitiveness (Cheapest = 100, Most Expensive = 20)
            if max_p == min_p:
                p_score = 100.0
            else:
                p_score = 100.0 - ((p_val - min_p) / price_spread * 80.0)
                
            # V: Product Relevance / Star Quality (5 stars = 100, 3 stars = 60)
            star_val = float(o.get("star_rating") or 3.5)
            v_score = min(100.0, (star_val / 5.0) * 100.0)
            
            # S: Supplier Reliability
            s_score = float(o.get("supplier_reliability") or 88.0)
            
            # C: Cancellation Flexibility
            canc = (o.get("cancellation_policy") or "").upper()
            if "FREE" in canc:
                c_score = 100.0
            elif "CONDITIONAL" in canc:
                c_score = 65.0
            else:
                c_score = 25.0
                
            if cancellation_preferred and "FREE" not in canc:
                c_score *= 0.5 # penalty if user explicitly asked for cancellation
                
            # Q: Product Information Quality
            q_score = float(o.get("quality_score") or 85.0)
            
            # U: Customer Preference Match
            supp_id = o.get("supplier_id") or ""
            supp_code = o.get("supplier_name") or ""
            u_score = 100.0 if (supp_id in preferred_suppliers or any(p.lower() in supp_code.lower() for p in preferred_suppliers)) else 50.0

            # Composite formula
            r_total = (w_p * p_score) + (w_v * v_score) + (w_s * s_score) + (w_c * c_score) + (w_q * q_score) + (w_u * u_score)
            r_total = round(r_total, 2)
            
            reasons = []
            if p_val == min_p:
                reasons.append("Best price across all suppliers in this destination")
            elif p_score >= 80:
                reasons.append("Highly competitive rate")
                
            if "FREE" in canc:
                reasons.append("Free cancellation with zero cancellation penalty")
                
            if s_score >= 94:
                reasons.append(f"Top-tier supplier reliability ({s_score:.1f}% fulfillment rate)")
                
            if star_val >= 4.5:
                reasons.append(f"Premier {star_val}-star hospitality tier")

            scored_results.append({
                "product_id": o.get("id") or o.get("record_id"),
                "canonical_id": o.get("canonical_id") or o.get("canonical_ground_truth"),
                "product_name": o.get("hotel_name") or o.get("name") or "Hotel",
                "supplier_id": o.get("supplier_id"),
                "supplier_name": o.get("supplier_name", "Direct"),
                "room_or_variant": o.get("room_name") or o.get("standard_room_type") or "Standard Room",
                "price": p_val,
                "currency": o.get("currency", "USD"),
                "availability": o.get("availability") or o.get("availability_status") or "AVAILABLE",
                "cancellation_policy": o.get("cancellation_policy", "STANDARD"),
                "ranking_score": r_total,
                "score_breakdown": {
                    "price_competitiveness": round(p_score, 1),
                    "product_relevance": round(v_score, 1),
                    "supplier_reliability": round(s_score, 1),
                    "cancellation_flexibility": round(c_score, 1),
                    "data_quality": round(q_score, 1),
                    "preference_match": round(u_score, 1)
                },
                "recommendation_reasons": reasons
            })

        # Sort descending by ranking score
        scored_results.sort(key=lambda x: x["ranking_score"], reverse=True)
        
        # Assign rank numbers and generate AI explanations
        for idx, res in enumerate(scored_results):
            res["rank"] = idx + 1
            res["ai_explanation"] = self._generate_ai_explanation(res, idx == 0)

        # Generate top level summary
        top_pick = scored_results[0]
        summary_text = (
            f"Evaluated {len(scored_results)} eligible supplier offers in {destination}. "
            f"Top ranked offer is '{top_pick['product_name']}' from {top_pick['supplier_name']} at ${top_pick['price']} "
            f"with an overall optimization score of {top_pick['ranking_score']}/100. "
            f"Key driving factors: {', '.join(top_pick['recommendation_reasons'][:3])}."
        )

        return {
            "destination": destination,
            "total_eligible_offers": len(scored_results),
            "applied_weights": {
                "Price": round(w_p * 100, 1),
                "Relevance": round(w_v * 100, 1),
                "Supplier Reliability": round(w_s * 100, 1),
                "Cancellation": round(w_c * 100, 1),
                "Data Quality": round(w_q * 100, 1),
                "Preferences": round(w_u * 100, 1)
            },
            "ranked_offers": scored_results[:25],
            "ai_summary_explanation": summary_text
        }

    def _generate_ai_explanation(self, offer: Dict[str, Any], is_top: bool) -> str:
        """Constructs grounded natural-language explanation derived strictly from verified attributes."""
        reasons_str = "; ".join(offer["recommendation_reasons"])
        if is_top:
            return (
                f"Ranked #1 because this offer achieves the optimal balance of price (${offer['price']}), "
                f"supplier reliability ({offer['score_breakdown']['supplier_reliability']}/100), and policy terms. "
                f"Verified highlights: {reasons_str}."
            )
        else:
            return (
                f"Ranked #{offer['rank']} with score {offer['ranking_score']}/100. "
                f"Offers competitive value ({reasons_str}) while subject to higher relative price spread or policy variance."
            )
