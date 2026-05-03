const pool = require('../db/pool');
const { canTransition, getValidTransitions } = require('../utils/stateMachine');

async function createJob({ company, role, job_url, salary_min, salary_max, location, is_remote, applied_at }) {
  const { rows } = await pool.query(
    `INSERT INTO jobs (company, role, job_url, salary_min, salary_max, location, is_remote, applied_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [company, role, job_url ?? null, salary_min ?? null, salary_max ?? null, location ?? null, is_remote ?? false, applied_at ?? new Date()]
  );
  return rows[0];
}

async function listJobs({ status, is_remote, search } = {}) {
  const conditions = ['j.is_active = TRUE'];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`j.status = $${values.length}`);
  }
  if (is_remote !== undefined) {
    values.push(is_remote);
    conditions.push(`j.is_remote = $${values.length}`);
  }
  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(j.company ILIKE $${values.length} OR j.role ILIKE $${values.length})`);
  }

  const where = conditions.join(' AND ');

  const { rows } = await pool.query(
    `SELECT j.*,
       COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tags
     FROM jobs j
     LEFT JOIN job_tags jt ON jt.job_id = j.id
     LEFT JOIN tags t      ON t.id = jt.tag_id
     WHERE ${where}
     GROUP BY j.id
     ORDER BY j.applied_at DESC`,
    values
  );
  return rows;
}

async function getJobById(id) {
  const { rows } = await pool.query(
    `SELECT j.*,
       COALESCE(json_agg(DISTINCT jsonb_build_object('id', n.id, 'content', n.content, 'created_at', n.created_at))
         FILTER (WHERE n.id IS NOT NULL), '[]') AS notes,
       COALESCE(json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name, 'role', c.role, 'email', c.email, 'linkedin', c.linkedin))
         FILTER (WHERE c.id IS NOT NULL), '[]') AS contacts,
       COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tags
     FROM jobs j
     LEFT JOIN notes    n  ON n.job_id = j.id
     LEFT JOIN contacts c  ON c.job_id = j.id
     LEFT JOIN job_tags jt ON jt.job_id = j.id
     LEFT JOIN tags     t  ON t.id = jt.tag_id
     WHERE j.id = $1 AND j.is_active = TRUE
     GROUP BY j.id`,
    [id]
  );
  return rows[0] ?? null;
}

async function updateJobStatus(id, newStatus) {
  // Fetch current status first
  const { rows } = await pool.query('SELECT status FROM jobs WHERE id = $1 AND is_active = TRUE', [id]);
  if (rows.length === 0) {
    const err = new Error('Job not found');
    err.status = 404;
    throw err;
  }

  const currentStatus = rows[0].status;
  if (!canTransition(currentStatus, newStatus)) {
    const err = new Error(
      `Cannot move from '${currentStatus}' to '${newStatus}'. Valid transitions: ${getValidTransitions(currentStatus).join(', ') || 'none'}`
    );
    err.status = 400;
    throw err;
  }

  const { rows: updated } = await pool.query(
    'UPDATE jobs SET status = $1 WHERE id = $2 RETURNING *',
    [newStatus, id]
  );
  return updated[0];
}

async function updateJob(id, fields) {
  const allowed = ['company', 'role', 'job_url', 'salary_min', 'salary_max', 'location', 'is_remote', 'applied_at'];
  const updates = [];
  const values  = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      values.push(fields[key]);
      updates.push(`${key} = $${values.length}`);
    }
  }

  if (updates.length === 0) {
    const err = new Error('No valid fields to update');
    err.status = 400;
    throw err;
  }

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE jobs SET ${updates.join(', ')} WHERE id = $${values.length} AND is_active = TRUE RETURNING *`,
    values
  );

  if (rows.length === 0) {
    const err = new Error('Job not found');
    err.status = 404;
    throw err;
  }
  return rows[0];
}

async function deleteJob(id) {
  const { rowCount } = await pool.query(
    'UPDATE jobs SET is_active = FALSE WHERE id = $1 AND is_active = TRUE',
    [id]
  );
  return rowCount > 0;
}

module.exports = { createJob, listJobs, getJobById, updateJobStatus, updateJob, deleteJob };