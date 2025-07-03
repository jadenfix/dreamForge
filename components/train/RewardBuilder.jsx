import React, { useState } from 'react';
import { Sparkles, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { rewardFunctions } from '../../lib/rewardFunctions.js';

export default function RewardBuilder({ value, onChange, domain }) {
  const [loading, setLoading] = useState(false);
  const [tradeoffFilter, setTradeoffFilter] = useState('');
  const [useCaseFilter, setUseCaseFilter] = useState('');

  const tradeoffOptions = Array.from(new Set(rewardFunctions.flatMap((r) => r.tradeoffs)));
  const useCaseOptions = Array.from(new Set(rewardFunctions.flatMap((r) => r.useCases)));

  const filteredRewards = rewardFunctions.filter((r) => {
    const tradeoffMatch = tradeoffFilter ? r.tradeoffs.includes(tradeoffFilter) : true;
    const useCaseMatch = useCaseFilter ? r.useCases.includes(useCaseFilter) : true;
    return tradeoffMatch && useCaseMatch;
  });

  const handleSelectPreset = (code) => {
    onChange(code);
  };

  const autoSuggest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/anthropic/reward-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (res.ok) {
        onChange(data.spec || '');
      } else {
        throw new Error(data.error || 'Failed');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="font-semibold text-sm inline-flex items-center space-x-1">
        <span>Reward Function (JS)</span>
        <Info className="w-4 h-4 text-gray-400" title="Provide a JS function scoring (pred, gt). Claude can auto-suggest!" />
      </label>
      <textarea
        className="input-field h-40 font-mono"
        value={loading ? '// Generating reward function…' : value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        placeholder="module.exports = (pred, gt) => { return IoU(pred, gt); }"
      />
      <button
        type="button"
        className="btn-secondary inline-flex items-center space-x-2"
        onClick={autoSuggest}
        disabled={loading}
      >
        <Sparkles className="w-4 h-4" />
        <span>{loading ? 'Thinking...' : 'Auto-Suggest with Claude'}</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-medium text-xs text-gray-500 dark:text-gray-400">Trade-Off</label>
          <select
            className="input-field mt-1"
            value={tradeoffFilter}
            onChange={(e) => setTradeoffFilter(e.target.value)}
          >
            <option value="">All</option>
            {tradeoffOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-medium text-xs text-gray-500 dark:text-gray-400">Use Case</label>
          <select
            className="input-field mt-1"
            value={useCaseFilter}
            onChange={(e) => setUseCaseFilter(e.target.value)}
          >
            <option value="">All</option>
            {useCaseOptions.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preset list */}
      <div className="border rounded-lg p-4 max-h-56 overflow-y-auto space-y-3 bg-gray-50 dark:bg-gray-900/20">
        {filteredRewards.map((fn) => (
          <div
            key={fn.id}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            onClick={() => handleSelectPreset(fn.code)}
          >
            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{fn.name}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{fn.description}</p>
            <div className="flex flex-wrap gap-1">
              {fn.tradeoffs.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200"
                >
                  {t}
                </span>
              ))}
              {fn.useCases.map((u) => (
                <span
                  key={u}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-200"
                >
                  {u}
                </span>
              ))}
            </div>
          </div>
        ))}
        {filteredRewards.length === 0 && (
          <p className="text-xs text-gray-500 text-center">No presets match these filters.</p>
        )}
      </div>
    </div>
  );
} 