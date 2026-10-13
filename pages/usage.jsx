import { buildUsageAnalytics } from '../lib/usageAnalytics';
import { useState, useEffect, useCallback, useRef } from 'react';
import MetricCard from '../components/MetricCard';
import AnalyticsChart from '../components/AnalyticsChart';
import ActivityFeed from '../components/ActivityFeed';
import QuickActions from '../components/QuickActions';
import {
  TrendingUp,
  Clock,
  Target,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

export default function Usage() {
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const latestRequest = useRef(0);
  const [timeRange, setTimeRange] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Time range options
  const timeRanges = [
    { days: 1 / 24, id: '1h', name: '1H', label: 'Last Hour' },
    { days: 1, id: '24h', name: '24H', label: 'Last 24 Hours' },
    { days: 7, id: '7d', name: '7D', label: 'Last 7 Days' },
    { days: 30, id: '30d', name: '30D', label: 'Last 30 Days' },
    { days: 90, id: '90d', name: '90D', label: 'Last 90 Days' }
  ];

  const selectedDays = timeRange === '1h' ? 1 / 24 : timeRange === '24h' ? 1 : Number(timeRange.slice(0, -1));
  const rangeLabel = timeRanges.find(range => range.id === timeRange).label;

  const fetchUsageData = useCallback(async (refresh = false) => {
    const requestId = ++latestRequest.current;
    if (!refresh) setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/usage?timeRange=${selectedDays}`);
      if (!response.ok) throw new Error('Usage request failed');
      const data = await response.json();
      if (!data.success) throw new Error('Usage data is unavailable');
      if (requestId !== latestRequest.current) return;
      setUsageData(buildUsageAnalytics(data));
      setLastUpdated(new Date());
    } catch (requestError) {
      if (requestId === latestRequest.current) setError(requestError.message);
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [selectedDays]);

  // Auto refresh functionality
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchUsageData(true);
      }, 30000); // Refresh every 30 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh, fetchUsageData]);

  // Initial load
  useEffect(() => {
    fetchUsageData();
  }, [fetchUsageData]);

  const handleRefresh = async () => {
    await fetchUsageData(true);
  };

  if (loading && !usageData) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Loading skeleton */}
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-white/10 rounded w-64"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-32 bg-white/10 rounded-2xl"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 h-96 bg-white/10 rounded-2xl"></div>
                <div className="h-96 bg-white/10 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const metrics = usageData ? [
    {
      title: 'Total Calls',
      value: usageData.summary?.totalCalls?.toLocaleString() || '0',
      changeType: 'positive',
      subtitle: rangeLabel,
      icon: TrendingUp,
      trend: usageData.trends
    },
    {
      title: 'Success Rate',
      value: `${usageData.summary?.successRate || 0}%`,
      changeType: 'positive',
      subtitle: rangeLabel,
      icon: CheckCircle,
      trend: usageData.trends
    },
    {
      title: 'Avg Response',
      value: `${usageData.summary?.avgResponseTime || 0}ms`,
      changeType: 'positive',
      subtitle: rangeLabel,
      icon: Clock,
      trend: usageData.trends
    },
    {
      title: 'Top Skill',
      value: usageData.summary?.topSkill || '—',
      changeType: 'neutral',
      subtitle: rangeLabel,
      icon: Target,
      trend: usageData.trends
    },
    {
      title: 'Est. Cost',
      value: `$${usageData.summary?.costUSD?.toFixed(3) || '0.000'}`,
      changeType: 'neutral',
      subtitle: '$0.002 per call estimate',
      icon: DollarSign,
      trend: usageData.trends
    }
  ] : [];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {usageData?.metadata?.dataSource === 'fallback' && (
            <p role="status" className="mb-4 rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-amber-100">
              Demo analytics: sample records are shown because no usage data is available.
            </p>
          )}
          {error && <p role="alert" className="mb-4 rounded-xl border border-red-400/30 p-3 text-red-200">{error}. Try refreshing.</p>}
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
              <p className="text-gray-400">
                Monitor your DreamForge usage and performance metrics
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4 lg:mt-0">
              {/* Time Range Selector */}
              <div className="flex shrink-0 bg-white/[0.05] rounded-xl p-1">
                {timeRanges.map((range) => (
                  <button
                    key={range.id}
                    onClick={() => setTimeRange(range.id)}
                    className={`whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      timeRange === range.id
                        ? 'bg-white/[0.1] text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {range.name}
                  </button>
                ))}
              </div>

              {/* Auto Refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                  autoRefresh
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-white/[0.05] text-gray-400 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span className="text-sm">Live</span>
              </button>

              {/* Manual Refresh */}
              <button
                onClick={handleRefresh}
                className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Alerts */}
          {usageData?.alerts && usageData.alerts.length > 0 && (
            <div className="mb-8 space-y-3">
              {usageData.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-xl border ${
                    alert.type === 'success'
                      ? 'bg-green-500/10 border-green-500/30 text-green-300'
                      : alert.type === 'warning'
                        ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
                        : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  }`}
                >
                  {alert.type === 'success' && <CheckCircle className="w-5 h-5" />}
                  {alert.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                  {alert.type === 'info' && <Activity className="w-5 h-5" />}
                  <span className="text-sm">{alert.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <MetricCard
                key={index}
                {...metric}
                loading={loading}
              />
            ))}
          </div>

          {/* Main Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
            {/* Analytics Chart - Takes up 2/3 of the width */}
            <div className="lg:col-span-3">
              <AnalyticsChart
                data={usageData?.chartData || []}
                skillDistribution={usageData?.skillDistribution || []}
                performanceData={usageData?.performanceData || []}
                title={`Recent activity (${usageData?.recentHistory?.length || 0} returned records, UTC)`}
              />
            </div>

            {/* Quick Actions - Takes up 1/3 of the width */}
            <div className="lg:col-span-1">
              <QuickActions
                data={usageData}
                onRefresh={handleRefresh}
              />
            </div>
          </div>

          {/* Activity Feed */}
          <div className="mb-8">
            <ActivityFeed
              activities={usageData?.recentHistory || []}
              onView={setSelectedActivity}
            />
          </div>

          {selectedActivity && (
            <div role="dialog" aria-modal="true" aria-label="Activity details" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
              <div className="max-w-lg w-full rounded-2xl bg-gray-900 p-6 text-gray-200">
                <h2 className="text-xl font-semibold mb-4">Activity details</h2>
                <pre className="overflow-auto max-h-96 whitespace-pre-wrap break-all text-sm">{JSON.stringify(selectedActivity, null, 2)}</pre>
                <button autoFocus onClick={() => setSelectedActivity(null)} className="mt-4 rounded-lg bg-purple-600 px-4 py-2">Close</button>
              </div>
            </div>
          )}
          {/* Footer Stats */}
          <div className="text-center text-sm text-gray-500">
            <p>
              Last updated: {lastUpdated.toLocaleTimeString()} •
              {autoRefresh ? ' Auto-refreshing every 30s' : ' Manual refresh'} •
              Retention depends on configured storage
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
