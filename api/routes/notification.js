const express = require('express');
const router = express.Router();

const authorized = require('../middleware/auth').authorized;
const ctrl = require('../controllers/notifications');


router.get('/user', authorized, ctrl.findByUser);


module.exports = router;
