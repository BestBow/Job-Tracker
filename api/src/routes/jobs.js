const express = require('express');
const {
  createJob, listJobs, getJobById,
  updateJobStatus, updateJob, deleteJob
} = require('../services/jobService');
const { validateJob, validateStatus, validateId } = require('../middleware/validate');

const router = express.Router();
const pool = require('../db/pool');

router.get('/', async (req, res, next) => {
  try {
    const { status, is_remote, search, active } = req.query;
    const jobs = await listJobs({
      status:    status    ?? null,
      is_remote: is_remote !== undefined ? is_remote === 'true' : undefined,
      search:    search    ?? null,
      active:    active === 'false' ? false : true,
    });
    res.json({ jobs });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', ...validateId, async (req, res, next) => {
  try {
    const job = await getJobById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    next(err);
  }
});

router.post('/', ...validateJob, async (req, res, next) => {
  try {
    const job = await createJob(req.body);
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', ...validateId, async (req, res, next) => {
  try {
    const job = await updateJob(req.params.id, req.body);
    res.json(job);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', ...validateId, ...validateStatus, async (req, res, next) => {
  try {
    const job = await updateJobStatus(req.params.id, req.body.status);
    res.json(job);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', ...validateId, async (req, res, next) => {
  try {
    const deleted = await deleteJob(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Job not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/:id/restore — bring back a soft-deleted job
router.post('/:id/restore', ...validateId, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'UPDATE jobs SET is_active = TRUE WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Job not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;