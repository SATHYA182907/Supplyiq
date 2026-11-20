import React, { useState, useEffect } from 'react';
import {
  Brain, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Eye,
  ShieldCheck, MapPin, Building2, Sparkles, Filter, ChevronRight,
  ArrowRight, ShieldAlert, Check, X
} from 'lucide-react';
import { api } from '../../services/api';
import { DuplicateMatch } from '../../types';

export const DuplicateDetectionPage: React.FC = () => {
  const [matches, setMatches] = useState<DuplicateMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<DuplicateMatch | null>(null);
  
  // Filter state
  const [filterClassification, setFilterClassification] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [isScanning, setIsScanning] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await api.getMatches({
        product_type: 'HOTEL',
        status: filterStatus || undefined,
        classification: filterClassification || undefined,
      });
      setMatches(res);
    } catch (err) {
      console.error('Failed to load duplicate matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [filterClassification, filterStatus]);

  const handleAction = async (matchId: string, action: 'APPROVE' | 'REJECT' | 'MERGE' | 'KEEP_SEPARATE') => {
    try {
      await api.reviewMatch(matchId, action, 'Senior Inventory Analyst', `Action ${action} executed by user.`);
      setActionSuccessMsg(`Match ${matchId} successfully updated with action: ${action}`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
      await fetchMatches();
      if (selectedMatch?.id === matchId) {
        setSelectedMatch(null);
      }
    } catch (err) {
      console.error('Review error:', err);
    }
  };

  const handleTriggerEngine = async () => {
    try {
      setIsScanning(true);
      await api.triggerHotelMatching();
      await fetchMatches();
    } catch (err) {
      console.error('Trigger engine error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-beige-100 text-primary border border-beige-300 text-xs font-semibold mb-2">
            <Brain className="w-3.5 h-3.5 text-primary" />
            <span>Hybrid Multi-Signal AI Matching Engine</span>
          </div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-ink-primary tracking-tight">
            AI Duplicate Detection & Entity Resolution
          </h1>
          <p className="text-xs text-ink-secondary mt-1">
            Detects duplicate hotel properties across suppliers using tokenized RapidFuzz, Haversine geospatial proximity, and semantic embeddings.
          </p>
        </div>

        <button
          onClick={handleTriggerEngine}
          disabled={isScanning}
          className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-soft transition-all flex items-center space-x-2 shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Running AI Engine...' : 'Run Duplicate Scan'}</span>
        </button>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="p-4 rounded-xl bg-white border border-border shadow-soft flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterStatus === 'PENDING'
                ? 'bg-beige-100 text-primary border border-beige-300'
                : 'text-ink-secondary hover:bg-beige-50'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setFilterStatus('APPROVED')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterStatus === 'APPROVED'
                ? 'bg-beige-100 text-primary border border-beige-300'
                : 'text-ink-secondary hover:bg-beige-50'
            }`}
          >
            Approved / Merged
          </button>
          <button
            onClick={() => setFilterStatus('')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterStatus === ''
                ? 'bg-beige-100 text-primary border border-beige-300'
                : 'text-ink-secondary hover:bg-beige-50'
            }`}
          >
            All Candidates
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-ink-muted text-[11px]">Classification:</span>
          <select
            value={filterClassification}
            onChange={(e) => setFilterClassification(e.target.value)}
            className="px-2.5 py-1.5 bg-beige-50 border border-border rounded-lg text-ink-primary text-xs focus:outline-none focus:border-primary"
          >
            <option value="">All Tiers</option>
            <option value="STRONG_MATCH">Strong Match (&gt;94%)</option>
            <option value="POSSIBLE_MATCH">Possible Match (75%–94%)</option>
            <option value="NEEDS_VERIFICATION">Needs Verification</option>
          </select>
        </div>
      </div>

      {/* Candidate Matches List */}
      <div className="space-y-4">
        {matches.map((m) => (
          <div
            key={m.id}
            className="p-5 rounded-2xl bg-white border border-border hover:border-beige-400 shadow-soft transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
              {/* Left Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  m.classification === 'STRONG_MATCH'
                    ? 'bg-status-success/10 text-status-success border border-status-success/20'
                    : m.classification === 'POSSIBLE_MATCH'
                    ? 'bg-status-warning/10 text-status-warning border border-status-warning/20'
                    : 'bg-status-info/10 text-status-info border border-status-info/20'
                }`}>
                  {m.classification.replace('_', ' ')}
                </span>

                <span className="text-[11px] font-mono text-ink-muted">
                  ID: {m.id}
                </span>

                <span className="text-xs text-ink-secondary">
                  Destination: <strong>{m.source_city}</strong>
                </span>
              </div>

              {/* Confidence Score Pill */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-xs text-ink-muted">Overall Confidence</div>
                  <div className="text-lg font-extrabold text-primary">{m.overall_confidence}%</div>
                </div>
                <div className="w-12 h-2 rounded-full bg-beige-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      m.overall_confidence >= 94 ? 'bg-status-success' : m.overall_confidence >= 75 ? 'bg-status-warning' : 'bg-status-error'
                    }`}
                    style={{ width: `${m.overall_confidence}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Side-by-Side Property Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              {/* Record A */}
              <div className="p-4 rounded-xl bg-beige-50/60 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-primary border border-border">
                    {m.source_supplier_name}
                  </span>
                  <span className="text-[11px] font-mono text-ink-muted">{m.source_record_id}</span>
                </div>
                <h4 className="font-bold text-sm text-ink-primary">{m.source_name}</h4>
                <div className="text-xs text-ink-secondary mt-1 flex items-start space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{m.source_address || `${m.source_city} Downtown`}</span>
                </div>
              </div>

              {/* Record B */}
              <div className="p-4 rounded-xl bg-beige-50/60 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-primary border border-border">
                    {m.target_supplier_name}
                  </span>
                  <span className="text-[11px] font-mono text-ink-muted">{m.target_record_id}</span>
                </div>
                <h4 className="font-bold text-sm text-ink-primary">{m.target_name}</h4>
                <div className="text-xs text-ink-secondary mt-1 flex items-start space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{m.target_address || `${m.target_city} Downtown`}</span>
                </div>
              </div>
            </div>

            {/* Evidence & Conflict Breakdown */}
            <div className="p-3 rounded-xl bg-white border border-border-subtle grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
              <div>
                <span className="text-[10px] text-ink-muted block">Name Similarity</span>
                <span className="font-semibold text-ink-primary">{m.evidence.name_similarity.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted block">Address Similarity</span>
                <span className="font-semibold text-ink-primary">{m.evidence.address_similarity.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted block">Geodesic Proximity</span>
                <span className="font-semibold text-ink-primary">{m.evidence.geo_similarity.toFixed(1)}%</span>
                {m.evidence.distance_meters !== null && m.evidence.distance_meters !== undefined && (
                  <span className="text-[10px] text-ink-muted block">({m.evidence.distance_meters.toFixed(0)}m apart)</span>
                )}
              </div>
              <div>
                <span className="text-[10px] text-ink-muted block">Semantic Vector</span>
                <span className="font-semibold text-ink-primary">{m.evidence.description_similarity.toFixed(1)}%</span>
              </div>
            </div>

            {/* Conflicting Attributes Warning */}
            {m.conflicts && m.conflicts.length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-status-warning/10 border border-status-warning/30 text-xs">
                <div className="flex items-center space-x-1.5 font-bold text-status-warning mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Attribute Discrepancies Detected</span>
                </div>
                <ul className="space-y-1 text-ink-secondary text-[11px] pl-5 list-disc">
                  {m.conflicts.map((c, idx) => (
                    <li key={idx}>
                      <strong>{c.attribute}:</strong> {c.note} ({String(c.source_val)} vs {String(c.target_val)})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-ink-muted">
                Status: <strong>{m.status}</strong>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleAction(m.id, 'REJECT')}
                  className="px-3 py-1.5 rounded-lg border border-border text-ink-secondary hover:bg-beige-50 hover:text-status-error text-xs font-semibold flex items-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject Match</span>
                </button>

                <button
                  onClick={() => handleAction(m.id, 'KEEP_SEPARATE')}
                  className="px-3 py-1.5 rounded-lg border border-border text-ink-secondary hover:bg-beige-50 text-xs font-semibold"
                >
                  Keep Separate
                </button>

                <button
                  onClick={() => handleAction(m.id, 'APPROVE')}
                  className="px-4 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-hover text-xs font-semibold flex items-center space-x-1 shadow-soft"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Match</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
