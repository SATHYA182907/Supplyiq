from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# Supplier Schemas
class SupplierBase(BaseModel):
    name: str
    code: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    integration_type: str = "REST_API"
    status: str = "ACTIVE"
    reliability_score: float = 85.0

class SupplierCreate(SupplierBase):
    id: Optional[str] = None

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    integration_type: Optional[str] = None
    status: Optional[str] = None
    reliability_score: Optional[float] = None

class SupplierResponse(SupplierBase):
    id: str
    total_records: int = 0
    last_synchronization: Optional[str] = None
    created_at: Optional[str] = None

# Ingestion Schemas
class IngestionJobResponse(BaseModel):
    id: str
    supplier_id: str
    supplier_name: Optional[str] = None
    file_name: str
    category: str
    record_count: int
    successful_count: int
    failed_count: int
    warning_count: int
    status: str
    started_at: str
    completed_at: Optional[str] = None
    error_summary: List[Dict[str, Any]] = []

# Hotel Schemas
class HotelOffer(BaseModel):
    id: str
    hotel_id: str
    supplier_id: str
    supplier_name: str
    room_name: str
    standard_room_type: str
    meal_plan: str
    cancellation_policy: str
    payment_terms: str
    price: float
    currency: str = "USD"
    availability_status: str = "AVAILABLE"
    supplier_reliability: float = 90.0

class HotelResponse(BaseModel):
    id: str
    supplier_id: str
    supplier_name: str
    supplier_hotel_id: str
    canonical_id: Optional[str] = None
    name: str
    city: str
    country: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    star_rating: float
    base_price: float
    currency: str = "USD"
    availability: str = "AVAILABLE"
    cancellation_policy: str = "FREE_CANCELLATION"
    matching_status: str = "UNMATCHED"
    quality_score: float = 85.0
    description: Optional[str] = None
    facilities: List[str] = []
    rooms: List[Dict[str, Any]] = []

# Sightseeing Schemas
class SightseeingResponse(BaseModel):
    id: str
    supplier_id: str
    supplier_name: str
    supplier_product_id: str
    canonical_id: Optional[str] = None
    attraction_name: str
    product_title: str
    destination_city: str
    destination_country: str
    activity_type: str
    duration_hours: float
    transfer_included: bool
    transfer_type: str = "NONE"
    meal_included: bool
    meal_details: Optional[str] = None
    access_type: str = "GENERAL"
    cancellation_policy: str = "FREE_CANCELLATION"
    base_price: float
    currency: str = "USD"
    matching_status: str = "UNMATCHED"
    quality_score: float = 85.0
    description: Optional[str] = None

# Match Schemas
class ConflictingAttribute(BaseModel):
    attribute: str
    source_val: Any
    target_val: Any
    severity: str # "CRITICAL", "WARNING", "INFO"
    note: str

class MatchEvidence(BaseModel):
    name_similarity: float
    address_similarity: float
    geo_similarity: float
    description_similarity: float
    distance_meters: Optional[float] = None
    star_match: bool
    city_match: bool

class DuplicateMatchResponse(BaseModel):
    id: str
    product_type: str
    source_record_id: str
    target_record_id: str
    source_supplier_id: str
    source_supplier_name: str
    target_supplier_id: str
    target_supplier_name: str
    source_name: str
    target_name: str
    source_address: str
    target_address: str
    source_city: str
    target_city: str
    overall_confidence: float
    classification: str # STRONG_MATCH, POSSIBLE_MATCH, NEEDS_VERIFICATION, NOT_A_MATCH
    status: str # PENDING, APPROVED, REJECTED, AUTO_MERGED
    evidence: MatchEvidence
    conflicts: List[ConflictingAttribute] = []
    source_record: Optional[Dict[str, Any]] = None
    target_record: Optional[Dict[str, Any]] = None

class MatchReviewRequest(BaseModel):
    match_id: str
    action: str # "APPROVE", "REJECT", "MERGE", "KEEP_SEPARATE"
    reviewer: str = "Senior Analyst"
    decision_reason: Optional[str] = None

# Room Mapping Schemas
class RoomMappingResponse(BaseModel):
    id: str
    hotel_id: str
    hotel_name: str
    supplier_id: str
    supplier_name: str
    supplier_room_name: str
    bed_configuration: str
    max_occupancy: int
    mapped_standard_type: str
    confidence_score: float
    is_verified: bool
    conflicting_attributes: List[str] = []

class RoomMappingUpdateRequest(BaseModel):
    mapped_standard_type: str
    is_verified: bool = True
    decision_notes: Optional[str] = None

# Comparison Schemas
class CanonicalComparisonGroup(BaseModel):
    canonical_id: str
    canonical_name: str
    city: str
    star_rating: float
    offers: List[HotelOffer]
    lowest_price_offer_id: str
    best_cancellation_offer_id: str
    best_ranked_offer_id: str

# Ranking Schemas
class RankingRequest(BaseModel):
    destination: str
    product_type: str = "HOTEL" # "HOTEL" or "SIGHTSEEING"
    checkin_date: Optional[str] = None
    checkout_date: Optional[str] = None
    max_budget: Optional[float] = None
    min_star_rating: Optional[float] = None
    preferred_suppliers: List[str] = []
    cancellation_preferred: bool = False
    
    # Weights (Must sum to 1.0 or normalize)
    weight_price: float = 0.30
    weight_relevance: float = 0.25
    weight_supplier_reliability: float = 0.15
    weight_cancellation: float = 0.15
    weight_info_quality: float = 0.10
    weight_preference: float = 0.05

class RankedOfferResult(BaseModel):
    rank: int
    product_id: str
    canonical_id: Optional[str] = None
    product_name: str
    supplier_id: str
    supplier_name: str
    room_or_variant: str
    price: float
    currency: str = "USD"
    availability: str
    cancellation_policy: str
    ranking_score: float
    score_breakdown: Dict[str, float]
    recommendation_reasons: List[str]
    ai_explanation: Optional[str] = None

class RankingResponse(BaseModel):
    destination: str
    total_eligible_offers: int
    applied_weights: Dict[str, float]
    ranked_offers: List[RankedOfferResult]
    ai_summary_explanation: str

# Analytics Schemas
class DashboardSummary(BaseModel):
    total_suppliers: int
    total_inventory_records: int
    hotel_listings: int
    sightseeing_products: int
    potential_duplicate_groups: int
    confirmed_matches: int
    manual_review_required: int
    inventory_quality_score: float

class SupplierPerformanceItem(BaseModel):
    supplier_id: str
    supplier_name: str
    total_offers: int
    successful_bookings: int
    failed_bookings: int
    availability_accuracy: float
    price_accuracy: float
    cancellation_accuracy: float
    avg_response_time_ms: int
    data_completeness: float
    reliability_score: float
