/**
 * SmartMeter AI Backend Server
 * 
 * This server:
 * - Keeps your Gemini API key secure (never exposed to frontend)
 * - Handles chat requests from the AI widget
 * - Includes rate limiting and error handling
 * - Prevents API key exposure on GitHub
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware Configuration
// ============================================

// CORS - Allow requests from your frontend
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://nzz99.github.io', // Your GitHub Pages domain
      'https://yourdomain.com', // Replace with your domain if you have one
    ],
    credentials: true,
  })
);

// JSON body parser
app.use(express.json({ limit: '1mb' }));

// Serve static files from public directory
app.use(express.static('public'));

// Rate limiting - Prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// ============================================
// Gemini AI Setup
// ============================================

// Verify API key is set
if (!process.env.GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY environment variable is not set!');
  console.error('Please create a .env file with: GEMINI_API_KEY=your_key_here');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ============================================
// API Routes
// ============================================

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Chat endpoint - Main AI integration
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // Validation
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (typeof message !== 'string') {
      return res.status(400).json({ error: 'Message must be a string' });
    }

    if (message.length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (message.length > 5000) {
      return res.status(400).json({ error: 'Message is too long (max 5000 characters)' });
    }

    // Sanitize message (basic XSS prevention)
    const sanitizedMessage = message
      .trim()
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    console.log(`[${new Date().toISOString()}] Processing message from ${req.ip}`);

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Optional: Add system prompt for context
    const systemPrompt = `You are a helpful AI assistant for SmartMeter Pro, 
    an energy management platform. Provide clear, concise answers about 
    energy consumption, smart meters, and related topics. Keep responses 
    under 500 characters when possible. Respond in the same language as the user.`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: sanitizedMessage },
    ]);

    const response = await result.response;
    const text = response.text();

    console.log(`[${new Date().toISOString()}] Successfully generated response`);

    res.json({
      reply: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] API Error:`, error);

    // Don't expose internal error details to client
    const statusCode = error.status || 500;
    const message =
      error.message?.includes('API_KEY')
        ? 'Server configuration error'
        : 'Failed to generate response. Please try again later.';

    res.status(statusCode).json({ error: message });
  }
});

// ============================================
// Error Handling
// ============================================

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// Server Startup
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   SmartMeter AI Server Started             ║
║   Port: ${PORT}                                ║
║   API Key: ${process.env.GEMINI_API_KEY ? '✓ Configured' : '✗ Missing'}          ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
╚════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
