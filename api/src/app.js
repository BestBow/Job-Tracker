const express      = require('express');
const cors         = require('cors');
const jobsRouter   = require('./routes/jobs');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/jobs', jobsRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;