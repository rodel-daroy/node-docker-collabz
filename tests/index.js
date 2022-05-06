const app = require('../app').app;
const request = require('supertest')(app);
const mongoose = require('../app').mongoose;

describe('Test setup', function () {

  it('should drop existing test database', async function () {
    this.timeout(10000);

    let error = null
    do {
      try {
        // wait 1 or more seconds for indexing to complete or else the drop will fail
        await new Promise(resolve => setTimeout(resolve, 1000));
        await mongoose.connection.dropDatabase();
        error = null;
      } catch(err) {
        error = err;
      }
    } while(error && error.errmsg && error.errmsg.indexOf('background operation') >= 0);
  });

  it('should create admin account', async function () {
    await request.post('/v1/users/signup').send({
      email: 'admin@collabzapp.com',
      password: 'admin',
      fullName: 'John Admin',
    }).expect(201).then(res => res.body);
    await mongoose.connection.collection('users').updateOne({email: 'admin@collabzapp.com'}, {$set: {role: 'admin'}});
  });

  it('should create customer account', async function () {
    await request.post('/v1/users/signup').send({
      email: 'customer@collabzapp.com',
      password: 'customer',
      fullName: 'John Customer',
    }).expect(201).then(res => res.body);
  });

});

describe('Run tests', function () {

  require('./users.test');
  require('./rooms.test');

});
