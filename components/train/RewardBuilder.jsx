import React, { useState } from 'react';
import { Sparkles, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { Transition } from '@headlessui/react';

export default function RewardBuilder({ value, onChange, domain }) {
  const [loading, setLoading] = useState(false);

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
    </div>
  );
} 