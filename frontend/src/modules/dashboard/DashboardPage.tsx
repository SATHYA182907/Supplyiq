import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Compass, Users, CheckCircle, AlertTriangle, Layers,
  Sparkles, TrendingUp, ArrowRight, ShieldCheck, RefreshCw, BarChart2,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { DashboardSummary, AIInsight } from '../../types';
import { SupplierDistributionChart, InventoryCategoryPieChart, MatchingConfidenceChart } from '../../components/charts/DashboardCharts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [supplierDist, setSupplierDist] = useState<any[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, distRes, insRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getSupplierDistribution(),
        api.getAIInsights(),
      ]);
      setSummary(sumRes);
      setSupplierDist(distRes);
      setInsights(insRes);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRunDuplicateScan = async () => {
    try {
      setIsScanning(true);
      await api.triggerHotelMatching();
      await fetchDashboardData();
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Hero Banner (Beige Gradient Accent) */}
      <div className="relative overflow-hidden rounded-2xl bg-beige-gradient border border-beige-300 p-6 md:p-8 shadow-card">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/80 border border-beige-300 text-xs font-semibold text-primary mb-3 shadow-soft">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Autonomous Multi-Supplier Inventory Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-extrabold text-ink-primary tracking-tight">
              TBO Multi-Supplier Optimization
            </h1>
            <p className="text-sm text-ink-secondary mt-1.5 max-w-2xl leading-relaxed">
              Consolidating, matching, comparing, and ranking hotel and sightseeing products across 5 simulated suppliers with hybrid AI entity resolution and multi-criteria optimization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunDuplicateScan}
              disabled={isScanning}
              className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-soft transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning Catalog...' : 'Trigger AI Duplicate Scan'}</span>
            </button>
            <button
              onClick={() => navigate('/optimization/smart-ranking')}
              className="px-4 py-2.5 rounded-xl bg-white border border-border text-ink-primary text-xs font-semibold hover:bg-beige-50 shadow-soft transition-all flex items-center space-x-1.5"
            >
              <span>Smart Ranking Engine</span>
              <ArrowRight className="w-3.5 h-3.5 text-ink-secondary" />
            </button>
          </div>
        </div>
      </div>

      {/* 8 Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        {/* Total Suppliers */}
        <div className="p-4 rounded-xl bg-white border border-border shadow-soft hover:border-beige-400 transition-colors">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">Total Suppliers</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-ink-primary mt-2">
            {summary ? summary.total_suppliers : 5}
          </div>
          <div className="text-[11px] text-ink-muted mt-1">Simulated Connected APIs</div>
        </div>

        {/* Total Inventory Records */}
        <div className="p-4 rounded-xl bg-white border border-border shadow-soft hover:border-beige-400 transition-colors">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">Inventory Records</span>
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-ink-primary mt-2">
            {summary ? summary.total_inventory_records.toLocaleString() : '800'}
          </div>
          <div className="text-[11px] text-ink-muted mt-1">500 Hotels + 300 Experiences</div>
        </div>

        {/* Hotel Listings */}
        <div className="p-4 rounded-xl bg-white border border-border shadow-soft hover:border-beige-400 transition-colors">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">Hotel Listings</span>
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-ink-primary mt-2">
            {summary ? summary.hotel_listings : 500}
          </div>
          <div className="text-[11px] text-status-success font-medium mt-1">Multi-Supplier Normalized</div>
        </div>

        {/* Sightseeing Products */}
        <div className="p-4 rounded-xl bg-white border border-border shadow-soft hover:border-beige-400 transition-colors">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">Sightseeing Products</span>
            <Compass className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-ink-primary mt-2">
            {summary ? summary.sightseeing_products : 300}
          </div>
          <div className="text-[11px] text-status-success font-medium mt-1">Inclusions Categorized</div>
        </div>

        {/* Potential Duplicate Groups */}
        <div className="p-4 rounded-xl bg-white border border-border shadow-soft hover:border-beige-400 transition-colors">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">Potential Duplicates</span>
            <AlertTriangle className="w-4 h-4 text-status-warning" />
          </div>
          <div className="text-2xl font-bold text-status-warning mt-2">
            {summary ? summary.potential_duplicate_groups.toLocaleString() : '1,246'}
          </div>
          <div className="text-[11px] text-ink-muted mt-1">Similarity Threshold 75%+</div>
        </div>

        {/* Confirmed Matches */}
        <div className="p-4 rounded-xl bg-white border border-border shadow-soft hover:border-beige-400 transition-colors">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">Confirmed Matches</span>
            <CheckCircle className="w-4 h-4 text-status-success" />
          </div>
          <div className="text-2xl font-bold text-status-success mt-2">
            {summary ? summary.confirmed_matches.toLocaleString() : '1,263'}
          </div>
          <div className="text-[11px] text-ink-muted mt-1">Strong Match &gt;94%</div>
        </div>

        {/* Manual Review Required */}
        <div className="p-4 rounded-xl bg-white border border-border shadow-soft hover:border-beige-400 transition-colors">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">Manual Review Req.</span>
            <AlertCircle className="w-4 h-4 text-status-error" />
          </div>
          <div className="text-2xl font-bold text-ink-primary mt-2">
            {summary ? summary.manual_review_required.toLocaleString() : '1,264'}
          </div>
          <div className="text-[11px] text-primary font-medium mt-1">
            <button onClick={() => navigate('/verification')} className="underline">Open Review Queue</button>
          </div>
        </div>

        {/* Inventory Quality Score */}
        <div className="p-4 rounded-xl bg-beige-gradient border border-beige-300 shadow-soft">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-semibold text-primary">Quality Score</span>
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-extrabold text-ink-primary mt-2">
            {summary ? summary.inventory_quality_score : 88.6}%
          </div>
          <div className="text-[11px] text-ink-secondary mt-1">Multi-Attribute Completeness</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supplier Distribution */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-ink-primary">Inventory Distribution by Supplier</h3>
              <p className="text-xs text-ink-secondary">Volume of Hotel vs Sightseeing products per connected partner</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-beige-100 text-primary border border-beige-200">
              5 Suppliers
            </span>
          </div>
          <SupplierDistributionChart data={supplierDist} />
        </div>

        {/* Category Split */}
        <div className="p-5 rounded-2xl bg-white border border-border shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-ink-primary">Hotel vs Sightseeing Ratio</h3>
            <p className="text-xs text-ink-secondary">Catalog inventory segmentation</p>
          </div>
          <InventoryCategoryPieChart
            hotels={summary ? summary.hotel_listings : 500}
            sightseeing={summary ? summary.sightseeing_products : 300}
          />
          <div className="text-center text-xs text-ink-secondary border-t border-border pt-3">
            Total active unified inventory: <strong>800 records</strong>
          </div>
        </div>
      </div>

      {/* AI Insights & Confidence Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Actionable Insights */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-ink-primary">Active AI Inventory Insights</h3>
            </div>
            <button
              onClick={() => navigate('/insights')}
              className="text-xs text-primary font-semibold hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                onClick={() => navigate(insight.action_url)}
                className="p-3.5 rounded-xl border border-border hover:border-primary/50 hover:bg-beige-50/50 cursor-pointer transition-all flex items-start justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      insight.type === 'WARNING'
                        ? 'bg-status-warning/10 text-status-warning border border-status-warning/20'
                        : insight.type === 'SUCCESS'
                        ? 'bg-status-success/10 text-status-success border border-status-success/20'
                        : 'bg-status-info/10 text-status-info border border-status-info/20'
                    }`}>
                      {insight.category}
                    </span>
                    <h4 className="text-xs font-semibold text-ink-primary">{insight.title}</h4>
                  </div>
                  <p className="text-[11px] text-ink-secondary mt-1 leading-relaxed">
                    {insight.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-ink-primary">{insight.affected_count}</span>
                  <span className="block text-[10px] text-ink-muted">records</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence Tier Distribution */}
        <div className="p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-ink-primary">Matching Confidence Distribution</h3>
            <p className="text-xs text-ink-secondary">Breakdown across similarity thresholds</p>
          </div>
          <MatchingConfidenceChart />
          <div className="mt-3 p-3 rounded-lg bg-beige-50 border border-border text-[11px] text-ink-secondary leading-tight">
            Strong candidates (&gt;94%) auto-link to Canonical entities. Borderline cases (75%–94%) enter human review.
          </div>
        </div>
      </div>
    </div>
  );
};
