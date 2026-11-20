-- SUPPLYIQ Database Schema Migration 001
-- AI-Powered Multi-Supplier Inventory Optimization Platform
-- Compatible with Supabase PostgreSQL (pgvector & PostGIS)

-- Extensions (if available in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "vector";
-- CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(100),
    integration_type VARCHAR(50) DEFAULT 'REST_API', -- REST_API, SFTP_CSV, MANUAL_UPLOAD, GRAPHQL
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, DEGRADED, SUSPENDED
    total_records INTEGER DEFAULT 0,
    last_synchronization TIMESTAMP WITH TIME ZONE,
    reliability_score NUMERIC(5, 2) DEFAULT 85.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Supplier Integrations Table
CREATE TABLE IF NOT EXISTS supplier_integrations (
    id VARCHAR(50) PRIMARY KEY,
    supplier_id VARCHAR(50) REFERENCES suppliers(id) ON DELETE CASCADE,
    endpoint_url TEXT,
    auth_type VARCHAR(50) DEFAULT 'API_KEY',
    sync_frequency VARCHAR(50) DEFAULT 'DAILY', -- REALTIME, HOURLY, DAILY, MANUAL
    is_active BOOLEAN DEFAULT TRUE,
    config_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Ingestion Jobs Table
CREATE TABLE IF NOT EXISTS ingestion_jobs (
    id VARCHAR(50) PRIMARY KEY,
    supplier_id VARCHAR(50) REFERENCES suppliers(id),
    file_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- HOTELS, SIGHTSEEING, SUPPLIER_PERFORMANCE
    record_count INTEGER DEFAULT 0,
    successful_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    warning_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'PROCESSING', -- PENDING, PROCESSING, COMPLETED, FAILED, COMPLETED_WITH_WARNINGS
    error_summary JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'system'
);

-- 4. Raw Supplier Records (Preserving original raw data untouched)
CREATE TABLE IF NOT EXISTS raw_supplier_records (
    id VARCHAR(50) PRIMARY KEY,
    job_id VARCHAR(50) REFERENCES ingestion_jobs(id) ON DELETE SET NULL,
    supplier_id VARCHAR(50) REFERENCES suppliers(id) ON DELETE CASCADE,
    supplier_record_id VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- HOTEL, SIGHTSEEING
    raw_payload JSONB NOT NULL,
    checksum VARCHAR(64),
    ingested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_supplier_record UNIQUE (supplier_id, category, supplier_record_id)
);

-- 5. Canonical Products (Golden Unified Entity)
CREATE TABLE IF NOT EXISTS canonical_products (
    id VARCHAR(50) PRIMARY KEY,
    product_type VARCHAR(50) NOT NULL, -- HOTEL, SIGHTSEEING
    canonical_name VARCHAR(255) NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    destination_country VARCHAR(100) NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    primary_address TEXT,
    star_rating NUMERIC(3, 1),
    quality_score NUMERIC(5, 2) DEFAULT 90.00,
    active_supplier_count INTEGER DEFAULT 1,
    lowest_offer_price NUMERIC(10, 2),
    highest_offer_price NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Normalized Hotels Table (Supplier-specific normalized properties)
CREATE TABLE IF NOT EXISTS hotels (
    id VARCHAR(50) PRIMARY KEY,
    supplier_id VARCHAR(50) REFERENCES suppliers(id) ON DELETE CASCADE,
    supplier_hotel_id VARCHAR(100) NOT NULL,
    canonical_id VARCHAR(50) REFERENCES canonical_products(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    address TEXT,
    postal_code VARCHAR(50),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    star_rating NUMERIC(3, 1),
    description TEXT,
    facilities JSONB DEFAULT '[]'::jsonb,
    image_urls JSONB DEFAULT '[]'::jsonb,
    matching_status VARCHAR(50) DEFAULT 'UNMATCHED', -- UNMATCHED, POTENTIAL_MATCH, CONFIRMED_MATCH, REJECTED
    quality_score NUMERIC(5, 2) DEFAULT 80.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_supplier_hotel UNIQUE (supplier_id, supplier_hotel_id)
);

-- 7. Room Types Table (Standardized taxonomy)
CREATE TABLE IF NOT EXISTS room_types (
    id VARCHAR(50) PRIMARY KEY,
    standard_name VARCHAR(100) NOT NULL UNIQUE, -- 'Standard Double', 'Deluxe King', etc.
    standard_category VARCHAR(50) NOT NULL, -- STANDARD, DELUXE, SUITE, FAMILY, EXECUTIVE
    bed_configuration VARCHAR(50) NOT NULL, -- KING, QUEEN, TWIN, DOUBLE, MULTI
    default_max_occupancy INTEGER DEFAULT 2,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Room Mappings Table
CREATE TABLE IF NOT EXISTS room_mappings (
    id VARCHAR(50) PRIMARY KEY,
    hotel_id VARCHAR(50) REFERENCES hotels(id) ON DELETE CASCADE,
    supplier_room_code VARCHAR(100),
    supplier_room_name VARCHAR(255) NOT NULL,
    mapped_room_type_id VARCHAR(50) REFERENCES room_types(id),
    confidence_score NUMERIC(5, 2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(100),
    conflicting_attributes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Hotel Offers Table (Real bookable supplier offers)
CREATE TABLE IF NOT EXISTS hotel_offers (
    id VARCHAR(50) PRIMARY KEY,
    hotel_id VARCHAR(50) REFERENCES hotels(id) ON DELETE CASCADE,
    supplier_id VARCHAR(50) REFERENCES suppliers(id) ON DELETE CASCADE,
    room_mapping_id VARCHAR(50) REFERENCES room_mappings(id) ON DELETE SET NULL,
    room_name VARCHAR(255) NOT NULL,
    standard_room_type VARCHAR(100),
    meal_plan VARCHAR(100) DEFAULT 'RO', -- RO (Room Only), BB (Bed & Breakfast), HB (Half Board), FB (Full Board), AI (All Inclusive)
    cancellation_policy VARCHAR(100) DEFAULT 'NON_REFUNDABLE', -- FREE_CANCELLATION, CONDITIONAL, NON_REFUNDABLE
    cancellation_deadline TIMESTAMP WITH TIME ZONE,
    payment_terms VARCHAR(100) DEFAULT 'PREPAID', -- PREPAID, PAY_AT_HOTEL, DEPOSIT
    price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    availability_status VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, ON_REQUEST, SOLD_OUT
    inventory_count INTEGER DEFAULT 5,
    checkin_date DATE,
    checkout_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Sightseeing Products Table
CREATE TABLE IF NOT EXISTS sightseeing_products (
    id VARCHAR(50) PRIMARY KEY,
    supplier_id VARCHAR(50) REFERENCES suppliers(id) ON DELETE CASCADE,
    supplier_product_id VARCHAR(100) NOT NULL,
    canonical_id VARCHAR(50) REFERENCES canonical_products(id) ON DELETE SET NULL,
    attraction_name VARCHAR(255) NOT NULL,
    product_title VARCHAR(255) NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    destination_country VARCHAR(100) NOT NULL,
    description TEXT,
    activity_type VARCHAR(50) DEFAULT 'TOUR', -- TICKET_ONLY, GUIDED_TOUR, TRANSFER_COMBO, VIP_ACCESS, WORKSHOP
    duration_hours NUMERIC(4, 1),
    transfer_included BOOLEAN DEFAULT FALSE,
    transfer_type VARCHAR(50) DEFAULT 'NONE', -- SHARED, PRIVATE, NONE
    meal_included BOOLEAN DEFAULT FALSE,
    meal_details VARCHAR(100),
    access_type VARCHAR(50) DEFAULT 'GENERAL', -- GENERAL, SKIP_THE_LINE, VIP_BEHIND_THE_SCENES
    cancellation_policy VARCHAR(100) DEFAULT 'FREE_CANCELLATION',
    base_price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    matching_status VARCHAR(50) DEFAULT 'UNMATCHED',
    quality_score NUMERIC(5, 2) DEFAULT 85.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_supplier_sightseeing UNIQUE (supplier_id, supplier_product_id)
);

-- 11. Experience Offers Table
CREATE TABLE IF NOT EXISTS experience_offers (
    id VARCHAR(50) PRIMARY KEY,
    sightseeing_id VARCHAR(50) REFERENCES sightseeing_products(id) ON DELETE CASCADE,
    supplier_id VARCHAR(50) REFERENCES suppliers(id) ON DELETE CASCADE,
    option_title VARCHAR(255) NOT NULL,
    departure_time VARCHAR(50),
    language VARCHAR(50) DEFAULT 'English',
    price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    availability_status VARCHAR(50) DEFAULT 'AVAILABLE',
    cancellation_policy VARCHAR(100) DEFAULT 'FREE_CANCELLATION',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Product Attributes Table (EAV schema for extensible metadata)
CREATE TABLE IF NOT EXISTS product_attributes (
    id VARCHAR(50) PRIMARY KEY,
    product_type VARCHAR(50) NOT NULL, -- HOTEL, SIGHTSEEING
    product_id VARCHAR(50) NOT NULL,
    attribute_group VARCHAR(100), -- AMENITIES, POLICIES, LOCATION_FEATURES, ACCESSIBILITY
    attribute_key VARCHAR(100) NOT NULL,
    attribute_value TEXT NOT NULL,
    confidence NUMERIC(5, 2) DEFAULT 100.00
);

-- 13. Product Embeddings Table
CREATE TABLE IF NOT EXISTS product_embeddings (
    id VARCHAR(50) PRIMARY KEY,
    product_type VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) DEFAULT 'all-MiniLM-L6-v2',
    embedding_vector JSONB NOT NULL, -- Array of floats for cross-db support (or vector(384) in pgvector)
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Product Matches Table (Pairwise & Cluster resolution)
CREATE TABLE IF NOT EXISTS product_matches (
    id VARCHAR(50) PRIMARY KEY,
    product_type VARCHAR(50) NOT NULL, -- HOTEL, SIGHTSEEING
    source_record_id VARCHAR(50) NOT NULL,
    target_record_id VARCHAR(50) NOT NULL,
    source_supplier_id VARCHAR(50) REFERENCES suppliers(id),
    target_supplier_id VARCHAR(50) REFERENCES suppliers(id),
    overall_confidence NUMERIC(5, 2) NOT NULL,
    name_similarity NUMERIC(5, 2) NOT NULL,
    address_similarity NUMERIC(5, 2),
    geo_similarity NUMERIC(5, 2),
    description_similarity NUMERIC(5, 2),
    distance_meters NUMERIC(10, 2),
    conflicting_attributes JSONB DEFAULT '[]'::jsonb,
    classification VARCHAR(50) NOT NULL, -- STRONG_MATCH, POSSIBLE_MATCH, NEEDS_VERIFICATION, NOT_A_MATCH
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, AUTO_MERGED
    reviewed_by VARCHAR(100),
    review_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Match Reviews Table (Audit log for Human-In-The-Loop decisions)
CREATE TABLE IF NOT EXISTS match_reviews (
    id VARCHAR(50) PRIMARY KEY,
    match_id VARCHAR(50) REFERENCES product_matches(id) ON DELETE CASCADE,
    reviewer_user VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- APPROVE, REJECT, MERGE, UNMERGE, EDIT_MAPPING
    decision_reason TEXT,
    previous_state VARCHAR(50),
    new_state VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Ranking Results Table (Search and optimization history)
CREATE TABLE IF NOT EXISTS ranking_results (
    id VARCHAR(50) PRIMARY KEY,
    search_session_id VARCHAR(100),
    destination VARCHAR(100) NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    input_filters JSONB NOT NULL,
    ranking_weights JSONB NOT NULL,
    ranked_offers JSONB NOT NULL,
    ai_explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Supplier Performance Table
CREATE TABLE IF NOT EXISTS supplier_performance (
    id VARCHAR(50) PRIMARY KEY,
    supplier_id VARCHAR(50) REFERENCES suppliers(id) ON DELETE CASCADE,
    period_date DATE NOT NULL,
    total_offers INTEGER DEFAULT 0,
    successful_bookings INTEGER DEFAULT 0,
    failed_bookings INTEGER DEFAULT 0,
    availability_accuracy NUMERIC(5, 2) DEFAULT 95.00,
    price_accuracy NUMERIC(5, 2) DEFAULT 96.50,
    cancellation_accuracy NUMERIC(5, 2) DEFAULT 98.00,
    avg_response_time_ms INTEGER DEFAULT 240,
    data_completeness NUMERIC(5, 2) DEFAULT 88.00,
    overall_score NUMERIC(5, 2) DEFAULT 85.00,
    is_synthetic BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Processing Logs Table
CREATE TABLE IF NOT EXISTS processing_logs (
    id VARCHAR(50) PRIMARY KEY,
    job_id VARCHAR(50),
    module VARCHAR(50) NOT NULL, -- INGESTION, MATCHING, ROOM_MAPPING, RANKING, QUALITY_AUDIT
    log_level VARCHAR(20) DEFAULT 'INFO', -- DEBUG, INFO, WARNING, ERROR, CRITICAL
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. Inventory Quality Reports Table
CREATE TABLE IF NOT EXISTS inventory_quality_reports (
    id VARCHAR(50) PRIMARY KEY,
    audit_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    overall_quality_score NUMERIC(5, 2) NOT NULL,
    duplicate_hotel_count INTEGER DEFAULT 0,
    duplicate_sightseeing_count INTEGER DEFAULT 0,
    missing_coordinates_count INTEGER DEFAULT 0,
    missing_description_count INTEGER DEFAULT 0,
    inconsistent_room_mappings_count INTEGER DEFAULT 0,
    large_price_variance_count INTEGER DEFAULT 0,
    items_requiring_human_review INTEGER DEFAULT 0,
    category_breakdown JSONB DEFAULT '{}'::jsonb,
    actionable_recommendations JSONB DEFAULT '[]'::jsonb
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_hotels_supplier ON hotels(supplier_id);
CREATE INDEX IF NOT EXISTS idx_hotels_canonical ON hotels(canonical_id);
CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(city);
CREATE INDEX IF NOT EXISTS idx_hotels_status ON hotels(matching_status);
CREATE INDEX IF NOT EXISTS idx_sightseeing_supplier ON sightseeing_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_sightseeing_city ON sightseeing_products(destination_city);
CREATE INDEX IF NOT EXISTS idx_matches_classification ON product_matches(classification);
CREATE INDEX IF NOT EXISTS idx_matches_status ON product_matches(status);
CREATE INDEX IF NOT EXISTS idx_offers_hotel ON hotel_offers(hotel_id);
CREATE INDEX IF NOT EXISTS idx_offers_price ON hotel_offers(price);
