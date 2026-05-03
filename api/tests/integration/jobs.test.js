const request = require('supertest');
const app     = require('../../src/app');
const pool    = require('../../src/db/pool');

beforeAll(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY, company VARCHAR(255) NOT NULL, role VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'applied', job_url TEXT,
      salary_min INTEGER, salary_max INTEGER, location VARCHAR(255),
      is_remote BOOLEAN NOT NULL DEFAULT FALSE, applied_at DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      CONSTRAINT valid_status CHECK (status IN ('applied','screening','interview','offer','rejected','withdrawn'))
    );
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY, job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      content TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY, job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL, role VARCHAR(255), email VARCHAR(255),
      linkedin TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS tags (id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL UNIQUE);
    CREATE TABLE IF NOT EXISTS job_tags (
      job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (job_id, tag_id)
    );
  `);
});

afterEach(async () => {
  await pool.query('TRUNCATE jobs RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await pool.end();
});

async function createTestJob(overrides = {}) {
  const res = await request(app)
    .post('/api/jobs')
    .send({ company: 'Acme', role: 'Engineer', ...overrides });
  return res.body;
}

describe('POST /api/jobs', () => {
  it('creates a job and returns 201', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .send({ company: 'Google', role: 'SWE', is_remote: true });

    expect(res.status).toBe(201);
    expect(res.body.company).toBe('Google');
    expect(res.body.status).toBe('applied');
  });

  it('returns 400 when company is missing', async () => {
    const res = await request(app).post('/api/jobs').send({ role: 'SWE' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid job_url', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .send({ company: 'X', role: 'Y', job_url: 'not-a-url' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/jobs', () => {
  it('returns all active jobs', async () => {
    await createTestJob({ company: 'Google' });
    await createTestJob({ company: 'Stripe' });

    const res = await request(app).get('/api/jobs');
    expect(res.status).toBe(200);
    expect(res.body.jobs).toHaveLength(2);
  });

  it('filters by status', async () => {
    await createTestJob();
    await request(app).patch('/api/jobs/1/status').send({ status: 'interview' });

    const res = await request(app).get('/api/jobs?status=interview');
    expect(res.body.jobs).toHaveLength(1);
    expect(res.body.jobs[0].status).toBe('interview');
  });
});

describe('PATCH /api/jobs/:id/status', () => {
  it('moves job to a valid next status', async () => {
    await createTestJob();

    const res = await request(app)
      .patch('/api/jobs/1/status')
      .send({ status: 'interview' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('interview');
  });

  it('returns 400 for an invalid transition', async () => {
    await createTestJob();
    // First reject it
    await request(app).patch('/api/jobs/1/status').send({ status: 'rejected' });
    // Now try to go back to applied
    const res = await request(app)
      .patch('/api/jobs/1/status')
      .send({ status: 'applied' });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/jobs/:id', () => {
  it('soft deletes a job', async () => {
    await createTestJob();

    const del = await request(app).delete('/api/jobs/1');
    expect(del.status).toBe(204);

    const get = await request(app).get('/api/jobs/1');
    expect(get.status).toBe(404);
  });
});