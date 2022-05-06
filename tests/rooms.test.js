const app = require('../app').app;
const request = require('supertest')(app);
const expect = require('chai').expect;

const productData = require('./data/products.json');

describe('Products route', function () {

  let ADMIN_TOKEN;

  before(async function () {
    ADMIN_TOKEN = await request.post('/v1/users/login').send({email: 'admin@collabzapp.com', password: 'admin'}).expect(200).then(res => res.body.token);
  });

  it('should create, read, update, and deactivate', async function () {
    let body = {
      type: 'digital',
      name: 'Collabz Test Product',
      description: '',
      publicFiles: [],
      publicFilesLocal: [],
      privateFiles: [],
      privateFilesLocal: [],
      amount: 49,
      currency: 'usd',
      isSubscription: false,
      quantity: 1,
      quantityTimeFrame: 'week',
      address: '',
      coordinates: [],
      maxDistance: -1,
    };
    let createdProduct = await request.post('/v1/products').send(body).set('Authorization', ADMIN_TOKEN).expect(201).then(res => res.body);

    let product = await request.get(`/v1/products/${createdProduct._id}`).expect(200).then(res => res.body);

    expect(product.name).equal(body.name);
    expect(product.slug).not.null;

    let products = await request.get(`/v1/products`).expect(200).then(res => res.body);

    await request.put(`/v1/products/${product._id}/deactivate`).set('Authorization', ADMIN_TOKEN).expect(200);

    let afterDeactivated = await request.get(`/v1/products`).expect(200).then(res => res.body);
    expect(products.length - 1).equal(afterDeactivated.length);
  });

  it('should create a list of products', async function () {
    for (let i = 0; i < productData.length; i++) {
      await createProduct(productData[i].name, 'service');
    }
  });

  function createProduct(name, type) {
    let body = {
      type,
      name,
      description: '',
      publicFiles: [],
      publicFilesLocal: [],
      privateFiles: [],
      privateFilesLocal: [],
      amount: 49,
      currency: 'usd',
      isSubscription: false,
      quantity: 1,
      quantityTimeFrame: 'week',
      address: '',
      coordinates: [],
      maxDistance: -1,
    };
    return request.post('/v1/products').send(body).set('Authorization', ADMIN_TOKEN).expect(201);
  }

});
