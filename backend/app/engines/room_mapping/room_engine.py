import re
from typing import Dict, Any, List, Optional
from rapidfuzz import fuzz

STANDARD_ROOM_TAXONOMY = [
    {"type_id": "RT-STD-DBL", "standard_name": "Standard Double", "bed": "DOUBLE", "occupancy": 2, "category": "STANDARD"},
    {"type_id": "RT-STD-TWN", "standard_name": "Standard Twin", "bed": "TWIN", "occupancy": 2, "category": "STANDARD"},
    {"type_id": "RT-SUP-KNG", "standard_name": "Superior King", "bed": "KING", "occupancy": 2, "category": "SUPERIOR"},
    {"type_id": "RT-DLX-KNG", "standard_name": "Deluxe King", "bed": "KING", "occupancy": 2, "category": "DELUXE"},
    {"type_id": "RT-DLX-TWN", "standard_name": "Deluxe Twin", "bed": "TWIN", "occupancy": 2, "category": "DELUXE"},
    {"type_id": "RT-DLX-QUN", "standard_name": "Deluxe Double Queen", "bed": "MULTI", "occupancy": 4, "category": "DELUXE"},
    {"type_id": "RT-EXE-STE", "standard_name": "Executive Suite", "bed": "KING", "occupancy": 2, "category": "SUITE"},
    {"type_id": "RT-FAM-STE", "standard_name": "Family Suite", "bed": "MULTI", "occupancy": 4, "category": "FAMILY"},
    {"type_id": "RT-PRS-STE", "standard_name": "Presidential Suite", "bed": "KING", "occupancy": 4, "category": "SUITE"}
]

class RoomMappingEngine:
    def parse_room_attributes(self, room_name: str) -> Dict[str, Any]:
        """Extracts bed configuration, occupancy clues, and tier tokens from supplier room string."""
        raw = room_name.lower()
        
        # Bed configuration detection
        bed = "UNKNOWN"
        if "king" in raw:
            bed = "KING"
        elif "queen" in raw:
            bed = "QUEEN" if ("double queen" not in raw and "2 queen" not in raw) else "MULTI"
        elif "twin" in raw or "2 single" in raw:
            bed = "TWIN"
        elif "double" in raw or "1 double" in raw:
            bed = "DOUBLE"
        elif "family" in raw or "multi" in raw or "bunk" in raw:
            bed = "MULTI"
            
        # Category tier detection
        category = "STANDARD"
        if "presidential" in raw or "royal" in raw or "penthouse" in raw:
            category = "SUITE"
        elif "executive" in raw or "club" in raw or "lounge" in raw:
            category = "SUITE" if "suite" in raw else "SUPERIOR"
        elif "suite" in raw:
            category = "SUITE"
        elif "deluxe" in raw or "grand" in raw or "premier" in raw:
            category = "DELUXE"
        elif "superior" in raw:
            category = "SUPERIOR"
            
        # Max occupancy inference
        occupancy = 2
        if "single" in raw and "twin" not in raw:
            occupancy = 1
        elif "family" in raw or "4 pax" in raw or "double queen" in raw or "2 queen" in raw:
            occupancy = 4
        elif "triple" in raw or "3 pax" in raw:
            occupancy = 3
            
        return {
            "bed_configuration": bed,
            "category": category,
            "inferred_occupancy": occupancy
        }

    def map_room(self, supplier_room_name: str, given_bed: Optional[str] = None, given_occupancy: Optional[int] = None) -> Dict[str, Any]:
        """
        Maps a supplier room string into a standardized taxonomy room.
        Strict rule: Bed configuration and occupancy must match to prevent invalid room mapping!
        """
        parsed = self.parse_room_attributes(supplier_room_name)
        target_bed = given_bed if (given_bed and given_bed != "UNKNOWN") else parsed["bed_configuration"]
        target_occ = given_occupancy if given_occupancy else parsed["inferred_occupancy"]
        target_category = parsed["category"]
        
        best_match = None
        best_score = -1.0
        conflicts = []
        
        for std in STANDARD_ROOM_TAXONOMY:
            # Bed configuration check (MANDATORY CONSTRAINT)
            bed_mismatch = (target_bed != "UNKNOWN" and std["bed"] != target_bed)
            
            # String similarity
            name_score = fuzz.token_set_ratio(supplier_room_name.lower(), std["standard_name"].lower())
            
            # Category alignment bonus
            category_match = (std["category"] == target_category)
            bonus = 20.0 if category_match else -10.0
            
            # Occupancy penalty
            occ_penalty = abs(std["occupancy"] - target_occ) * 15.0
            
            if bed_mismatch:
                # Heavy penalty: cannot classify different bed configs as equivalent
                score = name_score * 0.40 - 30.0
            else:
                score = name_score * 0.70 + bonus - occ_penalty
                
            if score > best_score:
                best_score = score
                best_match = std
                
        confidence = round(min(100.0, max(15.0, best_score)), 2)
        
        # Verify if conflict exists
        if best_match and target_bed != "UNKNOWN" and best_match["bed"] != target_bed:
            conflicts.append(f"Bed configuration mismatch: Supplier specifies {target_bed}, mapped to {best_match['bed']}")
            
        if best_match and target_occ != best_match["occupancy"]:
            conflicts.append(f"Occupancy mismatch: Supplier supports {target_occ} pax, mapped standard assumes {best_match['occupancy']}")
            
        return {
            "supplier_room_name": supplier_room_name,
            "mapped_standard_type": best_match["standard_name"] if best_match else "Standard Double",
            "standard_type_id": best_match["type_id"] if best_match else "RT-STD-DBL",
            "bed_configuration": target_bed if target_bed != "UNKNOWN" else (best_match["bed"] if best_match else "DOUBLE"),
            "max_occupancy": target_occ,
            "confidence_score": confidence,
            "is_verified": confidence >= 92.0 and not conflicts,
            "conflicting_attributes": conflicts
        }
