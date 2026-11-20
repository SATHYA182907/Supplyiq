#!/usr/bin/env python3
"""
SUPPLYIQ - Synthetic Dataset Generator
Generates:
- 500 Hotel Records across 5 suppliers
- 300 Sightseeing Records across 5 suppliers
- Deliberate near-duplicates, geographic variations, room naming variations, conflicting attributes
- Ground-truth evaluation files for matching precision & recall
"""

import os
import csv
import json
import random

random.seed(42)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HOTELS_DIR = os.path.join(BASE_DIR, "hotels")
SIGHTSEEING_DIR = os.path.join(BASE_DIR, "sightseeing")
SUPPLIERS_DIR = os.path.join(BASE_DIR, "suppliers")
GROUND_TRUTH_DIR = os.path.join(BASE_DIR, "ground_truth")

for d in [HOTELS_DIR, SIGHTSEEING_DIR, SUPPLIERS_DIR, GROUND_TRUTH_DIR]:
    os.makedirs(d, exist_ok=True)

SUPPLIERS = [
    {"id": "SUP-TSA-01", "code": "TSA", "name": "TravelSource A", "reliability": 94.5},
    {"id": "SUP-GSB-02", "code": "GSB", "name": "GlobalStay B", "reliability": 88.2},
    {"id": "SUP-HCC-03", "code": "HCC", "name": "HotelConnect C", "reliability": 96.8},
    {"id": "SUP-EWD-04", "code": "EWD", "name": "ExploreWorld D", "reliability": 89.1},
    {"id": "SUP-TNE-05", "code": "TNE", "name": "TripNetwork E", "reliability": 92.4},
]

# Write suppliers CSV
with open(os.path.join(SUPPLIERS_DIR, "suppliers.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["supplier_id", "code", "name", "contact_email", "integration_type", "status", "reliability_score"])
    writer.writeheader()
    for s in SUPPLIERS:
        writer.writerow({
            "supplier_id": s["id"],
            "code": s["code"],
            "name": s["name"],
            "contact_email": f"connectivity@{s['code'].lower()}-sim.io",
            "integration_type": "REST_API" if s["code"] != "GSB" else "SFTP_CSV",
            "status": "ACTIVE",
            "reliability_score": s["reliability"]
        })

print("Generated suppliers.csv")

# 100 Anchor / Canonical Hotel Prototypes that span 500 supplier records
ANCHOR_HOTELS = [
    {
        "canonical_id": "CAN-HTL-001",
        "name": "Atlantis The Palm",
        "city": "Dubai",
        "country": "United Arab Emirates",
        "lat": 25.1304,
        "lon": 55.1171,
        "star": 5.0,
        "base_price": 420.0,
        "aliases": ["Atlantis The Palm Hotel & Resort", "Atlantis, The Palm", "The Palm Atlantis Resort Dubai", "Atlantis Palm Luxury Resort"],
        "base_address": "Crescent Road, Palm Jumeirah, Dubai",
        "rooms": [
            ("Ocean King Room", "KING", 2, "Deluxe King", 420.0),
            ("Palm Queen Room", "MULTI", 4, "Deluxe Double Queen", 460.0),
            ("Imperial Club King Suite", "KING", 2, "Executive Suite", 680.0)
        ]
    },
    {
        "canonical_id": "CAN-HTL-002",
        "name": "Burj Al Arab Jumeirah",
        "city": "Dubai",
        "country": "United Arab Emirates",
        "lat": 25.1412,
        "lon": 55.1852,
        "star": 5.0,
        "base_price": 1250.0,
        "aliases": ["Burj Al Arab Hotel", "Jumeirah Burj Al Arab Luxury Hotel", "Burj Al Arab All-Suite Hotel", "Burj Al Arab Dubai"],
        "base_address": "Jumeirah Beach Road, Umm Suqeim, Dubai",
        "rooms": [
            ("Deluxe One-Bedroom Suite", "KING", 2, "Executive Suite", 1250.0),
            ("Panoramic Suite", "KING", 2, "Executive Suite", 1580.0),
            ("Two Bedroom Family Suite", "MULTI", 4, "Family Suite", 2400.0)
        ]
    },
    {
        "canonical_id": "CAN-HTL-003",
        "name": "Marina Bay Sands",
        "city": "Singapore",
        "country": "Singapore",
        "lat": 1.2838,
        "lon": 103.8591,
        "star": 5.0,
        "base_price": 550.0,
        "aliases": ["Marina Bay Sands Hotel", "MBS Hotel Singapore", "Marina Bay Sands Luxury Resort", "Marina Bay Sands Bayfront"],
        "base_address": "10 Bayfront Avenue, Marina Bay, Singapore",
        "rooms": [
            ("Deluxe King Room", "KING", 2, "Deluxe King", 550.0),
            ("Deluxe Twin Room", "TWIN", 2, "Deluxe Twin", 560.0),
            ("Sands Premier King", "KING", 2, "Superior King", 720.0)
        ]
    },
    {
        "canonical_id": "CAN-HTL-004",
        "name": "The Ritz-Carlton Millenia Singapore",
        "city": "Singapore",
        "country": "Singapore",
        "lat": 1.2912,
        "lon": 103.8598,
        "star": 5.0,
        "base_price": 490.0,
        "aliases": ["Ritz Carlton Millenia", "The Ritz-Carlton Singapore", "Millenia Ritz Carlton Hotel", "Ritz-Carlton Millenia Marina Centre"],
        "base_address": "7 Raffles Avenue, Marina Bay, Singapore",
        "rooms": [
            ("Grand Kallang King", "KING", 2, "Superior King", 490.0),
            ("Grand Marina Twin", "TWIN", 2, "Deluxe Twin", 530.0),
            ("Club Executive Suite", "KING", 2, "Executive Suite", 850.0)
        ]
    },
    {
        "canonical_id": "CAN-HTL-005",
        "name": "The Savoy",
        "city": "London",
        "country": "United Kingdom",
        "lat": 51.5101,
        "lon": -0.1205,
        "star": 5.0,
        "base_price": 780.0,
        "aliases": ["The Savoy Hotel London", "Savoy Hotel Strand", "Fairmont Savoy London", "The Savoy A Fairmont Managed Hotel"],
        "base_address": "Strand, Covent Garden, London WC2R 0EZ",
        "rooms": [
            ("Superior Queen Room", "QUEEN", 2, "Superior King", 780.0),
            ("Deluxe King River View", "KING", 2, "Deluxe King", 920.0),
            ("Personality River Suite", "KING", 2, "Executive Suite", 1450.0)
        ]
    },
    {
        "canonical_id": "CAN-HTL-006",
        "name": "The Langham London",
        "city": "London",
        "country": "United Kingdom",
        "lat": 51.5178,
        "lon": -0.1436,
        "star": 5.0,
        "base_price": 620.0,
        "aliases": ["The Langham Hotel", "Langham Hotel Regent Street", "The Langham Luxury Hotel London", "Langham London Marylebone"],
        "base_address": "1C Portland Place, Regent Street, London W1B 1JA",
        "rooms": [
            ("Superior Double Room", "DOUBLE", 2, "Standard Double", 620.0),
            ("Deluxe King Room", "KING", 2, "Deluxe King", 710.0),
            ("Executive Club Suite", "KING", 2, "Executive Suite", 1100.0)
        ]
    },
    {
        "canonical_id": "CAN-HTL-007",
        "name": "Hotel Plaza Athenee Paris",
        "city": "Paris",
        "country": "France",
        "lat": 48.8661,
        "lon": 2.3045,
        "star": 5.0,
        "base_price": 1100.0,
        "aliases": ["Plaza Athenee Paris", "Dorchester Collection Plaza Athenee", "Hotel Plaza Athenee Dorchester", "Plaza Athenee Montaigne"],
        "base_address": "25 Avenue Montaigne, 8th arr., 75008 Paris",
        "rooms": [
            ("Superior Single/Double", "DOUBLE", 2, "Standard Double", 1100.0),
            ("Deluxe King Room Courtyard", "KING", 2, "Deluxe King", 1350.0),
            ("Eiffel Suite Prestige", "KING", 2, "Executive Suite", 2600.0)
        ]
    },
    {
        "canonical_id": "CAN-HTL-008",
        "name": "The Plaza Hotel New York",
        "city": "New York",
        "country": "United States",
        "lat": 40.7645,
        "lon": -73.9745,
        "star": 5.0,
        "base_price": 890.0,
        "aliases": ["The Plaza New York", "Fairmont The Plaza NYC", "The Plaza Hotel Fifth Avenue", "The Plaza A Fairmont Managed Hotel"],
        "base_address": "768 5th Ave, Central Park South, New York, NY 10019",
        "rooms": [
            ("Plaza King Room", "KING", 2, "Superior King", 890.0),
            ("Deluxe King Fifth Avenue", "KING", 2, "Deluxe King", 1050.0),
            ("Edwardian Two Queen Suite", "MULTI", 4, "Family Suite", 1600.0)
        ]
    },
    {
        "canonical_id": "CAN-HTL-009",
        "name": "The Tokyo Station Hotel",
        "city": "Tokyo",
        "country": "Japan",
        "lat": 35.6812,
        "lon": 139.7671,
        "star": 4.5,
        "base_price": 450.0,
        "aliases": ["Tokyo Station Hotel Marunouchi", "The Tokyo Station Heritage Hotel", "Tokyo Station Hotel Chiyoda", "Station Hotel Tokyo"],
        "base_address": "1-9-1 Marunouchi, Chiyoda-ku, Tokyo 100-0005",
        "rooms": [
            ("Classic Queen", "QUEEN", 2, "Standard Double", 450.0),
            ("Palace Side Twin", "TWIN", 2, "Deluxe Twin", 510.0),
            ("Dome Side King", "KING", 2, "Deluxe King", 580.0)
        ]
    },
    {
        "canonical_id": "CAN-HTL-010",
        "name": "Hotel de Russie Rome",
        "city": "Rome",
        "country": "Italy",
        "lat": 41.9097,
        "lon": 12.4764,
        "star": 5.0,
        "base_price": 720.0,
        "aliases": ["Hotel de Russie Rocco Forte", "Rocco Forte Hotel de Russie", "Hotel de Russie Piazza del Popolo", "De Russie Hotel Rome"],
        "base_address": "Via del Babuino 9, Spagna, 00187 Rome",
        "rooms": [
            ("Classic Double", "DOUBLE", 2, "Standard Double", 720.0),
            ("Executive King Garden View", "KING", 2, "Superior King", 890.0),
            ("Popolo Junior Suite", "KING", 2, "Executive Suite", 1350.0)
        ]
    }
]

# Expand to 120 canonical anchors programmatically across major world travel destinations
DESTINATIONS = [
    ("Dubai", "United Arab Emirates", 25.2048, 55.2708),
    ("Singapore", "Singapore", 1.3521, 103.8198),
    ("London", "United Kingdom", 51.5074, -0.1278),
    ("Paris", "France", 48.8566, 2.3522),
    ("New York", "United States", 40.7128, -74.0060),
    ("Tokyo", "Japan", 35.6762, 139.6503),
    ("Rome", "Italy", 41.9028, 12.4964),
    ("Bangkok", "Thailand", 13.7563, 100.5018),
    ("Barcelona", "Spain", 41.3851, 2.1734),
    ("Sydney", "Australia", -33.8688, 151.2093),
    ("Amsterdam", "Netherlands", 52.3676, 4.9041),
    ("Istanbul", "Turkey", 41.0082, 28.9784)
]

HOTEL_BRAND_TYPES = [
    ("Grand Hyatt", 4.5, 280),
    ("JW Marriott", 4.5, 310),
    ("Four Seasons Hotel", 5.0, 650),
    ("InterContinental", 4.5, 290),
    ("Hilton Garden Inn", 3.5, 140),
    ("Novotel City Centre", 4.0, 160),
    ("Sheraton Grand", 4.5, 240),
    ("Radisson Blu", 4.0, 180),
    ("Sofitel Luxury Hotel", 4.5, 320),
    ("Crowne Plaza", 4.0, 175)
]

hotel_id_counter = 11
for dest_city, dest_country, base_lat, base_lon in DESTINATIONS:
    for brand, star, price in HOTEL_BRAND_TYPES:
        if hotel_id_counter > 115:
            break

        can_id = f"CAN-HTL-{hotel_id_counter:03d}"
        lat_jitter = (random.random() - 0.5) * 0.08
        lon_jitter = (random.random() - 0.5) * 0.08
        full_name = f"{brand} {dest_city}"
        
        ANCHOR_HOTELS.append({
            "canonical_id": can_id,
            "name": full_name,
            "city": dest_city,
            "country": dest_country,
            "lat": round(base_lat + lat_jitter, 5),
            "lon": round(base_lon + lon_jitter, 5),
            "star": star,
            "base_price": price,
            "aliases": [
                f"{brand} Hotel {dest_city}",
                f"{full_name} Downtown",
                f"The {brand} {dest_city}",
                f"{brand} {dest_city} Centre"
            ],
            "base_address": f"{random.randint(10, 450)} Central Boulevard, {dest_city}",
            "rooms": [
                (f"Standard King Room", "KING", 2, "Deluxe King", price),
                (f"Standard Twin Room", "TWIN", 2, "Standard Twin", round(price * 0.95, 2)),
                (f"Club Executive King", "KING", 2, "Executive Suite", round(price * 1.5, 2))
            ]
        })
        hotel_id_counter += 1

# Now generate 500 hotel supplier records by distributing among 5 suppliers with varying noise
hotel_supplier_records = []
hotel_ground_truth_matches = []
record_id = 1001

for anchor in ANCHOR_HOTELS:
    # 3 to 5 suppliers carry each hotel
    num_suppliers = random.choice([3, 4, 5, 5, 5])
    selected_suppliers = random.sample(SUPPLIERS, num_suppliers)
    
    cluster_records = []
    
    for i, supp in enumerate(selected_suppliers):
        # Introduce naming variations
        if i == 0:
            name = anchor["name"]
        else:
            name = random.choice(anchor["aliases"])
            
        # Introduce occasional spelling typo / abbreviation
        if random.random() < 0.2:
            name = name.replace("Hotel", "Htl").replace("Resort", "Res").replace("and", "&")
            
        # Geographic coordinate variations (micro-shift vs missing)
        if random.random() < 0.04: # 4% missing coordinates for data quality detection
            lat, lon = "", ""
        else:
            lat = round(anchor["lat"] + (random.random() - 0.5) * 0.0006, 6)
            lon = round(anchor["lon"] + (random.random() - 0.5) * 0.0006, 6)
            
        # Price variation (+/- 12%)
        price_factor = 1.0 + (random.random() - 0.5) * 0.24
        price = round(anchor["base_price"] * price_factor, 2)
        
        # Room variations
        rooms_list = []
        for r_name, bed, occ, std_t, r_price in anchor["rooms"]:
            # modify room naming per supplier
            supp_r_name = r_name
            if supp["code"] == "GSB":
                supp_r_name = r_name.replace("Room", "").strip() + " - " + bed
            elif supp["code"] == "HCC":
                supp_r_name = f"1x {r_name} Non-Smoking"
            elif supp["code"] == "EWD":
                supp_r_name = f"{r_name} (City View)"
            rooms_list.append({
                "room_name": supp_r_name,
                "bed_type": bed,
                "max_occupancy": occ,
                "standard_type": std_t,
                "price": round(r_price * price_factor, 2),
                "meal_plan": random.choice(["RO", "BB", "BB", "HB"]),
                "cancellation": random.choice(["FREE_CANCELLATION", "FREE_CANCELLATION", "NON_REFUNDABLE"])
            })
            
        supp_rec_id = f"HTL-{supp['code']}-{record_id:05d}"
        record = {
            "record_id": supp_rec_id,
            "supplier_id": supp["id"],
            "supplier_name": supp["name"],
            "canonical_ground_truth": anchor["canonical_id"],
            "hotel_name": name,
            "city": anchor["city"],
            "country": anchor["country"],
            "address": anchor["base_address"] + (f", Ste {i+1}" if i > 0 else ""),
            "latitude": lat,
            "longitude": lon,
            "star_rating": anchor["star"],
            "base_price": price,
            "currency": "USD",
            "availability": random.choice(["AVAILABLE", "AVAILABLE", "AVAILABLE", "ON_REQUEST"]),
            "cancellation_policy": random.choice(["FREE_CANCELLATION", "FREE_CANCELLATION", "NON_REFUNDABLE", "CONDITIONAL"]),
            "rooms": json.dumps(rooms_list),
            "description": f"Luxury property located in {anchor['city']}. Offering world-class amenities, premium rooms, and fine dining.",
            "facilities": json.dumps(["Free WiFi", "Swimming Pool", "Fitness Center", "Spa", "Airport Shuttle", "Restaurant"])
        }
        hotel_supplier_records.append(record)
        cluster_records.append(supp_rec_id)
        record_id += 1
        
    # Record ground truth pairwise equivalence
    for a in range(len(cluster_records)):
        for b in range(a + 1, len(cluster_records)):
            hotel_ground_truth_matches.append({
                "record_a": cluster_records[a],
                "record_b": cluster_records[b],
                "is_match": True,
                "canonical_id": anchor["canonical_id"],
                "reason": "Same physical hotel across suppliers"
            })

# Exactly 500 records
print(f"Total candidate hotel records before slice: {len(hotel_supplier_records)}")
hotel_supplier_records = hotel_supplier_records[:500]
if len(hotel_supplier_records) < 500:
    # duplicate some with new IDs to guarantee 500
    while len(hotel_supplier_records) < 500:
        base = random.choice(hotel_supplier_records).copy()
        record_id += 1
        supp = random.choice(SUPPLIERS)
        base["record_id"] = f"HTL-{supp['code']}-{record_id:05d}"
        base["supplier_id"] = supp["id"]
        base["supplier_name"] = supp["name"]
        hotel_supplier_records.append(base)


# Write hotels CSV
with open(os.path.join(HOTELS_DIR, "hotels_sample.csv"), "w", newline="", encoding="utf-8") as f:
    fieldnames = ["record_id", "supplier_id", "supplier_name", "canonical_ground_truth", "hotel_name", "city", "country", "address", "latitude", "longitude", "star_rating", "base_price", "currency", "availability", "cancellation_policy", "rooms", "description", "facilities"]
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for row in hotel_supplier_records:
        writer.writerow(row)

with open(os.path.join(GROUND_TRUTH_DIR, "hotel_ground_truth.json"), "w", encoding="utf-8") as f:
    json.dump({
        "total_records": len(hotel_supplier_records),
        "total_anchors": len(ANCHOR_HOTELS),
        "matches": hotel_ground_truth_matches
    }, f, indent=2)

print(f"Generated {len(hotel_supplier_records)} hotel records and ground truth.")

# ----------------------------------------------------
# SIGHTSEEING INVENTORY GENERATION (300 records)
# ----------------------------------------------------
ANCHOR_ATTRACTIONS = [
    {
        "attraction": "Burj Khalifa",
        "city": "Dubai",
        "country": "United Arab Emirates",
        "variants": [
            {"tier": "TICKET", "title": "At The Top Burj Khalifa (Levels 124 & 125) Entry Ticket", "type": "TICKET_ONLY", "duration": 1.5, "transfer": False, "meal": False, "access": "GENERAL", "price": 48.0},
            {"tier": "FAST_TRACK", "title": "Burj Khalifa At The Top VIP Fast Track Skip-The-Line", "type": "VIP_ACCESS", "duration": 2.0, "transfer": False, "meal": False, "access": "SKIP_THE_LINE", "price": 95.0},
            {"tier": "COMBO_TRANSFER", "title": "Burj Khalifa At The Top with Hotel Pick-up & Drop", "type": "TRANSFER_COMBO", "duration": 3.5, "transfer": True, "meal": False, "access": "GENERAL", "price": 82.0},
            {"tier": "DINNER_COMBO", "title": "Burj Khalifa Experience with 3-Course Rooftop Dinner", "type": "GUIDED_TOUR", "duration": 4.0, "transfer": False, "meal": True, "access": "VIP_BEHIND_THE_SCENES", "price": 140.0}
        ]
    },
    {
        "attraction": "Gardens by the Bay",
        "city": "Singapore",
        "country": "Singapore",
        "variants": [
            {"tier": "TICKET", "title": "Gardens by the Bay Double Conservatories Direct Entry", "type": "TICKET_ONLY", "duration": 2.5, "transfer": False, "meal": False, "access": "GENERAL", "price": 38.0},
            {"tier": "FAST_TRACK", "title": "Gardens by the Bay + Floral Fantasy & Skyway Access", "type": "VIP_ACCESS", "duration": 3.5, "transfer": False, "meal": False, "access": "SKIP_THE_LINE", "price": 58.0},
            {"tier": "GUIDED_TOUR", "title": "Guided Evening Supertree Grove & Marina Bay Tour", "type": "GUIDED_TOUR", "duration": 4.0, "transfer": True, "meal": False, "access": "GENERAL", "price": 75.0}
        ]
    },
    {
        "attraction": "Tower of London",
        "city": "London",
        "country": "United Kingdom",
        "variants": [
            {"tier": "TICKET", "title": "Tower of London & Crown Jewels Admission Ticket", "type": "TICKET_ONLY", "duration": 3.0, "transfer": False, "meal": False, "access": "GENERAL", "price": 42.0},
            {"tier": "GUIDED_TOUR", "title": "Tower of London Early Access Tour with Beefeater Guide", "type": "GUIDED_TOUR", "duration": 3.5, "transfer": False, "meal": False, "access": "SKIP_THE_LINE", "price": 89.0},
            {"tier": "COMBO", "title": "Tower of London Entry & River Thames Sightseeing Cruise", "type": "TRANSFER_COMBO", "duration": 5.0, "transfer": True, "meal": False, "access": "GENERAL", "price": 72.0}
        ]
    },
    {
        "attraction": "Louvre Museum",
        "city": "Paris",
        "country": "France",
        "variants": [
            {"tier": "TICKET", "title": "Louvre Museum Timed Entrance E-Ticket", "type": "TICKET_ONLY", "duration": 3.0, "transfer": False, "meal": False, "access": "GENERAL", "price": 32.0},
            {"tier": "GUIDED_TOUR", "title": "Louvre Museum Masterpieces Guided Tour (Skip the Line)", "type": "GUIDED_TOUR", "duration": 2.5, "transfer": False, "meal": False, "access": "SKIP_THE_LINE", "price": 78.0},
            {"tier": "PRIVATE_VIP", "title": "Exclusive Private Louvre Museum After-Hours Experience", "type": "VIP_ACCESS", "duration": 3.0, "transfer": True, "meal": True, "access": "VIP_BEHIND_THE_SCENES", "price": 280.0}
        ]
    },
    {
        "attraction": "Empire State Building",
        "city": "New York",
        "country": "United States",
        "variants": [
            {"tier": "TICKET", "title": "Empire State Building 86th Floor Observatory General Ticket", "type": "TICKET_ONLY", "duration": 2.0, "transfer": False, "meal": False, "access": "GENERAL", "price": 44.0},
            {"tier": "FAST_TRACK", "title": "Empire State Building 86th & 102nd Floor Express Pass", "type": "VIP_ACCESS", "duration": 2.5, "transfer": False, "meal": False, "access": "SKIP_THE_LINE", "price": 105.0}
        ]
    },
    {
        "attraction": "Colosseum & Roman Forum",
        "city": "Rome",
        "country": "Italy",
        "variants": [
            {"tier": "TICKET", "title": "Colosseum, Roman Forum & Palatine Hill Priority Entry", "type": "TICKET_ONLY", "duration": 3.0, "transfer": False, "meal": False, "access": "GENERAL", "price": 36.0},
            {"tier": "GUIDED_TOUR", "title": "Colosseum Gladiator Arena Floor & Underground Tour", "type": "GUIDED_TOUR", "duration": 3.5, "transfer": False, "meal": False, "access": "VIP_BEHIND_THE_SCENES", "price": 95.0}
        ]
    },
    {
        "attraction": "Sagrada Familia",
        "city": "Barcelona",
        "country": "Spain",
        "variants": [
            {"tier": "TICKET", "title": "Sagrada Familia Fast Track Ticket with Audio Guide", "type": "TICKET_ONLY", "duration": 2.0, "transfer": False, "meal": False, "access": "SKIP_THE_LINE", "price": 38.0},
            {"tier": "GUIDED_TOUR", "title": "Sagrada Familia Guided Tour with Tower Access", "type": "GUIDED_TOUR", "duration": 2.5, "transfer": False, "meal": False, "access": "SKIP_THE_LINE", "price": 68.0}
        ]
    },
    {
        "attraction": "Sydney Opera House",
        "city": "Sydney",
        "country": "Australia",
        "variants": [
            {"tier": "GUIDED_TOUR", "title": "Official Sydney Opera House Architectural Guided Tour", "type": "GUIDED_TOUR", "duration": 1.0, "transfer": False, "meal": False, "access": "GENERAL", "price": 45.0},
            {"tier": "VIP_ACCESS", "title": "Sydney Opera House Backstage Tour with Breakfast", "type": "VIP_ACCESS", "duration": 2.5, "transfer": False, "meal": True, "access": "VIP_BEHIND_THE_SCENES", "price": 175.0}
        ]
    }
]

# Generate more attractions to reach 300+ records
MORE_ATTRACTIONS = [
    ("Universal Studios Singapore", "Singapore", "Singapore", 85.0),
    ("Dubai Desert Safari & BBQ Dinner", "Dubai", "United Arab Emirates", 65.0),
    ("Eiffel Tower Summit Access", "Paris", "France", 52.0),
    ("Statue of Liberty & Ellis Island Ferry", "New York", "United States", 35.0),
    ("Vatican Museums & Sistine Chapel", "Rome", "Italy", 68.0),
    ("Tokyo Skytree Observatory", "Tokyo", "Japan", 28.0),
    ("Grand Palace & Wat Phra Kaew", "Bangkok", "Thailand", 30.0),
    ("Park Guell Guided Visit", "Barcelona", "Spain", 26.0),
    ("Blue Mountains Nature Day Tour", "Sydney", "Australia", 110.0),
    ("London Eye Panoramic Flight", "London", "United Kingdom", 40.0),
    ("Rijksmuseum & Van Gogh Museum Pass", "Amsterdam", "Netherlands", 45.0),
    ("Hagia Sophia & Blue Mosque Walking Tour", "Istanbul", "Turkey", 35.0),
    ("Dubai Marina Yacht Cruise", "Dubai", "United Arab Emirates", 55.0),
    ("Singapore Night Safari Tram Experience", "Singapore", "Singapore", 50.0),
    ("Versailles Palace & Gardens Day Tour", "Paris", "France", 85.0),
    ("Metropolitan Museum of Art Guided Tour", "New York", "United States", 60.0),
    ("Mount Fuji & Hakone Day Trip", "Tokyo", "Japan", 115.0),
    ("Capri Island Cruise from Rome", "Rome", "Italy", 130.0)
]

for name, city, country, p in MORE_ATTRACTIONS:
    ANCHOR_ATTRACTIONS.append({
        "attraction": name,
        "city": city,
        "country": country,
        "variants": [
            {"tier": "TICKET", "title": f"{name} Direct Admission", "type": "TICKET_ONLY", "duration": 2.5, "transfer": False, "meal": False, "access": "GENERAL", "price": p},
            {"tier": "VIP_TOUR", "title": f"{name} Guided Experience with Fast Pass", "type": "GUIDED_TOUR", "duration": 4.0, "transfer": True, "meal": False, "access": "SKIP_THE_LINE", "price": round(p * 1.8, 2)},
            {"tier": "PRIVATE_COMBO", "title": f"{name} Luxury Private Excursion with Lunch", "type": "VIP_ACCESS", "duration": 5.5, "transfer": True, "meal": True, "access": "VIP_BEHIND_THE_SCENES", "price": round(p * 2.6, 2)}
        ]
    })


sightseeing_supplier_records = []
sightseeing_ground_truth = []
sgt_id_counter = 2001

for anchor in ANCHOR_ATTRACTIONS:
    for variant in anchor["variants"]:
        can_variant_id = f"CAN-SGT-{anchor['attraction'][:3].upper()}-{variant['tier']}"
        
        # 3 to 5 suppliers list this specific variant
        num_suppliers = random.choice([3, 4, 5])
        selected_suppliers = random.sample(SUPPLIERS, num_suppliers)
        variant_cluster = []
        
        for supp in selected_suppliers:
            price_factor = 1.0 + (random.random() - 0.5) * 0.20
            p = round(variant["price"] * price_factor, 2)
            
            # modify wording per supplier
            title = variant["title"]
            if supp["code"] == "TSA":
                title = f"[Instant Confirmation] {title}"
            elif supp["code"] == "HCC":
                title = f"{title} - Official Voucher"
            elif supp["code"] == "EWD":
                title = title.replace("Ticket", "E-Ticket").replace("Tour", "Guided Excursion")
                
            rec_id = f"SGT-{supp['code']}-{sgt_id_counter:05d}"
            sightseeing_supplier_records.append({
                "product_id": rec_id,
                "supplier_id": supp["id"],
                "supplier_name": supp["name"],
                "attraction_name": anchor["attraction"],
                "product_title": title,
                "destination_city": anchor["city"],
                "destination_country": anchor["country"],
                "activity_type": variant["type"],
                "duration_hours": variant["duration"],
                "transfer_included": variant["transfer"],
                "transfer_type": "HOTEL_PICKUP" if variant["transfer"] else "NONE",
                "meal_included": variant["meal"],
                "meal_details": "3-Course Dinner" if variant["meal"] else "None",
                "access_type": variant["access"],
                "cancellation_policy": random.choice(["FREE_CANCELLATION", "FREE_CANCELLATION", "NON_REFUNDABLE"]),
                "base_price": p,
                "currency": "USD",
                "canonical_ground_truth": can_variant_id,
                "description": f"Enjoy unforgettable moments at {anchor['attraction']}. Experience includes {variant['title']} with {variant['access'].lower()} privileges."
            })
            variant_cluster.append(rec_id)
            sgt_id_counter += 1
            
        for a in range(len(variant_cluster)):
            for b in range(a + 1, len(variant_cluster)):
                sightseeing_ground_truth.append({
                    "record_a": variant_cluster[a],
                    "record_b": variant_cluster[b],
                    "is_match": True,
                    "canonical_id": can_variant_id,
                    "reason": "Equivalent sightseeing package and inclusion tier"
                })

# Exactly 300 records
print(f"Total candidate sightseeing records before slice: {len(sightseeing_supplier_records)}")
if len(sightseeing_supplier_records) < 300:
    while len(sightseeing_supplier_records) < 300:
        base = random.choice(sightseeing_supplier_records).copy()
        sgt_id_counter += 1
        supp = random.choice(SUPPLIERS)
        base["product_id"] = f"SGT-{supp['code']}-{sgt_id_counter:05d}"
        base["supplier_id"] = supp["id"]
        base["supplier_name"] = supp["name"]
        sightseeing_supplier_records.append(base)
else:
    sightseeing_supplier_records = sightseeing_supplier_records[:300]


# Write sightseeing CSV
with open(os.path.join(SIGHTSEEING_DIR, "sightseeing_sample.csv"), "w", newline="", encoding="utf-8") as f:
    fieldnames = ["product_id", "supplier_id", "supplier_name", "attraction_name", "product_title", "destination_city", "destination_country", "activity_type", "duration_hours", "transfer_included", "transfer_type", "meal_included", "meal_details", "access_type", "cancellation_policy", "base_price", "currency", "canonical_ground_truth", "description"]
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for row in sightseeing_supplier_records:
        writer.writerow(row)

with open(os.path.join(GROUND_TRUTH_DIR, "sightseeing_ground_truth.json"), "w", encoding="utf-8") as f:
    json.dump({
        "total_records": len(sightseeing_supplier_records),
        "matches": sightseeing_ground_truth
    }, f, indent=2)

print(f"Generated {len(sightseeing_supplier_records)} sightseeing records and ground truth.")

# Supplier Performance CSV
with open(os.path.join(SUPPLIERS_DIR, "supplier_performance.csv"), "w", newline="", encoding="utf-8") as f:
    fieldnames = ["supplier_id", "supplier_code", "period_date", "total_offers", "successful_bookings", "failed_bookings", "availability_accuracy", "price_accuracy", "cancellation_accuracy", "avg_response_time_ms", "data_completeness", "overall_score"]
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    
    dates = ["2026-11-01", "2026-11-05", "2026-11-10", "2026-11-15", "2026-11-20"]
    for s in SUPPLIERS:
        for d in dates:
            tot = random.randint(1200, 4500)
            fail = random.randint(15, 95)
            succ = tot - fail
            writer.writerow({
                "supplier_id": s["id"],
                "supplier_code": s["code"],
                "period_date": d,
                "total_offers": tot,
                "successful_bookings": succ,
                "failed_bookings": fail,
                "availability_accuracy": round(random.uniform(94.0, 99.2), 2),
                "price_accuracy": round(random.uniform(95.0, 99.8), 2),
                "cancellation_accuracy": round(random.uniform(96.0, 99.5), 2),
                "avg_response_time_ms": random.randint(180, 420),
                "data_completeness": round(random.uniform(88.0, 98.5), 2),
                "overall_score": s["reliability"]
            })

print("Generated supplier_performance.csv")
