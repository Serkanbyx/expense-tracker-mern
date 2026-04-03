const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { rateLimit } = require('express-rate-limit');

// --- Validate required environment variables ---
const requiredEnvVars = ['PORT', 'MONGO_URI', 'JWT_SECRET', 'JWT_EXPIRES_IN', 'CLIENT_URL'];
const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error(`FATAL: Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

const { PORT, MONGO_URI, CLIENT_URL, NODE_ENV } = process.env;

const app = express();

// --- Security-hardened middleware stack (order matters) ---

// 1. Secure HTTP headers
app.use(helmet());

// 2. CORS — restrict to the exact frontend origin
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// 3. Parse JSON body with size limit
app.use(express.json({ limit: '10kb' }));

// 4. Parse URL-encoded body with size limit
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// 5. Prevent NoSQL injection
app.use(mongoSanitize());

// 6. Prevent HTTP Parameter Pollution
app.use(hpp());

// --- Rate limiters ---

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);
app.use('/api/auth', authLimiter);

// --- Routes ---
const routes = require('./routes');
app.use('/api', routes);

// --- MongoDB connection & server start ---
mongoose.set('debug', NODE_ENV !== 'production');

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
