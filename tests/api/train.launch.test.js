import handler from '../../pages/api/train/index.js';
import { createMocks } from 'node-mocks-http';
import TrainingJob from '../../models/TrainingJob.js';

jest.mock('../../models/TrainingJob.js');
jest.mock('../../lib/queue.js', () => ({ addTrainingJob: jest.fn() }));

TrainingJob.create.mockResolvedValue({ _id: 'abc123' });

describe('/api/train launch', () => {
  it('enqueues job with curriculum', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { datasetId: 'abc111', curriculum: [{ stage: 'warmup' }] },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const docArgs = TrainingJob.create.mock.calls[0][0];
    expect(docArgs.datasetId).toBe('abc111');
  });
}); 