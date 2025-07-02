import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import MetricCard from '../components/MetricCard';
import AnalyticsChart from '../components/AnalyticsChart';
import ActivityFeed from '../components/ActivityFeed';
import QuickActions from '../components/QuickActions';
import { 
  TrendingUp, 
  Zap, 
  Clock, 
  Target, 
  DollarSign,
  Users,
  Activity,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

export default function Usage() {
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Time range options
  const timeRanges = [
    { id: '1h', name: '1H', label: 'Last Hour' },
    { id: '24h', name: '24H', label: 'Last 24 Hours' },
    { id: '7d', name: '7D', label: 'Last 7 Days' },
    { id: '30d', name: '30D', label: 'Last 30 Days' },
    { id: '90d', name: '90D', label: 'Last 90 Days' },
  ];

  // Fetch usage data
  const fetchUsageData = async (refresh = false) => {
    if (!refresh) setLoading(true);
    
    try {
      const response = await fetch('/api/usage');
      const data = await response.json();
      
      // Enhance data with mock trend information
      const enhancedData = {
        ...data,
        trends: generateTrendData(),
        chartData: generateChartData(),
        skillDistribution: generateSkillDistribution(data),
        performanceData: generatePerformanceData(),
        alerts: generateAlerts(),
      };
      
      setUsageData(enhancedData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock trend data for sparklines
  const generateTrendData = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      time: i,
      value: Math.floor(Math.random() * 100) + 20
    }));
  };

  // Generate chart data
  const generateChartData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      name: day,
      calls: Math.floor(Math.random() * 50) + 10,
      success: Math.floor(Math.random() * 45) + 8,
      responseTime: Math.floor(Math.random() * 500) + 200,
    }));
  };

  // Generate skill distribution
  const generateSkillDistribution = (data) => {
    if (!data?.summary?.skillBreakdown) return [];
    
    return Object.entries(data.summary.skillBreakdown).map(([skill, stats]) => ({
      name: skill,
      value: stats.count || 0
    }));
  };

  // Generate performance data
  const generatePerformanceData = () => {
    const skills = ['detect', 'point', 'query', 'caption'];
    return skills.map(skill => ({
      skill,
      avgResponseTime: Math.floor(Math.random() * 1000) + 500,
      successRate: Math.floor(Math.random() * 20) + 80,
    }));
  };

  // Generate alerts
  const generateAlerts = () => {
    const alerts = [
      { type: 'info', message: 'New feature: Enhanced detection accuracy now available' },
      { type: 'warning', message: 'Response times slightly elevated during peak hours' },
      { type: 'success', message: 'API uptime: 99.9% this month' },
    ];
    return alerts.slice(0, Math.floor(Math.random() * 3) + 1);
  };

  // Auto refresh functionality
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchUsageData(true);
      }, 30000); // Refresh every 30 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Initial load
  useEffect(() => {
    fetchUsageData();
  }, [timeRange]);

  // Handle actions
  const handleQuickAction = (action) => {
    console.log('Quick action:', action);
  };

  const handleRefresh = async () => {
    await fetchUsageData(true);
  };

  const handleActivityRerun = (activity) => {
    console.log('Rerun activity:', activity);
  };

  const handleActivityView = (activity) => {
    console.log('View activity:', activity);
  };

  if (loading && !usageData) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  const metrics = usageData ? [
    {
      title: 'Total Calls',
      value: usageData.summary?.totalCalls?.toLocaleString() || '0',
      change: '+12%',
      changeType: 'positive',
      subtitle: 'vs last period',
      icon: TrendingUp,
      trend: usageData.trends,
    },
    {
      title: 'Success Rate',
      value: `${usageData.summary?.successRate || 0}%`,
      change: '+2.1%',
      changeType: 'positive',
      subtitle: 'last 7 days',
      icon: CheckCircle,
      trend: usageData.trends,
    },
    {
      title: 'Avg Response',
      value: `${usageData.summary?.avgResponseTime || 0}ms`,
      change: '-15ms',
      changeType: 'positive',
      subtitle: 'faster',
      icon: Clock,
      trend: usageData.trends,
    },
    {
      title: 'Top Skill',
      value: usageData.summary?.topSkill || 'caption',
      change: `${usageData.summary?.totalCalls || 0}`,
      changeType: 'neutral',
      subtitle: 'queries',
      icon: Target,
      trend: usageData.trends,
    },
    {
      title: 'Est. Cost',
      value: `$${usageData.summary?.costUSD?.toFixed(3) || '0.000'}`,
      change: '+$0.05',
      changeType: 'neutral',
      subtitle: 'this month',
      icon: DollarSign,
      trend: usageData.trends,
    },
  ] : [];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
              <p className="text-gray-400">
                Monitor your DreamForge usage and performance metrics
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              {/* Time Range Selector */}
              <div className="flex bg-white/[0.05] rounded-xl p-1">
                {timeRanges.map((range) => (
                  <button
                    key={range.id}
                    onClick={() => setTimeRange(range.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
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
                title="Usage Analytics"
              />
            </div>

            {/* Quick Actions - Takes up 1/3 of the width */}
            <div className="lg:col-span-1">
              <QuickActions
                onAction={handleQuickAction}
                onRefresh={handleRefresh}
              />
            </div>
          </div>

          {/* Activity Feed */}
          <div className="mb-8">
            <ActivityFeed
              activities={usageData?.recentHistory || []}
              onRerun={handleActivityRerun}
              onView={handleActivityView}
            />
          </div>

          {/* Footer Stats */}
          <div className="text-center text-sm text-gray-500">
            <p>
              Last updated: {lastUpdated.toLocaleTimeString()} • 
              {autoRefresh ? ' Auto-refreshing every 30s' : ' Manual refresh'} • 
              Data retention: 90 days
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
} 