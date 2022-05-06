const express = require('express');
const router = express.Router();

const authorized = require('../middleware/auth').authorized;
const optionalAuthorized = require('../middleware/auth').optionalAuthorized;
const audit = require('../middleware/auth').audit;
const allowRoles = require('../middleware/auth').allowRoles;
const ctrl = require('../controllers/rooms');


router.post('/', authorized, ctrl.createRoom);

router.get('/', ctrl.findRooms);
router.get('/:roomId', ctrl.getById);
router.get('/:roomId/token', authorized, ctrl.getToken);

router.put('/:roomId/heartbeat', authorized, ctrl.sendHeartbeat);
router.put('/:roomId/leave', authorized, ctrl.leaveRoom);
router.put('/:roomId/clap', authorized, ctrl.clap);
router.put('/:roomId/deactivate', authorized, ctrl.deactivate);
router.put('/:roomId/role/accept', authorized, ctrl.acceptRole);
router.put('/:roomId/role/decline', authorized, ctrl.declineRole);
router.put('/:roomId/audio/on', authorized, ctrl.audioOn);
router.put('/:roomId/audio/off', authorized, ctrl.audioOff);
router.put('/:roomId/user/:userId/role', authorized, ctrl.changeUserRole);
router.put('/:roomId/user/:userId/role/invite', authorized, ctrl.inviteRole);


module.exports = router;
