import '@anthropic-ai/sdk/shims/node';
import { createMocks } from 'node-mocks-http';

// Mock all external dependencies before importing the handler
jest.mock('@anthropic-ai/sdk');
jest.mock('../../lib/mongodb.js');
jest.mock('../../lib/moondreamClient.js');
jest.mock('../../models/Usage.js', () => {
  const mockUsageInstance = {
    save: jest.fn().mockResolvedValue({}),
    markError: jest.fn().mockResolvedValue({}),
  };

  const MockUsage = jest.fn(() => mockUsageInstance);

  // Static method mocks
  MockUsage.getUsageSummary = jest.fn().mockResolvedValue({
    totalCalls: 1,
    successfulCalls: 1,
    successRate: 100,
    skillBreakdown: { caption: { count: 1, avgResponseTime: 50, successRate: 100 } },
    timeRange: 7,
  });

  return { __esModule: true, default: MockUsage };
});

// Import handler after mocks are set up
import handler from '../../pages/api/dream';

describe('/api/dream', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset environment
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = 'test-uri';
    process.env.ANTHROPIC_API_KEY = 'test-key';
    process.env.MOONDREAM_KEY = 'test-key';
    
    // Setup mocks
    const mockConnectToDatabase = require('../../lib/mongodb.js').default;
    mockConnectToDatabase.mockResolvedValue({});

    const mockMoondreamClient = require('../../lib/moondreamClient.js').default;
    mockMoondreamClient.caption = jest.fn().mockResolvedValue({
      caption: 'A test image caption',
      confidence: 0.95
    });
    mockMoondreamClient.detect = jest.fn().mockResolvedValue({
      objects: [{ name: 'car', confidence: 0.9, bbox: [0, 0, 100, 100] }]
    });
    mockMoondreamClient.query = jest.fn().mockResolvedValue({
      answer: 'Test answer',
      confidence: 0.85
    });
    mockMoondreamClient.point = jest.fn().mockResolvedValue({
      points: [{ x: 50, y: 50, confidence: 0.8 }]
    });

    // Usage model is mocked globally in jest.setup.js
  });

  it('should return 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Method not allowed'
    });
  });

  it('should validate request body', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        prompt: '', // Invalid: empty prompt
        image: 'base64data'
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData.error).toBe('Validation failed');
  });

  it('should handle successful dream request with fallback rules', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        prompt: 'Describe this image',
        image: 'dGVzdGltYWdl', // base64 encoded 'testimage'
        useAnthropicPlanner: false
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    
    expect(responseData.success).toBe(true);
    expect(responseData.skill).toBe('caption');
    expect(responseData.result.caption).toBe('A test image caption');
    expect(responseData.metadata).toHaveProperty('totalTime');
    expect(responseData.usage).toBeDefined();
  });

  it('should handle Anthropic API errors gracefully', async () => {
    // Mock Anthropic to throw error
    const { Anthropic } = require('@anthropic-ai/sdk');
    const mockAnthropic = {
      messages: {
        create: jest.fn().mockRejectedValue(new Error('Anthropic API error'))
      }
    };
    Anthropic.mockImplementation(() => mockAnthropic);

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        prompt: 'What is in this image?',
        image: 'dGVzdGltYWdl',
        useAnthropicPlanner: true
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    
    expect(responseData.success).toBe(true);
    expect(responseData.skill).toBe('query'); // Should fall back to rule-based selection
  });

  it('should handle moondream API errors', async () => {
    // Mock moondream client to throw error
    const mockMoondreamClient = require('../../lib/moondreamClient.js').default;
    mockMoondreamClient.detect.mockRejectedValue(new Error('Moondream API error'));

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        prompt: 'Find objects in this image',
        image: 'dGVzdGltYWdl',
        useAnthropicPlanner: false
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const responseData = JSON.parse(res._getData());
    
    expect(responseData.error).toBe('Internal server error');
  });
}); 