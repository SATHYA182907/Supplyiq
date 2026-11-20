import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { SupplierPerformance } from '../../types';

export const SupplierAnalyticsPage: React.FC = () => {
  const [performance, setPerformance] = useState<SupplierPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerf = async () => {
      try {
        setLoading(true);
        const res = await api.getSupplierPerformance();
        setPerformance(res);
      } catch (err) {
        console.error('Failed to load supplier performance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerf();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-beige-100 text-primary border border-beige-300 text-xs font-semibold mb-2">
          <BarChart3 className="w-3.5 h-3.5 text-primary" />
          <span>Fulfillment & Parity SLAs</span>
        </div>
        <h1 className="text-xl md:text-2xl font-display font-bold text-ink-primary tracking-tight">
          Supplier SLA & Performance Analytics
        </h1>
        <p className="text-xs text-ink-secondary mt-1">
          Deep telemetry tracking booking accuracy, price parity compliance, response latency, and fulfillment reliability scores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {performance.map((s) => (
          <div key={s.supplier_id} className="p-5 rounded-2xl bg-white border border-border shadow-soft">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div>
                <h3 className="font-bold text-sm text-ink-primary">{s.supplier_name}</h3>
                <span className="text-[10px] text-ink-muted font-mono">{s.supplier_id}</span>
              </div>
              <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-lg bg-beige-100 border border-beige-300">
                {s.reliability_score}% Score
              </span>
            </div>

            <div className="space-y-2.5 mt-4 text-xs">
              <div className="flex justify-between">
                <span className="text-ink-secondary">Availability Accuracy:</span>
                <strong className="text-status-success">{s.availability_accuracy}%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Price Accuracy:</span>
                <strong className="text-status-success">{s.price_accuracy}%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Cancellation Compliance:</span>
                <strong className="text-status-success">{s.cancellation_accuracy}%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Average Latency:</span>
                <strong className="text-ink-primary">{s.avg_response_time_ms} ms</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Data Completeness:</span>
                <strong className="text-primary">{s.data_completeness}%</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
