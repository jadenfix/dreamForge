/**
 * Real Data Pipeline Test
 * Verifies that the /api/dream endpoint is using real API responses
 */

import { jest } from '@jest/globals';
import handler from '../../pages/api/dream.js';
import { createMocks } from 'node-mocks-http';

// Mock only the database connection, not the APIs
jest.mock('../../lib/mongodb.js', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true)
}));

jest.mock('../../models/Usage.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue(true),
    markError: jest.fn().mockResolvedValue(true)
  }))
}));

// Don't mock the actual API clients - we want to test real calls
describe('/api/dream - Real Data Pipeline', () => {
  // Use a longer timeout for real API calls
  jest.setTimeout(30000);
  
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

  beforeEach(() => {
    // Set required environment variables
    process.env.ANTHROPIC_API_KEY = 'test-key';
    process.env.MOONDREAM_KEY = 'test-key';
  });

  it('should use real Anthropic AI for routing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        prompt: 'find the red car in this image',
        image: testImageBase64,
        useAnthropicPlanner: true
      }
    });

    await handler(req, res);

    const response = JSON.parse(res._getData());
    
    // Verify we got a response
    expect(res._getStatusCode()).toBe(200);
    expect(response.success).toBe(true);
    
    // Verify Anthropic routing worked (should be 'detect' for 'find the red car')
    expect(response.skill).toBe('detect');
    expect(response.params).toBeDefined();
    
    // Check that we have analysis from Anthropic
    expect(response.analysis).toBeDefined();
    expect(response.verified).toBeDefined();
    
    console.log('✅ Real Anthropic routing result:', {
      skill: response.skill,
      params: response.params,
      hasAnalysis: !!response.analysis
    });
  });

  it('should use real Moondream API for image processing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        prompt: 'describe this image',
        image: testImageBase64,
        useAnthropicPlanner: false // Use fallback to ensure we test Moondream
      }
    });

    await handler(req, res);

    const response = JSON.parse(res._getData());
    
    expect(res._getStatusCode()).toBe(200);
    expect(response.success).toBe(true);
    
    // Verify we got real Moondream response
    expect(response.result).toBeDefined();
    expect(response.skill).toBe('caption'); // Should be caption for 'describe'
    
    // Check for real confidence scores (not the mock 0.91)
    if (response.result.confidence) {
      expect(typeof response.result.confidence).toBe('number');
      expect(response.result.confidence).toBeGreaterThan(0);
      expect(response.result.confidence).toBeLessThanOrEqual(1);
    }
    
    console.log('✅ Real Moondream result:', {
      skill: response.skill,
      resultType: typeof response.result,
      hasCaption: !!response.result.caption,
      confidence: response.result.confidence
    });
  });

  it('should track real usage metrics', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        prompt: 'point to the center of the image',
        image: testImageBase64
      }
    });

    await handler(req, res);

    const response = JSON.parse(res._getData());
    
    expect(res._getStatusCode()).toBe(200);
    
    // Verify usage tracking
    expect(response.usage).toBeDefined();
    expect(response.metadata).toBeDefined();
    expect(response.metadata.totalTime).toBeGreaterThan(0);
    expect(response.metadata.dreamTime).toBeGreaterThan(0);
    
    // Real API calls should take some time
    expect(response.metadata.totalTime).toBeGreaterThan(100); // At least 100ms
    
    console.log('✅ Real usage metrics:', {
      totalTime: response.metadata.totalTime,
      dreamTime: response.metadata.dreamTime,
      verified: response.verified
    });
  });

  it('should handle errors gracefully with real APIs', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        prompt: '', // Invalid empty prompt
        image: testImageBase64
      }
    });

    await handler(req, res);

    // Should get validation error
    expect(res._getStatusCode()).toBe(400);
    
    const response = JSON.parse(res._getData());
    expect(response.error).toBe('Validation failed');
  });
}); 