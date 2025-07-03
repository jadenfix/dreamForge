class MockAnthropic {
  constructor() {}
  messages = {
    create: jest.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: '[{"stage":"warmup","focus":"large objects","epochs":2}]',
          },
        },
      ],
    }),
  };
}

const mock = { Anthropic: MockAnthropic };

module.exports = mock;

// support require('@anthropic-ai/sdk/shims/node')
module.exports.default = mock; 