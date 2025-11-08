const request = require('supertest');
const app = require('../src/app');

let authToken;
let sellerId;

beforeAll(async () => {
  // Login para obtener token
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'monica@test.com',
      password: 'password123'
    });
  
  authToken = res.body.token;
  sellerId = res.body.user.id;
});

describe('Auction Endpoints', () => {
  describe('GET /api/auctions', () => {
    it('should get all active auctions', async () => {
      const res = await request(app).get('/api/auctions');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('auctions');
      expect(Array.isArray(res.body.auctions)).toBe(true);
    });
  });

  describe('POST /api/auctions', () => {
    it('should create auction with valid token', async () => {
      const res = await request(app)
        .post('/api/auctions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Auction',
          brand: 'Toyota',
          model: 'Corolla',
          year: 2021,
          description: 'Test description',
          base_price: 10000,
          end_time: new Date(Date.now() + 86400000).toISOString()
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('auction');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/auctions')
        .send({
          title: 'Test Auction',
          brand: 'Toyota',
          model: 'Corolla',
          year: 2021,
          base_price: 10000,
          end_time: new Date(Date.now() + 86400000).toISOString()
        });
      
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/auctions/:id', () => {
    it('should get auction by ID', async () => {
      const res = await request(app).get('/api/auctions/1');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('auction');
      expect(res.body.auction.id).toBe(1);
    });

    it('should return 404 for non-existent auction', async () => {
      const res = await request(app).get('/api/auctions/99999');
      
      expect(res.statusCode).toBe(404);
    });
  });
});