import logger from './logger.js';

/**
 * Pure JavaScript fallback for prompt analysis when Anthropic API fails
 * This analyzes the user prompt and determines the appropriate Moondream skill
 */

const SKILL_PATTERNS = {
  detect: [
    /find.*objects/i, /detect/i, /identify.*objects/i, /locate.*objects/i, 
    /objects.*detect/i, /things.*see/i, /spot.*objects/i, /recognize.*objects/i,
    /what.*objects/i, /find.*cars/i, /find.*people/i, /find.*all/i,
    /find.*the.*\w+/i, /find.*person/i, /find.*cat/i, /find.*dog/i
  ],
  point: [
    /point/i, /where.*is/i, /where.*located/i, /coordinates/i, /location.*of/i, /position.*of/i,
    /click/i, /select/i, /highlight/i, /mark.*position/i, /mark.*the/i
  ],
  query: [
    /what.*happening/i, /how.*many/i, /why.*is/i, /when.*was/i, /who.*is/i, 
    /explain.*what/i, /tell.*me.*about/i, /what.*is.*in/i, /how.*is/i
  ],
  caption: [
    /caption/i, /describe.*image/i, /describe.*scene/i, /summary/i, /overview/i, 
    /describe.*what.*see/i, /general.*description/i, /overall.*scene/i,
    /describe.*this/i, /brief.*description/i, /detailed.*description/i
  ]
};

const CONFIDENCE_KEYWORDS = {
  high: [/very/i, /extremely/i, /definitely/i, /clearly/i, /obviously/i],
  medium: [/maybe/i, /possibly/i, /might/i, /could/i, /perhaps/i],
  low: [/barely/i, /hardly/i, /slightly/i, /somewhat/i]
};

/**
 * Analyzes a prompt and returns the best matching skill and parameters
 * @param {string} prompt - User's natural language prompt
 * @returns {Object} - { skill, params }
 */
export default function refineRules(prompt) {
  logger.debug('Analyzing prompt with fallback rules:', prompt);
  
  if (!prompt || typeof prompt !== 'string') {
    logger.warn('Invalid prompt provided to refineRules');
    return { skill: 'caption', params: {} };
  }

  const normalizedPrompt = prompt.toLowerCase().trim();
  const scores = {};
  
  // Calculate scores for each skill based on pattern matching
  for (const [skill, patterns] of Object.entries(SKILL_PATTERNS)) {
    scores[skill] = 0;
    
    for (const pattern of patterns) {
      if (pattern.test(normalizedPrompt)) {
        scores[skill] += 1;
        
        // Boost score if pattern appears multiple times
        const matches = normalizedPrompt.match(pattern);
        if (matches && matches.length > 1) {
          scores[skill] += 0.5;
        }
      }
    }
  }

  // Find the skill with highest score
  const maxScore = Math.max(...Object.values(scores));
  
  // If no patterns matched, default to caption
  if (maxScore === 0) {
    return { skill: 'caption', params: {} };
  }
  
  const bestSkill = Object.entries(scores).find(([skill, score]) => 
    score === maxScore
  )[0];

  // Extract parameters based on the selected skill
  const params = extractParameters(normalizedPrompt, bestSkill);
  
  logger.info('Refined prompt:', { 
    originalPrompt: prompt,
    selectedSkill: bestSkill, 
    scores, 
    params 
  });

  return { skill: bestSkill, params };
}

/**
 * Extracts skill-specific parameters from the prompt
 * @param {string} prompt - Normalized prompt
 * @param {string} skill - Selected skill
 * @returns {Object} - Parameters object
 */
function extractParameters(prompt, skill) {
  const params = {};

  switch (skill) {
    case 'detect':
      // Extract confidence threshold
      params.threshold = extractConfidenceThreshold(prompt);
      
      // Extract specific object to detect
      const objectMatch = prompt.match(/(?:find|detect|locate)\s+(?:the\s+)?(\w+)/i);
      if (objectMatch) {
        params.target = objectMatch[1];
      }
      break;

    case 'point':
      // Extract what to point to
      const pointMatch = prompt.match(/(?:point|where|locate)\s+(?:to\s+|at\s+)?(?:the\s+)?(.+?)(?:\s+is|\s+in|$)/i);
      if (pointMatch) {
        params.query = pointMatch[1].trim();
      } else {
        params.query = prompt;
      }
      break;

    case 'query':
      // The entire prompt is the question
      params.question = prompt;
      
      // Detect if user wants detailed response
      if (/detail/i.test(prompt) || /explain/i.test(prompt)) {
        params.detailed = true;
      }
      break;

    case 'caption':
      // Check for caption style preferences
      if (/brief/i.test(prompt) || /short/i.test(prompt)) {
        params.style = 'brief';
      } else if (/detail/i.test(prompt) || /long/i.test(prompt)) {
        params.style = 'detailed';
      }
      break;
  }

  return params;
}

/**
 * Extracts confidence threshold from prompt
 * @param {string} prompt - Normalized prompt
 * @returns {number} - Confidence threshold (0.1 to 0.9)
 */
function extractConfidenceThreshold(prompt) {
  // Check for explicit percentage
  const percentMatch = prompt.match(/(\d+)%/);
  if (percentMatch) {
    return Math.max(0.1, Math.min(0.9, parseInt(percentMatch[1]) / 100));
  }

  // Check for confidence keywords
  for (const [level, patterns] of Object.entries(CONFIDENCE_KEYWORDS)) {
    for (const pattern of patterns) {
      if (pattern.test(prompt)) {
        switch (level) {
          case 'high': return 0.8;
          case 'medium': return 0.5;
          case 'low': return 0.3;
        }
      }
    }
  }

  // Default threshold
  return 0.5;
} 