import React, { useState, useEffect } from 'react';
import { Package, Building2, Compass } from 'lucide-react';
import { api } from '../../services/api';
import { Hotel, SightseeingProduct } from '../../types';

export const AllInventoryPage: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [sightseeing, setSightseeing] = useState<SightseeingProduct[]>([]);
  const [activeTab, setActiveTab] = useState<'HOTELS' | 'SIGHTSEEING'>('HOTELS');

  useEffect(() => {
    const fetchAll = async () => {
      const [hRes, sRes] = await Promise.all([
        api.getHotels({ limit: 100 }),
        api.getSightseeing({ limit: 100 }),
      ]);
      setHotels(hRes);
      setSightseeing(sRes);
    };
    fetchAll();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-display font-bold text-ink-primary tracking-tight">
          Consolidated Global Inventory (800 Records)
        </h1>
        <p className="text-xs text-ink-secondary mt-1">
          Unified view of hotel and sightseeing inventory across all 5 supplier channels.
        </p>
      </div>

      <div className="flex items-center space-x-2 text-xs">
        <button
          onClick={() => setActiveTab('HOTELS')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors ${
            activeTab === 'HOTELS' ? 'bg-primary text-white shadow-soft' : 'bg-white border border-border text-ink-secondary'
          }`}
        >
          Hotels ({hotels.length})
        </button>
        <button
          onClick={() => setActiveTab('SIGHTSEEING')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors ${
            activeTab === 'SIGHTSEEING' ? 'bg-primary text-white shadow-soft' : 'bg-white border border-border text-ink-secondary'
          }`}
        >
          Sightseeing ({sightseeing.length})
        </button>
      </div>

      {activeTab === 'HOTELS' ? (
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-soft">
          <table className="w-full text-left text-xs">
            <thead className="bg-beige-50 border-b border-border text-ink-secondary font-semibold">
              <tr>
                <th className="py-3 px-4">Hotel Name</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-ink-primary">
              {hotels.slice(0, 30).map((h) => (
                <tr key={h.id}>
                  <td className="py-3 px-4 font-semibold">{h.name}</td>
                  <td className="py-3 px-4">{h.city}</td>
                  <td className="py-3 px-4">{h.supplier_name}</td>
                  <td className="py-3 px-4 font-bold">${h.base_price}</td>
                  <td className="py-3 px-4">{h.matching_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-soft">
          <table className="w-full text-left text-xs">
            <thead className="bg-beige-50 border-b border-border text-ink-secondary font-semibold">
              <tr>
                <th className="py-3 px-4">Experience Title</th>
                <th className="py-3 px-4">Attraction</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-ink-primary">
              {sightseeing.slice(0, 30).map((s) => (
                <tr key={s.id}>
                  <td className="py-3 px-4 font-semibold">{s.product_title}</td>
                  <td className="py-3 px-4">{s.attraction_name}</td>
                  <td className="py-3 px-4">{s.supplier_name}</td>
                  <td className="py-3 px-4 font-bold">${s.base_price}</td>
                  <td className="py-3 px-4">{s.activity_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
