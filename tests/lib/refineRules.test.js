import refineRules from '../../lib/refineRules';

describe('refineRules', () => {
  it('should classify detection prompts correctly', () => {
    const prompts = [
      'What objects can you detect in this image?',
      'Find all the cars in the picture',
      'Identify objects in this scene',
      'Locate all objects',
      'Detect people in this image',
      'Find all objects you can see'
    ];

    prompts.forEach(prompt => {
      const result = refineRules(prompt);
      expect(result.skill).toBe('detect');
    });
  });

  it('should classify point location prompts correctly', () => {
    const prompts = [
      'Where is the person located?',
      'Point to the car',
      'What are the coordinates of the building?',
      'Mark the position of the dog',
      'Click on the red object',
      'Where is the car located?'
    ];

    prompts.forEach(prompt => {
      const result = refineRules(prompt);
      expect(result.skill).toBe('point');
    });
  });

  it('should classify query prompts correctly', () => {
    const prompts = [
      'What is happening in this image?',
      'How many people are there?',
      'Why is the person running?',
      'When was this photo taken?',
      'Who is in the picture?',
      'Explain what is in this image',
      'Tell me about this scene'
    ];

    prompts.forEach(prompt => {
      const result = refineRules(prompt);
      expect(result.skill).toBe('query');
    });
  });

  it('should classify caption prompts correctly', () => {
    const prompts = [
      'Caption this image',
      'Describe this image',
      'Give me a summary of this picture',
      'Provide an overview of the scene',
      'Describe what you see in this image',
      'Describe this scene'
    ];

    prompts.forEach(prompt => {
      const result = refineRules(prompt);
      expect(result.skill).toBe('caption');
    });
  });

  it('should extract parameters for detection prompts', () => {
    const result = refineRules('Find the person with 80% confidence');
    
    expect(result.skill).toBe('detect');
    expect(result.params.threshold).toBe(0.8);
  });

  it('should extract parameters for point prompts', () => {
    const result = refineRules('Point to the red car in the image');
    
    expect(result.skill).toBe('point');
    expect(result.params.query).toBe('red car');
  });

  it('should extract parameters for query prompts', () => {
    const result = refineRules('Explain in detail what is happening');
    
    expect(result.skill).toBe('query');
    expect(result.params.detailed).toBe(true);
  });

  it('should extract parameters for caption prompts', () => {
    const briefResult = refineRules('Give me a brief description');
    expect(briefResult.skill).toBe('caption');
    expect(briefResult.params.style).toBe('brief');

    const detailedResult = refineRules('Provide a detailed caption');
    expect(detailedResult.skill).toBe('caption');
    expect(detailedResult.params.style).toBe('detailed');
  });

  it('should handle confidence keywords', () => {
    const highConfidence = refineRules('Find objects very clearly visible');
    expect(highConfidence.params.threshold).toBe(0.8);

    const mediumConfidence = refineRules('Find objects that might be present');
    expect(mediumConfidence.params.threshold).toBe(0.5);

    const lowConfidence = refineRules('Find objects barely visible');
    expect(lowConfidence.params.threshold).toBe(0.3);
  });

  it('should handle invalid input gracefully', () => {
    const nullResult = refineRules(null);
    expect(nullResult.skill).toBe('caption');
    expect(nullResult.params).toEqual({});

    const emptyResult = refineRules('');
    expect(emptyResult.skill).toBe('caption');
    expect(emptyResult.params).toEqual({});

    const numberResult = refineRules(123);
    expect(numberResult.skill).toBe('caption');
    expect(numberResult.params).toEqual({});
  });

  it('should default to caption for ambiguous prompts', () => {
    const result = refineRules('random text that does not match any pattern');
    expect(result.skill).toBe('caption');
  });

  it('should handle multiple keywords correctly', () => {
    const result = refineRules('Find and detect all the objects you can see');
    expect(result.skill).toBe('detect');
    // Should have higher score due to multiple matching keywords
  });

  it('should extract target objects for detection', () => {
    const result = refineRules('Find the cat in this image');
    expect(result.skill).toBe('detect');
    expect(result.params.target).toBe('cat');
  });
}); 