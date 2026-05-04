const express = require('express');
const { addContact, getContacts, deleteContact } = require('../services/contactService');
const { validateId } = require('../middleware/validate');
const { body, validationResult } = require('express-validator');

const router = express.Router({ mergeParams: true });

const validateContact = [
  body('name').notEmpty().withMessage('Name is required').isLength({ max: 255 }),
  body('email').optional().isEmail().withMessage('Must be a valid email'),
  body('linkedin').optional().isURL().withMessage('Must be a valid URL'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

// GET /api/jobs/:id/contacts
router.get('/', ...validateId, async (req, res, next) => {
  try {
    const contacts = await getContacts(req.params.id);
    res.json({ contacts });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/:id/contacts
router.post('/', ...validateId, ...validateContact, async (req, res, next) => {
  try {
    const contact = await addContact(req.params.id, req.body);
    res.status(201).json(contact);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/jobs/:id/contacts/:contactId
router.delete('/:contactId', ...validateId, async (req, res, next) => {
  try {
    const deleted = await deleteContact(req.params.contactId, req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Contact not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;