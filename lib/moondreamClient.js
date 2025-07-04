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
      logger.warn('Moondream API key is missing - using fallback responses');
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
    
    // Fallback response if no API key
    if (!this.apiKey || this.apiKey === 'your_moondream_api_key_here') {
      logger.info('Using fallback detect response (no API key)');
      return {
        objects: [
          {
            label: target === 'objects' ? 'person' : target,
            confidence: 0.85,
            bbox: [100, 100, 200, 300]
          }
        ],
        confidence: 0.85
      };
    }
    
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
    
    // Fallback response if no API key
    if (!this.apiKey || this.apiKey === 'your_moondream_api_key_here') {
      logger.info('Using fallback point response (no API key)');
      return {
        points: [
          {
            x: 150,
            y: 200,
            confidence: 0.9
          }
        ],
        confidence: 0.9
      };
    }
    
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
    
    // Fallback response if no API key
    if (!this.apiKey || this.apiKey === 'your_moondream_api_key_here') {
      logger.info('Using fallback query response (no API key)');
      return {
        answer: `This image appears to show a scene related to: ${question}. (Demo mode - add your Moondream API key for real analysis)`,
        confidence: 0.8
      };
    }
    
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
    
    // Fallback response if no API key
    if (!this.apiKey || this.apiKey === 'your_moondream_api_key_here') {
      logger.info('Using fallback caption response (no API key)');
      return {
        caption: 'This image shows a scene with various elements. (Demo mode - add your Moondream API key for detailed analysis)',
        confidence: 0.8
      };
    }
    
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
    const apiKey = process.env.MOONDREAM_KEY;
    moondreamClient = new MoondreamClient(apiKey);
  }
  return moondreamClient;
}

export default getMoondreamClient(); 