const express = require('express');
const { uploadPhoto } = require('../controllers/imageHandler');
const {
  createClient,
  getAllClients,
  getClient,
  getClientBySID,
} = require('../controllers/clientController');
const { protect, restrictTo } = require('../controllers/authControllers');

const router = express.Router();

router.use(protect);
router.get('/', getClientBySID);

router.use(restrictTo('admin', 'master'));
router.post('/', uploadPhoto(['logo'], 'client'), createClient);
router.get('/:id', getClient);

router.get('/', getAllClients);

module.exports = router;
