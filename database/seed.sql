-- SUPPLYIQ Seed Data
-- 5 Simulated Suppliers for Demonstration

INSERT INTO suppliers (id, name, code, contact_email, contact_phone, integration_type, status, total_records, last_synchronization, reliability_score)
VALUES
('SUP-TSA-01', 'TravelSource A', 'TSA', 'api-support@travelsource-demo.io', '+1-800-555-0191', 'REST_API', 'ACTIVE', 160, CURRENT_TIMESTAMP - INTERVAL '2 hours', 94.50),
('SUP-GSB-02', 'GlobalStay B', 'GSB', 'connectivity@globalstay-sim.com', '+44-20-7946-0922', 'SFTP_CSV', 'ACTIVE', 185, CURRENT_TIMESTAMP - INTERVAL '4 hours', 88.20),
('SUP-HCC-03', 'HotelConnect C', 'HCC', 'partner-ops@hotelconnect-demo.net', '+65-6789-0123', 'REST_API', 'ACTIVE', 145, CURRENT_TIMESTAMP - INTERVAL '1 hour', 96.80),
('SUP-EWD-04', 'ExploreWorld D', 'EWD', 'inventory@exploreworld-sim.org', '+33-1-4268-5500', 'GRAPHQL', 'ACTIVE', 165, CURRENT_TIMESTAMP - INTERVAL '6 hours', 89.10),
('SUP-TNE-05', 'TripNetwork E', 'TNE', 'supply@tripnetwork-demo.travel', '+971-4-312-8000', 'REST_API', 'ACTIVE', 145, CURRENT_TIMESTAMP - INTERVAL '30 minutes', 92.40)
ON CONFLICT (id) DO NOTHING;

-- Standard Room Types Taxonomy
INSERT INTO room_types (id, standard_name, standard_category, bed_configuration, default_max_occupancy, description)
VALUES
('RT-STD-DBL', 'Standard Double', 'STANDARD', 'DOUBLE', 2, 'Standard hotel room with one double bed'),
('RT-STD-TWN', 'Standard Twin', 'STANDARD', 'TWIN', 2, 'Standard hotel room with two separate single/twin beds'),
('RT-SUP-KNG', 'Superior King', 'SUPERIOR', 'KING', 2, 'Upgraded room with one king-size bed and city/garden view'),
('RT-DLX-KNG', 'Deluxe King', 'DELUXE', 'KING', 2, 'Spacious luxury room with one king-size bed and premium amenities'),
('RT-DLX-TWN', 'Deluxe Twin', 'DELUXE', 'TWIN', 2, 'Spacious luxury room with two twin beds'),
('RT-DLX-QUN', 'Deluxe Double Queen', 'DELUXE', 'MULTI', 4, 'Large room with two queen beds accommodating up to 4 guests'),
('RT-EXE-STE', 'Executive Suite', 'SUITE', 'KING', 2, 'Premium suite with separate living room and executive lounge access'),
('RT-FAM-STE', 'Family Suite', 'FAMILY', 'MULTI', 4, 'Multi-bed suite specifically suited for families with children'),
('RT-PRS-STE', 'Presidential Suite', 'SUITE', 'KING', 4, 'Ultra-luxury top-floor penthouse suite with dedicated butler service')
ON CONFLICT (id) DO NOTHING;
