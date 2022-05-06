const express = require('express');
const router = express.Router();

const authorized = require('../middleware/auth').authorized;
const optionalAuthorized = require('../middleware/auth').optionalAuthorized;
const audit = require('../middleware/auth').audit;
const allowRoles = require('../middleware/auth').allowRoles;
const ctrl = require('../controllers/comments');


router.post('/', authorized, ctrl.createComment);


module.exports = router;
