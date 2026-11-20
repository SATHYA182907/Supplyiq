import React, { useState, useEffect } from 'react';
import { CheckSquare, CheckCircle2, XCircle, ShieldCheck, MapPin } from 'lucide-react';
import { api } from '../../services/api';
import { DuplicateMatch } from '../../types';

export const VerificationCenterPage: React.FC = () => {
  const [queue, setQueue] = useState<DuplicateMatch[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await api.getMatches({ status: 'PENDING' });
      setQueue(res);
      const logs = await fetch('/api/verification/audit-logs').then(r => r.json()).catch(() => []);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAction = async (matchId: string, action: string) => {
    try {
      await api.reviewMatch(matchId, action);
      await fetchQueue();
    } catch (err) {
      console.error('Review failed:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-beige-100 text-primary border border-beige-300 text-xs font-semibold mb-2">
          <CheckSquare className="w-3.5 h-3.5 text-primary" />
          <span>Human-in-the-Loop Arbitration</span>
        </div>
        <h1 className="text-xl md:text-2xl font-display font-bold text-ink-primary tracking-tight">
          Verification Center & Match Queue
        </h1>
        <p className="text-xs text-ink-secondary mt-1">
          Uncertain AI match candidates (55%–94% confidence) awaiting operator sign-off before canonical merge.
        </p>
      </div>

      <div className="space-y-4">
        {queue.map((m) => (
          <div key={m.id} className="p-5 rounded-2xl bg-white border border-border shadow-soft">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle text-xs">
              <span className="font-bold text-status-warning bg-status-warning/10 px-2 py-0.5 rounded-full">
                {m.classification.replace('_', ' ')} • {m.overall_confidence}% Confidence
              </span>
              <span className="text-ink-muted">Match ID: {m.id}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 text-xs">
              <div className="p-3 rounded-xl bg-beige-50 border border-border">
                <span className="font-bold text-primary">{m.source_supplier_name}</span>
                <h4 className="font-bold text-ink-primary mt-1">{m.source_name}</h4>
                <div className="text-[11px] text-ink-secondary mt-0.5">{m.source_address}</div>
              </div>
              <div className="p-3 rounded-xl bg-beige-50 border border-border">
                <span className="font-bold text-primary">{m.target_supplier_name}</span>
                <h4 className="font-bold text-ink-primary mt-1">{m.target_name}</h4>
                <div className="text-[11px] text-ink-secondary mt-0.5">{m.target_address}</div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border-subtle">
              <button
                onClick={() => handleAction(m.id, 'REJECT')}
                className="px-3 py-1.5 rounded-lg border border-border text-ink-secondary hover:bg-beige-50 text-xs font-semibold"
              >
                Reject
              </button>
              <button
                onClick={() => handleAction(m.id, 'KEEP_SEPARATE')}
                className="px-3 py-1.5 rounded-lg border border-border text-ink-secondary hover:bg-beige-50 text-xs font-semibold"
              >
                Keep Separate
              </button>
              <button
                onClick={() => handleAction(m.id, 'APPROVE')}
                className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-soft"
              >
                Approve & Merge
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
