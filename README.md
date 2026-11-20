# Supplyiq

## AI-Powered Multi-Supplier Inventory Optimization Platform

SupplyIQ is an enterprise-grade travel technology SaaS platform that consolidates, deduplicates, standardizes, compares, and ranks hotel and sightseeing inventory across multiple wholesale bedbanks and tour operators. It addresses the **TBO Multi-Supplier Optimization** problem statement through hybrid AI entity resolution, room-type taxonomy mapping, inclusion preservation, and multi-criteria optimization ranking.

---

## 🌟 Key Capabilities & Architectural Pillars

1. **Hybrid AI Duplicate Detection**:
   - **Stem Normalization**: Strips noise tokens (Hotel, Resort, The, Inc, Spa) to isolate the physical brand stem.
   - **Candidate Blocking**: Partitions records by destination city and brand token clusters.
   - **RapidFuzz Fuzzy Matching**: Token sort & token set algorithms resilience against supplier abbreviations.
   - **Haversine Geodesic Distance**: Physical proximity scoring (<350m high match confidence; >1.2km strict separation constraint).
   - **Semantic Embeddings**: Cosine similarity across property descriptions.
   - **Safety Rule**: Never merges different properties solely on name similarity.

2. **Intelligent Room-Type Mapping**:
   - Standardizes supplier room labels into canonical categories (*Standard Double, Deluxe King, Superior Twin, Family Suite, Executive Suite*).
   - **Bed Configuration Guardrail**: Never classifies King, Twin, and Double-Queen configurations as equivalent.
   - Discrepancy flags for occupancy variance and bed mismatch.

3. **Sightseeing & Experience Resolution**:
   - Preserves critical differences between admission-only tickets, guided tours, transfers, and VIP experiences.
   - Prevents false equivalence for the same physical attraction.

4. **Multi-Supplier Arbitrage & Parity Comparison**:
   - Side-by-side offer comparison for canonical properties.
   - Highlights Lowest Eligible Rate, Best Cancellation Policy, and Savings Spread (up to 24% arbitrage detected).

5. **Multi-Criteria Intelligent Ranking**:
   - Formula: \( R = 0.30P + 0.25V + 0.15S + 0.15C + 0.10Q + 0.05U \)
   - Real-time interactive weight sliders for Price (P), Relevance (V), Supplier Reliability (S), Cancellation Flexibility (C), Data Quality (Q), and Customer Preference (U).
   - Grounded natural-language AI explanations.

6. **Human-in-the-Loop Verification Center**:
   - Dedicated review queue for borderline candidates (55%–94% confidence) with audit logging.

7. **Data Ingestion Engine**:
   - Validates CSV schemas, required columns, coordinates, and prices.
   - Preserves raw payloads in `raw_supplier_records` before standardizing.

---

## 🎨 Design System

SupplyIQ strictly adheres to a **White + Warm Beige Gradient** enterprise design language:
- **Primary Background**: `#FFFFFF`
- **Secondary Background**: `#FFFCF8`
- **Warm Beige**: `#F5EDE2`
- **Light Beige**: `#F9F3EA`
- **Beige Gradient**: `linear-gradient(135deg, #FFFFFF 0%, #F8F1E8 50%, #EFE3D3 100%)`
- **Primary Text**: `#29251F`
- **Secondary Text**: `#77716A`
- **Primary Accent**: `#B58A5A`
- **Border**: `#EAE3D9`
- **Typography**: Inter & Plus Jakarta Sans

---

## 🏗️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Framer Motion, React Router v6.
- **Backend**: Python 3.14 / FastAPI, Pydantic, RapidFuzz, Pandas, NumPy, Uvicorn.
- **Database**: 
  - Production: Supabase PostgreSQL (`pgvector`, `PostGIS`, RLS, all 19 relational tables).
  - Local/Demo: Embedded SQLite engine (`supplyiq.db`) with zero external dependency setup.

---

## 🚀 Quickstart & Setup Commands

### 1. Prerequisites
- Node.js 18+ (Tested on v25.1.0)
- Python 3.10+ (Tested on v3.14.7)

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API documentation is available at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The application will be live at `http://localhost:5173`.

---

## 🧪 Ground-Truth Benchmark Results

Evaluated against the ground-truth benchmark of 892 verified equivalent pairs:
- **Recall**: **98.54%** (879 true positives detected)
- **Precision**: **72.95%** (at baseline 75% threshold; reaches >94% at 94% strong-match threshold)
- **F1 Score**: **83.83%**

---

## 📊 Database Schema (19 Tables)

1. `suppliers`
2. `supplier_integrations`
3. `ingestion_jobs`
4. `raw_supplier_records`
5. `canonical_products`
6. `hotels`
7. `room_types`
8. `room_mappings`
9. `hotel_offers`
10. `sightseeing_products`
11. `experience_offers`
12. `product_attributes`
13. `product_embeddings`
14. `product_matches`
15. `match_reviews`
16. `ranking_results`
17. `supplier_performance`
18. `processing_logs`
19. `inventory_quality_reports`

PostgreSQL migration scripts are located in `database/migrations/001_initial_schema.sql` and `database/seed.sql`.

---

## 🛡️ License
Proprietary • Built for TBO Multi-Supplier Optimization
