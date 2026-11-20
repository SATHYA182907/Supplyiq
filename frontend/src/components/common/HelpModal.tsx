import React from 'react';
import { X, BookOpen, Brain, Layers, Database, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HelpModal: React.FC = () => {
  const { openHelpModal, setOpenHelpModal } = useApp();

  if (!openHelpModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-dropdown">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-beige-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-beige-200 border border-beige-300 flex items-center justify-center text-primary">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ink-primary">SUPPLYIQ Architecture & Operator Guide</h2>
              <p className="text-[11px] text-ink-secondary">TBO Multi-Supplier Inventory Optimization Platform</p>
            </div>
          </div>
          <button
            onClick={() => setOpenHelpModal(false)}
            className="p-1.5 rounded-lg border border-border hover:bg-beige-100 text-ink-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-xs text-ink-primary">
          {/* Section 1: Problem Statement */}
          <div className="p-4 rounded-xl bg-beige-50/70 border border-border">
            <h3 className="font-semibold text-primary mb-1 text-sm flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>Core Problem & Mission</span>
            </h3>
            <p className="text-ink-secondary leading-relaxed">
              Global travel aggregators ingest millions of hotel and sightseeing records from disparate wholesale bedbanks and tour operators.
              Discrepancies in naming conventions, geocoordinates, room configurations, and experience inclusions lead to customer confusion,
              lost margins, and booking failures. SUPPLYIQ solves this via entity resolution, automated room taxonomy mapping, and multi-supplier offer arbitration.
            </p>
          </div>

          {/* Section 2: Hybrid AI Matching Engine */}
          <div>
            <h4 className="font-bold text-ink-primary mb-3 text-xs uppercase tracking-wider text-primary">
              1. Hybrid AI Duplicate Detection Pipeline
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-border bg-white">
                <span className="font-semibold text-ink-primary block mb-1">Step 1: Brand Stem Normalization</span>
                <span className="text-ink-secondary">Strips noise tokens (Hotel, Resort, The, Inc, Spa) to isolate the true brand stem.</span>
              </div>
              <div className="p-3 rounded-lg border border-border bg-white">
                <span className="font-semibold text-ink-primary block mb-1">Step 2: Candidate Blocking</span>
                <span className="text-ink-secondary">Partitions candidate pairs by destination city and brand token clusters.</span>
              </div>
              <div className="p-3 rounded-lg border border-border bg-white">
                <span className="font-semibold text-ink-primary block mb-1">Step 3: Fuzzy String Scoring</span>
                <span className="text-ink-secondary">Applies RapidFuzz token sort and token set ratios to catch permutations and typos.</span>
              </div>
              <div className="p-3 rounded-lg border border-border bg-white">
                <span className="font-semibold text-ink-primary block mb-1">Step 4: Geodesic Haversine Distance</span>
                <span className="text-ink-secondary">Measures physical coordinate distance. Proximity &lt;350m earns high confidence; &gt;1.2km enforces critical separation.</span>
              </div>
            </div>
          </div>

          {/* Section 3: Room-Type & Sightseeing Guardrails */}
          <div className="space-y-2">
            <h4 className="font-bold text-ink-primary text-xs uppercase tracking-wider text-primary">
              2. Strict Domain Safety Guardrails
            </h4>
            <ul className="space-y-2 text-ink-secondary">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                <span><strong>Bed Configuration Invariance:</strong> The room mapping engine never automatically classifies King and Twin/Double-Queen configurations as equivalent to protect guest expectations.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                <span><strong>Sightseeing Inclusion Separation:</strong> Direct admission tickets, guided tours, and transfer packages for the same attraction are kept separate to prevent false equivalence.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                <span><strong>Preservation of Raw Supplier Data:</strong> Raw supplier payloads are permanently retained in <code className="bg-beige-100 px-1 py-0.5 rounded text-[11px]">raw_supplier_records</code> before creating standardized entities.</span>
              </li>
            </ul>
          </div>

          {/* Section 4: Intelligent Ranking Formula */}
          <div className="p-4 rounded-xl bg-beige-gradient border border-beige-300">
            <h4 className="font-bold text-ink-primary text-xs mb-1">3. Multi-Criteria Ranking Formula</h4>
            <code className="text-xs font-mono text-primary font-bold block mb-2">
              R = 0.30P + 0.25V + 0.15S + 0.15C + 0.10Q + 0.05U
            </code>
            <p className="text-[11px] text-ink-secondary leading-relaxed">
              Where P = Price Competitiveness, V = Product Quality / Star Rating, S = Supplier Reliability Fulfillment %, C = Cancellation Flexibility, Q = Data Completeness, and U = User Supplier Preferences. Configurable in real-time under Smart Ranking.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-beige-50 flex items-center justify-between">
          <span className="text-[11px] text-ink-secondary">SupplyIQ v1.0.0 • Supabase / PostgreSQL Ready</span>
          <button
            onClick={() => setOpenHelpModal(false)}
            className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
