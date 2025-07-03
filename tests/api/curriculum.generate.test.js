import handler from '../../pages/api/curriculum/generate.js';
import { createMocks } from 'node-mocks-http';

describe('/api/curriculum/generate', () => {
  it('returns 400 when goal missing', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('returns curriculum JSON when valid', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { goal: 'test goal', datasetDesc: 'desc' },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(Array.isArray(data.curriculum)).toBe(true);
    expect(data.curriculum[0]).toHaveProperty('stage');
  });
}); 