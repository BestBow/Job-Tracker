const express = require('express');
const pool    = require('../db/pool');
const { validateId } = require('../middleware/validate');
const { body, validationResult } = require('express-validator');

const router = express.Router({ mergeParams: true });

const validateTag = [
  body('name').notEmpty().withMessage('Tag name is required').isLength({ max: 50 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

// GET /api/tags — list all available tags
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tags ORDER BY name ASC');
    res.json({ tags: rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/:id/tags — add tag to a job
router.post('/', ...validateId, ...validateTag, async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const { name } = req.body;

    // Upsert the tag
    const { rows: tagRows } = await pool.query(
      'INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING *',
      [name.toLowerCase().trim()]
    );
    const tag = tagRows[0];

    // Link to job
    await pool.query(
      'INSERT INTO job_tags (job_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [jobId, tag.id]
    );

    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/jobs/:id/tags/:tagId — remove tag from a job
router.delete('/:tagId', ...validateId, async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM job_tags WHERE job_id = $1 AND tag_id = $2',
      [req.params.id, req.params.tagId]
    );
    if (!rowCount) return res.status(404).json({ error: 'Tag not found on this job' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;