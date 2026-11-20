import React, { useState, useEffect } from 'react';
import { History, FileText, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { IngestionJob } from '../../types';

export const ProcessingHistoryPage: React.FC = () => {
  const [jobs, setJobs] = useState<IngestionJob[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.getIngestionJobs();
        setJobs(res);
      } catch (err) {
        console.error('Failed to load jobs:', err);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-display font-bold text-ink-primary tracking-tight">
          Data Ingestion & Processing History
        </h1>
        <p className="text-xs text-ink-secondary mt-1">
          Complete audit trail of all wholesale batch uploads, validation reports, and matching executions.
        </p>
      </div>

      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-soft">
        <table className="w-full text-left text-xs">
          <thead className="bg-beige-50 border-b border-border text-ink-secondary font-semibold">
            <tr>
              <th className="py-3 px-4">Job ID & Supplier</th>
              <th className="py-3 px-4">File Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Record Counts</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-ink-primary">
            {jobs.map((j) => (
              <tr key={j.id} className="hover:bg-beige-50/50">
                <td className="py-3 px-4">
                  <div className="font-semibold text-ink-primary">{j.supplier_name || j.supplier_id}</div>
                  <span className="text-[10px] text-ink-muted font-mono">{j.id}</span>
                </td>
                <td className="py-3 px-4 font-medium">{j.file_name}</td>
                <td className="py-3 px-4">{j.category}</td>
                <td className="py-3 px-4">
                  <span>{j.successful_count} valid / {j.record_count} total</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-success/10 text-status-success">
                    {j.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-ink-muted">
                  {new Date(j.started_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
