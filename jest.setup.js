import '@testing-library/jest-dom';

// Polyfill for Node.js environment
if (typeof setImmediate === 'undefined') {
  global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}

// Mock pino logger to prevent issues in test environment
jest.mock('pino', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };
  
  return jest.fn(() => mockLogger);
});

// Mock environment variables for testing
process.env.MONGODB_URI = 'mongodb://localhost:27017/dreamforge-test';
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
process.env.MOONDREAM_KEY = 'test-moondream-key';
process.env.NODE_ENV = 'test';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock window.fetch
global.fetch = jest.fn();

// Mock Anthropic SDK to prevent shim issues in tests
jest.mock('@anthropic-ai/sdk', () => {
  return {
    Anthropic: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [{ text: '{"skill": "query", "params": {}}' }]
        })
      }
    }))
  };
});

// Mock mongoose completely to prevent any real database connections
jest.mock('mongoose', () => {
  const mockSchema = jest.fn().mockImplementation((schema) => ({
    pre: jest.fn(),
    post: jest.fn(),
    index: jest.fn(),
    virtual: jest.fn(() => ({
      get: jest.fn(),
      set: jest.fn(),
    })),
    statics: {},
    methods: {},
    ...schema
  }));

  // Add Types to the Schema function
  mockSchema.Types = {
    ObjectId: jest.fn(),
    Mixed: jest.fn(),
    String: String,
    Number: Number,
    Date: Date,
    Boolean: Boolean,
  };

  return {
    connect: jest.fn().mockResolvedValue({}),
    connection: {
      readyState: 1, // Connected
      on: jest.fn(),
      once: jest.fn(),
    },
    Schema: mockSchema,
    model: jest.fn().mockImplementation(() => ({
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      aggregate: jest.fn(),
    })),
    models: {},
    Types: {
      ObjectId: jest.fn(),
    },
    default: {
      connect: jest.fn().mockResolvedValue({}),
      connection: {
        readyState: 1,
        on: jest.fn(),
        once: jest.fn(),
      },
    }
  };
});



// Also mock the mongodb module directly
jest.mock('mongodb', () => ({
  MongoClient: {
    connect: jest.fn().mockResolvedValue({
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          find: jest.fn(),
          insertOne: jest.fn(),
          updateOne: jest.fn(),
          deleteOne: jest.fn(),
        })
      }),
      close: jest.fn(),
    })
  }
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock file upload APIs
Object.defineProperty(window, 'FileReader', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    readAsDataURL: jest.fn(),
    result: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD',
    onload: jest.fn(),
    onerror: jest.fn(),
  })),
});

// Mock canvas for drawing tests
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  fillText: jest.fn(),
  measureText: jest.fn(() => ({ width: 100 })),
  beginPath: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  strokeStyle: '',
  fillStyle: '',
  lineWidth: 1,
  font: '12px Arial',
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
}); 