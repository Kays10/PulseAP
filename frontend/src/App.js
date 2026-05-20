import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import VPNProfiles from './pages/VPNProfiles';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { authService } from './services/api';

import SitesZones from './pages/SitesZones';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Admin Route wrapper
const AdminRoute = ({ children }) => {
  const isAdmin = authService.isAdmin();
  if (!isAdmin) {
    return <Navigate to="/" replace />;
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
            <AdminRoute>
              <Layout>
                <Settings />
              </Layout>
            </AdminRoute>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
