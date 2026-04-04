/**
 * Global error handling middlewares.
 * Must be mounted AFTER all route definitions in index.js.
 */

const notFound = (req, res, _next) => {
  res.status(404).json({ message: 'Route not found' });
};

const errorHandler = (err, _req, res, _next) => {
  const isDev = process.env.NODE_ENV !== 'production';

  // --- Mongoose CastError (invalid ObjectId, etc.) ---
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  // --- Mongoose ValidationError ---
  if (err.name === 'ValidationError') {
    const fieldMessages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation failed', errors: fieldMessages });
  }

  // --- MongoDB duplicate key (code 11000) ---
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate field value' });
  }

  // --- Determine status code ---
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const isOperationalError = err.isOperational || statusCode < 500;

  if (isDev) {
    console.error(err.stack);
    return res.status(statusCode).json({
      message: err.message,
      stack: err.stack,
    });
  }

  // --- Production ---
  console.error(err);

  if (isOperationalError) {
    return res.status(statusCode).json({ message: err.message });
  }

  res.status(500).json({ message: 'Internal server error' });
};

module.exports = { notFound, errorHandler };
