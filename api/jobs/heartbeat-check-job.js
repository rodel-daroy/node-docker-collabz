const moment = require('moment');
const { firestore } = require('../helpers/firestore');
const { getIsRedisConnected, redis } = require('../helpers/redis');

const Room = require('../models/room');


/**
 * Update redis and firestore for any dead heartbeats
 *
 */
module.exports = async (job, done) => {

  if (!getIsRedisConnected()) {
    return;
  }

  const keys = await redis.keys('heartbeat:*');

  for (const key of keys) {
    const heartbeat = JSON.parse(await redis.get(key));

    if (moment(heartbeat.updated).isBefore(moment().subtract(200, 'seconds'))) {
      let room = await Room.findOne({ _id: heartbeat.roomId }).exec();
      if (room) {
        room.hosts = room.hosts.filter(u => u.toString() != heartbeat.userId);
        room.guests = room.guests.filter(u => u.toString() != heartbeat.userId);
        room.queue = room.queue.filter(u => u.toString() != heartbeat.userId);
        room.hostInvites = room.hostInvites.filter(u => u.toString() != heartbeat.userId);
        room.guestInvites = room.guestInvites.filter(u => u.toString() != heartbeat.userId);
        room.queueInvites = room.queueInvites.filter(u => u.toString() != heartbeat.userId);
        room.recentAudience = room.recentAudience.filter(u => u.toString() != heartbeat.userId);
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
      await firestore.collection('rooms').doc(heartbeat.roomId).collection('users').doc(heartbeat.userId).delete();
      redis.del(key);
    }
  }

  return done();
};
