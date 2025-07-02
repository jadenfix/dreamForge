import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'blue', 
  trend = [], 
  loading = false 
}) {
  const colors = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
    red: 'text-red-500'
  };

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
        </div>
        <div className="h-8 bg-white/10 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-white/10 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 hover:bg-white/10 transition-all duration-200 hover:scale-105 cursor-default">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-400 dark:text-gray-400">{title}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${color}-500/20`}>
          <Icon className={`w-5 h-5 ${colors[color]}`} />
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-100 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        </div>
        
        {trend.length > 0 && (
          <div className="w-16 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={`var(--${color}-500)`}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
} 