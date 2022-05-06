const express = require('express');
const router = express.Router();

const authorized = require('../middleware/auth').authorized;
const optionalAuthorized = require('../middleware/auth').optionalAuthorized;
const audit = require('../middleware/auth').audit;
const allowRoles = require('../middleware/auth').allowRoles;
const ctrl = require('../controllers/users');


router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.post('/verifyCode', ctrl.verifyCode);
router.post('/resendCode', ctrl.resendCode);

router.get('/userInfo', authorized, ctrl.userInfo);
router.get('/:userId/publicInfo', authorized, ctrl.getPublicUserById);
router.get('/blocked', authorized, ctrl.getBlocked);

router.put('/image', authorized, ctrl.updateImage);
router.put('/email', authorized, ctrl.updateEmail);
router.put('/name', authorized, ctrl.updateName);
router.put('/username', authorized, ctrl.updateUsername);
router.put('/bio', authorized, ctrl.updateBio);
router.put('/block', authorized, ctrl.blockUser);
router.put('/unblock', authorized, ctrl.unblockUser);
router.put('/report', authorized, ctrl.reportUser);
router.put('/follow', authorized, ctrl.followUser);
router.put('/unfollow', authorized, ctrl.unfollowUser);


module.exports = router;
