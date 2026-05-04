const express        = require('express');
const cors           = require('cors');
const jobsRouter     = require('./routes/jobs');
const notesRouter    = require('./routes/notes');
const contactsRouter = require('./routes/contacts');
const tagsRouter     = require('./routes/tags');
const errorHandler   = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/jobs',              jobsRouter);
app.use('/api/jobs/:id/notes',    notesRouter);
app.use('/api/jobs/:id/contacts', contactsRouter);
app.use('/api/jobs/:id/tags',     tagsRouter);
app.use('/api/tags',              tagsRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;