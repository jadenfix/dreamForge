// The timeline is deliberately scoped to the returned recent records.
// Summary metrics describe the full selected range; no historical deltas are invented.
export function buildUsageAnalytics(data) {
  const buckets = new Map();
  for (const record of data.recentHistory || []) {
    const timestamp = new Date(record.timestamp);
    if (!Number.isFinite(timestamp.getTime())) continue;
    const name = timestamp.toISOString().slice(0, 10);
    const bucket = buckets.get(name) || { name, calls: 0, success: 0, totalResponseTime: 0 };
    bucket.calls += 1;
    bucket.success += record.success === true ? 1 : 0;
    bucket.totalResponseTime += Number.isFinite(record.responseTime) ? record.responseTime : 0;
    buckets.set(name, bucket);
  }
  const chartData = [...buckets.values()].sort((a, b) => a.name.localeCompare(b.name)).map(bucket => ({
    name: bucket.name,
    calls: bucket.calls,
    success: bucket.success,
    responseTime: Math.round(bucket.totalResponseTime / bucket.calls)
  }));
  const skillEntries = Object.entries(data.summary?.skillBreakdown || {});
  return {
    ...data,
    chartData,
    skillDistribution: skillEntries.map(([name, stats]) => ({ name, value: stats.count ?? 0 })),
    performanceData: skillEntries.map(([skill, stats]) => ({
      skill,
      avgResponseTime: stats.avgResponseTime ?? 0,
      successRate: stats.successRate ?? 0
    })),
    trends: [],
    alerts: data.metadata?.dataSource === 'memory'
      ? [{ type: 'warning', message: 'Usage is stored in this server process and resets when it restarts.' }]
      : []
  };
}
