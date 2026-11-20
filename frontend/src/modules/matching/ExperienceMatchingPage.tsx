import React, { useState, useEffect } from 'react';
import { Compass, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { DuplicateMatch } from '../../types';

export const ExperienceMatchingPage: React.FC = () => {
  const [matches, setMatches] = useState<DuplicateMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await api.getMatches({ product_type: 'SIGHTSEEING' });
      setMatches(res);
    } catch (err) {
      console.error('Failed to load sightseeing matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-beige-100 text-primary border border-beige-300 text-xs font-semibold mb-2">
          <Compass className="w-3.5 h-3.5 text-primary" />
          <span>Inclusions & Itinerary Resolution Engine</span>
        </div>
        <h1 className="text-xl md:text-2xl font-display font-bold text-ink-primary tracking-tight">
          Sightseeing & Experience Matching
        </h1>
        <p className="text-xs text-ink-secondary mt-1">
          Identifies equivalent experiences while keeping admission tickets, guided excursions, and transfer combos distinct.
        </p>
      </div>

      <div className="space-y-4">
        {matches.map((m) => (
          <div key={m.id} className="p-5 rounded-2xl bg-white border border-border shadow-soft">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle text-xs">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                m.classification === 'STRONG_MATCH' ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning'
              }`}>
                {m.classification.replace('_', ' ')}
              </span>
              <span className="font-bold text-primary">Confidence: {m.overall_confidence}%</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 text-xs">
              <div className="p-3 rounded-xl bg-beige-50 border border-border">
                <span className="text-[10px] text-primary font-bold block">{m.source_supplier_name}</span>
                <h4 className="font-bold text-ink-primary mt-1">{m.source_name}</h4>
                <div className="text-[11px] text-ink-secondary mt-0.5">{m.source_address}</div>
              </div>
              <div className="p-3 rounded-xl bg-beige-50 border border-border">
                <span className="text-[10px] text-primary font-bold block">{m.target_supplier_name}</span>
                <h4 className="font-bold text-ink-primary mt-1">{m.target_name}</h4>
                <div className="text-[11px] text-ink-secondary mt-0.5">{m.target_address}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
