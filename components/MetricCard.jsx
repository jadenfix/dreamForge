import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  subtitle, 
  icon: Icon, 
  trend = [], 
  loading = false,
  className = ''
}) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-emerald-400';
      case 'negative': return 'text-red-400';
      case 'neutral': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return '↗';
    if (changeType === 'negative') return '↘';
    return '→';
  };

  if (loading) {
    return (
      <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.05] backdrop-blur-xl p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 bg-white/10 rounded"></div>
            <div className="h-8 w-8 bg-white/10 rounded-lg"></div>
          </div>
          <div className="h-8 w-24 bg-white/10 rounded"></div>
          <div className="h-3 w-16 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.05] backdrop-blur-xl transition-all duration-300 hover:from-white/[0.12] hover:to-white/[0.04] hover:border-white/[0.1] hover:shadow-2xl hover:shadow-purple-500/[0.1] ${className}`}>
      {/* Subtle animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] via-purple-500/[0.02] to-cyan-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-400/90 tracking-wide uppercase">{title}</p>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-white/[0.1] to-white/[0.05] border border-white/[0.08] group-hover:scale-110 transition-transform duration-200">
            <Icon className="w-5 h-5 text-gray-300" />
          </div>
        </div>
        
        {/* Main Value */}
        <div className="mb-3">
          <h3 className="text-3xl font-bold text-white tracking-tight">
            {value}
          </h3>
        </div>
        
        {/* Change and Trend */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {change && (
              <span className={`inline-flex items-center text-sm font-medium ${getChangeColor()}`}>
                <span className="mr-1">{getChangeIcon()}</span>
                {change}
              </span>
            )}
            {subtitle && (
              <span className="text-sm text-gray-500">
                {subtitle}
              </span>
            )}
          </div>
          
          {/* Mini Sparkline */}
          {trend.length > 0 && (
            <div className="w-20 h-8 opacity-60 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="url(#sparklineGradient)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <defs>
                    <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 