// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// ✅ Page Imports
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardOverview from './pages/DashboardOverview';
import ApplicationsPage from './pages/Application';
import SchedulePage from './pages/SchedulePage';
import SubmitApplication from './pages/SubmitApplication';

// Admin Dashboard Import
import AdminDashboard from './pages/admin/AdminDashboard';

// Protected Route with Role-Based Redirect
const ProtectedRoute = ({ children, roleRequired = null }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role for this route
  if (roleRequired && user.organization_role !== roleRequired) {
    // Redirect to appropriate dashboard based on actual role
    if (user.organization_role === 'OSAS') {
      return <Navigate to="/admin" replace />;
    } else if (user.organization_role === 'Property') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Dashboard Layout Wrapper
const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNavigate = (page) => {
    const routes = {
      'dashboard': '/dashboard',
      'applications': '/applications',
      'schedule': '/schedule',
      'submit-application': '/submit-application',
    };
    if (routes[page]) navigate(routes[page]);
  };

  return typeof children === 'function' 
    ? children({ onNavigate: handleNavigate, onLogout: logout })
    : children;
};

function AppRoutes() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        user 
          ? <Navigate to={user.organization_role === 'OSAS' ? '/admin' : '/dashboard'} replace /> 
          : <LandingPage />
      } />
      
      <Route path="/login" element={
        user 
          ? <Navigate to={user.organization_role === 'OSAS' ? '/admin' : '/dashboard'} replace /> 
          : <LoginPage 
              onBack={() => navigate('/')} 
              onSignUp={() => navigate('/signup')} 
            />
      } />
      
      <Route path="/signup" element={
        user 
          ? <Navigate to={user.organization_role === 'OSAS' ? '/admin' : '/dashboard'} replace /> 
          : <SignUpPage onBack={() => navigate('/login')} />
      } />

      {/* Admin Routes - OSAS Role Only */}
      <Route path="/admin/*" element={
        <ProtectedRoute roleRequired="OSAS">
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* Protected User Routes - Any authenticated user */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>{(props) => <DashboardOverview {...props} />}</DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/applications" element={
        <ProtectedRoute>
          <DashboardLayout>{(props) => <ApplicationsPage {...props} />}</DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/schedule" element={
        <ProtectedRoute>
          <DashboardLayout>{(props) => <SchedulePage {...props} />}</DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/submit-application" element={
        <ProtectedRoute>
          <DashboardLayout>{(props) => <SubmitApplication {...props} />}</DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={
        <Navigate to={user?.organization_role === 'OSAS' ? '/admin' : '/dashboard'} replace />
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
