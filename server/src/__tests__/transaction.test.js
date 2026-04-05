const request = require('supertest');
const { connectDB, disconnectDB, clearDB } = require('./setup');
const app = require('../app');

beforeAll(connectDB);
afterEach(clearDB);
afterAll(disconnectDB);

let token;

const registerAndGetToken = async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test User', email: 'test@example.com', password: 'Password123' });
  return res.body.token;
};

const sampleTransaction = {
  type: 'expense',
  amount: 45.99,
  category: 'food',
  description: 'Groceries',
  date: '2026-03-15',
};

const authed = (method, url) => request(app)[method](url).set('Authorization', `Bearer ${token}`);

beforeEach(async () => {
  token = await registerAndGetToken();
});

/* ── CREATE ──────────────────────────────────────────── */

describe('POST /api/transactions', () => {
  it('creates a transaction', async () => {
    const res = await authed('post', '/api/transactions').send(sampleTransaction);

    expect(res.status).toBe(201);
    expect(res.body.transaction).toMatchObject({
      type: 'expense',
      amount: 45.99,
      category: 'food',
    });
    expect(res.body.transaction._id).toBeDefined();
  });

  it('returns 400 for missing required fields', async () => {
    const res = await authed('post', '/api/transactions').send({});

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 400 for invalid category', async () => {
    const res = await authed('post', '/api/transactions').send({
      ...sampleTransaction,
      category: 'invalid-category',
    });

    expect(res.status).toBe(400);
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).post('/api/transactions').send(sampleTransaction);

    expect(res.status).toBe(401);
  });
});

/* ── READ (List) ─────────────────────────────────────── */

describe('GET /api/transactions', () => {
  beforeEach(async () => {
    const transactions = [
      { ...sampleTransaction, amount: 10 },
      { ...sampleTransaction, type: 'income', amount: 500, category: 'salary' },
      { ...sampleTransaction, amount: 25, category: 'transport' },
    ];

    for (const t of transactions) {
      await authed('post', '/api/transactions').send(t);
    }
  });

  it('returns paginated transactions', async () => {
    const res = await authed('get', '/api/transactions');

    expect(res.status).toBe(200);
    expect(res.body.transactions).toHaveLength(3);
    expect(res.body.pagination).toMatchObject({
      currentPage: 1,
      totalCount: 3,
    });
  });

  it('respects page and limit params', async () => {
    const res = await authed('get', '/api/transactions?page=1&limit=2');

    expect(res.status).toBe(200);
    expect(res.body.transactions).toHaveLength(2);
    expect(res.body.pagination.totalPages).toBe(2);
    expect(res.body.pagination.hasNextPage).toBe(true);
  });

  it('filters by type', async () => {
    const res = await authed('get', '/api/transactions?type=income');

    expect(res.status).toBe(200);
    expect(res.body.transactions).toHaveLength(1);
    expect(res.body.transactions[0].type).toBe('income');
  });

  it('filters by category', async () => {
    const res = await authed('get', '/api/transactions?category=transport');

    expect(res.status).toBe(200);
    expect(res.body.transactions).toHaveLength(1);
  });

  it('returns 400 for invalid type filter', async () => {
    const res = await authed('get', '/api/transactions?type=invalid');

    expect(res.status).toBe(400);
  });
});

/* ── READ (Single) ───────────────────────────────────── */

describe('GET /api/transactions/:id', () => {
  it('returns a transaction by id', async () => {
    const { body } = await authed('post', '/api/transactions').send(sampleTransaction);

    const res = await authed('get', `/api/transactions/${body.transaction._id}`);

    expect(res.status).toBe(200);
    expect(res.body.transaction.amount).toBe(45.99);
  });

  it('returns 404 for non-existent id', async () => {
    const res = await authed('get', '/api/transactions/507f1f77bcf86cd799439011');

    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid id format', async () => {
    const res = await authed('get', '/api/transactions/not-a-valid-id');

    expect(res.status).toBe(400);
  });
});

/* ── UPDATE ──────────────────────────────────────────── */

describe('PUT /api/transactions/:id', () => {
  it('updates a transaction', async () => {
    const { body } = await authed('post', '/api/transactions').send(sampleTransaction);
    const id = body.transaction._id;

    const res = await authed('put', `/api/transactions/${id}`).send({ amount: 99.99 });

    expect(res.status).toBe(200);
    expect(res.body.transaction.amount).toBe(99.99);
    expect(res.body.transaction.category).toBe('food');
  });

  it('returns 404 when updating non-existent transaction', async () => {
    const res = await authed('put', '/api/transactions/507f1f77bcf86cd799439011').send({
      amount: 10,
    });

    expect(res.status).toBe(404);
  });
});

/* ── DELETE ──────────────────────────────────────────── */

describe('DELETE /api/transactions/:id', () => {
  it('deletes a transaction', async () => {
    const { body } = await authed('post', '/api/transactions').send(sampleTransaction);
    const id = body.transaction._id;

    const res = await authed('delete', `/api/transactions/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);

    const verify = await authed('get', `/api/transactions/${id}`);
    expect(verify.status).toBe(404);
  });

  it('returns 404 when deleting non-existent transaction', async () => {
    const res = await authed('delete', '/api/transactions/507f1f77bcf86cd799439011');

    expect(res.status).toBe(404);
  });
});

/* ── SUMMARY ─────────────────────────────────────────── */

describe('GET /api/transactions/summary', () => {
  it('returns income/expense/net totals', async () => {
    await authed('post', '/api/transactions').send({
      ...sampleTransaction,
      type: 'income',
      amount: 1000,
      category: 'salary',
    });
    await authed('post', '/api/transactions').send({
      ...sampleTransaction,
      type: 'expense',
      amount: 300,
    });

    const res = await authed('get', '/api/transactions/summary');

    expect(res.status).toBe(200);
    expect(res.body.totalIncome).toBe(1000);
    expect(res.body.totalExpense).toBe(300);
    expect(res.body.netBalance).toBe(700);
  });

  it('returns zeros when no transactions exist', async () => {
    const res = await authed('get', '/api/transactions/summary');

    expect(res.status).toBe(200);
    expect(res.body.totalIncome).toBe(0);
    expect(res.body.totalExpense).toBe(0);
    expect(res.body.netBalance).toBe(0);
  });
});

/* ── USER ISOLATION ──────────────────────────────────── */

describe('User isolation', () => {
  it("cannot access another user's transactions", async () => {
    const { body } = await authed('post', '/api/transactions').send(sampleTransaction);
    const txId = body.transaction._id;

    const otherRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Other', email: 'other@example.com', password: 'Password123' });
    const otherToken = otherRes.body.token;

    const res = await request(app)
      .get(`/api/transactions/${txId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(404);
  });
});
