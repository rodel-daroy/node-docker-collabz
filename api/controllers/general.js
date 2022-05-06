const moment = require('moment');
const axios = require('axios').default;

const Errors = require('../helpers/errors');

exports.submitContact = async (req, res, next) => {
  try {
    const email = req.body.email;
    const message = req.body.message;
    
    if (!email | !message) {
      throw Errors.EMAIL_FAILURE;
    }

    res.status(200).json();
  } catch(error) {
    next(error);
  }
}

exports.getCountry = async (req, res, next) => {
  try {
    let result = await axios.get(`http://api.ipstack.com/${req.ipAddress}?access_key=5827c8030b9dc98f73022d8eec8e5aea&format=1`);
    
    let countryCode = (result && result.data && result.data.country_code) ? result.data.country_code.toLowerCase() : 'us';

    res.status(200).json({ countryCode });
  } catch(error) {
    next(error);
  }
}
