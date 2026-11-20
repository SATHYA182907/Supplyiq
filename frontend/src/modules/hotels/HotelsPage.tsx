import React, { useState, useEffect } from 'react';
import {
  Building2, Search, Filter, Star, MapPin, Tag, CheckCircle2,
  AlertTriangle, X, ExternalLink, ShieldCheck, BedDouble, ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { Hotel, Supplier } from '../../types';

export const HotelsPage: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedStar, setSelectedStar] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const [hotelsRes, suppRes] = await Promise.all([
        api.getHotels({
          search,
          city: selectedCity,
          supplier_id: selectedSupplier,
          star_rating: selectedStar ? parseFloat(selectedStar) : undefined,
          matching_status: selectedStatus || undefined,
          limit: 100,
        }),
        api.getSuppliers(),
      ]);
      setHotels(hotelsRes);
      setSuppliers(suppRes);
    } catch (err) {
      console.error('Failed to load hotels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [selectedCity, selectedSupplier, selectedStar, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHotels();
  };

  const cities = ['Dubai', 'Singapore', 'London', 'Paris', 'New York', 'Tokyo', 'Rome', 'Bangkok', 'Barcelona', 'Sydney', 'Amsterdam', 'Istanbul'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-ink-primary tracking-tight">
            Hotel Inventory Management
          </h1>
          <p className="text-xs text-ink-secondary mt-1">
            Normalized property catalog consolidated across all wholesale supplier feeds with room taxonomy links.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-beige-100 text-primary border border-beige-300">
          Showing {hotels.length} of 500 Properties
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-border shadow-soft space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by hotel name or location..."
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
              value={selectedStar}
              onChange={(e) => setSelectedStar(e.target.value)}
              className="px-3 py-2 text-xs bg-beige-50 border border-border rounded-lg text-ink-primary focus:outline-none focus:border-primary"
            >
              <option value="">All Stars</option>
              <option value="5.0">5 Stars (Luxury)</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-beige-50 border border-border rounded-lg text-ink-primary focus:outline-none focus:border-primary"
            >
              <option value="">All Match Statuses</option>
              <option value="CONFIRMED_MATCH">Confirmed Match</option>
              <option value="POTENTIAL_MATCH">Potential Match</option>
              <option value="UNMATCHED">Unmatched</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover shadow-soft"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Hotel Table */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-beige-50 border-b border-border text-ink-secondary font-semibold">
              <tr>
                <th className="py-3 px-4">Hotel Name & Destination</th>
                <th className="py-3 px-4">Supplier Partner</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Base Rate</th>
                <th className="py-3 px-4">Matching Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-ink-primary">
              {hotels.map((h) => (
                <tr key={h.id} className="hover:bg-beige-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-ink-primary">{h.name}</div>
                    <div className="text-[11px] text-ink-secondary flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-ink-muted" />
                      <span>{h.city}, {h.country}</span>
                      {h.latitude && (
                        <span className="text-[10px] text-ink-muted ml-1">
                          ({h.latitude.toFixed(3)}, {h.longitude?.toFixed(3)})
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-medium text-ink-primary">{h.supplier_name}</span>
                    <span className="block text-[10px] text-ink-muted font-mono">{h.supplier_hotel_id}</span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1 text-primary">
                      <Star className="w-3.5 h-3.5 fill-primary" />
                      <span className="font-semibold text-ink-primary">{h.star_rating}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-ink-primary">${h.base_price.toFixed(2)}</div>
                    <div className="text-[10px] text-status-success font-medium">Available</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center space-x-1 ${
                      h.matching_status === 'CONFIRMED_MATCH'
                        ? 'bg-status-success/10 text-status-success border border-status-success/20'
                        : h.matching_status === 'POTENTIAL_MATCH'
                        ? 'bg-status-warning/10 text-status-warning border border-status-warning/20'
                        : 'bg-beige-100 text-ink-secondary border border-border'
                    }`}>
                      {h.matching_status === 'CONFIRMED_MATCH' && <CheckCircle2 className="w-2.5 h-2.5 mr-1" />}
                      <span>{h.matching_status.replace('_', ' ')}</span>
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedHotel(h)}
                      className="px-3 py-1 rounded-lg border border-border hover:bg-beige-100 font-medium text-primary text-[11px] transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hotel Detail Modal */}
      {selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-dropdown relative">
            <button
              onClick={() => setSelectedHotel(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-border hover:bg-beige-50 text-ink-secondary"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-beige-200 border border-beige-300 flex items-center justify-center text-primary shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-ink-primary">{selectedHotel.name}</h3>
                <p className="text-xs text-ink-secondary flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>{selectedHotel.address}, {selectedHotel.city}, {selectedHotel.country}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-beige-50 border border-border text-xs mb-4">
              <div>
                <span className="text-[10px] text-ink-muted block">Supplier</span>
                <span className="font-semibold text-ink-primary">{selectedHotel.supplier_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted block">Star Rating</span>
                <span className="font-semibold text-primary">{selectedHotel.star_rating} Stars</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted block">Base Price</span>
                <span className="font-bold text-ink-primary">${selectedHotel.base_price} USD</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-muted block">Quality Score</span>
                <span className="font-semibold text-status-success">{selectedHotel.quality_score}%</span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-ink-primary mb-1">Property Description</h4>
                <p className="text-ink-secondary leading-relaxed bg-white p-3 rounded-lg border border-border">
                  {selectedHotel.description || 'Luxury hotel offering curated rooms, concierge services, and central location.'}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-ink-primary mb-1">Geographic Coordinates</h4>
                <div className="p-2.5 rounded-lg bg-beige-50 border border-border flex items-center justify-between text-ink-secondary">
                  <span>Latitude: <strong>{selectedHotel.latitude || 'Not provided'}</strong></span>
                  <span>Longitude: <strong>{selectedHotel.longitude || 'Not provided'}</strong></span>
                  <span className="text-[10px] text-primary font-medium">Haversine Verified</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-ink-primary mb-1">Bookable Room Configurations ({selectedHotel.rooms.length})</h4>
                <div className="space-y-2">
                  {selectedHotel.rooms.map((room, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-border bg-white flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-ink-primary">{room.room_name}</div>
                        <div className="text-[11px] text-ink-secondary flex items-center space-x-2 mt-0.5">
                          <span>Bed: <strong>{room.bed_type}</strong></span>
                          <span>•</span>
                          <span>Max Occupancy: <strong>{room.max_occupancy} guests</strong></span>
                          <span>•</span>
                          <span>Standard: <strong>{room.standard_type}</strong></span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-ink-primary">${room.price}</div>
                        <span className="text-[10px] text-status-success">{room.cancellation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-border flex items-center justify-end">
              <button
                onClick={() => setSelectedHotel(null)}
                className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover shadow-soft text-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
