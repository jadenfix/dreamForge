import '@anthropic-ai/sdk/shims/node';
import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/dream';

// Mock external dependencies
jest.mock('@anthropic-ai/sdk');
jest.mock('../../lib/mongodb.js', () => ({
  default: jest.fn().mockResolvedValue({
    connection: { readyState: 1 }
  })
}));
jest.mock('../../lib/moondreamClient.js');
jest.mock('../../models/Usage.js');

describe('/api/dream', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    // Mock successful database connection
    const mockConnectToDatabase = require('../../lib/mongodb.js').default;
    mockConnectToDatabase.mockResolvedValue({});

    // Mock Usage model
    const mockUsage = {
      save: jest.fn().mockResolvedValue({}),
      markError: jest.fn().mockResolvedValue({})
    };
    
    // Mock the Usage constructor and static method
    jest.doMock('../../models/Usage.js', () => ({
      default: jest.fn().mockImplementation(() => mockUsage)
    }));
    
    const Usage = require('../../models/Usage.js').default;
    Usage.getUsageSummary = jest.fn().mockResolvedValue({
      totalCalls: 1,
      successRate: 100,
      skillBreakdown: {}
    });

    // Mock moondream client
    const mockMoondreamClient = require('../../lib/moondreamClient.js').default;
    mockMoondreamClient.caption.mockResolvedValue({
      caption: 'A test image caption',
      confidence: 0.95
    });

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
    // Mock database connection
    const mockConnectToDatabase = require('../../lib/mongodb.js').default;
    mockConnectToDatabase.mockResolvedValue({});

    // Mock Anthropic to throw error
    const { Anthropic } = require('@anthropic-ai/sdk');
    const mockAnthropic = {
      messages: {
        create: jest.fn().mockRejectedValue(new Error('Anthropic API error'))
      }
    };
    Anthropic.mockImplementation(() => mockAnthropic);

    // Mock Usage model
    const mockUsage = {
      save: jest.fn().mockResolvedValue({}),
      markError: jest.fn().mockResolvedValue({})
    };
    
    // Mock the Usage constructor and static method
    jest.doMock('../../models/Usage.js', () => ({
      default: jest.fn().mockImplementation(() => mockUsage)
    }));
    
    const Usage = require('../../models/Usage.js').default;
    Usage.getUsageSummary = jest.fn().mockResolvedValue({
      totalCalls: 1,
      successRate: 100,
      skillBreakdown: {}
    });

    // Mock moondream client
    const mockMoondreamClient = require('../../lib/moondreamClient.js').default;
    mockMoondreamClient.query.mockResolvedValue({
      answer: 'Fallback response',
      confidence: 0.85
    });

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
    // Mock database connection
    const mockConnectToDatabase = require('../../lib/mongodb.js').default;
    mockConnectToDatabase.mockResolvedValue({});

    // Mock Usage model with error handling
    const mockUsage = {
      save: jest.fn().mockResolvedValue({}),
      markError: jest.fn().mockResolvedValue({})
    };
    
    // Mock the Usage constructor
    jest.doMock('../../models/Usage.js', () => ({
      default: jest.fn().mockImplementation(() => mockUsage)
    }));
    
    const Usage = require('../../models/Usage.js').default;

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
    expect(mockUsage.markError).toHaveBeenCalledWith('Moondream API error');
  });
}); 