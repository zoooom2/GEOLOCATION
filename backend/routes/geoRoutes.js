const express = require('express');
const {
  createGeoFence,
  getFenceByCompanyID,
  updateFenceByUID,
  deleteFenceByUID,
} = require('../controllers/geoFenceController');
const { protect } = require('../controllers/authControllers');

const router = express.Router();

router.use(protect);

router.route('/').post(createGeoFence).get(getFenceByCompanyID);
router.route('/:uid').patch(updateFenceByUID).delete(deleteFenceByUID);

module.exports = router;
