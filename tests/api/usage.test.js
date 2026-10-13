import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/usage';
import { addUsageRecord, clearUsageRecords } from '../../lib/inMemoryStorage';
import connectToDatabase from '../../lib/mongodb';

jest.mock('../../lib/mongodb', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../../models/Usage', () => ({ __esModule: true, default: {} }));

beforeEach(() => {
  clearUsageRecords();
  connectToDatabase.mockRejectedValue(new Error('Database unavailable'));
});

it('filters actual memory records using fractional days and averages the entire range', async () => {
  const now = Date.now();
  addUsageRecord({ timestamp: new Date(now - 10 * 60000), skill: 'detect', responseTime: 0, success: false, confidence: 0 });
  addUsageRecord({ timestamp: new Date(now - 20 * 60000), skill: 'query', responseTime: 40, success: true });
  addUsageRecord({ timestamp: new Date(now - 120 * 60000), skill: 'caption', responseTime: 900, success: true });
  const { req, res } = createMocks({ method: 'GET', query: { timeRange: String(1 / 24), limit: '1' } });
  await handler(req, res);
  expect(res._getStatusCode()).toBe(200);
  const data = JSON.parse(res._getData());
  expect(data.summary).toMatchObject({ totalCalls: 2, successfulCalls: 1, successRate: 50, avgResponseTime: 20 });
  expect(data.recentHistory).toHaveLength(1);
  expect(data.recentHistory[0]).toMatchObject({ skill: 'detect', success: false, responseTime: 0 });
  expect(data.metadata.dataSource).toBe('memory');
});

it.each(['0', '-1', 'Infinity', 'invalid', '366'])('rejects invalid ranges (%s)', async timeRange => {
  const { req, res } = createMocks({ method: 'GET', query: { timeRange } });
  await handler(req, res);
  expect(res._getStatusCode()).toBe(400);
  expect(connectToDatabase).not.toHaveBeenCalled();
});

it('labels sample fallback data explicitly when no actual records exist', async () => {
  const { req, res } = createMocks({ method: 'GET', query: {} });
  await handler(req, res);
  const data = JSON.parse(res._getData());
  expect(data.metadata.dataSource).toBe('fallback');
});
