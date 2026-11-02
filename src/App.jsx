import { Navigate, Route, Routes } from 'react-router-dom';
import AuthRoute from './components/AuthRoute';
import AppShell from './components/AppShell';
import { useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CreatePathPage from './pages/CreatePathPage';
import MyPathsPage from './pages/MyPathsPage';
import PathPage from './pages/PathPage';
import LessonPage from './pages/LessonPage';
import QuizPage from './pages/QuizPage';
import QuizResultsPage from './pages/QuizResultsPage';
import WeaknessPage from './pages/WeaknessPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import StatusPage from './pages/StatusPage';

export default function App() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/paths" replace /> : <LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<AuthRoute />}>
        <Route element={<AppShell />}>
          <Route path="/create" element={<CreatePathPage />} />
          <Route path="/paths" element={<MyPathsPage />} />
          <Route path="/paths/:syllabusId" element={<PathPage />} />
          <Route
            path="/paths/:syllabusId/modules/:moduleId/topics/:topicId"
            element={<LessonPage />}
          />
          <Route path="/paths/:syllabusId/modules/:moduleId/quiz" element={<QuizPage />} />
          <Route
            path="/paths/:syllabusId/modules/:moduleId/quiz/results"
            element={<QuizResultsPage />}
          />
          <Route
            path="/paths/:syllabusId/modules/:moduleId/quiz/analysis"
            element={<WeaknessPage />}
          />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/status" element={<StatusPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
