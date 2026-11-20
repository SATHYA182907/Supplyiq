import React, { useState, useEffect } from 'react';
import {
  BedDouble, Search, Filter, CheckCircle2, AlertTriangle,
  Edit2, X, Check, ShieldAlert, Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { RoomMapping } from '../../types';

export const RoomMappingPage: React.FC = () => {
  const [mappings, setMappings] = useState<RoomMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterVerified, setFilterVerified] = useState<string>('');
  const [selectedMapping, setSelectedMapping] = useState<RoomMapping | null>(null);
  const [editStandardType, setEditStandardType] = useState('');

  const standardTypes = [
    'Standard Double', 'Standard Twin', 'Superior King', 'Deluxe King',
    'Deluxe Twin', 'Deluxe Double Queen', 'Executive Suite', 'Family Suite', 'Presidential Suite'
  ];

  const fetchMappings = async () => {
    try {
      setLoading(true);
      const isVer = filterVerified === 'true' ? true : filterVerified === 'false' ? false : undefined;
      const res = await api.getRoomMappings(isVer);
      setMappings(res);
    } catch (err) {
      console.error('Failed to load room mappings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, [filterVerified]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMapping || !editStandardType) return;
    try {
      await api.updateRoomMapping(selectedMapping.id, editStandardType);
      setSelectedMapping(null);
      await fetchMappings();
    } catch (err) {
      console.error('Update room mapping error:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-beige-100 text-primary border border-beige-300 text-xs font-semibold mb-2">
            <BedDouble className="w-3.5 h-3.5 text-primary" />
            <span>Room Taxonomy & Bed Configuration Engine</span>
          </div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-ink-primary tracking-tight">
            Intelligent Room-Type Mapping
          </h1>
          <p className="text-xs text-ink-secondary mt-1">
            Normalizes disparate supplier room strings into canonical hotel room categories while preventing bed configuration mismatches.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-beige-100 text-primary border border-beige-300">
          Showing {mappings.length} Room Categories
        </div>
      </div>

      {/* Safety Guardrail Notice */}
      <div className="p-3.5 rounded-xl bg-beige-subtle border border-border flex items-center space-x-3 text-xs text-ink-secondary">
        <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
        <span>
          <strong>Bed Configuration Guardrail Active:</strong> Twin and King bed configurations are never automatically mapped as equivalent. Occupancy mismatches require human verification.
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="p-4 rounded-xl bg-white border border-border shadow-soft flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-ink-muted">Verification Status:</span>
          <button
            onClick={() => setFilterVerified('')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterVerified === '' ? 'bg-beige-100 text-primary border border-beige-300' : 'text-ink-secondary hover:bg-beige-50'
            }`}
          >
            All Mappings
          </button>
          <button
            onClick={() => setFilterVerified('false')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterVerified === 'false' ? 'bg-beige-100 text-primary border border-beige-300' : 'text-ink-secondary hover:bg-beige-50'
            }`}
          >
            Unverified / Conflicts
          </button>
          <button
            onClick={() => setFilterVerified('true')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterVerified === 'true' ? 'bg-beige-100 text-primary border border-beige-300' : 'text-ink-secondary hover:bg-beige-50'
            }`}
          >
            Verified Standard
          </button>
        </div>
      </div>

      {/* Mappings Table */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-beige-50 border-b border-border text-ink-secondary font-semibold">
              <tr>
                <th className="py-3 px-4">Hotel Property</th>
                <th className="py-3 px-4">Supplier Room String</th>
                <th className="py-3 px-4">Mapped Standard Type</th>
                <th className="py-3 px-4">Bed & Occupancy</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Status & Conflicts</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-ink-primary">
              {mappings.map((m) => (
                <tr key={m.id} className="hover:bg-beige-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-ink-primary">{m.hotel_name}</span>
                    <span className="block text-[10px] text-ink-muted">{m.supplier_name}</span>
                  </td>

                  <td className="py-3 px-4 font-medium text-ink-primary">
                    {m.supplier_room_name}
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-beige-100 text-primary font-bold text-[11px] border border-beige-300">
                      {m.mapped_standard_type}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-ink-primary font-semibold">{m.bed_configuration}</div>
                    <div className="text-[10px] text-ink-muted">{m.max_occupancy} Guests Max</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`font-bold ${
                      m.confidence_score >= 90 ? 'text-status-success' : 'text-status-warning'
                    }`}>
                      {m.confidence_score.toFixed(0)}%
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    {m.conflicting_attributes && m.conflicting_attributes.length > 0 ? (
                      <span className="inline-flex items-center space-x-1 text-status-warning text-[10px] font-semibold bg-status-warning/10 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Bed/Pax Discrepancy</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-status-success text-[10px] font-semibold bg-status-success/10 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Taxonomy Aligned</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedMapping(m);
                        setEditStandardType(m.mapped_standard_type);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-border hover:bg-beige-100 text-primary text-[11px] font-semibold flex items-center space-x-1 ml-auto"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Mapping Modal */}
      {selectedMapping && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-border rounded-2xl max-w-md w-full p-6 shadow-dropdown relative">
            <button
              onClick={() => setSelectedMapping(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-border hover:bg-beige-50 text-ink-secondary"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-sm text-ink-primary mb-1">Modify Standard Room Taxonomy</h3>
            <p className="text-[11px] text-ink-secondary mb-4">
              Override automated room normalization for property: <strong>{selectedMapping.hotel_name}</strong>
            </p>

            <div className="p-3 rounded-xl bg-beige-50 border border-border text-xs mb-4">
              <span className="text-[10px] text-ink-muted block">Supplier's Raw Label:</span>
              <span className="font-bold text-ink-primary">{selectedMapping.supplier_room_name}</span>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-ink-primary block mb-1">Standardized Room Category</label>
                <select
                  value={editStandardType}
                  onChange={(e) => setEditStandardType(e.target.value)}
                  className="w-full px-3 py-2 bg-beige-50 border border-border rounded-lg text-ink-primary focus:outline-none focus:border-primary"
                >
                  {standardTypes.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMapping(null)}
                  className="px-4 py-2 rounded-xl border border-border text-ink-secondary hover:bg-beige-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover shadow-soft"
                >
                  Confirm Mapping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
