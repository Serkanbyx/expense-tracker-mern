const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');

// --- Validate required environment variables ---
const requiredEnvVars = ['PORT', 'MONGO_URI', 'JWT_SECRET', 'JWT_EXPIRES_IN', 'CLIENT_URL'];
const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error(`FATAL: Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

const app = require('./app');

const { PORT, MONGO_URI, NODE_ENV } = process.env;

// --- MongoDB connection & server start ---
mongoose.set('debug', NODE_ENV !== 'production');

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.info('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.info(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
