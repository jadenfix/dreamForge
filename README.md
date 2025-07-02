# DreamForge - Production-Grade VLM Platform

A powerful, full-stack Visual Language Model (VLM) platform that combines Moondream AI with Anthropic Claude for intelligent image analysis. Transform natural language prompts into sophisticated vision AI capabilities.

## ✨ Features

### Core Capabilities
- **🔍 Object Detection** - Identify and locate objects with bounding boxes
- **📍 Point Localization** - Find specific coordinates and positions
- **❓ Visual Q&A** - Answer questions about image content
- **📝 Smart Captioning** - Generate detailed image descriptions

### Advanced Features
- **🧠 AI-Powered Planning** - Anthropic Claude automatically selects optimal analysis methods
- **⚡ Real-time Processing** - Fast inference with optimized API calls
- **📊 Usage Analytics** - Comprehensive tracking and performance metrics
- **🎯 Visual Overlays** - Interactive bounding boxes and point annotations
- **🛡️ Fallback System** - Rule-based backup when AI planning is unavailable
- **💾 Export Results** - Download analysis results in JSON format

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │  Anthropic AI   │    │  Moondream API  │
│   (Frontend)    │────│   (Planning)    │────│   (Inference)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                              │
         │              ┌─────────────────┐             │
         └──────────────│  MongoDB Atlas  │─────────────┘
                        │   (Analytics)   │
                        └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (free M0 tier)
- Anthropic API key
- Moondream API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/dreamforge.git
cd dreamforge
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your API keys:
```env
MONGODB_URI=your_mongodb_connection_string
ANTHROPIC_API_KEY=your_anthropic_api_key
MOONDREAM_KEY=your_moondream_api_key
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | ✅ |
| `MOONDREAM_KEY` | Moondream API authentication key | ✅ |
| `NODE_ENV` | Environment (development/production) | ❌ |
| `NEXTAUTH_URL` | NextAuth.js URL (for auth features) | ❌ |

### MongoDB Setup

1. Create a free MongoDB Atlas cluster
2. Add your IP address to the network access list
3. Create a database user with read/write permissions
4. Copy the connection string to `MONGODB_URI`

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run type-check   # TypeScript type checking
```

### Project Structure

```
dreamforge/
├── components/           # React components
│   ├── PromptForm.jsx   # Main form interface
│   ├── ResultOverlay.jsx # Results display
│   └── ...
├── pages/               # Next.js pages
│   ├── api/            # API routes
│   │   ├── dream.js    # Main VLM endpoint
│   │   └── usage.js    # Analytics endpoint
│   ├── index.jsx       # Home page
│   └── usage.jsx       # Analytics dashboard
├── lib/                # Utility libraries
│   ├── mongodb.js      # Database connection
│   ├── moondreamClient.js # Moondream API client
│   └── refineRules.js  # Fallback rule engine
├── models/             # Database models
│   └── Usage.js        # Usage tracking schema
└── styles/             # CSS styles
    └── globals.css     # Global styles
```

## 📊 API Documentation

### POST `/api/dream`

Analyze an image with natural language prompts.

**Request Body:**
```json
{
  "prompt": "What objects can you detect in this image?",
  "image": "base64_encoded_image_data",
  "useAnthropicPlanner": true
}
```

**Response:**
```json
{
  "success": true,
  "skill": "detect",
  "params": {},
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
    "totalTime": 1500,
    "dreamTime": 1200,
    "timestamp": "2024-01-01T12:00:00.000Z"
  },
  "usage": {
    "totalCalls": 42,
    "successRate": 95.2,
    "skillBreakdown": {...}
  }
}
```

### GET `/api/usage`

Get usage analytics and performance metrics.

**Query Parameters:**
- `timeRange` - Number of days (default: 7)
- `detailed` - Include detailed analytics (default: false)
- `limit` - Number of recent records (default: 10)

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### API Testing with curl
```bash
# Test the dream endpoint
curl -X POST http://localhost:3000/api/dream \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Describe this image",
    "image": "base64_image_data",
    "useAnthropicPlanner": true
  }'
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel --prod
```

3. **Configure environment variables in Vercel dashboard**

### Manual Deployment

1. **Build the application**
```bash
npm run build
```

2. **Start the production server**
```bash
npm start
```

## 📈 Monitoring & Analytics

### Built-in Analytics
- Request volume and success rates
- Performance metrics by skill type
- Error tracking and analysis
- Daily usage trends

### External Monitoring
- **Vercel Analytics** - Performance monitoring
- **MongoDB Charts** - Database analytics
- **Sentry** - Error tracking (optional)

## 🔒 Security

### Best Practices Implemented
- Input validation with Zod schemas
- Rate limiting on API endpoints
- Secure environment variable handling
- Image upload size limits
- SQL injection prevention (using Mongoose)

### Security Headers
```javascript
// Automatically handled by Next.js and Vercel
{
  "Content-Security-Policy": "...",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Moondream](https://moondream.ai/) - Vision AI capabilities
- [Anthropic](https://anthropic.com/) - Claude AI for intelligent planning
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [MongoDB](https://mongodb.com/) - Database platform

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Join GitHub Discussions for general questions

---

**Built with ❤️ by the DreamForge team (Jaden)**