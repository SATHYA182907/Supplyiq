export type UserRole = 'ADMIN' | 'ANALYST' | 'REVIEWER';

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contact_email: string;
  contact_phone?: string;
  integration_type: 'REST_API' | 'SFTP_CSV' | 'MANUAL_UPLOAD' | 'GRAPHQL';
  status: 'ACTIVE' | 'INACTIVE' | 'DEGRADED';
  total_records: number;
  last_synchronization?: string;
  reliability_score: number;
}

export interface HotelOffer {
  id: string;
  hotel_id: string;
  supplier_id: string;
  supplier_name: string;
  room_name: string;
  standard_room_type: string;
  meal_plan: 'RO' | 'BB' | 'HB' | 'FB' | 'AI';
  cancellation_policy: 'FREE_CANCELLATION' | 'CONDITIONAL' | 'NON_REFUNDABLE';
  payment_terms: string;
  price: number;
  currency: string;
  availability_status: 'AVAILABLE' | 'ON_REQUEST' | 'SOLD_OUT';
  supplier_reliability: number;
}

export interface Hotel {
  id: string;
  supplier_id: string;
  supplier_name: string;
  supplier_hotel_id: string;
  canonical_id?: string;
  name: string;
  city: string;
  country: string;
  address: string;
  latitude?: number;
  longitude?: number;
  star_rating: number;
  base_price: number;
  currency: string;
  availability: string;
  cancellation_policy: string;
  matching_status: 'UNMATCHED' | 'POTENTIAL_MATCH' | 'CONFIRMED_MATCH' | 'REJECTED';
  quality_score: number;
  description?: string;
  facilities: string[];
  rooms: any[];
}

export interface SightseeingProduct {
  id: string;
  supplier_id: string;
  supplier_name: string;
  supplier_product_id: string;
  canonical_id?: string;
  attraction_name: string;
  product_title: string;
  destination_city: string;
  destination_country: string;
  activity_type: 'TICKET_ONLY' | 'GUIDED_TOUR' | 'TRANSFER_COMBO' | 'VIP_ACCESS' | 'TOUR';
  duration_hours: number;
  transfer_included: boolean;
  transfer_type: string;
  meal_included: boolean;
  meal_details?: string;
  access_type: 'GENERAL' | 'SKIP_THE_LINE' | 'VIP_BEHIND_THE_SCENES';
  cancellation_policy: string;
  base_price: number;
  currency: string;
  matching_status: 'UNMATCHED' | 'POTENTIAL_MATCH' | 'CONFIRMED_MATCH' | 'REJECTED';
  quality_score: number;
  description?: string;
}

export interface ConflictingAttribute {
  attribute: string;
  source_val: any;
  target_val: any;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  note: string;
}

export interface MatchEvidence {
  name_similarity: number;
  address_similarity: number;
  geo_similarity: number;
  description_similarity: number;
  distance_meters?: number;
  star_match: boolean;
  city_match: boolean;
}

export interface DuplicateMatch {
  id: string;
  product_type: 'HOTEL' | 'SIGHTSEEING';
  source_record_id: string;
  target_record_id: string;
  source_supplier_id: string;
  source_supplier_name: string;
  target_supplier_id: string;
  target_supplier_name: string;
  source_name: string;
  target_name: string;
  source_address: string;
  target_address: string;
  source_city: string;
  target_city: string;
  overall_confidence: number;
  classification: 'STRONG_MATCH' | 'POSSIBLE_MATCH' | 'NEEDS_VERIFICATION' | 'NOT_A_MATCH';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_MERGED';
  evidence: MatchEvidence;
  conflicts: ConflictingAttribute[];
  source_record?: any;
  target_record?: any;
}

export interface RoomMapping {
  id: string;
  hotel_id: string;
  hotel_name: string;
  supplier_id: string;
  supplier_name: string;
  supplier_room_name: string;
  bed_configuration: string;
  max_occupancy: number;
  mapped_standard_type: string;
  confidence_score: number;
  is_verified: boolean;
  conflicting_attributes: string[];
}

export interface IngestionJob {
  id: string;
  supplier_id: string;
  supplier_name?: string;
  file_name: string;
  category: string;
  record_count: number;
  successful_count: number;
  failed_count: number;
  warning_count: number;
  status: string;
  started_at: string;
  completed_at?: string;
  error_summary: any[];
}

export interface DashboardSummary {
  total_suppliers: number;
  total_inventory_records: number;
  hotel_listings: number;
  sightseeing_products: number;
  potential_duplicate_groups: number;
  confirmed_matches: number;
  manual_review_required: number;
  inventory_quality_score: number;
}

export interface SupplierPerformance {
  supplier_id: string;
  supplier_name: string;
  total_offers: number;
  successful_bookings: number;
  failed_bookings: number;
  availability_accuracy: number;
  price_accuracy: number;
  cancellation_accuracy: number;
  avg_response_time_ms: number;
  data_completeness: number;
  reliability_score: number;
}

export interface AIInsight {
  id: string;
  type: 'WARNING' | 'INFO' | 'SUCCESS';
  category: string;
  title: string;
  description: string;
  affected_count: number;
  action_url: string;
}

export interface RankedOffer {
  rank: number;
  product_id: string;
  canonical_id?: string;
  product_name: string;
  supplier_id: string;
  supplier_name: string;
  room_or_variant: string;
  price: number;
  currency: string;
  availability: string;
  cancellation_policy: string;
  ranking_score: number;
  score_breakdown: {
    price_competitiveness: number;
    product_relevance: number;
    supplier_reliability: number;
    cancellation_flexibility: number;
    data_quality: number;
    preference_match: number;
  };
  recommendation_reasons: string[];
  ai_explanation?: string;
}
