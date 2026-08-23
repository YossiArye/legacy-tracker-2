import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import * as store from '../store.js';

describe('priorities API', () => {
  beforeEach(() => {
    store.reset();
  });

  it('GET /api/priorities returns counts for every valid priority', async () => {
    await request(app).post('/api/tasks').send({ title: 'Low task', priority: 'low' });
    await request(app).post('/api/tasks').send({ title: 'High task A', priority: 'high' });
    await request(app).post('/api/tasks').send({ title: 'High task B', priority: 'high' });

    const res = await request(app).get('/api/priorities');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { priority: 'low', count: 1 },
      { priority: 'medium', count: 0 },
      { priority: 'high', count: 2 },
    ]);
  });

  it('GET /api/priorities?priority=high filters to just that priority', async () => {
    await request(app).post('/api/tasks').send({ title: 'High task', priority: 'high' });

    const res = await request(app).get('/api/priorities?priority=high');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ priority: 'high', count: 1 }]);
  });

  it('rejects an invalid priority filter', async () => {
    const res = await request(app).get('/api/priorities?priority=urgent');
    expect(res.status).toBe(400);
  });

  it('POST /api/priorities accepts a valid payload (scaffold, not implemented)', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .send({ title: 'Reprioritize me' });

    const res = await request(app)
      .post('/api/priorities')
      .send({ priority: 'high', taskIds: [created.body.id] });

    expect(res.status).toBe(501);
  });

  it('rejects a priority assignment with no taskIds', async () => {
    const res = await request(app)
      .post('/api/priorities')
      .send({ priority: 'high', taskIds: [] });

    expect(res.status).toBe(400);
  });

  it('PUT /api/priorities/:priority accepts a valid payload (scaffold, not implemented)', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .send({ title: 'Reprioritize me' });

    const res = await request(app)
      .put('/api/priorities/high')
      .send({ taskIds: [created.body.id] });

    expect(res.status).toBe(501);
  });

  it('rejects a priority replacement with an invalid priority param', async () => {
    const res = await request(app)
      .put('/api/priorities/urgent')
      .send({ taskIds: [] });

    expect(res.status).toBe(400);
  });
});
