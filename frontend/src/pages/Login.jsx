import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Activity, Lock, User, AlertCircle } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authService.login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBC02D]">
      <div className="max-w-md w-full mx-4">
        {/* VOD Group Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-[#2D333A] px-10 py-8 rounded-2xl shadow-xl mb-6">
            <div className="flex items-center justify-center">
              <span className="text-6xl font-black text-white tracking-tighter leading-none">VOD</span>
              <div className="flex flex-col ml-3 border-l-4 border-[#FBC02D] pl-3 items-start justify-center">
                <span className="text-[#FBC02D] text-sm font-black tracking-[0.3em] uppercase leading-none">GROUP</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 text-[#2D333A]">
            <Activity size={28} className="animate-pulse" />
            <span className="text-3xl font-black tracking-tight">PulseAP</span>
          </div>
          <p className="text-[#2D333A]/80 font-bold mt-2 uppercase tracking-widest text-xs">AP Monitoring System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-[#2D333A]">
          <h2 className="text-2xl font-black text-[#2D333A] mb-6 text-center">SECURE ACCESS</h2>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-[#2D333A] uppercase tracking-widest mb-2 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  required
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#FBC02D]/20 focus:border-[#FBC02D] transition-all outline-none font-medium"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#2D333A] uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#FBC02D]/20 focus:border-[#FBC02D] transition-all outline-none font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-[#2D333A] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#1a1f24] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-6 w-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                'SIGN IN TO PULSE'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">
              Property of VOD Group &copy; 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
