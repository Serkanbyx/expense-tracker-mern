const { Router } = require('express');
const authRoutes = require('./authRoutes');
const transactionRoutes = require('./transactionRoutes');

const router = Router();

// Health check endpoint for deployment monitoring (Render, uptime checks)
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);

module.exports = router;
