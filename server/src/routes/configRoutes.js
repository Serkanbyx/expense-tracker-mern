const { Router } = require('express');
const { getConfig } = require('../controllers/configController');

const router = Router();

router.get('/', getConfig);

module.exports = router;
