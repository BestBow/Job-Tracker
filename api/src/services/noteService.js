const pool = require('../db/pool');

async function addNote(jobId, content) {
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
    'INSERT INTO notes (job_id, content) VALUES ($1, $2) RETURNING *',
    [jobId, content]
  );
  return rows[0];
}

async function getNotes(jobId) {
  const { rows } = await pool.query(
    'SELECT * FROM notes WHERE job_id = $1 ORDER BY created_at DESC',
    [jobId]
  );
  return rows;
}

async function deleteNote(noteId, jobId) {
  const { rowCount } = await pool.query(
    'DELETE FROM notes WHERE id = $1 AND job_id = $2',
    [noteId, jobId]
  );
  return rowCount > 0;
}

module.exports = { addNote, getNotes, deleteNote };