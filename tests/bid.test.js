const request = require('supertest');
const app = require('../src/app');

let buyerToken;

beforeAll(async () => {
  // Login como comprador
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'carlos@test.com',
      password: 'password123'
    });
  
  buyerToken = res.body.token;
});

describe('Bid Endpoints', () => {
  describe('POST /api/bids', () => {
    it('should create bid with valid data', async () => {
      const res = await request(app)
        .post('/api/bids')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          auction_id: 1,
          amount: 18000
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('bid');
    });

    it('should fail with amount lower than current bid', async () => {
      const res = await request(app)
        .post('/api/bids')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          auction_id: 1,
          amount: 100
        });
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/bids/my-bids', () => {
    it('should get user bids', async () => {
      const res = await request(app)
        .get('/api/bids/my-bids')
        .set('Authorization', `Bearer ${buyerToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('bids');
      expect(Array.isArray(res.body.bids)).toBe(true);
    });
  });

  describe('GET /api/bids/auction/:auctionId', () => {
    it('should get auction bids', async () => {
      const res = await request(app).get('/api/bids/auction/1');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('bids');
    });
  });
});