import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingScreen from '../components/ui/LoadingScreen';

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const LandingPage      = lazy(() => import('../pages/LandingPage'));
const LoginPage        = lazy(() => import('../pages/LoginPage'));
const SignupPage       = lazy(() => import('../pages/SignupPage'));
const DashboardPage    = lazy(() => import('../pages/DashboardPage'));
const ProjectsPage     = lazy(() => import('../pages/ProjectsPage'));
const ProjectDetailPage= lazy(() => import('../pages/ProjectDetailPage'));
const TasksPage        = lazy(() => import('../pages/TasksPage'));
const TaskDetailPage   = lazy(() => import('../pages/TaskDetailPage'));
const TeamPage         = lazy(() => import('../pages/TeamPage'));
const NotificationsPage= lazy(() => import('../pages/NotificationsPage'));
const ProfilePage      = lazy(() => import('../pages/ProfilePage'));
const NotFoundPage     = lazy(() => import('../pages/NotFoundPage'));

// ─── Route Guards ─────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

// ─── App Router ───────────────────────────────────────────────────────────────
export default function AppRouter() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

        {/* Protected routes — wrapped in DashboardLayout */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
