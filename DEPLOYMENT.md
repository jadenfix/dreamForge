# DreamForge Deployment Guide

## 🚀 Deploy to Vercel (Recommended)

### Method 1: One-Click Deploy

1. Click the deploy button:
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/dreamforge)

2. Set environment variables in Vercel dashboard:
   - `MOONDREAM_KEY` (optional - for real image analysis)
   - `ANTHROPIC_API_KEY` (optional - for smart routing)
   - `MONGODB_URI` (optional - for persistent analytics)

### Method 2: Manual Deploy

1. **Fork/Clone the repository**
   ```bash
   git clone https://github.com/your-username/dreamforge.git
   cd dreamforge
   ```

2. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set environment variables**
   ```bash
   vercel env add MOONDREAM_KEY
   vercel env add ANTHROPIC_API_KEY
   vercel env add MONGODB_URI
   ```

## 🔧 Environment Variables

### Required for Full Functionality
- `MOONDREAM_KEY` - Get from [Moondream Dashboard](https://moondream.ai/dashboard)

### Optional (System works without these)
- `ANTHROPIC_API_KEY` - Get from [Anthropic Console](https://console.anthropic.com/)
- `MONGODB_URI` - Get from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- `REDIS_URL` - For training queue (default: `redis://localhost:6379`)

## 📋 Pre-Deployment Checklist

- [ ] Code committed to Git
- [ ] All tests passing (`npm test`)
- [ ] Environment variables configured
- [ ] API keys obtained (optional)
- [ ] Database setup (optional)

## 🧪 Testing Deployment

After deployment, test the API:

```bash
curl -X POST https://your-app.vercel.app/api/dream \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "describe this image",
    "image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
  }'
```

Expected response:
```json
{
  "success": true,
  "skill": "caption",
  "result": {
    "caption": "This image shows a scene with various elements...",
    "confidence": 0.8
  }
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Build fails**
   - Check Node.js version (requires 18+)
   - Ensure all dependencies are installed
   - Run `npm run build` locally first

2. **API not responding**
   - Check function logs in Vercel dashboard
   - Verify environment variables are set
   - Test locally with `npm run dev`

3. **Database connection issues**
   - Verify MongoDB URI format
   - Check IP whitelist in MongoDB Atlas
   - System works without database (uses in-memory storage)

4. **API key issues**
   - System works in demo mode without API keys
   - Check API key format and validity
   - Verify environment variable names

### Debug Commands

```bash
# Check deployment status
vercel ls

# View function logs
vercel logs

# Check environment variables
vercel env ls

# Redeploy
vercel --prod --force
```

## 🌐 Custom Domain

1. **Add domain in Vercel dashboard**
   - Go to Settings → Domains
   - Add your domain
   - Follow DNS configuration instructions

2. **Update environment variables**
   ```bash
   vercel env add NEXTAUTH_URL production
   # Enter: https://yourdomain.com
   ```

## 📊 Monitoring

- **Vercel Analytics**: Automatic performance monitoring
- **Function Logs**: Debug API issues
- **Usage Dashboard**: Visit `/usage` on your deployed app
- **Error Tracking**: Built-in error logging

## 🔒 Security

- All API keys are server-side only
- Input validation with Zod schemas
- Rate limiting built-in
- CORS headers configured
- No sensitive data in client-side code

## 🚀 Performance

- Automatic edge caching
- Serverless functions scale automatically
- Image processing optimized
- In-memory fallbacks for reliability

## 📈 Scaling

- Vercel handles auto-scaling
- MongoDB Atlas auto-scales
- Redis can be upgraded as needed
- Stateless design supports horizontal scaling 