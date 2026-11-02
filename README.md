# LearnPath AI — React Frontend

A Vite + React 18 SPA for LearnPath AI, wired **only** to the endpoints that exist
on the [`backend_improvements`](https://github.com/prashant-ranjan-dev/learnpath/tree/backend_improvements)
branch of the Spring Boot backend. Styled after the 12 design screens (emerald/
navy palette, Plus Jakarta Sans, rounded cards). Features that were scoped out of
v1 (XP, streak, notifications, search, Explore/Notes, social login, password
reset, quiz timer, profile bio/avatar, About/Resources tabs) are intentionally absent.

## Quick start

```bash
npm install
cp .env.example .env      # set VITE_API_BASE_URL if the backend is not on :8080
npm run dev               # http://localhost:5173  (origin already allowed by backend CORS)
```

The backend must be running (`backend_improvements` branch, default
`http://localhost:8080`) with `DB_PASSWORD` and `GOOGLE_API_KEY` set.

## Setup Status page (`/status`)

A built-in checklist that pings every endpoint the UI depends on and shows
pass/fail per feature. It proves route-by-route that the backend contract holds
(handled 400/401/404 responses count as "reachable" — the endpoint exists).
AI-backed flows (path generation, quiz generation, weakness analysis) are probed
for validation only and otherwise tested from the UI, since they cost tokens.

## Pages ↔ backend contract

| Route | Screen | Endpoints used |
|---|---|---|
| `/` | Landing (static) | — |
| `/login`, `/signup` | Auth | `POST /api/auth/login`, `POST /api/auth/signup` |
| `/create` | 5-step path wizard | `POST /api/syllabus` |
| `/paths` | My paths grid | `GET /api/syllabus/my` |
| `/paths/:id` | Curriculum accordion | `GET /api/syllabus/{id}`, `POST /api/quizzes/modules/{id}` |
| `/paths/:sid/modules/:mid/topics/:tid` | Lesson reader + sidebar | `GET /api/topics/{tid}/content`, `POST /api/topics/{tid}/complete`, `GET /api/syllabus/{sid}` |
| `/paths/:sid/modules/:mid/quiz` | One-question-at-a-time quiz | `POST /api/quizzes/modules/{mid}`, `POST /api/quizzes/{qid}/attempts/start`, `POST /api/quizzes/{qid}/submit` |
| `/paths/:sid/modules/:mid/quiz/results` | Score ring + breakdown | `GET /api/quizzes/{qid}/result` |
| `/paths/:sid/modules/:mid/quiz/analysis` | AI weakness analysis | `POST /api/quizzes/{qid}/analyze` |
| `/progress` | Lifetime analytics | `GET /api/user/dashboard` |
| `/profile` | Name/email editor | `GET`/`PUT /api/user/profile` |
| `/status` | Endpoint checklist | all of the above (probes) |

## Known backend gaps surfaced by the UI (v1 checklist)

- Quiz `quizId` per module is kept in `localStorage` (`src/lib/api.js` → `quizRef`)
  because the backend has no "get quiz by module" GET endpoint.
- Weakness analysis re-runs the AI on every view (nothing is persisted) and has
  no severity/mastery fields.
- No streak / XP / activity / time-spent data anywhere → dashboard shows
  derivable counts only.
- Progress page has no timeframe filters (no timestamps stored).
- Profile has no username/headline/bio/avatar/join-date fields.
