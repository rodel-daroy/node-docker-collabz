const app = require('../app').app;
const request = require('supertest')(app);
const expect = require('chai').expect;

const userData = require('./data/users.json');

describe('Users route', function () {

  let ADMIN_TOKEN;

  before(async function () {
    ADMIN_TOKEN = await request.post('/v1/users/login').send({email: 'admin@collabzapp.com', password: 'admin'}).expect(200).then(res => res.body.token);
  });

  it('should create, read, update, and deactivate', async function () {
    let body = { email: 'customertest@collabzapp.com', password: 'abcd1234', fullName: 'Test Customer', stripeCustomerIds: ['cust_abcd1234', 'cust_abcd2345'] };
    let createdUser = await request.post('/v1/users/signup').send(body).set('Authorization', ADMIN_TOKEN).expect(201).then(res => res.body);

    await request.get(`/v1/users/${createdUser._id}`).expect(403);
    let user = await request.get(`/v1/users/${createdUser._id}`).set('Authorization', ADMIN_TOKEN).expect(200).then(res => res.body);

    expect(user.email).equal(body.email);
    expect(user.password.length).greaterThan(body.password.length);
    expect(user.fullName).equal(body.fullName);
    expect(user.slug).not.null;
    expect(user.oldEmails.length).equal(1);

    let existingUser = await request.get(`/v1/users/${user._id}`).set('Authorization', ADMIN_TOKEN).expect(200).then(res => res.body);
    expect(existingUser).not.null;

    await request.put(`/v1/users/${user._id}/deactivate`).set('Authorization', ADMIN_TOKEN).expect(200);

    let afterDeactivated = await request.get(`/v1/users/${user._id}`).set('Authorization', ADMIN_TOKEN).expect(200).then(res => res.body);
    expect(afterDeactivated).null;
  });

  it('should create a list of users', async function () {
    this.timeout(120000);
    
    for (let i = 0; i < userData.length; i++) {
      let email = `customer${i + 1}@collabzapp.com`;
      let password = 'abcd1234';
      let phoneNumber = '15555555555';
      let recommendedCourseIds = [];

      let error = null;
      let errorCount = 0;
      do {
        try {
          await createUser(email, password, userData[i].firstName + ' Customer', userData[i].image, phoneNumber, userData[i].stripeCustomerIds, recommendedCourseIds, userData[i].created['$date']);
          error = null;
        } catch(err) {
          errorCount++;
          console.log('errorCount=', errorCount);
          if (errorCount > 5) {
            throw err;
          }
          error = err;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } while(error);
    }
  });

  function createUser(email, password, fullName, image, created) {
    let body = { email, password, fullName, image, created };
    return request.post('/v1/users/signup').send(body).set('Authorization', ADMIN_TOKEN).expect(201);
  }

});
