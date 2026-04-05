const request = require('supertest');
const { connectDB, disconnectDB, clearDB } = require('./setup');
const app = require('../app');

beforeAll(connectDB);
afterEach(clearDB);
afterAll(disconnectDB);

const validUser = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'Password123',
};

const registerUser = () =>
  request(app).post('/api/auth/register').send(validUser);

describe('POST /api/auth/register', () => {
  it('creates a new user and returns token', async () => {
    const res = await registerUser();

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      name: validUser.name,
      email: validUser.email,
    });
    expect(res.body.user.id).toBeDefined();
    expect(res.body.token).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
  });

  it('returns 409 for duplicate email', async () => {
    await registerUser();
    const res = await registerUser();

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already in use/i);
  });

  it('returns 400 for missing name', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'Password123' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'not-an-email', password: 'Password123' });

    expect(res.status).toBe(400);
  });

  it('returns 400 for short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'a@b.com', password: '123' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await registerUser();
  });

  it('logs in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.token).toBeDefined();
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'WrongPassword1' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it('returns 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Password123' });

    expect(res.status).toBe(401);
  });

  it('returns 400 for missing email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Password123' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  it('returns user data with valid token', async () => {
    const { body } = await registerUser();

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token-here');

    expect(res.status).toBe(401);
  });

  it('returns 401 with malformed header', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'NotBearer token');

    expect(res.status).toBe(401);
  });
});
