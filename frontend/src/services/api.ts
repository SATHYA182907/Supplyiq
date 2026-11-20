import {
  Supplier, Hotel, SightseeingProduct, DuplicateMatch, RoomMapping,
  IngestionJob, DashboardSummary, SupplierPerformance, AIInsight, RankedOffer
} from '../types';

const API_BASE = '/api';

export const api = {
  // Suppliers
  getSuppliers: async (): Promise<Supplier[]> => {
    const res = await fetch(`${API_BASE}/suppliers`);
    if (!res.ok) throw new Error('Failed to fetch suppliers');
    return res.json();
  },

  createSupplier: async (data: Partial<Supplier>): Promise<Supplier> => {
    const res = await fetch(`${API_BASE}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create supplier');
    return res.json();
  },

  deleteSupplier: async (id: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/suppliers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete supplier');
    return res.json();
  },

  // Ingestion
  uploadInventoryCSV: async (file: File, supplierId: string, category: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('supplier_id', supplierId);
    formData.append('category', category);

    const res = await fetch(`${API_BASE}/ingestion/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to upload CSV');
    }
    return res.json();
  },

  getIngestionJobs: async (): Promise<IngestionJob[]> => {
    const res = await fetch(`${API_BASE}/ingestion/jobs`);
    if (!res.ok) throw new Error('Failed to fetch ingestion jobs');
    return res.json();
  },

  // Hotels
  getHotels: async (params?: Record<string, any>): Promise<Hotel[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          searchParams.append(k, String(v));
        }
      });
    }
    const res = await fetch(`${API_BASE}/hotels?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch hotels');
    return res.json();
  },

  getHotelDetails: async (id: string): Promise<Hotel> => {
    const res = await fetch(`${API_BASE}/hotels/${id}`);
    if (!res.ok) throw new Error('Failed to fetch hotel details');
    return res.json();
  },

  getHotelOffers: async (id: string): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/hotels/${id}/offers`);
    if (!res.ok) throw new Error('Failed to fetch hotel offers');
    return res.json();
  },

  // Sightseeing
  getSightseeing: async (params?: Record<string, any>): Promise<SightseeingProduct[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          searchParams.append(k, String(v));
        }
      });
    }
    const res = await fetch(`${API_BASE}/sightseeing?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch sightseeing');
    return res.json();
  },

  // Matching
  triggerHotelMatching: async (city?: string): Promise<any> => {
    const url = city ? `${API_BASE}/matching/hotels?city=${encodeURIComponent(city)}` : `${API_BASE}/matching/hotels`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to run hotel matching');
    return res.json();
  },

  triggerSightseeingMatching: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/matching/sightseeing`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to run sightseeing matching');
    return res.json();
  },

  getMatches: async (params?: { product_type?: string; status?: string; classification?: string }): Promise<DuplicateMatch[]> => {
    const searchParams = new URLSearchParams();
    if (params?.product_type) searchParams.append('product_type', params.product_type);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.classification) searchParams.append('classification', params.classification);

    const res = await fetch(`${API_BASE}/matching/results?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch matches');
    return res.json();
  },

  reviewMatch: async (matchId: string, action: string, reviewer = 'Senior Analyst', reason = ''): Promise<any> => {
    const res = await fetch(`${API_BASE}/matching/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        match_id: matchId,
        action,
        reviewer,
        decision_reason: reason,
      }),
    });
    if (!res.ok) throw new Error('Failed to review match');
    return res.json();
  },

  getRoomMappings: async (isVerified?: boolean): Promise<RoomMapping[]> => {
    const url = isVerified !== undefined ? `${API_BASE}/matching/room-mappings?is_verified=${isVerified}` : `${API_BASE}/matching/room-mappings`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch room mappings');
    return res.json();
  },

  updateRoomMapping: async (mappingId: string, mappedStandardType: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/matching/room-mappings/${mappingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mapped_standard_type: mappedStandardType }),
    });
    if (!res.ok) throw new Error('Failed to update room mapping');
    return res.json();
  },

  getGroundTruthBenchmark: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/matching/ground-truth-benchmark`);
    if (!res.ok) throw new Error('Failed to evaluate ground truth benchmark');
    return res.json();
  },

  // Comparison
  getCanonicalGroups: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/comparison/canonical-groups`);
    if (!res.ok) throw new Error('Failed to fetch canonical comparison groups');
    return res.json();
  },

  compareHotelOffers: async (canonicalId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/comparison/hotels/${canonicalId}`);
    if (!res.ok) throw new Error('Failed to fetch hotel comparison');
    return res.json();
  },

  compareSightseeingOffers: async (canonicalId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/comparison/sightseeing/${canonicalId}`);
    if (!res.ok) throw new Error('Failed to fetch sightseeing comparison');
    return res.json();
  },

  // Ranking
  executeRanking: async (payload: any): Promise<{
    destination: string;
    total_eligible_offers: number;
    applied_weights: Record<string, number>;
    ranked_offers: RankedOffer[];
    ai_summary_explanation: string;
  }> => {
    const res = await fetch(`${API_BASE}/ranking/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to execute smart ranking');
    return res.json();
  },

  // Analytics
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const res = await fetch(`${API_BASE}/analytics/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    return res.json();
  },

  getSupplierPerformance: async (): Promise<SupplierPerformance[]> => {
    const res = await fetch(`${API_BASE}/analytics/suppliers`);
    if (!res.ok) throw new Error('Failed to fetch supplier performance');
    return res.json();
  },

  getSupplierDistribution: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/analytics/supplier-distribution`);
    if (!res.ok) throw new Error('Failed to fetch supplier distribution');
    return res.json();
  },

  getAIInsights: async (): Promise<AIInsight[]> => {
    const res = await fetch(`${API_BASE}/analytics/insights`);
    if (!res.ok) throw new Error('Failed to fetch AI insights');
    return res.json();
  },

  getInventoryQuality: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/analytics/inventory-quality`);
    if (!res.ok) throw new Error('Failed to fetch inventory quality');
    return res.json();
  },

  // Settings & Demo Reset
  getSettings: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  resetDemoData: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/settings/reset-demo`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo data');
    return res.json();
  },
};
