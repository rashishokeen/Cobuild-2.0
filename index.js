'use strict';

require('dotenv').config();

const express      = require('express');
const path         = require('path');
const helmet       = require('helmet');
const cors         = require('cors');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');

// Routes
const contactRouter    = require('./routes/contact');
const waitlistRouter   = require('./routes/waitlist');
const newsletterRouter = require('./routes/newsletter');
const statsRouter      = require('./routes/stats');

// Initialise DB (runs schema creation on import)
require('./db/database');

const app  = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

// ── Security & Middleware ────────────────────────────────────────────────────

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:  ["'self'"],
        scriptSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        styleSrc:    ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
        fontSrc:     ["'self'", 'https://fonts.gstatic.com'],
        imgSrc:      ["'self'", 'data:'],
        connectSrc:  ["'self'"],
      },
    },
  })
);

app.use(cors({
  origin: isDev ? '*' : ['https://cobuild.in', 'https://www.cobuild.in'],
  methods: ['GET', 'POST'],
}));

app.use(morgan(isDev ? 'dev' : 'combined'));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Trust proxy (for accurate IPs behind nginx/Render/Railway etc.)
app.set('trust proxy', 1);

// ── Rate Limiting ────────────────────────────────────────────────────────────

const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
  max:      parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const formLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: { success: false, message: 'Too many submissions. Please wait a few minutes.' },
});

// ── Static Files ─────────────────────────────────────────────────────────────

app.use(express.static(path.join(__dirname, '..', 'public'), {
  maxAge: isDev ? 0 : '1d',
  etag:   true,
}));

// ── API Routes ───────────────────────────────────────────────────────────────

app.use('/api', apiLimiter);
app.use('/api/contact',    formLimiter, contactRouter);
app.use('/api/waitlist',   formLimiter, waitlistRouter);
app.use('/api/newsletter', formLimiter, newsletterRouter);
app.use('/api/stats',      statsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime().toFixed(1) + 's', env: process.env.NODE_ENV });
});

// ── SPA Fallback ─────────────────────────────────────────────────────────────

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ── Error Handler ─────────────────────────────────────────────────────────────

app.use((err, _req, res, _next) => {
  console.error('[Unhandled error]', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  🚀 CoBuild server running at http://localhost:${PORT}`);
  console.log(`  📦 Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  📧 Mail enabled: ${process.env.MAIL_ENABLED === 'true'}\n`);
});

module.exports = app;
