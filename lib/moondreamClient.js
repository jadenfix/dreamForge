import logger from './logger.js';

/**
 * Real Moondream Cloud API Client
 * Documentation: https://docs.moondream.ai/
 */
class MoondreamClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.moondream.ai/v1';
    
    if (!apiKey) {
      throw new Error('Moondream API key is required');
    }
  }

  /**
   * Detect objects in image
   * @param {Object} options - Detection options
   * @param {Buffer} options.image - Image buffer
   * @param {string} options.target - Object to detect (e.g., "person", "car")
   * @param {number} options.threshold - Confidence threshold (0-1)
   */
  async detect(options) {
    const { image, target = "objects", threshold = 0.5 } = options;
    logger.info('Calling Moondream detect API', { target, threshold });
    
    try {
      const imageBase64 = `data:image/jpeg;base64,${image.toString('base64')}`;
      
      const response = await fetch(`${this.baseUrl}/detect`, {
        method: 'POST',
        headers: {
          'X-Moondream-Auth': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageBase64,
          object: target,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Moondream API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      logger.info('Moondream detect API response received', { 
        objectCount: result.objects?.length || 0 
      });

      // Transform response to match expected format
      return {
        objects: result.objects || [],
        confidence: result.objects?.[0]?.confidence || 0
      };
    } catch (error) {
      logger.error('Moondream detect error:', error);
      throw new Error(`Detection failed: ${error.message}`);
    }
  }

  /**
   * Get point coordinates for object
   * @param {Object} options - Point options
   * @param {Buffer} options.image - Image buffer
   * @param {string} options.query - Object to locate
   */
  async point(options) {
    const { image, query } = options;
    logger.info('Calling Moondream point API', { query });
    
    try {
      const imageBase64 = `data:image/jpeg;base64,${image.toString('base64')}`;
      
      const response = await fetch(`${this.baseUrl}/point`, {
        method: 'POST',
        headers: {
          'X-Moondream-Auth': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageBase64,
          object: query,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Moondream API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      logger.info('Moondream point API response received', { 
        pointCount: result.points?.length || 0 
      });

      // Transform response to match expected format
      return {
        points: result.points || [],
        confidence: result.points?.[0]?.confidence || 0
      };
    } catch (error) {
      logger.error('Moondream point error:', error);
      throw new Error(`Pointing failed: ${error.message}`);
    }
  }

  /**
   * Answer questions about image
   * @param {Object} options - Query options
   * @param {Buffer} options.image - Image buffer
   * @param {string} options.question - Question to ask
   */
  async query(options) {
    const { image, question } = options;
    logger.info('Calling Moondream query API', { question });
    
    try {
      const imageBase64 = `data:image/jpeg;base64,${image.toString('base64')}`;
      
      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: {
          'X-Moondream-Auth': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageBase64,
          question: question,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Moondream API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      logger.info('Moondream query API response received', { 
        answerLength: result.answer?.length || 0 
      });

      // Transform response to match expected format
      return {
        answer: result.answer || '',
        confidence: result.confidence || 0.9
      };
    } catch (error) {
      logger.error('Moondream query error:', error);
      throw new Error(`Query failed: ${error.message}`);
    }
  }

  /**
   * Generate image caption
   * @param {Object} options - Caption options
   * @param {Buffer} options.image - Image buffer
   * @param {string} options.style - Caption style ("short" or "normal")
   */
  async caption(options) {
    const { image, style = "normal" } = options;
    logger.info('Calling Moondream caption API', { style });
    
    try {
      const imageBase64 = `data:image/jpeg;base64,${image.toString('base64')}`;
      
      const response = await fetch(`${this.baseUrl}/caption`, {
        method: 'POST',
        headers: {
          'X-Moondream-Auth': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageBase64,
          length: style,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Moondream API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      logger.info('Moondream caption API response received', { 
        captionLength: result.caption?.length || 0 
      });

      // Transform response to match expected format
      return {
        caption: result.caption || '',
        confidence: result.confidence || 0.9
      };
    } catch (error) {
      logger.error('Moondream caption error:', error);
      throw new Error(`Captioning failed: ${error.message}`);
    }
  }
}

// Create and export client instance with lazy initialization
let moondreamClient = null;

function getMoondreamClient() {
  if (!moondreamClient) {
    if (!process.env.MOONDREAM_KEY) {
      throw new Error('MOONDREAM_KEY environment variable is required');
    }
    moondreamClient = new MoondreamClient(process.env.MOONDREAM_KEY);
  }
  return moondreamClient;
}

export default {
  detect: (options) => getMoondreamClient().detect(options),
  point: (options) => getMoondreamClient().point(options),
  query: (options) => getMoondreamClient().query(options),
  caption: (options) => getMoondreamClient().caption(options)
}; 