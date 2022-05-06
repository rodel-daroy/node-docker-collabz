const moment = require('moment');
const _ = require('lodash');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const Room = require('../models/room');
const User = require('../models/user');
const Errors = require('../helpers/errors');
const General = require('../helpers/general');
const { firestore, firestoreRef } = require('../helpers/firestore');
const { redis, clearCache } = require('../helpers/redis');
const Notification = require('../controllers/notifications');
const Follow = require('../models/follow');

exports.createRoom = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const name = req.body.name;

    const newRoom = new Room({
      creator: userId,
      hosts: [userId],
      name
    });
    const createdRoom = await newRoom.save();

    const followersData = await Follow.find({followee: userId, deactivated: null }).select('follower').lean().exec();

    if (followersData && followersData.length) {
      const followers = followersData.map(f => f.follower);
      await Notification.create(followers, userId, createdRoom._id, `started a new room "${name}".`, 'room');
    }

    res.status(201).json({ _id: createdRoom._id });
    clearCache('rooms');
  } catch(error) {
    next(error);
  }
}

exports.findRooms = async (req, res, next) => {
  try {

    let rooms = await Room.find({ ended: null, deactivated: null })
      .skip(req.skip).limit(req.limit)
      .populate({path: 'hosts', model: 'User', select: '_id fullName image'})
      .populate({path: 'guests', model: 'User', select: '_id fullName image'})
      .populate({path: 'queue', model: 'User', select: '_id fullName image'})
      .populate({path: 'recentAudience', model: 'User', select: '_id fullName image'})
      .lean().exec();

    res.status(200).json(rooms);
  } catch(error) {
    next(error);
  }
}

exports.getById = async (req, res, next) => {
  try {
    let roomId = req.params.roomId;

    let room = await Room.findOne({ _id: roomId, deactivated: null })
      .populate({path: 'hosts', model: 'User', select: '_id fullName image'})
      .populate({path: 'guests', model: 'User', select: '_id fullName image'})
      .populate({path: 'queue', model: 'User', select: '_id fullName image'})
      .populate({path: 'recentAudience', model: 'User', select: '_id fullName image'})
      .lean().exec();

    res.status(200).json(room);
  } catch(error) {
    next(error);
  }
}

exports.getToken = async (req, res, next) => {
  try {
    let user = req.user;
    let roomId = req.params.roomId;
    let isNewJoin = req.query.isNewJoin === 'true' ? true : false;

    let room = await Room.findOne({ _id: roomId, deactivated: null }).exec();
    if (!room || room.ended) {
      throw Errors.ROOM_ENDED;
    }

    let userRole = 'audience';
    if (room && room.hosts.map(h => h.toString()).indexOf(user._id.toString()) >= 0) {
      userRole = 'host';
    } else if (room && room.guests.map(h => h.toString()).indexOf(user._id.toString()) >= 0) {
      userRole = 'guest';
    } else if (room && room.queue.map(h => h.toString()).indexOf(user._id.toString()) >= 0) {
      userRole = 'queue';
    }

    // get role
    let role = RtcRole.SUBSCRIBER;
    if (userRole == 'host' || userRole == 'guest' || userRole == 'queue') {
      role = RtcRole.PUBLISHER;
    }

    // get the expire time
    let expireTime = req.query.expireTime;
    if (!expireTime || expireTime == '') {
      expireTime = 3600;
    } else {
      expireTime = parseInt(expireTime, 10);
    }

    // calculate privilege expire time
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;

    const AGORA_APP_ID = process.env.AGORA_APP_ID;
    const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

    const token = RtcTokenBuilder.buildTokenWithUid(AGORA_APP_ID, AGORA_APP_CERTIFICATE, roomId, user.numberId, role, privilegeExpireTime);

    if (isNewJoin == true) {
      const heartbeat = await redis.get('heartbeat:' + user._id + ':' + roomId);
      if (!heartbeat) {
        // only increment the count if there's no acctive heartbeat (i.e. if they refreshed their browser, don't count them twice)
        room.totalUsers = room.totalUsers + 1;
        if (userRole == 'audience' && room.recentAudience.length < 3 && room.recentAudience.map(r => r.toString()).indexOf(user._id.toString()) == -1) {
          room.recentAudience.push(user._id);
        }
        await room.save();
      }
    }
    
    try {
      redis.setex('heartbeat:' + user._id + ':' + roomId, 60 * 60 * 24, JSON.stringify({ // default to 24 hours
        userId: user._id,
        roomId,
        updated: moment().format()
      }));

      firestore.collection('rooms').doc(roomId).collection('users').doc(user._id).set({
        _id: user._id,
        numberId: user.numberId,
        fullName: user.fullName || '',
        image: user.image || '',
        username: user.username || '',
        bio: user.bio || '',
        role: userRole,
        followers: user.followers,
        following: user.following,
        audioOn: true,
        created: user.created
      });
    } catch(err) {
      console.log(err);
      throw Errors.SERVER;
    }

    return res.status(200).json({ token });
  } catch(error) {
    next(error);
  }
}

exports.sendHeartbeat = async (req, res, next) => {
  try {
    let userId = req.user._id;
    let roomId = req.params.roomId;

    redis.setex('heartbeat:' + userId + ':' + roomId, 60 * 60 * 24, JSON.stringify({ // default to 24 hours
      userId,
      roomId,
      updated: moment().format()
    }));

    return res.status(200).json();
  } catch(error) {
    next(error);
  }
}

exports.clap = async (req, res, next) => {
  try {
    let roomId = req.params.roomId;

    firestore.collection('rooms').doc(roomId).set({ claps: firestoreRef.FieldValue.increment(1) }, {merge: true});

    return res.status(200).json();
  } catch(error) {
    next(error);
  }
}

exports.leaveRoom = async (req, res, next) => {
  try {
    let userId = req.user._id;
    let roomId = req.params.roomId;

    firestore.collection('rooms').doc(roomId).collection('users').doc(userId.toString()).delete();

    let room = await Room.findOne({ _id: roomId }).exec();
    if (room) {
      room.hosts = room.hosts.filter(u => u.toString() != userId);
      room.guests = room.guests.filter(u => u.toString() != userId);
      room.queue = room.queue.filter(u => u.toString() != userId);
      room.hostInvites = room.hostInvites.filter(u => u.toString() != userId);
      room.guestInvites = room.guestInvites.filter(u => u.toString() != userId);
      room.queueInvites = room.queueInvites.filter(u => u.toString() != userId);
      room.recentAudience = room.recentAudience.filter(u => u.toString() != userId);
      if (room.hosts.length == 0 && room.guests.length == 0) {
        room.ended = moment().format();
      }
      let newTotalUsers = (room.totalUsers || 1) - 1;
      if (newTotalUsers < 0) {
        newTotalUsers = 0;
      }
      room.totalUsers = newTotalUsers;
      await room.save();
    }

    let key = 'heartbeat:' + userId + ':' + roomId;
    const heartbeat = await redis.get(key);
    if (heartbeat) {
      redis.del(key);
    }

    return res.status(200).json();
  } catch(error) {
    next(error);
  }
}

exports.changeUserRole = async (req, res, next) => {
  try {
    let userId = req.user._id;
    let roomId = req.params.roomId;
    let targetUserId = req.params.userId;
    let targetRole = req.body.role;

    let room = await Room.findOne({ _id: roomId, deactivated: null }).exec();
    if (!room) {
      throw Errors.NOT_FOUND;
    }
    
    let userRole = 'audience';
    if (room.hosts.map(u => u.toString()).indexOf(userId.toString()) >= 0) {
      userRole = 'host';
    } else if (room.guests.map(u => u.toString()).indexOf(userId.toString()) >= 0) {
      userRole = 'guest';
    } else if (room.queue.map(u => u.toString()).indexOf(userId.toString()) >= 0) {
      userRole = 'queue';
    }

    if (userRole == 'audience' || userRole == 'queue' || (userRole == 'guest' && targetRole == 'host') || (userRole == 'guest' && targetRole == 'guest')) {
      throw Errors.INVALID_AUTHORIZATION;
    }

    room.hosts = room.hosts.filter(u => u.toString() != targetUserId);
    room.guests = room.guests.filter(u => u.toString() != targetUserId);
    room.queue = room.queue.filter(u => u.toString() != targetUserId);
    room.recentAudience = room.recentAudience.filter(u => u.toString() != targetUserId);
    
    if (targetRole == 'host') {
      room.hosts.push(targetUserId);
    } else if (targetRole == 'guest') {
      room.guests.push(targetUserId);
    } else if (targetRole == 'queue') {
      room.queue.push(targetUserId);
    }

    await room.save();

    await firestore.collection('rooms').doc(roomId).collection('users').doc(targetUserId).set({role: targetRole}, {merge: true});

    res.status(200).json();
  } catch(error) {
    next(error);
  }
}

exports.inviteRole = async (req, res, next) => {
  try {
    let userId = req.user._id;
    let userFullName = req.user.fullName;
    let roomId = req.params.roomId;
    let targetUserId = req.params.userId;
    let targetRole = req.body.role;

    let room = await Room.findOne({ _id: roomId, deactivated: null }).exec();
    if (!room) {
      throw Errors.NOT_FOUND;
    }
    
    let userRole = 'audience';
    if (room.hosts.map(u => u.toString()).indexOf(userId.toString()) >= 0) {
      userRole = 'host';
    } else if (room.guests.map(u => u.toString()).indexOf(userId.toString()) >= 0) {
      userRole = 'guest';
    } else if (room.queue.map(u => u.toString()).indexOf(userId.toString()) >= 0) {
      userRole = 'queue';
    }

    if (userRole == 'audience' || userRole == 'queue' || (userRole == 'guest' && targetRole == 'host') || (userRole == 'guest' && targetRole == 'guest')) {
      throw Errors.INVALID_AUTHORIZATION;
    }

    room.hostInvites = room.hostInvites.filter(u => u.toString() != targetUserId);
    room.guestInvites = room.guestInvites.filter(u => u.toString() != targetUserId);
    room.queueInvites = room.queueInvites.filter(u => u.toString() != targetUserId);
    
    if (targetRole == 'host') {
      room.hostInvites.push(targetUserId);
    } else if (targetRole == 'guest') {
      room.guestInvites.push(targetUserId);
    } else if (targetRole == 'queue') {
      room.queueInvites.push(targetUserId);
    }

    await room.save();

    await firestore.collection('rooms').doc(roomId).collection('users').doc(targetUserId).set({inviteRole: targetRole, inviteFullName: userFullName}, {merge: true});

    res.status(200).json();
  } catch(error) {
    next(error);
  }
}

exports.acceptRole = async (req, res, next) => {
  try {
    let userId = req.user._id.toString();
    let roomId = req.params.roomId;

    let room = await Room.findOne({ _id: roomId, deactivated: null }).exec();
    if (!room) {
      throw Errors.NOT_FOUND;
    }

    room.hosts = room.hosts.filter(u => u.toString() != userId);
    room.guests = room.guests.filter(u => u.toString() != userId);
    room.queue = room.queue.filter(u => u.toString() != userId);
    room.recentAudience = room.recentAudience.filter(u => u.toString() != userId);

    let newRole = null;
    if (room.hostInvites.map(u => u.toString()).indexOf(userId) >= 0) {
      newRole = 'host';
      room.hosts.push(userId);
    } else if (room.guestInvites.map(u => u.toString()).indexOf(userId) >= 0) {
      newRole = 'guest';
      room.guests.push(userId);
    } else if (room.queueInvites.map(u => u.toString()).indexOf(userId) >= 0) {
      newRole = 'queue';
      room.queue.push(userId);
    }

    if (!newRole) {
      throw Errors.INVALID_INVITE;
    }

    room.hostInvites = room.hostInvites.filter(u => u.toString() != userId);
    room.guestInvites = room.guestInvites.filter(u => u.toString() != userId);
    room.queueInvites = room.queueInvites.filter(u => u.toString() != userId);

    await room.save();

    await firestore.collection('rooms').doc(roomId).collection('users').doc(userId).set({inviteRole: '', inviteFullName: '', role: newRole}, {merge: true});

    res.status(200).json();
  } catch(error) {
    next(error);
  }
}

exports.declineRole = async (req, res, next) => {
  try {
    let userId = req.user._id.toString();
    let roomId = req.params.roomId;

    let room = await Room.findOne({ _id: roomId, deactivated: null }).exec();
    if (!room) {
      throw Errors.NOT_FOUND;
    }

    room.hostInvites = room.hostInvites.filter(u => u.toString() != userId);
    room.guestInvites = room.guestInvites.filter(u => u.toString() != userId);
    room.queueInvites = room.queueInvites.filter(u => u.toString() != userId);

    await room.save();

    await firestore.collection('rooms').doc(roomId).collection('users').doc(userId).set({inviteRole: '', inviteFullName: ''}, {merge: true});

    res.status(200).json();
  } catch(error) {
    next(error);
  }
}

exports.audioOn = async (req, res, next) => {
  try {
    let userId = req.user._id;
    let roomId = req.params.roomId;

    firestore.collection('rooms').doc(roomId).collection('users').doc(userId).set({audioOn: true}, {merge: true});

    res.status(200).json();
  } catch(error) {
    next(error);
  }
}

exports.audioOff = async (req, res, next) => {
  try {
    let userId = req.user._id;
    let roomId = req.params.roomId;

    firestore.collection('rooms').doc(roomId).collection('users').doc(userId).set({audioOn: false}, {merge: true});

    res.status(200).json();
  } catch(error) {
    next(error);
  }
}

exports.deactivate = async (req, res, next) => {
  try {
    let userId = req.user._id;
    let roomId = req.params.roomId;

    await Room.updateOne({ _id: roomId, hosts: userId}, {deactivated: moment()}).exec();
    res.status(200).json();
    clearCache('rooms');
  } catch(error) {
    next(error);
  }
}
