import handler from '../../pages/api/curriculum/generate.js';
import { createMocks } from 'node-mocks-http';

// Mock Anthropic
jest.mock('@anthropic-ai/sdk', () => ({
  Anthropic: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ 
          text: JSON.stringify([
            {"stage": "warmup", "focus": "basic feature learning", "epochs": 2, "lr": 1e-3, "batch_size": 16},
            {"stage": "adaptation", "focus": "domain-specific training", "epochs": 5, "lr": 5e-4, "batch_size": 8},
            {"stage": "fine_tune", "focus": "task-specific optimization", "epochs": 3, "lr": 1e-5, "batch_size": 4}
          ])
        }]
      })
    }
  }))
}));

describe('/api/curriculum/generate', () => {
  it('generates curriculum successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        goal: 'segment these medical images',
        datasetDesc: 'Medical scan dataset',
        rewardName: 'dice_coefficient',
        constraints: 'low compute for laptop'
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    
    expect(data).toHaveProperty('curriculum');
    expect(Array.isArray(data.curriculum)).toBe(true);
    expect(data.curriculum.length).toBeGreaterThan(0);
    
    // Check curriculum structure
    data.curriculum.forEach(stage => {
      expect(stage).toHaveProperty('stage');
      expect(stage).toHaveProperty('focus');
      expect(stage).toHaveProperty('epochs');
      expect(stage).toHaveProperty('lr');
      expect(stage).toHaveProperty('batch_size');
      expect(typeof stage.epochs).toBe('number');
      expect(typeof stage.lr).toBe('number');
      expect(typeof stage.batch_size).toBe('number');
    });
  });

  it('requires goal parameter', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('goal is required');
  });

  it('generates curriculum for different goal types', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        goal: 'segment medical images for diagnosis',
        datasetDesc: 'Medical scans',
        rewardName: 'dice_coefficient'
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('curriculum');
    expect(Array.isArray(data.curriculum)).toBe(true);
    expect(data.curriculum.length).toBeGreaterThan(0);
    
    // Each stage should have required fields
    data.curriculum.forEach(stage => {
      expect(typeof stage.epochs).toBe('number');
      expect(typeof stage.lr).toBe('number');
      expect(typeof stage.batch_size).toBe('number');
    });
  });

  it('uses AI-generated curriculum when Anthropic succeeds', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        goal: 'detect bounding boxes in images'
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    // Should use the mocked Anthropic response which has warmup, adaptation, fine_tune stages
    expect(data.curriculum.some(s => s.stage === 'warmup' || s.stage === 'adaptation' || s.stage === 'fine_tune')).toBe(true);
  });

  it('only accepts POST method', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
}); 