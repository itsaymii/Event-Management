import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import ApplicationsPage from './Application';
import SchedulePage from './SchedulePage';
import DashboardOverview from './DashboardOverview';
import SubmitApplication from './SubmitApplication';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('applications');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigation = (view) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardOverview onNavigate={handleNavigation} onLogout={handleLogout} />;
      case 'applications':
        return <ApplicationsPage onNavigate={handleNavigation} onLogout={handleLogout} />;
      case 'schedule':
        return <SchedulePage onNavigate={handleNavigation} onLogout={handleLogout} />;
      case 'submit-application':
        return <SubmitApplication onNavigate={handleNavigation} onLogout={handleLogout} />;
      default:
        return <ApplicationsPage onNavigate={handleNavigation} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="relative">
      {/* User Info Display */}
      <div className="fixed top-4 left-64 z-40 text-slate-600 text-sm font-medium">
        Welcome, <span className="text-slate-900 font-bold">{user?.first_name || user?.email}</span>
      </div>

      {/* Render the current view */}
      {renderCurrentView()}
    </div>
  );
};

export default UserDashboard;
