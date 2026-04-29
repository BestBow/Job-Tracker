CREATE TABLE IF NOT EXISTS jobs (
  id             SERIAL PRIMARY KEY,
  company        VARCHAR(255) NOT NULL,
  role           VARCHAR(255) NOT NULL,
  status         VARCHAR(50)  NOT NULL DEFAULT 'applied',
  job_url        TEXT,
  salary_min     INTEGER,
  salary_max     INTEGER,
  location       VARCHAR(255),
  is_remote      BOOLEAN      NOT NULL DEFAULT FALSE,
  applied_at     DATE         NOT NULL DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  is_active      BOOLEAN      NOT NULL DEFAULT TRUE,

  CONSTRAINT valid_status CHECK (
    status IN ('applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn')
  )
);

CREATE INDEX IF NOT EXISTS idx_jobs_status    ON jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_active    ON jobs (is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_applied   ON jobs (applied_at DESC);

-- Notes per job (interview notes, follow-ups etc)
CREATE TABLE IF NOT EXISTS notes (
  id         SERIAL PRIMARY KEY,
  job_id     INTEGER      NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  content    TEXT         NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_job_id ON notes (job_id);

-- Contacts per job (recruiter, hiring manager etc)
CREATE TABLE IF NOT EXISTS contacts (
  id         SERIAL PRIMARY KEY,
  job_id     INTEGER      NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  role       VARCHAR(255),
  email      VARCHAR(255),
  linkedin   TEXT,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_job_id ON contacts (job_id);

-- Tags (remote, fintech, senior etc) — many-to-many with jobs
CREATE TABLE IF NOT EXISTS tags (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS job_tags (
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (job_id, tag_id)
);

-- Auto-update updated_at on jobs
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();