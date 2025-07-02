import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  Eye, 
  Zap, 
  Target, 
  MessageSquare, 
  Image as ImageIcon,
  TrendingUp,
  MoreHorizontal,
  Play,
  ExternalLink,
  Calendar
} from 'lucide-react';

const SKILL_ICONS = {
  'detect': Target,
  'point': Zap,
  'query': MessageSquare,
  'caption': ImageIcon,
};

const SKILL_COLORS = {
  'detect': 'from-orange-500/20 to-red-500/20 border-orange-500/30',
  'point': 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
  'query': 'from-blue-500/20 to-purple-500/20 border-blue-500/30',
  'caption': 'from-green-500/20 to-blue-500/20 border-green-500/30',
};

const FILTER_OPTIONS = [
  { id: 'all', name: 'All Skills', icon: TrendingUp },
  { id: 'detect', name: 'Detection', icon: Target },
  { id: 'point', name: 'Pointing', icon: Zap },
  { id: 'query', name: 'Query', icon: MessageSquare },
  { id: 'caption', name: 'Caption', icon: ImageIcon },
];

const TIME_FILTERS = [
  { id: 'hour', name: 'Last Hour' },
  { id: 'day', name: 'Last 24h' },
  { id: 'week', name: 'Last Week' },
  { id: 'month', name: 'Last Month' },
  { id: 'all', name: 'All Time' },
];

function ActivityItem({ activity, onRerun, onView }) {
  const SkillIcon = SKILL_ICONS[activity.skill] || MessageSquare;
  const skillColors = SKILL_COLORS[activity.skill] || SKILL_COLORS.query;
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = () => {
    if (activity.responseTime < 1000) return 'text-emerald-400';
    if (activity.responseTime < 3000) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="group relative">
      {/* Timeline connector */}
      <div className="absolute left-6 top-12 bottom-0 w-px bg-gradient-to-b from-white/20 to-transparent group-last:hidden" />
      
      <div className="flex space-x-4 p-4 rounded-xl hover:bg-white/[0.02] transition-all duration-200">
        {/* Skill Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${skillColors} backdrop-blur-sm flex items-center justify-center relative z-10`}>
          <SkillIcon className="w-5 h-5 text-white" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-white capitalize">
                  {activity.skill}
                </span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(activity.timestamp)}
                </span>
              </div>
              
              <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                {activity.prompt}
              </p>
              
              <div className="flex items-center space-x-4 text-xs">
                <span className={`flex items-center ${getStatusColor()}`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {activity.responseTime}ms
                </span>
                <span className="text-emerald-400 flex items-center">
                  ✓ Success
                </span>
                {activity.confidence && (
                  <span className="text-blue-400 flex items-center">
                    {Math.round(activity.confidence * 100)}% confidence
                  </span>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onView?.(activity)}
                className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => onRerun?.(activity)}
                className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
                title="Re-run Analysis"
              >
                <Play className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-colors">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActivityFeed({ 
  activities = [], 
  onRerun, 
  onView,
  className = '' 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('day');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredActivities, setFilteredActivities] = useState(activities);

  useEffect(() => {
    let filtered = activities;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.prompt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Skill filter
    if (skillFilter !== 'all') {
      filtered = filtered.filter(activity => activity.skill === skillFilter);
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const timeMap = {
        hour: 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
      };
      
      const cutoff = new Date(now - timeMap[timeFilter]);
      filtered = filtered.filter(activity => 
        new Date(activity.timestamp) > cutoff
      );
    }

    setFilteredActivities(filtered);
  }, [activities, searchTerm, skillFilter, timeFilter]);

  return (
    <div className={`bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.05] backdrop-blur-xl rounded-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-white/[0.05]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
            <div className="px-2 py-1 bg-white/[0.1] rounded-full">
              <span className="text-xs font-medium text-gray-300">
                {filteredActivities.length}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-white/[0.1] text-white' 
                  : 'bg-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.1]'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg bg-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.1] transition-colors">
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 space-y-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Skill Type</label>
              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSkillFilter(option.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        skillFilter === option.id
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.1]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{option.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Time Range</label>
              <div className="flex flex-wrap gap-2">
                {TIME_FILTERS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setTimeFilter(option.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      timeFilter === option.id
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.1]'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>{option.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredActivities.length > 0 ? (
          <div className="p-4">
            {filteredActivities.map((activity, index) => (
              <ActivityItem
                key={activity._id || index}
                activity={activity}
                onRerun={onRerun}
                onView={onView}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-white mb-2">No activities found</h4>
            <p className="text-gray-400 text-sm">
              {searchTerm || skillFilter !== 'all' || timeFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Activities will appear here as you use DreamForge.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 