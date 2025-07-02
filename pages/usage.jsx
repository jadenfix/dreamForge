import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Clock, CheckCircle, AlertCircle, RefreshCcw, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import KPICard from '../components/KPICard.jsx';
import { SkeletonCard, SkeletonChart, SkeletonTable } from '../components/SkeletonLoader.jsx';

export default function Usage() {
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);
  const [showDetailed, setShowDetailed] = useState(false);

  const fetchUsageData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/usage?timeRange=${timeRange}&detailed=${showDetailed}`);
      const data = await response.json();
      
      if (data.success) {
        setUsageData(data);
      } else {
        console.error('Failed to fetch usage data:', data.error);
      }
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, [timeRange, showDetailed]);

  const getSkillColor = (skill) => {
    const colors = {
      detect: '#3B82F6',
      point: '#10B981',
      query: '#8B5CF6',
      caption: '#F59E0B'
    };
    return colors[skill] || '#6B7280';
  };

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-moondream-blue border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!usageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load analytics data</p>
          <button 
            onClick={fetchUsageData}
            className="mt-4 px-4 py-2 bg-moondream-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { summary, recentHistory, detailed } = usageData;

  return (
    <>
      <Head>
        <title>Usage Analytics - DreamForge</title>
        <meta name="description" content="View detailed usage analytics and performance metrics for DreamForge VLM platform" />
      </Head>

      <div className="min-h-screen bg-black text-gray-200">
        {/* Page Controls Bar */}
        <div className="bg-black/50 backdrop-blur-md border-b border-white/10 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-100">Usage Analytics</h1>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(parseInt(e.target.value))}
                className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-sm text-gray-200 hover:bg-white/10 transition-colors"
              >
                <option value={1}>Last 24 hours</option>
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              
              <button
                onClick={() => setShowDetailed(!showDetailed)}
                className={`px-3 py-1.5 rounded-md text-sm border border-white/10 transition-colors ${
                  showDetailed ? 'bg-gradient-to-r from-gradient-start to-gradient-end text-white' : 'text-gray-200 hover:bg-white/10'
                }`}
              >
                Detailed View
              </button>
              
              <button
                onClick={fetchUsageData}
                className="p-2 text-gray-300 hover:text-white transition-colors"
                title="Refresh data"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* KPI Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            ) : (
              <>
                <KPICard
                  title="Total Calls"
                  value={summary.totalCalls.toLocaleString()}
                  subtitle={`Last ${timeRange} days`}
                  icon={TrendingUp}
                  color="blue"
                  trend={detailed?.dailyTrends?.slice(-7).map(d => ({ value: d.totalCalls })) || []}
                />
                
                <KPICard
                  title="Success Rate"
                  value={`${summary.successRate.toFixed(1)}%`}
                  subtitle={`${summary.successfulCalls}/${summary.totalCalls} successful`}
                  icon={CheckCircle}
                  color="green"
                  trend={detailed?.dailyTrends?.slice(-7).map(d => ({ value: d.successRate })) || []}
                />
                
                <KPICard
                  title="Avg Response Time"
                  value={`${Object.values(summary.skillBreakdown).length > 0 
                    ? Math.round(Object.values(summary.skillBreakdown).reduce((sum, skill) => sum + skill.avgResponseTime, 0) / Object.values(summary.skillBreakdown).length)
                    : 0}ms`}
                  subtitle="Across all skills"
                  icon={Clock}
                  color="purple"
                  trend={detailed?.dailyTrends?.slice(-7).map(d => ({ value: d.avgResponseTime })) || []}
                />
                
                <KPICard
                  title="Top Skill"
                  value={Object.entries(summary.skillBreakdown).length > 0
                    ? Object.entries(summary.skillBreakdown).reduce((a, b) => summary.skillBreakdown[a[0]].count > summary.skillBreakdown[b[0]].count ? a : b)[0]
                    : 'N/A'}
                  subtitle="Most used skill"
                  icon={() => <span className="text-orange-500 font-bold text-lg">🏆</span>}
                  color="orange"
                />
                
                <KPICard
                  title="Estimated Cost"
                  value={`$${summary.costUSD.toFixed(3)}`}
                  subtitle="$0.002 per call"
                  icon={DollarSign}
                  color="green"
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Skill Breakdown */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Skill Usage Breakdown</h3>
              
              {loading ? (
                <SkeletonChart />
              ) : Object.keys(summary.skillBreakdown).length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(summary.skillBreakdown).map(([skill, stats]) => ({
                        name: skill,
                        value: stats.count,
                        color: getSkillColor(skill)
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {Object.entries(summary.skillBreakdown).map(([skill], index) => (
                        <Cell key={`cell-${index}`} fill={getSkillColor(skill)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No data available
                </div>
              )}
            </div>

            {/* Performance Metrics */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Performance by Skill</h3>
              
              {loading ? (
                <SkeletonChart />
              ) : Object.keys(summary.skillBreakdown).length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(summary.skillBreakdown).map(([skill, stats]) => ({
                    skill: skill,
                    responseTime: stats.avgResponseTime,
                    successRate: stats.successRate
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="skill" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'responseTime' ? `${value}ms` : `${value}%`,
                        name === 'responseTime' ? 'Avg Response Time' : 'Success Rate'
                      ]}
                    />
                    <Bar dataKey="responseTime" fill="#8B5CF6" name="responseTime" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Daily Trends (if detailed view is enabled) */}
          {showDetailed && detailed && detailed.dailyTrends && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Daily Usage Trends</h3>
              
              {loading ? (
                <SkeletonChart className="h-96" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={detailed.dailyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="totalCalls" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Total Calls"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="successfulCalls" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Successful Calls"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* Recent History */}
          <div className="glass-card">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              <p className="text-sm text-gray-600 mt-1">Latest {recentHistory.length} requests</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prompt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skill
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {recentHistory.map((record) => (
                    <tr key={record.id} className="hover:bg-white/10">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-100 max-w-xs truncate">
                          {record.prompt}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white capitalize"
                          style={{ backgroundColor: getSkillColor(record.skill) }}
                        >
                          {record.skill}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                        {formatTime(record.responseTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.success ? (
                          <span className="inline-flex items-center space-x-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Success</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">Failed</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {recentHistory.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No recent activity found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 