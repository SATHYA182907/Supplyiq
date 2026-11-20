import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, AlertTriangle, ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { api } from '../../services/api';
import { AIInsight } from '../../types';

export const AIInsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await api.getAIInsights();
        setInsights(res);
      } catch (err) {
        console.error('Failed to load insights:', err);
      }
    };
    fetchInsights();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-beige-100 text-primary border border-beige-300 text-xs font-semibold mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-primary" />
          <span>Real-Time Catalog Health Auditing</span>
        </div>
        <h1 className="text-xl md:text-2xl font-display font-bold text-ink-primary tracking-tight">
          AI Inventory Insights & Anomaly Detection
        </h1>
        <p className="text-xs text-ink-secondary mt-1">
          Automated audits detecting duplicate clusters, missing coordinates, room mapping variance, and supplier price arbitrage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((ins) => (
          <div
            key={ins.id}
            onClick={() => navigate(ins.action_url)}
            className="p-5 rounded-2xl bg-white border border-border hover:border-primary/50 shadow-soft cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  ins.type === 'WARNING' ? 'bg-status-warning/10 text-status-warning' : 'bg-status-success/10 text-status-success'
                }`}>
                  {ins.category}
                </span>
                <span className="text-xs font-bold text-ink-primary">{ins.affected_count} records affected</span>
              </div>
              <h3 className="font-bold text-sm text-ink-primary mt-2">{ins.title}</h3>
              <p className="text-xs text-ink-secondary mt-1 leading-relaxed">{ins.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-primary font-semibold">
              <span>Inspect Affected Records</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
