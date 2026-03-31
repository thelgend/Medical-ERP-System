import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Staff from './pages/Staff';
import LabReports from './pages/LabReports';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import PatientProfile from './pages/PatientProfile';
import Analytics from './pages/Analytics';
import Queue from './pages/Queue';
import Pharmacy from './pages/Pharmacy';
import ActivityLogs from './pages/ActivityLogs';
import PublicQueue from './pages/PublicQueue';

import { useAuth } from './context/AuthContext';

function App() {
  const { token, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest">Loading ERP System...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/public-queue" element={<PublicQueue />} />
      <Route 
        path="/*" 
        element={
          token ? (
            <MainLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/analytics" element={user?.role === 'Admin' ? <Analytics /> : <Navigate to="/" replace />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/queue" element={<Queue />} />
                <Route path="/staff" element={user?.role === 'Admin' ? <Staff /> : <Navigate to="/" replace />} />
                <Route path="/lab" element={['Admin', 'Doctor'].includes(user?.role) ? <LabReports /> : <Navigate to="/" replace />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/billing" element={['Admin', 'Receptionist'].includes(user?.role) ? <Billing /> : <Navigate to="/" replace />} />
                <Route path="/pharmacy" element={['Admin', 'Doctor'].includes(user?.role) ? <Pharmacy /> : <Navigate to="/" replace />} />
                <Route path="/inventory" element={user?.role === 'Admin' ? <Inventory /> : <Navigate to="/" replace />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/patients/:id" element={<PatientProfile />} />
                <Route path="/logs" element={user?.role === 'Admin' ? <ActivityLogs /> : <Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MainLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
    </Routes>
  );
}

export default App;
