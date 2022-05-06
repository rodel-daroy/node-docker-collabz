const express = require('express');
const router = express.Router();

const audit = require('../middleware/auth').audit;
const ctrl = require('../controllers/general');


router.post('/contact', audit, ctrl.submitContact);

router.get('/country', audit, ctrl.getCountry);


module.exports = router;
