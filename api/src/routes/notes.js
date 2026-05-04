const express = require('express');
const { addNote, getNotes, deleteNote } = require('../services/noteService');
const { validateId } = require('../middleware/validate');
const { body, validationResult } = require('express-validator');

const router = express.Router({ mergeParams: true });

const validateNote = [
  body('content').notEmpty().withMessage('Content is required').isLength({ max: 2000 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

// GET /api/jobs/:id/notes
router.get('/', ...validateId, async (req, res, next) => {
  try {
    const notes = await getNotes(req.params.id);
    res.json({ notes });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/:id/notes
router.post('/', ...validateId, ...validateNote, async (req, res, next) => {
  try {
    const note = await addNote(req.params.id, req.body.content);
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/jobs/:id/notes/:noteId
router.delete('/:noteId', ...validateId, async (req, res, next) => {
  try {
    const deleted = await deleteNote(req.params.noteId, req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Note not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;