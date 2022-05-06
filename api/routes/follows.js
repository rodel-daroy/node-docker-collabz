const express = require('express');
const router = express.Router();

const authorized = require('../middleware/auth').authorized;
const optionalAuthorized = require('../middleware/auth').optionalAuthorized;
const audit = require('../middleware/auth').audit;
const allowRoles = require('../middleware/auth').allowRoles;
const ctrl = require('../controllers/follows');


router.get('/:userId/followers', authorized, ctrl.findFollowers);
router.get('/:userId/following', authorized, ctrl.findFollowing);


module.exports = router;
