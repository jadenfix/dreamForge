import React, { useState } from 'react';
import { 
  ComposedChart, 
  Line, 
  Bar, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell 
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, Activity } from 'lucide-react';

const CHART_TYPES = [
  { id: 'composed', name: 'Overview', icon: Activity },
  { id: 'trend', name: 'Trends', icon: TrendingUp },
  { id: 'distribution', name: 'Distribution', icon: PieIcon },
  { id: 'performance', name: 'Performance', icon: BarChart3 },
];

const PIE_COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-2xl">
        <p className="text-gray-300 text-sm mb-2">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-white text-sm">
            <span className="font-medium" style={{ color: entry.color }}>
              {entry.name}:
            </span>
            {' '}
            <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsChart({ 
  data = [], 
  skillDistribution = [], 
  performanceData = [],
  className = '',
  title = 'Analytics Overview'
}) {
  const [activeChart, setActiveChart] = useState('composed');

  const renderChart = () => {
    switch (activeChart) {
      case 'composed':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke="#9CA3AF" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="calls"
                fill="url(#areaGradient)"
                stroke="#8B5CF6"
                strokeWidth={3}
              />
              <Bar 
                dataKey="success" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
              <Line 
                type="monotone" 
                dataKey="responseTime" 
                stroke="#06B6D4" 
                strokeWidth={3}
                dot={{ fill: '#06B6D4', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#06B6D4', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'distribution':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={skillDistribution}
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {skillDistribution.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'trend':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis 
                dataKey="name" 
                stroke="#9CA3AF" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="calls"
                fill="url(#trendGradient)"
                stroke="#06B6D4"
                strokeWidth={3}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'performance':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="skill" 
                stroke="#9CA3AF" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="avgResponseTime" 
                fill="#8B5CF6" 
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
              <Line 
                type="monotone" 
                dataKey="successRate" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.05] backdrop-blur-xl rounded-2xl overflow-hidden ${className}`}>
      {/* Header with Chart Type Selector */}
      <div className="p-6 border-b border-white/[0.05]">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <div className="flex space-x-1 bg-white/[0.03] rounded-xl p-1">
            {CHART_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveChart(type.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeChart === type.id
                      ? 'bg-white/[0.1] text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{type.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-6">
        <div style={{ width: '100%', height: '400px' }}>
          {renderChart()}
        </div>
      </div>

      {/* Legend for Distribution Chart */}
      {activeChart === 'distribution' && skillDistribution.length > 0 && (
        <div className="px-6 pb-6">
          <div className="flex flex-wrap gap-4">
            {skillDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                />
                <span className="text-sm text-gray-300">{entry.name}</span>
                <span className="text-sm text-gray-500">({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 