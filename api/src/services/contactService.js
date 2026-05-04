const pool = require('../db/pool');

async function addContact(jobId, { name, role, email, linkedin }) {
  const { rows: job } = await pool.query(
    'SELECT id FROM jobs WHERE id = $1 AND is_active = TRUE',
    [jobId]
  );
  if (job.length === 0) {
    const err = new Error('Job not found');
    err.status = 404;
    throw err;
  }

  const { rows } = await pool.query(
    `INSERT INTO contacts (job_id, name, role, email, linkedin)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [jobId, name, role ?? null, email ?? null, linkedin ?? null]
  );
  return rows[0];
}

async function getContacts(jobId) {
  const { rows } = await pool.query(
    'SELECT * FROM contacts WHERE job_id = $1 ORDER BY created_at ASC',
    [jobId]
  );
  return rows;
}

async function deleteContact(contactId, jobId) {
  const { rowCount } = await pool.query(
    'DELETE FROM contacts WHERE id = $1 AND job_id = $2',
    [contactId, jobId]
  );
  return rowCount > 0;
}

module.exports = { addContact, getContacts, deleteContact };