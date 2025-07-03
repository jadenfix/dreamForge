import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function GoalDefinition({ value, onChange, datasetDesc, rewardName }) {
  const [goal, setGoal] = useState('');
  const [constraints, setConstraints] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!goal.trim()) {
      toast.error('Please enter a goal');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/curriculum/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datasetDesc, rewardName, goal, constraints }),
      });
      const data = await res.json();
      if (res.ok) {
        onChange(data.curriculum);
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
    <div className="space-y-4">
      <div>
        <label className="font-medium text-sm">Goal</label>
        <input
          type="text"
          className="input-field w-full"
          placeholder="Detect small products even in blurry images"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
      </div>
      <div>
        <label className="font-medium text-sm">Constraints / Compute Budget</label>
        <input
          type="text"
          className="input-field w-full"
          placeholder="<50ms, <200MB RAM"
          value={constraints}
          onChange={(e) => setConstraints(e.target.value)}
        />
      </div>
      <button className="btn-secondary" onClick={generate} disabled={loading}>
        {loading ? 'Generating…' : 'Generate Curriculum'}
      </button>

      {value && (
        <pre className="whitespace-pre-wrap bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto max-h-60">
          {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  );
} 