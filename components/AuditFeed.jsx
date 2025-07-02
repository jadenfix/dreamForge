import React, { useState, useEffect } from 'react';
import { Clock, RotateCcw, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuditFeed({ onRerun }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/usage?limit=20');
      const data = await response.json();
      
      if (data.success) {
        setHistory(data.recentHistory || []);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleRerun = async (record) => {
    if (onRerun) {
      // Generate a base64 placeholder for demo
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Re-run Demo', canvas.width/2, canvas.height/2);
      
      const imageData = canvas.toDataURL().split(',')[1];
      
      onRerun({
        prompt: record.prompt,
        image: imageData,
        useAnthropicPlanner: true
      });
      
      toast.success('Re-running analysis...');
    }
  };

  const getSkillColor = (skill) => {
    const colors = {
      detect: 'bg-blue-500',
      point: 'bg-green-500', 
      query: 'bg-purple-500',
      caption: 'bg-orange-500'
    };
    return colors[skill] || 'bg-gray-500';
  };

  const filteredHistory = history.filter(record => {
    const matchesSearch = record.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkill = skillFilter === 'all' || record.skill === skillFilter;
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="glass-card">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100">Recent Activity</h3>
          <button
            onClick={fetchHistory}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-white/10"
            title="Refresh history"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        
        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gradient-start"
            />
          </div>
          
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-gradient-start"
          >
            <option value="all">All Skills</option>
            <option value="detect">Detect</option>
            <option value="point">Point</option>
            <option value="query">Query</option>
            <option value="caption">Caption</option>
          </select>
        </div>
      </div>

      {/* History List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-8 bg-white/10 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-1/2"></div>
                  </div>
                  <div className="w-8 h-8 bg-white/10 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            {searchQuery || skillFilter !== 'all' ? 'No matching results' : 'No activity yet'}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredHistory.map((record) => (
              <div key={record.id} className="p-4 hover:bg-white/5 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {/* Skill Badge */}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getSkillColor(record.skill)}`}>
                      {record.skill}
                    </span>
                    
                    {/* Prompt and Metadata */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">
                        {record.prompt}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(record.timestamp).toLocaleDateString()}</span>
                        </span>
                        <span>{record.responseTime}ms</span>
                        <span className={`flex items-center space-x-1 ${record.success ? 'text-green-400' : 'text-red-400'}`}>
                          <span className={`w-2 h-2 rounded-full ${record.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span>{record.success ? 'Success' : 'Failed'}</span>
                        </span>
                        {record.confidence && (
                          <span>{Math.round(record.confidence * 100)}% confidence</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Re-run Button */}
                  <button
                    onClick={() => handleRerun(record)}
                    className="p-2 text-gray-400 hover:text-white transition-all duration-200 rounded-md hover:bg-white/10 hover:scale-105 opacity-0 group-hover:opacity-100"
                    title="Re-run this analysis"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 