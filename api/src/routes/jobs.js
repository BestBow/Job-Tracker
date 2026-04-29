const express = require('express');
const router  = express.Router();

// placeholder — Phase 2 will fill this out
router.get('/', (_req, res) => {
  res.json({ jobs: [] });
});

module.exports = router;