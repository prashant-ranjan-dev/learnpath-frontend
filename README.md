# LearnPath AI — Frontend

LearnPath AI is a React single-page application for creating personalized learning paths, studying lessons, completing module quizzes, reviewing results, and tracking learning progress.

## Technology stack

- React 18
- Vite
- React Router
- Axios
- Tailwind CSS
- Lucide icons

## Getting started

### Prerequisites

- Node.js and npm
- The LearnPath Spring Boot backend running locally or at a configured API URL
- Backend environment variables configured as required by the backend project

### Installation

```bash
npm install
```

Create a `.env` file from `.env.example` and configure the backend URL:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Start the development server:

```bash
npm run dev
```

Run the production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Backend

The frontend integrates with the [`learnpath` backend](https://github.com/prashant-ranjan-dev/learnpath), using the `backend_improvements` branch as the current API reference.

The backend must be configured with its required database and AI-provider settings.

## Application routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/login` | Sign in |
| `/signup` | Create an account |
| `/create` | Create a personalized learning path |
| `/paths` | View learning paths |
| `/paths/:syllabusId` | View curriculum and module progress |
| `/paths/:syllabusId/modules/:moduleId/topics/:topicId` | Read a lesson and mark it complete |
| `/paths/:syllabusId/modules/:moduleId/quiz` | Take a module quiz |
| `/paths/:syllabusId/modules/:moduleId/quiz/results` | Review quiz results |
| `/paths/:syllabusId/modules/:moduleId/quiz/analysis` | Review AI-generated weakness analysis |
| `/progress` | View learning analytics |
| `/profile` | View and edit profile information |

## Main learner flows

1. Register or sign in.
2. Create a learning path based on a topic, current understanding, desired depth, and goal.
3. Explore modules and topics in the generated curriculum.
4. Read lesson content and record topic completion.
5. Complete module quizzes when eligible.
6. Review quiz results and weakness analysis.
7. Track progress and update profile information.

## Development and verification

Use the application's normal pages to verify learner workflows. Automated tests and CI checks should be used for repeatable API and integration testing rather than exposing an endpoint-diagnostic page in the learner interface.