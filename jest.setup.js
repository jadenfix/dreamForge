import '@testing-library/jest-dom';

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