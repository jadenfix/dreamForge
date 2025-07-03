import handler from '../../pages/api/train/index.js';
import { createMocks } from 'node-mocks-http';

// Mock the queue
jest.mock('../../lib/queue.js', () => ({
  addTrainingJob: jest.fn().mockResolvedValue(),
}));

describe('/api/train launch', () => {
  it('enqueues job with curriculum', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { 
        datasetId: 'abc111', 
        curriculum: [
          { stage: 'warmup', epochs: 2, lr: 0.001, batch_size: 16 },
          { stage: 'fine_tune', epochs: 3, lr: 0.0001, batch_size: 8 }
        ] 
      },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('jobId');
    expect(data).toHaveProperty('message');
    expect(data.message).toBe('Training job queued successfully');
  });

  it('requires datasetId', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { curriculum: [{ stage: 'test' }] },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('datasetId is required');
  });

  it('requires curriculum', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { datasetId: 'test' },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('curriculum is required and must be a non-empty array');
  });

  it('only accepts POST method', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });
}); 