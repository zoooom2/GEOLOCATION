const express = require('express');
const { createGeoFence } = require('../controllers/geoFenceController');
const { protect } = require('../controllers/authControllers');

const router = express.Router();

router.use(protect);

router.post('/', createGeoFence);

module.exports = router;
