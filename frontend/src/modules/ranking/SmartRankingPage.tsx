import React, { useState } from 'react';
import {
  Trophy, Search, Sliders, Sparkles, Star, ShieldCheck,
  CheckCircle2, DollarSign, Clock, ArrowRight, Award, Zap
} from 'lucide-react';
import { api } from '../../services/api';
import { RankedOffer } from '../../types';

export const SmartRankingPage: React.FC = () => {
  const [destination, setDestination] = useState('Dubai');
  const [maxBudget, setMaxBudget] = useState<number>(600);
  const [minStar, setMinStar] = useState<number>(4.0);
  const [cancellationPreferred, setCancellationPreferred] = useState(true);

  // Configurable weights: R = 0.30P + 0.25V + 0.15S + 0.15C + 0.10Q + 0.05U
  const [weightPrice, setWeightPrice] = useState(30);
  const [weightRelevance, setWeightRelevance] = useState(25);
  const [weightReliability, setWeightReliability] = useState(15);
  const [weightCancellation, setWeightCancellation] = useState(15);
  const [weightQuality, setWeightQuality] = useState(10);
  const [weightPreference, setWeightPreference] = useState(5);

  const [loading, setLoading] = useState(false);
  const [rankingResponse, setRankingResponse] = useState<{
    destination: string;
    total_eligible_offers: number;
    applied_weights: Record<string, number>;
    ranked_offers: RankedOffer[];
    ai_summary_explanation: string;
  } | null>(null);

  const handleExecuteRanking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const res = await api.executeRanking({
        destination,
        product_type: 'HOTEL',
        max_budget: maxBudget || undefined,
        min_star_rating: minStar || undefined,
        cancellation_preferred: cancellationPreferred,
        weight_price: weightPrice / 100,
        weight_relevance: weightRelevance / 100,
        weight_supplier_reliability: weightReliability / 100,
        weight_cancellation: weightCancellation / 100,
        weight_info_quality: weightQuality / 100,
        weight_preference: weightPreference / 100,
      });
      setRankingResponse(res);
    } catch (err) {
      console.error('Ranking failed:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    handleExecuteRanking();
  }, []);

  const totalWeights = weightPrice + weightRelevance + weightReliability + weightCancellation + weightQuality + weightPreference;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-beige-100 text-primary border border-beige-300 text-xs font-semibold mb-2">
          <Trophy className="w-3.5 h-3.5 text-primary" />
          <span>Multi-Criteria Optimization Engine</span>
        </div>
        <h1 className="text-xl md:text-2xl font-display font-bold text-ink-primary tracking-tight">
          Intelligent Product Ranking & Recommendation
        </h1>
        <p className="text-xs text-ink-secondary mt-1">
          Applies hard availability & budget constraints, computes multi-attribute optimization score, and generates grounded natural-language explanations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Control Panel: Hard Constraints & Interactive Sliders */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-border shadow-soft">
            <h3 className="font-bold text-sm text-ink-primary mb-3 flex items-center space-x-2">
              <Search className="w-4 h-4 text-primary" />
              <span>Search Parameters (Hard Constraints)</span>
            </h3>

            <form onSubmit={handleExecuteRanking} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-ink-primary block mb-1">Destination City</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 bg-beige-50 border border-border rounded-lg text-ink-primary focus:outline-none focus:border-primary font-medium"
                >
                  <option value="Dubai">Dubai, UAE</option>
                  <option value="Singapore">Singapore</option>
                  <option value="London">London, UK</option>
                  <option value="Paris">Paris, France</option>
                  <option value="New York">New York, USA</option>
                  <option value="Tokyo">Tokyo, Japan</option>
                  <option value="Rome">Rome, Italy</option>
                  <option value="Bangkok">Bangkok, Thailand</option>
                  <option value="Barcelona">Barcelona, Spain</option>
                  <option value="Sydney">Sydney, Australia</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-ink-primary mb-1">
                  <span>Max Budget Cap</span>
                  <span className="text-primary font-bold">${maxBudget} USD</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1500"
                  step="50"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div>
                <label className="font-semibold text-ink-primary block mb-1">Minimum Star Rating</label>
                <select
                  value={minStar}
                  onChange={(e) => setMinStar(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-beige-50 border border-border rounded-lg text-ink-primary focus:outline-none focus:border-primary"
                >
                  <option value="3.0">3.0+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="4.5">4.5+ Stars (Superior)</option>
                  <option value="5.0">5.0 Stars Only (Luxury)</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cancellationPreferred}
                    onChange={(e) => setCancellationPreferred(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <span className="font-medium text-ink-primary">Prioritize Free Cancellation</span>
                </label>
              </div>
            </form>
          </div>

          {/* Real-time Weight Sliders */}
          <div className="p-5 rounded-2xl bg-white border border-border shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-ink-primary flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-primary" />
                <span>Configurable Weights ({totalWeights}%)</span>
              </h3>
            </div>
            <code className="text-[10px] block font-mono text-primary font-bold bg-beige-50 p-2 rounded-lg border border-border">
              R = 0.30P + 0.25V + 0.15S + 0.15C + 0.10Q + 0.05U
            </code>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-ink-secondary mb-1">
                  <span>Price Competitiveness (P)</span>
                  <strong className="text-ink-primary">{weightPrice}%</strong>
                </div>
                <input
                  type="range" min="0" max="60" value={weightPrice}
                  onChange={(e) => setWeightPrice(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-ink-secondary mb-1">
                  <span>Product Relevance (V)</span>
                  <strong className="text-ink-primary">{weightRelevance}%</strong>
                </div>
                <input
                  type="range" min="0" max="50" value={weightRelevance}
                  onChange={(e) => setWeightRelevance(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-ink-secondary mb-1">
                  <span>Supplier Reliability (S)</span>
                  <strong className="text-ink-primary">{weightReliability}%</strong>
                </div>
                <input
                  type="range" min="0" max="40" value={weightReliability}
                  onChange={(e) => setWeightReliability(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-ink-secondary mb-1">
                  <span>Cancellation Flexibility (C)</span>
                  <strong className="text-ink-primary">{weightCancellation}%</strong>
                </div>
                <input
                  type="range" min="0" max="40" value={weightCancellation}
                  onChange={(e) => setWeightCancellation(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-ink-secondary mb-1">
                  <span>Information Quality (Q)</span>
                  <strong className="text-ink-primary">{weightQuality}%</strong>
                </div>
                <input
                  type="range" min="0" max="30" value={weightQuality}
                  onChange={(e) => setWeightQuality(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            <button
              onClick={() => handleExecuteRanking()}
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-soft transition-all"
            >
              {loading ? 'Optimizing Offers...' : 'Re-compute Ranking'}
            </button>
          </div>
        </div>

        {/* Right Area: Results & Explanations */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI Summary Card */}
          {rankingResponse && (
            <div className="p-5 rounded-2xl bg-beige-gradient border border-beige-300 shadow-soft">
              <div className="flex items-center space-x-2 text-primary font-bold text-xs mb-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>AI Recommendation Intelligence</span>
              </div>
              <p className="text-xs text-ink-primary leading-relaxed font-medium">
                {rankingResponse.ai_summary_explanation}
              </p>
            </div>
          )}

          {/* Ranked Offers Table */}
          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-soft">
            <div className="p-4 border-b border-border bg-beige-50/50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-ink-primary">
                Ranked Eligible Offers ({rankingResponse?.total_eligible_offers || 0})
              </h3>
              <span className="text-[11px] text-ink-muted">Sorted by optimization score</span>
            </div>

            <div className="divide-y divide-border-subtle">
              {rankingResponse?.ranked_offers.map((offer) => (
                <div key={offer.product_id} className={`p-4 transition-colors ${offer.rank === 1 ? 'bg-beige-50/40' : 'hover:bg-beige-50/20'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        offer.rank === 1
                          ? 'bg-primary text-white shadow-soft'
                          : offer.rank <= 3
                          ? 'bg-beige-200 text-primary border border-beige-300'
                          : 'bg-beige-50 text-ink-secondary border border-border'
                      }`}>
                        #{offer.rank}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-ink-primary">{offer.product_name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-beige-100 text-primary border border-beige-300">
                            {offer.supplier_name}
                          </span>
                        </div>
                        <div className="text-[11px] text-ink-secondary mt-0.5">
                          {offer.room_or_variant} • {offer.cancellation_policy.replace('_', ' ')}
                        </div>

                        {/* Recommendation Reasons */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {offer.recommendation_reasons.map((r, i) => (
                            <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-status-success/10 text-status-success border border-status-success/20">
                              ✓ {r}
                            </span>
                          ))}
                        </div>

                        {/* Grounded Natural Language Explanation */}
                        {offer.ai_explanation && (
                          <p className="text-[11px] text-ink-secondary mt-2 italic bg-white p-2 rounded-lg border border-border">
                            "{offer.ai_explanation}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-extrabold text-ink-primary">${offer.price}</div>
                      <div className="text-xs font-bold text-primary mt-1">Score: {offer.ranking_score}/100</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
