# DreamForge - AI Vision Platform

Production-grade Visual Language Model (VLM) platform powered by Moondream AI. Transform images into insights with natural language prompts.

## 🚀 Features

- **Real-time Image Analysis**: Caption, detect objects, answer questions about images
- **Smart Skill Routing**: Automatically determines the best analysis method for your prompt
- **Robust Fallback System**: Works with or without API keys (demo mode)
- **Usage Analytics**: Track performance and usage patterns
- **Training Pipeline**: Fine-tune models for your specific use case
- **Vercel-Ready**: Deploy instantly with zero configuration

## 🏗️ Architecture

```
User Upload → Skill Detection → Moondream API → Results + Analytics
```

## 🛠️ Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-username/dreamforge.git
cd dreamforge
npm install
```

### 2. Configure Environment

Create `.env.local` file:

```env
# Required for full functionality
MOONDREAM_KEY=your_moondream_api_key_here

# Optional - system works without these
ANTHROPIC_API_KEY=your_anthropic_api_key_here
MONGODB_URI=your_mongodb_connection_string_here
REDIS_URL=redis://localhost:6379
```

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to use the application.

## 🔑 API Keys Setup

### Moondream API Key (Recommended)
1. Visit [Moondream Dashboard](https://moondream.ai/dashboard)
2. Create an account and get your API key
3. Add to `.env.local` as `MOONDREAM_KEY`

**Without API Key**: System works in demo mode with fallback responses.

### Anthropic API Key (Optional)
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Get your API key
3. Add to `.env.local` as `ANTHROPIC_API_KEY`

**Without API Key**: Uses local rule-based routing (still works great!).

### MongoDB (Optional)
1. Create free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
2. Get connection string
3. Add to `.env.local` as `MONGODB_URI`

**Without MongoDB**: Uses in-memory storage for usage analytics.

## 🚀 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/dreamforge)

### Manual Deploy

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel --prod
```

3. **Set Environment Variables**
In Vercel dashboard, go to Settings → Environment Variables and add:
- `MOONDREAM_KEY` (required for full functionality)
- `ANTHROPIC_API_KEY` (optional)
- `MONGODB_URI` (optional)

### Environment Variables in Vercel

| Variable | Required | Description |
|----------|----------|-------------|
| `MOONDREAM_KEY` | Recommended | Moondream API key for real image analysis |
| `ANTHROPIC_API_KEY` | Optional | Anthropic API for smart routing |
| `MONGODB_URI` | Optional | MongoDB for persistent analytics |
| `REDIS_URL` | Optional | Redis for training queue |

## 📋 API Reference

### POST `/api/dream`

Analyze an image with natural language prompts.

**Request:**
```json
{
  "prompt": "What objects can you detect in this image?",
  "image": "base64_encoded_image_data"
}
```

**Response:**
```json
{
  "success": true,
  "skill": "detect",
  "result": {
    "objects": [
      {
        "label": "person",
        "confidence": 0.95,
        "bbox": [100, 100, 200, 300]
      }
    ]
  },
  "metadata": {
    "totalTime": 1200,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### Supported Skills

- **Caption**: `"describe this image"`
- **Detect**: `"find objects in this image"`
- **Point**: `"where is the car located?"`
- **Query**: `"what color is the car?"`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- --testNamePattern="dream"

# Watch mode
npm run test:watch
```

## 🏭 Production Considerations

### Performance
- Images are processed in real-time (1-3 seconds)
- Automatic fallback to demo mode if APIs are unavailable
- In-memory caching for repeated requests

### Security
- Input validation with Zod schemas
- Rate limiting built-in
- No sensitive data logged in production

### Scaling
- Stateless API design
- MongoDB for persistent data
- Redis for job queues
- Vercel's automatic scaling

## 📊 Usage Analytics

Visit `/usage` to view:
- Total API calls and success rates
- Response time analytics
- Skill usage breakdown
- Cost tracking

## 🔧 Development

### Project Structure

```
dreamforge/
├── components/          # React components
├── pages/api/          # API routes
├── lib/                # Utility functions
├── models/             # Database models
├── tests/              # Test files
└── styles/             # CSS styles
```

### Key Files

- `pages/api/dream.js` - Main image analysis endpoint
- `lib/moondreamClient.js` - Moondream API client
- `lib/refineRules.js` - Local skill routing
- `components/PromptForm.jsx` - Main UI component

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run tests
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@dreamforge.ai
- 💬 Discord: [Join our community](https://discord.gg/dreamforge)
- 📚 Docs: [Documentation](https://docs.dreamforge.ai)

## 🙏 Acknowledgments

- [Moondream](https://moondream.ai) for the amazing vision API
- [Anthropic](https://anthropic.com) for Claude AI
- [Vercel](https://vercel.com) for seamless deployment
- [Next.js](https://nextjs.org) for the fantastic framework