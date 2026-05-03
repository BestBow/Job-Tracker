const { body, param, validationResult } = require('express-validator');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const validateJob = [
  body('company').notEmpty().withMessage('Company is required').isLength({ max: 255 }),
  body('role').notEmpty().withMessage('Role is required').isLength({ max: 255 }),
  body('job_url').optional().isURL().withMessage('Must be a valid URL'),
  body('salary_min').optional().isInt({ min: 0 }).withMessage('Must be a positive number'),
  body('salary_max').optional().isInt({ min: 0 }).withMessage('Must be a positive number'),
  body('applied_at').optional().isISO8601().withMessage('Must be a valid date'),
  body('is_remote').optional().isBoolean(),
  handleValidationErrors,
];

const validateStatus = [
  body('status')
    .notEmpty()
    .isIn(['applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'])
    .withMessage('Invalid status'),
  handleValidationErrors,
];

const validateId = [
  param('id').isInt({ min: 1 }).withMessage('Invalid ID'),
  handleValidationErrors,
];

module.exports = { validateJob, validateStatus, validateId };