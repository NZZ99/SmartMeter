# SmartMeter Pro - AI Widget Setup Guide

## 📋 Overview

This guide explains how to set up and run the Assistive Touch AI Widget on your SmartMeter Pro application. The widget provides an iPhone-style floating button with integrated Gemini AI chat functionality.

## ✨ What's New

| File | Purpose |
|------|---------|
| `ai-widget.js` | Vanilla JavaScript widget component (frontend) |
| `server.js` | Express.js backend server with Gemini API integration |
| `package.json` | Node.js dependencies |
| `.env.example` | Environment variables template |
| `.gitignore` | Git ignore rules (prevents API key exposure) |

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- `@google/generative-ai` - Gemini API client
- `express` - Web server
- `cors` - Cross-origin requests
- `dotenv` - Environment variables
- `express-rate-limit` - Rate limiting

### Step 2: Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key

### Step 3: Create .env File

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=AIzaSyCrsVVI3mKVRbWOsPQKQrAQesvigN9JTho
PORT=3000
NODE_ENV=development
```

**IMPORTANT:** Never commit `.env` to GitHub! It's already in `.gitignore`.

### Step 4: Start the Server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

The server will start on `http://localhost:3000`

### Step 5: Test the Widget

1. Open your browser to `http://localhost:3000`
2. Look for the floating purple button in the bottom-right corner
3. Click it to open the AI chat widget
4. Type a message and press Enter

## 🔒 Security

### How API Key is Protected

```
Frontend (Widget)
    ↓
    └─→ POST /api/chat (your backend)
            ↓
            └─→ Gemini API (with API key)
```

**Why this is secure:**
- ❌ API key is NOT in frontend code
- ❌ API key is NOT in GitHub
- ✅ API key stays on your server only
- ✅ Frontend never sees the API key

### Best Practices

1. **Never hardcode API keys** in JavaScript
2. **Always use `.env` file** for secrets
3. **Add `.env` to `.gitignore`** (already done)
4. **Rotate API key** if accidentally exposed
5. **Use HTTPS** in production

### If You Accidentally Commit Your API Key

1. **Immediately rotate** the key in Google Cloud Console
2. **Remove from git history:**
   ```bash
   git filter-branch --tree-filter 'rm -f .env' HEAD
   git push origin --force-with-lease
   ```
3. **Generate a new key** and update `.env`

## 📝 File Descriptions

### ai-widget.js
- Vanilla JavaScript widget component
- Creates floating button and chat interface
- Handles user interactions
- Sends messages to backend API
- No external dependencies (pure JavaScript)

### server.js
- Express.js backend server
- Handles `/api/chat` endpoint
- Calls Gemini API with your API key
- Includes rate limiting and error handling
- Serves static files

### package.json
- Lists all Node.js dependencies
- Defines npm scripts
- Specifies Node.js version requirements

### .env.example
- Template showing required environment variables
- Copy to `.env` and fill in your actual values
- Never commit `.env` to GitHub

### .gitignore
- Prevents `.env` from being committed
- Ignores node_modules and build files
- Protects your API key

## 🎨 Customization

### Change Widget Position

Edit `ai-widget.js` and find:

```javascript
bottom: 30px;  // Distance from bottom
right: 30px;   // Distance from right
```

### Change Widget Colors

Edit `ai-widget.js` and find:

```javascript
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

Replace with your colors:
```javascript
background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
```

### Change System Prompt

Edit `server.js` and find:

```javascript
const systemPrompt = `You are a helpful AI assistant for SmartMeter Pro...`;
```

Customize the prompt for your needs.

## 🚢 Deployment

### Deploy to Heroku

1. Create `Procfile`:
   ```
   web: node server.js
   ```

2. Push to Heroku:
   ```bash
   heroku create your-app-name
   heroku config:set GEMINI_API_KEY=your_key
   git push heroku main
   ```

### Deploy to Vercel (with serverless function)

1. Create `api/chat.js`:
   ```javascript
   // Similar to server.js but as a serverless function
   ```

2. Deploy:
   ```bash
   vercel
   ```

### Deploy to Railway

1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy

## 🐛 Troubleshooting

### Widget Not Appearing

- Check browser console for errors
- Verify `ai-widget.js` is loaded
- Check that styles are applied

### "Failed to get response" Error

- Verify server is running: `http://localhost:3000/api/health`
- Check `.env` file has `GEMINI_API_KEY`
- Look for CORS errors in browser console
- Check server logs for errors

### API Key Exposed

1. Rotate key immediately in Google Cloud Console
2. Remove from git history (see Security section)
3. Generate new key and update `.env`

### Rate Limit Exceeded

- Default limit is 100 requests per 15 minutes
- Edit `server.js` to adjust:
  ```javascript
  max: 100, // Change this number
  ```

## 📊 API Specification

### Request

```
POST /api/chat
Content-Type: application/json

{
  "message": "What is energy consumption?"
}
```

### Response (Success)

```json
{
  "reply": "Energy consumption refers to...",
  "timestamp": "2024-05-12T10:30:00.000Z"
}
```

### Response (Error)

```json
{
  "error": "Failed to generate response. Please try again later."
}
```

## 📚 Resources

- [Google Generative AI Documentation](https://ai.google.dev/docs)
- [Gemini API Guide](https://ai.google.dev/tutorials/python_quickstart)
- [Express.js Documentation](https://expressjs.com/)
- [Environment Variables Best Practices](https://12factor.net/config)

## 💡 Tips

- **Development**: Use `npm run dev` for auto-restart on file changes
- **Testing**: Use `curl` to test API:
  ```bash
  curl -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"Hello"}'
  ```
- **Logging**: Check server console for request logs
- **Caching**: Consider caching common responses for better performance

## 🤝 Support

For issues:
1. Check this guide first
2. Review server logs
3. Check browser console for errors
4. Verify `.env` file is set up correctly

---

**Remember:** Never commit your `.env` file to GitHub! 🔐

Happy coding! 🚀
