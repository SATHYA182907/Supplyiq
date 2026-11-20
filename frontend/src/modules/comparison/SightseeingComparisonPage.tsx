import React, { useState, useEffect } from 'react';
import {
  Compass, CheckCircle2, Shield, Utensils, Car, Zap, DollarSign
} from 'lucide-react';
import { api } from '../../services/api';

export const SightseeingComparisonPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedAttraction, setSelectedAttraction] = useState('Burj Khalifa');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const res = await api.getSightseeing({ limit: 100 });
        setProducts(res);
      } catch (err) {
        console.error('Failed to load sightseeing products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const attractions = Array.from(new Set(products.map(p => p.attraction_name))).filter(Boolean);
  const matchingOffers = products.filter(p => p.attraction_name === selectedAttraction);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-beige-100 text-primary border border-beige-300 text-xs font-semibold mb-2">
          <Compass className="w-3.5 h-3.5 text-primary" />
          <span>Experience & Sightseeing Arbitrage Comparison</span>
        </div>
        <h1 className="text-xl md:text-2xl font-display font-bold text-ink-primary tracking-tight">
          Sightseeing Inclusions & Offer Comparison
        </h1>
        <p className="text-xs text-ink-secondary mt-1">
          Compare multi-supplier rates for attractions while strictly preserving differences between admission-only, guided tours, and transfers.
        </p>
      </div>

      {/* Attraction Selector */}
      <div className="p-4 rounded-xl bg-white border border-border shadow-soft flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-ink-primary">Select Attraction:</span>
          <select
            value={selectedAttraction}
            onChange={(e) => setSelectedAttraction(e.target.value)}
            className="px-3 py-2 bg-beige-50 border border-border rounded-lg text-ink-primary font-medium focus:outline-none focus:border-primary"
          >
            {attractions.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <span className="text-ink-secondary">
          Comparing <strong>{matchingOffers.length} supplier offers</strong>
        </span>
      </div>

      {/* Offers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {matchingOffers.map((offer) => (
          <div
            key={offer.id}
            className="p-5 rounded-2xl bg-white border border-border hover:border-beige-400 shadow-soft transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-beige-100 text-primary border border-beige-300">
                  {offer.supplier_name}
                </span>
                <span className="text-base font-extrabold text-ink-primary">${offer.base_price} USD</span>
              </div>

              <h3 className="font-bold text-sm text-ink-primary mt-2">{offer.product_title}</h3>
              <p className="text-[11px] text-ink-secondary mt-1 line-clamp-2">{offer.description}</p>

              <div className="mt-4 pt-3 border-t border-border-subtle space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-ink-secondary">
                  <span>Experience Type:</span>
                  <strong className="text-ink-primary">{offer.activity_type.replace('_', ' ')}</strong>
                </div>
                <div className="flex items-center justify-between text-ink-secondary">
                  <span>Access Tier:</span>
                  <strong className="text-ink-primary">{offer.access_type.replace('_', ' ')}</strong>
                </div>
                <div className="flex items-center justify-between text-ink-secondary">
                  <span>Transfers:</span>
                  <span className={offer.transfer_included ? 'text-status-success font-semibold' : 'text-ink-muted'}>
                    {offer.transfer_included ? 'Included (Hotel Pickup)' : 'Not Included'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-ink-secondary">
                  <span>Meals:</span>
                  <span className={offer.meal_included ? 'text-status-success font-semibold' : 'text-ink-muted'}>
                    {offer.meal_included ? 'Included' : 'None'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
              <span className="text-[11px] text-status-success font-semibold">
                {offer.cancellation_policy.replace('_', ' ')}
              </span>
              <span className="text-[10px] text-ink-muted font-mono">{offer.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
