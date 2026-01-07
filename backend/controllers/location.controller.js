const axios = require('axios');

exports.reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        message: 'Latitude and Longitude required',
      });
    }

    const response = await axios.get(
      'https://nominatim.openstreetmap.org/reverse',
      {
        params: {
          format: 'jsonv2',
          lat,
          lon: lng,
        },
        headers: {
          // REQUIRED by Nominatim policy
          'User-Agent': 'StoreController/1.0 (contact@yourdomain.com)',
        },
        timeout: 5000,
      }
    );

    const address = response.data.address || {};

    return res.json({
      city:
        address.city ||
        address.town ||
        address.village ||
        address.suburb ||
        'Unknown City',
      country: address.country || 'Unknown Country',
    });
  } catch (error) {
    console.error('Reverse Geocoding Error:', error.message);
    return res.status(500).json({
      city: 'Unknown',
      country: 'Unknown',
    });
  }
};
