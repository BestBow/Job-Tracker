# Job Tracker

A full-stack job application tracker I built for myself because spreadsheets were driving me insane.

Track every application, move cards through your pipeline, add interview notes, log recruiter contacts — all in one place. Built as a portfolio project to showcase clean architecture, a three-tier test suite, and a UI I actually enjoy using.

> "Built out of pure necessity and a bit of tomfoolery." — me, losing track of my 47th application

---

## Live Demo

 <!-- not deployed yet -->

---

## Features

- **Kanban board** — drag cards across Applied → Screening → Interview → Offer → Rejected
- **State machine** — enforces valid status transitions on the backend
- **Notes per job** — log interview feedback, follow-ups, anything
- **Contacts per job** — save recruiter names, emails, LinkedIn profiles
- **Tags** — label jobs with remote, fintech, startup, etc.
- **Undo delete** — accidentally removed a job? You have 5 seconds to take it back
- **Search** — filter by company or role instantly
- **Stats bar** — total applied, response rate, offers at a glance

---

## Tech Stack

| Layer       | Tech                                          |
|-------------|-----------------------------------------------|
| Frontend    | React, Tailwind CSS, @dnd-kit, Vite           |
| Backend     | Node.js, Express                              |
| Database    | PostgreSQL                                    |
| Testing     | Jest, Supertest (unit + integration)          |
| CI          | GitHub Actions                                |
| Deployment  | Railway                                       |

---

## Project Structure
job-tracker/
├── api/
│   ├── src/
│   │   ├── db/
│   │   │   ├── migrations.sql      # Schema — jobs, notes, contacts, tags
│   │   │   └── pool.js             # pg connection pool
│   │   ├── middleware/
│   │   │   ├── validate.js         # express-validator rules
│   │   │   └── errorHandler.js     # centralized error handling
│   │   ├── routes/
│   │   │   ├── jobs.js             # CRUD + status transitions
│   │   │   ├── notes.js            # Notes per job
│   │   │   ├── contacts.js         # Contacts per job
│   │   │   └── tags.js             # Tags + many-to-many
│   │   ├── services/
│   │   │   ├── jobService.js       # Business logic
│   │   │   ├── noteService.js
│   │   │   └── contactService.js
│   │   ├── utils/
│   │   │   └── stateMachine.js     # Valid status transitions
│   │   ├── app.js                  # Express app (no listen — testable)
│   │   └── server.js               # Entrypoint
│   └── tests/
│       ├── unit/
│       │   ├── stateMachine.test.js   # Transition logic
│       │   ├── jobService.test.js     # Service layer, DB mocked
│       │   └── analyticsService.test.js
│       └── integration/
│           ├── jobs.test.js           # Full request → DB → response
│           └── notes.test.js          # Notes, contacts, tags
├── client/
│   └── src/
│       ├── api/jobs.js             # Axios API client
│       ├── hooks/useJobs.js        # Data fetching + optimistic updates
│       └── components/
│           ├── Column.jsx          # Kanban column with drop zone
│           ├── JobCard.jsx         # Draggable job card
│           ├── StatsBar.jsx        # Pipeline stats
│           ├── AddJobModal.jsx     # Add new application
│           ├── JobDetailPanel.jsx  # Notes + contacts slide-out
│           └── UndoToast.jsx       # 5-second undo on delete
├── scripts/
│   └── seed.sql                   # Local dev seed data
└── .github/
└── workflows/
└── ci.yml                 # Run all tests on every push

---

## Running Locally

**Prerequisites:** Node.js 20+, PostgreSQL

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/job-tracker.git
cd job-tracker

# 2. Set up the database
psql -U postgres -c "CREATE USER jobtracker WITH PASSWORD 'secret';"
psql -U postgres -c "CREATE DATABASE jobtracker OWNER jobtracker;"
psql -U postgres -c "CREATE DATABASE jobtracker_test OWNER jobtracker;"
psql postgres://jobtracker:secret@localhost:5432/jobtracker -f api/src/db/migrations.sql
psql postgres://jobtracker:secret@localhost:5432/jobtracker -f scripts/seed.sql

# 3. Start the API
cd api
cp .env.example .env
npm install
npm run dev

# 4. Start the frontend (new terminal)
cd client
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Running Tests

```bash
cd api

# Unit tests — no database needed, runs in ~1s
npm run test:unit

# Integration tests — requires Postgres running
npm run test:int

# All tests
npm test
```

**Test breakdown:**
- **Unit tests** — state machine transition logic, service layer with mocked DB
- **Integration tests** — full HTTP request → Express → PostgreSQL → response cycle

---

## Key Design Decisions

**`app.js` vs `server.js` separation**
The Express app is exported from `app.js` without calling `listen()`. `server.js` is the only file that starts the server. This means integration tests can import the app directly via Supertest without binding to a port — tests run faster and don't conflict with each other.

**State machine**
Job status transitions are enforced on the backend in `stateMachine.js`. Only terminal statuses (`rejected`, `withdrawn`) are locked — everything else can move freely so users can correct mistakes. The transition logic is pure and isolated, making it easy to unit test exhaustively.

**Optimistic updates**
When a card is dragged to a new column, the UI updates instantly before the API call completes. If the API call fails, the card snaps back. This makes the drag-and-drop feel instant even on slow connections.

**Soft delete with undo**
Deleting a job sets `is_active = false` rather than removing the row. A 5-second undo toast lets users restore it via `POST /api/jobs/:id/restore`. No data is ever permanently lost from a misclick.

---

## API Reference

| Method | Endpoint                      | Description                    |
|--------|-------------------------------|--------------------------------|
| GET    | `/api/jobs`                   | List all jobs (filter by status, search) |
| POST   | `/api/jobs`                   | Create a new application       |
| GET    | `/api/jobs/:id`               | Get job with notes + contacts  |
| PATCH  | `/api/jobs/:id`               | Update job fields              |
| PATCH  | `/api/jobs/:id/status`        | Move through state machine     |
| DELETE | `/api/jobs/:id`               | Soft delete                    |
| POST   | `/api/jobs/:id/restore`       | Undo delete                    |
| GET    | `/api/jobs/:id/notes`         | List notes                     |
| POST   | `/api/jobs/:id/notes`         | Add a note                     |
| DELETE | `/api/jobs/:id/notes/:noteId` | Delete a note                  |
| POST   | `/api/jobs/:id/contacts`      | Add a contact                  |
| POST   | `/api/jobs/:id/tags`          | Add a tag                      |

---

## License

MIT — use it, fork it, make it yours.