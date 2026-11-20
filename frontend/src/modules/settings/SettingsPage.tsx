import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, CheckCircle2, Database, ShieldCheck, Play } from 'lucide-react';
import { api } from '../../services/api';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any | null>(null);
  const [benchmarkResult, setBenchmarkResult] = useState<any | null>(null);
  const [runningBenchmark, setRunningBenchmark] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getSettings();
        setSettings(res);
      } catch (err) {
        console.error('Settings load error:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleRunBenchmark = async () => {
    try {
      setRunningBenchmark(true);
      const res = await api.getGroundTruthBenchmark();
      setBenchmarkResult(res);
    } catch (err) {
      console.error('Benchmark failed:', err);
    } finally {
      setRunningBenchmark(false);
    }
  };

  const handleResetDemo = async () => {
    try {
      setResetting(true);
      await api.resetDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 4000);
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-display font-bold text-ink-primary tracking-tight">
          System Configuration & AI Benchmarks
        </h1>
        <p className="text-xs text-ink-secondary mt-1">
          Inspect matching thresholds, evaluate ground-truth precision & recall benchmarks, and manage demo datasets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ground Truth Precision / Recall Benchmark */}
        <div className="p-5 rounded-2xl bg-white border border-border shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-ink-primary">Ground-Truth Benchmark Runner</h3>
              <p className="text-xs text-ink-secondary">Evaluates engine precision and recall against verified ground-truth dataset</p>
            </div>
            <button
              onClick={handleRunBenchmark}
              disabled={runningBenchmark}
              className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover flex items-center space-x-1.5 shadow-soft"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{runningBenchmark ? 'Evaluating...' : 'Run Benchmark'}</span>
            </button>
          </div>

          {benchmarkResult && (
            <div className="p-4 rounded-xl bg-beige-50 border border-border text-xs space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>Precision: <strong className="text-primary text-sm block">{benchmarkResult.precision}%</strong></div>
                <div>Recall: <strong className="text-primary text-sm block">{benchmarkResult.recall}%</strong></div>
                <div>F1 Score: <strong className="text-status-success text-sm block">{benchmarkResult.f1_score}%</strong></div>
              </div>
              <div className="pt-2 text-[11px] text-ink-secondary border-t border-border-subtle">
                True Positives: {benchmarkResult.true_positives} • False Positives: {benchmarkResult.false_positives} • False Negatives: {benchmarkResult.false_negatives}
              </div>
            </div>
          )}
        </div>

        {/* Demo Mode & Reset Data */}
        <div className="p-5 rounded-2xl bg-white border border-border shadow-soft space-y-4">
          <div>
            <h3 className="font-bold text-sm text-ink-primary">Reset Demo Sandbox Data</h3>
            <p className="text-xs text-ink-secondary">Restores all 800 synthetic supplier records, room mappings, and catalog matches to pristine state</p>
          </div>

          {resetSuccess && (
            <div className="p-3 rounded-lg bg-status-success/10 border border-status-success/30 text-status-success text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Demo data successfully reset!</span>
            </div>
          )}

          <button
            onClick={handleResetDemo}
            disabled={resetting}
            className="px-4 py-2 rounded-xl bg-white border border-border text-xs font-semibold text-ink-primary hover:bg-beige-50 shadow-soft flex items-center space-x-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting Tables...' : 'Reset Demo Dataset'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
