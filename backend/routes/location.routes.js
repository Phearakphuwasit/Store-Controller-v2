const express = require('express');
const router = express.Router();
const { reverseGeocode } = require('../controllers/location.controller');

router.get('/reverse-geocode', reverseGeocode);

module.exports = router;
