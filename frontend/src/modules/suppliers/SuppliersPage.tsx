import React, { useState, useEffect } from 'react';
import {
  Users, UploadCloud, Plus, RefreshCw, FileText, CheckCircle2,
  AlertTriangle, Download, X, ExternalLink, ShieldAlert, Clock,
  Filter
} from 'lucide-react';
import { api } from '../../services/api';
import { Supplier } from '../../types';

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  // Upload Drawer / Modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadSupplierId, setUploadSupplierId] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'HOTEL' | 'SIGHTSEEING' | 'PERFORMANCE'>('HOTEL');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);

  // Add Supplier Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierCode, setNewSupplierCode] = useState('');
  const [newSupplierType, setNewSupplierType] = useState('REST_API');

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.getSuppliers();
      setSuppliers(res);
      if (res.length > 0 && !uploadSupplierId) {
        setUploadSupplierId(res[0].id);
      }
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploadSupplierId) return;

    try {
      setUploading(true);
      setUploadResult(null);
      const res = await api.uploadInventoryCSV(selectedFile, uploadSupplierId, uploadCategory);
      setUploadResult(res);
      await fetchSuppliers();
    } catch (err: any) {
      setUploadResult({
        status: 'FAILED',
        total_rows: 0,
        successful_records: 0,
        failed_records: 1,
        warning_count: 0,
        errors: [{ row: 1, error: err.message || 'CSV Ingestion error' }]
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName || !newSupplierCode) return;
    try {
      await api.createSupplier({
        name: newSupplierName,
        code: newSupplierCode.toUpperCase(),
        integration_type: newSupplierType as any,
        contact_email: `ops@${newSupplierCode.toLowerCase()}-connect.io`,
        reliability_score: 90.0,
      });
      setShowAddModal(false);
      setNewSupplierName('');
      setNewSupplierCode('');
      await fetchSuppliers();
    } catch (err) {
      console.error('Failed to add supplier:', err);
    }
  };

  const downloadErrorReport = () => {
    if (!uploadResult || !uploadResult.errors) return;
    const blob = new Blob([JSON.stringify(uploadResult.errors, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ingestion-report-${uploadResult.job_id || 'error'}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-ink-primary tracking-tight">
            Supplier Partner Management
          </h1>
          <p className="text-xs text-ink-secondary mt-1">
            Manage wholesale supplier integrations, configure feed ingestion, and monitor SLA performance scores.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-border text-xs font-semibold text-ink-primary hover:bg-beige-50 shadow-soft transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-primary" />
            <span>Add Supplier</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-soft transition-all flex items-center space-x-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Supplier CSV</span>
          </button>
        </div>
      </div>

      {/* Simulated Partners Alert Notice */}
      <div className="p-3.5 rounded-xl bg-beige-subtle border border-border flex items-center justify-between text-xs text-ink-secondary">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong>Simulated Supplier Connectors:</strong> 5 simulated wholesale bedbanks and DMCs are active for testing duplicate resolution without real partner API keys.
          </span>
        </div>
        <a
          href="/datasets/hotels/hotels_sample.csv"
          download
          className="text-primary font-semibold hover:underline flex items-center space-x-1 shrink-0 ml-4"
        >
          <Download className="w-3 h-3" />
          <span>Download Sample CSV</span>
        </a>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {suppliers.map((s) => (
          <div
            key={s.id}
            className="p-5 rounded-2xl bg-white border border-border hover:border-beige-400 shadow-soft transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-beige-100 text-primary border border-beige-300">
                    {s.code}
                  </span>
                  <h3 className="font-bold text-base text-ink-primary mt-2">{s.name}</h3>
                  <div className="text-[11px] text-ink-secondary mt-0.5">{s.contact_email}</div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  s.status === 'ACTIVE'
                    ? 'bg-status-success/10 text-status-success border border-status-success/20'
                    : 'bg-status-warning/10 text-status-warning'
                }`}>
                  {s.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border-subtle text-xs">
                <div>
                  <span className="text-[10px] text-ink-muted block">Integration Type</span>
                  <span className="font-semibold text-ink-primary">{s.integration_type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted block">Reliability Score</span>
                  <span className="font-semibold text-status-success">{s.reliability_score}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted block">Total Records</span>
                  <span className="font-semibold text-ink-primary">{s.total_records} items</span>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted block">Last Sync</span>
                  <span className="font-medium text-ink-secondary text-[11px]">Recent (Automated)</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border-subtle flex items-center justify-between">
              <button
                onClick={() => {
                  setUploadSupplierId(s.id);
                  setShowUploadModal(true);
                }}
                className="text-xs text-primary font-semibold hover:underline flex items-center space-x-1"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload CSV</span>
              </button>

              <button
                onClick={() => setSelectedSupplier(s)}
                className="text-xs text-ink-secondary hover:text-ink-primary font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CSV Upload Drawer / Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-border rounded-2xl max-w-lg w-full p-6 shadow-dropdown relative">
            <button
              onClick={() => { setShowUploadModal(false); setUploadResult(null); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-border hover:bg-beige-50 text-ink-secondary"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-beige-200 border border-beige-300 flex items-center justify-center text-primary">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-ink-primary">Upload Supplier Inventory CSV</h3>
                <p className="text-[11px] text-ink-secondary">Validates columns, coordinates, and prices before ingestion</p>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-ink-primary block mb-1">Target Supplier</label>
                <select
                  value={uploadSupplierId}
                  onChange={(e) => setUploadSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-beige-50 border border-border rounded-lg text-ink-primary focus:outline-none focus:border-primary"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-ink-primary block mb-1">Inventory Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadCategory('HOTEL')}
                    className={`py-2 rounded-lg border text-xs font-semibold ${
                      uploadCategory === 'HOTEL'
                        ? 'bg-beige-100 border-primary text-primary'
                        : 'border-border text-ink-secondary hover:bg-beige-50'
                    }`}
                  >
                    Hotel Inventory
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadCategory('SIGHTSEEING')}
                    className={`py-2 rounded-lg border text-xs font-semibold ${
                      uploadCategory === 'SIGHTSEEING'
                        ? 'bg-beige-100 border-primary text-primary'
                        : 'border-border text-ink-secondary hover:bg-beige-50'
                    }`}
                  >
                    Sightseeing / Experiences
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-ink-primary block mb-1">CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-ink-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-border file:text-xs file:font-semibold file:bg-beige-100 file:text-primary hover:file:bg-beige-200 cursor-pointer"
                />
              </div>

              {/* Upload Result Feedback */}
              {uploadResult && (
                <div className={`p-4 rounded-xl border ${
                  uploadResult.status === 'COMPLETED'
                    ? 'bg-status-success/10 border-status-success/30 text-status-success'
                    : 'bg-status-warning/10 border-status-warning/30 text-status-warning'
                }`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>Ingestion Result: {uploadResult.status}</span>
                    {uploadResult.errors && uploadResult.errors.length > 0 && (
                      <button
                        type="button"
                        onClick={downloadErrorReport}
                        className="text-[11px] underline flex items-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download Error Log</span>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-[11px] text-ink-primary">
                    <div>Total: <strong>{uploadResult.total_rows}</strong></div>
                    <div>Success: <strong>{uploadResult.successful_records}</strong></div>
                    <div>Failed: <strong>{uploadResult.failed_records}</strong></div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-ink-secondary hover:bg-beige-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover disabled:opacity-50 flex items-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Ingesting & Validating...</span>
                    </>
                  ) : (
                    <span>Process & Ingest CSV</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-border rounded-2xl max-w-md w-full p-6 shadow-dropdown relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-border hover:bg-beige-50 text-ink-secondary"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-sm text-ink-primary mb-1">Add Wholesale Supplier</h3>
            <p className="text-[11px] text-ink-secondary mb-4">Register a new partner API or batch SFTP feed</p>

            <form onSubmit={handleAddSupplier} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-ink-primary block mb-1">Supplier Name</label>
                <input
                  type="text"
                  placeholder="e.g. PacificVenture Holidays"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  className="w-full px-3 py-2 bg-beige-50 border border-border rounded-lg text-ink-primary focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-ink-primary block mb-1">Supplier Code (3-4 Letters)</label>
                <input
                  type="text"
                  placeholder="e.g. PVH"
                  value={newSupplierCode}
                  onChange={(e) => setNewSupplierCode(e.target.value)}
                  className="w-full px-3 py-2 bg-beige-50 border border-border rounded-lg text-ink-primary focus:outline-none focus:border-primary uppercase"
                  maxLength={5}
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-ink-primary block mb-1">Integration Format</label>
                <select
                  value={newSupplierType}
                  onChange={(e) => setNewSupplierType(e.target.value)}
                  className="w-full px-3 py-2 bg-beige-50 border border-border rounded-lg text-ink-primary focus:outline-none focus:border-primary"
                >
                  <option value="REST_API">REST API (JSON)</option>
                  <option value="SFTP_CSV">SFTP Batch CSV</option>
                  <option value="GRAPHQL">GraphQL Gateway</option>
                  <option value="MANUAL_UPLOAD">Manual Upload</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-ink-secondary hover:bg-beige-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover shadow-soft"
                >
                  Register Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
