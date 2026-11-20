import React, { useState, useEffect } from 'react';
import {
  Compass, Search, Filter, Clock, MapPin, CheckCircle2,
  Car, Utensils, Zap, Shield, Tag
} from 'lucide-react';
import { api } from '../../services/api';
import { SightseeingProduct, Supplier } from '../../types';

export const SightseeingPage: React.FC = () => {
  const [products, setProducts] = useState<SightseeingProduct[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const fetchSightseeing = async () => {
    try {
      setLoading(true);
      const [res, suppRes] = await Promise.all([
        api.getSightseeing({
          search,
          destination_city: selectedCity,
          supplier_id: selectedSupplier,
          activity_type: selectedType || undefined,
          limit: 100,
        }),
        api.getSuppliers(),
      ]);
      setProducts(res);
      setSuppliers(suppRes);
    } catch (err) {
      console.error('Failed to fetch sightseeing:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSightseeing();
  }, [selectedCity, selectedSupplier, selectedType]);

  const cities = ['Dubai', 'Singapore', 'London', 'Paris', 'New York', 'Tokyo', 'Rome', 'Barcelona', 'Sydney', 'Amsterdam'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-ink-primary tracking-tight">
            Sightseeing & Experiences Catalog
          </h1>
          <p className="text-xs text-ink-secondary mt-1">
            Attraction tickets, guided tours, transfer bundles, and VIP experiences across 5 global suppliers.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-beige-100 text-primary border border-beige-300">
          Showing {products.length} of 300 Products
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-border shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by attraction name or experience title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-beige-50 border border-border rounded-lg text-ink-primary focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-2 text-xs bg-beige-50 border border-border rounded-lg text-ink-primary focus:outline-none focus:border-primary"
            >
              <option value="">All Destinations</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="px-3 py-2 text-xs bg-beige-50 border border-border rounded-lg text-ink-primary focus:outline-none focus:border-primary"
            >
              <option value="">All Suppliers</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs bg-beige-50 border border-border rounded-lg text-ink-primary focus:outline-none focus:border-primary"
            >
              <option value="">All Experience Types</option>
              <option value="TICKET_ONLY">Direct Ticket Only</option>
              <option value="GUIDED_TOUR">Guided Tour</option>
              <option value="TRANSFER_COMBO">Transfer Combo</option>
              <option value="VIP_ACCESS">VIP Access</option>
            </select>

            <button
              onClick={fetchSightseeing}
              className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover shadow-soft"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Sightseeing Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-2xl bg-white border border-border hover:border-beige-400 shadow-soft transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-beige-100 text-primary border border-beige-300">
                  {p.attraction_name}
                </span>
                <span className="text-xs font-bold text-ink-primary">${p.base_price.toFixed(2)}</span>
              </div>

              <h3 className="font-bold text-sm text-ink-primary mt-2 leading-snug">{p.product_title}</h3>
              <p className="text-[11px] text-ink-secondary mt-1 line-clamp-2">{p.description}</p>

              {/* Inclusions & Highlights */}
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border-subtle text-[10px]">
                <span className="px-2 py-0.5 rounded-md bg-beige-50 text-ink-secondary flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-primary" />
                  <span>{p.duration_hours} hrs</span>
                </span>

                {p.transfer_included && (
                  <span className="px-2 py-0.5 rounded-md bg-status-info/10 text-status-info flex items-center space-x-1 font-medium">
                    <Car className="w-3 h-3" />
                    <span>Transfers Incl.</span>
                  </span>
                )}

                {p.meal_included && (
                  <span className="px-2 py-0.5 rounded-md bg-status-success/10 text-status-success flex items-center space-x-1 font-medium">
                    <Utensils className="w-3 h-3" />
                    <span>Meal/Dinner</span>
                  </span>
                )}

                {p.access_type === 'SKIP_THE_LINE' && (
                  <span className="px-2 py-0.5 rounded-md bg-status-warning/10 text-status-warning flex items-center space-x-1 font-medium">
                    <Zap className="w-3 h-3" />
                    <span>Fast Track</span>
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
              <span className="text-[11px] text-ink-secondary">
                Supplier: <strong>{p.supplier_name}</strong>
              </span>
              <span className="text-[10px] text-status-success font-medium">
                {p.cancellation_policy.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
