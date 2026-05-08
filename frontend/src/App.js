import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import VPNProfiles from './pages/VPNProfiles';
import Login from './pages/Login';

// Placeholder pages for routes
const SitesZones = () => <div className="p-8"><h2 className="text-2xl font-bold">Sites & Zones</h2><p className="mt-4 text-gray-600">Site and Zone management interface coming soon.</p></div>;
const Settings = () => <div className="p-8"><h2 className="text-2xl font-bold">Settings</h2><p className="mt-4 text-gray-600">Global application settings and SMTP configuration.</p></div>;

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/vpns" element={
          <ProtectedRoute>
            <Layout>
              <VPNProfiles />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/sites" element={
          <ProtectedRoute>
            <Layout>
              <SitesZones />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
