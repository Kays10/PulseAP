import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';

// Placeholder for Login page
const Login = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900">
    <div className="bg-white p-8 rounded-xl shadow-2xl w-96">
      <h2 className="text-2xl font-bold text-center mb-6">PulseAP Login</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" type="text" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" type="password" />
        </div>
        <button className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold hover:bg-primary-700 transition-colors">
          Sign In
        </button>
      </form>
    </div>
  </div>
);

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // For demonstration, we allow access if token exists or if we're in dev mode
  // In real app, redirect to /login if no token
  // return token ? children : <Navigate to="/login" />;
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
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
