import React, { useState } from 'react';
import { rewardFunctions } from '../../lib/rewardFunctions.js';

export default function RewardPresetLibrary({ selectedId, onSelect }) {
  const [search, setSearch] = useState('');
  const [tradeoffFilter, setTradeoffFilter] = useState('');
  const [useCaseFilter, setUseCaseFilter] = useState('');

  const tradeoffOptions = Array.from(new Set(rewardFunctions.flatMap((r) => r.tradeoffs)));
  const useCaseOptions = Array.from(new Set(rewardFunctions.flatMap((r) => r.useCases)));

  const filtered = rewardFunctions.filter((fn) => {
    const matchesSearch = fn.name.toLowerCase().includes(search.toLowerCase()) || fn.description.toLowerCase().includes(search.toLowerCase());
    const tradeoffMatch = tradeoffFilter ? fn.tradeoffs.includes(tradeoffFilter) : true;
    const useCaseMatch = useCaseFilter ? fn.useCases.includes(useCaseFilter) : true;
    return matchesSearch && tradeoffMatch && useCaseMatch;
  });

  const Badge = ({ text, color }) => (
    <span
      className={`inline-block text-[10px] px-1.5 py-0.5 rounded ${color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200' : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-200'}`}
    >
      {text}
    </span>
  );

  return (
    <div className="space-y-4">
      {/* Search & filter */}
      <div className="flex flex-col md:flex-row md:items-end gap-3">
        <input
          type="text"
          className="input-field flex-1"
          placeholder="Search reward functions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input-field" value={tradeoffFilter} onChange={(e) => setTradeoffFilter(e.target.value)}>
          <option value="">All Trade-Offs</option>
          {tradeoffOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select className="input-field" value={useCaseFilter} onChange={(e) => setUseCaseFilter(e.target.value)}>
          <option value="">All Use Cases</option>
          {useCaseOptions.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((fn) => (
          <div
            key={fn.id}
            className={`border rounded-lg p-4 cursor-pointer hover:shadow-sm transition text-sm ${
              fn.id === selectedId ? 'ring-2 ring-indigo-500' : ''
            }`}
            onClick={() => onSelect(fn)}
          >
            <h4 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">{fn.name}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{fn.description}</p>
            <div className="flex flex-wrap gap-1">
              {fn.useCases.slice(0, 3).map((u) => (
                <Badge key={u} text={u} color="green" />
              ))}
              {fn.tradeoffs.slice(0, 3).map((t) => (
                <Badge key={t} text={t} color="indigo" />
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="col-span-full text-center text-xs text-gray-500">No presets match.</p>}
      </div>
    </div>
  );
} 