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
      CONSTRAINT valid_status2 CHECK (status IN ('applied','screening','interview','offer','rejected','withdrawn'))
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

async function createTestJob() {
  const res = await request(app)
    .post('/api/jobs')
    .send({ company: 'Acme', role: 'Engineer' });
  return res.body;
}

describe('Notes', () => {
  it('adds a note to a job', async () => {
    const job = await createTestJob();
    const res = await request(app)
      .post(`/api/jobs/${job.id}/notes`)
      .send({ content: 'Great first interview' });

    expect(res.status).toBe(201);
    expect(res.body.content).toBe('Great first interview');
    expect(res.body.job_id).toBe(job.id);
  });

  it('returns 400 when content is missing', async () => {
    const job = await createTestJob();
    const res = await request(app)
      .post(`/api/jobs/${job.id}/notes`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('returns 404 when job does not exist', async () => {
    const res = await request(app)
      .post('/api/jobs/9999/notes')
      .send({ content: 'Ghost job' });
    expect(res.status).toBe(404);
  });

  it('lists all notes for a job', async () => {
    const job = await createTestJob();
    await request(app).post(`/api/jobs/${job.id}/notes`).send({ content: 'Note 1' });
    await request(app).post(`/api/jobs/${job.id}/notes`).send({ content: 'Note 2' });

    const res = await request(app).get(`/api/jobs/${job.id}/notes`);
    expect(res.status).toBe(200);
    expect(res.body.notes).toHaveLength(2);
  });

  it('deletes a note', async () => {
    const job  = await createTestJob();
    const note = await request(app)
      .post(`/api/jobs/${job.id}/notes`)
      .send({ content: 'Delete me' });

    const del = await request(app).delete(`/api/jobs/${job.id}/notes/${note.body.id}`);
    expect(del.status).toBe(204);

    const list = await request(app).get(`/api/jobs/${job.id}/notes`);
    expect(list.body.notes).toHaveLength(0);
  });
});

describe('Contacts', () => {
  it('adds a contact to a job', async () => {
    const job = await createTestJob();
    const res = await request(app)
      .post(`/api/jobs/${job.id}/contacts`)
      .send({ name: 'Jane Recruiter', email: 'jane@acme.com' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Jane Recruiter');
  });

  it('returns 400 for invalid email', async () => {
    const job = await createTestJob();
    const res = await request(app)
      .post(`/api/jobs/${job.id}/contacts`)
      .send({ name: 'Jane', email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('returns 404 when job does not exist', async () => {
    const res = await request(app)
      .post('/api/jobs/9999/contacts')
      .send({ name: 'Ghost' });
    expect(res.status).toBe(404);
  });
});

describe('Tags', () => {
  it('adds a tag to a job', async () => {
    const job = await createTestJob();
    const res = await request(app)
      .post(`/api/jobs/${job.id}/tags`)
      .send({ name: 'remote' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('remote');
  });

  it('does not duplicate tags', async () => {
    const job = await createTestJob();
    await request(app).post(`/api/jobs/${job.id}/tags`).send({ name: 'fintech' });
    await request(app).post(`/api/jobs/${job.id}/tags`).send({ name: 'fintech' });

    const { rows } = await pool.query(
      'SELECT * FROM job_tags WHERE job_id = $1',
      [job.id]
    );
    expect(rows).toHaveLength(1);
  });
});