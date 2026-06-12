import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { queryClientInstance } from '@/lib/query-client';

import LoginPage          from '@/pages/LoginPage';
import RegisterPage       from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage  from '@/pages/ResetPasswordPage';
import DashboardLayout    from '@/pages/dashboard/DashboardLayout';
import AdminPage          from '@/pages/admin/AdminPage';
import AdminLogin         from '@/pages/admin/AdminLogin';
import Overview        from '@/pages/dashboard/Overview';
import Education       from '@/pages/dashboard/Education';
import Platform        from '@/pages/dashboard/Platform';
import AIChat          from '@/pages/dashboard/AIChat';
import Settings        from '@/pages/dashboard/Settings';

function Spinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
      <div className="w-10 h-10 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading)        return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const token = localStorage.getItem('safehaven_admin_token');
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading)       return <Spinner />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login"            element={<PublicOnlyRoute><LoginPage          /></PublicOnlyRoute>} />
      <Route path="/register"         element={<PublicOnlyRoute><RegisterPage       /></PublicOnlyRoute>} />
      <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
      <Route path="/reset-password"   element={<ResetPasswordPage  />} />

      {/* Dashboard protégé */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
      >
        <Route index              element={<Overview   />} />
        <Route path="education"   element={<Education  />} />
        <Route path="platform"    element={<Platform   />} />
        <Route path="chat"        element={<AIChat     />} />
        <Route path="settings"    element={<Settings   />} />
      </Route>

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin"       element={<AdminRoute><AdminPage /></AdminRoute>} />

      {/* Redirections */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}
