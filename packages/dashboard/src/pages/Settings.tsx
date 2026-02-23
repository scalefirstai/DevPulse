import { useState, useEffect } from 'react';
import client from '../api/client';
import { kpiLabel } from '../utils/formatters';

interface Threshold {
  kpiType: string;
  eliteMax: number;
  strongMax: number;
  moderateMax: number;
}

export default function Settings() {
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    client.get('/config/thresholds').then(({ data }) => {
      setThresholds(data.filter((t: Threshold & { teamId: string | null }) => t.teamId === null));
    }).catch(() => {});
  }, []);

  const updateValue = (kpiType: string, field: keyof Threshold, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setThresholds((prev) =>
      prev.map((t) => (t.kpiType === kpiType ? { ...t, [field]: num } : t)),
    );
  };

  const validate = (): string | null => {
    for (const t of thresholds) {
      if (t.eliteMax >= t.strongMax) return `${kpiLabel(t.kpiType)}: elite must be < strong`;
      if (t.strongMax >= t.moderateMax) return `${kpiLabel(t.kpiType)}: strong must be < moderate`;
    }
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      setMessage({ type: 'error', text: err });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const body: Record<string, { elite_max: number; strong_max: number; moderate_max: number }> = {};
      for (const t of thresholds) {
        body[t.kpiType] = { elite_max: t.eliteMax, strong_max: t.strongMax, moderate_max: t.moderateMax };
      }
      await client.put('/config/thresholds', body);
      setMessage({ type: 'success', text: 'Thresholds saved successfully' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save thresholds' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold mb-4">KPI Thresholds</h2>
        <p className="text-sm text-gray-400 mb-6">
          Configure health tier boundaries. Values below elite_max are Elite, below strong_max are Strong, etc.
        </p>

        <div className="space-y-4">
          {thresholds.map((t) => (
            <div key={t.kpiType} className="grid grid-cols-4 gap-4 items-center">
              <label className="text-sm font-medium text-gray-300">{kpiLabel(t.kpiType)}</label>
              <div>
                <label className="text-xs text-gray-500">Elite max</label>
                <input
                  type="number"
                  step="0.1"
                  value={t.eliteMax}
                  onChange={(e) => updateValue(t.kpiType, 'eliteMax', e.target.value)}
                  className="w-full mt-1 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Strong max</label>
                <input
                  type="number"
                  step="0.1"
                  value={t.strongMax}
                  onChange={(e) => updateValue(t.kpiType, 'strongMax', e.target.value)}
                  className="w-full mt-1 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Moderate max</label>
                <input
                  type="number"
                  step="0.1"
                  value={t.moderateMax}
                  onChange={(e) => updateValue(t.kpiType, 'moderateMax', e.target.value)}
                  className="w-full mt-1 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200"
                />
              </div>
            </div>
          ))}
        </div>

        {message && (
          <div className={`mt-4 rounded-lg px-4 py-2 text-sm ${
            message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Thresholds'}
        </button>
      </div>
    </div>
  );
}
