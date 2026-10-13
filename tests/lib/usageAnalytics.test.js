import { buildUsageAnalytics } from '../../lib/usageAnalytics';

describe('usage analytics provenance', () => {
  it('groups only returned records, preserves failures and zero-valued metrics', () => {
    const data = {
      summary: { skillBreakdown: { detect: { count: 2, avgResponseTime: 0, successRate: 0 } } },
      recentHistory: [
        { timestamp: '2026-10-12T23:00:00Z', success: false, responseTime: 0 },
        { timestamp: '2026-10-13T00:01:00Z', success: true, responseTime: 20 },
        { timestamp: '2026-10-13T00:02:00Z', success: false, responseTime: 40 }
      ],
      metadata: { dataSource: 'mongodb' }
    };
    const result = buildUsageAnalytics(data);
    expect(result.chartData).toEqual([
      { name: '2026-10-12', calls: 1, success: 0, responseTime: 0 },
      { name: '2026-10-13', calls: 2, success: 1, responseTime: 30 }
    ]);
    expect(result.performanceData).toEqual([{ skill: 'detect', avgResponseTime: 0, successRate: 0 }]);
    expect(result.trends).toEqual([]);
    expect(result.alerts).toEqual([]);
    expect(buildUsageAnalytics(data)).toEqual(result);
  });

  it('keeps empty usage empty and excludes invalid timestamps', () => {
    expect(buildUsageAnalytics({}).chartData).toEqual([]);
    expect(buildUsageAnalytics({ recentHistory: [{ timestamp: 'invalid', success: true }] }).chartData).toEqual([]);
    expect(buildUsageAnalytics({}).performanceData).toEqual([]);
  });

  it('makes volatile memory storage visible', () => {
    expect(buildUsageAnalytics({ metadata: { dataSource: 'memory' } }).alerts[0].message).toMatch(/resets when it restarts/);
  });
});
