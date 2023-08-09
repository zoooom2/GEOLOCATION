const express = require('express');
const { uploadPhoto } = require('../controllers/imageHandler');
const { createClient } = require('../controllers/clientController');

const router = express.Router();

router.post('/', uploadPhoto([], 'clientLogo'), createClient);
