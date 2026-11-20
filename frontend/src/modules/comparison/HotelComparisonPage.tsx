import React, { useState, useEffect } from 'react';
import {
  Scale, Building2, CheckCircle2, Zap, Shield, Tag,
  ArrowRight, Sparkles, AlertTriangle, TrendingDown, DollarSign
} from 'lucide-react';
import { api } from '../../services/api';

export const HotelComparisonPage: React.FC = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedCanonicalId, setSelectedCanonicalId] = useState<string>('CAN-HTL-001');
  const [comparisonData, setComparisonData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.getCanonicalGroups();
        setGroups(res);
        if (res.length > 0) {
          setSelectedCanonicalId(res[0].canonical_id);
        }
      } catch (err) {
        console.error('Failed to load canonical groups:', err);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    if (!selectedCanonicalId) return;
    const fetchComparison = async () => {
      try {
        setLoading(true);
        const data = await api.compareHotelOffers(selectedCanonicalId);
        setComparisonData(data);
      } catch (err) {
        console.error('Failed to load comparison data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, [selectedCanonicalId]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-beige-100 text-primary border border-beige-300 text-xs font-semibold mb-2">
            <Scale className="w-3.5 h-3.5 text-primary" />
            <span>Multi-Supplier Arbitrage & Parity Comparison</span>
          </div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-ink-primary tracking-tight">
            Canonical Hotel Offer Comparison
          </h1>
          <p className="text-xs text-ink-secondary mt-1">
            Compare live supplier offers for identical canonical hotel properties to identify optimal rates and policy terms.
          </p>
        </div>
      </div>

      {/* Property Selector Bar */}
      <div className="p-4 rounded-xl bg-white border border-border shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-xs">
          <span className="font-semibold text-ink-primary">Select Canonical Property:</span>
          <select
            value={selectedCanonicalId}
            onChange={(e) => setSelectedCanonicalId(e.target.value)}
            className="px-3 py-2 bg-beige-50 border border-border rounded-lg text-ink-primary font-medium text-xs focus:outline-none focus:border-primary max-w-md"
          >
            {groups.map(g => (
              <option key={g.canonical_id} value={g.canonical_id}>
                {g.sample_name} ({g.city}) — {g.supplier_count} Suppliers
              </option>
            ))}
          </select>
        </div>

        {comparisonData && comparisonData.price_spread && (
          <div className="flex items-center space-x-3 text-xs bg-beige-100 px-3 py-1.5 rounded-xl border border-beige-300">
            <TrendingDown className="w-4 h-4 text-status-success" />
            <span>
              Price Arbitrage Spread: <strong className="text-status-success font-bold">${comparisonData.price_spread.savings_amount} ({comparisonData.price_spread.savings_percent}%)</strong>
            </span>
          </div>
        )}
      </div>

      {/* Highlights Cards */}
      {comparisonData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Lowest Eligible Rate */}
          <div className="p-4 rounded-xl bg-beige-50/70 border border-border shadow-soft">
            <div className="flex items-center justify-between text-xs text-ink-secondary">
              <span className="font-semibold text-ink-primary flex items-center space-x-1.5">
                <DollarSign className="w-3.5 h-3.5 text-status-success" />
                <span>Lowest Eligible Rate</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-status-success/10 text-status-success">
                Best Price
              </span>
            </div>
            <div className="text-2xl font-extrabold text-ink-primary mt-2">
              ${comparisonData.price_spread.min_price} USD
            </div>
            <div className="text-[11px] text-ink-secondary mt-1">
              Active offer ID: {comparisonData.lowest_eligible_price_offer_id}
            </div>
          </div>

          {/* Best Cancellation Flexibility */}
          <div className="p-4 rounded-xl bg-beige-50/70 border border-border shadow-soft">
            <div className="flex items-center justify-between text-xs text-ink-secondary">
              <span className="font-semibold text-ink-primary flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span>Best Cancellation Policy</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-status-info/10 text-status-info">
                Flexible
              </span>
            </div>
            <div className="text-sm font-bold text-ink-primary mt-2">
              100% Free Cancellation
            </div>
            <div className="text-[11px] text-ink-secondary mt-1">
              Zero cancellation penalty prior to check-in
            </div>
          </div>

          {/* Top Overall Recommended Offer */}
          <div className="p-4 rounded-xl bg-beige-gradient border border-beige-300 shadow-soft">
            <div className="flex items-center justify-between text-xs text-ink-secondary">
              <span className="font-semibold text-primary flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Top Overall Ranked Offer</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-primary border border-beige-300">
                Optimal
              </span>
            </div>
            <div className="text-sm font-bold text-ink-primary mt-2">
              Optimized for Rate + Reliability
            </div>
            <div className="text-[11px] text-ink-secondary mt-1">
              Fulfillment score &gt;92% with competitive tariff
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Offer Table */}
      {comparisonData && (
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-soft">
          <div className="p-4 border-b border-border bg-beige-50/50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-ink-primary">{comparisonData.canonical_name}</h3>
              <p className="text-xs text-ink-secondary">Destination: {comparisonData.city} • {comparisonData.star_rating} Stars • {comparisonData.total_offers} Supplier Offers</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-beige-50 border-b border-border text-ink-secondary font-semibold">
                <tr>
                  <th className="py-3 px-4">Supplier Partner</th>
                  <th className="py-3 px-4">Room Configuration</th>
                  <th className="py-3 px-4">Standard Taxonomy</th>
                  <th className="py-3 px-4">Meal Plan</th>
                  <th className="py-3 px-4">Cancellation Policy</th>
                  <th className="py-3 px-4">Reliability</th>
                  <th className="py-3 px-4 text-right">Price (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-ink-primary">
                {comparisonData.offers.map((offer: any) => {
                  const isLowest = offer.id === comparisonData.lowest_eligible_price_offer_id;
                  const isBestRanked = offer.id === comparisonData.best_ranked_offer_id;

                  return (
                    <tr
                      key={offer.id}
                      className={`transition-colors ${
                        isBestRanked ? 'bg-beige-50/70 font-medium' : 'hover:bg-beige-50/30'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-ink-primary flex items-center space-x-1.5">
                          <span>{offer.supplier_name}</span>
                          {isBestRanked && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary text-white">
                              TOP
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-ink-muted font-mono">{offer.id}</span>
                      </td>

                      <td className="py-3 px-4 font-medium text-ink-primary">
                        {offer.room_name}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-beige-100 text-primary text-[10px] font-semibold border border-beige-300">
                          {offer.standard_room_type || 'Standard Room'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-ink-primary">
                          {offer.meal_plan === 'RO' ? 'Room Only' : offer.meal_plan === 'BB' ? 'Bed & Breakfast' : offer.meal_plan}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          offer.cancellation_policy.includes('FREE')
                            ? 'bg-status-success/10 text-status-success'
                            : 'bg-status-warning/10 text-status-warning'
                        }`}>
                          {offer.cancellation_policy.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-ink-primary">{offer.supplier_reliability}%</span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className={`text-sm font-bold ${isLowest ? 'text-status-success' : 'text-ink-primary'}`}>
                          ${offer.price.toFixed(2)}
                        </div>
                        {isLowest && (
                          <span className="text-[9px] text-status-success font-semibold uppercase">
                            Lowest Rate
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
